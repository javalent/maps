import { setIcon } from "obsidian";
import type Maps from "src/main";
import type { CustomMarker } from "src/settings/settings.types";
import type { MarkerIcon, IconMarker } from "./marker.types";
import Color from "color";

class MarkerManagerClass {
    private plugin: Maps;
    private markers: Map<string, MarkerIcon> = new Map();
    get settings() {
        return this.plugin.settings;
    }

    initialize(plugin: Maps) {
        this.plugin = plugin;
        this.updatetMarkers(...this.settings.markers);
    }

    private updatetMarkers(...markers: CustomMarker[]) {
        for (const marker of markers) {
            const node = createDiv();
            setIcon(node, marker.icon ?? "map-pin");
            if (!node.childElementCount) {
                continue;
            }
            const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                node.innerHTML
            )}`;

            this.markers.set(marker.name, {
                icon: marker.icon ?? "map-pin",
                color: marker.color,
                url,
                mask: true,
                width: 24,
                height: 24
            });
        }
    }
    public getMarkers(): [name: string, icon: MarkerIcon][] {
        return [...this.markers.entries()];
    }
    public getMarker(marker: string): MarkerIcon | undefined {
        return this.markers.get(marker);
    }
    public getMarkerIcon(definition: IconMarker): MarkerIcon | undefined {
        let iconEl = createDiv();
        setIcon(iconEl, definition.icon);
        if (!iconEl.childElementCount) return;

        const svg = iconEl.firstElementChild as SVGElement;

        const dataUrl = `data:image/svg+xml,${encodeURIComponent(svg.outerHTML)
            .replace(/'/g, "%27")
            .replace(/"/g, "%22")}`;

        return {
            icon: definition.icon,
            url: dataUrl,
            mask: true,
            width: definition.size ?? 24,
            height: definition.size ?? 24
        };
    }

    public addMarker(marker: CustomMarker) {}
    public removeMarker(marker: CustomMarker) {}
}

export const MarkerManager = new MarkerManagerClass();
