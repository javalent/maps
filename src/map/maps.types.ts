import type { MapLayerState } from "src/layers/layers.types";
import type { DefinedMarker } from "src/markers/marker.types";

export interface MapState {
    layers: MapLayerState[];
}

export type Coordinates = [longitude: number, latitude: number];
