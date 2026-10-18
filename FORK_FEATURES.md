# Fork additions

## Pause automatic image processing

Two command palette commands are available:

- **Skip processing for next pasted image** preserves the original bytes of the next supported pasted image, then automatically resumes processing. Text-only pastes, unsupported files, drops, and events already handled by another plugin do not consume the request. When pasting multiple images, only the first eligible image is skipped. Folder, filename, and link presets still apply to that image.
- **Toggle automatic image processing** pauses or resumes automatic paste/drop processing. This state survives plugin reloads. While paused, Obsidian handles attachments using its native attachment location. Manual processing commands remain available. A pending one-shot request remains pending until automatic processing resumes.

## Local development

Install locked dependencies with `npm ci`. Set `VAULT_PATH` in your environment or a local `.env` file (see `.env.example`), then run `npm run build:local`. Relative paths in `.env` are resolved from that file's directory; the nearest matching `.env` in the repository or its parents is used. Build outputs are in `dist/`.

Local deployment copies `main.js`, `manifest.json`, and `styles.css` and creates a `.hotreload` marker. It preserves plugin settings and does not reload the whole application. No release or version bump is required for local testing.

## 中文说明

- 命令 `Skip processing for next pasted image`：下一张粘贴的受支持图片保留原始字节，然后自动恢复。一次粘贴多张时仅跳过第一张；纯文字、拖入图片、不支持的文件和已被其他插件处理的事件不会消耗这次机会。文件夹、命名和链接预设仍然生效。
- 命令 `Toggle automatic image processing`：切换粘贴和拖入图片的自动处理，状态在插件重载后仍然保留。暂停期间由 Obsidian 原生处理附件，使用其原生附件位置；手动处理命令继续可用。暂停期间未使用的一次性跳过机会会保留到恢复后。
- 本地开发：执行 `npm ci`，按 `.env.example` 设置 `VAULT_PATH`，再执行 `npm run build:local`。产物位于 `dist/`，部署会保留原有插件设置，并创建 `.hotreload` 标记。
