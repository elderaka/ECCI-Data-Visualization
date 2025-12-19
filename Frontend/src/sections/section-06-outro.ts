import type { Section } from './types';

export const section06: Section = {
  id: 6,
  title: 'Explore for Yourself',
  content: 'Ready to dive deeper? Switch to free exploration mode and discover patterns in your area.',
  textPosition: 'center',
  cameraPosition: {
    center: [-3, 55],
    zoom: 6,
    pitch: 30,
    bearing: 0,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.8,
  mapPosition: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
};
