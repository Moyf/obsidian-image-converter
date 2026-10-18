import { Setting } from 'obsidian';
import type ImageConverterPlugin from './main';
import { FolderSuggest } from './FolderSuggest';
import { normalizeRuleFolderPath } from './FolderPresetRules';

export function renderFolderPresetRules(container: HTMLElement, plugin: ImageConverterPlugin): void {
    const section = container.createDiv('image-converter-folder-rules');
    const heading = new Setting(section)
        .setName('Folder-based presets')
        .setDesc('Use a global preset for notes in a folder and its subfolders. The most specific folder wins; / matches the whole vault. Applies to pasted and dropped images.');
    if (typeof heading.setHeading === 'function') heading.setHeading();

    const rules = plugin.settings.folderPresetRules ??= [];
    const rows = section.createDiv();
    const renderRows = () => {
        rows.empty();
        rules.forEach((rule, index) => {
            const row = new Setting(rows).setName(`Folder rule ${index + 1}`);
            const updateDescription = () => {
                const path = normalizeRuleFolderPath(rule.folderPath);
                row.setDesc(path === null
                    ? 'Enter a vault-relative folder path, or / for the vault root. Empty or invalid rules are ignored.'
                    : !plugin.settings.globalPresets.some(preset => preset.name === rule.globalPreset)
                        ? 'Select an existing global preset. Missing presets are ignored.'
                        : 'Includes subfolders. For duplicate paths, the first enabled rule wins.');
            };
            row.addText(text => {
                text.setPlaceholder('Notes/projects').setValue(rule.folderPath);
                text.inputEl.setAttribute('aria-label', 'Note folder');
                new FolderSuggest(plugin.app, text.inputEl);
                text.onChange(async value => {
                    rule.folderPath = value;
                    updateDescription();
                    await plugin.saveSettings();
                });
            });
            row.addDropdown(dropdown => {
                dropdown.selectEl.setAttribute('aria-label', 'Global preset for folder');
                dropdown.addOption('', 'Select a global preset');
                for (const preset of plugin.settings.globalPresets) dropdown.addOption(preset.name, preset.name);
                if (rule.globalPreset && !plugin.settings.globalPresets.some(preset => preset.name === rule.globalPreset)) {
                    dropdown.addOption(rule.globalPreset, `Missing: ${rule.globalPreset}`);
                }
                dropdown.setValue(rule.globalPreset).onChange(async value => {
                    rule.globalPreset = value;
                    updateDescription();
                    await plugin.saveSettings();
                });
            });
            row.addToggle(toggle => {
                toggle.toggleEl.setAttribute('aria-label', 'Enable folder rule');
                toggle.setValue(rule.enabled).onChange(async value => {
                    rule.enabled = value;
                    await plugin.saveSettings();
                });
            });
            row.addExtraButton(button => button.setIcon('trash').setTooltip('Remove folder rule').onClick(async () => {
                rules.splice(index, 1);
                await plugin.saveSettings();
                renderRows();
            }));
            updateDescription();
        });
    };
    new Setting(section).setName('Add folder rule').addButton(button => button.setButtonText('Add rule').onClick(async () => {
        rules.push({ folderPath: '', globalPreset: '', enabled: true });
        await plugin.saveSettings();
        renderRows();
    }));
    renderRows();
}
