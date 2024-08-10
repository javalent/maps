import type { ReadonlyStateful, Stateful } from "src/generics/stateful";
import {
    MarkerIconType,
    type DefinedMarker,
    type MarkerIcon
} from "./marker.types";
import type { Coordinates } from "src/map/maps.types";
import Color from "color";
import type { Named } from "src/generics/named";
import { MarkerManager } from "./marker.manager";

export class MapMarker implements ReadonlyStateful<DefinedMarker>, Named {
    #type: MarkerIconType;
    #original: string;
    protected constructor(state: DefinedMarker) {
        this.#coordinates = state.coordinates;
        this.#type =
            "marker" in state ? MarkerIconType.Marker : MarkerIconType.Icon;
        if ("marker" in state) {
            this.#original = state.marker;
            this.#icon = MarkerManager.getMarker(state.marker);
        } else if ("icon" in state) {
            this.#original = state.icon;
            this.#icon = MarkerManager.getMarkerIcon(state);
        }

        this.#color = Color(state.color ?? this.#icon.color ?? [0, 0, 0])
            .rgb()
            .array() as [number, number, number];
        if (state.size) {
            this.#size = state.size;
        }

        this.#name = state.name;
        this.#description = state.description;
        this.#note = state.note;
    }

    #color: [red: number, green: number, blue: number];
    getColor() {
        return this.#color;
    }
    setColor(color: Color) {
        const { red, green, blue } = color.rgb() ?? {};
        if (!red || !green || !blue) return;
        this.#color = [red(), green(), blue()];
    }

    #coordinates: Coordinates;
    getCoordinates(): Coordinates {
        return this.#coordinates;
    }
    setCoordinates(coordinates: Coordinates): MapMarker {
        this.#coordinates = [...coordinates];
        return this;
    }

    #description: string;
    getDesc(): string {
        return this.#description;
    }

    #icon: MarkerIcon;
    getIcon(): MarkerIcon {
        return this.#icon;
    }

    #name: string;
    getName(): string {
        return this.#name;
    }

    #note: string;
    getNote(): string {
        return this.#note;
    }

    #size: number = 24;
    getSize(): number {
        return this.#size;
    }

    getState(): DefinedMarker {
        let partial: Omit<DefinedMarker, "icon" | "marker"> = {
            coordinates: this.#coordinates,
            name: this.#name,
            description: this.#description
        };
        switch (this.#type) {
            case MarkerIconType.Icon: {
                return {
                    ...partial,
                    marker: this.#original
                };
            }
            case MarkerIconType.Marker: {
                return {
                    ...partial,
                    marker: this.#original
                };
            }
        }
    }

    static from(marker: MapMarker): MapMarker {
        return MapMarker.fromState(marker.getState());
    }
    static fromState(state: DefinedMarker): MapMarker {
        return new MapMarker(state);
    }
}
