import { App, Component, TFile, stringifyYaml } from "obsidian";

import { Deck } from "@deck.gl/core";
import { OrthographicView, type PickingInfo } from "@deck.gl/core";
import { FullscreenWidget } from "@deck.gl/widgets";

import { nanoid } from "nanoid";

import type { BufferedContext } from "src/processor/processor";
import type { Stateful } from "src/generics/stateful";
import type { Named } from "src/generics/named";
import type { MapState } from "./maps.types";

import { MapLayer } from "src/layers/layer";

import { throwError } from "src/utils/error";
import { ResetWidget } from "src/widgets/reset/reset";
import { LinearZoomWidget } from "src/widgets/zoom/zoom";
import { LayerControlWidget } from "src/widgets/layers/layers";

export class RenderedMap extends Component implements Stateful<MapState> {
    /* , HasMarkers */
    id: string = nanoid();
    getId() {
        return this.id;
    }
    deck: Deck<OrthographicView>;

    layers: MapLayer[] = [];
    active: number = 0;
    constructor(
        public app: App,
        public containerEl: HTMLDivElement,
        public state: MapState,
        public context: BufferedContext,
        public file: TFile
    ) {
        super();
        this.containerEl.addClasses(["maps-plugin", "rendered-map"]);
        this.containerEl.style.height = "500px";
    }
    public getContext(): BufferedContext {
        return this.context;
    }
    public setContext(ctx: BufferedContext) {
        this.context = ctx;
    }

    public async setState(state: MapState) {
        this.state = state;
        await this.process();
        if (this.#saving) {
            this.#saving = false;
        } else {
            this.redraw();
        }
    }
    public getState(): MapState {
        return {
            layers: [...this.layers.values()].map((l) => l.getState())
        };
    }
    #saving = false;
    public isSaving() {
        return this.#saving;
    }
    public async saveState() {
        const contents = (await this.app.vault.cachedRead(this.file)).split(
            "\n"
        );

        const newContents = [
            ...contents.slice(0, (this.context.lineStart ?? 0) + 1),
            ...stringifyYaml(this.getState()).split("\n"),
            ...contents.slice(this.context.lineEnd)
        ];

        this.#saving = true;
        await this.app.vault.modify(this.file, newContents.join("\n"));
    }

    async onload(): Promise<void> {
        this.containerEl.addClass("image-map");
        await this.process();
        await this.loadMap();
    }
    unload(): void {
        this.containerEl.replaceWith(
            createDiv({
                text: "Re-enable the Maps plugin to use this codeblock."
            })
        );
    }

    /**
     * At this point, the state should have resolved to a good MapState.
     * Just extract what you need.
     */
    async process() {
        const images = [this.state.layers ?? []].flat();
        let newLayers = [];
        for (let i = 0; i < images.length; i++) {
            const layer = await MapLayer.fromState(this, images[i]);
            newLayers.push(layer);
        }
        if (!newLayers.length) {
            throwError(this.containerEl, "No images supplied.");
        }
        this.layers = [...newLayers];
        this.active = Math.min(this.layers.length, this.active);
        this.layerSwitcher.setProps({
            layers: this.layers,
            active: this.active
        });
    }
    resetWidget: ResetWidget;
    layerSwitcher: LayerControlWidget = new LayerControlWidget(this);
    async loadMap() {
        this.resetWidget = new ResetWidget(this.layers[this.active]);
        this.deck = new Deck({
            parent: this.containerEl,
            controller: { doubleClickZoom: false },
            pickingRadius: 10,
            widgets: [
                new LinearZoomWidget({
                    id: "zoom",
                    viewId: "base-layer",
                    placement: "top-left",
                    delta: 0.5
                }),
                new FullscreenWidget({
                    id: "fullscreen",
                    placement: "top-right"
                }),
                this.resetWidget,
                this.layerSwitcher
            ],
            initialViewState: {
                target: [0, 0],
                zoom: 0
            },
            views: new OrthographicView({
                id: "base-layer"
            }),
            onLoad: () => {
                this.resetWidget.resetZoom();
            },
            getTooltip: ({ object }: PickingInfo<Named>) =>
                object?.getName() ?? ""
        });
        this.redraw();
    }
    redraw() {
        const layers = this.layers[this.active].getLayers();

        this.deck.setProps({
            layers: [...layers]
        });
    }

    onunload(): void {
        this.deck.finalize();
    }
}
