import { IconLayer } from "@deck.gl/layers";
import type { PickingInfo } from "@deck.gl/core";
import type { MjolnirEvent } from "mjolnir.js";
import type { MapMarker } from "src/markers/marker";
import type { RenderedMap } from "src/map/map";
import { nanoid } from "nanoid";

export interface HasMarkers {
    markers: MapMarker[];
    onMarkerDragStart: (info: PickingInfo, event: MjolnirEvent) => void;
    onMarkerDragEnd: (info: PickingInfo, event: MjolnirEvent) => void;
    onMarkerDrag: (info: PickingInfo, event: MjolnirEvent) => void;
    onMarkerClick: (info: PickingInfo, event: MjolnirEvent) => boolean;
    markerLayer: IconLayer<MapMarker>;
    getId(): string;
}

export function getIconLayer(item: HasMarkers): IconLayer<MapMarker> {
    return new IconLayer<MapMarker>({
        id: `${item.getId()}_markers`,
        data: item.markers,
        autoHighlight: true,
        highlightColor: (pickingInfo) => {
            return [255, 255, 255, 50];
        },
        onDragStart: (info, event: MjolnirEvent) => {
            item.onMarkerDragStart(info, event);
        },
        onDragEnd: (info, event: MjolnirEvent) => {
            item.onMarkerDragEnd(info, event);
        },
        onDrag: (info, event: MjolnirEvent) => {
            item.onMarkerDrag(info, event);
        },
        onClick: (info, event: MjolnirEvent): boolean => {
            return item.onMarkerClick(info, event);
        },

        getIcon: (d) => d.getIcon(),
        getPosition: (d) => {
            return d.getCoordinates();
        },
        getSize: (d) => d.getSize() ?? 24,
        getColor: (d) => {
            return d.getColor();
        },

        pickable: true
    });
}
