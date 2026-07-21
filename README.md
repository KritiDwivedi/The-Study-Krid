# The Study Krid

**Learn. Play. Conquer.**

The Study Krid is an original, installable browser learning adventure with an animated voice-only companion at its centre. Learners can teach Krid, practise retrieval, discuss their own material, rehearse interviews, fight a personalised Dark Krid boss, or turn curriculum concepts and notes into explorable game rooms.

The project is designed for the **Education** track. It runs in the browser with no build step, login, paid service, or API key. Optional PDF and prerecorded-audio POCs load pinned browser libraries/models only when first used; the selected files are processed locally in the browser.

## Why it is useful

- Six deep featured worlds cover fractions, photosynthesis, JavaScript, the Solar System, human digestion, and climate science.
- **Talk to Krid** is a voice-only conversation experience with four modes: Teach Krid, Memory Adventure, Interview Krid, and grounded note discussion. Krid speaks every prompt and the learner answers aloud—there is no written chat or text composer.
- Krid reacts with animated listening, thinking, confusion, celebration, interviewer, talking, and Dark Krid states. It remembers the session locally and builds a visible relationship level.
- The same refined semantic note structure now powers both the voice companion and Question Quest. Headings become named concepts, pronoun fragments remain attached to their antecedents, and a heading or fragment can never be used as the explanatory correct option.
- A shared **Upload PDF** POC extracts selectable text from a PDF into both Question Quest and the voice assistant. It reports pages and detected concepts, limits large files safely, and explains when a scanned/image-only document needs future OCR instead of generating poor questions.
- PDF refinement reconstructs lowercase line wraps and short trailing fragments before concept detection. Incomplete fragments ending in “and,” “of,” or similar connector words are rejected as headings, while a following statement such as “RAG systems evolve…” begins its own sensible concept.
- A prominent **Speak my notes** control uses browser speech recognition to turn live speech into editable notes immediately. Long-dictation mode preserves interim words, automatically renews browser microphone sessions after timeouts or quiet pauses, and only stops for the learner, a denied permission, or an unavailable device. The same transcript is handed to both Question Quest and Krid.
- An **Upload a lecture** POC accepts MP3 and WAV recordings, decodes them locally, runs a small Whisper automatic-speech-recognition model in the browser, and turns the transcript into quiz and voice-companion material. The first five minutes and files up to 25 MB are supported to keep the hackathon demo dependable.
- A persistent **Easy view** switch provides a high-contrast, low-motion visual and sensory adaptation: larger type, generous line spacing, clearer panels, 46-pixel controls, stronger keyboard focus rings, simpler backgrounds, and fewer decorative effects. The controls and progress messages are labelled for assistive technology.
- The local semantic evaluator uses stemming, paraphrase groups, concept-weighted evidence, meaning-unit coverage, list-item coverage, and contradiction checks. It distinguishes a relevant paraphrase from a fluent but unrelated answer, requires broader coverage for multi-point questions, and speaks every important point that was still missing.
- Learners are graded on the core meaning rather than sentence reproduction. Natural summaries such as “one AI grades another AI's answer” are accepted for LLM-as-a-Judge when they preserve the concept.
- Semantic Engine 4 also accepts conversational abstractions such as “one AI checks whether a different AI gave a good answer,” using meaning groups and distinct concept evidence instead of requiring note vocabulary.
- Saying “I don't know” is different from asking for a hint: a hint reveals one clue, while “I don't know” and clearly wrong answers trigger the complete refined explanation before the concept is scheduled for later retrieval.
- Companion sessions use the version-3 source schema: the original notes are stored locally with the refined concepts, so a complete correction can recover the entire matching source paragraph even if an individual concept card was shortened. Coreference such as “this behavior” remains attached to its named concept, and standalone headings with numbered details become one complete multi-point concept. Older companion sessions are invalidated automatically so the improved note structure is rebuilt.
- Speech recognition considers up to five browser alternatives and chooses the one that best fits the active concept. Recognition stops immediately after submission, assistant-voice echoes are rejected, and source/definition sentence merging uses containment deduplication to prevent repeated narration.
- A hierarchical note refiner turns unordered paragraphs, headings, numbered concepts, section lists, and multi-line explanations into clean concept cards. It generates context-sensitive what/why/how/compare questions instead of reading sentence fragments as titles.
- Teach, Memory, and Interview modes use shuffled non-repeating decks, while weak-area commands still target low-mastery concepts adaptively.
- Interview mode includes General, Software, Data, Product, and Behavioral question banks and can alternatively generate grounded interview questions from the selected notes or mix both sources.
- A large tap-to-talk control, animated listening/talking states, automatic spoken-response submission, replay, and a spoken progress summary make the companion genuinely hands-free after setup.
- Krid now behaves like an expressive original learning mascot: while the microphone is open, the character tilts its head, tracks the learner, moves its hands, and shows listening rings. Strong answers trigger a joyful wave and star burst, partial answers receive an encouraging nod, and incorrect answers get a gentle head shake before a helpful spoken correction. Easy View and reduced-motion preferences disable this choreography automatically.
- Krid's speech output is female-only. The app waits for the browser's delayed voice list, selects a recognised English female voice by name, explicitly excludes known male voices, and refuses to use the browser's arbitrary default when no female voice is installed.
- Seven ready-made voice topic packs avoid typing entirely. Learners can optionally paste their own source material once before beginning a fully spoken session.
- After three evaluated responses, **Dark Krid** is generated from the lowest-mastery concepts as a personalised memory boss.
- The searchable **Topic Atlas** offers 240 suggestions across 12 fields and also accepts any typed topic. When connected, it turns a live encyclopedia extract into a source-grounded quest.
- The flexible local note engine detects up to 60 ideas in paragraphs, bullets, numbered lists, headings, `Term: explanation` notes, syllabi, dictated material, pasted PDF text, and text-based PDF uploads. No special note format is required, and each Question Quest samples six playable concepts from across a long note pool.
- Each room uses a learn → flip-card → confidence check → retrieval battle loop instead of trivia-only gameplay.
- Long memory anchors no longer get clipped: flipped cards grow to a comfortable height and provide their own keyboard/touch scroll area when the source is unusually long.
- Completed route nodes are interactive review portals in both standard and Easy view. Learners can reopen any prior question, practise without spending energy or changing rewards, and return to their true current mission.
- Note-generated multiple choice questions use only genuine concepts from the supplied material. Small source sets show two or three credible choices instead of obvious filler, while reverse clues conceal the answer term and shorten rambling dictated passages.
- Study styles include **Explain like I’m 10**, **Story quest**, and **Exam mode**.
- Correct answer spells unlock doors, award XP and coins, and unlock the Hint Lens, Focus Shield, and Double XP Chip. Wrong answers trigger humorous targeted hints without removing progress.
- Mastery and self-reported confidence are tracked per concept; both influence which weak concepts the final boss asks first.
- The final report includes a four-step spaced-repetition schedule and can launch a focused weak-area rematch.
- Progress saves automatically in `localStorage`; reports can be downloaded and results can be shared.
- The app is responsive, keyboard accessible, installable as a PWA, and works offline after its first hosted visit.

