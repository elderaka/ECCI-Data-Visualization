import type { Section } from './types';

export const section03: Section = {
  id: 3,
  title: 'Housing Comfort: A Growing Challenge',
  content: [
    {
      type: 'text',
      props: {
        text: 'Dampness, excess cold, and excess heat affect millions of homes.',
      },
    },
    {
      type: 'animation',
      props: {
        animationType: 'heatmap',
        dataEndpoint: '/api/timeseries/nation/category/housing_comfort?startYear=2025&endYear=2050',
        yearRange: [2025, 2050],
        autoPlay: true,
      },
    },
  ],
  textPosition: 'left',
  cameraPosition: {
    center: [-3, 55],
    zoom: 5.5,
    pitch: 45,
    bearing: 0,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.8,
  mapPosition: 'right',
  duration: 8000, // 8 second auto-advance
};
