# Welcome Screen — Functional Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every interactive element on the welcome screen do real work — open files via Tauri dialog, persist recent files and custom templates in localStorage, and let users set frame count when creating an animated sprite.

**Architecture:** All persistence is localStorage (no backend DB needed — files are referenced by path). PNG import uses `@tauri-apps/plugin-dialog` to pick the path, then a new Rust command `import_png` to read pixel data, returning a flat array that the frontend assembles into a `Frame`. Recent files and saved templates are arrays stored under `sindri_recent` and `sindri_templates` keys.

**Tech Stack:** React 18 + TypeScript, Tauri 2, `@tauri-apps/plugin-dialog`, `@tauri-apps/api/core` (invoke), localStorage, existing Rust command infrastructure in `src-tauri/src/commands.rs`.

---

## File Map

| File | Change |
|---|---|
| `src-tauri/src/commands.rs` | Add `import_png` command — reads PNG from path, returns `{ w, h, pixels: number[] }` |
| `src-tauri/src/lib.rs` | Register `import_png` in invoke handler |
| `src/lib/storage.ts` | **Create** — read/write recent files and saved templates to localStorage |
| `src/components/Welcome.tsx` | Wire frame-count input, load recents + templates from storage, update on open/create |
| `src/App.tsx` | Wire `onOpenFile` to real import flow; pass `onProjectOpened` callback to write recent |

---

### Task 1: Rust `import_png` command

**Files:**
- Modify: `src-tauri/src/commands.rs`
- Modify: `src-tauri/src/lib.rs`

- [ ] **Step 1.1 — Add the command to commands.rs**

Append to `src-tauri/src/commands.rs`:

```rust
/// Read a PNG from disk. Returns width, height, and flat RGBA pixel array.
/// Each pixel is 4 bytes: [r, g, b, a]. Transparent pixels (a == 0) are
/// returned with rgb == 0 so the frontend can treat them as null.
#[command]
pub async fn import_png(path: String) -> Result<serde_json::Value, String> {
    use std::io::BufReader;
    let file = std::fs::File::open(&path).map_err(|e| e.to_string())?;
    let decoder = png::Decoder::new(BufReader::new(file));
    let mut reader = decoder.read_info().map_err(|e| e.to_string())?;
    let mut buf = vec![0u8; reader.output_buffer_size()];
    let info = reader.next_frame(&mut buf).map_err(|e| e.to_string())?;
    let w = info.width;
    let h = info.height;
    // Normalise to RGBA
    let rgba: Vec<u8> = match info.color_type {
        png::ColorType::Rgba => buf[..info.buffer_size()].to_vec(),
        png::ColorType::Rgb => {
            let src = &buf[..info.buffer_size()];
            src.chunks(3).flat_map(|c| [c[0], c[1], c[2], 255u8]).collect()
        }
        png::ColorType::GrayscaleAlpha => {
            let src = &buf[..info.buffer_size()];
            src.chunks(2).flat_map(|c| [c[0], c[0], c[0], c[1]]).collect()
        }
        png::ColorType::Grayscale => {
            let src = &buf[..info.buffer_size()];
            src.iter().flat_map(|&v| [v, v, v, 255u8]).collect()
        }
        _ => return Err("unsupported PNG color type".to_string()),
    };
    // Convert flat RGBA bytes to Vec<u32> where 0 == transparent
    let pixels: Vec<u32> = rgba
        .chunks(4)
        .map(|c| {
            if c[3] == 0 { 0u32 }
            else { ((c[0] as u32) << 16) | ((c[1] as u32) << 8) | (c[2] as u32) | 0xFF00_0000u32 }
        })
        .collect();
    Ok(serde_json::json!({ "w": w, "h": h, "pixels": pixels }))
}
```

- [ ] **Step 1.2 — Register in lib.rs**

In `src-tauri/src/lib.rs`, add `commands::import_png` to the invoke handler:

```rust
.invoke_handler(tauri::generate_handler![
    commands::read_sprite_file,
    commands::write_sprite_file,
    commands::export_png,
    commands::import_png,
])
```

- [ ] **Step 1.3 — Verify Rust compiles**

