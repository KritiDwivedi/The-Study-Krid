"use strict";

const SAVE_KEY = "the-study-krid-save-v2";
const LEGACY_SAVE_KEYS = ["the-study-krid-save-v1"];
const REPORT_KEY = "the-study-krid-last-report-v1";
const WORLDS = window.KRID_WORLDS || {};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const ui = {
  landing: $("#landingScreen"), companion: $("#companionScreen"), game: $("#gameScreen"), report: $("#reportScreen"),
  worldGrid: $("#worldGrid"), worldTab: $("#worldTab"), notesTab: $("#notesTab"),
  worldPanel: $("#worldPanel"), notesPanel: $("#notesPanel"), notesInput: $("#notesInput"),
  noteCounter: $("#noteCounter"), builderError: $("#builderError"), launch: $("#launchButton"),
  moreWorldsButton: $("#moreWorldsButton"), topicAtlas: $("#topicAtlas"),
  topicSearch: $("#topicSearch"), atlasResults: $("#atlasResults"), categoryChips: $("#categoryChips"),
  buildTopicButton: $("#buildTopicButton"), weakReviewLandingButton: $("#weakReviewLandingButton"),
  continueButton: $("#continueButton"), continueTitle: $("#continueTitle"),
  gradeSelector: $("#gradeSelector"), difficultySelector: $("#difficultySelector"),
  stageViewport: $("#stageViewport"), routeMap: $("#routeMap"), coachMessage: $("#coachMessage"),
  masteryList: $("#masteryList"), masteryAverage: $("#masteryAverage"),
  stageTag: $("#stageTag"), currentMission: $("#currentMission"), routeProgress: $("#routeProgress"),
  routeProgressBar: $("#routeProgressBar"), streakCount: $("#streakCount"), streakBadge: $("#streakBadge"),
  worldBadge: $("#worldBadge"), worldSubject: $("#worldSubject"), worldTitle: $("#worldTitle"),
  xpBar: $("#xpBar"), xpText: $("#xpText"), levelNumber: $("#levelNumber"),
  energyCount: $("#energyCount"), coinCount: $("#coinCount"), inventoryCount: $("#inventoryCount"),
  inventorySlots: $("#inventorySlots"), helpModal: $("#helpModal"), toast: $("#toast"),
  confettiLayer: $("#confettiLayer"), soundButton: $("#soundButton")
};

const setup = { mode: "world", world: "fractions", grade: "Scholar", difficulty: "Bold", atlasCategory: "All", atlasTopic: "" };
let state = null;
let activeSince = Date.now();
let toastTimer = 0;

const TOPIC_GROUPS = {
  Mathematics: ["Algebraic expressions", "Linear equations", "Quadratic equations", "Geometry", "Trigonometry", "Probability", "Statistics", "Calculus", "Ratios and proportions", "Prime numbers", "Sets", "Functions", "Matrices", "Vectors", "Coordinate geometry", "Sequences and series", "Logarithms", "Combinatorics", "Number theory", "Mathematical induction"],
  Biology: ["Cell biology", "Genetics", "Evolution", "Ecology", "Human nervous system", "Circulatory system", "Immunity", "Plant reproduction", "Microbiology", "DNA replication", "Respiration", "Photosynthesis", "Endocrine system", "Digestive system", "Skeletal system", "Biodiversity", "Biotechnology", "Homeostasis", "Protein synthesis", "Natural selection"],
  Physics: ["Newton's laws of motion", "Energy", "Electricity", "Magnetism", "Waves", "Optics", "Thermodynamics", "Gravity", "Atomic physics", "Simple machines", "Momentum", "Pressure", "Fluid mechanics", "Electromagnetic induction", "Sound", "Radioactivity", "Relativity", "Quantum mechanics", "Projectile motion", "Circular motion"],
  Chemistry: ["Atomic structure", "Periodic table", "Chemical bonding", "Acids and bases", "Stoichiometry", "Organic chemistry", "Reaction rates", "Electrochemistry", "Solutions", "States of matter", "Chemical equilibrium", "Redox reactions", "Mole concept", "Polymers", "Hydrocarbons", "Metals and non-metals", "Gas laws", "Thermochemistry", "Nuclear chemistry", "Separation techniques"],
  "Earth & Space": ["Solar System", "Stars", "Galaxies", "Plate tectonics", "Rock cycle", "Water cycle", "Weather systems", "Oceans", "Earthquakes", "Space exploration", "Moon", "Sun", "Exoplanets", "Black holes", "Cosmology", "Atmosphere", "Volcanoes", "Fossils", "Climate change", "Renewable energy"],
  History: ["Ancient Egypt", "Indus Valley Civilisation", "Ancient Greece", "Roman Empire", "Renaissance", "Industrial Revolution", "World War I", "World War II", "Indian independence movement", "Cold War", "Mesopotamia", "Maurya Empire", "Gupta Empire", "Mughal Empire", "French Revolution", "American Revolution", "Age of Exploration", "Civil rights movement", "Decolonisation", "History of printing"],
  Geography: ["Continents and oceans", "Rivers", "Mountains", "Population geography", "Urbanisation", "Agriculture", "Natural resources", "Map skills", "Globalisation", "Sustainable development", "Deserts", "Forests", "Migration", "Transport geography", "Economic geography", "Political geography", "Soil", "Coasts", "Glaciers", "Disaster management"],
  Computing: ["Computer hardware", "Operating systems", "Computer networks", "Internet", "Cybersecurity", "Algorithms", "Data structures", "Databases", "Artificial intelligence", "Web development", "Cloud computing", "Machine learning", "Programming languages", "Software testing", "Version control", "Computer graphics", "Cryptography", "Robotics", "Mobile applications", "Human-computer interaction"],
  Language: ["Parts of speech", "Sentence structure", "Active and passive voice", "Figures of speech", "Essay writing", "Reading comprehension", "Vocabulary", "Punctuation", "Story structure", "Public speaking", "Tenses", "Subject-verb agreement", "Poetry analysis", "Persuasive writing", "Research writing", "Debate", "Media literacy", "Grammar", "Summarising", "Creative writing"],
  Economics: ["Supply and demand", "Inflation", "Gross domestic product", "Market structures", "Money and banking", "International trade", "Fiscal policy", "Monetary policy", "Opportunity cost", "Personal budgeting", "Unemployment", "Economic growth", "Exchange rates", "Taxation", "Public goods", "Behavioural economics", "Development economics", "Labour markets", "Entrepreneurship", "Compound interest"],
  Psychology: ["Memory", "Learning", "Motivation", "Emotion", "Cognitive biases", "Social psychology", "Developmental psychology", "Stress", "Sleep", "Decision making", "Attention", "Perception", "Personality", "Intelligence", "Language development", "Mental health", "Group behaviour", "Problem solving", "Classical conditioning", "Operant conditioning"],
  Civics: ["Democracy", "Constitution", "Separation of powers", "Fundamental rights", "Elections", "Local government", "Judiciary", "Citizenship", "Public policy", "United Nations", "Parliament", "Federalism", "Rule of law", "Human rights", "Media and democracy", "Political parties", "Civil society", "Public administration", "International relations", "Environmental law"]
};

const TOPIC_LIBRARY = Object.entries(TOPIC_GROUPS).flatMap(([category, topics]) => topics.map((title) => ({ title, category })));

class KridAudio {
  constructor() {
    this.enabled = true;
    this.context = null;
  }

