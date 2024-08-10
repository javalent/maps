import { App, Component, Modal as ObsidianModal } from "obsidian";

export default class MapsModal extends ObsidianModal {
    closer() {
        this.onClose = () => {};
        this.close();
    }
    constructor(app: App, public component: Component) {
        super(app);
        this.containerEl.addClass("maps-modal");
        component.register(this.closer.bind(this));
    }
}

