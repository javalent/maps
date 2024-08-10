import { LinearInterpolator, type WidgetPlacement } from "@deck.gl/core";
import { ZoomWidget } from "@deck.gl/widgets";

interface ZoomWidgetProps {
    id: string;
    placement?: WidgetPlacement;
    /**
     * View to attach to and interact with. Required when using multiple views.
     */
    viewId?: string | null;
    /**
     * Button orientation.
     */
    orientation?: "vertical" | "horizontal";
    /**
     * Tooltip message on zoom in button.
     */
    zoomInLabel?: string;
    /**
     * Tooltip message on zoom out button.
     */
    zoomOutLabel?: string;
    /**
     * Zoom transition duration in ms.
     */
    transitionDuration?: number;
    /**
     * CSS inline style overrides.
     */
    style?: Partial<CSSStyleDeclaration>;
    /**
     * Additional CSS class.
     */
    className?: string;

    delta?: number;
}
export class LinearZoomWidget extends ZoomWidget {
    delta: number;
    constructor(props: ZoomWidgetProps) {
        super(props);
        this.delta = props.delta ?? 1;
    }
    override handleZoom(nextZoom: number) {
        const viewId = this.viewId || "default-view";
        const nextViewState = {
            ...this.viewport,
            zoom: nextZoom,
            transitionDuration: this.props.transitionDuration,
            transitionInterpolator: new LinearInterpolator({
                transitionProps: ["target", "zoom"]
            })
        };
        // @ts-ignore Using private method temporary until there's a public one
        this.deck._onViewStateChange({
            viewId,
            viewState: nextViewState,
            interactionState: {}
        });
    }
    override handleZoomIn() {
        if (this.viewport) {
            this.handleZoom(this.viewport.zoom + this.delta);
        }
    }

    override handleZoomOut() {
        if (this.viewport) {
            this.handleZoom(this.viewport.zoom - this.delta);
        }
    }
}
