import "./main.css";

import { Plugin } from "obsidian";
import type { MapsSettings } from "./settings/settings.types";
import { DEFAULT_SETTINGS } from "./settings/settings.const";
import { MapProcessor } from "./processor/processor";
import { MapSettings } from "./settings/settings.view";
import { MarkerManager } from "./markers/marker.manager";

export default class Maps extends Plugin {
    settings: MapsSettings;
    processor: MapProcessor;
    async onload() {
        await this.loadSettings();
        this.processor = new MapProcessor();

        this.addChild(this.processor);

        MarkerManager.initialize(this);

        this.registerMarkdownCodeBlockProcessor(
            "map",
            this.processor.process.bind(this.processor, this)
        );

        this.addSettingTab(new MapSettings(this));

        //TODO: Remove this.
        //@ts-expect-error
        window.maps = this;
    }

    onunload() {}

    async loadSettings() {
        this.settings = Object.assign(
            {},
            DEFAULT_SETTINGS,
            await this.loadData()
        );
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}
