import type { MjolnirEvent } from "mjolnir.js";
import { BitmapLayer, IconLayer } from "@deck.gl/layers";
import { COORDINATE_SYSTEM, type Layer, type PickingInfo } from "@deck.gl/core";
import { Menu, type App, type TFile } from "obsidian";
import { getIconLayer, type HasMarkers } from "src/generics/markers";
import type { ReadonlyStateful } from "src/generics/stateful";
import { MapMarker } from "src/markers/marker";
import type { MapChild } from "src/generics/map-child";
import type { RenderedMap } from "src/map/map";
import type { MapLayerState } from "./layers.types";
import { nanoid } from "nanoid";
import { MarkerManager } from "src/markers/marker.manager";
import { throwError } from "src/utils/error";

export class MapLayer
    implements ReadonlyStateful<MapLayerState>, HasMarkers, MapChild
{
    #id: string;
    getId(): string {
        return this.#id;
    }
    #name: string;
    getName(): string {
        if (this.#name) return this.#name;
        return this.file.basename;
    }
    protected setId(id: string): void {
        this.#id = id;
    }
    constructor(public parent: RenderedMap, public state: MapLayerState) {
        this.#id = nanoid();
    }

    file: TFile;
    bitmap: ImageBitmap;

    layer: BitmapLayer;

    getLayers(): Layer[] {
        const layers: Layer[] = [this.layer];
        if (this.markers.length) layers.push(this.markerLayer);
        return layers;
    }

    async initialize(): Promise<MapLayer> {
        await this.process();

        await this.readImage();
        this.buildImageLayer();
        return this;
    }
    async process() {
        if (typeof this.state == "string") {
            await this.getFile(this.state);
        } else {
            await this.getFile(this.state.image);

            this.markers = [];

            for (const marker of this.state.markers ?? []) {
                this.markers.push(MapMarker.fromState(marker));
            }
            this.markerLayer = getIconLayer(this);
        }
    }
    async getFile(path: string) {
        const file = await this.parent.app.metadataCache.getFirstLinkpathDest(
            path,
            this.parent.context.sourcePath
        );

        if (!file) {
            throwError(
                this.parent.containerEl,
                `Invalid image supplied to map: ${path}`
            );
            return;
        }
        this.file = file;
    }
    async readImage() {
        try {
            this.bitmap = await createImageBitmap(
                new Blob([await this.parent.app.vault.readBinary(this.file)])
            );
        } catch (e) {}
    }
    buildImageLayer(): BitmapLayer {
        const dimensions: [number, number] = [
            this.bitmap.width / 2,
            this.bitmap.height / 2
        ];

        this.layer = new BitmapLayer({
            id: "BitmapLayer",
            bounds: [
                -1 * dimensions[0],
                dimensions[1],
                dimensions[0],
                -1 * dimensions[1]
            ],
            image: this.bitmap,
            pickable: true,
            coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
            onClick: (info, event: MjolnirEvent) => {
                if (event.type != "contextmenu") {
                    return;
                }
                if (event.rightButton) {
                    const menu = new Menu();

                    for (const [name, marker] of MarkerManager.getMarkers()) {
                        menu.addItem(async (item) => {
                            item.iconEl.style.color = `rgb(${marker.color?.[0]}, ${marker.color?.[1]}, ${marker.color?.[2]})`;
                            item.setIcon(marker.icon);
                            item.setTitle(name);
                            item.onClick(async () => {
                                this.markers = [
                                    ...this.markers,
                                    MapMarker.fromState({
                                        coordinates: [
                                            info.coordinate?.[0] ?? 0,
                                            info.coordinate?.[1] ?? 0
                                        ],
                                        marker: name,
                                        icon: name
                                    })
                                ];
                                console.log(
                                    "🚀 ~ file: layer.ts:107 ~ this.markers:",
                                    this.markers
                                );

                                this.markerLayer = getIconLayer(this);
                                await this.parent.saveState();
                                this.parent.redraw();
                            });
                        });
                    }
                    menu.addSeparator();
                    menu.addItem((item) => {
                        item.setIcon("plus");
                        item.setTitle("New");
                    });

                    menu.showAtMouseEvent(event.srcEvent as MouseEvent);
                }
            }
        });
        return this.layer;
    }

    markers: MapMarker[] = [];
    markerLayer: IconLayer<MapMarker, {}>;
    onMarkerClick(info: PickingInfo, event: MjolnirEvent): boolean {
        return false;
    }
    onMarkerDrag(info: PickingInfo, event: MjolnirEvent) {
        this.markers[info.index]?.setCoordinates([
            info.coordinate?.[0] ?? 0,
            info.coordinate?.[1] ?? 0
        ]);
        this.markers = [...this.markers];
        console.log("🚀 ~ file: layer.ts:152 ~ this.markers:", this.markers);

        this.markerLayer = getIconLayer(this);

        this.parent.redraw();
    }
    onMarkerDragStart(info: PickingInfo, event: MjolnirEvent) {
        this.parent.deck.setProps({ controller: { dragPan: false } });
    }
    onMarkerDragEnd(info: PickingInfo, event: MjolnirEvent) {
        this.parent.deck.setProps({
            controller: true
        });
        this.parent.saveState();
    }

    isObjectState() {
        return this.markers.length;
    }
    getState(): MapLayerState {
        if (!this.isObjectState()) {
            return this.parent.app.metadataCache.fileToLinktext(
                this.file,
                this.parent.context.sourcePath
            );
        }

        return {
            image: this.parent.app.metadataCache.fileToLinktext(
                this.file,
                this.parent.context.sourcePath
            ),
            markers: this.markers.map((m) => m.getState())
        };
    }
    getBounds() {
        return this.layer.props.bounds as [number, number, number, number];
    }

    static fromState(
        parent: RenderedMap,
        state: MapLayerState
    ): Promise<MapLayer> {
        const layer = new MapLayer(parent, state);
        return layer.initialize();
    }
}
