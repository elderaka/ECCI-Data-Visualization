import type { LaporanSection, SelectedArea, VizConfig } from './types';
import { UK_DEFAULT_CAMERA } from './types';

/**
 * UK Net-Zero Advocate - Scrollytelling Sections
 * A data-driven story empowering communities to advocate for climate action
 * 
 * Features:
 * - Area selection: Users can pick their area or explore UK-wide
 * - Dynamic content: All sections adapt based on selected area
 * - Rich visualizations: Charts, maps, comparisons, gauges
 * - Activist toolkit: Action-oriented CTAs throughout
 */

// Helper function to get appropriate zoom level based on area type
function getAreaZoom(area: SelectedArea, adjustment: number = 0): number {
  const baseZoom = area.type === 'nation' ? 6.5 : area.type === 'local_authority' ? 10 : 12;
  return baseZoom + adjustment;
}

// Helper function to offset camera center position
function offsetCenter(center: [number, number], offsetX: number = 0, offsetY: number = 0): [number, number] {
  return [center[0] + offsetX, center[1] + offsetY];
}

// ============================================================================
// SECTION 0: HERO - Landing & Area Selection
// ============================================================================
export const coBenefitsHero: LaporanSection = {
  id: 'hero',
  title: 'UK Net-Zero Advocate',
  theme: 'calm',
  layout: 'single',
  align: 'center',
  justify: 'center',
  width: '70vw',
  storyKey: 'hero',
  showAreaPicker: true,
  content: (area?: SelectedArea) => [
    {
      type: 'text',
      subheading: 'Your Local Climate Action Toolkit',
      body: area
        ? area.type === 'small_area'
          ? `<strong>Welcome back!</strong> You're exploring <strong>${area.name}</strong> in ${area.localAuthority}, ${area.nation}.${area.areaTypeDisplay ? `<br/><em>${area.areaTypeDisplay}</em>` : ''}<br/><br/>Scroll to discover what climate action means for your community.`
          : area.type === 'local_authority'
          ? `<strong>Welcome back!</strong> You're exploring <strong>${area.name}</strong>, a local authority in ${area.nation}.<br/><br/>Scroll to discover what climate action means for your region.`
          : `<strong>Welcome back!</strong> You're exploring <strong>${area.name}</strong>.<br/><br/>Scroll to discover what climate action means for your nation.`
        : `<strong>What if you could show your council exactly how much your community gains from climate action?</strong><br/><br/>Enter your postcode or click the map to explore local benefits — or scroll to see the UK-wide picture.`
    },
    {
      type: 'text',
      body: area
        ? `<div class="area-search-container" id="area-search-container">
        <div class="search-wrapper">
          <input type="text" id="area-search" class="area-search-input" placeholder="Enter postcode or area name..." autocomplete="off" />
          <div id="area-suggestions" class="area-suggestions"></div>
        </div>
        <button id="area-search-btn" class="area-search-btn" title="Search"><i class="fa fa-search"></i></button>
        <button id="area-surprise-btn" class="area-surprise-btn">Surprise Me!</button>
        <button id="area-map-pick-btn" class="area-map-pick-btn">Pick on the map</button>
        <button id="area-reset-btn" class="area-reset-btn">Reset</button>
      </div>
      <div id="map-layer-toggle" class="map-layer-toggle" style="display: none;">
        <button class="layer-toggle-btn active" data-layer="nation">Nation</button>
        <button class="layer-toggle-btn" data-layer="local_authority">Local Authority</button>
        <button class="layer-toggle-btn" data-layer="small_area">Small Area</button>
      </div>`
        : `<div class="area-search-container" id="area-search-container">
        <div class="search-wrapper">
          <input type="text" id="area-search" class="area-search-input" placeholder="Enter postcode or area name..." autocomplete="off" />
          <div id="area-suggestions" class="area-suggestions"></div>
        </div>
        <button id="area-search-btn" class="area-search-btn" title="Search"><i class="fa fa-search"></i></button>
        <button id="area-surprise-btn" class="area-surprise-btn">Surprise Me!</button>
        <button id="area-map-pick-btn" class="area-map-pick-btn">Pick on the map</button>
        <button id="area-reset-btn" class="area-reset-btn" style="display: none;">Reset & Explore Again</button>
      </div>
      <div id="map-layer-toggle" class="map-layer-toggle" style="display: none;">
        <button class="layer-toggle-btn active" data-layer="nation">Nation</button>
        <button class="layer-toggle-btn" data-layer="local_authority">Local Authority</button>
        <button class="layer-toggle-btn" data-layer="small_area">Small Area</button>
      </div>`
    },
    {
      type: 'card-grid',
      cards: [
        { title: '£99.7B', description: 'Total UK co-benefits by 2050' },
        { title: '46,426', description: 'Small areas mapped' },
        { title: '11', description: 'Benefit categories tracked' },
      ]
    }
  ],
  cameraPosition: (area?: SelectedArea) => area
    ? { center: area.center, zoom: getAreaZoom(area), pitch: 0, bearing: 0, timestamp: new Date().toISOString() }
    : UK_DEFAULT_CAMERA,
  mapOpacity: 0.9,
};

