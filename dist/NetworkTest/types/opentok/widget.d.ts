export interface Dimensions {
    width: number;
    height: number;
}
export interface WidgetStyle {
    audioLevelDisplayMode: 'auto' | 'on' | 'off';
    backgroundImageURI: string;
    buttonDisplayMode: 'auto' | 'on' | 'off';
    nameDisplayMode: 'auto' | 'on' | 'off';
}
export interface WidgetProperties {
    fitMode?: 'cover' | 'contain';
    insertDefaultUI?: boolean;
    insertMode?: 'replace' | 'after' | 'before' | 'append';
    showControls?: boolean;
    width?: string | number;
    height?: string | number;
}
