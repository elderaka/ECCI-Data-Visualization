# Scrollytelling Narrative: UK Net-Zero Co-Benefits Story
**Project:** ECCI Climate Action Toolkit  
**Story Type:** Co-Benefits Advocate Story  
**Last Updated:** December 24, 2025  
**Total Sections:** 7 chapters  
**✨ NEW:** Subsection support with FLIP animations

---

## 🎯 Recent Updates

### Subsection Architecture (December 24, 2025)

**What Changed:**
Sections can now have multiple **subsections** for progressive disclosure. As users scroll, content smoothly transitions using FLIP animations.

**Implementation:**
- Added `subsections[]` array to `LaporanSection` type
- Each subsection can have its own content, viz panel, camera position, and map settings
- FLIP (First, Last, Invert, Play) animation moves story cards smoothly
- Viz panels fade in/out independently

**Example: Chapter 1**
- **Subsection 1:** Text + map only (no viz panel)
- **Subsection 2:** Text moves left, timeseries chart fades in from right
- **Animation:** 600ms smooth transition with cubic-bezier easing

**Benefits:**
- ✅ Reduces cognitive load (one concept at a time)
- ✅ Creates visual narrative flow
- ✅ Maintains spatial continuity (cards move, don't pop)
- ✅ User can scroll at their own pace

---

## 📖 Story Overview

**Title:** UK Net-Zero Advocate  
**Subtitle:** Your Local Climate Action Toolkit

**Purpose:** Transform complex climate data into an engaging narrative that empowers communities to advocate for climate action at the local council level.

**Key Innovation:** Dynamic storytelling that adapts to user-selected areas, providing personalized insights for any of the UK's 46,426 small areas, 374 local authorities, or 4 nations.

**Target Audience:** Community organizers, climate activists, grassroots groups, concerned citizens

**Data Sources:**
- `/public/df_wide.csv` - 46,426 small area records with co-benefit metrics
- `/public/lookups.csv` - Area metadata (population, local authority, nation)

**Core Statistics:**
- **£99.7B** - Total UK co-benefits by 2050
- **46,426** - Small areas mapped
- **11** - Benefit categories tracked
- **67M** - People affected

---

## 🎬 Narrative Arc

```
Hero → Big Picture → Health Wins → Housing Wins → Transport Trade-offs → Your Scorecard → Take Action
```

The story follows a classic structure:
1. **Hook** - Personal connection through area selection
2. **Context** - Why climate action matters financially
3. **Evidence** - Detailed breakdowns by benefit category
4. **Tension** - Honest trade-offs (transport rebound effect)
5. **Resolution** - Complete scorecard with all data
6. **Call to Action** - Tools to advocate to local councils

---

## 📍 Section 0: Hero / Landing Page

**ID:** `hero`  
**Theme:** Calm  
**Layout:** Single column, centered  
**Width:** 70vw  
**Chapter:** N/A (Landing)  
**Subsections:** None

### Dynamic Title
```
Static: "UK Net-Zero Advocate"
```

### Dynamic Subtitle
```
Static: "Your Local Climate Action Toolkit"
```

### Dynamic Welcome Message

**Without Area Selected:**
> "What if you could show your council exactly how much your community gains from climate action?
>
> Enter your postcode or click the map to explore local benefits — or scroll to see the UK-wide picture."

**With Small Area Selected:**
> "Welcome back! You're exploring **[Area Name]** in [Local Authority], [Nation].
> 
> *[Area Type Display]* (e.g., "Urban minor conurbation")
>
> Scroll to discover what climate action means for your community."

**With Local Authority Selected:**
> "Welcome back! You're exploring **[Area Name]**, a local authority in [Nation].
>
> Scroll to discover what climate action means for your region."

**With Nation Selected:**
> "Welcome back! You're exploring **[Area Name]**.
>
> Scroll to discover what climate action means for your nation."

### Interactive Elements

**Area Search Interface:**
- Text input: "Enter postcode or area name..."
- Autocomplete suggestions dropdown
- **Search button** (🔍 icon)
- **"Surprise Me!"** button - Random area selection
- **"Pick on the map"** button - Switches to map selection mode
- **"Reset"** button - Clear selection and start over

**Map Layer Toggle** (shown in pick-map mode):
- Nation level
- Local Authority level
- Small Area level

### Key Statistics Display

Three stat cards:
```
┌────────────────────┐  ┌────────────────────┐  ┌────────────────────┐
│  £99.7B            │  │  46,426            │  │  11                │
│  Total UK          │  │  Small areas       │  │  Benefit           │
│  co-benefits       │  │  mapped            │  │  categories        │
│  by 2050           │  │                    │  │  tracked           │
└────────────────────┘  └────────────────────┘  └────────────────────┘
```

### Camera Position
- **With area:** Zooms to selected area (zoom level based on type: nation=5.5, LA=9, small area=12)
- **Without area:** UK overview (default camera)

### Map Settings
- **Opacity:** 0.9 (bright, visible)
- **Heatmap:** Disabled

---

## 📊 Section 1: The Big Picture

**ID:** `intro`  
**Theme:** Calm  
**Layout:** Scrolly (two-column with subsections)  
**Chapter:** 1  
**Subsections:** 2 (Progressive disclosure with FLIP animations)

### ✨ NEW: Subsection Architecture

This section demonstrates the new **progressive disclosure pattern** where content reveals itself as the user scrolls:

**Subsection 1 (intro-text):** Text introduction with map background
- Story card positioned center-right
- No viz panel (just map showing)
- Map opacity: 0.9 (bright)
- No heatmap
- Duration: 800ms
- Animation: Fade in

**Subsection 2 (intro-viz):** Text moves left, visualization appears
- Story card FLIPS from center-right to left column
- Viz panel fades in from right (timeseries chart)
- Map opacity: 0.7 (dimmed for readability)
- Heatmap enabled (field: `sum`)
- Duration: 800ms  
**Animation: FLIP (First, Last, Invert, Play)**

### FLIP Animation Details

When user scrolls from subsection 1 → 2:

1. **FIRST:** Capture story card's initial position (center-right)
2. **LAST:** Story card's final position (left column)
3. **INVERT:** Apply transform to make new card appear at old position
4. **PLAY:** Animate transform back to 0 (smooth 600ms cubic-bezier)
5. **Simultaneous:** Viz panel fades in from right (opacity 0 → 1 with 300ms delay)

```typescript
// Animation timing
Story card slide: 600ms cubic-bezier(0.4, 0.0, 0.2, 1)
Viz panel fade:   600ms ease with 300ms delay
Viz panel slide:  translateX(20px) → 0
```

### Dynamic Title

**Without Area:**
```
"The Case for Climate Action"
```

**With Area:**
```
"Why [Local Authority] Should Act Now"
```

### Dynamic Chapter Label

**Without Area:**
```
"Chapter 1 · The Big Picture"
```

**With Area:**
```
"Chapter 1 · [Local Authority]'s Opportunity"
```

### Content (Left Panel)

**Paragraph 1 - Context Setting:**

*Without area:*
> "The UK's journey to net-zero isn't just about cutting emissions — it's about creating **tangible benefits** for every community. From cleaner air to warmer homes, the co-benefits add up to nearly **£100 billion** by 2050."

*With area:*
> "**[Area Name]** stands to gain significantly from the UK's net-zero pathway. As a [area type display] area, your location has specific opportunities that differ from the national average."
>
> *(Note: Second sentence only shown if area type display exists)*

**Paragraph 2 - Chart Interpretation:**
> "Each curve on this chart represents a different **co-benefit stream**. When a line rises, your community gains. The question isn't *'should we act?'* — it's *'how much do we stand to gain?'*"

### Visualization (Right Panel)

**Type:** Timeseries chart (stacked area or line graph)

**Title:**
- With area: `"[Local Authority]: Benefits Over Time"`
- Without area: `"UK Co-Benefits: 2025-2050"`

**Subtitle:** `"Million GBP (Net Present Value)"`

**Badge:**
- With area: `[Nation name]` (e.g., "England", "Scotland")
- Without area: `"UK Overview"`

**Caption:**
- With area: `"Projected benefits for [Area Name]"`
- Without area: `"Aggregated co-benefits across all UK small areas"`

**Data Categories Shown:**
- Total Sum (primary line)
- Health (green)
- Housing (warm colors)
- Transport (blue/orange)

**API Endpoint (Dynamic):**
```
With nation: /api/timeseries/nation/area/{areaId}
With LA:     /api/timeseries/region/area/{areaId}
With small:  /api/timeseries/area/area/{areaId}
Without:     /api/timeseries/nation/category/sum?startYear=2025&endYear=2050
```

### Meta Note

**Type:** Info box (blue)

**Text:**
- With area: `"Data shown for [Area Name] · Source: UK Co-Benefits Atlas 2025-2050"`
- Without area: `"Data: UK Climate Change Committee pathway analysis, 2025–2050 projection"`

### Camera Position
- **With area:** Zoomed to area, pulled back slightly (zoom - 1)
- **Without area:** UK overview

### Map Settings
- **Opacity:** 0.7 (semi-transparent for readability)
- **Heatmap:** Enabled (field: `sum`)
- **Heatmap colors:** Show total benefit distribution across UK

---

## 💚 Section 2: Health & Wellbeing

**ID:** `health`  
**Theme:** Green  
**Layout:** Scrolly  
**Chapter:** 2

### Dynamic Title

**Without Area:**
```
"Cleaner Air, Healthier Lives"
```

**With Area:**
```
"Health Benefits in [Local Authority]"
```

### Chapter Label
```
"Chapter 2 · Health & Wellbeing"
```

### Content (Left Panel)

**Paragraph 1 - Main Message:**

*Without area:*
> "**Physical activity** and **air quality** are the two largest positive contributors to co-benefits. As trips shift from cars to walking, cycling, and public transport, we see *fewer hospital admissions* and *more years lived in good health*."

*With area:*
> "In **[area type display] areas** like [Area Name], climate action delivers direct health improvements. Cleaner air means fewer respiratory issues. Active travel infrastructure means more walking, cycling, and better cardiovascular health."
>
> *(Uses "your local authority" if LA selected, "your nation" if nation selected)*

**Paragraph 2 - Animated Points:**

*Without area:*
- Watch health benefits grow steadily through 2050
- Physical activity dominates — active travel infrastructure pays dividends
- Urban areas see biggest air quality gains

*With area:*
- Compare [Local Authority] with the national average
- *(If urban/rural known)* See how [urban/rural] areas perform differently
- Physical activity benefits alone could save millions in NHS costs

### Visualization (Right Panel)

**Type:** 
- **With area:** Comparison chart (bar chart showing area vs national average)
- **Without area:** Stacked bar chart by category

**Title:**
- With area: `"[Area Name] vs National Average"`
- Without area: `"Health Benefits by Category"`

**Subtitle:**
- With area: `"Your area compared"`
- Without area: `"Million GBP across the UK"`

**Badge:** `"Health"`

**Caption:** `"Physical activity + Air quality + Noise reduction"`

**Data Categories:**
- Physical Activity (largest contributor, ~40% of total)
- Air Quality
- Noise Reduction

**API Endpoint:**
- With area: `/api/area-data/{areaId}`
- Without area: `/api/category-data/nation`

### Meta Note

**Type:** Success box (green)

**Text:**
- With area: `"[Local Authority] could see significant health cost savings from active travel investment."`
- Without area: `"Health co-benefits represent over 40% of total value — the strongest case for action."`

### Camera Position
- **With area:** Zoomed to area, pulled back (zoom - 1)
- **Without area:** UK overview

### Map Settings
- **Opacity:** 0.75
- **Heatmap:** Enabled (field: `physical_activity`)
- **Heatmap interpretation:** Darker = more physical activity benefits

---

## 🏠 Section 3: Housing Comfort

**ID:** `housing`  
**Theme:** Warm (orange/amber tones)  
**Layout:** Scrolly  
**Chapter:** 3

### Dynamic Title

**Without Area:**
```
"Warm, Dry, Safe Homes"
```

**With Area:**
```
"Housing in [Local Authority]: The Retrofit Opportunity"
```

### Chapter Label
```
"Chapter 3 · Housing Comfort"
```

### Content (Left Panel)

**Paragraph 1 - Problem Statement:**

*Without area:*
> "The **housing comfort** cluster — excess cold, dampness, and overheating — shows how retrofit and efficient heating can transform *leaky houses into healthy homes*. Some areas have 3x more to gain than others."

*With area:*
> "Homes in **[Area Name]** face challenges from dampness, cold, and increasing summer heat. Retrofitting programs could transform housing quality — and the data shows exactly where investment is needed most."

**Paragraph 2 - Key Insight:**

*Without area:*
> "Watch the housing benefits grow through the timeline. Early action compounds — homes retrofitted in 2025 deliver benefits for 25+ years."

*With area (dynamic based on urban/rural):*

**If Rural:**
> "**Key insight:** Rural areas often have older, less efficient housing stock — meaning higher potential gains from retrofit."

**If Urban:**
> "**Key insight:** Urban areas benefit from economies of scale in retrofit programs — bulk insulation and heat pump installations."

**If Unknown/Other:**
> "**Key insight:** Retrofit programs can transform housing quality across all areas, reducing energy bills and improving comfort."

### Visualization (Right Panel)

**Type:** Stacked bar chart

**Title:**
- With area: `"Housing Benefits: [Area Name]"`
- Without area: `"Housing Comfort Benefits by Region"`

**Subtitle:** `"Excess Cold + Dampness + Excess Heat"`

**Badge:** `"Housing"`

**Caption:**
- With area: `"Breakdown for [area type display]"` (e.g., "Breakdown for urban major conurbation")
- Without area: `"Per-household comparison across UK regions"`

**Data Categories:**
- **Excess Cold** (largest - inadequate heating)
- **Dampness** (moisture, mold, condensation)
- **Excess Heat** (summer overheating, increasing concern)

**API Endpoint:**
- With area: `/api/area-data/{areaId}`
- Without area: `/api/category-data/region`

### Meta Note

**Type:** Warning box (amber)

**Text:**
- With area: `"Council opportunity: Targeted retrofit programs in [Local Authority] could address local housing challenges."`
- Without area: `"Insight: Some areas have 3x more to gain — a strong case for targeted retrofit programmes."`

### Camera Position
- **With area:** Zoomed to area, pulled back (zoom - 1)
- **Without area:** Northern England focus `{center: [-1.5, 53.5], zoom: 6}` (where housing issues most acute)

### Map Settings
- **Opacity:** 0.8
- **Heatmap:** Enabled (field: `excess_cold`)
- **Heatmap interpretation:** Shows where cold homes are most prevalent

---

## 🚗 Section 4: Transport & Mobility

**ID:** `transport`  
**Theme:** Energy (blue/electric tones)  
**Layout:** Scrolly  
**Chapter:** 4

### Title (Static/Dynamic)

**Without Area:**
```
"The Honest Trade-offs"
```

**With Area:**
```
"Transport in [Local Authority]: The Trade-offs"
```

### Chapter Label
```
"Chapter 4 · Transport & Mobility"
```

### Content (Left Panel)

**Paragraph 1 - The Rebound Problem:**
> "Not every co-benefit is automatically positive. In the model, **congestion**, **road safety**, and **hassle costs** improve initially — then deteriorate as electric vehicles become cheaper and total driving demand rebounds."

**Paragraph 2 - Area-Specific Impact:**

*Without area:*
> "By the 2040s, some transport lines drop below zero: total time lost in traffic and the social cost of accidents outweigh baseline gains. **Electrification alone isn't enough.**"

*With area (dynamic based on urban/rural):*

**If Urban:**
> "For **[area type display] areas**, this means congestion could worsen without investment in public transport alternatives."

**If Rural:**
> "For **[area type display] areas**, this means road safety improvements depend on infrastructure investment, not just vehicle changes."

**If Unknown/Other:**
> "For **your area**, this means transport planning must balance electrification with mode shift strategies."

### Visualization (Right Panel)

**Type:** Timeseries chart (line graph showing curves that dip below zero)

**Title:**
- With area: `"Transport Trade-offs: [Local Authority]"`
- Without area: `"The Rebound Effect"`

**Subtitle:** `"Watch for when benefits turn negative"`

**Badge:** `"Trade-offs"`

**Caption:** `"Congestion + Road Safety + Hassle Costs"`

**Data Categories:**
- **Congestion** (time lost in traffic)
- **Road Safety** (accidents, casualties)
- **Hassle Costs** (travel time, inconvenience)

**Visual Note:** Chart should clearly show lines crossing zero and going negative in 2040s

**API Endpoint:**
- With nation: `/api/timeseries/nation/area/{areaId}`
- With LA: `/api/timeseries/region/area/{areaId}`
- With small: `/api/timeseries/area/area/{areaId}`
- Without: `/api/timeseries/nation/category/congestion?startYear=2025&endYear=2050`

### Meta Note

**Type:** Warning box (red/orange)

**Text:** (Static for all)
> "Key message: Cities need walkable design and strong public transport so net-zero feels like less hassle, not more."

### Camera Position
- **With area:** Zoomed to area, pulled back more (zoom - 2) to show transport networks
- **Without area:** UK overview

### Map Settings
- **Opacity:** 0.7
- **Heatmap:** Enabled (field: `congestion`)
- **Heatmap interpretation:** Shows congestion hotspots (negative = worse)

---

## 📋 Section 5: Your Area's Scorecard

**ID:** `scorecard`  
**Theme:** Purple (data/analytics theme)  
**Layout:** Scrolly  
**Chapter:** 5

### Dynamic Title

**Without Area:**
```
"Find Your Area"
```

**With Area:**
```
"[Area Name]: Your Climate Scorecard"
```

### Dynamic Chapter Label

**Without Area:**
```
"Chapter 5 · Your Local Picture"
```

**With Area:**
```
"Chapter 5 · [Local Authority] Scorecard"
```

### Content (Left Panel)

**With Area Selected:**

**Paragraph 1:**
> "Here's the complete picture for **[Area Name]**. This scorecard shows all 11 co-benefit categories — from air quality to road repairs — in one view."

**Card Grid (3 cards):**
```
┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│  Health              │  │  Housing             │  │  Transport           │
│  Air quality,        │  │  Dampness,           │  │  Congestion,         │
│  physical activity,  │  │  cold, heat          │  │  safety, hassle      │
│  noise               │  │                      │  │                      │
└──────────────────────┘  └──────────────────────┘  └──────────────────────┘
```

**Without Area Selected:**

**Paragraph 1:**
> "**Want to see your area's scorecard?**
>
> Enter a postcode above or click on the map to explore any of the UK's 46,426 small areas."

**Paragraph 2:**
> "Each area has a unique profile based on its housing stock, transport patterns, and local environment. The data reveals where action will have the biggest impact."

**Additional UI:**
- Shows area picker interface (should be enabled)

### Visualization (Right Panel)

**Type:**
- **With area:** Sparkline grid (11 small charts, one per category)
- **Without area:** Horizontal bar chart (Top 10 areas by total benefits)

**Title:**
- With area: `"All Benefits: [Area Name]"`
- Without area: `"Top 10 Areas by Total Benefits"`

**Subtitle:**
- With area: `"Complete breakdown across all categories"`
- Without area: `"Where climate action delivers most value"`

**Badge:**
- With area: `[Area Type Display]` (e.g., "Urban major conurbation")
- Without area: `"Rankings"`

**Caption:**
- With area: `"[Local Authority], [Nation]"`
- Without area: `"Click any area to see full scorecard"`

**Data Categories (All 11):**
1. **Air Quality** (health)
2. **Physical Activity** (health)
3. **Noise** (health)
4. **Dampness** (housing)
5. **Excess Cold** (housing)
6. **Excess Heat** (housing)
7. **Congestion** (transport - can be negative)
8. **Road Safety** (transport - can be negative)
9. **Hassle Costs** (transport - can be negative)
10. **Road Repairs** (infrastructure)
11. **Diet Change** (lifestyle/health)

**Sparkline Grid Layout:**
```
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Air Quality   📈 │  │ Physical Act. 📈 │  │ Noise         📈 │
│ £X.XM            │  │ £X.XM            │  │ £X.XM            │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Dampness      📈 │  │ Excess Cold   📈 │  │ Excess Heat   📈 │
│ £X.XM            │  │ £X.XM            │  │ £X.XM            │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│ Congestion    📉 │  │ Road Safety   📉 │  │ Hassle Costs  📉 │
│ £X.XM (neg)      │  │ £X.XM (neg)      │  │ £X.XM (neg)      │
└──────────────────┘  └──────────────────┘  └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│ Road Repairs  📈 │  │ Diet Change   📈 │
│ £X.XM            │  │ £X.XM            │
└──────────────────┘  └──────────────────┘
```

**API Endpoint:**
- With area: `/api/area-data/{areaId}` (returns all 11 categories)
- Without area: `/api/category-data/region` (returns top areas)

### Camera Position
- **With area:** Zoomed in close (zoom + 1) for detailed view
- **Without area:** UK overview

### Map Settings
- **Opacity:** 0.85 (bright, clear)
- **Heatmap:** Enabled (field: `sum`)
- **Interactive:** Click any area to see its scorecard

---

## 🎯 Section 6: Take Action / Toolkit

**ID:** `action`  
**Theme:** Green (action/empowerment theme)  
**Layout:** Single column, centered  
**Width:** 70vw  
**Chapter:** 6

### Dynamic Title

**Without Area:**
```
"From Data to Action"
```

**With Area:**
```
"Take Action for [Local Authority]"
```

### Chapter Label
```
"Chapter 6 · Your Toolkit"
```

### Content

**With Area Selected:**

**Paragraph 1 - Transition to Action:**
> "You've seen the data for **[Area Name]**. Now it's time to act. Use these tools to make the case to your local council."

**Card Grid (4 Action Cards):**
```
┌────────────────────────┐  ┌────────────────────────┐
│  📄 Download Report    │  │  ✉️ Email Template      │
│  Get a PDF summary     │  │  Ready-to-send message │
│  for [Local Authority] │  │  for councillors       │
└────────────────────────┘  └────────────────────────┘

┌────────────────────────┐  ┌────────────────────────┐
│  👥 Find Councillors   │  │  📱 Share Story        │
│  Contact info for      │  │  Social media toolkit  │
│  [Local Authority]     │  │  with key stats        │
└────────────────────────┘  └────────────────────────┘
```

**Paragraph 2 - Call to Action:**
> "*If [Local Authority] commits to this path, residents could see £X million in benefits by 2050.*"
>
> Use this data. Make the case. Your council needs to hear from you.

**Without Area Selected:**

**Paragraph 1 - Philosophy:**
> "The co-benefits atlas puts a price tag on things that matter but are hard to count: a warm bedroom, a quiet street, a shorter commute."

**Paragraph 2 - Human Impact:**
> "Each chart and map in this story is a reminder that climate action isn't just about **tonnes of CO₂** — it's about **how it feels to live in the UK in 2050**."

**Card Grid (3 Exploration Cards):**
```
┌────────────────────────┐  ┌────────────────────────┐  ┌────────────────────────┐
│  🗺️ Explore Map        │  │  🔍 Find Your Area     │  │  📊 Compare Areas      │
│  Switch to Free        │  │  Go back and enter     │  │  See how different     │
│  Explore mode          │  │  your postcode         │  │  regions stack up      │
└────────────────────────┘  └────────────────────────┘  └────────────────────────┘
```

### Camera Position
- **With area:** Zoomed out to show broader context (zoom - 2)
- **Without area:** UK overview

### Map Settings
- **Opacity:** 0.9 (bright, inviting)
- **Heatmap:** Disabled
- **Interactive:** Full map control restored

---

## 🎨 Design Themes Reference

### Theme Colors
- **Calm** (Sections 0, 1): Blue-grey tones, professional
- **Green** (Sections 2, 6): Health/action, vibrant green
- **Warm** (Section 3): Orange/amber, housing comfort
- **Energy** (Section 4): Electric blue, modern
- **Purple** (Section 5): Data/analytics, sophisticated

### Layout Types
- **Single:** Full-width content, centered
- **Scrolly:** Two-column (30% text sticky, 70% visualization scrollable)

### Map Opacity Guide
- **0.9** - Very visible (landing, action)
- **0.85** - Clear (scorecard)
- **0.8** - Balanced (housing)
- **0.75** - Text-focused (health)
- **0.7** - Text-heavy (intro, transport)

---

## 📈 Visualization Types Used

### Timeseries Charts
- **Sections:** 1 (Intro), 4 (Transport)
- **Purpose:** Show changes over 25 years (2025-2050)
- **Features:** Multiple category lines, area shading, zero-crossing indicators

### Comparison Charts
- **Sections:** 2 (Health - with area)
- **Purpose:** Area vs national average
- **Features:** Side-by-side bars, percentage differences

### Stacked Bar Charts
- **Sections:** 2 (Health - without area), 3 (Housing)
- **Purpose:** Category breakdowns
- **Features:** Color-coded categories, value labels

### Sparkline Grid
- **Sections:** 5 (Scorecard - with area)
- **Purpose:** Complete overview of all 11 categories
- **Features:** Micro-charts, trend indicators, positive/negative styling

### Horizontal Bar Chart
- **Sections:** 5 (Scorecard - without area)
- **Purpose:** Rankings and comparisons
- **Features:** Sorted by value, clickable to select area

---

## 🔄 Dynamic Content Patterns

### Area Type Handling

```javascript
// Small Area
if (area.type === 'small_area') {
  // Show: Name, Local Authority, Nation
  // Zoom: 12
  // Detail level: Highest
}

// Local Authority  
if (area.type === 'local_authority') {
  // Show: Name, Nation
  // Zoom: 9
  // Detail level: Regional
}

// Nation
if (area.type === 'nation') {
  // Show: Name only
  // Zoom: 5.5
  // Detail level: National
}
```

### Urban/Rural Customization

```javascript
// Rural areas
if (area.urbanRural === 'Rural') {
  // Messaging: Housing stock, infrastructure challenges
  // Context: Older buildings, lower density
}

// Urban areas
if (area.urbanRural === 'Urban') {
  // Messaging: Congestion, air quality, economies of scale
  // Context: Higher density, public transport focus
}
```

---

## 🎯 Key Messages by Section

1. **Hero:** "Show your council exactly how much your community gains"
2. **Intro:** "Not 'should we act?' but 'how much do we stand to gain?'"
3. **Health:** "Health co-benefits represent over 40% of total value"
4. **Housing:** "Some areas have 3x more to gain — targeted retrofit works"
5. **Transport:** "Electrification alone isn't enough — need walkable design"
6. **Scorecard:** "Each area has a unique profile — data reveals impact"
7. **Action:** "Use this data. Make the case. Your council needs to hear from you."

---

## 📱 Interactive Features

### Throughout Story
- ✅ Area search (text input with autocomplete)
- ✅ "Surprise Me!" random area selection
- ✅ Map-based area picking
- ✅ Reset/explore again functionality
- ✅ Layer toggle (nation/LA/small area)

### Section-Specific
- ✅ Heatmap visualization (sections 1-5)
- ✅ Camera animations synced to content
- ✅ Tooltip details on visualizations
- ✅ Click-through to download tools (section 6)

### Mode Switching
- ✅ Story Mode (default, guided narrative)
- ✅ Free Mode (full map exploration)
- ✅ Pick Map Mode (area selection interface)

---

## 💡 Content Strategy

### Tone
- **Empowering:** "You have the data to make the case"
- **Honest:** Shows trade-offs (transport rebound effect)
- **Action-oriented:** Every section builds toward advocacy
- **Data-driven:** Numbers make it undeniable

### Accessibility
- **Geographic context:** Labels like "Westminster (London city center)"
- **Plain language:** Avoids jargon, explains technical terms
- **Progressive disclosure:** Complexity builds gradually
- **Multiple entry points:** Works with or without area selection

### Call-to-Action Journey
1. **Attract:** Emotional hook about community benefits
2. **Inform:** Show comprehensive data and evidence
3. **Convince:** Address concerns with honest trade-offs
4. **Empower:** Provide specific tools and next steps
5. **Mobilize:** "Your council needs to hear from you"

---

## 📊 Data Flow

```
User Input (Postcode/Area) 
    ↓
Area Lookup Service
    ↓
Selected Area Object {id, name, type, center, localAuthority, nation, urbanRural}
    ↓
Dynamic Content Resolution
    ↓
API Calls (area-specific endpoints)
    ↓
Visualization Rendering
    ↓
Camera Position Animation
    ↓
Heatmap Update
```

---

## 🚀 Future Enhancements

### Potential Additions
- **Section 7:** International comparisons (UK vs EU)
- **Section 8:** Timeline controls (adjust end year)
- **Expanded toolkit:** Petition templates, council meeting prep
- **Social sharing:** Pre-generated social media cards with area stats
- **PDF reports:** Auto-generated area-specific reports

### Data Expansions
- Real-time council commitments tracking
- Community action success stories
- Before/after case studies from early adopter areas

---

**End of Narrative Documentation**

*This story transforms 46,426 data points into a compelling case for climate action — one postcode at a time.*
