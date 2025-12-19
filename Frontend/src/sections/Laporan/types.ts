import { CameraPosition } from '../camera-recorder';

export type LaporanContentType = 'text' | 'card-grid' | 'list' | 'mixed' | 'heatmap' | 'animation';

export interface LaporanContent {
  type: LaporanContentType;
  heading?: string;
  subheading?: string;
  body?: string;
  items?: string[];
  cards?: {
    title: string;
    description: string;
    icon?: string; // Emoji or Unicode icon
    image?: string; // Image URL or path
  }[];
}

export interface LaporanSection {
  id: string;
  title: string;
  content: LaporanContent[];
  cameraPosition?: CameraPosition; // Optional - if not specified, keeps current camera position
  mapOpacity?: number;
  showHeatmap?: boolean;
  heatmapField?: string;
  duration?: number;
  align?: 'start' | 'center' | 'end'; // Horizontal alignment (left, center, right)
  justify?: 'start' | 'center' | 'end'; // Vertical alignment (top, center, bottom)
  width?: string; // e.g., '60vw', '800px'
  marginLeft?: string;
  marginTop?: string;
}
