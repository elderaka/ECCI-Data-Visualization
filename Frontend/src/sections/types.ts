import type { CameraPosition } from '../camera-recorder';

// Section content types
export type SectionContentType = 'text' | 'chart' | 'image' | 'animation' | 'mixed';

export interface SectionContent {
  type: SectionContentType;
  component?: any; // React component for custom content
  props?: Record<string, any>; // Props to pass to the component
}

export interface Section {
  id: number;
  title: string;
  content: string | SectionContent[];
  textPosition: 'center' | 'left' | 'right';
  cameraPosition: CameraPosition;
  mapOpacity?: number;
  mapPosition?: 'center' | 'right' | 'left';
  backgroundColor?: string;
  duration?: number; // Auto-advance duration in ms
}

// Base section interface that all section files must implement
export interface SectionModule {
  section: Section;
}
