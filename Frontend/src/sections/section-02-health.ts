import type { Section } from './types';

export const section02: Section = {
  id: 2,
  title: 'Health & Wellbeing Across Nations',
  content: [
    {
      type: 'text',
      props: {
        text: 'Air quality, physical activity, and noise pollution shape our daily lives.',
      },
    },
    {
      type: 'chart',
      props: {
        chartType: 'bar',
        dataEndpoint: '/api/category-data/nation',
        field: 'health_wellbeing',
        title: 'Health & Wellbeing by Nation',
      },
    },
  ],
  textPosition: 'left',
  cameraPosition: {
    center: [-12, 55],
    zoom: 4.5,
    pitch: 0,
    bearing: 0,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.7,
  mapPosition: 'right',
};
