import type { CameraPosition } from '../camera-recorder';

// Section content types
export type SectionContentType = 'text' | 'chart' | 'image' | 'animation' | 'mixed';

export interface SectionContent {
  type: SectionContentType;
  component?: any; // React component for custom content
  props?: Record<string, any>; // Props to pass to the component
}

// Selected area context (passed to sections when user picks an area)
export interface SelectedArea {
  id: string;                    // small_area code / LA name / nation name
  name: string;                  // Display name
  localAuthority: string;        // LA name
  nation: string;                // England, Wales, Scotland, Northern Ireland
  type: 'small_area' | 'local_authority' | 'nation';  // Level of geography
  urbanRural?: string;           // "Urban" or "Rural" (small areas only)
  areaTypeDisplay?: string;      // "Urban (near major city)", etc. (small areas only)
  center: [number, number];      // [lng, lat] for camera
}

export interface Section {
  id: number; 
  title: string | ((area?: SelectedArea) => string);  // Can be dynamic based on selected area
  content: string | SectionContent[] | ((area?: SelectedArea) => string | SectionContent[]);
  textPosition: 'center' | 'left' | 'right';
  cameraPosition: CameraPosition | ((area?: SelectedArea) => CameraPosition);  // Dynamic camera
  mapOpacity?: number;
  mapPosition?: 'center' | 'right' | 'left';
  backgroundColor?: string;
  duration?: number; // Auto-advance duration in ms
  showAreaPicker?: boolean;  // Show area picker UI in this section
}

// UK-wide default camera position (pitch 0 for manual map placement)
export const UK_DEFAULT_CAMERA: CameraPosition = {
  center: [-3, 55],
  zoom: 5.5,
  pitch: 0,
  bearing: 0,
  timestamp: new Date().toISOString(),
};

// Base section interface that all section files must implement
export interface SectionModule {
  section: Section;
}
