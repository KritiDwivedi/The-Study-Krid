"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const companionPath = path.join(__dirname, "..", "krid-companion.js");
const curriculumPath = path.join(__dirname, "..", "curriculum.js");
const stylePath = path.join(__dirname, "..", "style.css");
const htmlPath = path.join(__dirname, "..", "index.html");
const source = fs.readFileSync(companionPath, "utf8").replace(/\ninitKridCompanion\(\);\s*$/, "");
const context = {
  window: { setTimeout },
  document: { querySelector: () => null, querySelectorAll: () => [] },
  console,
  localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  setTimeout,
  clearTimeout,
  Date,
  Blob,
  URL
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(curriculumPath, "utf8"), context);
vm.runInContext(source, context);

const api = context.window.KRID_COMPANION_TEST;
assert.ok(api, "companion test API should be exposed");

assert.equal(api.companionReactionForMood("celebrating").kind, "positive", "strong answers should trigger a positive reaction beat");
assert.equal(api.companionReactionForMood("interviewer-happy").kind, "positive", "strong interview answers should celebrate too");
assert.equal(api.companionReactionForMood("encouraging").kind, "partial", "partly correct answers should trigger encouragement");
assert.equal(api.companionReactionForMood("oops").kind, "negative", "incorrect answers should trigger a gentle negative reaction");
assert.equal(api.companionReactionForMood("curious"), null, "ordinary prompts should begin speaking without an evaluation reaction");
assert.match(api.companionMoodDescription("listening"), /tilting.*head.*hands/i, "the listening animation should have a useful accessible description");
const femaleVoice = api.selectKridFemaleVoice([
  { name: "Microsoft David", lang: "en-US", voiceURI: "David", localService: true },
  { name: "Samantha", lang: "en-US", voiceURI: "Samantha", localService: true }
]);
assert.equal(femaleVoice.name, "Samantha", "Krid must choose a recognised female voice instead of a male system voice");
assert.equal(api.selectKridFemaleVoice([{ name: "Daniel", lang: "en-GB", voiceURI: "Daniel" }]), null, "Krid must not fall back when only a male voice is available");
assert.equal(api.selectKridFemaleVoice([{ name: "Google UK English Male", lang: "en-GB" }, { name: "Google UK English Female", lang: "en-GB" }]).name, "Google UK English Female", "explicit browser voice genders must be respected");
assert.equal(api.selectKridFemaleVoice([{ name: "Google US English", lang: "en-US" }]).name, "Google US English", "Chrome's named US English female voice should be supported");
const companionStyles = fs.readFileSync(stylePath, "utf8");
assert.match(companionStyles, /data-mood="listening"[^}]+krid-listen-head/s, "open-microphone mode should animate Krid's listening head tilt");
assert.match(companionStyles, /data-mood="celebrating"[^}]+krid-happy-head/s, "strong answers should animate a celebration");
assert.match(companionStyles, /data-mood="oops"[^}]+krid-oops-head/s, "incorrect answers should animate a gentle head shake");
assert.match(companionStyles, /\.live-arm::after/, "Krid should have expressive hand shapes");
assert.match(fs.readFileSync(htmlPath, "utf8"), /id="liveKrid" role="img" aria-label=/, "Krid's changing visual mood should be exposed as an accessible image description");
assert.doesNotMatch(source, /voices\.find\([^\n]+\|\|\s*voices\.find/, "voice synthesis must not contain the former arbitrary-English fallback");

const fractionPack = api.getCompanionPack("fractions");
assert.equal(fractionPack.title, "Fractions");
assert.ok(fractionPack.notes.includes("Equivalent fractions"), "voice topic packs should be generated from curated concepts");

const material = "The nucleus stores DNA and controls many cell activities. Mitochondria release usable energy from food through cellular respiration. The cell membrane controls what enters and leaves the cell. Ribosomes build proteins by joining amino acids.";
const facts = api.parseCompanionMaterial(material);
assert.ok(facts.length >= 4, "paragraph material should create multiple concepts");

const wrappedRagPdfText = `Retrieval-Augmented Generation (RAG) is an AI framework that grounds Large Language Models (LLMs) in external data. By searching and retrieving relevant documents from a knowledge base before generating an answer, RAG reduces
hallucinations and provides factual, up-to-date responses without requiring model
retraining.

RAG systems evolve in complexity based on the required depth of reasoning and context management.`;
const wrappedRagFacts = api.parseCompanionMaterial(wrappedRagPdfText);
const ragFramework = wrappedRagFacts.find((fact) => /^Retrieval-Augmented Generation \(RAG\)$/i.test(fact.term));
const ragSystems = wrappedRagFacts.find((fact) => /^RAG systems$/i.test(fact.term));
assert.ok(ragFramework, `wrapped PDF text should retain the real RAG concept title: ${JSON.stringify(wrappedRagFacts)}`);
assert.match(ragFramework.definition, /reduces hallucinations and provides factual, up-to-date responses without requiring model retraining/i);
assert.equal(wrappedRagFacts.some((fact) => /^hallucinations and$/i.test(fact.term)), false, "a lowercase PDF continuation ending in 'and' must not become a concept");
assert.ok(ragSystems, "a following RAG architecture sentence should become its own concept rather than joining the hallucination fragment");
assert.match(ragSystems.question, /How do RAG systems evolve in complexity/i);

const strong = api.evaluateCompanionResponse("The nucleus stores DNA and controls many of the cell's activities.", facts[0].definition, facts[0].term);
const weak = api.evaluateCompanionResponse("It is a thing inside a cell.", facts[0].definition, facts[0].term);
assert.ok(strong.score >= 70, `strong grounded answer should score well, received ${strong.score}`);
assert.ok(strong.score > weak.score, "grounded answer should beat vague answer");

const messySecurityNotes = `LLM-based systems introduce new security risks because they process untrusted user input and generate authoritative outputs.

Common vulnerabilities

1. Prompt Injection

Malicious instructions override system prompts
Can lead to data leakage or policy bypass
2. Jailbreaking: Crafted inputs force models to ignore safety constraints
3. Data Leakage: Model exposes sensitive or proprietary information
4. Tool Misuse: Models invoke tools or APIs in unintended ways
5. Indirect Prompt Attacks: Malicious content embedded in retrieved documents

LLM-as-a-Judge is an evaluation technique where a language model assesses the quality of another model's output. Instead of relying only on automated metrics or human reviewers, an LLM scores responses based on predefined criteria.
This approach is useful for reasoning quality, helpfulness, and factual grounding.

Advantages
Scales better than evaluation done by a person
Enables rapid iteration during development

Limitations
Judge model bias
Sensitivity to evaluation prompt design

Hallucinations occur when LLMs generate outputs that are not grounded in provided context or verified sources.

Primary causes
1. Lack of grounding: Prompts do not provide sufficient context
2. Knowledge gaps: Queries fall outside training data
3. Ambiguous prompts: The model fills gaps with plausible text

Evaluating LLM outputs is challenging because many tasks do not have a single correct answer.

1. BLEU (Bilingual Evaluation Understudy)

Measures n-gram overlap between generated text and reference text
Precision-focused metric
Commonly used in machine translation
Performs poorly for open-ended generation
2. ROUGE (Recall-Oriented Understudy for Gisting Evaluation)
Measures overlap between generated and reference text
Recall-focused metric
Widely used for summarization tasks
3. BERTScore
Uses contextual embeddings to measure semantic similarity
Captures meaning rather than exact word overlap

Dataset preparation directly impacts fine-tuning performance because LLMs are sensitive to data quality, formatting, and diversity.

Key dataset preparation steps
1. Define Task Objectives: Identify output format, domain scope, and performance goals
2. Data Cleaning and Normalization
Remove duplicates, noise, and irrelevant samples
Standardize text formatting and token structure
3. Prompt-Response Structuring: Convert raw data into instruction-based training pairs
4. Data Diversity and Balance: Include varied examples to improve generalization`;
const refined = api.parseCompanionMaterial(messySecurityNotes);
const promptInjection = refined.find((fact) => fact.term === "Prompt Injection");
const vulnerabilities = refined.find((fact) => /^Common vulnerabilities/i.test(fact.term));
const llmRisk = refined.find((fact) => /LLM-based systems/i.test(fact.term));
const llmJudge = refined.find((fact) => /LLM-as-a-Judge/i.test(fact.term));
assert.ok(promptInjection, "numbered headings should become proper concepts");
assert.match(promptInjection.definition, /override system prompts/i);
assert.match(promptInjection.question, /What is Prompt Injection/i);
assert.ok(vulnerabilities?.keyPoints.length >= 5, "section children should be organized into a list concept");
assert.match(vulnerabilities.question, /common vulnerabilities/i);
assert.match(llmRisk.question, /Why do LLM systems introduce new security risks/i);
assert.match(llmJudge.definition, /useful for reasoning quality, helpfulness, and factual grounding/i, "supporting paragraphs should remain attached to their concept");
assert.match(api.companionCompleteAnswer(llmJudge), /assesses the quality.*Instead of relying only on automated metrics or human reviewers.*useful for reasoning quality/is, "a correction should narrate the complete refined answer, not only its first sentence");
const deliberatelyTruncatedJudge = { ...llmJudge, definition: "LLM-as-a-Judge is an evaluation technique where a language model assesses the quality of another model's output." };
assert.match(api.companionCompleteAnswer(deliberatelyTruncatedJudge, 1200, messySecurityNotes), /Instead of relying only on automated metrics or human reviewers/i, "the raw source paragraph should repair a truncated concept before Krid speaks its correction");
const labelledJailbreak = { term: "Jailbreaking", definition: "Crafted inputs force models to ignore safety constraints.", kind: "concept", keyPoints: [] };
const deduplicatedCorrection = api.companionCompleteAnswer(labelledJailbreak, 1200, "2. Jailbreaking: Crafted inputs force models to ignore safety constraints.");
assert.equal((deduplicatedCorrection.match(/Crafted inputs/gi) || []).length, 1, "source labels and refined definitions must not make Krid repeat the same sentence");
assert.equal(refined.some((fact) => /^Malicious instructions override/i.test(fact.term)), false, "detail fragments must not become concept titles");
const bleu = refined.find((fact) => /^BLEU/i.test(fact.term));
const datasetPreparation = refined.find((fact) => /^Dataset preparation$/i.test(fact.term));
const datasetSteps = refined.find((fact) => /Dataset preparation steps/i.test(fact.term));
assert.match(bleu.question, /What does BLEU.*measure/i);
assert.match(datasetPreparation.question, /Why does Dataset preparation impact fine-tuning performance/i);
assert.ok(datasetSteps?.keyPoints.length >= 4, "multi-line dataset steps should be grouped under their section");

const hallucinationNotes = `Hallucinations occur when LLMs generate outputs that are not grounded in training data, provided context, or verified external sources. This behavior arises from how language models optimize for likelihood rather than factual correctness.

Detection and reduction strategies
1. Retrieval grounding: Use RAG to anchor responses in retrieved documents
2. Prompt constraints: Enforce strict instruction boundaries and source limitations
3. Output verification: Use post-generation validation or secondary models`;
const hallucinationFacts = api.parseCompanionMaterial(hallucinationNotes);
const hallucinationStrategies = hallucinationFacts.find((fact) => /detection and reduction strategies/i.test(fact.term));
assert.equal(hallucinationFacts.some((fact) => /^This behaviou?r$/i.test(fact.term)), false, "coreference must not become a fake concept title");
assert.ok(hallucinationStrategies, "detection strategies should remain attached to hallucinations");
assert.match(hallucinationStrategies.question, /^How can hallucinations be detected and reduced\?$/i);
assert.doesNotMatch(hallucinationStrategies.question, /this behaviou?r/i, "generated questions must name the real concept rather than a pronoun");

const bertScoreNotes = `**BERTScore**

1.Uses contextual embeddings to measure semantic similarity
2.Captures meaning rather than exact word overlap
3.Better suited for modern generative tasks
4.More computationally expensive than BLEU or ROUGE`;
const bertScoreFacts = api.parseCompanionMaterial(bertScoreNotes);
const bertScore = bertScoreFacts.find((fact) => /^BERTScore$/i.test(fact.term));
assert.ok(bertScore, "a bold concept heading should become a concept");
assert.equal(bertScore.kind, "list", "numbered details below a concept heading should form one list concept");
assert.equal(bertScore.keyPoints.length, 4, "all four BERTScore details should remain attached");
assert.match(bertScore.question, /^What is BERTScore/i);
assert.equal((bertScore.definition.match(/Uses contextual embeddings/gi) || []).length, 1, "standalone list statements should not be duplicated in narration");
const bertScoreCompleteAnswer = api.companionCompleteAnswer(bertScore);
assert.equal((bertScoreCompleteAnswer.match(/Captures meaning/gi) || []).length, 1, "the complete spoken answer should narrate each point once");
assert.match(bertScoreCompleteAnswer, /More computationally expensive than BLEU or ROUGE/i, "the complete answer should include the fourth point");
const bertScoreTwoPoints = api.evaluateCompanionResponse(
  "It uses contextual embeddings for semantic similarity and captures meaning instead of exact word overlap.",
  bertScore.definition,
  bertScore.term,
  bertScoreFacts,
  bertScore
);
assert.ok(bertScoreTwoPoints.score >= 34 && bertScoreTwoPoints.score < 68, `two of four required points should be partial, received ${bertScoreTwoPoints.score}`);
assert.equal(bertScoreTwoPoints.missingIdeas.length, 2, "feedback should preserve both unmentioned BERTScore points");
assert.ok(bertScoreTwoPoints.missingIdeas.some((idea) => /modern generative tasks/i.test(idea)));
assert.ok(bertScoreTwoPoints.missingIdeas.some((idea) => /computationally expensive/i.test(idea)));
const bertScoreComplete = api.evaluateCompanionResponse(
  "It uses contextual embeddings to compare semantic meaning instead of exact words, suits modern generation tasks, but costs more computation than BLEU or ROUGE.",
  bertScore.definition,
  bertScore.term,
  bertScoreFacts,
  bertScore
);
assert.ok(bertScoreComplete.score >= 68, `a paraphrase covering all four BERTScore points should pass, received ${bertScoreComplete.score}`);

const semanticCorrect = api.evaluateCompanionResponse(
  "An attacker places hostile directions in the input so the model ignores its original rules, which may reveal confidential data or circumvent policy.",
  promptInjection.definition,
  promptInjection.term,
  refined,
  promptInjection
);
const confidentlyWrong = api.evaluateCompanionResponse(
  "Prompt injection is an evaluation metric that measures n-gram overlap between a generated answer and a reference.",
  promptInjection.definition,
  promptInjection.term,
  refined,
  promptInjection
);
const distantParaphrase = api.evaluateCompanionResponse(
  "Hidden attacker text tricks the assistant into disobeying its original rules and may reveal private records.",
  promptInjection.definition,
  promptInjection.term,
  refined,
  promptInjection
);
assert.ok(semanticCorrect.score >= 68, `semantic paraphrase should pass, received ${semanticCorrect.score}`);
assert.ok(distantParaphrase.score >= 60, `distant paraphrase should be understood as substantially correct, received ${distantParaphrase.score}`);
assert.ok(confidentlyWrong.score < 34, `fluent but wrong answer should fail, received ${confidentlyWrong.score}`);

const listAnswer = api.evaluateCompanionResponse(
  "Two examples are prompt injection, where hostile instructions override rules, and tool abuse, where the model calls an API in an unintended way.",
  vulnerabilities.definition,
  vulnerabilities.term,
  refined,
  vulnerabilities
);
const listWrong = api.evaluateCompanionResponse(
  "BLEU and ROUGE are common vulnerabilities because they compare generated text with a reference.",
  vulnerabilities.definition,
  vulnerabilities.term,
  refined,
  vulnerabilities
);
assert.ok(listAnswer.score >= 68, `two correctly explained list items should pass, received ${listAnswer.score}`);
assert.ok(listWrong.score < 34, `unrelated named items must not pass a list question, received ${listWrong.score}`);

const generalizedJudge = api.evaluateCompanionResponse(
  "One AI grades another AI's answer, which reduces the need for a person to review every response.",
  llmJudge.definition,
  llmJudge.term,
  refined,
  llmJudge
);
assert.ok(generalizedJudge.score >= 68, `a concise generalized explanation should pass without memorizing the notes, received ${generalizedJudge.score}`);
const conversationalJudge = api.evaluateCompanionResponse(
  "It is basically one AI checking whether a different AI gave a good answer.",
  llmJudge.definition,
  llmJudge.term,
  refined,
  llmJudge
);
assert.ok(conversationalJudge.score >= 68, `plain conversational meaning should pass without note vocabulary, received ${conversationalJudge.score}`);

const groundedInterview = api.buildCompanionInterviewQuestions("Software", "", messySecurityNotes, "Security Engineer", "notes");
assert.ok(groundedInterview.length >= 8, "interview mode should be able to build a shuffled question bank from refined notes");
assert.equal(groundedInterview.every((question) => question.grounded), true);
assert.ok(groundedInterview.some((question) => /Prompt Injection/i.test(question.q)));

const relevant = api.findRelevantCompanionFact("What releases energy from food?", facts);
assert.match(relevant.fact.definition, /energy/i);

const interview = api.buildCompanionInterviewQuestions("Software", "What is authentication?", "Authentication verifies a user's identity. Authorisation decides their permissions.", "Developer");
assert.ok(interview.length >= 5);
assert.equal(interview[0].grounded, true, "custom interview answer should use supplied notes");

const session = api.createCompanionSession("memory", facts, { topic: "Cells" });
assert.equal(session.mastery.length, facts.length);
assert.equal(session.mode, "memory");

console.log(`Companion smoke passed: ${facts.length} simple concepts, wrapped RAG PDF repaired, ${refined.length} refined messy-note concepts, semantic ${semanticCorrect.score}, conversational ${conversationalJudge.score}, wrong ${confidentlyWrong.score}, ${interview.length} interview prompts.`);
