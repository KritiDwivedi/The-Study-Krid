"use strict";

const KRID_ACCESSIBILITY_KEY = "study-krid-easy-view-v1";
const KRID_AUDIO_MAX_BYTES = 25 * 1024 * 1024;
const KRID_AUDIO_MAX_SECONDS = 5 * 60;
const KRID_AUDIO_SAMPLE_RATE = 16000;
const KRID_TRANSFORMERS_MODULE = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1";
const KRID_WHISPER_MODEL = "onnx-community/whisper-tiny.en";

let lectureTranscriberPromise = null;
let notesRecognition = null;
let dictationRequested = false;
let dictationBase = "";
let dictationFinal = "";
let dictationInterim = "";
let dictationRestartTimer = null;
let dictationRestartDelay = 350;

function audioFileProblem(file) {
  if (!file) return "Choose an MP3 or WAV recording first.";
  const name = String(file.name || "");
  const supported = /\.(mp3|wav)$/i.test(name) || /^(audio\/mpeg|audio\/mp3|audio\/wav|audio\/wave|audio\/x-wav)$/i.test(file.type || "");
  if (!supported) return "For this POC, choose an MP3 or WAV recording.";
  if (!file.size) return "That audio file appears to be empty.";
  if (file.size > KRID_AUDIO_MAX_BYTES) return "For this POC, choose an audio file smaller than 25 MB.";
  return "";
}

