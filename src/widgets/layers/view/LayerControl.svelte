<script lang="ts">
    import { setNodeIcon } from "@javalent/utilities";

    export let layers: string[];
    export let active: number;

    let hovered = true;

    $: console.log("🚀 ~ file: LayerControl.svelte:8 ~ hovered:", hovered);
</script>

<div class="deck-widget layer-control" on:mouseenter={() => (hovered = true)}>
    <!-- on:mouseleave={() => (hovered = false)} -->
    <div class="deck-widget-button" class:hovered>
        {#if hovered}
            <div class="deck-widget-icon-button layer-display">
                {#each layers as layer, index}
                    <div class="layer-input-group">
                        <input
                            checked={index === active}
                            type="radio"
                            id={`${index}`}
                            name="layer"
                            value={layer}
                        />
                        <label for={`${index}`}>{layer}</label>
                    </div>
                {/each}
            </div>
        {:else}
            <button class="deck-widget-icon-button" use:setNodeIcon={"layers"}
            ></button>
        {/if}
    </div>
</div>

<style scoped>
    .layer-control {
        pointer-events: all;
    }
    .deck-widget-button.hovered {
        align-items: flex-start;
        justify-content: flex-end;
    }
    .layer-display {
        border-radius: var(--button-corner-radius, 8px);
        background-color: var(--background-secondary-alt);
        padding: var(--size-4-2);
        box-shadow: 0px 0px 8px 0px var(--background-secondary-alt);
        border: 1px solid var(--background-secondary);
    }
    .layer-input-group {
        display: flex;
        width: max-content;
    }
</style>
