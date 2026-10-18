import { describe, expect, it, vi } from 'vitest';
import type { App } from 'obsidian';
import ImageConverterPlugin from '../../../src/main';
import { DEFAULT_SETTINGS } from '../../../src/ImageConverterSettings';
import { renderFolderPresetRules } from '../../../src/FolderPresetRulesSettings';
import { fakeApp, fakePluginManifest } from '../../factories/obsidian';

describe('folder rule settings controls', () => {
    it('creates, configures, disables and removes a persisted rule', async () => {
        const plugin = new ImageConverterPlugin(fakeApp() as App, fakePluginManifest({ id: 'image-converter' }));
        plugin.settings = structuredClone(DEFAULT_SETTINGS);
        const save = vi.spyOn(plugin, 'saveSettings').mockResolvedValue();
        const container = document.createElement('div');
        renderFolderPresetRules(container, plugin);

        const add = Array.from(container.querySelectorAll('button')).find(button => button.textContent === 'Add rule');
        expect(add).toBeTruthy();
        add!.click();
        await vi.waitFor(() => expect(container.querySelector('[aria-label="Note folder"]')).toBeTruthy());
        expect(plugin.settings.folderPresetRules).toEqual([{ folderPath: '', globalPreset: '', enabled: true }]);

        const folder = container.querySelector<HTMLInputElement>('[aria-label="Note folder"]')!;
        folder.value = 'Projects';
        folder.dispatchEvent(new Event('change', { bubbles: true }));
        const preset = container.querySelector<HTMLSelectElement>('[aria-label="Global preset for folder"]')!;
        preset.value = plugin.settings.globalPresets[0].name;
        preset.dispatchEvent(new Event('change', { bubbles: true }));
        const enabled = container.querySelector<HTMLInputElement>('[aria-label="Enable folder rule"]')!;
        enabled.checked = false;
        enabled.dispatchEvent(new Event('change', { bubbles: true }));
        expect(plugin.settings.folderPresetRules![0]).toEqual({ folderPath: 'Projects', globalPreset: preset.value, enabled: false });

        container.querySelector<HTMLButtonElement>('[title="Remove folder rule"]')!.click();
        await vi.waitFor(() => expect(container.querySelector('[aria-label="Note folder"]')).toBeNull());
        expect(plugin.settings.folderPresetRules).toEqual([]);
        expect(save).toHaveBeenCalledTimes(5);
    });
});
