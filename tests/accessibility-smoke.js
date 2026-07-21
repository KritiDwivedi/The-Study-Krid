"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const scriptPath = path.join(__dirname, "..", "accessible-input.js");
const source = fs.readFileSync(scriptPath, "utf8").replace(/\ninitAccessibleInputs\(\);\s*$/, "");

function classes() {
  const values = new Set();
  return {
    toggle(name, enabled) { enabled ? values.add(name) : values.delete(name); },
    contains(name) { return values.has(name); }
  };
}

const elements = {
  "#notesInput": { value: "", dispatchEvent(event) { this.lastEvent = event; } },
  "#companionPackSelect": { value: "cells", dispatchEvent(event) { this.lastEvent = event; } },
  "#companionNotes": { value: "" },
  "#companionTopic": { value: "" },
  "#customMaterialDetails": { open: false },
  "#interviewSource": { value: "bank" },
  "#accessibilityToggle": {
    attrs: {},
    label: { textContent: "" },
    setAttribute(name, value) { this.attrs[name] = value; },
    querySelector(selector) { return selector === ".accessibility-label" ? this.label : null; }
  },
  "#accessibilityStatus": { textContent: "" }
};
const rootClasses = classes();
const document = {
  documentElement: { classList: rootClasses },
  querySelector(selector) { return elements[selector] || null; }
};
const storageValues = new Map();
const storage = {
  getItem(key) { return storageValues.get(key) || null; },
  setItem(key, value) { storageValues.set(key, value); }
};
const context = {
  window: { localStorage: storage },
  document,
  navigator: {},
  console,
  Float32Array,
  Event: class Event {
    constructor(type, options = {}) { this.type = type; this.bubbles = options.bubbles; }
  }
};
context.window.window = context.window;
vm.createContext(context);
vm.runInContext(source, context);

const api = context.window.KRID_ACCESSIBILITY_TEST;
assert.ok(api, "Accessibility test API should be exposed");

assert.equal(api.audioFileProblem({ name: "lecture.mp3", type: "audio/mpeg", size: 1000 }), "");
assert.equal(api.audioFileProblem({ name: "lecture.wav", type: "audio/wav", size: 1000 }), "");
assert.match(api.audioFileProblem({ name: "lecture.m4a", type: "audio/mp4", size: 1000 }), /MP3 or WAV/i);
assert.match(api.audioFileProblem({ name: "huge.mp3", type: "audio/mpeg", size: 26 * 1024 * 1024 }), /smaller than 25 MB/i);

assert.equal(api.cleanTranscript("  llms   can hallucinate .  "), "Llms can hallucinate.");
assert.equal(api.mergeTranscript("Existing notes", "new spoken fact"), "Existing notes\n\nNew spoken fact");
assert.equal(api.audioTitle("week_3-llm_security.wav"), "week 3 llm security");
assert.equal(api.dictationWordCount("one two\nthree"), 3);
assert.equal(api.dictationErrorIsFatal("not-allowed"), true);
assert.equal(api.dictationErrorIsFatal("audio-capture"), true);
assert.equal(api.dictationErrorIsFatal("no-speech"), false);
assert.equal(api.dictationErrorIsFatal("network"), false);

const left = new Float32Array([0, 1, 0, -1]);
const right = new Float32Array([0, 0.5, 0, -0.5]);
const decoded = api.resampleAudioBuffer({
  sampleRate: 4,
  length: 4,
  numberOfChannels: 2,
  getChannelData(index) { return index === 0 ? left : right; }
}, 2, 10);
assert.equal(decoded.audio.length, 2);
assert.ok(Math.abs(decoded.audio[0]) < 0.001);
assert.ok(Math.abs(decoded.audio[1]) < 0.001);
assert.equal(decoded.truncated, false);

api.applyTextToStudyModes("Prompt injection can override trusted instructions.", "LLM security lecture");
assert.equal(elements["#notesInput"].value, "Prompt injection can override trusted instructions.");
assert.equal(elements["#notesInput"].lastEvent.type, "input");
assert.equal(elements["#companionPackSelect"].value, "custom");
assert.equal(elements["#companionNotes"].value, "Prompt injection can override trusted instructions.");
assert.equal(elements["#companionTopic"].value, "LLM security lecture");
assert.equal(elements["#customMaterialDetails"].open, true);
assert.equal(elements["#interviewSource"].value, "notes");

assert.equal(api.applyEasyView(true, storage), true);
assert.equal(rootClasses.contains("accessibility-mode"), true);
assert.equal(elements["#accessibilityToggle"].attrs["aria-pressed"], "true");
assert.equal(elements["#accessibilityToggle"].label.textContent, "Easy view on");
assert.equal(api.readEasyViewPreference(storage), true);
assert.equal(api.applyEasyView(false, storage), false);
assert.equal(rootClasses.contains("accessibility-mode"), false);

console.log("Accessibility smoke passed: audio validation, resampling, shared notes, and persistent Easy view.");