// ============================================================================
// SECTION 1A: THE BIG PICTURE - Text Only (Left Side)
// ============================================================================
export const coBenefitsIntro1: LaporanSection = {
  id: 'intro-1',
  title: (area?: SelectedArea) => area 
    ? `Why ${area.localAuthority} Should Act Now`
    : 'The Case for Climate Action',
  theme: 'calm',
  layout: 'scrolly',
  chapterNumber: 1,
  chapterLabel: (area?: SelectedArea) => area
    ? `Chapter 1 · ${area.localAuthority}'s Opportunity`
    : 'Chapter 1 · The Big Picture',
  storyKey: 'intro-1',
  align: 'start',
  justify: 'center',
  reverseLayout: false,
  content: (area?: SelectedArea) => [
    {
      type: 'text',
      body: area
        ? `<strong>${area.name}</strong> stands to gain significantly from the UK's net-zero pathway.${area.areaTypeDisplay ? ` As a ${area.areaTypeDisplay.toLowerCase()} area, your location has specific opportunities that differ from the national average.` : ' Explore the opportunities for your region below.'}`
        : `The UK's journey to net-zero isn't just about cutting emissions — it's about creating <strong>tangible benefits</strong> for every community. From cleaner air to warmer homes, the co-benefits add up to nearly <strong>£100 billion</strong> by 2050.`
    }
  ],
  vizPanel: undefined, // No viz panel for this section
  cameraPosition: (area?: SelectedArea) => area
    ? { center: offsetCenter(area.center, area.type === 'nation' ? -3 : area.type === 'local_authority' ? -0.1 : -0.5, 0), zoom: getAreaZoom(area, 0), pitch: 20, bearing: 0, timestamp: new Date().toISOString() }
    : UK_DEFAULT_CAMERA,
  mapOpacity: 0.9,
  showHeatmap: false,
  disableMicrowave: true,
};

