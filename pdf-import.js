"use strict";

const KRID_PDFJS_VERSION = "5.7.284";
const KRID_PDFJS_MODULE = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${KRID_PDFJS_VERSION}/build/pdf.min.mjs`;
const KRID_PDFJS_WORKER = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${KRID_PDFJS_VERSION}/build/pdf.worker.min.mjs`;
const KRID_PDF_MAX_BYTES = 20 * 1024 * 1024;
const KRID_PDF_MAX_PAGES = 60;
const KRID_PDF_MAX_CHARACTERS = 100000;

let kridPdfLibraryPromise = null;

function pdfFileProblem(file) {
  if (!file) return "Choose a PDF first.";
  const looksLikePdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name || "");
  if (!looksLikePdf) return "That file is not a PDF.";
  if (!file.size) return "That PDF appears to be empty.";
  if (file.size > KRID_PDF_MAX_BYTES) return "For this POC, choose a PDF smaller than 20 MB.";
  return "";
}

function pdfLineText(parts) {
  return parts.join(" ")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?%)\]])/g, "$1")
    .replace(/([(\[])\s+/g, "$1")
    .trim();
}

function textItemsToLines(items) {
  const lines = [];
  let parts = [];
  let baseline = null;

  const flush = () => {
    const line = pdfLineText(parts);
    if (line) lines.push(line);
    parts = [];
    baseline = null;
  };

  (items || []).forEach((item) => {
    const text = String(item?.str || "").replace(/\u0000/g, "").trim();
    const y = Number(item?.transform?.[5]);
    const hasBaseline = Number.isFinite(y);
    if (parts.length && hasBaseline && baseline !== null && Math.abs(y - baseline) > 3.5) flush();
    if (text) {
      parts.push(text);
      if (hasBaseline) baseline = y;
    }
    if (item?.hasEOL) flush();
  });
  flush();
  return lines.join("\n");
}

function pdfLooksLikeHeading(line) {
  const clean = String(line || "").trim().replace(/[:：]$/, "");
  if (!clean || clean.length > 70 || /[.!?]$/.test(clean)) return false;
  const words = clean.split(/\s+/);
  if (words.length > 9) return false;
  const titleWords = words.filter((word) => /^\p{Lu}/u.test(word.replace(/^[^\p{L}]+/u, ""))).length;
  return titleWords >= Math.ceil(words.length * .6)
    || /^(?:advantages?|limitations?|benefits?|drawbacks?|examples?|workflow|how it works|common vulnerabilities|key steps|types?|causes?|strategies)$/i.test(clean);
}

function reflowPdfLines(lines) {
  const output = [];
  (lines || []).forEach((rawLine) => {
    const line = String(rawLine || "").trim();
    if (!line) {
      if (output.length && output[output.length - 1] !== "") output.push("");
      return;
    }
    const previous = output[output.length - 1] || "";
    const lowercaseContinuation = /^[\p{Ll},;:)]/u.test(line);
    const listStart = /^(?:[-*•▪◦]+|\d+[.)]|[A-Za-z][.)])\s+/.test(line);
    if (previous && lowercaseContinuation && !listStart && !pdfLooksLikeHeading(previous)) {
      output[output.length - 1] = `${previous} ${line}`.replace(/\s+/g, " ");
    } else {
      output.push(line);
    }
  });
  return output.join("\n");
}

function cleanPdfText(pageTexts) {
  const normalized = (pageTexts || []).join("\n\n")
    .normalize("NFKC")
    .replace(/\u00a0/g, " ")
    .replace(/([\p{L}])-\s*\n\s*([\p{Ll}])/gu, "$1$2")
    .split("\n")
    .map((line) => line.replace(/[\t ]+/g, " ").trim());
  return reflowPdfLines(normalized)
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, KRID_PDF_MAX_CHARACTERS);
}

async function loadKridPdfLibrary() {
  if (!kridPdfLibraryPromise) {
    kridPdfLibraryPromise = import(KRID_PDFJS_MODULE).then((pdfjs) => {
      pdfjs.GlobalWorkerOptions.workerSrc = KRID_PDFJS_WORKER;
      return pdfjs;
    }).catch((error) => {
      kridPdfLibraryPromise = null;
      throw error;
    });
  }
  return kridPdfLibraryPromise;
}