```bash
cd src-tauri && cargo check 2>&1 | grep -E "^error" | head -20
```

Expected: no lines (clean). If there are errors, fix before continuing.

- [ ] **Step 1.4 — Commit**

```bash
git add src-tauri/src/commands.rs src-tauri/src/lib.rs
git commit -m "feat(rust): add import_png command — reads PNG, returns w/h/pixels"
```

---

### Task 2: localStorage storage layer

**Files:**
- Create: `src/lib/storage.ts`

- [ ] **Step 2.1 — Create `src/lib/storage.ts`**

```typescript
// src/lib/storage.ts
// ── Types ────────────────────────────────────────────────────────────────────

export interface RecentFile {
  id: string;           // uuid-ish, stable across sessions
  name: string;         // display name, e.g. "drone_idle.spr"
  path: string;         // absolute FS path (used for re-opening)
  spec: string;         // human label, e.g. "32 × 32 · 4 frames"
  timestamp: number;    // Date.now() at last open/create
}

export interface SavedTemplate {
  id: string;
  name: string;
  w: number;
  h: number;
  frames: number;
  animated: boolean;
  profile: string;
}

// ── Keys ─────────────────────────────────────────────────────────────────────

const RECENT_KEY    = 'sindri_recent';
const TEMPLATE_KEY  = 'sindri_templates';
const MAX_RECENT    = 8;

// ── Helpers ───────────────────────────────────────────────────────────────────

function load<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '[]') as T[];
  } catch {
    return [];
  }
}

function save<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch { /* storage full — silently skip */ }
}

// ── Recent files ──────────────────────────────────────────────────────────────

export function getRecents(): RecentFile[] {
  return load<RecentFile>(RECENT_KEY);
}

/** Upsert an entry by path, bump it to the front, trim to MAX_RECENT. */
export function pushRecent(entry: Omit<RecentFile, 'id'> & { id?: string }): RecentFile {
  const existing = load<RecentFile>(RECENT_KEY);
  const id = entry.id ?? (entry.path + '_' + Date.now());
  const next: RecentFile = { ...entry, id, timestamp: Date.now() };
  const filtered = existing.filter((r) => r.path !== entry.path);
  save(RECENT_KEY, [next, ...filtered].slice(0, MAX_RECENT));
  return next;
}

export function clearRecents(): void {
  save(RECENT_KEY, []);
}

// ── Saved templates ────────────────────────────────────────────────────────────

export function getSavedTemplates(): SavedTemplate[] {
  return load<SavedTemplate>(TEMPLATE_KEY);
}

export function saveTemplate(t: Omit<SavedTemplate, 'id'>): SavedTemplate {
  const existing = load<SavedTemplate>(TEMPLATE_KEY);
  const id = 'tmpl_' + Date.now();
  const entry: SavedTemplate = { ...t, id };
  save(TEMPLATE_KEY, [...existing, entry]);
  return entry;
}

export function deleteTemplate(id: string): void {
  const existing = load<SavedTemplate>(TEMPLATE_KEY);
  save(TEMPLATE_KEY, existing.filter((t) => t.id !== id));
}
```

- [ ] **Step 2.2 — TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: no output (clean).

- [ ] **Step 2.3 — Commit**

```bash
git add src/lib/storage.ts
git commit -m "feat: add localStorage storage layer for recents and saved templates"
```

---

### Task 3: Frame count input in NewProjectModal

**Files:**
- Modify: `src/components/Welcome.tsx`

The animated toggle currently shows a description but has no way to change frame count (hardcoded at 4). Add a compact `+`/`−` stepper inline with the toggle row.

- [ ] **Step 3.1 — Add the stepper after the animated toggle row**

In `Welcome.tsx`, locate the `npToggleDesc` div that follows the animated toggle (the one that mentions "Starts with N frames"). Replace:

```tsx
        <div style={wStyles.npToggleDesc}>
          {animated
            ? `Starts with ${frames} frames. Add or remove anytime from the timeline.`
            : 'Single frame. The timeline stays available — add frames later from a hotkey or the bottom bar.'}
        </div>
```

With:

