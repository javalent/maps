import { getIconIds } from "obsidian";

class IconManagerClass {
    #lucideIcons: string[];
    constructor() {
        this.#lucideIcons = getIconIds().map((n) => n.replace("lucide-", ""));
    }
    getIconNames(): string[] {
        return this.#lucideIcons;
    }
}

export const IconManager = new IconManagerClass();
