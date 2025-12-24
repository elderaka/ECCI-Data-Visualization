# Scrollytelling Implementation Guide
## From Raw Data to Interactive Story: UK Net-Zero Co-Benefits

**Project:** ECCI-Ulya  
**Date:** December 23, 2025  
**Authors:** Imtitsal Ulya Salsabila, Athayya Khalisah Putri, Salsabila Hidi

---

## Table of Contents
1. [Overview](#overview)
2. [Data Architecture](#data-architecture)
3. [Section-by-Section Implementation](#section-by-section-implementation)
4. [Technical Decisions](#technical-decisions)
5. [Deployment](#deployment)

---

## Overview

This project transforms 46,426 UK small area records with Net-Zero co-benefit data into an interactive scrollytelling experience. The story guides users through:

1. **Hero** - Emotional hook about breathing, moving, and waiting
2. **Distributions** - 3 metrics visualized across all areas
3. **Correlation** - Relationship between air quality and physical activity
4. **Population Impact** - Human scale (67M people affected)
5. **Geographic View** - Interactive heatmap showing where benefits occur
6. **Tradeoff** - Cost-benefit analysis by decile

### Key Statistics
- **Data Points:** 46,426 UK small areas
- **Metrics:** Air quality, physical activity, congestion, net benefit
- **Population Data:** 67 million people
- **Visualization Libraries:** D3.js, MapLibre GL JS, GSAP
- **Framework:** Vue 3 + TypeScript + Vite

---

## Data Architecture

### Source Files

#### `/public/df_wide.csv` (46,426 rows)
Primary dataset with co-benefit metrics per small area:

```csv
small_area,year,air_quality_million_gbp,physical_activity_million_gbp,congestion_million_gbp,net_benefit_million_gbp,hassle_costs_million_gbp
E01000001,2025,1.23,2.45,0.89,4.57,-0.15
S00000001,2025,0.98,1.87,0.34,3.19,-0.08
...
```

**Key Fields:**
- `small_area` - Unique area ID (E01000001, S00000001, etc.)
- `air_quality_million_gbp` - Air pollution reduction benefits (£M)
- `physical_activity_million_gbp` - Active travel health benefits (£M)
- `congestion_million_gbp` - Traffic congestion impacts (£M)
- `net_benefit_million_gbp` - Total net benefit after costs (£M)
- `hassle_costs_million_gbp` - Travel time costs (typically negative)

#### `/public/lookups.csv` (46,426 rows)
Metadata linking areas to geography and demographics:

```csv
small_area,population,households,local_authority,nation
E01000001,1847,823,Westminster,England
S00000001,2103,945,Aberdeen City,Scotland
...
```

**Key Fields:**
- `population` - Number of residents
- `local_authority` - LA name (e.g., "Westminster", "Edinburgh")
- `nation` - Nation name (England, Scotland, Wales, Northern Ireland)

### Data Loading Strategy

**File:** `src/utils/dataLoader.ts`

```typescript
export interface AreaData {
  small_area: string
  year: number
  air_quality_million_gbp: number
  physical_activity_million_gbp: number
  congestion_million_gbp: number
  net_benefit_million_gbp: number
  hassle_costs_million_gbp: number
  population: number
  households: number
  local_authority: string
  nation: string
}

// Singleton pattern - load once, cache forever
let cachedData: AreaData[] | null = null

export async function loadCSVData(): Promise<AreaData[]> {
  if (cachedData) return cachedData
  
  // Load both CSVs in parallel
  const [mainData, lookups] = await Promise.all([
    loadMainCSV(),
    loadLookups()
  ])
  
  // Join on small_area (O(n) with Map)
  const lookupMap = new Map(lookups.map(l => [l.small_area, l]))
  cachedData = mainData.map(row => ({
    ...row,
    ...lookupMap.get(row.small_area)
  }))
  
  return cachedData
}
```

**Key Pattern:** Load data once on first component mount, cache in memory, reuse across all sections.

---

## Section-by-Section Implementation

### 1. Distributions Section
**File:** `src/components/sections/DistributionsSection.vue`

**Data Transformation:**
```typescript
const allData = await loadCSVData()

// Sort by air quality
const sortedData = [...allData].sort((a, b) => 
  a.air_quality_million_gbp - b.air_quality_million_gbp
)

// Sample 500 points for performance
const sampledData = sortedData.filter((_, i) => 
  i % Math.floor(sortedData.length / 500) === 0
)

// Prepare for D3 area chart
const chartData = sampledData.map((d, i) => ({
  index: i,
  airQuality: d.air_quality_million_gbp,
  physicalActivity: d.physical_activity_million_gbp,
  congestion: d.congestion_million_gbp
}))
```

**Visualization:** D3 area chart with three stacked layers

**Scrollytelling:** ScrollTrigger reveals insights as user scrolls through background zones

---

### 2. Correlation Section
**File:** `src/components/sections/CorrelationSection.vue`

**Data Transformation:**
```typescript
const allData = await loadCSVData()

// Filter out tiny values (noise)
const filtered = allData.filter(d => 
  d.air_quality_million_gbp >= 0.1 &&
  d.physical_activity_million_gbp >= 0.1
)

// Sample 1000 points for scatter plot
const sampled = sampleArray(filtered, 1000)

// Calculate 99th percentile to cap outliers
const values = filtered.map(d => d.physical_activity_million_gbp).sort()
const p99 = values[Math.floor(values.length * 0.99)]

// Scale setup
const xScale = d3.scaleLinear()
  .domain([0, d3.max(sampled, d => d.air_quality_million_gbp)])
  .range([0, width])

const yScale = d3.scaleLinear()
  .domain([0, p99])
  .range([height, 0])

// Calculate R² for trend line
const xMean = d3.mean(sampled, d => d.air_quality_million_gbp)
const yMean = d3.mean(sampled, d => d.physical_activity_million_gbp)
// ... linear regression math
```

**Challenge Solved:** Outlier W01002002 (25,847M) compressed entire chart
- **Solution:** Cap y-axis at 99th percentile, show outlier with arrow indicator
- **Result:** Visible trend with R² = 0.134

**Visualization:** D3 scatter plot with:
- 1000 semi-transparent points (opacity 0.5)
- Linear trend line with equation
- Outlier labels with local authority names
- Interactive tooltips

---

### 3. Population Impact Section
**File:** `src/components/sections/PopulationImpactSection.vue`

**Data Transformation:**
```typescript
const allData = await loadCSVData()

// Total population
const totalPopulation = allData.reduce((sum, d) => 
  sum + (d.population || 0), 0
) / 1_000_000  // Convert to millions

// Total economic benefit
const totalBenefit = allData.reduce((sum, d) => 
  sum + d.net_benefit_million_gbp, 0
) / 1000  // Convert to billions

// Percentage with positive benefit
const positiveAreas = allData.filter(d => 
  d.net_benefit_million_gbp > 0
)
const positivePercent = (positiveAreas.length / allData.length) * 100

// Population by benefit tier
const highBenefitPop = allData
  .filter(d => d.net_benefit_million_gbp > 5)
  .reduce((sum, d) => sum + d.population, 0) / 1_000_000

const mediumBenefitPop = allData
  .filter(d => d.net_benefit_million_gbp > 1 && d.net_benefit_million_gbp <= 5)
  .reduce((sum, d) => sum + d.population, 0) / 1_000_000

const lowBenefitPop = allData
  .filter(d => d.net_benefit_million_gbp <= 1)
  .reduce((sum, d) => sum + d.population, 0) / 1_000_000
```

**Visualization:** Animated counters with GSAP
- ScrollTrigger starts animation when section enters viewport
- Counters count up from 0 to final value over 2 seconds
- Font Awesome icons (smile/frown) for positive/negative areas

---

### 4. Geographic View (Heatmap) Section
**File:** `src/components/sections/HeatmapSection.vue`

**Data Transformation:**
```typescript
const allData = await loadCSVData()

// On map click - aggregate by nation or local authority
const clickHandler = (feature) => {
  const areaName = feature.properties.lookups_nation || 
                   feature.properties.lookups_local_authority
  
  // Filter all small areas in this region
  const relevantAreas = allData.filter(d => {
    if (mapType === 'nation') {
      return d.nation === areaName
    } else {
      return d.local_authority === areaName
    }
  })
  
  // Aggregate metrics
  const aggregated = relevantAreas.reduce((acc, d) => ({
    population: acc.population + d.population,
    airQuality: acc.airQuality + d.air_quality_million_gbp,
    physicalActivity: acc.physicalActivity + d.physical_activity_million_gbp,
    congestion: acc.congestion + d.congestion_million_gbp,
    netBenefit: acc.netBenefit + d.net_benefit_million_gbp
  }), { population: 0, airQuality: 0, ... })
  
  // Display in card
  selectedArea.value = {
    name: areaName,
    population: aggregated.population,
    ...
  }
}
```

**Visualization:** MapLibre GL JS with PMTiles
- Toggle between Nations (4) and Local Authorities (374)
- Color scale: 7-color gradient from red (negative) to green (positive)
- Click to aggregate and display regional statistics
- Automatic zoom on layer switch

**Technical Challenge:** PMTiles protocol integration
- **Solution:** Used pmtiles library protocol handler with MapLibre
- **Benefit:** Streaming vector tiles without tile server

---

### 5. Tradeoff Section
**File:** `src/components/sections/TradeoffSection.vue`

**Data Transformation:**
```typescript
const allData = await loadCSVData()

// Sort by net benefit
const sorted = [...allData].sort((a, b) => 
  a.net_benefit_million_gbp - b.net_benefit_million_gbp
)

// Create 10 deciles
const decileSize = Math.floor(sorted.length / 10)
const deciles = Array.from({ length: 10 }, (_, i) => {
  const start = i * decileSize
  const end = start + decileSize
  const group = sorted.slice(start, end)
  
  return {
    decile: i + 1,
    netBenefit: d3.mean(group, d => d.net_benefit_million_gbp),
    hassleCosts: d3.mean(group, d => d.hassle_costs_million_gbp)
  }
})
```

**Visualization:** D3 dual-axis chart
- Bars for net benefit (primary y-axis)
- Line for hassle costs (secondary y-axis)
- Color coding: red/yellow/green by benefit level
- Insight callouts for each decile tier

---

## Technical Decisions

### 1. Why Vue 3 Composition API?
- **Reactive data binding** - Automatic UI updates when data changes
- **TypeScript support** - Type safety for 46,426-row datasets
- **Component reusability** - Each section is isolated and testable
- **Performance** - Virtual DOM for efficient rendering

### 2. Why D3.js for Charts?
- **Full control** - Custom scales, axes, and interactions
- **Data binding** - Direct mapping from CSV to SVG elements
- **Flexibility** - Easy to handle outliers and edge cases
- **Performance** - Canvas/SVG rendering for large datasets

### 3. Why MapLibre GL JS?
- **Open source** - No vendor lock-in (vs. Mapbox)
- **PMTiles support** - Serverless vector tiles
- **WebGL rendering** - Smooth 60fps map interactions
- **Small bundle** - 300KB vs. 2MB+ for alternatives

### 4. Why GSAP for Animations?
- **ScrollTrigger** - Perfect for scrollytelling narratives
- **Performance** - Hardware-accelerated CSS transforms
- **Ease functions** - Professional animation curves
- **Cross-browser** - Works everywhere

### 5. Data Loading Strategy
**Pattern:** Singleton with Promise caching

```typescript
let cachedData: AreaData[] | null = null

export async function loadCSVData() {
  if (cachedData) return cachedData  // Instant return
  
  // Load once
  cachedData = await fetchAndParse()
  return cachedData
}
```

**Why?**
- **Performance** - Load 46,426 rows once, not 5+ times
- **Consistency** - All sections see same data snapshot
- **Network** - One HTTP request instead of multiple

### 6. Sampling Strategy
**Problem:** 46,426 points = slow DOM rendering

**Solutions by section:**
- **Distributions:** Sample every Nth point (500 total)
- **Correlation:** Random sample 1000 points
- **Tradeoff:** Aggregate into 10 deciles

**Result:** 60fps smooth scrolling

### 7. Outlier Handling
**Challenge:** W01002002 = £25,847M (25x larger than next highest)

**Solutions tried:**
1. ❌ Log scale - Distorted trend line
2. ❌ Remove outlier - Lost important data point
3. ✅ Cap y-axis at 99th percentile + show outlier with arrow

**Key Insight:** Outliers are data, not errors. Show them contextually.

---

## Scrollytelling Patterns

### Pattern 1: Progressive Reveal
**Used in:** Distributions Section

```typescript
ScrollTrigger.create({
  trigger: '#distributions',
  start: 'top center',
  end: 'bottom center',
  scrub: 1,
  onUpdate: (self) => {
    // Fade in different insights at 33%, 66%, 100%
    if (self.progress < 0.33) showStep1()
    else if (self.progress < 0.66) showStep2()
    else showStep3()
  }
})
```

### Pattern 2: Animated Counters
**Used in:** Population Impact Section

```typescript
ScrollTrigger.create({
  trigger: '#population',
  start: 'top 60%',
  onEnter: () => {
    // Animate from 0 to final value
    gsap.to(counter, {
      duration: 2,
      value: 67.6,
      ease: 'power2.out',
      onUpdate: function() {
        counter.value = this.targets()[0].value.toFixed(1)
      }
    })
  }
})
```

### Pattern 3: Interactive Exploration
**Used in:** Geographic View Section

```typescript
// Start in guided mode (nations)
// User clicks toggle to switch to LA view
// Click any region to see aggregated statistics
```

---

## Internationalization (i18n)

**Implementation:** Vue I18n with language toggle

```typescript
// src/locales/en.json
{
  "hero": {
    "title": "Breathing, Moving, Waiting",
    "subtitle": "How Net-Zero Changes..."
  }
}

// src/locales/id.json (Indonesian)
{
  "hero": {
    "title": "Bernapas, Bergerak, Menunggu",
    "subtitle": "Bagaimana Net-Zero Mengubah..."
  }
}
```

**All text is translatable** - No hardcoded strings in components

---

## Deployment

### Build Configuration
**File:** `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

**Note:** Removed `vue-tsc` from build to avoid Vercel Node.js 24 compatibility issues

### Vercel Settings
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Node Version:** 20.x (specified in Vercel dashboard)

### File Size Considerations
- **CSV Files:** 46,426 rows = ~3MB (compressed to ~500KB with gzip)
- **Bundle Size:** ~800KB (Vite code splitting)
- **PMTiles:** Loaded from external backend server
- **Fonts:** Google Fonts CDN
- **Icons:** Font Awesome CDN

---

## Key Learnings

### 1. Real Data Has Outliers
Don't fight outliers - embrace them with smart visualization choices.

### 2. Performance Matters
46,426 points = sample, aggregate, or chunk. Never render all at once.

### 3. Scrollytelling is About Flow
Each section should answer: "What comes next?" Logical narrative progression.

### 4. Human Context is Everything
Numbers alone are meaningless. "67M people" resonates more than "46,426 areas".

### 5. Interactive Exploration Wins
Give users control after guiding them through the story.

---

## Project Structure

```
ecci-ulya/
├── public/
│   ├── df_wide.csv           # 46,426 area records
│   └── lookups.csv           # Population + geography
├── src/
│   ├── components/
│   │   ├── Navbar.vue        # Navigation with i18n
│   │   ├── Footer.vue        # Credits modal
│   │   └── sections/
│   │       ├── HeroSection.vue
│   │       ├── DistributionsSection.vue
│   │       ├── CorrelationSection.vue
│   │       ├── PopulationImpactSection.vue
│   │       ├── HeatmapSection.vue
│   │       └── TradeoffSection.vue
│   ├── locales/
│   │   ├── en.json           # English translations
│   │   └── id.json           # Indonesian translations
│   ├── utils/
│   │   └── dataLoader.ts     # CSV loading + caching
│   ├── App.vue               # Root component
│   ├── main.ts               # Vue app entry
│   └── style.css             # Tailwind + custom styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

---

## Credits

**Made with 💖 by:**
- Imtitsal Ulya Salsabila
- Athayya Khalisah Putri
- Salsabila Hidi

**Data Source:**
Edinburgh Climate Change Institute, University of Edinburgh

**Technologies:**
Vue 3 • TypeScript • Vite • D3.js • MapLibre GL JS • GSAP • Tailwind CSS • Font Awesome

---

## Final Notes

This project demonstrates that **data storytelling is an art**. The same 46,426 rows can be presented as:
- ❌ A boring table
- ❌ A confusing dashboard
- ✅ An engaging narrative journey

**Key takeaway:** Lead with story, support with data. Not the other way around.

---

**Repository:** https://github.com/elderaka/ECCI-ulya  
**Live Demo:** [Your Vercel URL]  
**Date:** December 23, 2025