// ============================================================================
// SECTION 1B: THE BIG PICTURE - Visualization on Left, Text on Right
// ============================================================================
export const coBenefitsIntro2: LaporanSection = {
  id: 'intro-2',
  title: (area?: SelectedArea) => area 
    ? `Why ${area.localAuthority} Should Act Now`
    : 'The Case for Climate Action',
  theme: 'calm',
  layout: 'scrolly',
  chapterNumber: 1,
  storyKey: 'intro-2',
  align: 'start',
  justify: 'center',
  reverseLayout: true,
  content: () => [
    {
      type: 'text',
      body: `Each curve on this chart represents a different <strong>co-benefit stream</strong>. When a line rises, your community gains. The question isn't <em>"should we act?"</em> — it's <em>"how much do we stand to gain?"</em>`
    }
  ],
  metaNote: {
    type: 'info',
    text: (area?: SelectedArea) => area
      ? `Data shown for ${area.name} · Source: UK Co-Benefits Atlas 2025-2050`
      : 'Data: UK Climate Change Committee pathway analysis, 2025–2050 projection'
  },
  vizPanel: (area?: SelectedArea): VizConfig => ({
    type: 'timeseries',
    title: area ? `${area.localAuthority}: Benefits Over Time` : 'UK Co-Benefits: 2025-2050',
    subtitle: 'Million GBP (Net Present Value)',
    badge: area ? area.nation : 'UK Overview',
    caption: area ? `Projected benefits for ${area.name}` : 'Aggregated co-benefits across all UK small areas',
    tags: ['Total Sum', 'Health', 'Housing', 'Transport'],
    dataEndpoint: area 
      ? area.type === 'nation' 
        ? `/api/timeseries/nation/area/${encodeURIComponent(area.id)}`
        : area.type === 'local_authority'
          ? `/api/timeseries/region/area/${encodeURIComponent(area.id)}`
          : `/api/timeseries/area/area/${encodeURIComponent(area.id)}`
      : '/api/timeseries/nation/category/sum?startYear=2025&endYear=2050',
  }),
  cameraPosition: (area?: SelectedArea) => area
    ? { center: area.center, zoom: getAreaZoom(area, -1), pitch: 0, bearing: 0, timestamp: new Date().toISOString() }
    : UK_DEFAULT_CAMERA,  
  mapOpacity: 0.7,
  showHeatmap: true,
  heatmapField: 'sum',
  disableMicrowave: false
};

// ============================================================================
// SECTION 2: HEALTH & WELLBEING - Cleaner Air, Active Lives
// ============================================================================
export const coBenefitsHealth: LaporanSection = {
  id: 'health',
  title: (area?: SelectedArea) => area
    ? `Health Benefits in ${area.localAuthority}`
    : 'Cleaner Air, Healthier Lives',
  theme: 'green',
  layout: 'scrolly',
  chapterNumber: 2,
  chapterLabel: 'Chapter 2 · Health & Wellbeing',
  storyKey: 'health',
  align: 'start',
  justify: 'center',
  content: (area?: SelectedArea) => [
    {
      type: 'text',
      body: area
        ? `In <strong>${area.areaTypeDisplay ? area.areaTypeDisplay.toLowerCase() + ' areas' : area.type === 'local_authority' ? 'your local authority' : 'your nation'}</strong> like ${area.name}, climate action delivers direct health improvements. Cleaner air means fewer respiratory issues. Active travel infrastructure means more walking, cycling, and better cardiovascular health.`
        : `<strong>Physical activity</strong> and <strong>air quality</strong> are the two largest positive contributors to co-benefits. As trips shift from cars to walking, cycling, and public transport, we see <em>fewer hospital admissions</em> and <em>more years lived in good health</em>.`
    },
    {
      type: 'animation',
      items: area
        ? [
            `Compare ${area.localAuthority} with the national average`,
            ...(area.urbanRural ? [`See how ${area.urbanRural.toLowerCase()} areas perform differently`] : []),
            `Physical activity benefits alone could save millions in NHS costs`
          ]
        : [
            'Watch health benefits grow steadily through 2050',
            'Physical activity dominates — active travel infrastructure pays dividends',
            'Urban areas see biggest air quality gains'
          ]
    }
  ],
  metaNote: {
    type: 'success',
    text: (area?: SelectedArea) => area
      ? `${area.localAuthority} could see significant health cost savings from active travel investment.`
      : 'Health co-benefits represent over 40% of total value — the strongest case for action.'
  },
  vizPanel: (area?: SelectedArea): VizConfig => ({
    type: area ? 'comparison' : 'stacked-bar',
    title: area ? `${area.name} vs National Average` : 'Health Benefits by Category',
    subtitle: area ? 'Your area compared' : 'Million GBP across the UK',
    badge: 'Health',
    caption: 'Physical activity + Air quality + Noise reduction',
    tags: ['Physical Activity', 'Air Quality', 'Noise'],
    dataEndpoint: area ? `/api/area-data/${area.id}` : '/api/category-data/nation',
    compareWith: area ? 'national' : undefined,
  }),
  cameraPosition: (area?: SelectedArea) => area
    ? { center: area.center, zoom: getAreaZoom(area, -1), pitch: 0, bearing: 0, timestamp: new Date().toISOString() }
    : UK_DEFAULT_CAMERA,
  mapOpacity: 0.75,
  showHeatmap: true,
  heatmapField: 'physical_activity'
};

