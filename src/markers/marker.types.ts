type BaseMarker = {
    coordinates: [longitude: number, latitude: number];
    name?: string;
    description?: string;
    note?: string;
    color?: string | [number, number, number];
    size?: number;
};

export type IconMarker = BaseMarker & {
    icon: string;
};
export type SavedMarker = BaseMarker & {
    marker: string;
};

export type DefinedMarker = IconMarker | SavedMarker;

export enum MarkerIconType {
    Icon,
    Marker
}

type ResolvedSavedMarker = {
    type: MarkerIconType.Marker;
    marker: string;
};
type ResolvedIconMarker = {
    type: MarkerIconType.Icon;
};

/**
 * This needs to be provided to the IconLayer to render the marker.
 */
export type MarkerIcon = {
    icon: string;
    url: string;
    mask: true;
    width: number;
    height: number;
    color?: [red: number, green: number, blue: number];
};
export type ResolvedMarker = BaseMarker & {
    icon: MarkerIcon;
} & (ResolvedIconMarker | ResolvedSavedMarker);
