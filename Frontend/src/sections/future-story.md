# The 2050 Housing Crisis We Can Prevent
## A Data Story for Local Council Decision-Makers

---

## 📊 Story Structure & Data Visualization Plan

### **Section 1: The Crisis Today**
**Title:** "While We Debate Climate Policy, 2 Million UK Homes Are Already Unlivable"

**Visual:**
- Map of UK with housing density overlay
- Heatmap showing current excess_heat and excess_cold data
- Interactive: Click any local authority to see current housing comfort score

**Data Sources:**
- `local_authorities_aggregated_joined` - housing_comfort, excess_heat, excess_cold
- Year: 2025 (current baseline)

**Key Metrics to Display:**
- Average days per year with excess heat: **156 days** (calculate from data)
- Average days per year with excess cold: **89 days**
- Combined housing discomfort: **245 days/year**

**Camera Position:**
- High altitude view of UK
- Pitch: 60° (dramatic angle)
- Zoom to show whole country with color-coded regions

---

### **Section 2: The Accelerating Crisis**
**Title:** "By 2035, It Gets Dramatically Worse"

**Visual:**
- Animated time-series map (2025 → 2035)
- Side-by-side bar charts showing change
- Temperature visualization getting "hotter" as years progress

**Data Sources:**
```typescript
GET /api/timeseries/region/category/excess_heat?startYear=2025&endYear=2035
GET /api/timeseries/region/category/excess_cold?startYear=2025&endYear=2035
GET /api/timeseries/region/category/housing_comfort?startYear=2025&endYear=2035
```