// ============================================================================
// SECTION 3: HOUSING COMFORT - Warm, Dry, Safe Homes
// ============================================================================
export const coBenefitsHousing: LaporanSection = {
  id: 'housing',
  title: (area?: SelectedArea) => area
    ? `Housing in ${area.localAuthority}: The Retrofit Opportunity`
    : 'Warm, Dry, Safe Homes',
  theme: 'warm',
  layout: 'scrolly',
  chapterNumber: 3,
  chapterLabel: 'Chapter 3 · Housing Comfort',
  storyKey: 'housing',
  align: 'start',
  justify: 'center',
  content: (area?: SelectedArea) => [
    {
      type: 'text',
      body: area
        ? `Homes in <strong>${area.name}</strong> face challenges from dampness, cold, and increasing summer heat. Retrofitting programs could transform housing quality — and the data shows exactly where investment is needed most.`
        : `The <strong>housing comfort</strong> cluster — excess cold, dampness, and overheating — shows how retrofit and efficient heating can transform <em>leaky houses into healthy homes</em>. Some areas have 3x more to gain than others.`
    },
    {
      type: 'text',
      body: area
        ? `<strong>Key insight:</strong> ${area.urbanRural === 'Rural' ? 'Rural areas often have older, less efficient housing stock — meaning higher potential gains from retrofit.' : area.urbanRural === 'Urban' ? 'Urban areas benefit from economies of scale in retrofit programs — bulk insulation and heat pump installations.' : 'Retrofit programs can transform housing quality across all areas, reducing energy bills and improving comfort.'}`
        : `Watch the housing benefits grow through the timeline. Early action compounds — homes retrofitted in 2025 deliver benefits for 25+ years.`
    }
  ],
  metaNote: {
    type: 'warning',
    text: (area?: SelectedArea) => area
      ? `Council opportunity: Targeted retrofit programs in ${area.localAuthority} could address local housing challenges.`
      : 'Insight: Some areas have 3x more to gain — a strong case for targeted retrofit programmes.'
  },
  vizPanel: (area?: SelectedArea): VizConfig => ({
    type: 'stacked-bar',
    title: area ? `Housing Benefits: ${area.name}` : 'Housing Comfort Benefits by Region',
    subtitle: 'Excess Cold + Dampness + Excess Heat',
    badge: 'Housing',
    caption: area ? `Breakdown for ${area.areaTypeDisplay ? area.areaTypeDisplay.toLowerCase() : area.type}` : 'Per-household comparison across UK regions',
    tags: ['Excess Cold', 'Dampness', 'Excess Heat'],
    dataEndpoint: area ? `/api/area-data/${area.id}` : '/api/category-data/region',
  }),
  cameraPosition: (area?: SelectedArea) => area
    ? { center: area.center, zoom: getAreaZoom(area, -1), pitch: 0, bearing: 0, timestamp: new Date().toISOString() }
    : { center: [-1.5, 53.5], zoom: 6, pitch: 0, bearing: 0, timestamp: new Date().toISOString() },
  mapOpacity: 0.8,
  showHeatmap: true,
  heatmapField: 'excess_cold'
};

