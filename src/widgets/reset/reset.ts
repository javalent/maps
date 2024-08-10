import type {
    Deck,
    Widget,
    PickingInfo,
    OrthographicView
} from "@deck.gl/core";
import { setIcon } from "obsidian";
import type { MapLayer } from "src/layers/layer";

const PADDING = 1.2;

export class ResetWidget implements Widget {
    constructor(public layer: MapLayer) {}
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
    onAdd(params: { deck: Deck<any> }): HTMLDivElement {
        this.containerEl = createDiv("deck-widget");
        this.deck = params.deck;
        setIcon(
            this.containerEl
                .createDiv("deck-widget-button")
                .createEl("button", "deck-widget-icon-button"),
            "target"
        );

        this.containerEl.onClickEvent(() => this.resetZoom());

        return this.containerEl;
    }
    onRemove(): void {
        this.containerEl.detach();
    }
    setProps: (props: Partial<any>) => void;
    getDimensions() {
        let bounds = this.layer.getBounds();
        return [
            Math.abs(bounds[2] - bounds[0]),
            Math.abs(bounds[3] - bounds[1])
        ];
    }
    resetZoom(): void {
        const viewport = this.deck.getViewports()[0];
        const screenBounds = viewport.getBounds();

        console.log();
        const dimensions = this.getDimensions();
        const targetSize = [PADDING * dimensions[0], PADDING * dimensions[1]];

        const size = [
            Math.abs(screenBounds[2] - screenBounds[0]),
            Math.abs(screenBounds[3] - screenBounds[1])
        ];

        const scaleX = targetSize[0] / size[0];

        const scaleY = targetSize[1] / size[1];

        let zoomDelta = Math.log2(Math.abs(Math.max(scaleX, scaleY)));
        console.log(
            "🚀 ~ file: reset.ts:72 ~ zoom:",
            zoomDelta,
            viewport.zoom,
            viewport.zoom - zoomDelta
        );

        this.deck.setProps({
            initialViewState: {
                target: [0, 0],
                zoom: viewport.zoom - zoomDelta,
                transitionDuration: 150
            }
        });
    }
}
