import {
    ButtonComponent,
    ExtraButtonComponent,
    PluginSettingTab,
    Setting,
    TextComponent,
    setIcon
} from "obsidian";
import copy from "fast-copy";
import { createCollapsibleSection } from "@javalent/utilities";
import type Maps from "src/main";
import MapsModal from "src/modals/modal";
import type { CustomMarker } from "./settings.types";
import { Icons } from "src/icons/icons.const";
import { IconSuggester } from "src/icons/icon.suggester";
import { IconManager } from "src/icons/icon.manager";
import { getCustomMarker } from "./settings.const";

export class MapSettings extends PluginSettingTab {
    constructor(public plugin: Maps) {
        super(app, plugin);
    }
    contentEl: HTMLDivElement;
    get settings() {
        return this.plugin.settings;
    }
    display() {
        this.containerEl.empty();
        this.containerEl.addClass("maps-settings");
        this.contentEl = this.containerEl.createDiv("maps-settings-content");

        this.buildMarkers(
            createCollapsibleSection(this.contentEl, "Map markers")
        );
    }

    buildMarkers(detailsEl: HTMLDetailsElement) {
        new Setting(detailsEl).setDesc(
            createFragment((e) => {
                e.createSpan({
                    text: "Map markers are used to identify the location of something on your maps."
                });
                e.createEl("p", {
                    text: "Any markers created here may be directly referenced in a Map code block or added via a Map's right-click menu."
                });
            })
        );
        const markersEl = detailsEl.createDiv(
            "setting-item has-nested-settings"
        );
        new Setting(markersEl)
            .setName("Custom markers")
            .setHeading()
            .addExtraButton((b) => {
                b.setIcon(Icons.ADD_NEW).onClick(() => {
                    const modal = new EditMarkerModal(this.plugin);
                    modal.onClose = async () => {
                        console.log(
                            "🚀 ~ file: settings.view.ts:62 ~ onClose:"
                        );
                        this.settings.markers.push(copy(modal.marker));
                        await this.plugin.saveSettings();
                        this.display();
                    };

                    modal.open();
                });
            });

        for (const marker of this.settings.markers) {
            new Setting(markersEl)
                .setName(
                    createFragment((e) => {
                        const container = e.createDiv("custom-marker-name");
                        setIcon(
                            container.createDiv({
                                attr: {
                                    style: `color: rgb(${marker.color[0]}, ${marker.color[1]}, ${marker.color[2]}); display: flex; align-items: center;`
                                }
                            }),
                            marker.icon
                        );
                        container.createDiv().setText(marker.name);
                    })
                )
                .addExtraButton((b) => {
                    b.setIcon(Icons.EDIT).onClick(() => {
                        const modal = new EditMarkerModal(this.plugin, marker);
                        modal.onClose = async () => {
                            console.log(
                                "🚀 ~ file: settings.view.ts:92 ~ onClose:"
                            );
                            
                            this.settings.markers.push(copy(modal.marker));
                            await this.plugin.saveSettings();
                            this.display();
                        };

                        modal.open();
                    });
                })
                .addExtraButton((b) => {
                    b.setIcon(Icons.DELETE).onClick(async () => {
                        this.settings.markers = this.settings.markers.filter(
                            (m) => m.id !== marker.id
                        );
                        await this.plugin.saveSettings();
                        this.display();
                    });
                });
        }
    }
}

class EditMarkerModal extends MapsModal {
    #editing: boolean = false;
    saved: boolean = true;
    marker: CustomMarker;
    constructor(plugin: Maps, marker?: CustomMarker) {
        super(plugin.app, plugin);
        if (marker) {
            this.marker = copy(marker);
            this.#editing = true;
        } else {
            this.marker = getCustomMarker();
        }
    }
    onOpen(): void {
        this.titleEl.setText(this.#editing ? "Edit marker" : "New marker");

        new Setting(this.contentEl).setName("Name").addText((text) => {
            text.setValue(this.marker.name).onChange(
                (v) => (this.marker.name = v)
            );
        });
        new Setting(this.contentEl).setName("Icon").addText((text) => {
            text.setValue(this.marker.icon);
            let modal = new IconSuggester(
                this.app,
                text,
                IconManager.getIconNames()
            );
            modal.onSelect(({ item }) => {
                console.log("🚀 ~ file: settings.view.ts:136 ~ item:", item);

                text.setValue(item);
                this.marker.icon = item;
                modal.close();
            });
            text.onChange((v) => {
                this.marker.icon = v;
            });
        });
        new Setting(this.contentEl).setName("Color").addColorPicker((color) => {
            color.setValueRgb({
                r: this.marker.color[0],
                g: this.marker.color[1],
                b: this.marker.color[2]
            });
            color.onChange((v) => {
                console.log(
                    "🚀 ~ file: settings.view.ts:155 ~ color.getValueRgb():",
                    color.getValueRgb()
                );
                const { r, g, b } = color.getValueRgb();

                this.marker.color = [r, g, b];
                console.log(
                    "🚀 ~ file: settings.view.ts:161 ~ this.marker.color :",
                    this.marker.color
                );
            });
        });
    }
}
