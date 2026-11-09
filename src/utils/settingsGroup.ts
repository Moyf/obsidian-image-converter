import { Setting, SettingGroup, requireApiVersion, type SettingDefinitionBase, type SettingDefinitionControl } from 'obsidian';

export type SharedSettingDefinition = SettingDefinitionControl | (SettingDefinitionBase & {
    render: (setting: Setting) => void;
});

export interface SettingsGroupContainer {
    listEl: HTMLElement;
    addSetting(callback: (setting: Setting) => void): void;
}

/** Keep the same grouping on older hosts without requiring the new settings API. */
export function createSettingsGroup(containerEl: HTMLElement, heading: string, cls: string): SettingsGroupContainer {
    if (requireApiVersion('1.11.0') && typeof SettingGroup === 'function') {
        return new SettingGroup(containerEl).setHeading(heading).addClass(cls);
    }

    const groupEl = containerEl.createDiv(cls);
    groupEl.createDiv({ cls: 'image-converter-setting-group-heading', text: heading });
    const listEl = groupEl.createDiv('image-converter-setting-group-list');
    return {
        listEl,
        addSetting(callback) {
            callback(new Setting(listEl));
        },
    };
}

interface SettingsBinding {
    getControlValue(key: string): unknown;
    setControlValue(key: string, value: unknown): void | Promise<void>;
}

/** Render the simple shared definitions on hosts without declarative settings. */
export function renderLegacySettingDefinitions(group: SettingsGroupContainer, definitions: SharedSettingDefinition[], binding: SettingsBinding): void {
    definitions.forEach(definition => {
        group.addSetting(setting => {
            setting.setName(definition.name ?? '').setDesc(definition.desc ?? '');
            if ('render' in definition && definition.render) {
                definition.render(setting);
                return;
            }
            if (!('control' in definition) || !definition.control) return;
            const { control } = definition;
            const value = binding.getControlValue(control.key);
            if (control.type === 'toggle') {
                setting.addToggle(toggle => toggle
                    .setValue(Boolean(value))
                    .onChange(updated => { void binding.setControlValue(control.key, updated); }));
            } else if (control.type === 'dropdown') {
                setting.addDropdown(dropdown => dropdown
                    .addOptions(control.options)
                    .setValue(typeof value === 'string' ? value : '')
                    .onChange(updated => { void binding.setControlValue(control.key, updated); }));
            }
        });
    });
}
