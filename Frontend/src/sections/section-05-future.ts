import type { Section } from './types';

export const section05: Section = {
  id: 5,
  title: 'The Future: 2025-2050',
  content: [
    {
      type: 'text',
      props: {
        text: 'Climate change will reshape our communities. See projected changes across all categories.',
      },
    },
    {
      type: 'mixed',
      props: {
        layout: 'grid',
        components: [
          {
            type: 'chart',
            chartType: 'area',
            dataEndpoint: '/api/timeseries/nation/category/excess_heat?startYear=2025&endYear=2050',
            title: 'Rising Heat Stress',
          },
          {
            type: 'chart',
            chartType: 'area',
            dataEndpoint: '/api/timeseries/nation/category/excess_cold?startYear=2025&endYear=2050',
            title: 'Declining Cold Stress',
          },
        ],
      },
    },
  ],
  textPosition: 'center',
  cameraPosition: {
    center: [-3, 55],
    zoom: 5,
    pitch: 0,
    bearing: 0,
    timestamp: new Date().toISOString(),
  },
  mapOpacity: 0.3,
  mapPosition: 'center',
  backgroundColor: 'rgba(20, 20, 40, 0.9)',
};
