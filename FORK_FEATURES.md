# Fork additions

## Pause automatic image processing

Two command palette commands are available:

- **Skip processing for next pasted image** preserves the original bytes of the next supported pasted image, then automatically resumes processing. Text-only pastes, unsupported files, drops, and events already handled by another plugin do not consume the request. When pasting multiple images, only the first eligible image is skipped. Folder, filename, and link presets still apply to that image.
- **Toggle automatic image processing** pauses or resumes automatic paste/drop processing. This state survives plugin reloads. While paused, Obsidian handles attachments using its native attachment location. Manual processing commands remain available. A pending one-shot request remains pending until automatic processing resumes.

## Folder-based presets

1. Configure your folder, filename, conversion, link, and resize presets as usual, then save that selection as a global preset. For example, create a custom folder preset for `Projects/Assets` and a WebP conversion preset with quality 75, and save both in a global preset named `Project images`.
2. In **Folder-based presets**, choose **Add rule**, enter the source note folder (for example `Projects`), and select `Project images`. The rule includes notes in subfolders. Folder suggestions are available while typing.
3. Paste or drop an image into a matching note. Its destination and processing parameters come from that rule's global preset; the selection modal starts with the same configuration if enabled.

Matching is case-sensitive and respects folder boundaries (`Projects` does not match `ProjectsOld`). The most specific enabled rule wins; the first rule wins for duplicate paths. Use `/` for a vault-wide fallback, including root notes. Empty paths, traversal paths, and missing global presets are ignored, so a valid parent rule can still apply. Missing component presets fall back to the current global selection for that category.

Unmatched notes use the global selection. With rules configured, import dialogs use independent settings snapshots and do not remember custom template edits across imports; named preset definitions should be edited in the settings page. Removing all rules restores the original dialog session behavior. Manual batch-processing commands keep their explicit configuration. The persistent pause command takes precedence over rules and uses native Obsidian attachment handling.

## Local development

Install locked dependencies with `npm ci`. Set `VAULT_PATH` in your environment or a local `.env` file (see `.env.example`), then run `npm run build:local`. Relative paths in `.env` are resolved from that file's directory; the nearest matching `.env` in the repository or its parents is used. Build outputs are in `dist/`.

Local deployment copies `main.js`, `manifest.json`, and `styles.css` and creates a `.hotreload` marker. It preserves plugin settings and does not reload the whole application. No release or version bump is required for local testing.

## 中文说明

- 命令 `Skip processing for next pasted image`：下一张粘贴的受支持图片保留原始字节，然后自动恢复。一次粘贴多张时仅跳过第一张；纯文字、拖入图片、不支持的文件和已被其他插件处理的事件不会消耗这次机会。文件夹、命名和链接预设仍然生效。
- 命令 `Toggle automatic image processing`：切换粘贴和拖入图片的自动处理，状态在插件重载后仍然保留。暂停期间由 Obsidian 原生处理附件，使用其原生附件位置；手动处理命令继续可用。暂停期间未使用的一次性跳过机会会保留到恢复后。
- 文件夹配置：先把所需的存储位置、命名、压缩、链接和尺寸预设保存成全局预设，再在设置页的 `Folder-based presets` 中点击 `Add rule`，填写笔记所在文件夹并选择该全局预设。例如把 `Projects` 绑定到包含 `Projects/Assets` 目标目录和 WebP 质量 75 的全局预设。
- 规则包含子文件夹，匹配区分大小写并按文件夹边界判断；路径最具体的规则优先，同路径取第一条启用规则。`/` 表示整个库。空路径、越级路径和已删除的全局预设会被忽略，仍可匹配父级规则；分类预设缺失时回退到该分类的全局选择。
- 未匹配的笔记使用全局配置。配置规则后，每次导入弹窗使用独立快照，不跨导入记忆临时模板调整；修改命名预设请在设置页进行。删除全部规则后恢复原有弹窗记忆行为。手动批处理使用其显式配置；常驻暂停优先于文件夹规则。
- 本地开发：执行 `npm ci`，按 `.env.example` 设置 `VAULT_PATH`，再执行 `npm run build:local`。产物位于 `dist/`，部署会保留原有插件设置，并创建 `.hotreload` 标记。
