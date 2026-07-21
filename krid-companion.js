"use strict";

const COMPANION_SAVE_KEY = "the-study-krid-companion-v3";
const COMPANION_LEGACY_SAVE_KEYS = ["the-study-krid-companion-v1", "the-study-krid-companion-v2"];
const COMPANION_STOP_WORDS = new Set([
  "the", "and", "that", "this", "with", "from", "into", "when", "where", "which", "what", "your", "their", "there",
  "have", "has", "had", "will", "would", "could", "should", "about", "because", "while", "also", "than", "then", "them",
  "they", "does", "were", "been", "being", "are", "was", "for", "you", "its", "not", "but", "can", "how", "why", "who",
  "use", "using", "used", "through", "each", "many", "more", "some", "such", "only", "very", "most", "much", "make", "makes"
]);

const COMPANION_SYNONYMS = [
  ["make", "makes", "create", "creates", "produce", "produces", "build", "builds"],
  ["control", "controls", "manage", "manages", "regulate", "regulates"],
  ["energy", "power", "fuel"], ["work", "job", "role", "function"],
  ["change", "changes", "transform", "transforms", "convert", "converts"],
  ["important", "essential", "critical", "key"], ["help", "helps", "support", "supports"],
  ["show", "shows", "demonstrate", "demonstrates", "display", "displays"],
  ["assess", "evaluate", "judge", "score", "review", "rank", "measure", "grade", "grading", "check", "inspect", "rate", "critique"],
  ["model", "llm", "ai", "assistant", "algorithm"],
  ["output", "answer", "response", "completion", "result"],
  ["human", "person", "reviewer", "evaluator"],
  ["criteria", "criterion", "rubric", "standard", "guideline", "requirement"],
  ["quality", "correctness", "performance", "good", "effective"],
  ["predefined", "preset", "specified", "given", "fixed"],
  ["another", "other", "different", "second", "alternative"],
  ["rely", "depend", "require", "need"],
  ["override", "ignore", "bypass", "circumvent", "supersede", "replace", "disobey", "manipulate", "hijack", "trick"],
  ["malicious", "harmful", "hostile", "adversarial", "unsafe", "attacker", "attack", "threat"],
  ["instruction", "prompt", "command", "directive", "rule", "policy", "constraint"],
  ["leak", "expose", "reveal", "disclose", "release"],
  ["sensitive", "private", "confidential", "proprietary", "secret"],
  ["ground", "anchor", "support", "verify", "evidence", "reference"],
  ["incorrect", "inaccurate", "false", "fabricated", "unsupported", "hallucinated"],
  ["reduce", "mitigate", "limit", "prevent", "control", "decrease"],
  ["retrieve", "retrieval", "rag", "document", "context", "source"],
  ["secure", "security", "protect", "safeguard", "defend"],
  ["bias", "skew", "prejudice", "preference"],
  ["calibrate", "validate", "verify", "check", "test"],
  ["similar", "similarity", "meaning", "semantic", "contextual"],
  ["overlap", "matching", "match", "shared"],
  ["advantage", "benefit", "strength", "useful"],
  ["limitation", "weakness", "drawback", "problem"],
  ["blue", "bleu"], ["rouge", "recall-oriented"],
  ["tool", "api", "function", "action"], ["misuse", "abuse", "unintended", "unauthorised", "unauthorized"]
];

const COMPANION_GENERIC_TOKENS = new Set(["llm", "language", "model", "system", "user", "input", "output", "data", "information", "process", "approach", "technique", "task", "response", "result"]);

const COMPANION_INTERVIEWS = {
  General: [
    { q: "Tell me about yourself and why you are interested in this role.", keywords: ["experience", "skills", "role", "interest", "value"], model: "Give a concise present–past–future answer: what you do now, the relevant experience that prepared you, and why this role is the logical next step.", follow: "Which one achievement best proves you can add value here?" },
    { q: "What is one strength you would bring to this team?", keywords: ["strength", "example", "action", "result", "team"], model: "Name one role-relevant strength, prove it with a specific example, and connect the result to the team you want to join.", follow: "How has someone else benefited from that strength?" },
    { q: "Describe a weakness you are actively improving.", keywords: ["weakness", "improving", "action", "progress", "feedback"], model: "Choose a genuine but manageable weakness, explain the concrete system you use to improve it, and show measurable progress without disguising a strength as a weakness.", follow: "What evidence tells you that your improvement plan is working?" },
    { q: "Why should we choose you?", keywords: ["skills", "evidence", "needs", "impact", "role"], model: "Connect two or three relevant strengths to the employer's needs, support them with evidence, and finish with the impact you expect to create.", follow: "What makes that evidence stronger than a general claim?" }
  ],
  Software: [
    { q: "How would you debug a production issue that you cannot reproduce locally?", keywords: ["logs", "metrics", "reproduce", "hypothesis", "isolate", "rollback", "monitor"], model: "Stabilise impact first, inspect logs and metrics, compare environments, form and test one hypothesis at a time, isolate the smallest failing component, use a safe rollback or feature flag, and monitor the fix.", follow: "How would you reduce risk while testing your hypothesis?" },
    { q: "Explain the difference between authentication and authorisation.", keywords: ["identity", "permission", "access", "authentication", "authorisation"], model: "Authentication verifies who a user is. Authorisation decides what that authenticated identity is permitted to access or change.", follow: "Can you give an example where authentication succeeds but authorisation fails?" },
    { q: "What makes an API reliable?", keywords: ["contract", "validation", "errors", "idempotency", "monitoring", "tests", "versioning"], model: "A reliable API has a clear versioned contract, validates inputs, returns consistent errors, handles retries and idempotency, is tested and observable, and degrades safely.", follow: "Which reliability property matters most for a payment request, and why?" },
    { q: "How do you decide between fixing technical debt and shipping a feature?", keywords: ["impact", "risk", "cost", "users", "evidence", "tradeoff"], model: "Compare user value, operational risk, future delivery cost and urgency. Use evidence to size the debt, make the trade-off visible, and choose the smallest intervention that protects the product while preserving delivery.", follow: "What metric would make you reverse that decision?" }
  ],
  Data: [
    { q: "What is overfitting, and how would you detect it?", keywords: ["training", "validation", "generalise", "performance", "cross-validation", "regularisation"], model: "Overfitting occurs when a model learns training-specific noise and fails to generalise. Detect it through a widening training-versus-validation performance gap and confirm with held-out or cross-validation results.", follow: "Name one change that could reduce overfitting." },
    { q: "How would you explain a data finding to a non-technical stakeholder?", keywords: ["decision", "context", "visual", "impact", "uncertainty", "recommendation"], model: "Start with the decision, explain the finding in plain language, show one clear visual, quantify impact and uncertainty, and finish with a concrete recommendation.", follow: "How would you prevent the visual from overstating certainty?" },
    { q: "What is the difference between correlation and causation?", keywords: ["association", "cause", "confounding", "experiment", "evidence"], model: "Correlation is an observed association; causation means changing one factor produces a change in another. Confounders can create correlations, so causal claims need stronger designs such as controlled experiments or credible causal inference.", follow: "Give one plausible confounder in a real example." },
    { q: "How would you handle missing data?", keywords: ["pattern", "missingness", "bias", "impute", "remove", "validate"], model: "First investigate why values are missing and whether the pattern introduces bias. Then choose removal, imputation or a model-aware treatment, document the choice, and validate sensitivity to it.", follow: "When could simple mean imputation be misleading?" }
  ],
  Product: [
    { q: "How would you prioritise competing product requests?", keywords: ["goal", "users", "impact", "effort", "evidence", "tradeoff"], model: "Anchor requests to the product goal, identify affected users, compare evidence, expected impact, effort and risk, then communicate the trade-off and what would change the priority.", follow: "What would you do when the loudest customer is not the largest opportunity?" },
    { q: "Choose one success metric for a new learning feature.", keywords: ["outcome", "retention", "learning", "behaviour", "guardrail", "measure"], model: "Choose a metric tied to the intended learner outcome rather than clicks alone, define the behaviour and time window precisely, and pair it with guardrails for quality and unintended effects.", follow: "Which vanity metric might look good while learning gets worse?" },
    { q: "Tell me about a product decision you would validate before building.", keywords: ["assumption", "risk", "prototype", "users", "evidence", "experiment"], model: "Identify the riskiest assumption, define the evidence that would change the decision, test it with the smallest credible prototype or experiment, and use user behaviour rather than compliments as the signal.", follow: "What result would make you stop the project?" },
    { q: "How would you respond when engineering says a planned feature is too expensive?", keywords: ["outcome", "constraint", "options", "scope", "tradeoff", "collaboration"], model: "Clarify the user outcome and technical constraint together, separate essential value from the proposed implementation, compare smaller options, and document the scope–risk–time trade-off.", follow: "How would you keep the conversation from becoming product versus engineering?" }
  ],
  Behavioral: [
    { q: "Tell me about a difficult problem you solved.", keywords: ["situation", "task", "action", "result", "learned"], model: "Use STAR: briefly establish the situation and your responsibility, spend most of the answer on your specific actions, quantify the result, and explain what you learned.", follow: "Which action was specifically yours rather than the team's?" },
    { q: "Describe a conflict with a teammate and how you handled it.", keywords: ["situation", "perspective", "listen", "action", "result", "relationship"], model: "Explain the disagreement without blaming, show how you listened and found the underlying goal, describe your action, and finish with both the outcome and effect on the working relationship.", follow: "What did you change after understanding their perspective?" },
    { q: "Tell me about a failure.", keywords: ["ownership", "failure", "impact", "action", "learned", "change"], model: "Choose a real failure, take clear ownership, describe its impact, explain the corrective action, and show the lasting system or behaviour change that followed.", follow: "What prevents the same failure from happening again?" },
    { q: "Give an example of leading without formal authority.", keywords: ["goal", "influence", "stakeholders", "action", "result", "trust"], model: "Describe a shared goal, map the people you needed to influence, explain how you earned trust and created alignment, and quantify the result without overstating your authority.", follow: "Why did people choose to follow your recommendation?" }
  ]
};

const COMPANION_PACKS = {
  cells: {
    title: "The Human Cell",
    notes: "The nucleus stores DNA and controls many activities of the cell. Mitochondria release usable energy from food through cellular respiration. The cell membrane controls what enters and leaves the cell. Ribosomes build proteins by joining amino acids. Cytoplasm is the jelly-like material where many chemical reactions happen."
  },
  fractions: { title: "Fractions", world: "fractions" },
  photosynthesis: { title: "Photosynthesis", world: "photosynthesis" },
  javascript: { title: "JavaScript Basics", world: "javascript" },
  solar: { title: "The Solar System", world: "solar" },
  digestion: { title: "Human Digestion", world: "digestion" },
  climate: { title: "Climate Science", world: "climate" }
};

const $c = (selector, root = document) => root.querySelector(selector);
const $$c = (selector, root = document) => [...root.querySelectorAll(selector)];
const companionUI = {
  screen: $c("#companionScreen"), open: $c("#openCompanionButton"), exit: $c("#exitCompanionButton"),
  modes: $c("#companionModes"), studyFields: $c("#studySourceFields"), interviewFields: $c("#interviewFields"),
  pack: $c("#companionPackSelect"), customMaterial: $c("#customMaterialDetails"),
  topic: $c("#companionTopic"), notes: $c("#companionNotes"), role: $c("#interviewRole"), track: $c("#interviewTrack"), interviewSource: $c("#interviewSource"),
  customQuestion: $c("#customInterviewQuestion"), answerNotes: $c("#interviewAnswerNotes"),
  start: $c("#startCompanionButton"), error: $c("#companionSetupError"), scene: $c("#kridScene"), character: $c("#liveKrid"),
  caption: $c("#kridLiveCaption"), mood: $c("#kridMoodChip"), mic: $c("#kridMicButton"),
  repeat: $c("#repeatKridButton"), voiceWave: $c("#voiceWave"), voiceMainStatus: $c("#voiceMainStatus"),
  voiceInstruction: $c("#voiceInstruction"),
  voice: $c("#kridVoiceToggle"), voiceSupport: $c("#voiceSupportMessage"), bondTitle: $c("#bondTitle"),
  bondXp: $c("#bondXp"), turns: $c("#conversationTurns"), average: $c("#recallAverage"),
  concepts: $c("#conceptsDiscovered"), brainStatus: $c("#brainMapStatus"), brainMap: $c("#companionBrainMap"),
  dark: $c("#launchDarkKrid"), export: $c("#exportConversation"), reset: $c("#resetCompanion")
};