// ============================================================================
// SECTION 4: TRANSPORT & MOBILITY - Beyond Electrification
// ============================================================================
export const coBenefitsTransport: LaporanSection = {
  id: 'transport',
  title: (area?: SelectedArea) => area
    ? `Transport in ${area.localAuthority}: The Trade-offs`
    : 'The Honest Trade-offs',
  theme: 'energy',
  layout: 'scrolly',
  chapterNumber: 4,
  chapterLabel: 'Chapter 4 · Transport & Mobility',
  storyKey: 'transport',
  align: 'start',
  justify: 'center',
  content: (area?: SelectedArea) => [
    {
      type: 'text',
      body: `Not every co-benefit is automatically positive. In the model, <strong>congestion</strong>, <strong>road safety</strong>, and <strong>hassle costs</strong> improve initially — then deteriorate as electric vehicles become cheaper and total driving demand rebounds.`
    },
    {
      type: 'text',
      body: area
        ? `For <strong>${area.areaTypeDisplay ? area.areaTypeDisplay.toLowerCase() + ' areas' : area.type === 'local_authority' ? 'your local authority' : 'your area'}</strong>, this means ${area.urbanRural === 'Urban' ? 'congestion could worsen without investment in public transport alternatives.' : area.urbanRural === 'Rural' ? 'road safety improvements depend on infrastructure investment, not just vehicle changes.' : 'transport planning must balance electrification with mode shift strategies.'}`
        : `By the 2040s, some transport lines drop below zero: total time lost in traffic and the social cost of accidents outweigh baseline gains. <strong>Electrification alone isn't enough.</strong>`
    }
  ],
  metaNote: {
    type: 'warning',
    text: 'Key message: Cities need walkable design and strong public transport so net-zero feels like less hassle, not more.'
  },
  vizPanel: (area?: SelectedArea): VizConfig => ({
    type: 'timeseries',
    title: area ? `Transport Trade-offs: ${area.localAuthority}` : 'The Rebound Effect',
    subtitle: 'Watch for when benefits turn negative',
    badge: 'Trade-offs',
    caption: 'Congestion + Road Safety + Hassle Costs',
    tags: ['Congestion', 'Road Safety', 'Hassle Costs'],
    dataEndpoint: area 
      ? area.type === 'nation'
        ? `/api/timeseries/nation/area/${encodeURIComponent(area.id)}`
        : area.type === 'local_authority'
          ? `/api/timeseries/region/area/${encodeURIComponent(area.id)}`
          : `/api/timeseries/area/area/${encodeURIComponent(area.id)}`
      : '/api/timeseries/nation/category/congestion?startYear=2025&endYear=2050',
  }),
  cameraPosition: (area?: SelectedArea) => area
    ? { center: area.center, zoom: getAreaZoom(area, -2), pitch: 0, bearing: 0, timestamp: new Date().toISOString() }
    : UK_DEFAULT_CAMERA,
  mapOpacity: 0.7,
  showHeatmap: true,
  heatmapField: 'congestion'
};

// ============================================================================
// SECTION 5: YOUR AREA'S SCORECARD - The Full Picture
// ============================================================================
export const coBenefitsScorecard: LaporanSection = {
  id: 'scorecard',
  title: (area?: SelectedArea) => area
    ? `${area.name}: Your Climate Scorecard`
    : 'Find Your Area',
  theme: 'purple',
  layout: 'scrolly',
  chapterNumber: 5,
  chapterLabel: (area?: SelectedArea) => area
    ? `Chapter 5 · ${area.localAuthority} Scorecard`
    : 'Chapter 5 · Your Local Picture',
  storyKey: 'scorecard',
  align: 'start',
  justify: 'center',
  showAreaPicker: false, // Will be shown dynamically based on area presence
  content: (area?: SelectedArea) => area
    ? [
        {
          type: 'text',
          body: `Here's the complete picture for <strong>${area.name}</strong>. This scorecard shows all 11 co-benefit categories — from air quality to road repairs — in one view.`
        },
        {
          type: 'card-grid',
          cards: [
            { title: 'Health', description: 'Air quality, physical activity, noise' },
            { title: 'Housing', description: 'Dampness, cold, heat' },
            { title: 'Transport', description: 'Congestion, safety, hassle' },
          ]
        }
      ]
    : [
        {
          type: 'text',
          body: `<strong>Want to see your area's scorecard?</strong><br/><br/>Enter a postcode above or click on the map to explore any of the UK's 46,426 small areas.`
        },
        {
          type: 'text',
          body: `Each area has a unique profile based on its housing stock, transport patterns, and local environment. The data reveals where action will have the biggest impact.`
        }
      ],
  vizPanel: (area?: SelectedArea): VizConfig => ({
    type: area ? 'sparkline-grid' : 'horizontal-bar',
    title: area ? `All Benefits: ${area.name}` : 'Top 10 Areas by Total Benefits',
    subtitle: area ? 'Complete breakdown across all categories' : 'Where climate action delivers most value',
    badge: area ? area.areaTypeDisplay : 'Rankings',
    caption: area ? `${area.localAuthority}, ${area.nation}` : 'Click any area to see full scorecard',
    tags: area 
      ? ['Air Quality', 'Physical Activity', 'Noise', 'Dampness', 'Excess Cold', 'Excess Heat', 'Congestion', 'Road Safety', 'Hassle Costs', 'Road Repairs', 'Diet Change']
      : ['Total Sum', 'Top Performers'],
    dataEndpoint: area ? `/api/area-data/${area.id}` : '/api/category-data/region',
  }),
  cameraPosition: (area?: SelectedArea) => area
    ? { center: area.center, zoom: getAreaZoom(area, 1), pitch: 0, bearing: 0, timestamp: new Date().toISOString() }
    : UK_DEFAULT_CAMERA,
  mapOpacity: 0.85,
  showHeatmap: true,
  heatmapField: 'sum'
};

