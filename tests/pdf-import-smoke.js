"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const importerPath = path.join(__dirname, "..", "pdf-import.js");
const source = fs.readFileSync(importerPath, "utf8").replace(/\ninitPdfImports\(\);\s*$/, "");
const context = {
  window: {},
  document: { querySelector: () => null, querySelectorAll: () => [] },
  console,
  Event: class Event {
    constructor(type, options = {}) { this.type = type; this.bubbles = options.bubbles; }
  }
};
vm.createContext(context);
vm.runInContext(source, context);

const api = context.window.KRID_PDF_IMPORT_TEST;
assert.ok(api, "PDF import test API should be exposed");

const items = [
  { str: "Guardrail", transform: [1, 0, 0, 1, 10, 700] },
  { str: "implementation", transform: [1, 0, 0, 1, 80, 700] },
  { str: "strategies", transform: [1, 0, 0, 1, 170, 700], hasEOL: true },
  { str: "These controls are enforced at multiple layers.", transform: [1, 0, 0, 1, 10, 680], hasEOL: true },
  { str: "Input-level controls: Block harmful prompts.", transform: [1, 0, 0, 1, 10, 660] }
];
const extractedLines = api.textItemsToLines(items);
assert.match(extractedLines, /^Guardrail implementation strategies/m);
assert.match(extractedLines, /These controls are enforced at multiple layers\./);
assert.match(extractedLines, /Input-level controls: Block harmful prompts\./);

const cleaned = api.cleanPdfText(["Hallucina-\ntions are unsupported outputs.\n\nDetection strategies", "Use retrieval grounding."]);
assert.match(cleaned, /Hallucinations are unsupported outputs\./);
assert.match(cleaned, /Detection strategies\n\nUse retrieval grounding\./);
const wrappedRag = api.cleanPdfText([`Retrieval-Augmented Generation (RAG) is an AI framework that grounds LLMs in external data. By retrieving relevant documents, RAG reduces
hallucinations and provides factual responses without requiring model
retraining.

RAG systems evolve in complexity based on context management.`]);
assert.match(wrappedRag, /RAG reduces hallucinations and provides factual responses without requiring model retraining\./i, "lowercase PDF line wraps should be reconstructed as one sentence");
assert.match(wrappedRag, /retraining\.\n\nRAG systems evolve/i, "a new uppercase paragraph must remain separate");
assert.equal(api.pdfLooksLikeHeading("Detection Strategies"), true);
assert.equal(api.reflowPdfLines(["Detection Strategies", "retrieval grounding and verification"]).includes("Detection Strategies\nretrieval"), true, "a genuine heading should not absorb its following line");
assert.equal(api.pdfFileProblem({ name: "notes.pdf", type: "application/pdf", size: 1024 }), "");
assert.match(api.pdfFileProblem({ name: "notes.txt", type: "text/plain", size: 1024 }), /not a PDF/i);
assert.match(api.pdfFileProblem({ name: "huge.pdf", type: "application/pdf", size: 21 * 1024 * 1024 }), /smaller than 20 MB/i);
assert.match(api.friendlyPdfError({ name: "PasswordException", message: "Password required" }), /Password-protected PDFs/i);

const elements = {
  "#notesInput": { value: "", dispatchEvent(event) { this.lastEvent = event; } },
  "#companionPackSelect": { value: "cells", dispatchEvent(event) { this.lastEvent = event; } },
  "#companionNotes": { value: "" },
  "#companionTopic": { value: "" },
  "#customMaterialDetails": { open: false },
  "#interviewSource": { value: "bank" }
};
context.document.querySelector = (selector) => elements[selector] || null;
api.applyPdfTextToKrid("Grounded PDF notes.", "llm-security_notes.pdf");
assert.equal(elements["#notesInput"].value, "Grounded PDF notes.");
assert.equal(elements["#notesInput"].lastEvent.type, "input");
assert.equal(elements["#companionPackSelect"].value, "custom");
assert.equal(elements["#companionNotes"].value, "Grounded PDF notes.");
assert.equal(elements["#companionTopic"].value, "llm security notes");
assert.equal(elements["#customMaterialDetails"].open, true);
assert.equal(elements["#interviewSource"].value, "notes");

console.log("PDF import smoke passed: reconstruction, cleanup, validation, errors, and shared mode hand-off.");
