# Lesson Factory V1

## Decision record
- React + TypeScript on the supplied Vite/Vinext host. Client components own the authoring workspace; one server route protects AI credentials. No database or accounts.
- Zod validates intake, generated JSON, imported backups and persisted records. AI responses get one repair attempt, then a recoverable error. No model-generated HTML.
- A Lesson owns input, editable Blueprint, monotonic blueprintRevision, and independently versioned worksheet/game/assessment data. Editing a confirmed Blueprint returns it to draft and marks old materials stale. Reconfirmation requires valid fields and matching activity duration.
- UI: Dashboard → Intake → Blueprint editor → Materials Studio (worksheet / fixed game engine / assessment). Settings and backup/import are first-class navigation actions.
- LocalStorage uses versioned envelopes, a previous valid snapshot, immediate writes, quota/read failures shown to teachers, and cross-tab conflict detection. Import validates the entire file before mutation and imports lessons under fresh IDs.
- AIProvider interface is implemented by a deterministic mock and an HTTP provider. All prompts are isolated in src/prompts. Same Zod response schemas validate both modes.
- Consistency checks include declared vocabulary plus student-facing English tokens against Blueprint vocabulary/expressions and a bounded functional-language allowlist. Unrecognized terms are shown; a teacher must add them to the Blueprint and reconfirm. This lexical check is deliberately not claimed to prove semantic accuracy.
- Three fixed accessible engines: Quiz Show (first-attempt scoring), Speed Quiz (wall-clock deadline), Matching (buttons, mouse/touch/keyboard). Engines never interpret HTML.
- Printing uses browser print, A4, teacher answer key excluded, question-level break avoidance.

## Design provenance
Project-local skill: `.agents/skills/landing-page-design/SKILL.md` from elayadesign/ai-design-skills at `ded7efc9d5c02761c41a03caf3b78f9259ab8828` (MIT). Read and applied its typography scale, spacing, radius, interaction states and reduced-motion guidance. Per user instruction, marketing structure, promotional testimonials, hero/FAQ and tagline animation are omitted. Korean typography uses local system Korean fallbacks; no network font dependency.

## Trust boundaries
Browser sends validated content to `/api/ai`. API base URL, API key and model are server environment values only. No frontend key input, remote model HTML, student identifiers or student results. AI output is untrusted plain data. Hosted access remains owner-private. Public third-party deployment requires appropriate gateway protection for the AI endpoint.

## GitHub Pages target
The existing client workspace also mounts through src/pages-main.tsx. Vite's separate Pages config generates versioned static assets for main/root Pages hosting. Hash routing preserves deep links below /lesson-factory/. The server-backed Sites target is retained. Pages calls an optional HTTPS gateway configured by the teacher. api-worker/index.ts authenticates the independent APP_ACCESS_TOKEN before invoking the shared validated Groq handler. The access token and endpoint are stored in a separate browser-local record at the owner’s explicit request, excluded from backups and removable in settings. The Groq key remains server-only. No external account provisioning or provider request is performed without user configuration.


## Additional materials
Optional typed Lesson fields flashcards/slides/wordquiz preserve version-1 backup compatibility. The shared extra AI action uses prompts/extra.ts, the same repair pathway and deterministic mocks. ExtraStudio separates generation, review, editing, print and player. All materials preserve Blueprint revisions and vocabulary checks. PowerPoint export lazy-loads PptxGenJS, with editable native text and notes. slidePages bounds content identically for preview, presentation and export. Quiz attempts are ephemeral. Async generation merges only its material field, preserving newer edits to the rest of the lesson.
