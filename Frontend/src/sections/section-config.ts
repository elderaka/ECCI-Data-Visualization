import type { CameraPosition } from '../camera-recorder';

export interface Section {
  id: number;
  title: string;
  content: string;
  textPosition: 'center' | 'left' | 'right';
  cameraPosition: CameraPosition;
  mapOpacity?: number;
  mapPosition?: 'center' | 'right'; // Position of map on screen
}

export const SECTIONS: Section[] = [
  {
    id: 1,
    title: 'Welkam tu mobel lejen',
    content: 'Faif seken til the enemi ricis de betelfid.',
    textPosition: 'center',
    cameraPosition: {
      center: [-3, 55],
      zoom: 6.9, // Zoom level 6.9 - close view
      pitch: 60, // Drone shot angle
      bearing: 0,
      timestamp: new Date().toISOString(),
    },
    mapOpacity: 1,
    mapPosition: 'center',
  },
  {
    id: 2,
    title: 'Smes dem',
    content: 'ol trups diployed.',
    textPosition: 'left',
    cameraPosition: {
      center: [-8, 55], // Move camera center to the left (west) to show Atlantic side
      zoom: 4.5, // Zoom OUT to see more area (uses zoom 7 tiles, scaled up)
      pitch: 0,
      bearing: 0,
      timestamp: new Date().toISOString(),
    },
    mapOpacity: 1,
    mapPosition: 'center', // Keep container centered
  },
  {
    id: 3,
    title: 'The Data Speaks',
    content: 'Behind every visualization lies a story of communities, challenges, and opportunities for change.',
    textPosition: 'center',
    cameraPosition: {
      center: [-3, 55], // Back to center
      zoom: 5, // Medium zoom (uses zoom 7 tiles, scaled up)
      pitch: 0,
      bearing: 0,
      timestamp: new Date().toISOString(),
    },
    mapOpacity: 0.5,
    mapPosition: 'center',
  },
  {
    id: 4,
    title: 'Explore Freely',
    content: 'Ready to dive deeper? Switch to free mode and explore the data on your own terms.',
    textPosition: 'center',
    cameraPosition: {
      center: [-3, 55],
      zoom: 5, // Medium zoom (uses zoom 7 tiles, scaled up)
      pitch: 0,
      bearing: 0,
      timestamp: new Date().toISOString(),
    },
    mapOpacity: 0.5,
    mapPosition: 'center',
  },
];