async function extractTextFromPdf(file, onProgress = () => {}) {
  const problem = pdfFileProblem(file);
  if (problem) throw new Error(problem);
  onProgress("Loading the PDF reader…");
  const pdfjs = await loadKridPdfLibrary();
  const bytes = new Uint8Array(await file.arrayBuffer());
  const loadingTask = pdfjs.getDocument({ data: bytes });
  let pdf = null;
  try {
    pdf = await loadingTask.promise;
    const pagesRead = Math.min(pdf.numPages, KRID_PDF_MAX_PAGES);
    const pageTexts = [];
    for (let pageNumber = 1; pageNumber <= pagesRead; pageNumber += 1) {
      onProgress(`Reading page ${pageNumber} of ${pagesRead}…`);
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent({ includeMarkedContent: false });
      pageTexts.push(textItemsToLines(content.items));
      page.cleanup();
    }
    const text = cleanPdfText(pageTexts);
    if (text.replace(/\s/g, "").length < 80) {
      throw new Error("I could not find enough selectable text. This may be a scanned PDF; OCR is planned for a later enhancement.");
    }
    return { text, pagesRead, totalPages: pdf.numPages, truncated: pdf.numPages > pagesRead || text.length >= KRID_PDF_MAX_CHARACTERS };
  } finally {
    if (pdf) await pdf.destroy();
    else if (loadingTask?.destroy) await loadingTask.destroy();
  }
}

function friendlyPdfError(error) {
  const message = String(error?.message || error || "PDF extraction failed.");
  if (/password/i.test(message) || error?.name === "PasswordException") return "Password-protected PDFs are not supported in this POC.";
  if (/fetch|dynamically imported|network|load/i.test(message)) return "The PDF reader could not load. Connect to the internet once and try again; pasted notes still work offline.";
  if (/invalid pdf|missing pdf|format/i.test(message)) return "That PDF could not be read. Try exporting it again or paste its text instead.";
  return message;
}

function setPdfStatus(message, state = "") {
  [document.querySelector("#questPdfStatus"), document.querySelector("#companionPdfStatus")].filter(Boolean).forEach((status) => {
    status.textContent = message;
    status.classList.toggle("success", state === "success");
    status.classList.toggle("error", state === "error");
  });
}

function applyPdfTextToKrid(text, filename) {
  const title = String(filename || "My PDF").replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").trim() || "My PDF";
  const questNotes = document.querySelector("#notesInput");
  if (questNotes) {
    questNotes.value = text;
    questNotes.dispatchEvent(new Event("input", { bubbles: true }));
  }

  const pack = document.querySelector("#companionPackSelect");
  if (pack) {
    pack.value = "custom";
    pack.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const companionNotes = document.querySelector("#companionNotes");
  if (companionNotes) companionNotes.value = text;
  const companionTopic = document.querySelector("#companionTopic");
  if (companionTopic) companionTopic.value = title;
  const customMaterial = document.querySelector("#customMaterialDetails");
  if (customMaterial) customMaterial.open = true;
  const interviewSource = document.querySelector("#interviewSource");
  if (interviewSource) interviewSource.value = "notes";
}

async function handlePdfSelection(input) {
  const file = input.files?.[0];
  const label = input.closest(".pdf-upload-button");
  label?.classList.add("busy");
  label?.setAttribute("aria-busy", "true");
  try {
    const result = await extractTextFromPdf(file, (message) => setPdfStatus(message));
    applyPdfTextToKrid(result.text, file.name);
    const facts = window.KRID_SEMANTIC_ENGINE?.parseCompanionMaterial?.(result.text) || [];
    const pageLabel = `${result.pagesRead} page${result.pagesRead === 1 ? "" : "s"}`;
    const conceptLabel = `${facts.length} concept${facts.length === 1 ? "" : "s"}`;
    const limitation = result.truncated ? " The POC used the first readable section of this large PDF." : "";
    setPdfStatus(`Ready — ${pageLabel} and ${conceptLabel} extracted for Question Quest and Krid.${limitation}`, "success");
  } catch (error) {
    setPdfStatus(friendlyPdfError(error), "error");
  } finally {
    label?.classList.remove("busy");
    label?.removeAttribute("aria-busy");
    input.value = "";
  }
}

function initPdfImports() {
  document.querySelectorAll("[data-pdf-input]").forEach((input) => input.addEventListener("change", () => handlePdfSelection(input)));
}

window.KRID_PDF_IMPORT_TEST = { pdfFileProblem, textItemsToLines, pdfLooksLikeHeading, reflowPdfLines, cleanPdfText, friendlyPdfError, applyPdfTextToKrid };
initPdfImports();
