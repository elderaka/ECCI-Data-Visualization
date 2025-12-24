import type { CameraPosition } from '../../camera-recorder';

export type LaporanContentType = 'text' | 'card-grid' | 'list' | 'mixed' | 'heatmap' | 'animation' | 'viz-chart';

// Section theme types (for background gradients and chapter label colors)
export type SectionTheme = 'default' | 'warm' | 'green' | 'calm' | 'energy' | 'purple';

// Visualization chart types (matching Iqbal's scrollytelling)
export type VizChartType = 'timeseries' | 'bar' | 'horizontal-bar' | 'stacked-bar' | 'pie' | 'donut' | 'area' | 'gauge' | 'comparison' | 'sparkline-grid';

// Selected area context (passed to sections when user picks an area)
export interface SelectedArea {
  id: string;                    // small_area code
  name: string;                  // Display name
  type: 'small_area' | 'local_authority' | 'nation';  // Area type
  localAuthority: string;        // LA name
  nation: string;                // England, Wales, Scotland, Northern Ireland
  urbanRural: string;            // "Urban" or "Rural"
  areaTypeDisplay: string;       // "Urban (near major city)", etc.
  center: [number, number];      // [lng, lat] for camera
}

// Visualization configuration for Plotly charts
export interface VizConfig {
  type: VizChartType;
  title: string | ((area?: SelectedArea) => string);
  subtitle?: string | ((area?: SelectedArea) => string);
  badge?: string;
  caption?: string | ((area?: SelectedArea) => string);
  tags?: string[];
  // Data can be fetched from API or provided statically
  dataEndpoint?: string | ((area?: SelectedArea) => string);
  staticData?: {
    x?: (string | number)[];
    y?: (string | number)[];
    series?: {
      name: string;
      data: number[];
      color?: string;
      lineStyle?: 'solid' | 'dash' | 'dot';
      fill?: boolean;
    }[];
    labels?: string[];
    values?: number[];
  };
  // Plotly layout overrides
  layout?: Record<string, any>;
  // Comparison config (for 'comparison' type)
  compareWith?: 'national' | 'regional' | 'similar-areas';
}

export interface LaporanContent {
  type: LaporanContentType;
  heading?: string;
  subheading?: string;
  body?: string | ((area?: SelectedArea) => string);
  items?: string[] | ((area?: SelectedArea) => string[]);
  cards?: {
    title: string;
    description: string;
    icon?: string; // Emoji or Unicode icon
    image?: string; // Image URL or path
  }[];
  // Visualization chart config (for 'viz-chart' type)
  vizConfig?: VizConfig;
}

// Subsection for granular scroll-based animations within a section
export interface LaporanSubsection {
  id: string;
  // Layout type for this subsection
  layout?: 'single' | 'scrolly' | 'single-left' | 'stacked';
  // Content for this subsection (what text/cards appear)
  content?: LaporanContent[] | ((area?: SelectedArea) => LaporanContent[]);
  // Viz panel for this subsection (can be different or hidden)
  vizPanel?: VizConfig | ((area?: SelectedArea) => VizConfig) | null;
  // Camera position for this subsection
  cameraPosition?: CameraPosition | ((area?: SelectedArea) => CameraPosition);
  // Map opacity for this subsection
  mapOpacity?: number;
  // Show/hide heatmap for this subsection
  showHeatmap?: boolean;
  heatmapField?: string | ((area?: SelectedArea) => string);
  // Duration for transitions (in ms)
  duration?: number;
  // Animation type for entering this subsection
  animationType?: 'fade' | 'slide-left' | 'slide-right' | 'flip' | 'zoom';
}

export interface LaporanSection {
  id: string;
  title: string | ((area?: SelectedArea) => string);
  content: LaporanContent[] | ((area?: SelectedArea) => LaporanContent[]);
  cameraPosition?: CameraPosition | ((area?: SelectedArea) => CameraPosition);
  mapOpacity?: number;
  showHeatmap?: boolean;
  heatmapField?: string | ((area?: SelectedArea) => string);
  duration?: number;
  align?: 'start' | 'center' | 'end'; // Horizontal alignment (left, center, right)
  justify?: 'start' | 'center' | 'end'; // Vertical alignment (top, center, bottom)
  width?: string; // e.g., '60vw', '800px'
  marginLeft?: string;
  marginTop?: string;
  
  // New fields for Iqbal's scrollytelling structure
  theme?: SectionTheme; // Section background theme
  chapterNumber?: number; // e.g., 1, 2, 3...
  chapterLabel?: string | ((area?: SelectedArea) => string);
  chapterIcon?: string; // SVG path or emoji for chapter icon
  
  // Layout types
  layout?: 'single' | 'scrolly' | 'single-left' | 'stacked'; 
  // 'single' = centered card
  // 'scrolly' = two-column (text left, viz right)
  // 'single-left' = card on left column only
  // 'stacked' = vertically stacked cards
  vizPanel?: VizConfig | ((area?: SelectedArea) => VizConfig); // Visualization panel for scrolly layout
  reverseLayout?: boolean; // If true, swaps viz and text positions in scrolly layout (viz left, text right)
  
  // Story data key for triggering viz updates
  storyKey?: string; // e.g., 'intro', 'warm_homes', 'clean_active', 'quiet_cities', 'trade_offs'
  
  // Meta note at bottom of story card
  metaNote?: {
    type?: 'info' | 'warning' | 'success';
    icon?: string;
    text: string | ((area?: SelectedArea) => string);
  };
  
  // Story mode behavior flags
  disableMicrowave?: boolean;
  disableCameraMove?: boolean;
  disableStoryMode?: boolean;
  
  // Area picker flag
  showAreaPicker?: boolean;
  
  // Subsections for granular scroll animations
  subsections?: LaporanSubsection[];
}

// UK-wide default camera position (pitch 0 for manual map placement)
export const UK_DEFAULT_CAMERA: CameraPosition = {
  center: [-3, 55],
  zoom: 5.5,
  pitch: 0,
  bearing: 0,
  timestamp: new Date().toISOString(),
};

