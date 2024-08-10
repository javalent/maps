/**
 * This catches errors and replaces the code block with the message.
 * @param message Message to display in code block.
 */
export function throwError(containerEl: HTMLElement, message: string) {
    containerEl.empty();
    containerEl.createEl("h3", { text: "Maps error" });
    containerEl.createEl("span", { text: message });

    console.error(message);
}
