import {
    type MarkdownPostProcessorContext,
    parseYaml,
    TFile,
    Component
} from "obsidian";
import { deepEqual } from "fast-equals";
import type Maps from "src/main";

import { RenderedMap } from "src/map/map";
import type { MapState } from "src/map/maps.types";
import { throwError } from "src/utils/error";

export type BufferedContext = {
    sourcePath: string;
    lineStart: number | undefined;
    lineEnd: number | undefined;
};

export class MapProcessor extends Component {
    contexts: WeakMap<TFile, RenderedMap[]> = new WeakMap();
    private extractContext(
        el: HTMLDivElement,
        ctx: MarkdownPostProcessorContext
    ): BufferedContext {
        const sectionInfo = ctx.getSectionInfo(el);
        return {
            sourcePath: ctx?.sourcePath,
            lineStart: sectionInfo?.lineStart,
            lineEnd: sectionInfo?.lineEnd
        };
    }
    private compareContexts(
        newContext: BufferedContext,
        oldContext: BufferedContext
    ): boolean {
        return (
            newContext.lineStart == oldContext.lineStart &&
            newContext.sourcePath == oldContext.sourcePath
        );
    }
    async process(
        plugin: Maps,
        source: string,
        el: HTMLDivElement,
        ctx: MarkdownPostProcessorContext
    ) {
        const file = await plugin.app.vault.getFileByPath(ctx.sourcePath);
        if (!file) return;
        if (!this.contexts.has(file)) {
            this.contexts.set(file, []);
        }
        let currentContext = this.extractContext(el, ctx);

        const state = this.processSource(source);

        if (!this.verifyParameters(state)) {
            //Replace element with an error message.
            throwError(el, "No layers supplied.");
            return;
        }

        const existingMap = this.contexts
            .get(file)!
            .find((map) =>
                this.compareContexts(currentContext, map.getContext())
            );
        if (existingMap) {
            console.log(
                "🚀 ~ file: processor.ts:69 ~ existingMap:",
                existingMap
            );

            //found an already rendered map
            el.replaceWith(existingMap.containerEl);
            existingMap.setState(state);
            existingMap.setContext(currentContext);
            return;
        }
        const map = new RenderedMap(
            plugin.app,
            el,
            state,
            currentContext,
            file
        );
        this.contexts.get(file)!.push(map);
        plugin.registerEvent(
            plugin.app.vault.on("modify", (modified) => {
                if (file !== modified) return;
                /* if (map.isSaving()) return;
                 */
                currentContext = this.extractContext(el, ctx);
                console.log(
                    "🚀 ~ file: processor.ts:88 ~ currentContext:",
                    currentContext,
                    map.getContext()
                );

                map.setContext(currentContext);
            })
        );

        ctx.addChild(map);
        plugin.addChild(map);
    }

    processSource(source: string): unknown {
        //transform wikilinks
        source = source.replace(/\[\[(.+?)\]\]/g, `$1`);

        const params = (parseYaml(source) as unknown) ?? {};

        return params;
    }

    /**
     * This needs to verify the code block parameters are accurate.
     */
    verifyParameters(params: unknown): params is MapState {
        if (params == null) return false;
        if (typeof params !== "object") return false;
        if (!("layers" in params)) return false;
        if (typeof params.layers !== "string" && !Array.isArray(params.layers))
            return false;
        return true;
    }
}
