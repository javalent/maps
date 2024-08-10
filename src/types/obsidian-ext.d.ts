import "obsidian";
declare module "obsidian" {
    interface MenuItem {
        iconEl: HTMLDivElement;
        setWarning(warn: boolean): void;
    }
}
