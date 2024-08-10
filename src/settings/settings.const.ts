import { nanoid } from "nanoid";
import type { CustomMarker, MapsSettings } from "./settings.types";

export const DEFAULT_SETTINGS: MapsSettings = {
    markers: []
};

export function getCustomMarker(): CustomMarker {
    return {
        name: "",
        icon: "map-pin",
        color: [0, 0, 0],
        id: nanoid()
    };
}
