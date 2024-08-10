import type { DefinedMarker } from "src/markers/marker.types";

export type MapLayerState = string  | DetailedMapLayerState;

export type DetailedMapLayerState = {
    image: string;
    markers?: DefinedMarker[];
};
