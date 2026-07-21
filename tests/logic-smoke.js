"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const appPath = path.join(__dirname, "..", "app.js");
const companionPath = path.join(__dirname, "..", "krid-companion.js");
const source = fs.readFileSync(appPath, "utf8").replace(/\ninit\(\);\s*$/, "");
const companionSource = fs.readFileSync(companionPath, "utf8").replace(/\ninitKridCompanion\(\);\s*$/, "");
const context = {
  window: { KRID_WORLDS: {}, setTimeout },
  document: { querySelector: () => null, querySelectorAll: () => [] },
  console,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  URLSearchParams,
  setTimeout,
  clearTimeout,
  Date,
  Blob,
  URL
};
vm.createContext(context);
vm.runInContext(companionSource, context);
vm.runInContext(`${source}\nthis.testApi = { parseNotes, createNotesWorld, makeChoiceSet, conciseSourceClue, routeIsRevisitable, TOPIC_LIBRARY };`, context);

const { parseNotes, createNotesWorld, makeChoiceSet, conciseSourceClue, routeIsRevisitable, TOPIC_LIBRARY } = context.testApi;

const paragraph = "FIFA World Cup 2026 was the first tournament with 48 teams instead of 32. The tournament was jointly hosted by Canada, Mexico, and the United States. It included 104 matches across 16 host cities. The opening match took place in Mexico City. The final was scheduled for 19 July 2026.";
const mixed = "# Cell Tour\n\n• The nucleus stores DNA and controls many cell activities.\n2. Mitochondria release usable energy from food.\nCell membrane: It controls what enters and leaves a cell.\nRibosomes build proteins by joining amino acids.";

const paragraphIdeas = parseNotes(paragraph);
const mixedIdeas = parseNotes(mixed);
assert.ok(paragraphIdeas.length >= 3, "paragraph notes should group pronoun-led details under at least three named ideas");
assert.ok(mixedIdeas.length >= 4, "mixed headings, bullets, numbers, and colon notes should parse");
assert.equal(TOPIC_LIBRARY.length, 240, "Topic Atlas should contain 240 suggestions");

const longNotes = Array.from({ length: 40 }, (_, index) => `Concept ${index + 1}: Concept ${index + 1} has a distinct explanation about learning evidence number ${index + 1}.`).join("\n");
const longIdeas = parseNotes(longNotes);
assert.equal(longIdeas.length, 40, "long dictated notes should retain more than the old 12-concept pool");
assert.equal(createNotesWorld(longIdeas).concepts.length, 6, "a quest should sample six playable rooms from a long note pool");

const world = createNotesWorld(paragraphIdeas);
assert.ok(world.concepts.length >= 2 && world.concepts.length <= 6);
world.concepts.forEach((concept) => {
  assert.ok(concept.question.options.length >= 2 && concept.question.options.length <= 4);
  assert.ok(concept.boss.options.length >= 2 && concept.boss.options.length <= 4);
  assert.equal(concept.question.options.some((option) => /Not this one/i.test(option)), false);
  assert.equal(concept.boss.options.some((option) => /Not this one/i.test(option)), false);
  assert.ok(concept.question.options[concept.question.answer]);
  assert.ok(concept.boss.options[concept.boss.answer]);
  assert.ok(concept.source);
});