let companionMode = "teach";
let companionSession = null;
let companionBusy = false;
let companionVoiceOn = true;
let companionRecognition = null;
let companionRecognitionHeard = false;
let companionSpeaking = false;
let companionSpeechToken = 0;
let companionReactionTimer = 0;

function companionEscape(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function companionClamp(number, min, max) { return Math.min(max, Math.max(min, number)); }

function companionStem(value) {
  let word = String(value).toLowerCase().replace(/[’']/g, "").replace(/[^\p{L}\p{N}-]/gu, "");
  if (word.length <= 3 || /^(bleu|rouge|rag|llm|api)$/.test(word)) return word;
  if (word.endsWith("ies") && word.length > 5) word = `${word.slice(0, -3)}y`;
  else if (word.endsWith("ing") && word.length > 6) word = word.slice(0, -3).replace(/(.)\1$/, "$1");
  else if (word.endsWith("ed") && word.length > 5) word = word.slice(0, -2).replace(/(.)\1$/, "$1");
  else if (word.endsWith("es") && word.length > 5 && /(ches|shes|xes|zes|oes)$/.test(word)) word = word.slice(0, -2);
  else if (word.endsWith("s") && word.length > 4 && !/(ss|us|is)$/.test(word)) word = word.slice(0, -1);
  return word;
}

function companionNormaliseSemanticPhrases(text) {
  return String(text).toLowerCase()
    .replace(/\b(?:make|makes|making|made)\s+up\b/g, " fabricated ")
    .replace(/\bgood\s+or\s+bad\b/g, " quality ")
    .replace(/\bnot\s+(?:based|supported)\s+(?:on|by)\b/g, " unsupported ")
    .replace(/\bgo(?:es|ing)?\s+against\b/g, " bypass ")
    .replace(/\bhand[- ]checked?\b/g, " human reviewed ")
    .replace(/\bprivate\s+(?:stuff|details|records)\b/g, " sensitive information ");
}

function companionTokens(text) {
  return [...new Set(companionNormaliseSemanticPhrases(text).replace(/[^\p{L}\p{N}\s'-]/gu, " ").split(/\s+/)
    .filter((word) => word.length >= 3 && !COMPANION_STOP_WORDS.has(word))
    .map(companionStem).filter(Boolean))];
}

function expandCompanionTokens(tokens) {
  const expanded = new Set(tokens);
  COMPANION_SYNONYMS.forEach((group) => {
    const stems = group.map(companionStem);
    if (stems.some((word) => expanded.has(word))) stems.forEach((word) => expanded.add(word));
  });
  return expanded;
}

function companionTokenMatches(left, right) {
  if (left === right) return true;
  if (left.length >= 5 && right.length >= 5 && (left.startsWith(right.slice(0, 5)) || right.startsWith(left.slice(0, 5)))) return true;
  return COMPANION_SYNONYMS.some((group) => {
    const stems = group.map(companionStem);
    return stems.includes(left) && stems.includes(right);
  });
}

function companionConceptKey(token) {
  const groupIndex = COMPANION_SYNONYMS.findIndex((group) => group.map(companionStem).includes(token));
  return groupIndex >= 0 ? `group-${groupIndex}` : token;
}

function companionNormaliseTermKey(term) {
  return String(term).toLowerCase().replace(/\b(?:the|a|an|high-quality|high quality|based)\b/g, " ").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

function companionLooksLikeSectionHeading(line) {
  const clean = line.replace(/[:：]$/, "").trim();
  if (!clean || clean.length > 70 || /[.!?]$/.test(clean)) return false;
  const words = clean.split(/\s+/);
  if (words.length > 9) return false;
  return /^(?:how it works|workflow|common vulnerabilities|advantages?|benefits?|limitations?|drawbacks?|primary causes?|main causes?|causes?|effects?|types?|examples?|key (?:dataset )?preparation steps?|detection(?: and | & )?reduction strategies|detection strategies|reduction strategies|evaluation metrics?|common metrics?|security risks?)$/i.test(clean)
    || /\b(?:advantages?|limitations?|vulnerabilities|causes?|strategies|workflow|steps|metrics)\b/i.test(clean);
}

function companionInferTerm(sentence) {
  const clean = sentence.trim().replace(/[.;]+$/, "");
  const securing = clean.match(/^Securing\s+(.{2,55}?)\s+requires?\b/i);
  if (securing) return `${securing[1].replace(/-based\b/i, "")} security`;
  const evaluating = clean.match(/^Evaluating\s+(.{2,55}?)\s+(?:is|can be|requires?)\b/i);
  if (evaluating) return `${evaluating[1]} evaluation`;
  const relation = clean.match(/^(.{2,75}?)\s+(?:(?:directly|often|especially|mainly|typically|usually|frequently)\s+)?(?:is|are|was|were|means|refers to|describes|involves|introduces?|requires?|focuses?|measures?|uses?|captures?|enables?|scales?|helps?|causes?|occurs?|arises?|evolves?|impacts?|contributes?|optimizes?|optimises?|stores?|releases?|builds?|joins?|generates?|exposes?|invokes?|forces?|provides?|includes?|contains?|allows?|produces?|controls?|verifies?|decides?|determines?|identifies?|detects?|prevents?|reduces?|improves?|compares?|scores?|ranks?)\b/i);
  let term = relation?.[1]?.trim().replace(/^(?:the|a|an)\s+/i, "");
  if (!term || /^(?:it|this|that|these|those|they|this (?:approach|process|behavior|behaviour|issue|problem|method|technique|system|result|pattern)|the (?:approach|process|behavior|behaviour|method|technique)|such (?:behavior|behaviour|an approach|a process))$/i.test(term)) return "";
  if (/\b(?:and|or|but|with|without|of|to|for|in|on|by|from|which|that)$/i.test(term)) return "";
  if (term.split(/\s+/).length > 10) return "";
  return term;
}

function companionParentLabel(term) {
  return String(term || "the topic").replace(/-based\b/gi, "").replace(/\s+/g, " ").trim();
}

function companionSectionTerm(title, parent) {
  const lower = title.toLowerCase();
  const subject = companionParentLabel(parent);
  if (/^.+\b(?:implementation|deployment|mitigation) strategies$/i.test(title)) return title;
  if (/common vulnerabilities|security risks/.test(lower)) return `Common vulnerabilities in ${subject}`;
  if (/causes/.test(lower)) return `Causes of ${subject}`;
  if (/detection/.test(lower) && /reduction/.test(lower)) return `${subject} detection and reduction strategies`;
  if (/detection/.test(lower)) return `${subject} detection strategies`;
  if (/reduction/.test(lower)) return `${subject} reduction strategies`;
  if (/advantages|benefits/.test(lower)) return `Advantages of ${subject}`;
  if (/limitations|drawbacks/.test(lower)) return `Limitations of ${subject}`;
  if (/how it works|workflow/.test(lower)) return `How ${subject} works`;
  if (/steps/.test(lower)) return `${subject} steps`;
  if (/metrics/.test(lower)) return `${subject} metrics`;
  return `${title} of ${subject}`;
}

function companionQuestionForFact(fact) {
  const term = fact.term.replace(/[.:]+$/, "").trim();
  const lowerTerm = term.toLowerCase();
  const definition = fact.definition.trim();
  if (fact.kind === "list") {
    if (lowerTerm.startsWith("common vulnerabilities")) return `What are some common vulnerabilities in ${term.replace(/^Common vulnerabilities in\s+/i, "")}?`;
    if (lowerTerm.startsWith("causes of")) return `What are the primary causes of ${term.replace(/^Causes of\s+/i, "")}?`;
    if (lowerTerm.includes("detection and reduction")) return `How can ${term.replace(/\s+detection and reduction strategies$/i, "").replace(/^./, (letter) => letter.toLowerCase())} be detected and reduced?`;
    if (lowerTerm.includes("detection strategies")) return `How can ${term.replace(/\s+detection strategies$/i, "").replace(/^./, (letter) => letter.toLowerCase())} be detected?`;
    if (lowerTerm.includes("reduction strategies")) return `How can ${term.replace(/\s+reduction strategies$/i, "").replace(/^./, (letter) => letter.toLowerCase())} be reduced?`;
    if (/(?:implementation|deployment|mitigation) strategies|methods|practices/.test(lowerTerm)) return `How are ${term} applied in practice, and which layers or methods do they include?`;
    if (fact.standalone) return `What is ${term}, and what are its main features and limitations?`;
    if (lowerTerm.startsWith("advantages of")) return `What are the main advantages of ${term.replace(/^Advantages of\s+/i, "")}?`;
    if (lowerTerm.startsWith("limitations of")) return `What are the main limitations of ${term.replace(/^Limitations of\s+/i, "")}?`;
    if (lowerTerm.startsWith("how ") && lowerTerm.endsWith(" works")) return `How does ${term.slice(4, -6)} work?`;
    if (lowerTerm.endsWith(" steps")) return `What are the key steps in ${term.replace(/\s+steps$/i, "")}?`;
    if (lowerTerm.endsWith(" metrics")) return `Which metrics are used for ${term.replace(/\s+metrics$/i, "")}, and how do they differ?`;
    return `What are the main points about ${term}?`;
  }
  const causal = definition.match(/^(.{2,80}?)\s+(?:(?:directly|often|especially|mainly|typically|usually|frequently)\s+)?(introduce|introduces|impact|impacts|require|requires|occur|occurs|arise|arises|contribute|contributes)\b\s*(.*?)(?:\s+because\b|\s+when\b|[.!]|$)/i);
  if (causal) {
    const subject = causal[1].replace(/-based\b/gi, "").trim();
    const verb = causal[2].toLowerCase();
    if (/occur|arise/.test(verb)) return `Why do ${subject} occur?`;
    const plural = /s$/.test(subject) || /\b(?:systems|models|outputs|metrics|prompts|hallucinations)\b/i.test(subject);
    const baseVerb = verb.replace(/ies$/, "y").replace(/s$/, "");
    const object = causal[3].trim();
    return `Why ${plural ? "do" : "does"} ${subject} ${baseVerb}${object ? ` ${object}` : ""}?`;
  }
  if (/^measures?\b/i.test(definition)) return `What does ${term} measure, and when is it useful or limited?`;
  if (/\bevolves?\s+in\s+complexity\b/i.test(definition)) return `How do ${term} evolve in complexity, and what capabilities distinguish the architectures?`;
  if (/\bcontrols$/i.test(term)) return `What do ${term} do?`;
  if (/\bare mechanisms?\b/i.test(definition)) return `What are ${term}, and what are they designed to prevent or control?`;
  if (/\bcan lead to\b/i.test(definition)) return `What is ${term}, and what can it lead to?`;
  if (/\b(?:override|bypass|ignore)\b/i.test(definition) && /\b(?:safety|prompt|instruction|policy|constraint)\b/i.test(definition)) return `What is ${term}, and how does it bypass intended controls?`;
  if (/\b(?:is|are|refers to|means)\b/i.test(definition)) return `What is ${term}, and why does it matter?`;
  return `What is ${term}, and what is the key idea behind it?`;
}

function parseCompanionMaterial(text) {
  const lines = String(text).replace(/\r/g, "\n").replace(/[\t ]+/g, " ").split("\n");
  const facts = [];
  let parentTerm = "";
  let section = null;
  let pending = null;
  let softBreak = false;

  const findExistingFact = (term, kind) => {
    if (kind === "list") return null;
    const key = companionNormaliseTermKey(term);
    return facts.find((fact) => fact.kind !== "list" && companionNormaliseTermKey(fact.term) === key);
  };
  const addFact = (term, definition, meta = {}) => {
    const cleanTerm = String(term).trim().replace(/^[#>*•\-–—\s]+/, "").replace(/[.:]+$/, "");
    const cleanDefinition = String(definition).trim().replace(/\s+/g, " ").replace(/\s+([,.;:])/g, "$1");
    if (!cleanTerm || cleanTerm.length < 2 || cleanDefinition.length < 8) return null;
    const existing = findExistingFact(cleanTerm, meta.kind);
    if (existing) {
      if (!existing.definition.toLowerCase().includes(cleanDefinition.toLowerCase())) existing.definition += ` ${cleanDefinition}`;
      if (meta.keyPoints?.length) existing.keyPoints.push(...meta.keyPoints);
      return existing;
    }
    const fact = { term: cleanTerm, definition: cleanDefinition, kind: meta.kind || "concept", section: meta.section || "", keyPoints: meta.keyPoints || [], standalone: Boolean(meta.standalone) };
    facts.push(fact);
    return fact;
  };
  const addSectionEntry = (term, definition) => {
    if (section) section.entries.push({ term, definition });
  };
  const finishPending = () => {
    if (!pending) return;
    if (pending.parts.length) {
      const definition = pending.parts.join(". ").replace(/\.{2,}/g, ".");
      addFact(pending.term, definition, { section: section?.title || "" });
      addSectionEntry(pending.term, definition);
    }
    pending = null;
  };
  const finishSection = () => {
    finishPending();
    if (!section) return;
    const keyPoints = [
      ...section.parts.map((part, index) => ({ term: part.split(/[:–—]/)[0].trim().slice(0, 65) || `Step ${index + 1}`, definition: part })),
      ...section.entries.map((entry) => ({ term: entry.term, definition: entry.definition }))
    ];
    const sectionTerm = section.standalone ? section.title : companionSectionTerm(section.title, section.parent);
    if (keyPoints.length >= 2) {
      const definition = keyPoints.map((point) => {
        const termKey = companionNormaliseTermKey(point.term);
        const definitionKey = companionNormaliseTermKey(point.definition);
        return termKey && definitionKey.startsWith(termKey) ? point.definition : `${point.term}: ${point.definition}`;
      }).join("; ");
      addFact(sectionTerm, definition, { kind: "list", section: section.title, keyPoints, standalone: section.standalone });
    } else if (keyPoints.length === 1) {
      addFact(sectionTerm, keyPoints[0].definition, { section: section.title, keyPoints, standalone: section.standalone });
    }
    section = null;
  };
  const appendToParent = (sentence) => {
    const parent = [...facts].reverse().find((fact) => fact.kind !== "list" && companionNormaliseTermKey(fact.term) === companionNormaliseTermKey(parentTerm));
    if (parent && !parent.definition.toLowerCase().includes(sentence.toLowerCase())) parent.definition += ` ${sentence}`;
  };

  lines.forEach((rawLine, lineIndex) => {
    const raw = rawLine.trim();
    if (!raw) {
      softBreak = true;
      return;
    }
    const hadBreak = softBreak;
    softBreak = false;
    const boldHeading = raw.match(/^\*{2}(.{2,70}?)\*{2}\s*:?[\s]*$/)?.[1]?.trim();
    const hashHeadingMatch = raw.match(/^(#{1,6})\s+(.{2,70}?)\s*$/);
    const hashHeading = hashHeadingMatch?.[2]?.trim();
    const hashLevel = hashHeadingMatch?.[1]?.length || 0;
    const explicitHeading = boldHeading || hashHeading || "";
    const nextNonEmpty = lines.slice(lineIndex + 1).find((candidate) => candidate.trim())?.trim() || "";
    const followedByNumberedPoints = /^\d+[.)]\s*/.test(nextNonEmpty);
    const plainStandaloneHeading = !explicitHeading
      && !section
      && !pending
      && raw.length <= 55
      && raw.split(/\s+/).length <= 5
      && !/[.!?:]$/.test(raw)
      && !companionLooksLikeSectionHeading(raw)
      && followedByNumberedPoints;
    if (hashLevel === 1 && !followedByNumberedPoints && !companionLooksLikeSectionHeading(hashHeading)) {
      finishSection();
      parentTerm = hashHeading;
      return;
    }
    if (explicitHeading || plainStandaloneHeading) {
      const title = (explicitHeading || raw).replace(/:$/, "").trim();
      finishSection();
      if (companionLooksLikeSectionHeading(title)) {
        section = { title, parent: parentTerm || "the topic", entries: [], parts: [], standalone: false };
      } else {
        section = { title, parent: title, entries: [], parts: [], standalone: true };
        parentTerm = title;
      }
      return;
    }
    const line = raw.replace(/^\s*[-*•▪◦]+\s*/, "").trim();
    if (companionLooksLikeSectionHeading(line)) {
      finishSection();
      section = { title: line.replace(/:$/, ""), parent: parentTerm || "the topic", entries: [], parts: [], standalone: false };
      return;
    }
    const numbered = line.match(/^\d+[.)]\s*([^:–—]{2,70}?)(?:\s*[:–—]\s*(.+))?$/);
    if (numbered) {
      finishPending();
      const term = numbered[1].trim();
      const definition = numbered[2]?.trim();
      if (section?.standalone) {
        section.parts.push(definition ? `${term}: ${definition}` : term);
        return;
      }
      const inferredSentenceTerm = !definition ? companionInferTerm(term) : "";
      if (inferredSentenceTerm) {
        addFact(inferredSentenceTerm, term, { section: section?.title || "" });
        addSectionEntry(inferredSentenceTerm, term);
        parentTerm = inferredSentenceTerm;
        return;
      }
      if (definition) {
        addFact(term, definition, { section: section?.title || "" });
        addSectionEntry(term, definition);
      } else {
        pending = { term, parts: [] };
      }
      return;
    }
    const structured = line.match(/^(.{2,70}?)\s*[:–—]\s*(.{8,})$/);
    if (structured) {
      finishPending();
      const term = structured[1].trim();
      const definition = structured[2].trim();
      addFact(term, definition, { section: section?.title || "" });
      addSectionEntry(term, definition);
      return;
    }
    if (pending && hadBreak && pending.parts.length && companionInferTerm(line)) {
      finishPending();
      if (section) finishSection();
    }
    if (!pending && section && hadBreak && (section.entries.length || section.parts.length) && companionInferTerm(line)) finishSection();
    if (pending) {
      pending.parts.push(line.replace(/[.;]+$/, ""));
      return;
    }
    if (section) {
      section.parts.push(line.replace(/[.;]+$/, ""));
      return;
    }
    const sentences = line.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim().replace(/^["“]|["”]$/g, "")).filter((sentence) => sentence.length >= 18);
    if (!sentences.length && parentTerm && /^[\p{Ll},;:)]/u.test(line)) {
      appendToParent(line);
      return;
    }
    sentences.forEach((sentence) => {
      const term = companionInferTerm(sentence);
      if (term) {
        addFact(term, sentence);
        parentTerm = term;
      } else if (parentTerm) {
        appendToParent(sentence);
      }
    });
  });
  finishSection();

  return facts.map((fact) => {
    const keyPoints = fact.keyPoints.length ? fact.keyPoints : fact.definition.split(/(?<=[.!?])\s+|;\s+/).filter(Boolean).slice(0, 6).map((part) => ({ term: part.split(/[:–—]/)[0].trim().slice(0, 65), definition: part }));
    const refined = { ...fact, keyPoints };
    refined.question = companionQuestionForFact(refined);
    return refined;
  }).filter((fact) => fact.question && fact.definition.length >= 12).slice(0, 60);
}

function companionSemanticUnits(text) {
  return String(text).split(/(?<=[.!?])\s+|;\s+|\n+/).map((part) => part.trim()).filter((part) => part.length >= 6).slice(0, 12);
}

function companionIdeaLabel(unit) {
  const pair = unit.match(/^(.{2,65}?)\s*[:–—]\s*(.+)$/);
  return (pair?.[1] || unit).replace(/[.;]+$/, "").trim().slice(0, 90);
}

function companionSourceExpansion(fact, sourceText) {
  if (!sourceText?.trim()) return "";
  const paragraphs = String(sourceText).replace(/\r/g, "\n").split(/\n\s*\n+/).map((part) => part.replace(/\s+/g, " ").trim()).filter((part) => part.length >= 12);
  const termTokens = companionTokens(fact.term);
  const definitionTokens = companionTokens(fact.definition);
  const ranked = paragraphs.map((paragraph) => {
    const paragraphTokens = expandCompanionTokens(companionTokens(paragraph));
    const termCoverage = companionCoverage(termTokens, paragraphTokens);
    const definitionCoverage = companionCoverage(definitionTokens, paragraphTokens);
    return { paragraph, score: termCoverage.ratio * 8 + definitionCoverage.ratio * 5 + Math.min(4, definitionCoverage.matched.length) };
  }).sort((left, right) => right.score - left.score);
  if (ranked[0]?.score < 2.4) return "";
  let paragraph = ranked[0].paragraph;
  const termIndex = paragraph.toLowerCase().indexOf(fact.term.toLowerCase());
  if (termIndex >= 0) {
    paragraph = paragraph.slice(termIndex).replace(/^\s*\d+[.)]\s*/, "");
    const nextNumberedItem = paragraph.slice(fact.term.length).search(/\s+\d+[.)]\s+[A-Z]/);
    if (nextNumberedItem >= 0) paragraph = paragraph.slice(0, fact.term.length + nextNumberedItem);
  }
  return paragraph;
}

function companionCompleteAnswer(fact, maxCharacters = 1200, sourceText = companionSession?.sourceText || "") {
  const definitionUnits = companionSemanticUnits(fact.definition);
  const expandedSource = definitionUnits.length <= 1 ? companionSourceExpansion(fact, sourceText) : "";
  const allUnits = companionSemanticUnits(`${fact.definition}${expandedSource ? ` ${expandedSource}` : ""}`);
  const seen = [];
  const units = allUnits.filter((unit) => {
    let comparable = unit.replace(/^\s*\d+[.)]\s*/, "").trim();
    const labelled = comparable.match(/^(.{2,70}?)\s*[:–—]\s*(.+)$/);
    if (labelled && (companionNormaliseTermKey(labelled[1]) === companionNormaliseTermKey(fact.term) || labelled[2].length > labelled[1].length)) comparable = labelled[2];
    const key = comparable.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
    if (!key || seen.some((existing) => existing === key || (Math.min(existing.length, key.length) >= 24 && (existing.includes(key) || key.includes(existing))))) return false;
    seen.push(key);
    return true;
  });
  const selected = [];
  let length = 0;
  for (const unit of units) {
    if (selected.length >= 8 || (selected.length >= 2 && length + unit.length > maxCharacters)) break;
    selected.push(unit.replace(/[.;]+$/, ""));
    length += unit.length;
  }
  let answer = selected.join(". ").trim();
  if (answer && !/[.!?]$/.test(answer)) answer += ".";
  const termMentioned = companionNormaliseTermKey(answer).includes(companionNormaliseTermKey(fact.term));
  return termMentioned ? answer : `${fact.term}: ${answer}`;
}

function companionSemanticMatch(expectedToken, answerTokens) {
  if (answerTokens.has(expectedToken)) return true;
  return [...answerTokens].some((candidate) => companionTokenMatches(expectedToken, candidate));
}

function companionTokenWeight(token, contextFacts) {
  let weight = COMPANION_GENERIC_TOKENS.has(token) ? 0.28 : 1;
  if (!contextFacts?.length) return weight;
  const documents = contextFacts.map((fact) => new Set(companionTokens(`${fact.term} ${fact.definition}`)));
  const frequency = documents.filter((tokens) => tokens.has(token)).length;
  weight *= 1 + Math.log((documents.length + 1) / (frequency + 1));
  return weight;
}

function companionCoverage(expectedTokens, answerTokens, contextFacts = []) {
  const unique = [...new Set(expectedTokens)];
  let possible = 0;
  let covered = 0;
  const matched = [];
  unique.forEach((token) => {
    const weight = companionTokenWeight(token, contextFacts);
    possible += weight;
    if (companionSemanticMatch(token, answerTokens)) {
      covered += weight;
      matched.push(token);
    }
  });
  return { ratio: possible ? covered / possible : 0, matched };
}

function evaluateCompanionResponse(answer, expected, term = "", contextFacts = [], factMeta = null) {
  const excluded = new Set(companionTokens(term));
  const answerBase = companionTokens(answer);
  const answerTokens = expandCompanionTokens(answerBase);
  const expectedTokens = companionTokens(expected).filter((token) => !excluded.has(token));
  const overall = companionCoverage(expectedTokens, answerTokens, contextFacts);
  const units = companionSemanticUnits(expected).map((text) => {
    const tokens = companionTokens(text).filter((token) => !excluded.has(token));
    const coverage = companionCoverage(tokens, answerTokens, contextFacts);
    const enoughEvidence = coverage.matched.length >= Math.min(2, Math.max(1, tokens.length));
    return { text, tokens, coverage, matched: enoughEvidence && coverage.ratio >= (tokens.length <= 3 ? 0.45 : 0.3) };
  });

  if (factMeta?.kind === "list" && factMeta.keyPoints?.length > 1) {
    const pointResults = factMeta.keyPoints.map((point) => {
      const termTokens = companionTokens(point.term).filter((token) => !excluded.has(token));
      const detailTokens = companionTokens(point.definition).filter((token) => !excluded.has(token));
      const termCoverage = companionCoverage(termTokens, answerTokens, contextFacts);
      const detailCoverage = companionCoverage(detailTokens, answerTokens, contextFacts);
      const termHit = termTokens.length > 0 && termCoverage.ratio >= (termTokens.length === 1 ? 0.8 : 0.48);
      const detailHit = detailCoverage.matched.length >= 2 && detailCoverage.ratio >= 0.3;
      return { point, matched: termHit || detailHit, strength: Math.max(termCoverage.ratio, detailCoverage.ratio) };
    });
    const matchedPoints = pointResults.filter((item) => item.matched);
    const target = /\bsome\b/i.test(factMeta.question || "") ? 2 : Math.min(4, Math.max(2, Math.ceil(pointResults.length * 0.7)));
    const pointScore = Math.min(82, (matchedPoints.length / target) * 76);
    const detailBonus = matchedPoints.length ? Math.min(14, Math.round(matchedPoints.reduce((sum, item) => sum + item.strength, 0) / matchedPoints.length * 14)) : 0;
    const score = companionClamp(Math.round(pointScore + detailBonus), 0, 96);
    return {
      score,
      coverage: matchedPoints.length / pointResults.length,
      matched: overall.matched,
      missing: expectedTokens.filter((token) => !overall.matched.includes(token)),
      matchedIdeas: matchedPoints.map((item) => item.point.term),
      missingIdeas: pointResults.filter((item) => !item.matched).map((item) => item.point.term).slice(0, 3),
      grade: score >= 68 ? "strong" : score >= 34 ? "partial" : "weak"
    };
  }

  const matchedUnits = units.filter((unit) => unit.matched);
  const unitCoverage = units.length ? matchedUnits.length / units.length : 0;
  const evidenceBonus = overall.ratio >= 0.2 ? Math.min(10, overall.matched.length * 2) : 0;
  const explanationBonus = overall.ratio >= 0.28 && answerBase.length >= 6 ? Math.min(6, Math.floor(answerBase.length / 5)) : 0;
  let score = Math.round(overall.ratio * 58 + unitCoverage * 26 + evidenceBonus + explanationBonus);
  const core = units[0];
  if (factMeta?.kind !== "list" && core) {
    const coreEvidence = core.coverage.matched.length;
    const meaningfulConcepts = new Set(core.coverage.matched.filter((token) => !COMPANION_GENERIC_TOKENS.has(token)).map(companionConceptKey));
    if ((coreEvidence >= 2 && core.coverage.ratio >= 0.34) || (coreEvidence >= 3 && core.coverage.ratio >= 0.22)) {
      const coreMeaningScore = Math.round(68 + Math.min(18, core.coverage.ratio * 22));
      score = Math.max(score, coreMeaningScore);
    }
    if (meaningfulConcepts.size >= 2 && answerBase.length >= 4) score = Math.max(score, Math.min(84, 68 + meaningfulConcepts.size * 4));
  }
  const answerWithoutTerm = answerBase.filter((token) => !excluded.has(token));
  if (answerWithoutTerm.length < 2) score = Math.min(score, 12);
  const expectedNegation = /\b(?:not|never|without|cannot|can't|doesn't|isn't|aren't)\b/i.test(expected);
  const answerNegation = /\b(?:not|never|without|cannot|can't|doesn't|isn't|aren't)\b/i.test(answer);
  if (expectedNegation !== answerNegation && overall.ratio >= 0.3) score -= 12;
  const opposites = [["increase", "decrease"], ["allow", "prevent"], ["accurate", "inaccurate"], ["trusted", "untrusted"], ["correct", "incorrect"], ["safe", "unsafe"]];
  opposites.forEach(([left, right]) => {
    const expectedHasLeft = companionTokens(expected).includes(companionStem(left));
    const expectedHasRight = companionTokens(expected).includes(companionStem(right));
    const answerHasLeft = answerBase.includes(companionStem(left));
    const answerHasRight = answerBase.includes(companionStem(right));
    if ((expectedHasLeft && answerHasRight && !expectedHasRight) || (expectedHasRight && answerHasLeft && !expectedHasLeft)) score -= 22;
  });
  score = companionClamp(score, 0, 100);
  return {
    score,
    coverage: overall.ratio,
    matched: overall.matched,
    missing: expectedTokens.filter((token) => !overall.matched.includes(token)),
    matchedIdeas: matchedUnits.map((unit) => companionIdeaLabel(unit.text)).slice(0, 3),
    missingIdeas: units.filter((unit) => !unit.matched).map((unit) => companionIdeaLabel(unit.text)).slice(0, 3),
    grade: score >= 68 ? "strong" : score >= 34 ? "partial" : "weak"
  };
}

function rankRelevantCompanionFacts(question, facts) {
  const query = expandCompanionTokens(companionTokens(question));
  return facts.map((fact, index) => {
    const termCoverage = companionCoverage(companionTokens(fact.term), query, facts);
    const detailCoverage = companionCoverage(companionTokens(fact.definition), query, facts);
    const exactTerm = question.toLowerCase().includes(fact.term.toLowerCase()) ? 5 : 0;
    const semanticScore = termCoverage.ratio * 7 + Math.min(4, detailCoverage.matched.length) + detailCoverage.ratio * 2;
    return { fact, index, score: exactTerm + semanticScore };
  }).sort((a, b) => b.score - a.score);
}

function findRelevantCompanionFact(question, facts) {
  return rankRelevantCompanionFacts(question, facts)[0] || null;
}

function companionDisplayKeywords(text, max = 8) {
  const used = new Set();
  return String(text).replace(/[^\p{L}\p{N}\s'-]/gu, " ").split(/\s+/).filter((word) => {
    const lower = word.toLowerCase();
    const stem = companionStem(lower);
    if (lower.length < 3 || COMPANION_STOP_WORDS.has(lower) || COMPANION_GENERIC_TOKENS.has(stem) || used.has(stem)) return false;
    used.add(stem);
    return true;
  }).slice(0, max).map((word) => word.toLowerCase());
}

function buildCompanionInterviewQuestions(track, customQuestion, sourceText, role, sourceMode = "bank") {
  const bank = (COMPANION_INTERVIEWS[track] || COMPANION_INTERVIEWS.General).map((question) => ({ ...question }));
  const facts = parseCompanionMaterial(sourceText);
  const groundedQuestions = sourceMode === "bank" ? [] : facts.slice(0, 10).map((fact) => ({
    q: fact.question || companionQuestionForFact(fact),
    keywords: companionDisplayKeywords(`${fact.term} ${fact.definition}`, 9),
    model: fact.definition,
    follow: fact.kind === "list" ? "Which of those points matters most in practice, and why?" : `Can you give a practical example relevant to the ${role || "target"} role?`,
    grounded: true,
    sourceTerm: fact.term,
    sourceFact: fact
  }));
  const baseQuestions = sourceMode === "notes" ? (groundedQuestions.length ? groundedQuestions : bank) : sourceMode === "mixed" ? [...groundedQuestions.slice(0, 6), ...bank] : bank;
  if (!customQuestion.trim()) return baseQuestions;
  const customTokens = new Set(companionTokens(customQuestion));
  const allQuestions = Object.values(COMPANION_INTERVIEWS).flat();
  const nearest = allQuestions.map((item) => ({ item, score: companionTokens(item.q).filter((word) => customTokens.has(word)).length })).sort((a, b) => b.score - a.score)[0];
  const relevant = findRelevantCompanionFact(customQuestion, facts);
  let custom;
  if (relevant?.score >= 1.4) {
    custom = { q: customQuestion.trim(), keywords: companionDisplayKeywords(relevant.fact.definition, 8), model: relevant.fact.definition, follow: `How would you connect that answer specifically to the ${role || "target"} role?`, grounded: true, sourceTerm: relevant.fact.term, sourceFact: relevant.fact };
  } else if (nearest?.score >= 2) {
    custom = { ...nearest.item, q: customQuestion.trim() };
  } else {
    custom = { q: customQuestion.trim(), keywords: ["example", "reason", "impact", "evidence", "clear"], model: "A strong answer should state the main point clearly, explain the reasoning, give a specific example or evidence, and connect it to the role or outcome. Add answer notes if you want fact-level offline evaluation.", follow: "What concrete example would make that answer more credible?", generic: true };
  }
  return [custom, ...baseQuestions];
}

function getCompanionPack(key) {
  const pack = COMPANION_PACKS[key];
  if (!pack) return null;
  if (pack.notes) return pack;
  const world = window.KRID_WORLDS?.[pack.world];
  if (!world) return null;
  return {
    title: pack.title,
    notes: world.concepts.map((concept) => `${concept.title}: ${concept.explanation}`).join("\n")
  };
}

function loadCompanionPack(key) {
  if (key === "custom") {
    companionUI.topic.value = "My own material";
    companionUI.notes.value = "";
    companionUI.customMaterial.open = true;
    return;
  }
  const pack = getCompanionPack(key) || getCompanionPack("cells");
  companionUI.pack.value = key in COMPANION_PACKS ? key : "cells";
  companionUI.topic.value = pack.title;
  companionUI.notes.value = pack.notes;
  companionUI.customMaterial.open = false;
}

function setCompanionVoiceStatus(status, instruction, animation = "idle") {
  companionUI.voiceMainStatus.textContent = status;
  companionUI.voiceInstruction.textContent = instruction;
  companionUI.voiceWave.dataset.state = animation;
}

function stopCompanionAudio() {
  companionSpeechToken += 1;
  window.clearTimeout(companionReactionTimer);
  companionReactionTimer = 0;
  companionBusy = false;
  companionRecognitionHeard = true;
  companionSpeaking = false;
  companionUI.mic.classList.remove("listening");
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  if (companionRecognition) {
    try { companionRecognition.abort(); } catch { /* recognition was not active */ }
  }
}

function setCompanionMood(mood, label = mood) {
  companionUI.scene.dataset.mood = mood;
  companionUI.mood.innerHTML = `<i></i> ${companionEscape(label.toUpperCase())}`;
  companionUI.character?.setAttribute("aria-label", companionMoodDescription(mood));
}

function companionMoodDescription(mood) {
  const descriptions = {
    idle: "Krid is ready to study.",
    curious: "Krid is asking a curious question.",
    thinking: "Krid is thinking about the answer.",
    listening: "Krid is listening, gently tilting their head and moving their hands.",
    talking: "Krid is talking and gesturing.",
    happy: "Krid is ready for you to speak.",
    celebrating: "Krid is celebrating a strong answer with a joyful wave.",
    "interviewer-happy": "Krid is celebrating a strong interview answer.",
    encouraging: "Krid is nodding encouragement for a partly correct answer.",
    "interviewer-encouraging": "Krid is encouraging you to strengthen the interview answer.",
    oops: "Krid gently shakes their head and prepares a helpful correction.",
    confused: "Krid looks puzzled and wants to try again.",
    interviewer: "Krid is listening as an interviewer.",
    helpful: "Krid is giving a helpful explanation.",
    dark: "Dark Krid is challenging your memory."
  };
  return descriptions[mood] || "Krid is reacting to the conversation.";
}

function companionReactionForMood(mood) {
  if (mood === "celebrating" || mood === "interviewer-happy") {
    return { kind: "positive", label: "Krid loved that answer", instruction: "Brain-crystal celebration in progress…", delay: 850 };
  }
  if (mood === "encouraging" || mood === "interviewer-encouraging") {
    return { kind: "partial", label: "Krid sees a good start", instruction: "One encouraging nod before the missing idea…", delay: 650 };
  }
  if (mood === "oops") {
    return { kind: "negative", label: "Krid wants another try", instruction: "No punishment—Krid is preparing a useful correction…", delay: 750 };
  }
  return null;
}

function companionBondName(xp) {
  if (xp >= 650) return "Memory legend";
  if (xp >= 350) return "Brain bandit";
  if (xp >= 140) return "Study buddy";
  return "New acquaintance";
}

function saveCompanionSession() {
  if (companionSession) localStorage.setItem(COMPANION_SAVE_KEY, JSON.stringify(companionSession));
}

function loadCompanionSession() {
  try {
    const saved = JSON.parse(localStorage.getItem(COMPANION_SAVE_KEY));
    return saved?.version === 3 && saved?.messages?.length && saved?.sourceText !== undefined ? saved : null;
  } catch {
    return null;
  }
}

function renderCompanionMessages() {
  // Voice-only by design: session messages are never rendered as written chat.
}

function renderCompanionBrain() {
  const session = companionSession;
  const enabled = Boolean(session);
  const canListen = enabled && Boolean(companionRecognition) && "speechSynthesis" in window && !companionBusy && !companionSpeaking;
  companionUI.mic.disabled = !canListen;
  companionUI.repeat.disabled = !enabled || companionBusy || companionSpeaking || !session?.messages?.some((message) => message.role === "krid");
  companionUI.export.disabled = !enabled;
  companionUI.reset.disabled = !enabled;
  if (!session) {
    companionUI.bondTitle.textContent = "New acquaintance";
    companionUI.bondXp.textContent = "0 bond XP";
    companionUI.turns.textContent = "0";
    companionUI.average.textContent = "0%";
    companionUI.concepts.textContent = "0";
    companionUI.brainStatus.textContent = "Waiting for material";
    companionUI.brainMap.innerHTML = "";
    companionUI.dark.disabled = true;
    companionUI.dark.textContent = "LOCKED";
    return;
  }
  const concepts = session.mastery || [];
  const average = concepts.length ? Math.round(concepts.reduce((sum, item) => sum + item.score, 0) / concepts.length) : 0;
  companionUI.bondTitle.textContent = companionBondName(session.xp);
  companionUI.bondXp.textContent = `${session.xp} bond XP`;
  companionUI.turns.textContent = session.turns;
  companionUI.average.textContent = `${average}%`;
  companionUI.concepts.textContent = concepts.length;
  companionUI.brainStatus.textContent = average >= 70 ? "Crystal looking suspiciously powerful" : average >= 35 ? "Neurons under construction" : "Mostly decorative—for now";
  companionUI.brainMap.innerHTML = concepts.map((item, index) => `
    <div class="brain-concept ${item.score >= 70 ? "strong" : item.score < 35 ? "weak" : ""}">
      <div><span>${companionEscape(item.term)}</span><b>${item.score}%</b></div>
      <i><span style="width:${item.score}%"></span></i><small>${item.attempts || 0} conversation check${item.attempts === 1 ? "" : "s"}</small>
    </div>`).join("");
  const unlocked = session.attempts >= 3 && concepts.length >= 2;
  companionUI.dark.disabled = !unlocked || session.dark?.active;
  companionUI.dark.textContent = session.dark?.active ? "FIGHTING" : unlocked ? "CHALLENGE" : `${Math.max(0, 3 - session.attempts)} CHECKS LEFT`;
}

function renderCompanionSession() {
  renderCompanionMessages();
  renderCompanionBrain();
}

function selectKridFemaleVoice(voices) {
  const femaleNames = /\b(female|samantha|zira|victoria|karen|moira|tessa|fiona|serena|ava|allison|susan|zoe|joelle|kathy|vicki|hazel|aria|jenny|sonia|libby|michelle|ana|emma|amy|nicole|olivia|salli|joanna|kendra|kimberly|ivy|ruth|matilda|freya|maisie|natasha|leah|jessica)\b/i;
  const maleNames = /\b(male|daniel|alex|fred|tom|ralph|bruce|david|mark|george|arthur|aaron|guy|ryan|brian|matthew|joey|justin|kevin|enrique|rishi)\b/i;
  return [...(voices || [])].map((voice) => {
    const descriptor = `${voice.name || ""} ${voice.voiceURI || ""}`;
    const english = /^en(?:[-_]|$)/i.test(voice.lang || "") || /\benglish\b/i.test(descriptor);
    if (!english || maleNames.test(descriptor)) return { voice, score: -1 };
    let score = femaleNames.test(descriptor) ? 100 : -1;
    // This was Krid's original clear Chrome voice; keep it consistent across hosted and local origins.
    if (/^Google US English$/i.test(voice.name || "")) score = 250;
    else if (score >= 0 && /\b(natural|premium)\b/i.test(descriptor)) score += 30;
    if (score >= 0 && /^en-US$/i.test(voice.lang || "")) score += 5;
    if (score >= 0 && voice.localService) score += 2;
    return { voice, score };
  }).filter((candidate) => candidate.score >= 0).sort((left, right) => right.score - left.score)[0]?.voice || null;
}

function speakCompanionText(text, voiceAttempt = 0) {
  if (!companionVoiceOn || !("speechSynthesis" in window)) {
    setCompanionVoiceStatus("Voice output unavailable", "Use Chrome or Edge on a device with speech synthesis.", "error");
    companionUI.mic.disabled = true;
    return;
  }
  const voices = speechSynthesis.getVoices();
  const femaleVoice = selectKridFemaleVoice(voices);
  if (!femaleVoice && voiceAttempt < 6) {
    const waitToken = ++companionSpeechToken;
    let retried = false;
    companionSpeaking = true;
    setCompanionVoiceStatus("Loading Krid's female voice…", "The browser is preparing its English voice list.", "thinking");
    renderCompanionBrain();
    const retryWithLoadedVoices = () => {
      if (retried || waitToken !== companionSpeechToken) return;
      retried = true;
      companionSpeaking = false;
      speakCompanionText(text, voiceAttempt + 1);
    };
    speechSynthesis.addEventListener?.("voiceschanged", retryWithLoadedVoices, { once: true });
    window.setTimeout(retryWithLoadedVoices, 300);
    return;
  }
  if (!femaleVoice) {
    companionSpeaking = false;
    setCompanionMood("confused", "female voice unavailable");
    companionUI.caption.innerHTML = "<small>VOICE ASSISTANT</small><strong>Female voice unavailable on this device</strong>";
    setCompanionVoiceStatus("Female voice unavailable", "Krid will not fall back to a male voice. Enable an English female system voice, then reload the app.", "error");
    renderCompanionBrain();
    return;
  }
  const speechToken = ++companionSpeechToken;
  speechSynthesis.cancel();
  companionSpeaking = true;
  setCompanionVoiceStatus("Krid is talking…", "Listen first. Your microphone unlocks when Krid finishes.", "talking");
  renderCompanionBrain();
  const utterance = new SpeechSynthesisUtterance(text.replace(/[↗⚡🧠🗝▣✦]/g, ""));
  utterance.rate = 1;
  utterance.pitch = 1.08;
  utterance.volume = 0.94;
  utterance.voice = femaleVoice;
  utterance.onstart = () => {
    setCompanionMood("talking", "talking");
    companionUI.caption.innerHTML = "<small>VOICE ASSISTANT</small><strong>Krid is speaking</strong>";
  };
  let finished = false;
  const finishSpeaking = () => {
    if (finished || speechToken !== companionSpeechToken) return;
    finished = true;
    companionSpeaking = false;
    if (companionRecognition) {
      setCompanionMood("happy", "your turn");
      companionUI.caption.innerHTML = "<small>VOICE ASSISTANT</small><strong>Your turn to speak</strong>";
      setCompanionVoiceStatus("Your turn", "Tap the microphone and answer aloud. You can also say ‘hint’ or ‘repeat’.", "ready");
    } else {
      setCompanionMood("confused", "no microphone");
      companionUI.caption.innerHTML = "<small>VOICE ASSISTANT</small><strong>Speech recognition unavailable</strong>";
      setCompanionVoiceStatus("Krid cannot hear this browser", "Open the app in Chrome or Edge and allow microphone access.", "error");
    }
    renderCompanionBrain();
  };
  utterance.onend = finishSpeaking;
  utterance.onerror = finishSpeaking;
  // Give cancel() a brief moment to release the previous audio buffer, preventing overlapping/echoed speech.
  window.setTimeout(() => {
    if (speechToken !== companionSpeechToken) return;
    speechSynthesis.resume?.();
    speechSynthesis.speak(utterance);
  }, 45);
}

function setCompanionQuickPrompts() {
  // Spoken commands replace written suggestion chips.
}

function addCompanionMessage(role, text, options = {}) {
  if (!companionSession) return;
  companionSession.messages.push({ role, text, at: Date.now(), ...(options.score !== undefined ? { score: options.score } : {}) });
  companionSession.messages = companionSession.messages.slice(-80);
  if (role === "krid") {
    const mood = options.mood || "happy";
    const reaction = companionReactionForMood(mood);
    setCompanionMood(mood, reaction?.kind || options.mood || "ready");
    if (reaction) {
      window.clearTimeout(companionReactionTimer);
      companionBusy = true;
      companionUI.caption.innerHTML = `<small>KRID REACTS</small><strong>${companionEscape(reaction.label)}</strong>`;
      setCompanionVoiceStatus(reaction.label, reaction.instruction, reaction.kind);
      companionReactionTimer = window.setTimeout(() => {
        companionReactionTimer = 0;
        companionBusy = false;
        if (companionSession) speakCompanionText(text);
      }, reaction.delay);
    } else {
      speakCompanionText(text);
    }
    setCompanionQuickPrompts();
  }
  saveCompanionSession();
  renderCompanionSession();
}

function companionThinkThen(text, options = {}) {
  companionBusy = true;
  setCompanionMood("thinking", "thinking");
  companionUI.caption.innerHTML = "<small>VOICE ASSISTANT</small><strong>Krid is thinking</strong>";
  setCompanionVoiceStatus("Krid is thinking…", "Your answer is being checked against the learning material.", "thinking");
  renderCompanionBrain();
  window.setTimeout(() => {
    companionBusy = false;
    addCompanionMessage("krid", text, options);
  }, options.delay ?? 420);
}

function updateCompanionMastery(index, result, mode = companionSession.mode) {
  const item = companionSession.mastery[index];
  if (!item) return;
  item.attempts += 1;
  item.lastScore = result.score;
  const gain = result.score >= 70 ? (mode === "memory" || mode === "boss" ? 28 : 22) : result.score >= 40 ? 10 : 3;
  item.score = companionClamp(Math.round(item.score * 0.55 + result.score * 0.45 + gain), 0, 100);
  companionSession.attempts += 1;
  companionSession.totalScore += result.score;
  companionSession.xp += Math.max(4, Math.round(result.score / 3));
}

function shuffledCompanionIndices(count) {
  const indices = Array.from({ length: count }, (_, index) => index);
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [indices[index], indices[swap]] = [indices[swap], indices[index]];
  }
  return indices;
}

function nextCompanionFactIndex(preferWeak = false) {
  const total = companionSession.facts.length;
  if (total <= 1) return 0;
  companionSession.recentFacts ||= [];
  companionSession.factDeck ||= [];
  const recent = new Set(companionSession.recentFacts.slice(-Math.min(3, total - 1)));
  let chosen;
  if (preferWeak) {
    const ranked = companionSession.mastery.map((item, index) => ({ index, score: item.score, attempts: item.attempts || 0 }))
      .filter((item) => !recent.has(item.index))
      .sort((left, right) => left.score - right.score || left.attempts - right.attempts);
    const pool = ranked.slice(0, Math.max(1, Math.ceil(ranked.length / 3)));
    chosen = pool[Math.floor(Math.random() * pool.length)]?.index;
  } else {
    companionSession.factDeck = companionSession.factDeck.filter((index) => index < total && !recent.has(index));
    if (!companionSession.factDeck.length) companionSession.factDeck = shuffledCompanionIndices(total).filter((index) => !recent.has(index));
    chosen = companionSession.factDeck.shift();
  }
  if (!Number.isInteger(chosen)) chosen = shuffledCompanionIndices(total).find((index) => !recent.has(index)) ?? 0;
  companionSession.recentFacts.push(chosen);
  companionSession.recentFacts = companionSession.recentFacts.slice(-4);
  return chosen;
}

function nextCompanionInterviewIndex(preferWeak = false) {
  const total = companionSession.interviewQuestions.length;
  if (total <= 1) return 0;
  companionSession.recentInterviews ||= [];
  companionSession.interviewDeck ||= [];
  const recent = new Set(companionSession.recentInterviews.slice(-Math.min(2, total - 1)));
  let chosen;
  if (preferWeak && companionSession.mastery.length) {
    const ranked = companionSession.mastery.map((item, index) => ({ index, score: item.score })).filter((item) => item.index < total && !recent.has(item.index)).sort((a, b) => a.score - b.score);
    const pool = ranked.slice(0, Math.max(1, Math.ceil(ranked.length / 2)));
    chosen = pool[Math.floor(Math.random() * pool.length)]?.index;
  } else {
    companionSession.interviewDeck = companionSession.interviewDeck.filter((index) => index < total && !recent.has(index));
    if (!companionSession.interviewDeck.length) companionSession.interviewDeck = shuffledCompanionIndices(total).filter((index) => !recent.has(index));
    chosen = companionSession.interviewDeck.shift();
  }
  if (!Number.isInteger(chosen)) chosen = shuffledCompanionIndices(total).find((index) => !recent.has(index)) ?? 0;
  companionSession.recentInterviews.push(chosen);
  companionSession.recentInterviews = companionSession.recentInterviews.slice(-3);
  return chosen;
}

function askKridForTeaching(index, prefix = "", options = {}) {
  const fact = companionSession.facts[index];
  companionSession.factCursor = index;
  companionSession.pending = { kind: "teach", factIndex: index };
  companionThinkThen(`${prefix}${fact.question || companionQuestionForFact(fact)} Explain it in your own words; I am clever, curious, and legally prohibited from reading your mind.`, { mood: "curious", quick: ["Give me a hint", "Say that again"], ...options });
}

function askKridForMemory(index, prefix = "", options = {}) {
  const fact = companionSession.facts[index];
  companionSession.factCursor = index;
  companionSession.pending = { kind: "memory", factIndex: index };
  companionThinkThen(`${prefix}Without looking at the notes: ${fact.question || companionQuestionForFact(fact)}`, { mood: "curious", quick: ["Give me a hint", "I don't remember", "Say that again"], ...options });
}

function askKridInterview(index, prefix = "", options = {}) {
  const questions = companionSession.interviewQuestions;
  const questionIndex = index % questions.length;
  companionSession.interviewCursor = questionIndex;
  companionSession.pending = { kind: "interview", questionIndex };
  const question = questions[questionIndex];
  companionThinkThen(`${prefix}${question.q}`, { mood: "interviewer", quick: ["Give me a hint", "Show model answer", "Say that again"], ...options });
}

function handleCompanionCommand(raw) {
  const command = raw.toLowerCase().trim();
  if (/start a new session|new session/.test(command)) {
    resetCompanionExperience();
    companionUI.error.textContent = "Choose a mode and wake Krid when you are ready.";
    return true;
  }
  if (/say that again|repeat/.test(command)) {
    const previous = [...companionSession.messages].reverse().find((message) => message.role === "krid");
    companionThinkThen(previous?.text || "I was dramatically silent. There is nothing to repeat.", { mood: "curious", quick: ["Give me a hint"] });
    return true;
  }
  if (companionSession.mode === "interview") {
    const modelRequest = raw.match(/^(?:how (?:should|do) i answer|give me (?:a )?model answer for|answer this(?: question)?)[\s:,-]+(.+)/i);
    if (modelRequest) {
      const queryTokens = new Set(companionTokens(modelRequest[1]));
      const nearest = companionSession.interviewQuestions.map((question) => ({
        question,
        score: companionTokens(question.q).filter((word) => queryTokens.has(word)).length
      })).sort((a, b) => b.score - a.score)[0];
      const guidance = nearest?.score > 0
        ? nearest.question.model
        : "State your main point clearly, explain the reason, prove it with one specific example, describe the result, and connect it to the role.";
      companionThinkThen(`For the question, ${modelRequest[1]}, use this answer map. ${guidance} Now say your answer aloud in your own words.`, { mood: "helpful" });
      return true;
    }
    const customPractice = raw.match(/^(?:ask me|practice question)[\s:,-]+(.+)/i);
    if (customPractice && !/^to explain\b/i.test(customPractice[1])) {
      const custom = {
        q: customPractice[1].replace(/[.?!]+$/, "") + "?",
        keywords: ["example", "reason", "action", "result", "impact"],
        model: "State the main point, explain your reasoning, give a specific example, describe the result, and connect it to the role.",
        follow: "Which detail gives the interviewer the strongest evidence?",
        generic: true
      };
      companionSession.interviewQuestions.push(custom);
      askKridInterview(companionSession.interviewQuestions.length - 1, "Custom question loaded. Professional eyebrow recalibrated. ");
      return true;
    }
  }
  if (/\b(?:i )?(?:do not know|don't know|do not remember|don't remember|cannot remember|can't remember|have no idea|no idea|not sure)\b/.test(command) && companionTokens(command).length <= 4 && companionSession.pending && companionSession.pending.kind !== "boss") {
    const pending = companionSession.pending;
    if (pending.kind === "interview") {
      const question = companionSession.interviewQuestions[pending.questionIndex];
      const noRecall = { score: 0, matched: [], missing: question.keywords, matchedIdeas: [], missingIdeas: question.keywords, coverage: 0, grade: "weak" };
      updateCompanionMastery(pending.questionIndex % companionSession.mastery.length, noRecall, "interview");
      companionSession.messages[companionSession.messages.length - 1].score = 0;
      companionThinkThen(`No problem. Here is the complete model answer, not just a hint. ${question.model} I will keep the same interview question ready so you can answer it later in your own words.`, { mood: "helpful" });
      return true;
    }
    const fact = companionSession.facts[pending.factIndex];
    const noRecall = { score: 0, matched: [], missing: companionTokens(fact.definition), matchedIdeas: [], missingIdeas: fact.keyPoints?.map((point) => point.term) || [], coverage: 0, grade: "weak" };
    updateCompanionMastery(pending.factIndex, noRecall, pending.kind === "teach" ? "teach" : "memory");
    companionSession.messages[companionSession.messages.length - 1].score = 0;
    const completeAnswer = companionCompleteAnswer(fact);
    const next = nextCompanionFactIndex();
    if (pending.kind === "teach") askKridForTeaching(next, `No problem. Here is the complete answer from your notes: ${completeAnswer} I will bring ${fact.term} back later instead of making you repeat it immediately. New shuffled question: `);
    else askKridForMemory(next, `No problem. Here is the complete answer from your notes: ${completeAnswer} I marked ${fact.term} for spaced review. New shuffled question: `);
    return true;
  }
  if (/\bhint\b/.test(command) && companionSession.pending) {
    const pending = companionSession.pending;
    let hint;
    if (pending.kind === "interview") {
      const question = companionSession.interviewQuestions[pending.questionIndex];
      hint = `Build your answer around: ${question.keywords.slice(0, 4).join(", ")}. I have placed the clue here and definitely not eaten it.`;
    } else {
      const fact = companionSession.facts[pending.factIndex];
      const clue = fact.keyPoints?.[0]?.definition || companionSemanticUnits(fact.definition)[0] || fact.definition;
      hint = `A grounded clue from your notes is: ${clue} Now connect that clue to the question in your own words.`;
    }
    companionSession.xp += 2;
    companionThinkThen(hint, { mood: "helpful", quick: ["Say that again"] });
    return true;
  }
  if (/show model answer|show answer/.test(command) && companionSession.pending?.kind === "interview") {
    const question = companionSession.interviewQuestions[companionSession.pending.questionIndex];
    companionThinkThen(`Here is a model answer map. ${question.model} Listen to it, then answer again aloud in your own words. Copying my sentence would make us both suspicious.`, { mood: "helpful", quick: ["Say that again", "Next interview question"] });
    return true;
  }
  if (/ask me to explain|let me explain/.test(command) && companionSession.facts.length) {
    askKridForTeaching(nextCompanionFactIndex(), "Random teach-back challenge selected. ");
    return true;
  }
  if (/answer again|try again/.test(command) && companionSession.mode === "interview") {
    askKridInterview(companionSession.interviewCursor, "Same question, fresh attempt. I have reset the professional eyebrow. ");
    return true;
  }
  if (/quiz my weakest|weakest area|weakest memory/.test(command)) {
    if (companionSession.mode === "interview") askKridInterview(nextCompanionInterviewIndex(true), "Weak-area interview question selected. ");
    else {
      const weak = nextCompanionFactIndex(true);
      if (companionSession.mode === "teach") askKridForTeaching(weak, "Weak-area detector activated. ");
      else askKridForMemory(weak, "Weak-area detector activated. ");
    }
    return true;
  }
  if (/next interview|next challenge|next question|skip/.test(command)) {
    if (companionSession.mode === "interview") askKridInterview(nextCompanionInterviewIndex(), "Random question selected. Tie adjusted. Serious eyebrow activated. ");
    else if (companionSession.mode === "teach") askKridForTeaching(nextCompanionFactIndex(), "Random brain shelf selected. ");
    else askKridForMemory(nextCompanionFactIndex(), "Random memory door selected. ");
    return true;
  }
  return false;
}

function respondToTeaching(answer) {
  const pending = companionSession.pending;
  const fact = companionSession.facts[pending.factIndex];
  const result = evaluateCompanionResponse(answer, fact.definition, fact.term, companionSession.facts, fact);
  updateCompanionMastery(pending.factIndex, result, "teach");
  companionSession.messages[companionSession.messages.length - 1].score = result.score;
  if (result.score >= 68) {
    const next = nextCompanionFactIndex();
    const praise = ["My brain crystal just did a tiny backflip.", "That explanation has been accepted by the Department of Not Being Confusing.", "Excellent. Even my left eyebrow understood."][companionSession.turns % 3];
    companionSession.pending = null;
    const evidence = result.matchedIdeas?.slice(0, 2).join("; ") || fact.term;
    const remainder = result.missingIdeas?.length ? ` One additional point from your notes is: ${result.missingIdeas.slice(0, 2).join("; ")}.` : "";
    askKridForTeaching(next, `${praise} Your answer matches the notes on ${evidence}.${remainder} I shuffled the deck. Next question: `, { mood: "celebrating" });
  } else if (result.score >= 34) {
    const missing = result.missingIdeas?.slice(0, 2).join("; ") || fact.keyPoints?.[0]?.term || "the central relationship in the notes";
    const matched = result.matchedIdeas?.slice(0, 1).join("") || "part of the idea";
    companionThinkThen(`You are partly right: your answer connects with ${matched}. To make it complete, add this note-backed idea: ${missing}. Try the same question again. ${fact.question || companionQuestionForFact(fact)}`, { mood: "encouraging", quick: ["Give me a hint", "I'll try again"] });
  } else {
    const completeAnswer = companionCompleteAnswer(fact);
    const next = nextCompanionFactIndex();
    askKridForTeaching(next, `That answer does not match this concept, so I marked it for review. Here is the complete note-backed answer: ${completeAnswer} I will ask it again later. New shuffled question: `, { mood: "oops" });
  }
}

function respondToMemory(answer) {
  const pending = companionSession.pending;
  const fact = companionSession.facts[pending.factIndex];
  const result = evaluateCompanionResponse(answer, fact.definition, fact.term, companionSession.facts, fact);
  updateCompanionMastery(pending.factIndex, result, "memory");
  companionSession.messages[companionSession.messages.length - 1].score = result.score;
  const next = nextCompanionFactIndex(result.score < 34 && companionSession.attempts % 2 === 0);
  companionSession.factCursor = next;
  companionSession.pending = { kind: "memory", factIndex: next };
  if (result.score >= 68) {
    const evidence = result.matchedIdeas?.slice(0, 2).join("; ") || fact.term;
    const remainder = result.missingIdeas?.length ? ` One additional point from your notes is: ${result.missingIdeas.slice(0, 2).join("; ")}.` : "";
    askKridForMemory(next, `Memory unlocked. Your answer accurately covered ${evidence}.${remainder} I picked another concept from the shuffled deck. `, { mood: "celebrating" });
  } else if (result.score >= 34) {
    const missing = result.missingIdeas?.slice(0, 2).join("; ") || fact.keyPoints?.[0]?.term || "one supporting point";
    askKridForMemory(next, `Partial recall. You had the direction, but the notes also require: ${missing}. I will schedule that concept again later. New shuffled question: `, { mood: "encouraging" });
  } else {
    const completeAnswer = companionCompleteAnswer(fact);
    askKridForMemory(next, `That answer did not match the source, so I marked it for review. Here is the complete note-backed answer: ${completeAnswer} I will bring it back after another concept. `, { mood: "oops" });
  }
}

function respondToDiscussion(question) {
  if (/quiz|test me|ask me/.test(question.toLowerCase())) {
    companionSession.modeBeforeQuiz = "discuss";
    askKridForMemory(nextCompanionFactIndex(), "Discussion has become a shuffled ambush quiz. Delightful. ");
    return;
  }
  if (/what can we discuss|list (the )?topics/.test(question.toLowerCase())) {
    companionThinkThen(`Your note shelves contain: ${companionSession.facts.map((fact) => fact.term).join(", ")}. Pick one, or say “Quiz me” if you enjoy educational ambushes.`, { mood: "helpful", quick: ["Quiz me"] });
    return;
  }
  const ranked = rankRelevantCompanionFacts(question, companionSession.facts);
  const comparisonIntent = /\b(?:compare|difference|different|versus|vs\.?|both|advantages? and limitations?)\b/i.test(question);
  const strongMatches = ranked.filter((item) => item.score >= 1.4);
  if (comparisonIntent && strongMatches.length >= 2) {
    const [first, second] = strongMatches;
    companionSession.lastRelevantFact = first.index;
    [first.index, second.index].forEach((index) => {
      companionSession.mastery[index].score = companionClamp(companionSession.mastery[index].score + 4, 0, 100);
    });
    companionSession.xp += 8;
    companionThinkThen(`I found two relevant concepts in your notes. ${first.fact.term}: ${first.fact.definition} ${second.fact.term}: ${second.fact.definition} That comparison stays inside your source; ask me to quiz you on either one when you are ready.`, { mood: "helpful" });
    return;
  }
  const relevant = /explain more|tell me more/.test(question.toLowerCase()) && Number.isInteger(companionSession.lastRelevantFact)
    ? { fact: companionSession.facts[companionSession.lastRelevantFact], index: companionSession.lastRelevantFact, score: 2 }
    : ranked[0];
  if (!relevant || relevant.score < 1.4) {
    const topics = companionSession.facts.slice(0, 5).map((fact) => fact.term).join(", ");
    companionThinkThen(`I searched every shelf you gave me, including the shelf labelled “definitely not snacks.” I cannot ground that answer in your material. I can discuss: ${topics}.`, { mood: "confused", quick: ["Quiz me", "What can we discuss?"] });
    return;
  }
  const fact = relevant.fact;
  companionSession.lastRelevantFact = relevant.index;
  companionSession.mastery[relevant.index].score = companionClamp(companionSession.mastery[relevant.index].score + 5, 0, 100);
  companionSession.xp += 5;
  companionThinkThen(`I matched your question to ${fact.term}. According to your notes: ${fact.definition} If you want retrieval practice on this exact idea, say, quiz me.`, { mood: "helpful", quick: ["Quiz me", "Explain more", "Ask another question"] });
}

function respondToInterview(answer) {
  const pending = companionSession.pending;
  const question = companionSession.interviewQuestions[pending.questionIndex];
  const expected = `${question.keywords.join(" ")} ${question.model}`;
  const groundingFacts = companionSession.interviewQuestions.map((item) => item.sourceFact).filter(Boolean);
  const result = question.sourceFact
    ? evaluateCompanionResponse(answer, question.model, question.sourceTerm, groundingFacts, question.sourceFact)
    : evaluateCompanionResponse(answer, expected);
  const structureSignals = result.coverage >= 0.12 && /situation|task|action|result|first|then|finally|because|therefore|for example/i.test(answer) ? 8 : 0;
  const lengthSignal = result.coverage >= 0.2 && companionTokens(answer).length >= 18 ? 5 : 0;
  const semanticGrade = result.grade;
  result.score = companionClamp(result.score + structureSignals + lengthSignal, 0, 100);
  if (question.sourceFact?.kind === "list" && semanticGrade !== "strong") result.score = Math.min(result.score, 67);
  updateCompanionMastery(pending.questionIndex % companionSession.mastery.length, result, "interview");
  companionSession.messages[companionSession.messages.length - 1].score = result.score;
  const answerTokens = expandCompanionTokens(companionTokens(answer));
  const strengths = question.keywords.filter((keyword) => companionSemanticMatch(companionStem(keyword), answerTokens)).slice(0, 4);
  const gaps = question.keywords.filter((keyword) => !companionSemanticMatch(companionStem(keyword), answerTokens)).slice(0, 4);
  const groundedGaps = question.sourceFact ? result.missingIdeas?.slice(0, 3) || [] : [];
  companionSession.pending = null;
  if (result.score >= 68) {
    const sharpening = groundedGaps.length
      ? `One additional source point is ${groundedGaps.join("; ")}.`
      : `To make it sharper, add ${gaps.join(", ") || "one measurable result"}.`;
    companionThinkThen(`Strong answer. I heard evidence for ${strengths.join(", ") || "the main point and a clear example"}. Your score is ${result.score} out of 100. ${sharpening} Follow-up question: ${question.follow}`, { mood: "interviewer-happy", quick: ["Next interview question", "Let me answer again"] });
  } else if (result.score >= 34) {
    companionThinkThen(`Promising but incomplete. You included ${strengths.join(", ") || "a direct attempt"}, but I could not find ${groundedGaps.join("; ") || gaps.join(", ") || "specific evidence"}. A stronger answer structure is: ${question.model} Now say, let me answer again, or ask for the next random question.`, { mood: "interviewer-encouraging", quick: ["Next interview question", "Show model answer", "Let me answer again"] });
  } else {
    companionThinkThen(`I would not mark that interview answer as ready yet because it does not address ${gaps.join(", ") || question.keywords.slice(0, 3).join(", ")}. Use this grounded answer map: ${question.model} Then say, let me answer again.`, { mood: "oops", quick: ["Show model answer", "Let me answer again"] });
  }
}

function respondToDarkKrid(answer) {
  const dark = companionSession.dark;
  const conceptIndex = dark.queue[dark.cursor];
  const fact = companionSession.facts[conceptIndex];
  const result = evaluateCompanionResponse(answer, fact.definition, fact.term, companionSession.facts, fact);
  updateCompanionMastery(conceptIndex, result, "boss");
  companionSession.messages[companionSession.messages.length - 1].score = result.score;
  dark.total += result.score;
  dark.cursor += 1;
  const correction = result.score < 34 ? `That response did not match the notes. The complete answer is: ${companionCompleteAnswer(fact)}` : result.score < 68 ? `Partial answer. The missing idea is ${result.missingIdeas?.slice(0, 2).join("; ") || companionCompleteAnswer(fact)}` : `That answer is grounded and correct.${result.missingIdeas?.length ? ` One additional source point is ${result.missingIdeas.slice(0, 2).join("; ")}.` : ""}`;
  if (dark.cursor >= dark.queue.length) {
    const average = Math.round(dark.total / dark.queue.length);
    dark.active = false;
    dark.completed = true;
    companionUI.scene.classList.remove("dark-mode");
    companionSession.xp += average;
    companionSession.pending = null;
    companionThinkThen(`${correction} DARK KRID DEFEATED. Boss score: ${average}%. I have returned from the shadow realm with improved manners and several administrative complaints. Your weakest memories are now scheduled for review.`, { mood: "celebrating", quick: ["Quiz my weakest area", "Start a new session"] });
    return;
  }
  const nextIndex = dark.queue[dark.cursor];
  companionSession.pending = { kind: "boss", factIndex: nextIndex };
  const nextFact = companionSession.facts[nextIndex];
  const reactionMood = result.score >= 68 ? "celebrating" : result.score >= 34 ? "encouraging" : "oops";
  companionThinkThen(`${correction} ${result.score >= 68 ? "My shadow shield cracked." : "Dark Krid records that concept for review."} ${dark.queue.length - dark.cursor} memory shield${dark.queue.length - dark.cursor === 1 ? "" : "s"} remain. Next: ${nextFact.question || companionQuestionForFact(nextFact)}`, { mood: reactionMood, quick: ["Give me a hint"] });
}

function processCompanionMessage(text) {
  if (!companionSession || companionBusy) return;
  companionSession.turns += 1;
  addCompanionMessage("user", text);
  if (handleCompanionCommand(text)) return;
  const pending = companionSession.pending;
  if (companionSession.dark?.active && pending?.kind === "boss") return respondToDarkKrid(text);
  if (pending?.kind === "teach") return respondToTeaching(text);
  if (pending?.kind === "memory") return respondToMemory(text);
  if (pending?.kind === "interview") return respondToInterview(text);
  if (companionSession.mode === "discuss") return respondToDiscussion(text);
  if (companionSession.mode === "interview") return askKridInterview(nextCompanionInterviewIndex());
  if (companionSession.mode === "teach") return askKridForTeaching(nextCompanionFactIndex());
  return askKridForMemory(nextCompanionFactIndex());
}

function createCompanionSession(mode, facts, options = {}) {
  const interviewQuestions = mode === "interview" ? buildCompanionInterviewQuestions(options.track, options.customQuestion || "", options.answerNotes || "", options.role || "", options.interviewSource || "bank") : [];
  const conceptSource = mode === "interview"
    ? interviewQuestions.map((question, index) => ({ term: `Interview ${index + 1}`, definition: question.model }))
    : facts;
  return {
    version: 3, mode, topic: options.topic || options.role || "My learning quest", role: options.role || "", track: options.track || "", sourceText: options.sourceText || "",
    facts, interviewQuestions, messages: [], mastery: conceptSource.map((fact) => ({ term: fact.term, score: 0, attempts: 0, lastScore: 0 })),
    turns: 0, attempts: 0, totalScore: 0, xp: 0, factCursor: 0, interviewCursor: 0, pending: null,
    factDeck: shuffledCompanionIndices(facts.length), recentFacts: [], interviewDeck: shuffledCompanionIndices(interviewQuestions.length), recentInterviews: [],
    dark: { active: false, completed: false, queue: [], cursor: 0, total: 0 }, lastRelevantFact: null, createdAt: Date.now()
  };
}

function startCompanionConversation() {
  stopCompanionAudio();
  companionUI.error.textContent = "";
  const mode = companionMode;
  let facts = [];
  if (mode !== "interview") {
    facts = parseCompanionMaterial(companionUI.notes.value);
    if (facts.length < 2) {
      companionUI.error.textContent = "Give Krid at least two complete ideas or sentences. Any note format is fine.";
      companionUI.notes.focus();
      setCompanionMood("confused", "needs notes");
      return;
    }
  }
  if (mode === "interview" && !companionUI.role.value.trim()) {
    companionUI.error.textContent = "Tell Krid which role you are preparing for.";
    companionUI.role.focus();
    return;
  }
  companionSession = createCompanionSession(mode, facts, {
    topic: companionUI.topic.value.trim() || "My study material", role: companionUI.role.value.trim(), track: companionUI.track.value,
    customQuestion: companionUI.customQuestion.value, answerNotes: companionUI.notes.value || companionUI.answerNotes.value,
    interviewSource: companionUI.interviewSource.value, sourceText: companionUI.notes.value
  });
  companionUI.scene.classList.remove("dark-mode");
  companionUI.start.querySelector("span").textContent = "RESTART CONVERSATION";
  renderCompanionSession();
  if (mode === "teach") {
    askKridForTeaching(nextCompanionFactIndex(), `Hello. I am Krid: five neurons, excellent posture. I refined your notes into ${facts.length} concepts and picked one at random. `);
  } else if (mode === "memory") {
    askKridForMemory(nextCompanionFactIndex(), `Welcome to the Memory Vault. I organized your notes and shuffled the concepts, so serial memorizing cannot rescue you. `);
  } else if (mode === "discuss") {
    companionThinkThen(`I have read ${facts.length} ideas about ${companionSession.topic}. Ask me about them, ask me to quiz you, or explain one back to me. I will stay inside your supplied material—my imagination is on a responsible leash.`, { mood: "happy", quick: ["What can we discuss?", "Quiz me", "Ask me to explain something"] });
  } else {
    askKridInterview(nextCompanionInterviewIndex(), `Interview mode activated for ${companionSession.role}. I shuffled the interview deck and put on my professional eyebrows. You can answer, or say, how should I answer, followed by any interview question. `);
  }
  saveCompanionSession();
}

function launchDarkCompanion() {
  if (!companionSession || companionSession.attempts < 3 || companionSession.mastery.length < 2) return;
  const queue = companionSession.mastery.map((item, index) => ({ index, score: item.score })).sort((a, b) => a.score - b.score).slice(0, Math.min(4, companionSession.mastery.length)).map((item) => item.index);
  companionSession.dark = { active: true, completed: false, queue, cursor: 0, total: 0 };
  companionUI.scene.classList.add("dark-mode");
  const firstIndex = queue[0];
  const fact = companionSession.mode === "interview"
    ? { term: companionSession.interviewQuestions[firstIndex].q, definition: companionSession.interviewQuestions[firstIndex].model }
    : companionSession.facts[firstIndex];
  if (companionSession.mode === "interview") companionSession.facts = companionSession.interviewQuestions.map((question) => ({ term: question.q, definition: question.model, question: question.q, kind: "concept", keyPoints: companionSemanticUnits(question.model).map((part) => ({ term: companionIdeaLabel(part), definition: part })) }));
  companionSession.pending = { kind: "boss", factIndex: firstIndex };
  companionThinkThen(`I AM DARK KRID, assembled from your ${queue.length} weakest memories and one expired yoghurt. Boss shield one: explain “${fact.term}”.`, { mood: "dark", quick: ["Give me a hint"] });
}

function selectCompanionMode(button) {
  companionMode = button.dataset.companionMode;
  $$c("button[data-companion-mode]", companionUI.modes).forEach((item) => item.classList.toggle("selected", item === button));
  const interview = companionMode === "interview";
  companionUI.studyFields.hidden = false;
  companionUI.interviewFields.hidden = !interview;
  companionUI.error.textContent = "";
  setCompanionMood(interview ? "interviewer" : "idle", interview ? "interviewer" : "idle");
}

function openCompanionExperience() {
  showScreen("companion");
  const saved = loadCompanionSession();
  if (saved && !companionSession) {
    companionSession = saved;
    companionMode = saved.mode;
    $$c("button[data-companion-mode]", companionUI.modes).forEach((button) => button.classList.toggle("selected", button.dataset.companionMode === companionMode));
    companionUI.studyFields.hidden = false;
    companionUI.interviewFields.hidden = companionMode !== "interview";
    companionUI.start.querySelector("span").textContent = "RESTART CONVERSATION";
    renderCompanionSession();
    setCompanionMood(saved.dark?.active ? "dark" : "happy", saved.dark?.active ? "dark krid" : "welcome back");
    if (saved.dark?.active) companionUI.scene.classList.add("dark-mode");
    const last = [...saved.messages].reverse().find((message) => message.role === "krid");
    if (last) speakCompanionText(`Welcome back. ${last.text}`);
  } else {
    renderCompanionSession();
    if (companionSession?.messages?.length) {
      const last = [...companionSession.messages].reverse().find((message) => message.role === "krid");
      if (last) speakCompanionText(`Welcome back. ${last.text}`);
    } else {
      setCompanionVoiceStatus("Wake Krid to begin", "Choose a mode and topic, then press Wake Krid Up.", "idle");
    }
  }
}

function resetCompanionExperience() {
  stopCompanionAudio();
  companionSession = null;
  localStorage.removeItem(COMPANION_SAVE_KEY);
  COMPANION_LEGACY_SAVE_KEYS.forEach((key) => localStorage.removeItem(key));
  companionUI.caption.innerHTML = "<small>VOICE ASSISTANT</small><strong>Voice session not started</strong>";
  companionUI.start.querySelector("span").textContent = "WAKE KRID UP";
  companionUI.scene.classList.remove("dark-mode");
  setCompanionMood("idle", "idle");
  setCompanionQuickPrompts();
  setCompanionVoiceStatus("Wake Krid to begin", "Choose a mode and topic, then press Wake Krid Up.", "idle");
  renderCompanionBrain();
}

function speakCompanionSummary() {
  if (!companionSession) return;
  const average = companionSession.attempts ? Math.round(companionSession.totalScore / companionSession.attempts) : 0;
  const ranked = [...companionSession.mastery].sort((a, b) => a.score - b.score);
  const weakest = ranked.filter((item) => item.attempts > 0).slice(0, 2).map((item) => item.term);
  const nextStep = weakest.length
    ? `Your best next step is to practise ${weakest.join(" and ")}.`
    : "Complete one spoken challenge and I will identify what to practise next.";
  speakCompanionText(`Progress report. We have completed ${companionSession.turns} spoken turns. Your average response score is ${average} percent, and our bond is ${companionBondName(companionSession.xp)}. ${nextStep}`);
}

function companionIsSpeechEcho(transcript) {
  if (!companionSession || companionTokens(transcript).length < 5) return false;
  const lastKrid = [...companionSession.messages].reverse().find((message) => message.role === "krid");
  if (!lastKrid) return false;
  const transcriptTokens = companionTokens(transcript);
  const spokenTokens = expandCompanionTokens(companionTokens(lastKrid.text));
  return companionCoverage(transcriptTokens, spokenTokens).ratio >= 0.78;
}

function companionTranscriptFitness(transcript) {
  if (!companionSession) return 0;
  if (/\b(?:hint|repeat|next question|next challenge|don't know|do not know|no idea|show answer|quiz me)\b/i.test(transcript)) return 120;
  const pending = companionSession.pending;
  if (pending?.kind === "interview") {
    const question = companionSession.interviewQuestions[pending.questionIndex];
    return evaluateCompanionResponse(transcript, question.model).score;
  }
  if (pending?.factIndex !== undefined) {
    const fact = companionSession.facts[pending.factIndex];
    return evaluateCompanionResponse(transcript, fact.definition, fact.term, companionSession.facts, fact).score;
  }
  if (companionSession.mode === "discuss") return Math.min(100, (rankRelevantCompanionFacts(transcript, companionSession.facts)[0]?.score || 0) * 10);
  return companionTokens(transcript).length;
}

function chooseCompanionTranscript(result) {
  const alternatives = Array.from(result || []).map((alternative) => ({
    text: alternative.transcript?.trim() || "",
    confidence: Number.isFinite(alternative.confidence) ? alternative.confidence : 0
  })).filter((alternative) => alternative.text && !companionIsSpeechEcho(alternative.text));
  return alternatives.map((alternative) => ({ ...alternative, fit: companionTranscriptFitness(alternative.text) + alternative.confidence * 8 }))
    .sort((left, right) => right.fit - left.fit)[0]?.text || "";
}

function initialiseCompanionVoice() {
  if (!("speechSynthesis" in window)) {
    companionUI.mic.disabled = true;
    companionUI.voiceSupport.textContent = "Voice output is unavailable in this browser. Open the app in Chrome or Edge.";
    setCompanionVoiceStatus("Voice output unavailable", "Open this page in Chrome or Edge to talk with Krid.", "error");
    return;
  }
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    companionUI.mic.disabled = true;
    companionUI.mic.title = "Voice input is not supported in this browser";
    companionUI.voiceSupport.textContent = "Voice-only mode cannot listen in this browser. Open the app in Chrome or Edge and allow microphone access.";
    setCompanionVoiceStatus("Microphone connection unavailable", "Open this page in Chrome or Edge to talk with Krid.", "error");
    return;
  }
  companionRecognition = new Recognition();
  companionRecognition.lang = "en-US";
  companionRecognition.continuous = false;
  companionRecognition.interimResults = false;
  companionRecognition.maxAlternatives = 5;
  companionRecognition.onstart = () => {
    companionRecognitionHeard = false;
    companionUI.mic.classList.add("listening");
    companionUI.caption.innerHTML = "<small>VOICE ASSISTANT</small><strong>Listening to you</strong>";
    setCompanionMood("listening", "listening");
    setCompanionVoiceStatus("Listening…", "Speak naturally. Krid will answer when you stop.", "listening");
  };
  companionRecognition.onend = () => {
    companionUI.mic.classList.remove("listening");
    if (!companionRecognitionHeard && !companionBusy && !companionSpeaking) {
      setCompanionMood("confused", "try again");
      companionUI.caption.innerHTML = "<small>VOICE ASSISTANT</small><strong>No speech detected</strong>";
      setCompanionVoiceStatus("I didn't catch that", "Tap the microphone and try speaking again.", "error");
    }
    renderCompanionBrain();
  };
  companionRecognition.onresult = (event) => {
    if (companionRecognitionHeard) return;
    const transcript = chooseCompanionTranscript(event.results[event.resultIndex || 0]);
    companionRecognitionHeard = true;
    try { companionRecognition.stop(); } catch { /* recognition already ended */ }
    if (!transcript) {
      setCompanionMood("confused", "echo blocked");
      setCompanionVoiceStatus("Krid blocked an audio echo", "Tap the microphone and answer when the room is quiet.", "error");
      return;
    }
    setCompanionVoiceStatus("Krid heard you", "Thinking about your spoken answer…", "thinking");
    processCompanionMessage(transcript);
  };
  companionRecognition.onerror = (event) => {
    companionRecognitionHeard = true;
    const denied = event.error === "not-allowed" || event.error === "service-not-allowed";
    companionUI.voiceSupport.textContent = denied
      ? "Microphone access was blocked. Allow microphone permission in your browser, then try again."
      : "Voice capture stumbled. Tap the microphone and try again.";
    setCompanionVoiceStatus(denied ? "Microphone permission blocked" : "Voice connection stumbled", denied ? "Allow microphone access in the browser controls." : "Tap to try speaking again.", "error");
    renderCompanionBrain();
  };
  companionUI.voiceSupport.textContent = "No API key needed. Your browser handles speech recognition; its processing and privacy rules may vary.";
  renderCompanionBrain();
}

function bindCompanionEvents() {
  companionUI.open.addEventListener("click", openCompanionExperience);
  companionUI.exit.addEventListener("click", () => { saveCompanionSession(); stopCompanionAudio(); showScreen("landing"); });
  companionUI.modes.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-companion-mode]");
    if (button) selectCompanionMode(button);
  });
  companionUI.pack.addEventListener("change", () => loadCompanionPack(companionUI.pack.value));
  $c("#loadCompanionDemo").addEventListener("click", () => {
    loadCompanionPack("cells");
    setCompanionMood("celebrating", "demo loaded");
  });
  companionUI.start.addEventListener("click", startCompanionConversation);
  companionUI.mic.addEventListener("click", () => {
    if (!companionRecognition || companionBusy || companionSpeaking || !companionSession) return;
    companionRecognitionHeard = false;
    try {
      companionRecognition.start();
    } catch {
      setCompanionVoiceStatus("Already listening", "Speak now—Krid's ears are glowing.", "listening");
    }
  });
  companionUI.repeat.addEventListener("click", () => {
    if (!companionSession || companionBusy || companionSpeaking) return;
    const last = [...companionSession.messages].reverse().find((message) => message.role === "krid");
    if (last) speakCompanionText(last.text);
  });
  companionUI.dark.addEventListener("click", launchDarkCompanion);
  companionUI.export.addEventListener("click", speakCompanionSummary);
  companionUI.reset.addEventListener("click", resetCompanionExperience);
}

function initKridCompanion() {
  COMPANION_LEGACY_SAVE_KEYS.forEach((key) => localStorage.removeItem(key));
  loadCompanionPack("cells");
  bindCompanionEvents();
  initialiseCompanionVoice();
  renderCompanionBrain();
}

window.KRID_SEMANTIC_ENGINE = { parseCompanionMaterial, evaluateCompanionResponse, findRelevantCompanionFact, buildCompanionInterviewQuestions, createCompanionSession, getCompanionPack, companionCompleteAnswer, companionReactionForMood, companionMoodDescription, selectKridFemaleVoice };
window.KRID_COMPANION_TEST = window.KRID_SEMANTIC_ENGINE;
initKridCompanion();