  ensure() {
    if (!this.enabled) return null;
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.context = new AudioContext();
    }
    if (this.context?.state === "suspended") this.context.resume();
    return this.context;
  }

  tone(frequency = 440, duration = 0.08, type = "sine", volume = 0.035, delay = 0) {
    const context = this.ensure();
    if (!context) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const start = context.currentTime + delay;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  click() { this.tone(330, 0.055, "triangle", 0.025); }
  correct() { this.tone(523, 0.12, "sine", 0.04); this.tone(659, 0.15, "sine", 0.035, 0.08); this.tone(784, 0.2, "sine", 0.03, 0.16); }
  wrong() { this.tone(170, 0.16, "sawtooth", 0.025); this.tone(130, 0.18, "sawtooth", 0.018, 0.09); }
  unlock() { this.tone(440, 0.08, "square", 0.02); this.tone(880, 0.18, "sine", 0.03, 0.07); }
  victory() { [392, 523, 659, 784].forEach((note, index) => this.tone(note, 0.28, "triangle", 0.035, index * 0.12)); }
}

const audio = new KridAudio();

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function clamp(number, min, max) { return Math.min(max, Math.max(min, number)); }

function shuffled(values) {
  const copy = [...values];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swap]] = [copy[swap], copy[index]];
  }
  return copy;
}

function difficultyConfig(name) {
  return {
    Chill: { energy: 7, multiplier: 0.9 },
    Bold: { energy: 5, multiplier: 1 },
    Brainstorm: { energy: 4, multiplier: 1.25 }
  }[name] || { energy: 5, multiplier: 1 };
}