## Run it

The quickest option is to open `index.html` directly in a modern browser.

For full install/offline PWA behavior, serve the folder locally:

```bash
cd the-study-krid
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

No package installation or API key is required. Featured worlds and pasted-note quests work offline; opening a Topic Atlas article or loading the PDF reader or lecture speech model for the first time requires an internet connection. PDF and uploaded-audio contents stay in the browser and are not sent to an AI API. The PDF POC supports selectable text up to 20 MB and the first 60 pages; scanned PDFs require future OCR. The audio POC accepts MP3/WAV files up to 25 MB and transcribes the first five minutes in English. Performance depends on the learner's device. Live dictation and voice conversations require a browser with Web Speech recognition and microphone permission; Chrome or Edge is recommended. Depending on the browser, live recognition may use its online speech service.

## How to play

1. Choose a featured world, search the Topic Atlas, paste notes in any format, speak notes, upload a text-based PDF, or upload an MP3/WAV lecture.
2. Enter each concept room, read the lesson, flip its flashcard, and rate your confidence.
3. Cast an answer spell to stun the Confusion Blob and unlock the next door.
4. Unlock the Hint Lens, Focus Shield, and Double XP Chip.
5. Defeat the final boss and use the mastery report to plan the next revision session.

Keyboard controls: use `1`–`4` to select answers and `Enter` to continue.

Alternatively, press **Talk to Krid**, choose a mode and topic pack or interview role, and wake Krid. Listen to its prompt, tap the microphone, and answer aloud. You can say commands such as “hint,” “repeat,” “next question,” “show model answer,” and “quiz my weakest area.”

## Technical design

- `index.html` — semantic application structure for the builder, animated companion, quest game, and mastery report
- `style.css` — responsive visual system, original code-drawn characters, animation, battle effects, and accessibility states
- `curriculum.js` — six original curriculum packs, 24 concepts, and 48 validated questions
- `app.js` — quest state machine, format-flexible note engine, 240-topic atlas, source-grounded question generator, confidence/mastery adaptation, weak-area rematches, persistence, Web Audio feedback, report export, and canvas ambience
- `krid-companion.js` — hierarchical note refinement, local semantic response scoring, adaptive shuffled retrieval, grounded discussion/comparison, note-generated interview coaching, browser voice controls, topic packs, persistent relationship/memory model, spoken progress summaries, and Dark Krid boss
- `pdf-import.js` — shared client-side PDF text extraction, progress/error handling, scanned-document detection, and hand-off to both learning modes
- `accessible-input.js` — live note dictation, lazy in-browser lecture transcription, audio decoding/resampling, shared transcript hand-off, and persistent Easy view state
- `manifest.webmanifest`, `sw.js`, and `assets/icon.svg` — installable offline PWA shell
- `tests/logic-smoke.js` — automated checks for paragraph/bullet/numbered-note parsing, atlas size, and generated-question integrity
- `tests/companion-smoke.js` — automated checks for concept extraction, strong-versus-vague answer scoring, retrieval, custom interview grounding, and session construction
- `tests/pdf-import-smoke.js` — automated checks for PDF text-line reconstruction, cleanup, file validation, and friendly limitation messages
- `tests/accessibility-smoke.js` — automated checks for audio validation/resampling, transcript hand-off to both modes, and persistent Easy view behavior
- `tests/browser-smoke.js` — full real-browser interaction route for Teach Krid, Interview Krid, metrics, and Dark Krid

All artwork, sounds, interface elements, copy, and learning content in this repository are original or generated directly in code. There are no third-party trademarks, copyrighted characters, music files, or fonts. The optional PDF importer uses Mozilla [PDF.js](https://github.com/mozilla/pdf.js), distributed under the Apache-2.0 license. The optional lecture POC uses pinned [Transformers.js](https://huggingface.co/docs/transformers.js/) and a browser-compatible Whisper Tiny English model, both loaded only on demand.

## Collaboration with Codex and GPT-5.6

This project was created during the hackathon in collaboration with Codex powered by GPT-5.6.

Codex accelerated:

- turning the initial “StudyForge plus a funny educational game” idea into a concrete game loop and product architecture;
- creating the original responsive interface and code-drawn visual identity;
- implementing the quest state machine, room and door progression, battle effects, local persistence, flexible notes-to-quest engine, Topic Atlas importer, adaptive mastery/confidence model, spaced revision, report export, Web Audio cues, and PWA support;
- building the accessibility POC as one coherent input layer: live dictation, local audio decoding and resampling, lazy Whisper transcription, assistive status announcements, and a persistent low-motion Easy view;
- designing and implementing Krid as an animated offline character with a deterministic, explainable learning engine rather than disguising a rule-based system as an unrestricted chatbot;
- drafting and validating the original learning content across six subject worlds;
- checking JavaScript syntax and automatically validating both curated and generated question structures across paragraphs, bullets, numbered notes, and mixed formatting.

The key human product decisions were to keep the app genuinely useful for revision, make it work without an API key, include both curated and learner-provided content, use humor without weakening the learning, and avoid third-party intellectual property. GPT-5.6 and Codex translated those decisions into the finished interaction design, code, content system, and verification workflow.

## Suggested sub-three-minute demo

- **0:00–0:20** — problem and one-sentence pitch
- **0:20–0:45** — open Talk to Krid, choose a ready-made topic pack, and hear Krid begin Teach mode
- **0:45–1:20** — answer aloud, show the automatic evaluation and Krid's animated spoken feedback, then improve the answer
- **1:20–1:50** — switch to Interview Krid, answer aloud, and hear structured coaching plus a model-answer map
- **1:50–2:20** — show Krid's persistent memory map and fight the personalised Dark Krid boss
- **2:20–2:30** — briefly show that the original explorable quest worlds remain available
- **2:30–2:45** — toggle Easy view, speak one note, and show an uploaded lecture transcript becoming a quest
- **2:45–2:58** — show the file architecture and explain how Codex/GPT-5.6 accelerated implementation and validation

## Privacy

The app has no analytics and does not upload notes or prerecorded lecture audio itself. Uploaded MP3/WAV files are decoded and transcribed inside the browser after the speech model is downloaded. Only the optional Topic Atlas sends a topic title to Wikipedia and retrieves its article extract; pasted notes are never included in that request. Live speech recognition is provided by the browser and may send microphone audio to the browser vendor's speech service, depending on that browser and operating system.

## License

MIT. See [LICENSE](LICENSE).