const twoChoice = makeChoiceSet("Retrieval augmented generation", ["Retrieval augmented generation", "Advanced RAG"]);
assert.equal(twoChoice.options.length, 2, "small source sets should use two real choices instead of obvious placeholders");
assert.equal(twoChoice.options.some((option) => /Not this one/i.test(option)), false);
const hiddenTermClue = conciseSourceClue({
  term: "Retrieval augmented generation",
  definition: `Retrieval augmented generation, or RAG, retrieves external documents before an LLM answers. ${"It combines retrieval and generation for grounded responses. ".repeat(12)}`
});
assert.doesNotMatch(hiddenTermClue, /Retrieval augmented generation|\bRAG\b/i, "reverse clues must not reveal their own correct term");
assert.ok(hiddenTermClue.length <= 301, "long dictated clues should be shortened to a readable prompt");
const parentheticalTermClue = conciseSourceClue({
  term: "Retrieval-Augmented Generation (RAG)",
  definition: "Retrieval-Augmented Generation (RAG) grounds a model in external evidence before it answers."
});
assert.doesNotMatch(parentheticalTermClue, /Retrieval-Augmented Generation|\(RAG\)/i, "parenthetical acronyms must also be concealed from reverse clues");
assert.equal(routeIsRevisitable(0, 2, [true, true, false, false], 3), true);
assert.equal(routeIsRevisitable(2, 2, [true, true, false, false], 3), true);
assert.equal(routeIsRevisitable(3, 2, [true, true, false, false], 3), false, "boss and locked routes should not open as concept reviews");

const guardrailNotes = `Content filtering and guardrails are mechanisms used to constrain LLM behavior and prevent unsafe, biased, or policy-violating outputs.

**Guardrail Implementation Strategies**

These controls are typically enforced at multiple layers of the system.

1. Input-level controls: Block or rewrite harmful or malicious user prompts
2. Output-level controls: Detect and remove unsafe generated content
3. Tool-level controls: Restrict which actions a model is allowed to perform`;
const guardrailIdeas = parseNotes(guardrailNotes);
const guardrail = guardrailIdeas.find((idea) => /^Guardrail Implementation Strategies$/i.test(idea.term));
assert.ok(guardrail, `a guardrail heading should own its implementation details: ${JSON.stringify(guardrailIdeas)}`);
assert.equal(guardrailIdeas.some((idea) => /^These controls$/i.test(idea.term)), false, "pronoun fragments must not become concepts");
assert.match(guardrail.question, /^How are Guardrail Implementation Strategies applied in practice/i);
assert.match(guardrail.definition, /^Under Guardrail Implementation Strategies, controls are typically enforced at multiple layers/i);
assert.match(guardrail.definition, /Input-level controls: Block or rewrite harmful or malicious user prompts/i);

const guardrailWorld = createNotesWorld(guardrailIdeas);
const guardrailRoom = guardrailWorld.concepts.find((concept) => /^Guardrail Implementation Strategies$/i.test(concept.title));
assert.ok(guardrailRoom, "Question Quest should create a guardrail strategy room");
assert.match(guardrailRoom.question.prompt, /^How are Guardrail Implementation Strategies applied in practice/i);
assert.notEqual(guardrailRoom.question.options[guardrailRoom.question.answer], guardrailRoom.title, "the explanatory correct option must never be the heading itself");
assert.match(guardrailRoom.question.options[guardrailRoom.question.answer], /multiple layers.*Input-level controls/is, "the correct option should contain the complete source explanation");
assert.match(guardrailRoom.boss.prompt, /multiple layers/i, "a reverse question may use the heading as its answer only when the prompt supplies a real explanatory clue");
guardrailWorld.concepts.forEach((concept) => {
  assert.notEqual(concept.question.options[concept.question.answer].trim().toLowerCase(), concept.title.trim().toLowerCase(), `the ${concept.title} room must answer with an explanation rather than its heading`);
  assert.doesNotMatch(concept.question.prompt, /\b(?:Explain|Describe)\s+(?:this|these|those|it|they)\b/i, "quest prompts must not ask about an unresolved pronoun");
});
const inputControlsRoom = guardrailWorld.concepts.find((concept) => /^Input-level controls$/i.test(concept.title));
assert.equal(inputControlsRoom.question.prompt, "What do Input-level controls do?");

console.log(`Logic smoke passed: ${paragraphIdeas.length} paragraph ideas, ${mixedIdeas.length} mixed-format ideas, ${longIdeas.length} long-note ideas, ${guardrailIdeas.length} guardrail ideas, ${TOPIC_LIBRARY.length} atlas topics.`);
