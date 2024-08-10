import type { Deck, Widget, OrthographicView } from "@deck.gl/core";
import { setIcon } from "obsidian";
import type { MapChild } from "src/generics/map-child";
import type { MapLayer } from "src/layers/layer";
import type { RenderedMap } from "src/map/map";
import LayerControl from "./view/LayerControl.svelte";

export class LayerControlWidget implements Widget, MapChild {
    constructor(public parent: RenderedMap) {}
    id: string;
    props: any;
    placement?:
        | "top-left"
        | "top-right"
        | "bottom-left"
        | "bottom-right"
        | "fill" = "top-right";
    containerEl: HTMLDivElement;
    deck: Deck<OrthographicView>;

    $ui: LayerControl;

    onAdd(params: { deck: Deck<any> }): HTMLDivElement {
        this.containerEl = createDiv();

        this.$ui = new LayerControl({
            target: this.containerEl,
            props: {
                active: this.active,
                layers: this.layers.map((l) => l.getName())
            }
        });

        return this.containerEl;
    }
    onRemove(): void {
        this.containerEl.detach();
    }
    layers: MapLayer[] = [];
    active: number = 0;
    setProps(props: Partial<{ layers: MapLayer[]; active: number }>): void {
        if (props.layers) this.layers = props.layers;
        if (props.active) this.active = props.active;
    }
    showLayerControl() {
        this.containerEl.empty();

        console.log("🚀 ~ file: layers.ts:46 ~ this.layers:", this.layers);
        for (const layer of this.layers) {
            this.containerEl.createDiv({ text: layer.file.path });
        }

        this.containerEl.addEventListener("mouseleave", () => {
            setIcon(
                this.containerEl
                    .createDiv("deck-widget-button")
                    .createEl("button", "deck-widget-icon-button"),
                "layers"
            );
        });
    }
}