function titleCase(value) {
  return value.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function conceptLabel(sentence, index, used) {
  const clean = sentence.replace(/^[\s#>*•\-–—\d.)]+/, "").trim();
  const relation = clean.match(/^(.{2,72}?)\s+(?:is|are|was|were|will be|means|refers to|describes|involves|contains|includes|uses|causes|allows|helps|occurs|happens)\b/i);
  let label = relation?.[1]?.replace(/^(the|a|an)\s+/i, "").trim();
  if (!label || label.split(/\s+/).length > 8) {
    const beforeComma = clean.split(/[,;:]/)[0].trim();
    label = beforeComma.split(/\s+/).slice(0, 6).join(" ");
  }
  const generic = /^(it|this|they|these|those|tournament|process|system|event)$/i;
  if (!label || generic.test(label) || used.has(label.toLowerCase())) {
    const stop = new Set(["the", "a", "an", "and", "or", "but", "to", "of", "in", "on", "at", "for", "from", "with", "by", "is", "are", "was", "were", "will", "be", "has", "have", "had", "this", "that", "it", "they", "its", "their", "which", "as"]);
    const keywords = clean.replace(/[^\p{L}\p{N}\s'-]/gu, " ").split(/\s+/).filter((word) => word.length > 2 && !stop.has(word.toLowerCase()));
    label = keywords.slice(0, 4).join(" ") || `Key idea ${index + 1}`;
  }
  label = titleCase(label.slice(0, 72));
  used.add(label.toLowerCase());
  return label;
}

function questTermIsVague(term) {
  const clean = String(term || "").replace(/[.:]+$/, "").trim();
  return !clean
    || /^(?:it|this|that|these|those|they|this (?:behaviou?r|approach|process|method|technique|system)|these controls?|those controls?|the above|key idea \d+)$/i.test(clean)
    || /^(?:explain|describe|discuss|statement|sentence|notes?)$/i.test(clean);
}

function resolveQuestCoreference(term, definition) {
  let refined = String(definition || "").replace(/\s+/g, " ").trim();
  refined = refined.replace(/(^|;\s*)These controls\s+(?=(?:are|can|typically|usually|often)\b)/gi, `$1Under ${term}, controls `);
  refined = refined.replace(/(^|;\s*)Those controls\s+(?=(?:are|can|typically|usually|often)\b)/gi, `$1Under ${term}, controls `);
  refined = refined.replace(/^This (?:behaviou?r|approach|process|method|technique|system)\s+(?=(?:is|are|can|occurs?|arises?|uses?|helps?|requires?)\b)/i, `${term} `);
  refined = refined.replace(/^It\s+(?=(?:is|are|can|occurs?|arises?|uses?|helps?|requires?|measures?|captures?)\b)/i, `${term} `);
  refined = refined.replace(/^They\s+(?=(?:are|can|use|help|require|measure|capture)\b)/i, `${term} `);
  return refined;
}

function questDefinitionIsUseful(term, definition) {
  const cleanTerm = String(term || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  const cleanDefinition = String(definition || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
  return !questTermIsVague(term)
    && String(definition || "").trim().length >= 20
    && cleanDefinition !== cleanTerm
    && !/^(?:heading|title|topic|section)\b/i.test(String(definition || "").trim());
}

function semanticQuestPairs(text) {
  const parser = window.KRID_SEMANTIC_ENGINE?.parseCompanionMaterial || window.KRID_COMPANION_TEST?.parseCompanionMaterial;
  if (typeof parser !== "function") return [];
  return parser(text).map((fact) => {
    const term = String(fact.term || "").trim();
    const definition = resolveQuestCoreference(term, fact.definition);
    return {
      term,
      definition,
      source: definition,
      question: fact.question,
      kind: fact.kind || "concept",
      keyPoints: fact.keyPoints || []
    };
  }).filter((pair) => questDefinitionIsUseful(pair.term, pair.definition));
}

function parseNotes(text) {
  const normalized = text
    .replace(/\r/g, "\n")
    .replace(/[\t ]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!normalized) return [];

  const semanticPairs = semanticQuestPairs(normalized);
  if (semanticPairs.length) return semanticPairs.slice(0, 60);

  const rawLines = normalized.split(/\n+/).map((line) => line.replace(/^\s*(?:[-*•▪◦]+|\d+[.)]|[A-Za-z][.)])\s*/, "").trim()).filter(Boolean);
  const candidates = [];
  rawLines.forEach((line) => {
    const structured = line.match(/^(.{2,70}?)\s*[:–—]\s*(.{10,})$/);
    if (structured) {
      candidates.push({ term: structured[1].trim(), definition: structured[2].trim(), source: line });
      return;
    }
    line.split(/(?<=[.!?])\s+|\s*;\s*/).forEach((sentence) => {
      const clean = sentence.trim().replace(/^["“]|["”]$/g, "");
      if (clean.length >= 24) candidates.push({ definition: clean.replace(/[.;]+$/, ""), source: clean });
    });
  });

  if (candidates.length < 3 && normalized.length > 120) {
    normalized.split(/,\s+(?=(?:which|while|whereas|and|but|giving|making|including|because)\b)/i).forEach((part) => {
      const clean = part.trim().replace(/[.;]+$/, "");
      if (clean.length >= 28) candidates.push({ definition: clean, source: clean });
    });
  }

  const usedDefinitions = new Set();
  const usedTerms = new Set();
  return candidates.filter((item) => {
    const key = item.definition.toLowerCase().replace(/\W/g, "");
    if (usedDefinitions.has(key)) return false;
    usedDefinitions.add(key);
    return true;
  }).map((item, index) => ({
    term: item.term || conceptLabel(item.definition, index, usedTerms),
    definition: item.definition,
    source: item.source
  })).map((item) => {
    const definition = resolveQuestCoreference(item.term, item.definition);
    return { ...item, definition, source: definition };
  })
    .filter((item) => questDefinitionIsUseful(item.term, item.definition))
    .slice(0, 60);
}

function choiceKey(value) {
  return String(value || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "").trim();
}

function makeChoiceSet(correct, distractors) {
  const correctKey = choiceKey(correct);
  const seen = new Set([correctKey]);
  const unique = [];
  (distractors || []).forEach((value) => {
    const key = choiceKey(value);
    if (!key || seen.has(key)) return;
    seen.add(key);
    unique.push(value);
  });
  const options = shuffled([correct, ...shuffled(unique).slice(0, 3)]);
  return { options, answer: options.indexOf(correct) };
}

function escapeRegExp(value) {
  return String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function conciseSourceClue(pair, maxLength = 300) {
  const term = String(pair?.term || "").trim();
  let clue = String(pair?.definition || "").replace(/\s+/g, " ").trim();
  if (term) {
    const termPattern = new RegExp(`(^|[^\\p{L}\\p{N}])${escapeRegExp(term)}(?=$|[^\\p{L}\\p{N}])`, "giu");
    clue = clue.replace(termPattern, (_, prefix) => `${prefix}This concept`);
  }
  const acronym = term.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).map((word) => word[0]).join("");
  if (acronym.length >= 3 && acronym.length <= 6) clue = clue.replace(new RegExp(`\\b${escapeRegExp(acronym)}\\b`, "gi"), "this approach");
  if (clue.length <= maxLength) return clue;
  const shortened = clue.slice(0, maxLength + 1);
  const boundary = Math.max(shortened.lastIndexOf(". "), shortened.lastIndexOf("; "), shortened.lastIndexOf(" "));
  return `${shortened.slice(0, boundary > maxLength * .65 ? boundary : maxLength).replace(/[,:;\s]+$/, "")}…`;
}

function createNotesWorld(pairs, metadata = {}) {
  const chosen = pairs.length > 6 ? shuffled(pairs).slice(0, 6) : pairs.slice();
  const concepts = chosen.map((pair, index) => {
    const definitions = makeChoiceSet(pair.definition, pairs.map((item) => item.definition));
    const terms = makeChoiceSet(pair.term, pairs.map((item) => item.term));
    return {
      title: pair.term,
      short: pair.term,
      explanation: pair.definition,
      memory: `${pair.term}: ${pair.definition}`,
      example: `Close the card and explain “${pair.term}” in your own words. Then reopen it and check what you missed.`,
      source: pair.source || pair.definition,
      question: {
        prompt: pair.question || `Which source statement accurately explains “${pair.term}”?`,
        options: definitions.options, answer: definitions.answer,
        hint: `Look for the description most directly connected to ${pair.term}.`,
        success: `Correct. ${pair.term} has officially joined your brain's inventory.`
      },
      boss: {
        prompt: `Which concept best matches this source clue: “${conciseSourceClue(pair)}”?`,
        options: terms.options, answer: terms.answer,
        hint: `This clue came from your note number ${index + 1}.`
      }
    };
  });

  return {
    title: metadata.title || "My Notes Nexus",
    subject: metadata.subject || "Personal study realm",
    badge: metadata.badge || "MY",
    accent: metadata.accent || "#57e6ed",
    intro: metadata.intro || `The note engine detected ${pairs.length} ideas and sampled ${chosen.length} across the material as playable rooms. Every question stays grounded in the pasted source.`,
    concepts,
    customFactCount: pairs.length,
    sourceUrl: metadata.sourceUrl || ""
  };
}

function usableSavedState() {
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    return saved?.version === 2 && saved?.pack?.concepts?.length >= 2 && !saved.finished ? saved : null;
  } catch {
    return null;
  }
}

function saveProgress() {
  if (!state || state.finished) return;
  const snapshot = { ...state, elapsed: getElapsed() };
  localStorage.setItem(SAVE_KEY, JSON.stringify(snapshot));
  refreshContinueButton();
}

function getElapsed() {
  return (state?.elapsed || 0) + (state ? Date.now() - activeSince : 0);
}

function refreshContinueButton() {
  const saved = usableSavedState();
  ui.continueButton.hidden = !saved;
  if (saved) ui.continueTitle.textContent = `${saved.pack.title} · Mission ${saved.currentStage + 1}`;
  ui.weakReviewLandingButton.hidden = !loadLastReport();
}

function loadLastReport() {
  try {
    const report = JSON.parse(localStorage.getItem(REPORT_KEY));
    return report?.pack?.concepts?.length ? report : null;
  } catch {
    return null;
  }
}

function showScreen(name) {
  const screens = { landing: ui.landing, companion: ui.companion, game: ui.game, report: ui.report };
  Object.entries(screens).forEach(([key, element]) => {
    const active = key === name;
    element.hidden = !active;
    element.classList.toggle("active", active);
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setAccent(color = "#c9ff55") {
  document.documentElement.style.setProperty("--acid", color);
  document.documentElement.style.setProperty("--acid-2", color);
}

function setMode(mode) {
  setup.mode = mode;
  const isWorld = mode === "world";
  ui.worldTab.classList.toggle("active", isWorld);
  ui.notesTab.classList.toggle("active", !isWorld);
  ui.worldTab.setAttribute("aria-selected", String(isWorld));
  ui.notesTab.setAttribute("aria-selected", String(!isWorld));
  ui.worldPanel.classList.toggle("active", isWorld);
  ui.notesPanel.classList.toggle("active", !isWorld);
  ui.worldPanel.hidden = !isWorld;
  ui.notesPanel.hidden = isWorld;
  ui.builderError.textContent = "";
  audio.click();
}

function renderTopicAtlas() {
  const query = ui.topicSearch.value.trim().toLowerCase();
  const categories = ["All", ...Object.keys(TOPIC_GROUPS)];
  ui.categoryChips.innerHTML = categories.map((category) => `<button class="${setup.atlasCategory === category ? "selected" : ""}" data-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join("");
  const matches = TOPIC_LIBRARY.filter((topic) => {
    const inCategory = setup.atlasCategory === "All" || topic.category === setup.atlasCategory;
    return inCategory && (!query || `${topic.title} ${topic.category}`.toLowerCase().includes(query));
  });
  ui.atlasResults.innerHTML = matches.length
    ? matches.map((topic) => `<button class="atlas-topic ${setup.atlasTopic === topic.title ? "selected" : ""}" data-topic="${escapeHTML(topic.title)}"><span>${escapeHTML(topic.category)}</span><strong>${escapeHTML(topic.title)}</strong><i>OPEN PORTAL →</i></button>`).join("")
    : `<div class="atlas-empty"><strong>That topic is not on the shelf—yet.</strong><span>Keep your search text and press Build Quest to fetch it anyway.</span></div>`;
}

function toggleTopicAtlas() {
  const open = ui.topicAtlas.hidden;
  ui.topicAtlas.hidden = !open;
  ui.moreWorldsButton.setAttribute("aria-expanded", String(open));
  ui.moreWorldsButton.classList.toggle("active", open);
  if (open) {
    renderTopicAtlas();
    setTimeout(() => ui.topicSearch.focus(), 80);
  }
  audio.click();
}

async function fetchTopicNotes(topic) {
  const params = new URLSearchParams({
    action: "query", prop: "extracts", explaintext: "1", exsentences: "10",
    redirects: "1", titles: topic, format: "json", origin: "*"
  });
  const response = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`);
  if (!response.ok) throw new Error("The encyclopedia portal did not respond");
  const payload = await response.json();
  const page = Object.values(payload?.query?.pages || {})[0];
  if (!page?.extract || page.missing !== undefined) throw new Error("No encyclopedia article was found for that topic");
  const pairs = parseNotes(page.extract);
  if (pairs.length < 3) throw new Error("The article was too short to forge a useful quest");
  return {
    pairs,
    title: page.title,
    sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replaceAll(" ", "_"))}`
  };
}

async function buildAtlasQuest(topic = ui.topicSearch.value.trim()) {
  if (!topic) {
    ui.builderError.textContent = "Type or choose a topic before opening the portal.";
    ui.topicSearch.focus();
    return;
  }
  const oldText = ui.buildTopicButton.textContent;
  ui.builderError.textContent = "";
  ui.buildTopicButton.disabled = true;
  ui.buildTopicButton.textContent = "FORGING…";
  try {
    const result = await fetchTopicNotes(topic);
    const pack = createNotesWorld(result.pairs, {
      title: `${result.title} Realm`, subject: "Topic Atlas expedition", badge: result.title.slice(0, 2).toUpperCase(),
      accent: "#ffd765", sourceUrl: result.sourceUrl,
      intro: `A live encyclopedia source was converted into ${Math.min(result.pairs.length, 6)} learning rooms. Questions use only ideas detected in that source.`
    });
    startQuest(pack, "atlas", result.title.toLowerCase().replace(/\W+/g, "-"));
  } catch (error) {
    ui.builderError.textContent = `${error.message}. Check your connection, try a more specific name, or paste your own notes.`;
    audio.wrong();
  } finally {
    ui.buildTopicButton.disabled = false;
    ui.buildTopicButton.textContent = oldText;
  }
}

function selectFromSegment(container, button, key, value) {
  $$("button", container).forEach((item) => item.classList.toggle("selected", item === button));
  setup[key] = value;
  audio.click();
}

function startQuest(pack, mode = setup.mode, worldKey = setup.world) {
  const difficulty = difficultyConfig(setup.difficulty);
  state = {
    version: 2,
    mode,
    worldKey,
    pack,
    grade: setup.grade,
    difficulty: setup.difficulty,
    currentStage: 0,
    phase: "lesson",
    completed: Array(pack.concepts.length + 1).fill(false),
    mastery: Array(pack.concepts.length).fill(0),
    confidence: Array(pack.concepts.length).fill(1),
    attempts: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    maxStreak: 0,
    xp: 0,
    coins: 0,
    energy: difficulty.energy,
    inventory: [],
    usedItems: [],
    doubleNext: false,
    questionMistakes: 0,
    bossRound: 0,
    bossOrder: shuffled(pack.concepts.map((_, index) => index)),
    reviewStage: null,
    elapsed: 0,
    startedAt: Date.now(),
    finished: null
  };
  activeSince = Date.now();
  setAccent(pack.accent);
  saveProgress();
  showScreen("game");
  renderGame();
  audio.unlock();
}

function launchFromBuilder() {
  ui.builderError.textContent = "";
  if (setup.mode === "notes") {
    const pairs = parseNotes(ui.notesInput.value);
    if (pairs.length < 2) {
      ui.builderError.textContent = "I need a little more material. Add at least two complete facts or sentences—any format is fine.";
      ui.notesInput.focus();
      audio.wrong();
      return;
    }
    startQuest(createNotesWorld(pairs), "notes", "notes");
    return;
  }
  startQuest(WORLDS[setup.world], "world", setup.world);
}

function continueQuest() {
  const saved = usableSavedState();
  if (!saved) return refreshContinueButton();
  state = saved;
  state.confidence ||= Array(state.pack.concepts.length).fill(1);
  state.reviewStage = Number.isInteger(state.reviewStage) && state.reviewStage < state.pack.concepts.length ? state.reviewStage : null;
  activeSince = Date.now();
  setAccent(state.pack.accent);
  showScreen("game");
  renderGame();
  audio.unlock();
}

function currentConceptIndex() {
  if (Number.isInteger(state.reviewStage)) return state.reviewStage;
  if (state.currentStage < state.pack.concepts.length) return state.currentStage;
  return state.bossOrder[state.bossRound] ?? 0;
}

function isRouteReview() { return Number.isInteger(state.reviewStage); }
function isBossStage() { return !isRouteReview() && state.currentStage === state.pack.concepts.length; }

function routeIsRevisitable(index, currentStage = state?.currentStage, completed = state?.completed, conceptCount = state?.pack?.concepts?.length || 0) {
  return index < conceptCount && Boolean(completed?.[index] || index === currentStage);
}

function currentQuestion() {
  const concept = state.pack.concepts[currentConceptIndex()];
  const masterMode = state.grade === "Master";
  if (isBossStage()) return masterMode ? concept.question : concept.boss;
  return masterMode ? concept.boss : concept.question;
}

function renderGame() {
  if (!state) return;
  renderHUD();
  renderRoute();
  renderCoach();
  if (isRouteReview() || isBossStage()) renderQuestion();
  else if (state.phase === "lesson") renderLesson();
  else renderQuestion();
  saveProgress();
}

function renderHUD() {
  const level = Math.floor(state.xp / 300) + 1;
  const levelXp = state.xp % 300;
  ui.worldBadge.textContent = state.pack.badge;
  ui.worldBadge.style.background = state.pack.accent;
  ui.worldSubject.textContent = state.pack.subject.toUpperCase();
  ui.worldTitle.textContent = state.pack.title;
  ui.levelNumber.textContent = level;
  ui.xpBar.style.width = `${(levelXp / 300) * 100}%`;
  ui.xpText.textContent = `${levelXp} / 300 XP`;
  ui.energyCount.textContent = state.energy;
  ui.coinCount.textContent = state.coins;
  ui.streakCount.textContent = state.streak;
  ui.streakBadge.classList.toggle("hot", state.streak >= 3);
}

function routeStageLabel(index) {
  if (index === state.pack.concepts.length) return { title: "Glitch Overlord", type: "Boss battle" };
  return { title: state.pack.concepts[index].title, type: index === 0 ? "Learn + battle" : "Concept battle" };
}

function renderRoute() {
  const total = state.completed.length;
  const finished = state.completed.filter(Boolean).length;
  const percent = Math.round((finished / total) * 100);
  ui.routeProgress.textContent = `${percent}%`;
  ui.routeProgressBar.style.width = `${percent}%`;
  ui.routeMap.innerHTML = state.completed.map((complete, index) => {
    const current = index === state.currentStage;
    const reviewing = index === state.reviewStage;
    const revisitable = routeIsRevisitable(index);
    const label = routeStageLabel(index);
    const classes = ["route-node", complete ? "complete" : "", current ? "current" : "", reviewing ? "reviewing" : "", revisitable ? "unlocked" : "", index === total - 1 ? "boss" : ""].filter(Boolean).join(" ");
    const symbol = complete ? "✓" : index === total - 1 ? "!" : String(index + 1).padStart(2, "0");
    const type = reviewing ? "Reviewing question" : complete ? "Revisit question" : label.type;
    return `<button class="${classes}" type="button" data-route-index="${index}" ${revisitable ? "" : "disabled"} ${current ? 'aria-current="step"' : ""} title="${escapeHTML(revisitable ? `${type}: ${label.title}` : `Locked: ${label.title}`)}" aria-label="${escapeHTML(revisitable ? `${type}: ${label.title}` : `Locked: ${label.title}`)}"><span class="node-dot"><span>${symbol}</span></span><span><strong>${escapeHTML(label.title)}</strong><small>${escapeHTML(type)}</small></span></button>`;
  }).join("");
  const label = routeStageLabel(isRouteReview() ? state.reviewStage : state.currentStage);
  ui.currentMission.textContent = isRouteReview() ? `Reviewing: ${label.title}` : label.title;
}

function openRouteStage(index) {
  if (!routeIsRevisitable(index)) return;
  if (index === state.currentStage && !state.completed[index]) {
    state.reviewStage = null;
    if (state.phase !== "question") state.questionMistakes = 0;
    state.phase = "question";
  } else {
    state.reviewStage = index;
  }
  audio.click();
  renderGame();
  const reduced = document.documentElement.classList.contains("accessibility-mode") || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  ui.stageViewport.scrollIntoView?.({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

function exitRouteReview() {
  state.reviewStage = null;
  audio.click();
  renderGame();
}

function coachLine() {
  if (isRouteReview()) return "Review portal open. Practise freely—this replay does not spend energy or alter your quest rewards.";
  if (isBossStage()) {
    if (state.bossRound === 0) return "Boss time. It has several eyes and somehow none of them revised. Use this advantage.";
    return `The Glitch has ${state.bossOrder.length - state.bossRound} knowledge shields left. Your streak is making it nervous.`;
  }
  if (state.phase === "lesson") {
    const lines = [
      "Read the idea, then explain it to an imaginary pigeon. If the pigeon understands, you are ready.",
      "A worked example is a map, not a sofa. Use it, then try the route yourself.",
      "Your brain strengthens when it retrieves an answer, not when it merely nods at one.",
      "Last concept before the boss. It has prepared a speech. Let us make that awkward."
    ];
    return lines[state.currentStage] || lines[0];
  }
  if (state.questionMistakes > 0) return "A mistake is useful data wearing an annoying hat. Read the hint and attack again.";
  return "No rush. Eliminate answers with the wrong meaning before choosing the best one.";
}

function renderCoach() {
  ui.coachMessage.textContent = coachLine();
  const average = Math.round(state.mastery.reduce((sum, value) => sum + value, 0) / state.mastery.length);
  ui.masteryAverage.textContent = `${average}%`;
  ui.masteryList.innerHTML = state.pack.concepts.map((concept, index) => {
    const value = state.mastery[index];
    const confidence = state.confidence?.[index] ?? 1;
    return `<div class="mastery-item ${value >= 80 ? "mastered" : ""}"><div><span>${escapeHTML(concept.short)}</span><b>${value}% · ${["SHAKY", "OKAY", "STRONG"][confidence]}</b></div><span class="mastery-track"><i style="width:${value}%"></i></span></div>`;
  }).join("");

  const unlocked = state.inventory.length;
  ui.inventoryCount.textContent = `${unlocked} / 3`;
  $$(".inventory-slot", ui.inventorySlots).forEach((slot) => {
    const item = slot.dataset.item;
    slot.classList.toggle("locked", !state.inventory.includes(item));
    slot.classList.toggle("used", state.usedItems.includes(item));
    slot.disabled = !state.inventory.includes(item) || state.usedItems.includes(item);
  });
}

function explainSimply(text) {
  const swaps = [
    [/utilize/gi, "use"], [/approximately/gi, "about"], [/demonstrates?/gi, "shows"],
    [/individuals/gi, "people"], [/subsequently/gi, "later"], [/therefore/gi, "so"],
    [/in order to/gi, "to"], [/a large number of/gi, "many"], [/commence/gi, "start"]
  ];
  return swaps.reduce((result, [pattern, replacement]) => result.replace(pattern, replacement), text);
}

function renderLesson() {
  const concept = state.pack.concepts[state.currentStage];
  state.mastery[state.currentStage] = Math.max(state.mastery[state.currentStage], 15);
  const explanation = state.grade === "Explorer" ? explainSimply(concept.explanation) : concept.explanation;
  ui.stageTag.textContent = `MISSION ${String(state.currentStage + 1).padStart(2, "0")} · LEARN`;
  ui.stageViewport.innerHTML = `
    <div class="lesson-view">
      <div class="lesson-copy">
        <div class="room-status"><span class="player-token">K</span><i></i><span class="locked-door">▥</span><b>ROOM ${String(state.currentStage + 1).padStart(2, "0")} · DOOR LOCKED</b></div>
        <span class="mission-count">CONCEPT ${state.currentStage + 1} OF ${state.pack.concepts.length}</span>
        <h2>${escapeHTML(concept.title)}</h2>
        ${state.grade === "Explorer" ? '<span class="simple-mode-pill">EXPLAIN LIKE I’M 10</span>' : ""}
        <p>${escapeHTML(explanation)}</p>
        <button class="flashcard" id="flashcardButton" type="button" aria-expanded="false">
          <span class="flashcard-front"><small>FLASHCARD · TAP TO FLIP</small><strong>${escapeHTML(concept.title)}</strong></span>
          <span class="flashcard-back"><small>MEMORY ANCHOR</small><strong>${escapeHTML(concept.memory)}</strong></span>
        </button>
        <div class="example-box"><span>RETRIEVAL DRILL</span>${escapeHTML(concept.example)}</div>
        ${concept.source ? `<div class="source-note"><span>SOURCE NOTE${state.pack.sourceUrl ? ` · <a href="${escapeHTML(state.pack.sourceUrl)}" target="_blank" rel="noreferrer">VIEW ARTICLE ↗</a>` : ""}</span>${escapeHTML(concept.source)}</div>` : ""}
        <div class="confidence-check"><span>How ready do you feel?</span><div><button data-confidence="0">😵 Shaky</button><button class="selected" data-confidence="1">🙂 Okay</button><button data-confidence="2">⚡ Strong</button></div></div>
        <button class="primary-button stage-action" id="startBattleButton"><span>I'M READY — ENTER BATTLE</span><i>→</i></button>
      </div>
      <div class="lesson-visual" aria-hidden="true">
        <span class="orb-satellite sat-one">${String(state.currentStage + 1).padStart(2, "0")}</span>
        <div class="knowledge-orb"><strong>${escapeHTML(concept.short)}</strong></div>
        <span class="orb-satellite sat-two">K+</span>
      </div>
    </div>`;
  $("#flashcardButton").addEventListener("click", (event) => {
    const card = event.currentTarget;
    const flipped = card.classList.toggle("flipped");
    card.setAttribute("aria-expanded", String(flipped));
    card.scrollTop = 0;
    audio.click();
  });
  $$(".confidence-check button").forEach((button) => button.addEventListener("click", () => {
    $$(".confidence-check button").forEach((item) => item.classList.toggle("selected", item === button));
    state.confidence[state.currentStage] = Number(button.dataset.confidence);
    saveProgress();
    audio.click();
  }));
  $("#startBattleButton").addEventListener("click", () => {
    audio.click();
    state.phase = "question";
    state.questionMistakes = 0;
    renderGame();
  });
  renderCoach();
}

function renderEnemy() {
  const boss = isBossStage();
  const total = state.bossOrder.length;
  const hp = boss ? ((total - state.bossRound) / total) * 100 : 100;
  return `
    <div class="battle-arena">
      <div class="enemy-label"><i></i>${boss ? "GLITCH OVERLORD" : "KNOWLEDGE GLITCH"} · HP</div>
      <div class="enemy-hp"><i id="enemyHpBar" style="width:${hp}%"></i></div>
      <div class="glitch-enemy" id="glitchEnemy">
        <div class="glitch-body"></div><div class="glitch-eye left"></div><div class="glitch-eye right"></div><div class="glitch-mouth"></div>
        <i class="glitch-bit one"></i><i class="glitch-bit two"></i><i class="glitch-bit three"></i>
      </div>
      <strong class="enemy-name">${boss ? "The Grand Misconception" : "Confusion Blob"}</strong>
      <p class="enemy-quip">“${boss ? "Your notes look suspiciously organized." : "I replaced the correct answer with confidence."}”</p>
    </div>`;
}

function renderQuestion() {
  const question = currentQuestion();
  const concept = state.pack.concepts[currentConceptIndex()];
  const reviewing = isRouteReview();
  const boss = isBossStage();
  const support = reviewing
    ? "Free review: answers here do not spend energy, add XP, or change your saved progression."
    : state.grade === "Explorer"
    ? `Mission clue: ${concept.memory}`
    : state.grade === "Master"
      ? "Master mode: memory anchors are hidden during retrieval."
      : (boss ? "Each correct answer removes one boss shield." : `Choose the strongest answer. Use keys 1–${question.options.length} if you prefer.`);
  ui.stageTag.textContent = reviewing
    ? `REVIEW PORTAL · MISSION ${String(state.reviewStage + 1).padStart(2, "0")}`
    : boss
    ? `FINAL BOSS · ROUND ${state.bossRound + 1} OF ${state.bossOrder.length}`
    : `MISSION ${String(state.currentStage + 1).padStart(2, "0")} · BATTLE`;
  ui.stageViewport.innerHTML = `
    <div class="battle-view">
      ${renderEnemy()}
      <div class="question-copy">
        ${reviewing ? '<div class="review-mode-bar"><span>↶ PRACTICE REPLAY</span><button id="exitRouteReview" type="button">Return to current mission</button></div>' : ""}
        <div class="room-status battle-room"><span class="player-token">K</span><i></i><span class="locked-door">▥</span><b>${reviewing ? "REVISIT THIS QUESTION · PROGRESS STAYS SAFE" : "CAST THE RIGHT ANSWER TO UNLOCK THE DOOR"}</b></div>
        ${boss ? '<span class="boss-banner"><i></i> FINAL KNOWLEDGE CHECK</span>' : ""}
        <div class="question-context">${escapeHTML(concept.short.toUpperCase())}</div>
        <h2>${escapeHTML(question.prompt)}</h2>
        <p>${escapeHTML(support)}</p>
        <div class="spell-label">CHOOSE YOUR KNOWLEDGE SPELL</div>
        <div class="answers" id="answers">
          ${question.options.map((answer, index) => `<button class="answer-option" data-index="${index}"><span class="key">${index + 1}</span><span class="answer-text">${escapeHTML(answer)}</span></button>`).join("")}
        </div>
        <div class="feedback-box" id="feedbackBox"></div>
        <div id="nextActionHolder"></div>
      </div>
    </div>`;
  $$(".answer-option", $("#answers")).forEach((button) => button.addEventListener("click", () => answerQuestion(Number(button.dataset.index), button)));
  $("#exitRouteReview")?.addEventListener("click", exitRouteReview);
  renderCoach();
}

function awardXP(base) {
  const multiplier = difficultyConfig(state.difficulty).multiplier;
  const doubled = state.doubleNext;
  const amount = Math.round(base * multiplier * (doubled ? 2 : 1));
  state.xp += amount;
  if (doubled) {
    state.doubleNext = false;
    showToast(`Double XP activated: +${amount} XP`);
  }
  return amount;
}

function answerQuestion(selected, button) {
  if (button.disabled) return;
  const question = currentQuestion();
  if (isRouteReview()) {
    if (selected !== question.answer) {
      button.classList.add("wrong");
      button.disabled = true;
      const feedback = $("#feedbackBox");
      feedback.className = "feedback-box visible wrong";
      feedback.innerHTML = `<span>!</span><div><strong>Not quite—this is a free replay.</strong><br>${escapeHTML(question.hint)} Try another option; your energy and score are untouched.</div>`;
      audio.wrong();
      return;
    }
    $$(".answer-option", $("#answers")).forEach((option) => { option.disabled = true; });
    button.classList.add("correct");
    const feedback = $("#feedbackBox");
    feedback.className = "feedback-box visible correct";
    feedback.innerHTML = `<span>✓</span><div><strong>Memory restored—review complete.</strong><br>${escapeHTML(question.success || "Correct. You can revisit this route whenever you want.")}</div>`;
    $("#nextActionHolder").innerHTML = '<button class="primary-button next-question-button" id="continueAnswer"><span>RETURN TO CURRENT MISSION</span><i>→</i></button>';
    $("#continueAnswer").addEventListener("click", exitRouteReview);
    audio.correct();
    return;
  }
  state.attempts += 1;

  if (selected !== question.answer) {
    button.classList.add("wrong");
    button.disabled = true;
    state.wrong += 1;
    state.streak = 0;
    state.questionMistakes += 1;
    state.energy -= 1;
    if (state.energy <= 0) {
      state.energy = 2;
      state.coins = Math.max(0, state.coins - 10);
      showToast("Focus reboot: +2 energy, −10 coins");
    }
    const feedback = $("#feedbackBox");
    feedback.className = "feedback-box visible wrong";
    const funnyOpeners = ["The Blob bonked that spell sideways.", "Plot twist: that answer wore a fake moustache.", "Professor Pip deployed the Emergency Hint Ferret."];
    feedback.innerHTML = `<span>!</span><div><strong>${funnyOpeners[state.questionMistakes % funnyOpeners.length]}</strong><br>${escapeHTML(question.hint)} Try again—no XP or progress is lost.</div>`;
    $("#glitchEnemy").classList.add("hit");
    setTimeout(() => $("#glitchEnemy")?.classList.remove("hit"), 430);
    audio.wrong();
    renderHUD();
    renderCoach();
    saveProgress();
    return;
  }

  $$(".answer-option", $("#answers")).forEach((option) => { option.disabled = true; });
  button.classList.add("correct");
  state.correct += 1;
  state.streak += 1;
  state.maxStreak = Math.max(state.maxStreak, state.streak);
  const conceptIndex = currentConceptIndex();
  const masteryGain = isBossStage() ? 15 : (state.questionMistakes === 0 ? 70 : 50);
  state.mastery[conceptIndex] = clamp(Math.max(state.mastery[conceptIndex], 15) + masteryGain, 0, 100);
  const xp = awardXP(isBossStage() ? 110 : 80);
  const coins = isBossStage() ? 24 : 15 + Math.max(0, 6 - state.questionMistakes * 3);
  state.coins += coins;
  const feedback = $("#feedbackBox");
  feedback.className = "feedback-box visible correct";
  feedback.innerHTML = `<span>✓</span><div><strong>Door unlocked · +${xp} XP · +${coins} coins</strong><br>${escapeHTML(question.success || "Correct. The Glitch has misplaced another misconception.")}</div>`;
  $("#enemyHpBar").style.width = isBossStage()
    ? `${((state.bossOrder.length - state.bossRound - 1) / state.bossOrder.length) * 100}%`
    : "0%";
  $("#glitchEnemy").classList.add(isBossStage() && state.bossRound === state.bossOrder.length - 1 ? "captured" : "stunned");
  $(".battle-arena").insertAdjacentHTML("beforeend", `<div class="door-unlocked"><span>🔓</span><strong>${isBossStage() ? "KNOWLEDGE SHIELD BROKEN" : "ROOM CLEARED"}</strong><small>The Blob is stunned—not vanished. Continue when ready.</small></div>`);
  const buttonLabel = isBossStage()
    ? (state.bossRound === state.bossOrder.length - 1 ? "CLAIM VICTORY" : "BREAK NEXT SHIELD")
    : (state.currentStage === state.pack.concepts.length - 1 ? "ENTER THE BOSS GATE" : "CONTINUE THE QUEST");
  $("#nextActionHolder").innerHTML = `<button class="primary-button next-question-button" id="continueAnswer"><span>${buttonLabel}</span><i>→</i></button>`;
  $("#continueAnswer").addEventListener("click", isBossStage() ? advanceBoss : completeStage);
  audio.correct();
  renderHUD();
  renderCoach();
  saveProgress();
}

function unlockForStage(index) {
  const item = ["hint", "shield", "double"][index];
  if (!item || state.inventory.includes(item)) return;
  state.inventory.push(item);
  const names = { hint: "Hint Lens", shield: "Focus Shield", double: "Double XP Chip" };
  showToast(`${names[item]} unlocked in your Krid Kit`);
  audio.unlock();
}

function completeStage() {
  state.reviewStage = null;
  state.completed[state.currentStage] = true;
  unlockForStage(state.currentStage);
  state.currentStage += 1;
  if (state.currentStage === state.pack.concepts.length) {
    state.bossOrder = state.mastery
      .map((score, index) => ({ score: score + (state.confidence?.[index] || 0) * 8, index }))
      .sort((a, b) => a.score - b.score)
      .map((entry) => entry.index);
  }
  state.phase = state.currentStage < state.pack.concepts.length ? "lesson" : "question";
  state.questionMistakes = 0;
  renderGame();
}

function advanceBoss() {
  state.reviewStage = null;
  if (state.bossRound < state.bossOrder.length - 1) {
    state.bossRound += 1;
    state.questionMistakes = 0;
    renderGame();
  } else {
    state.completed[state.currentStage] = true;
    finishQuest();
  }
}

function useInventory(item) {
  if (!state || !state.inventory.includes(item) || state.usedItems.includes(item)) return;
  if (item === "hint") {
    if (state.phase !== "question" && !isBossStage()) return showToast("Save the Hint Lens for a battle");
    const feedback = $("#feedbackBox");
    if (!feedback) return showToast("Save the Hint Lens for a battle");
    feedback.className = "feedback-box visible wrong";
    feedback.innerHTML = `<span>?</span><div><strong>Hint Lens:</strong><br>${escapeHTML(currentQuestion().hint)}</div>`;
  } else if (item === "shield") {
    state.energy += 2;
    showToast("Focus Shield restored 2 energy");
  } else if (item === "double") {
    state.doubleNext = true;
    showToast("Your next correct answer earns double XP");
  }
  state.usedItems.push(item);
  audio.unlock();
  renderHUD();
  renderCoach();
  saveProgress();
}

function rankFor(score) {
  if (score >= 94) return "Krid Grandmaster";
  if (score >= 84) return "Glitch Breaker";
  if (score >= 72) return "Concept Ranger";
  if (score >= 58) return "Brave Scholar";
  return "Curious Rookie";
}

function finishQuest() {
  state.finished = Date.now();
  state.elapsed = getElapsed();
  activeSince = Date.now();
  const masteryAverage = Math.round(state.mastery.reduce((sum, value) => sum + value, 0) / state.mastery.length);
  const accuracy = state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0;
  state.finalScore = Math.round(masteryAverage * 0.72 + accuracy * 0.28);
  state.rank = rankFor(state.finalScore);
  localStorage.removeItem(SAVE_KEY);
  localStorage.setItem(REPORT_KEY, JSON.stringify(state));
  showScreen("report");
  renderReport();
  burstConfetti(90);
  audio.victory();
}

function formatTime(milliseconds) {
  const seconds = Math.max(0, Math.round(milliseconds / 1000));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function renderReport() {
  const accuracy = state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0;
  const sorted = state.mastery.map((score, index) => ({ score, index })).sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];
  $("#reportSummary").textContent = `${state.pack.title} cleared on ${state.difficulty} mode as a ${state.grade}. Here is what your answers reveal.`;
  $("#finalScore").textContent = state.finalScore;
  $("#scoreRing").style.background = `conic-gradient(var(--acid) ${state.finalScore * 3.6}deg, rgba(255,255,255,.08) 0)`;
  $("#finalRank").textContent = state.rank;
  $("#finalCorrect").textContent = state.correct;
  $("#finalAccuracy").textContent = `${accuracy}%`;
  $("#finalXp").textContent = state.xp;
  $("#finalTime").textContent = formatTime(state.elapsed);
  $("#finalMasteryList").innerHTML = state.pack.concepts.map((concept, index) => `
    <div class="final-mastery-row"><span>${escapeHTML(concept.short)}</span><div><i style="width:${state.mastery[index]}%"></i></div><b>${state.mastery[index]}%</b><small>${["Shaky", "Okay", "Strong"][state.confidence?.[index] ?? 1]}</small></div>`).join("");
  $("#revisionPrescription").innerHTML = `
    <div class="revision-focus"><strong>Revisit: ${escapeHTML(state.pack.concepts[weakest.index].title)}</strong><p>${escapeHTML(state.pack.concepts[weakest.index].memory)} Say it aloud, hide it, then recall it after ten minutes.</p></div>
    <div class="revision-timeline"><span><b>NOW</b> Recall without looking</span><span><b>10 MIN</b> One quick retry</span><span><b>TOMORROW</b> Weak-area rematch</span><span><b>3 DAYS</b> Boss replay</span></div>
    <div class="revision-win"><strong>Your strongest concept:</strong> ${escapeHTML(state.pack.concepts[strongest.index].title)} at ${strongest.score}%. Begin the next session with the weakest idea and finish by teaching the strongest one aloud.</div>`;
}

function startWeakReview(report = loadLastReport()) {
  if (!report?.pack?.concepts?.length) return showToast("Finish one quest to unlock weak-area review");
  const ranked = report.pack.concepts.map((concept, index) => ({ concept, score: report.mastery?.[index] || 0, confidence: report.confidence?.[index] ?? 1 }))
    .sort((a, b) => (a.score + a.confidence * 8) - (b.score + b.confidence * 8));
  const concepts = ranked.slice(0, Math.min(4, ranked.length)).map((entry) => entry.concept);
  const pack = {
    ...report.pack,
    title: "Weak Area Rematch",
    subject: `${report.pack.title} · adaptive review`,
    badge: "WR",
    accent: "#ff8d5b",
    intro: `The ${concepts.length} least-secure concepts from your last run are back as a focused rematch.`,
    concepts
  };
  setup.grade = report.grade || "Scholar";
  setup.difficulty = report.difficulty || "Bold";
  startQuest(pack, "review", "weak-review");
}

function replayQuest() {
  const pack = state.pack;
  const mode = state.mode;
  const worldKey = state.worldKey;
  setup.grade = state.grade;
  setup.difficulty = state.difficulty;
  startQuest(pack, mode, worldKey);
}

function newQuest() {
  state = null;
  setAccent("#c9ff55");
  showScreen("landing");
  refreshContinueButton();
}

function downloadReport() {
  if (!state) return;
  const accuracy = state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0;
  const lines = [
    "THE STUDY KRID — QUEST REPORT",
    "================================",
    `World: ${state.pack.title}`,
    `Learner level: ${state.grade}`,
    `Difficulty: ${state.difficulty}`,
    `Rank: ${state.rank}`,
    `Mastery score: ${state.finalScore}/100`,
    `Accuracy: ${accuracy}% (${state.correct} correct from ${state.attempts} attempts)`,
    `XP: ${state.xp}`,
    `Quest time: ${formatTime(state.elapsed)}`,
    "",
    "KNOWLEDGE MAP",
    ...state.pack.concepts.map((concept, index) => `- ${concept.title}: ${state.mastery[index]}% — ${concept.memory}`),
    "",
    "REVISION METHOD",
    "Revisit the lowest-scoring concept first. Read its memory anchor, hide it, explain it aloud, then retrieve it again after ten minutes."
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `study-krid-${state.pack.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-report.txt`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 500);
  showToast("Study report downloaded");
}

async function shareResult() {
  if (!state) return;
  const accuracy = state.attempts ? Math.round((state.correct / state.attempts) * 100) : 0;
  const text = `I cleared ${state.pack.title} in The Study Krid with ${state.finalScore}/100 mastery, ${accuracy}% accuracy, and the rank “${state.rank}”.`;
  const shareData = { title: "The Study Krid", text };
  if (location.protocol.startsWith("http")) shareData.url = location.href.split("#")[0];
  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(`${text}${shareData.url ? ` ${shareData.url}` : ""}`);
      showToast("Result copied to clipboard");
    } else {
      showToast("Download the report to share your result");
    }
  } catch (error) {
    if (error.name !== "AbortError") showToast("Sharing was not available — try downloading the report");
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  ui.toast.textContent = message;
  ui.toast.classList.add("visible");
  toastTimer = setTimeout(() => ui.toast.classList.remove("visible"), 2600);
}

function burstConfetti(amount = 50) {
  const colors = ["#c9ff55", "#8c75ff", "#ff8d5b", "#57e6ed", "#fffdf7"];
  for (let index = 0; index < amount; index += 1) {
    const piece = document.createElement("i");
    piece.className = "confetti";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[index % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.animationDuration = `${2.1 + Math.random() * 1.8}s`;
    piece.style.setProperty("--drift", `${-120 + Math.random() * 240}px`);
    ui.confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 4600);
  }
}

function exitQuest() {
  if (!state) return newQuest();
  state.elapsed = getElapsed();
  activeSince = Date.now();
  saveProgress();
  setAccent("#c9ff55");
  showScreen("landing");
  refreshContinueButton();
  showToast("Quest saved — continue whenever you are ready");
}

function updateNotesCount() {
  const count = parseNotes(ui.notesInput.value).length;
  ui.noteCounter.textContent = count ? `${count} idea${count === 1 ? "" : "s"} detected` : "Waiting for notes";
  ui.noteCounter.classList.toggle("ready", count >= 2);
}

function toggleHelp(open) {
  ui.helpModal.hidden = !open;
  if (open) $("#closeHelpButton").focus();
}

function bindEvents() {
  $$(".mode-tab").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  $$(".world-card", ui.worldGrid).forEach((button) => button.addEventListener("click", () => {
    setup.world = button.dataset.world;
    $$(".world-card", ui.worldGrid).forEach((card) => {
      const selected = card === button;
      card.classList.toggle("selected", selected);
      card.setAttribute("aria-pressed", String(selected));
    });
    audio.click();
  }));
  $$("button", ui.gradeSelector).forEach((button) => button.addEventListener("click", () => selectFromSegment(ui.gradeSelector, button, "grade", button.dataset.grade)));
  $$("button", ui.difficultySelector).forEach((button) => button.addEventListener("click", () => selectFromSegment(ui.difficultySelector, button, "difficulty", button.dataset.difficulty)));
  ui.moreWorldsButton.addEventListener("click", toggleTopicAtlas);
  ui.topicSearch.addEventListener("input", () => {
    setup.atlasTopic = "";
    renderTopicAtlas();
  });
  ui.topicSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      buildAtlasQuest();
    }
  });
  ui.categoryChips.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    setup.atlasCategory = button.dataset.category;
    renderTopicAtlas();
    audio.click();
  });
  ui.atlasResults.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-topic]");
    if (!button) return;
    setup.atlasTopic = button.dataset.topic;
    ui.topicSearch.value = setup.atlasTopic;
    renderTopicAtlas();
    audio.click();
  });
  ui.buildTopicButton.addEventListener("click", () => buildAtlasQuest(setup.atlasTopic || ui.topicSearch.value.trim()));
  ui.notesInput.addEventListener("input", updateNotesCount);
  $("#loadDemoNotes").addEventListener("click", () => {
    ui.notesInput.value = [
      "Cell Tour",
      "Cells contain smaller structures that each have a job. The nucleus stores DNA and controls many cell activities.",
      "• Mitochondria release usable energy from food through cellular respiration.",
      "2. The cell membrane selectively controls what enters and leaves the cell.",
      "Ribosomes build proteins by joining amino acids, while the cytoplasm is where many chemical reactions happen."
    ].join("\n\n");
    updateNotesCount();
    audio.click();
  });
  ui.launch.addEventListener("click", launchFromBuilder);
  ui.continueButton.addEventListener("click", continueQuest);
  $("#exitQuestButton").addEventListener("click", exitQuest);
  $("#brandButton").addEventListener("click", () => state && !state.finished ? exitQuest() : newQuest());
  $("#helpButton").addEventListener("click", () => toggleHelp(true));
  $("#closeHelpButton").addEventListener("click", () => toggleHelp(false));
  ui.helpModal.addEventListener("click", (event) => { if (event.target === ui.helpModal) toggleHelp(false); });
  ui.soundButton.addEventListener("click", () => {
    audio.enabled = !audio.enabled;
    ui.soundButton.classList.toggle("muted", !audio.enabled);
    ui.soundButton.setAttribute("aria-pressed", String(audio.enabled));
    $(".sound-label", ui.soundButton).textContent = audio.enabled ? "Sound on" : "Sound off";
    if (audio.enabled) audio.unlock();
  });
  ui.inventorySlots.addEventListener("click", (event) => {
    const slot = event.target.closest(".inventory-slot");
    if (slot) useInventory(slot.dataset.item);
  });
  ui.routeMap.addEventListener("click", (event) => {
    const route = event.target.closest("button[data-route-index]");
    if (route && !route.disabled) openRouteStage(Number(route.dataset.routeIndex));
  });
  $("#replayButton").addEventListener("click", replayQuest);
  $("#weakReviewButton").addEventListener("click", () => startWeakReview(state));
  ui.weakReviewLandingButton.addEventListener("click", () => startWeakReview());
  $("#downloadReportButton").addEventListener("click", downloadReport);
  $("#shareResultButton").addEventListener("click", shareResult);
  $("#newQuestButton").addEventListener("click", newQuest);
  window.addEventListener("beforeunload", saveProgress);
  document.addEventListener("keydown", (event) => {
    if (!ui.helpModal.hidden && event.key === "Escape") return toggleHelp(false);
    if (ui.game.hidden) return;
    if (/^[1-4]$/.test(event.key)) {
      const option = $(`.answer-option[data-index="${Number(event.key) - 1}"]`);
      if (option && !option.disabled) option.click();
    }
    if (event.key === "Enter") {
      const next = $("#continueAnswer") || $("#startBattleButton");
      if (next) next.click();
    }
  });
}

function initAmbientCanvas() {
  const canvas = $("#ambientCanvas");
  const context = canvas.getContext("2d");
  const particles = [];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function resize() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles.length = 0;
    const count = Math.min(70, Math.floor(window.innerWidth / 20));
    for (let index = 0; index < count; index += 1) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 1.5 + 0.3,
        speed: Math.random() * 0.15 + 0.03,
        drift: (Math.random() - 0.5) * 0.08,
        alpha: Math.random() * 0.5 + 0.1
      });
    }
  }

  function draw() {
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle) => {
      context.fillStyle = `rgba(201,255,85,${particle.alpha})`;
      context.fillRect(particle.x, particle.y, particle.size, particle.size);
      if (!reducedMotion) {
        particle.y -= particle.speed;
        particle.x += particle.drift;
        if (particle.y < -3) particle.y = window.innerHeight + 3;
      }
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
}

function init() {
  LEGACY_SAVE_KEYS.forEach((key) => localStorage.removeItem(key));
  bindEvents();
  updateNotesCount();
  refreshContinueButton();
  initAmbientCanvas();
  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

init();