// ============================================================================
// SECTION 6: TAKE ACTION - Your Toolkit
// ============================================================================
export const coBenefitsAction: LaporanSection = {
  id: 'action',
  title: (area?: SelectedArea) => area
    ? `Take Action for ${area.localAuthority}`
    : 'From Data to Action',
  theme: 'green',
  layout: 'single',
  chapterNumber: 6,
  chapterLabel: 'Chapter 6 · Your Toolkit',
  storyKey: 'action',
  align: 'center',
  justify: 'center',
  width: '70vw',
  content: (area?: SelectedArea) => area
    ? [
        {
          type: 'text',
          body: `You've seen the data for <strong>${area.name}</strong>. Now it's time to act. Use these tools to make the case to your local council.`
        },
        {
          type: 'card-grid',
          cards: [
            { title: 'Download Report', description: `Get a PDF summary for ${area.localAuthority}` },
            { title: 'Email Template', description: 'Ready-to-send message for councillors' },
            { title: 'Find Councillors', description: `Contact info for ${area.localAuthority}` },
            { title: 'Share Story', description: 'Social media toolkit with key stats' },
          ]
        },
        {
          type: 'text',
          body: `<em>"If ${area.localAuthority} commits to this path, residents could see £X million in benefits by 2050."</em><br/><br/>Use this data. Make the case. Your council needs to hear from you.`
        }
      ]
    : [
        {
          type: 'text',
          body: `The co-benefits atlas puts a price tag on things that matter but are hard to count: a warm bedroom, a quiet street, a shorter commute.`
        },
        {
          type: 'text',
          body: `Each chart and map in this story is a reminder that climate action isn't just about <strong>tonnes of CO₂</strong> — it's about <strong>how it feels to live in the UK in 2050</strong>.`
        },
        {
          type: 'card-grid',
          cards: [
            { title: 'Explore Map', description: 'Switch to Free Explore mode' },
            { title: 'Find Your Area', description: 'Go back and enter your postcode' },
            { title: 'Compare Areas', description: 'See how different regions stack up' },
          ]
        }
      ],
  cameraPosition: (area?: SelectedArea) => area
    ? { center: area.center, zoom: getAreaZoom(area, -2), pitch: 0, bearing: 0, timestamp: new Date().toISOString() }
    : UK_DEFAULT_CAMERA,
  mapOpacity: 0.9,
};

// ============================================================================
// EXPORT: All sections in order
// ============================================================================
export const CO_BENEFITS_SECTIONS: LaporanSection[] = [
  coBenefitsHero,
  coBenefitsIntro1,      // Chapter 1 Part 1: Text on left
  coBenefitsIntro2,      // Chapter 1 Part 2: Viz left, text right
  coBenefitsHealth,
  coBenefitsHousing,
  coBenefitsTransport,
  coBenefitsScorecard,
  coBenefitsAction,
];
