import type { Section } from './types';

export const section04: Section = {
  id: 4,
  title: 'Road Mobility & Safety',
  content: [
    {
      type: 'image',
      props: {
        src: '/images/traffic-congestion.jpg',
        alt: 'Traffic congestion visualization',
        caption: 'Congestion costs billions in lost productivity annually',
      },
    },
    {
      type: 'chart',
      props: {
        chartType: 'line',
        dataEndpoint: '/api/timeseries/nation/area/England',
        fields: ['congestion', 'road_safety'],
        title: 'Road Mobility Trends: England (2025-2050)',
      },
    },
  ],
  textPosition: 'right',
  cameraPosition: {
    center: [-0.1278, 51.5074], // London
    zoom: 8,
    pitch: 60,
    bearing: 45,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.6,
  mapPosition: 'left',
};