```tsx
        {animated && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 22px 10px' }}>
            <span style={wStyles.npLabel}>frames</span>
            <span
              style={wStyles.npCustomNum as React.CSSProperties}
              onClick={() => setFrames((f) => Math.max(2, f - 1))}
              role="button"
              aria-label="fewer frames"
            >−</span>
            <span style={{ ...wStyles.npCustomNum as React.CSSProperties, cursor: 'default', width: 40, textAlign: 'center' }}>
              {frames}
            </span>
            <span
              style={wStyles.npCustomNum as React.CSSProperties}
              onClick={() => setFrames((f) => Math.min(64, f + 1))}
              role="button"
              aria-label="more frames"
            >+</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', marginLeft: 4 }}>
              2 – 64
            </span>
          </div>
        )}
        <div style={wStyles.npToggleDesc}>
          {animated
            ? `Starts with ${frames} frames. Add or remove anytime from the timeline.`
            : 'Single frame. The timeline stays available — add frames later from a hotkey or the bottom bar.'}
        </div>
```

- [ ] **Step 3.2 — TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | head -20
```

Expected: no output.

- [ ] **Step 3.3 — Commit**

```bash
git add src/components/Welcome.tsx
git commit -m "feat(welcome): add frame count stepper to animated toggle in NewProjectModal"
```

---

### Task 4: Wire recents and saved templates into WelcomeScreen

**Files:**
- Modify: `src/components/Welcome.tsx`

Replace the hardcoded `RECENT` and add a `savedTemplates` prop that merges user-saved templates into the templates grid.

- [ ] **Step 4.1 — Import storage types in Welcome.tsx**

At the top of `src/components/Welcome.tsx`, add:

```typescript
import type { RecentFile, SavedTemplate } from '../lib/storage';
```

- [ ] **Step 4.2 — Add props to WelcomeScreen**

Change `WelcomeScreenProps` to:

```typescript
export interface WelcomeScreenProps {
  onEnter: () => void;
  onNewProject: (template?: TemplateConfig) => void;
  onOpenFile: () => void;
  onOpenLessons: () => void;
  onComposeWithSindri: () => void;
  recentFrame: Frame | null | undefined;
  recentFiles: RecentFile[];
  savedTemplates: SavedTemplate[];
  onOpenRecent: (file: RecentFile) => void;
}
```

- [ ] **Step 4.3 — Update WelcomeScreen function signature**

```typescript
export function WelcomeScreen({
  onEnter, onNewProject, onOpenLessons, onOpenFile, onComposeWithSindri,
  recentFrame, recentFiles, savedTemplates, onOpenRecent,
}: WelcomeScreenProps) {
```

- [ ] **Step 4.4 — Replace the recents section**

Find:

```tsx
        <div style={wStyles.sectionRow}>
          <span style={wStyles.sectionLabel}>recent</span>
          <span style={wStyles.sectionMeta}>{RECENT.length} files</span>
        </div>
        <div style={wStyles.recentRow}>
          {RECENT.map((r) => (
            <div key={r.id} style={wStyles.recent} onClick={onEnter}>
              <RecentPreview frame={r.current ? recentFrame : null}/>
              <div style={wStyles.recentMeta}>
                <div style={wStyles.recentName}>{r.name}</div>
                <div style={wStyles.recentSpec}>{r.spec}</div>
              </div>
              {r.current && <span style={wStyles.recentBadge}>continue</span>}
            </div>
          ))}
        </div>
```

Replace with:

```tsx
        <div style={wStyles.sectionRow}>
          <span style={wStyles.sectionLabel}>recent</span>
          <span style={wStyles.sectionMeta}>{recentFiles.length} files</span>
        </div>
        <div style={wStyles.recentRow}>
          {recentFiles.length === 0 && (
            <div style={{ ...wStyles.recent, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)', fontSize: 11, padding: '24px 18px' }}>
              no recent files yet — create or open one above
            </div>
          )}
          {recentFiles.map((r, i) => (
            <div key={r.id} style={wStyles.recent} onClick={() => onOpenRecent(r)}>
              <RecentPreview frame={i === 0 ? recentFrame : null}/>
              <div style={wStyles.recentMeta}>
                <div style={wStyles.recentName}>{r.name}</div>
                <div style={wStyles.recentSpec}>{r.spec}</div>
              </div>
              {i === 0 && <span style={wStyles.recentBadge}>continue</span>}
            </div>
          ))}
        </div>
```

- [ ] **Step 4.5 — Add saved templates to templates grid**

Find the templates section:

```tsx
        <div style={wStyles.sectionRow}>
          <span style={wStyles.sectionLabel}>templates</span>
          <span style={wStyles.sectionMeta}>{TEMPLATES.length} presets</span>
        </div>
        <div style={wStyles.templateGrid}>
          {TEMPLATES.map((t) => (
            <div key={t.id} style={wStyles.template} onClick={() => onNewProject(t)}>
              <TemplatePreview kind={t.kind} w={t.w} h={t.h}/>
              <div style={wStyles.templateMeta}>
                <div style={wStyles.templateName}>{t.name}</div>
                <div style={wStyles.templateSpec}>{t.size}{t.frames > 1 ? ` · ${t.frames} frames` : ''}</div>
              </div>
            </div>
          ))}
        </div>
```

Replace with:

```tsx
        <div style={wStyles.sectionRow}>
          <span style={wStyles.sectionLabel}>templates</span>
          <span style={wStyles.sectionMeta}>{TEMPLATES.length + savedTemplates.length} presets</span>
        </div>
        <div style={wStyles.templateGrid}>
          {TEMPLATES.map((t) => (
            <div key={t.id} style={wStyles.template} onClick={() => onNewProject(t)}>
              <TemplatePreview kind={t.kind} w={t.w} h={t.h}/>
              <div style={wStyles.templateMeta}>
                <div style={wStyles.templateName}>{t.name}</div>
                <div style={wStyles.templateSpec}>{t.size}{t.frames > 1 ? ` · ${t.frames} frames` : ''}</div>
              </div>
            </div>
          ))}
          {savedTemplates.map((t) => (
            <div key={t.id} style={wStyles.template} onClick={() => onNewProject({
              id: t.id, name: t.name, size: `${t.w} × ${t.h}`,
              w: t.w, h: t.h, frames: t.frames, kind: 'blank',
            })}>
              <TemplatePreview kind="blank" w={t.w} h={t.h}/>
              <div style={wStyles.templateMeta}>
                <div style={wStyles.templateName}>{t.name}</div>
                <div style={wStyles.templateSpec}>{t.w} × {t.h}{t.frames > 1 ? ` · ${t.frames} fr` : ''} · saved</div>
              </div>
            </div>
          ))}
        </div>
```

- [ ] **Step 4.6 — TypeScript check**

```bash
pnpm tsc --noEmit 2>&1 | head -30
```

Expected: errors about `WelcomeScreen` missing new required props in `App.tsx` — those get fixed in Task 5.

- [ ] **Step 4.7 — Commit**

```bash
git add src/components/Welcome.tsx
git commit -m "feat(welcome): recents and saved templates driven by props, not hardcoded data"
```

---

### Task 5: Wire everything up in App.tsx

**Files:**
- Modify: `src/App.tsx`

This is the integration task: import storage helpers, use Tauri dialog + `import_png` command for Open File, call `pushRecent` on create/open, load recents + saved templates into state, and pass all new props to `WelcomeScreen`.

- [ ] **Step 5.1 — Add imports at top of App.tsx**

After the existing imports, add:

```typescript
import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import {
  getRecents, pushRecent, getSavedTemplates, saveTemplate,
} from './lib/storage';
import type { RecentFile, SavedTemplate } from './lib/storage';
```

- [ ] **Step 5.2 — Add state for recents and saved templates**

After the `projectName` state declaration, add:

```typescript
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>(() => getRecents());
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>(() => getSavedTemplates());
```

- [ ] **Step 5.3 — Add a helper that converts raw pixel data to a Frame**

Add this helper function inside `App` (before the return), after the `rejectProposal` definition:

```typescript
  const frameFromPixels = (w: number, h: number, pixelInts: number[]): Frame => {
    const pixels = Array.from({ length: h }, (_, y) =>
      Array.from({ length: w }, (_, x) => {
        const v = pixelInts[y * w + x];
        if (!v || (v >>> 24) === 0) return null;
        const r = (v >> 16) & 0xFF;
        const g = (v >> 8) & 0xFF;
        const b = v & 0xFF;
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      })
    );
    return {
      id: `frame_0`,
      duration: 120,
      layers: [{ id: 'l0', name: 'layer 1', visible: true, opacity: 1, pixels }],
    };
  };
```

- [ ] **Step 5.4 — Implement openFile handler**

Replace the placeholder `onOpenFile={enterEditor}` wiring with a real handler. Add this function inside `App` (before the return):

```typescript
  const openFile = async () => {
    try {
      const selected = await openDialog({
        title: 'Open sprite',
        filters: [{ name: 'Images & sprites', extensions: ['png', 'spr'] }],
        multiple: false,
        directory: false,
      });
      if (!selected || typeof selected !== 'string') return;

      const ext = selected.split('.').pop()?.toLowerCase();
      if (ext === 'spr') {
        // .spr is our JSON format
        const json = await invoke<string>('read_sprite_file', { path: selected });
        const data = JSON.parse(json) as { frames: Frame[]; w: number; h: number; name: string };
        setFrames(data.frames);
        setCanvasW(data.w ?? 32);
        setCanvasH(data.h ?? 32);
        setProjectName(data.name ?? selected.split('/').pop() ?? 'untitled.spr');
        setFrameIdx(0);
        setActiveLayerIdx(0);
      } else {
        // PNG import
        const result = await invoke<{ w: number; h: number; pixels: number[] }>('import_png', { path: selected });
        const frame = frameFromPixels(result.w, result.h, result.pixels);
        setFrames([frame]);
        setCanvasW(result.w);
        setCanvasH(result.h);
        const name = selected.split('/').pop() ?? 'imported.png';
        setProjectName(name);
        setFrameIdx(0);
        setActiveLayerIdx(0);
      }

      const name = selected.split('/').pop() ?? 'unknown';
      const recent = pushRecent({
        name,
        path: selected,
        spec: `${canvasW} × ${canvasH} · 1 frame`,
      });
      setRecentFiles(getRecents());
      void recent;
      enterEditor();
    } catch (e) {
      console.error('openFile failed', e);
    }
  };
```

- [ ] **Step 5.5 — Push a recent entry when creating a new sprite**

In the `createSprite` function, after `enterEditor()`, add:

```typescript
    pushRecent({
      name,
      path: '',      // in-memory project — no path yet
      spec: `${w} × ${h} · ${Math.max(1, frameCount)} frame${frameCount > 1 ? 's' : ''}`,
    });
    setRecentFiles(getRecents());
```

The full end of `createSprite` should look like:

```typescript
    setCanvasW(w);
    setCanvasH(h);
    setProjectName(name);
    setFrames(newFrames);
    setFrameIdx(0);
    setActiveLayerIdx(0);
    setSwatches(PROFILE_SWATCHES[profile] ?? SWATCHES);
    setProposal(null);
    setNewProjectFor(null);
    pushRecent({
      name,
      path: '',
      spec: `${w} × ${h} · ${Math.max(1, frameCount)} frame${frameCount > 1 ? 's' : ''}`,
    });
    setRecentFiles(getRecents());
    enterEditor();
```

- [ ] **Step 5.6 — Handle "Save as template" in createSprite**

In the `createSprite` function, after extracting config values (where `const profile = ...` is), add:

```typescript
    const doSaveTemplate = (c as { saveAsTemplate?: boolean }).saveAsTemplate ?? false;
```

Then after `setRecentFiles(getRecents())` and before `enterEditor()`:

```typescript
    if (doSaveTemplate) {
      saveTemplate({ name, w, h, frames: Math.max(1, frameCount), animated: !!c.animated, profile });
      setSavedTemplates(getSavedTemplates());
    }
```

- [ ] **Step 5.7 — Handle opening a recent file**

Add this function inside `App` (before the return):

```typescript
  const openRecent = async (file: RecentFile) => {
    if (!file.path) {
      // in-memory project created this session — just enter editor
      enterEditor();
      return;
    }
    // Re-open from disk the same way as openFile
    try {
      const ext = file.path.split('.').pop()?.toLowerCase();
      if (ext === 'spr') {
        const json = await invoke<string>('read_sprite_file', { path: file.path });
        const data = JSON.parse(json) as { frames: Frame[]; w: number; h: number; name: string };
        setFrames(data.frames);
        setCanvasW(data.w ?? 32);
        setCanvasH(data.h ?? 32);
        setProjectName(data.name ?? file.name);
        setFrameIdx(0);
        setActiveLayerIdx(0);
      } else {
        const result = await invoke<{ w: number; h: number; pixels: number[] }>('import_png', { path: file.path });
        const frame = frameFromPixels(result.w, result.h, result.pixels);
        setFrames([frame]);
        setCanvasW(result.w);
        setCanvasH(result.h);
        setProjectName(file.name);
        setFrameIdx(0);
        setActiveLayerIdx(0);
      }
      pushRecent({ ...file, timestamp: Date.now() });
      setRecentFiles(getRecents());
      enterEditor();
    } catch (e) {
      console.error('openRecent failed', e);
      // File may have moved — just enter editor with current state
      enterEditor();
    }
  };
```

- [ ] **Step 5.8 — Update WelcomeScreen call site**

In `App.tsx`, find the `<WelcomeScreen` JSX. Replace:

```tsx
        <WelcomeScreen
          onEnter={enterEditor}
          onNewProject={(template) => setNewProjectFor(template || {})}
          onOpenFile={enterEditor}
          onOpenLessons={() => { enterEditor(); setTimeout(() => setTweak('tutorialMode', 'library'), 50); }}
          onComposeWithSindri={() => { enterEditor(); setTimeout(() => setCmdKOpen(true), 50); }}
          recentFrame={frames[0]}
        />
```

With:

```tsx
        <WelcomeScreen
          onEnter={enterEditor}
          onNewProject={(template) => setNewProjectFor(template || {})}
          onOpenFile={openFile}
          onOpenLessons={() => { enterEditor(); setTimeout(() => setTweak('tutorialMode', 'library'), 50); }}
          onComposeWithSindri={() => { enterEditor(); setTimeout(() => setCmdKOpen(true), 50); }}
          recentFrame={frames[0]}
          recentFiles={recentFiles}
          savedTemplates={savedTemplates}
          onOpenRecent={openRecent}
        />
```

- [ ] **Step 5.9 — TypeScript check (must be clean)**

```bash
pnpm tsc --noEmit 2>&1 | head -40
```

Expected: no output.

- [ ] **Step 5.10 — Full build check**

```bash
pnpm build 2>&1 | tail -10
```

Expected: `✓ built in X.XXs` with no errors.

- [ ] **Step 5.11 — Commit**

```bash
git add src/App.tsx src/lib/storage.ts
git commit -m "feat: wire open-file dialog, recent files, and save-as-template into welcome screen"
```

---

## Self-Review

**Spec coverage:**
- ✅ Open sprite → Tauri dialog → import_png → real pixels (Tasks 1, 5.4)
- ✅ Frame count stepper in animated mode (Task 3)
- ✅ Recent files stored in localStorage and displayed from real data (Tasks 2, 4, 5.5, 5.7)
- ✅ "Save as template" persisted and shown in templates grid (Tasks 2, 4.5, 5.6)
- ✅ `.spr` JSON format re-open supported alongside PNG import (Task 5.4, 5.7)

**Placeholder scan:** None found. All code blocks are complete.

**Type consistency:** 
- `RecentFile` and `SavedTemplate` defined once in `storage.ts`, imported everywhere
- `invoke<{ w: number; h: number; pixels: number[] }>` matches the Rust return `serde_json::json!({ "w": w, "h": h, "pixels": pixels })`
- `WelcomeScreenProps.recentFiles: RecentFile[]` matches `useState<RecentFile[]>`
- `frameFromPixels` is defined before it is called
