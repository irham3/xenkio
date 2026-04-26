export type AnnotationTool =
    | 'select'
    | 'arrow'
    | 'rectangle'
    | 'ellipse'
    | 'line'
    | 'text'
    | 'freehand'
    | 'sensor';

export interface Point {
    x: number;
    y: number;
}

export interface BaseAnnotation {
    id: string;
    color: string;
    strokeWidth: number;
}

export interface ArrowAnnotation extends BaseAnnotation {
    type: 'arrow';
    start: Point;
    end: Point;
}

export interface RectangleAnnotation extends BaseAnnotation {
    type: 'rectangle';
    start: Point;
    end: Point;
    fill: boolean;
    fillOpacity: number;
}

export interface EllipseAnnotation extends BaseAnnotation {
    type: 'ellipse';
    center: Point;
    radiusX: number;
    radiusY: number;
    fill: boolean;
    fillOpacity: number;
}

export interface LineAnnotation extends BaseAnnotation {
    type: 'line';
    start: Point;
    end: Point;
}

export interface TextAnnotation extends BaseAnnotation {
    type: 'text';
    position: Point;
    text: string;
    fontSize: number;
    fontFamily: string;
}

export interface FreehandAnnotation extends BaseAnnotation {
    type: 'freehand';
    points: Point[];
}

export interface SensorAnnotation extends BaseAnnotation {
    type: 'sensor';
    start: Point;
    end: Point;
}

export type Annotation =
    | ArrowAnnotation
    | RectangleAnnotation
    | EllipseAnnotation
    | LineAnnotation
    | TextAnnotation
    | FreehandAnnotation
    | SensorAnnotation;

export interface AnnotatorState {
    image: HTMLImageElement | null;
    annotations: Annotation[];
    history: Annotation[][];
    historyIndex: number;
    activeTool: AnnotationTool;
    activeColor: string;
    strokeWidth: number;
    fontSize: number;
    fillShape: boolean;
    fillOpacity: number;
}
