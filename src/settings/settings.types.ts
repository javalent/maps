export interface CustomMarker {
    name: string;
    icon: string;
    color: [number, number, number];
    id: string;
}

export interface MapsSettings {
    markers: CustomMarker[];
}
