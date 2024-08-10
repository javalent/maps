import { FuzzyInputSuggest } from "@javalent/utilities";
import { renderMatches, setIcon, type FuzzyMatch } from "obsidian";

export class IconSuggester extends FuzzyInputSuggest<string> {
    getItemText(item: string): string {
        return item;
    }
    renderNote(noteEL: HTMLElement, result: FuzzyMatch<string>): void {
        /* throw new Error("Method not implemented."); */
    }
    renderTitle(titleEl: HTMLElement, result: FuzzyMatch<string>): void {
        titleEl.addClass("has-icon");
        setIcon(titleEl, result.item);
        renderMatches(titleEl.createDiv(), result.item, result.match.matches);
    }
}