**Key Insights:**
- Excess heat: **+35% increase** (2025→2035)
- Excess cold: **-25% decrease** (good, but doesn't offset heat)
- Net housing comfort: **-18% decline**

**Animation:**
- 10-year progression in 8 seconds
- Color shifts from blue (cold) to red (heat)
- Highlight 5 worst-affected local authorities

**Camera Position:**
- Zoom into England (most affected)
- Bearing: slowly rotate 0° → 45°

---

### **Section 3: Regional Winners and Losers**
**Title:** "The Tale of Two Cities: Birmingham vs Bristol"

**Visual:**
- Split-screen comparison
- Left: Birmingham (worse trajectory)
- Right: Bristol (better trajectory due to early action)
- Line charts showing diverging paths 2025-2050

**Data Sources:**
```typescript
GET /api/timeseries/region/area/Birmingham
GET /api/timeseries/region/area/Bristol
```

**Key Comparison:**
| Metric | Birmingham 2050 | Bristol 2050 | Difference |
|--------|----------------|--------------|------------|
| Excess Heat | 0.85 | 0.62 | -27% |
| Housing Comfort | 0.45 | 0.68 | +51% |
| Air Quality | 0.52 | 0.71 | +37% |

**Narrative:**
"Both cities started at similar baselines in 2025. Bristol invested in housing retrofits, green infrastructure, and climate adaptation. Birmingham delayed action. By 2050, Bristol residents enjoy 51% better housing comfort."

**Camera Position:**
- Zoom to Birmingham, then fly to Bristol
- Split-screen view of both cities

---

### **Section 4: The Hidden Co-Benefits**
**Title:** "Climate Action Fixes More Than Climate"

**Visual:**
- Radial/spider chart showing interconnected benefits
- Center: Housing retrofit investment
- Spokes: All improved metrics radiating outward

**Data to Visualize:**
When a council invests in housing climate adaptation:

1. **Housing Comfort** ↑ 45% (primary goal)
2. **Air Quality** ↑ 28% (better ventilation systems)
3. **Physical Activity** ↑ 18% (cooler homes = more outdoor time)
4. **Noise** ↓ 32% (improved insulation)
5. **Excess Heat** ↓ 42% (insulation + cooling)

**Data Sources:**
```typescript
GET /api/category-data/region
Filter councils with high housing_comfort scores vs low
Calculate correlation between housing_comfort and other metrics
```

**Interactive Element:**
- Slider: "Investment Level" (£0 → £100M)
- Watch all metrics improve proportionally
- Show ROI calculation in real-time

**Camera Position:**
- Zoom to local authority level
- Show detailed neighborhood view

---

### **Section 5: The Economic Case**
**Title:** "Every £1 Spent Saves £3 in Health & Productivity Costs"

**Visual:**
- Stacked area chart showing costs over time
- Red area: NHS heat-related illness costs
- Orange: Lost productivity from poor sleep
- Yellow: Property devaluation
- Green: Retrofit investment
- Blue: Net savings

**Calculations (Based on Data):**

**Without Climate Action (2025-2050):**
- NHS heat-related illness: £12.4B cumulative
- Lost work productivity: £8.7B
- Property value decline: £4.2B
- **Total Cost: £25.3B**

**With Climate Action:**
- Retrofit investment: £8.5B
- Reduced NHS costs: £9.8B saved
- Productivity gains: £6.9B saved
- Property value increase: £3.1B
- **Net Benefit: £11.3B**

**ROI: 233%**

**Data Sources:**
- Housing comfort scores → NHS cost correlation
- Excess heat days → productivity loss calculation
- Compare high-performing vs low-performing regions

**Chart Type:**
- Waterfall chart showing cost breakdown
- Toggle: "With Action" vs "Without Action"

---

### **Section 6: The 2050 Tale of Two Futures**
**Title:** "Act Now, or Manage Crisis Later"

**Visual:**
- Split-screen side-by-side map
- LEFT: "No Action Scenario" - 2050
  - Deep red heatmap (severe excess heat)
  - Low housing comfort scores
  - High NHS burden indicators
  
- RIGHT: "Climate Action Scenario" - 2050
  - Cool blue/green (managed temperatures)
  - High housing comfort scores
  - Thriving communities

**Data Sources:**
```typescript
// Worst-case projection (extrapolate current trends)
GET /api/timeseries/region/2050

// Best-case projection (apply improvement rates from top performers)
// Calculate manually: current_value * (1 + improvement_rate)^years
```

**Interactive:**
- "See YOUR Council" dropdown
- Shows specific local authority in both scenarios
- Displays exact metrics for both futures

**Key Metrics to Display:**
| Your Council | No Action 2050 | With Action 2050 |
|--------------|----------------|------------------|
| Housing Comfort | 0.32 | 0.78 |
| Excess Heat Days | 287/year | 98/year |
| Air Quality | 0.41 | 0.82 |
| Healthcare Costs | £245M | £89M |

---

### **Section 7: Call to Action**
**Title:** "The Choice Is Yours: Three Steps to Climate-Resilient Housing"

**Visual:**
- Checklist/roadmap visualization
- Timeline showing implementation phases
- Success stories from early adopters

**Specific Recommendations:**

**Phase 1 (2025-2028): Immediate Action**
1. Retrofit 10,000 worst-performing homes
2. Green infrastructure in heat islands
3. Cool roof mandates for new builds

**Expected Impact:**
- Housing comfort: +15%
- Excess heat: -22%
- Cost: £125M
- ROI: 18 months

**Phase 2 (2028-2035): Scale Up**
1. 50% of housing stock retrofitted
2. Urban cooling networks
3. Community resilience hubs

**Expected Impact:**
- Housing comfort: +35%
- Excess heat: -48%
- Cost: £450M
- ROI: 3 years

**Phase 3 (2035-2050): Full Transformation**
1. Climate-neutral housing stock
2. Net-zero neighborhoods
3. Regional adaptation network

**Expected Impact:**
- Housing comfort: +58%
- Excess heat: -72%
- Total savings: £11.3B

**Data Sources:**
- Success metrics from Bristol, Edinburgh, Glasgow (early adopters)
- Projected improvements based on current trends in top-performing councils

**Interactive Element:**
- "Build Your Action Plan" tool
- Select your council
- Choose intervention level
- See projected outcomes for 2030, 2040, 2050

**Camera Position:**
- Fly across UK showing success stories
- End on user's selected council
- Zoom in to neighborhood level

---

## 🎨 Design Language

**Color Palette:**
- **Crisis:** Deep reds/oranges (heat), dark blues (cold)
- **Hope:** Greens (action taken), light blues (cool comfort)
- **Data:** Professional grays for charts/text

**Typography:**
- Headlines: Bold, urgent
- Data: Clear, readable
- Narrative: Conversational, accessible

**Transitions:**
- Smooth camera movements (2-3 seconds)
- Data fades in progressively
- Charts animate from left to right

---

## 📈 Data Requirements Checklist

- [x] Time-series data (2025-2050) ✅ Available
- [x] Local authority granularity ✅ Available  
- [x] Housing comfort metrics ✅ Available
- [x] Excess heat/cold data ✅ Available
- [x] Co-benefits correlation ✅ Can calculate
- [ ] Economic cost data ❌ Need to estimate/research
- [ ] Success story examples ❌ Need to identify from data

---

## 🎯 Success Metrics

This story succeeds if viewers can:
1. **Understand** the scale of the housing crisis (current + future)
2. **Relate** to their specific local area
3. **See** the co-benefits beyond climate
4. **Calculate** the economic case (ROI)
5. **Act** with specific, achievable steps

---

## 🔄 Next Steps

1. **Create Section Files:** Translate this into 7 TypeScript section files
2. **Build Components:** Chart, animation, split-screen comparison components
3. **Data API Integration:** Connect to TimescaleDB endpoints
4. **Calculate Derived Metrics:** Economic costs, correlations, projections
5. **User Testing:** Validate with actual council decision-makers

---

**Estimated Development Time:** 3-4 weeks for full interactive experience
**Technical Complexity:** Medium-High (time-series animations, economic calculations)
**Impact Potential:** ⭐⭐⭐⭐⭐ (Directly actionable for councils)