function cleanTranscript(text) {
  const cleaned = String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
  if (!cleaned) return "";
  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}`;
}

function mergeTranscript(existing, incoming) {
  const current = String(existing || "").trim();
  const addition = cleanTranscript(incoming);
  if (!current) return addition;
  if (!addition) return current;
  return `${current}\n\n${addition}`;
}

function audioTitle(filename) {
  return String(filename || "Recorded lecture")
    .replace(/\.(mp3|wav)$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim() || "Recorded lecture";
}

function selectCustomStudyMaterial(title) {
  const pack = document.querySelector("#companionPackSelect");
  if (pack && pack.value !== "custom") {
    pack.value = "custom";
    pack.dispatchEvent(new Event("change", { bubbles: true }));
  }
  const topic = document.querySelector("#companionTopic");
  if (topic) topic.value = title || "Spoken notes";
  const details = document.querySelector("#customMaterialDetails");
  if (details) details.open = true;
  const interviewSource = document.querySelector("#interviewSource");
  if (interviewSource) interviewSource.value = "notes";
}

function applyTextToStudyModes(text, title = "Spoken notes") {
  const value = String(text || "").trim();
  selectCustomStudyMaterial(title);
  const notes = document.querySelector("#notesInput");
  if (notes) {
    notes.value = value;
    notes.dispatchEvent(new Event("input", { bubbles: true }));
  }
  const companionNotes = document.querySelector("#companionNotes");
  if (companionNotes) companionNotes.value = value;
  return value;
}

function setAccessibleInputStatus(message, state = "") {
  const status = document.querySelector("#accessibleInputStatus");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("success", state === "success");
  status.classList.toggle("error", state === "error");
}

function resampleAudioBuffer(buffer, targetRate = KRID_AUDIO_SAMPLE_RATE, maxSeconds = KRID_AUDIO_MAX_SECONDS) {
  if (!buffer || !Number.isFinite(buffer.sampleRate) || !buffer.length || !buffer.numberOfChannels) {
    throw new Error("The recording could not be decoded.");
  }
  const sourceRate = buffer.sampleRate;
  const sourceLength = Math.min(buffer.length, Math.floor(sourceRate * maxSeconds));
  const outputLength = Math.max(1, Math.floor(sourceLength * targetRate / sourceRate));
  const output = new Float32Array(outputLength);
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, index) => buffer.getChannelData(index));

  for (let outputIndex = 0; outputIndex < outputLength; outputIndex += 1) {
    const position = outputIndex * sourceRate / targetRate;
    const left = Math.min(sourceLength - 1, Math.floor(position));
    const right = Math.min(sourceLength - 1, left + 1);
    const blend = position - left;
    let sample = 0;
    channels.forEach((channel) => { sample += channel[left] + (channel[right] - channel[left]) * blend; });
    output[outputIndex] = sample / channels.length;
  }

  const originalDuration = buffer.length / sourceRate;
  return {
    audio: output,
    originalDuration,
    usedDuration: sourceLength / sourceRate,
    truncated: originalDuration > maxSeconds
  };
}

async function decodeLectureAudio(file) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) throw new Error("This browser cannot decode uploaded audio. Try current Chrome or Edge.");
  const context = new AudioContextClass();
  try {
    const buffer = await context.decodeAudioData(await file.arrayBuffer());
    return resampleAudioBuffer(buffer);
  } finally {
    await context.close().catch(() => {});
  }
}

function progressMessage(progress) {
  if (progress?.status === "progress" && Number.isFinite(progress.progress)) {
    return `Preparing the local speech model… ${Math.round(progress.progress)}%`;
  }
  if (progress?.status === "ready") return "Speech model ready. Listening to the recording…";
  return "Preparing the in-browser speech model… first use may take a moment.";
}

async function loadLectureTranscriber() {
  if (!lectureTranscriberPromise) {
    lectureTranscriberPromise = import(KRID_TRANSFORMERS_MODULE)
      .then(async ({ pipeline, env }) => {
        env.allowLocalModels = false;
        const options = (device) => ({
          device,
          progress_callback: (progress) => setAccessibleInputStatus(progressMessage(progress))
        });
        let device = "wasm";
        if (navigator.gpu) {
          try { if (await navigator.gpu.requestAdapter()) device = "webgpu"; } catch { /* use WASM */ }
        }
        try {
          return await pipeline("automatic-speech-recognition", KRID_WHISPER_MODEL, options(device));
        } catch (error) {
          if (device !== "webgpu" || !/webgpu|gpu|adapter|shader|device/i.test(String(error?.message || error))) throw error;
          setAccessibleInputStatus("GPU acceleration was unavailable. Switching to the compatible browser engine…");
          return pipeline("automatic-speech-recognition", KRID_WHISPER_MODEL, options("wasm"));
        }
      })
      .catch((error) => {
        lectureTranscriberPromise = null;
        throw error;
      });
  }
  return lectureTranscriberPromise;
}

function friendlyAudioError(error) {
  const message = String(error?.message || error || "Audio transcription failed.");
  if (/decode|encoding|format|codec/i.test(message)) return "I could not decode that recording. Try exporting it as a standard MP3 or WAV.";
  if (/memory|allocation|out of memory/i.test(message)) return "That recording was too demanding for this device. Try a shorter clip for the POC.";
  if (/fetch|network|dynamically imported|load|failed to resolve/i.test(message)) return "The speech model could not load. Connect to the internet for its first download, then try again.";
  return message;
}

async function handleLectureAudio(input) {
  const file = input.files?.[0];
  const problem = audioFileProblem(file);
  const label = input.closest(".audio-upload-button");
  if (problem) {
    setAccessibleInputStatus(problem, "error");
    input.value = "";
    return;
  }
  label?.classList.add("busy");
  label?.setAttribute("aria-busy", "true");
  try {
    setAccessibleInputStatus("Decoding the recording locally…");
    const decoded = await decodeLectureAudio(file);
    const transcriber = await loadLectureTranscriber();
    const durationLabel = decoded.usedDuration < 60
      ? `${Math.max(1, Math.ceil(decoded.usedDuration))} seconds`
      : `${Math.ceil(decoded.usedDuration / 60)} minutes`;
    setAccessibleInputStatus(`Transcribing ${durationLabel} in this browser…`);
    const result = await transcriber(decoded.audio, { chunk_length_s: 30, stride_length_s: 5 });
    const transcript = cleanTranscript(result?.text);
    if (transcript.replace(/\s/g, "").length < 40) throw new Error("I could not detect enough clear speech. Try a louder or shorter recording.");

    const notes = document.querySelector("#notesInput");
    const merged = mergeTranscript(notes?.value, transcript);
    applyTextToStudyModes(merged, audioTitle(file.name));
    const concepts = window.KRID_SEMANTIC_ENGINE?.parseCompanionMaterial?.(merged) || [];
    const limit = decoded.truncated ? " For this POC, only the first five minutes were used." : "";
    setAccessibleInputStatus(`Ready — ${concepts.length} concept${concepts.length === 1 ? "" : "s"} detected for Question Quest and Krid.${limit}`, "success");
  } catch (error) {
    setAccessibleInputStatus(friendlyAudioError(error), "error");
  } finally {
    label?.classList.remove("busy");
    label?.removeAttribute("aria-busy");
    input.value = "";
  }
}

function updateDictationButton(listening) {
  const button = document.querySelector("#dictateNotesButton");
  if (!button) return;
  button.classList.toggle("listening", listening);
  button.setAttribute("aria-pressed", String(listening));
  const strong = button.querySelector("strong");
  const small = button.querySelector("small");
  if (strong) strong.textContent = listening ? "Stop listening" : "Speak my notes";
  if (small) small.textContent = listening ? "Long mode is on—brief pauses are okay" : "Long dictation · auto-renews sessions";
}

function dictationWordCount(text) {
  return (String(text || "").trim().match(/\S+/g) || []).length;
}

function dictationErrorIsFatal(error) {
  return ["not-allowed", "service-not-allowed", "audio-capture", "language-not-supported"].includes(String(error || ""));
}

function renderedDictation(interim = dictationInterim) {
  return [dictationBase, dictationFinal, cleanTranscript(interim)].filter(Boolean).join(dictationBase ? "\n\n" : " ").trim();
}

function commitDictationInterim() {
  if (!dictationInterim) return;
  dictationFinal = mergeTranscript(dictationFinal, dictationInterim);
  dictationInterim = "";
  applyTextToStudyModes(renderedDictation(), "Spoken notes");
}

function scheduleDictationRestart(recognition, reason = "The browser renewed the microphone session") {
  if (!dictationRequested) return;
  window.clearTimeout(dictationRestartTimer);
  updateDictationButton(true);
  const words = dictationWordCount(renderedDictation());
  setAccessibleInputStatus(`${reason}. Still listening—continue speaking.${words ? ` ${words} words safely captured.` : ""}`);
  dictationRestartTimer = window.setTimeout(() => {
    dictationRestartTimer = null;
    if (!dictationRequested) return;
    try {
      recognition.start();
    } catch {
      dictationRestartDelay = Math.min(1800, dictationRestartDelay + 250);
      scheduleDictationRestart(recognition, "The microphone is reconnecting");
    }
  }, dictationRestartDelay);
}

function stopNotesDictation(message = "Dictation stopped. Your notes are ready to edit or play.", state = "success") {
  dictationRequested = false;
  window.clearTimeout(dictationRestartTimer);
  dictationRestartTimer = null;
  updateDictationButton(false);
  try { notesRecognition?.stop(); } catch { /* recognizer already stopped */ }
  if (message) setAccessibleInputStatus(message, state);
}

function initialiseNotesRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) return null;
  const recognition = new Recognition();
  recognition.lang = navigator.language || "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;
  recognition.onstart = () => {
    dictationRestartDelay = 350;
    updateDictationButton(true);
    const words = dictationWordCount(renderedDictation());
    setAccessibleInputStatus(`Listening in long-dictation mode… tap Stop only when finished.${words ? ` ${words} words captured.` : ""}`);
  };
  recognition.onresult = (event) => {
    let interim = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const words = event.results[index][0]?.transcript || "";
      if (event.results[index].isFinal) dictationFinal = mergeTranscript(dictationFinal, words);
      else interim += ` ${words}`;
    }
    dictationInterim = cleanTranscript(interim);
    const rendered = applyTextToStudyModes(renderedDictation(), "Spoken notes");
    setAccessibleInputStatus(`Listening… ${dictationWordCount(rendered)} words captured. Pause naturally or tap Stop when finished.`);
  };
  recognition.onerror = (event) => {
    if (!dictationRequested) return;
    if (dictationErrorIsFatal(event.error)) {
      const denied = event.error === "not-allowed" || event.error === "service-not-allowed";
      const message = denied
        ? "Microphone access was blocked. Allow it in your browser controls and try again."
        : "The microphone device or selected language is unavailable. Your captured notes were kept.";
      stopNotesDictation(message, "error");
      return;
    }
    const message = event.error === "no-speech"
      ? "Still listening—take your time. The microphone will renew after a quiet pause."
      : "The browser briefly interrupted dictation. Your words are safe and the microphone is reconnecting…";
    setAccessibleInputStatus(message);
  };
  recognition.onend = () => {
    commitDictationInterim();
    if (dictationRequested) scheduleDictationRestart(recognition);
    else updateDictationButton(false);
  };
  return recognition;
}

function toggleNotesDictation() {
  if (dictationRequested) {
    stopNotesDictation();
    return;
  }
  if (!notesRecognition) notesRecognition = initialiseNotesRecognition();
  if (!notesRecognition) {
    setAccessibleInputStatus("Live dictation is unavailable in this browser. Try current Chrome or Edge, or upload an MP3/WAV.", "error");
    return;
  }
  const notes = document.querySelector("#notesInput");
  dictationBase = String(notes?.value || "").trim();
  dictationFinal = "";
  dictationInterim = "";
  selectCustomStudyMaterial("Spoken notes");
  dictationRequested = true;
  try {
    notesRecognition.start();
  } catch {
    stopNotesDictation("The microphone is already starting. Wait a moment and try again.", "error");
  }
}

function readEasyViewPreference(storage = window.localStorage) {
  try { return storage.getItem(KRID_ACCESSIBILITY_KEY) === "true"; } catch { return false; }
}

function applyEasyView(enabled, storage = window.localStorage) {
  const active = Boolean(enabled);
  document.documentElement.classList.toggle("accessibility-mode", active);
  const button = document.querySelector("#accessibilityToggle");
  button?.setAttribute("aria-pressed", String(active));
  button?.setAttribute("title", active ? "Turn Easy view off" : "Turn Easy view on");
  const label = button?.querySelector(".accessibility-label");
  if (label) label.textContent = active ? "Easy view on" : "Easy view";
  const status = document.querySelector("#accessibilityStatus");
  if (status) status.textContent = active
    ? "Easy view is on. Text, contrast, focus indicators, and spacing are increased; decorative motion is reduced."
    : "Easy view is off.";
  try { storage.setItem(KRID_ACCESSIBILITY_KEY, String(active)); } catch { /* storage may be unavailable */ }
  return active;
}

function initAccessibleInputs() {
  applyEasyView(readEasyViewPreference());
  document.querySelector("#accessibilityToggle")?.addEventListener("click", (event) => {
    const enabled = event.currentTarget.getAttribute("aria-pressed") !== "true";
    applyEasyView(enabled);
  });
  document.querySelector("#dictateNotesButton")?.addEventListener("click", toggleNotesDictation);
  document.querySelector("#lectureAudioInput")?.addEventListener("change", (event) => handleLectureAudio(event.currentTarget));
}

window.KRID_ACCESSIBILITY_TEST = {
  audioFileProblem,
  cleanTranscript,
  mergeTranscript,
  audioTitle,
  resampleAudioBuffer,
  applyTextToStudyModes,
  readEasyViewPreference,
  applyEasyView,
  dictationWordCount,
  dictationErrorIsFatal
};

initAccessibleInputs();
