# UK Net-Zero Navigator - Execution Plan
**Project:** ECCI Climate Action Toolkit for Community Advocates  
**Title:** UK Net-Zero Navigator: Explore Local Benefits, Challenge Your Council  
**Version:** 3.0 - Activist Empowerment Edition  
**Date:** December 23, 2025  
**Languages:** English (EN) + Indonesian (ID)

---

## 🎯 **COMPETITION CONTEXT**

**Challenge:** "Communicate the co-benefits of climate action to a specific audience"  
**Our Audience:** Community organizers, climate activists, grassroots groups  
**The Problem They Face:** Councils dismiss climate action as "too expensive" — activists lack LOCAL data to counter this  
**Our Solution:** Arm them with undeniable evidence about THEIR postcode, ready for council meetings  

**Judging Criteria Alignment:**
- ✅ **Clarity & Communication:** Clear story = "Your council ignores £100B in local benefits"
- ✅ **Creativity & Design:** Dual-mode (Story + Free Explore), 3D map, interactive toolkit
- ✅ **Data Analysis & Accuracy:** 46,426 UK areas, multi-level aggregation, transparent trade-offs

---

## � **CONTEXT FOR NON-UK AUDIENCES**

> **🚨 CRITICAL FOR IMPLEMENTATION:**  
> Many users don't know UK geography. **EVERY location name must include a context label.**  
> Never show "Westminster" alone — always "Westminster (London city center)".  
> This applies to ALL text, tooltips, dropdowns, and map labels.

**The Challenge:** This story uses UK geography as examples, but users may have zero knowledge of UK locations.

### **Key UK Geographic Terms**

**Nation Level (4 regions):**
- England (largest, most populous)
- Scotland (north)
- Wales (west)
- Northern Ireland

**Local Authorities (374 areas):**
- Think of these as "cities" or "counties"
- Range from dense urban centers to sparse rural regions

**Example Areas - Always Label with Context:**

| Area | Label to Display | Why It's Used |
|------|------------------|---------------|
| Westminster | "Westminster (London city center)" | Urban, dense, wealthy |
| Cornwall | "Cornwall (rural southwest coast)" | Sparse, poor, remote |
| Manchester | "Manchester (northern industrial city)" | Mid-size urban |
| Cambridge | "Cambridge (university town)" | Small, walkable |
| Birmingham | "Birmingham (2nd largest city)" | Large urban |

### **Universal Framing Strategy**

**Instead of:** "Westminster gains £54M"
**Use:** "Dense urban centers like Westminster (London city center) gain £54M"

**Instead of:** "Cornwall ranks low"
**Use:** "Sparse rural areas like Cornwall (southwest coast) rank lower"

**Pattern:** `[Area Name] ([Urban/Rural] [Geographic Context])`

### **UI Implementation Rules**

**1. Dropdown Options:**
```
Bad:  Westminster
Good: Westminster (London city center)
```

**2. Map Tooltips:**
```
Bad:  Manchester: £26.3M
Good: Manchester (northern industrial city): £26.3M
```

**3. Comparison Results:**
```
Bad:  Westminster vs Cornwall
Good: Westminster (dense urban) vs Cornwall (sparse rural)
```

**4. Search Autocomplete:**
```
When user types "west":
- Westminster (London city center)
- West Yorkshire (northern county)  
- Weston-super-Mare (southwest coastal town)
```

**5. Leaderboard Table:**
```
| Rank | Area | Context | Benefit |
|------|------|---------|---------|
| 1 | Westminster | London city center | £54M |
| 2 | Camden | North London | £48M |
```

### **Geographic Orientation Aid**

**Add a persistent mini-map legend (optional but helpful):**

```
┌─────────────────────────────┐
│  UK Regions Quick Guide:    │
├─────────────────────────────┤
│  🔵 London & Southeast      │
│     (dense, urban, wealthy) │
│  🟢 Northern cities         │
│     (industrial, mid-size)  │
│  🟡 Rural regions           │
│     (sparse, agricultural)  │
│  🟣 Scotland/Wales          │
│     (mountains, remote)     │
└─────────────────────────────┘
```

**Display this:**
- Top-right corner of 3D map (collapsible)
- First-time users see it expanded
- Can be toggled with "?" info icon

### **Sample Data Structure (For Implementation)**

```javascript
// areas-context.json
{
  "areas": [
    {
      "code": "E09000033",
      "name": "Westminster",
      "context": "London city center",
      "type": "dense urban",
      "region": "London & Southeast",
      "population": 255324,
      "displayName": "Westminster (London city center)"
    },
    {
      "code": "E06000052",
      "name": "Cornwall",
      "context": "Southwest coastal region",
      "type": "sparse rural",
      "region": "Southwest England",
      "population": 568210,
      "displayName": "Cornwall (Southwest coast)"
    },
    {
      "code": "E08000003",
      "name": "Manchester",
      "context": "Northern industrial city",
      "type": "urban",
      "region": "Northwest England",
      "population": 547627,
      "displayName": "Manchester (northern industrial city)"
    }
    // ... all 374 LAs
  ]
}
```

**Usage:**
```javascript
// When rendering dropdown
<option value={area.code}>{area.displayName}</option>

// When showing map tooltip
showTooltip(`${area.displayName}: £${benefit}M`);

// When displaying comparison
`${area1.displayName} vs ${area2.displayName}`
```

---

## �🎯 **PROJECT GOAL**
Transform generic narrative into tech-forward, interactive experience that showcases:
1. 3D map capabilities (nation → LA → level 3 zoom)
2. Real-time data filtering and comparison
3. Personalized area search and analysis
4. 46,426 area dataset depth

---

## 📐 **OVERALL LAYOUT STRUCTURE**

### **Fixed Elements**
- **Top Navigation Bar**
  - Logo/Title (left)
  - Language Toggle: EN ⇄ ID (right)
  - Progress indicator (thin line showing scroll progress)

### **Main Content Structure**
```
┌─────────────────────────────────────┐
│  HERO (Full viewport)               │
├─────────────────────────────────────┤
│  CHAPTER 1 (Split: 50% viz | 50% map) │
├─────────────────────────────────────┤
│  CHAPTER 2 (Split: comparison tool)│
├─────────────────────────────────────┤
│  CHAPTER 3 (Split: toggle + map)   │
├─────────────────────────────────────┤
│  CHAPTER 4 (Split: table + map)    │
├─────────────────────────────────────┤
│  CHAPTER 5 (Split: calculator)     │
├─────────────────────────────────────┤
│  OUTRO (Full viewport)              │
└─────────────────────────────────────┘
```

---

## 🎬 **HERO SECTION**

### **Layout**
```
┌──────────────────────────────────────────┐
│         [Background: 3D map at low       │
│          altitude, slowly rotating]      │
│                                          │
│              MAIN TITLE                  │
│              Subtitle                    │
│                                          │
│     ┌─────────────────────────────┐    │
│     │  Search Box + Explore BTN    │    │
│     └─────────────────────────────┘    │
│                                          │
│   46,426 UK areas · Nation → LA → Hood  │
│                                          │
│              [Scroll CTA ↓]             │
└──────────────────────────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
Find Your Postcode
The Net-Zero Benefits Calculator They Didn't Show You
```

**Subtitle:**
```
From national policy to your neighborhood's numbers—
explore how Net-Zero affects every UK community differently.
```

**Search Box:**
- Placeholder: `Search by postcode or city name (e.g., SW1A 1AA, Manchester)`
- Button: `🔍 Explore`
- Helper text below: `Not in UK? Try: London, Manchester, Edinburgh`

**Meta Text:**
```
46,426 UK areas analyzed · Nation → Local Authority → Neighborhood
```

**Scroll CTA:**
```
Scroll to discover ↓
```

### **Content - Indonesian (ID)**

**Title:**
```
Temukan Kode Pos Anda
Kalkulator Manfaat Net-Zero yang Tidak Mereka Tunjukkan
```

**Subtitle:**
```
Dari kebijakan nasional hingga angka di lingkungan Anda—
jelajahi bagaimana Net-Zero mempengaruhi setiap komunitas UK secara berbeda.
```

**Search Box:**
- Placeholder: `Cari berdasarkan kode pos atau nama kota (contoh: SW1A 1AA, Manchester)`
- Button: `🔍 Jelajahi`
- Helper text di bawah: `Tidak di UK? Coba: London, Manchester, Edinburgh`

**Meta Text:**
```
46.426 area UK dianalisis · Nation → Local Authority → Lingkungan
```

**Scroll CTA:**
```
Gulir untuk menemukan ↓
```

### **Interaction Spec**
1. User types area name or postcode
2. On Enter/Click → 3D map zooms from current position to searched area (3-second animation)
3. Area highlights with pulsing glow
4. Auto-scroll to Chapter 1

---

## 📊 **CHAPTER 1: THE BIG PICTURE**

### **Layout**
```
┌─────────────────────┬──────────────────────┐
│   LEFT (50%)        │   RIGHT (50%)        │
│                     │                      │
│   Title + Text      │   3D Map             │
│   ─────────────     │   (Nation level,     │
│   Plotly Chart      │    color by total    │
│   (Time series of   │    co-benefit)       │
│    national totals) │                      │
│                     │   Hoverable areas    │
└─────────────────────┴──────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
The £100 Billion Nobody Talks About
```

**Narrative:**
```
Net-Zero policies will cost the UK economy trillions. But hidden in the 
transition are £99.7 billion in co-benefits across 46,426 communities.

Cleaner air. Warmer homes. Healthier bodies. Quieter streets.

These aren't projections—they're measurable gains from 2025 to 2050.

👈 The chart shows national averages.
👉 The map shows every community's reality—from London's city center to Scotland's 
   remote highlands, from industrial Birmingham to coastal Cornwall.

Hover over a metric to filter the map by that benefit type.
```

**Chart Title:**
```
National Co-Benefits Over Time (£ Billion)
```

**Chart Legend:**
- Air Quality
- Physical Activity
- Warm Homes
- Noise Reduction

**Map Callout:**
```
💡 Each dot = one small area. Color intensity = total benefit per capita.
```

### **Content - Indonesian (ID)**

**Title:**
```
£100 Miliar yang Tidak Ada yang Bicarakan
```

**Narrative:**
```
Kebijakan Net-Zero akan menelan biaya triliunan bagi ekonomi UK. Tapi 
tersembunyi dalam transisi ini adalah £99,7 miliar manfaat bersama di 46.426 komunitas.

Udara lebih bersih. Rumah lebih hangat. Tubuh lebih sehat. Jalan lebih tenang.

Ini bukan proyeksi—ini keuntungan terukur dari 2025 hingga 2050.

👈 Grafik menunjukkan rata-rata nasional.
👉 Peta menunjukkan realitas setiap komunitas.

Arahkan kursor ke metrik untuk memfilter peta berdasarkan jenis manfaat tersebut.
```

**Chart Title:**
```
Manfaat Bersama Nasional dari Waktu ke Waktu (£ Miliar)
```

**Chart Legend:**
- Kualitas Udara
- Aktivitas Fisik
- Rumah Hangat
- Pengurangan Kebisingan

**Map Callout:**
```
💡 Setiap titik = satu area kecil. Intensitas warna = total manfaat per kapita.
```

### **Interaction Spec**
1. Hover over chart legend item → map filters to show only that metric
2. Click area on map → show tooltip with specific numbers
3. Scroll progress (0-100%) controls time slider on chart (2025→2050)

---

## 🏠 **CHAPTER 2: WARM HOMES**

### **Layout**
```
┌─────────────────────────────────────────┐
│              Title + Text               │
├──────────────┬──────────────────────────┤
│   LEFT       │   RIGHT                  │
│   Compare:   │   3D Map                 │
│   [Select 1] │   (Shows both selected   │
│      vs      │    LAs highlighted in    │
│   [Select 2] │    different colors)     │
│              │                          │
│   Comparison │   Click map to select    │
│   Viz        │   new LA                 │
│   (Bars +    │                          │
│    spider)   │                          │
└──────────────┴──────────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
Why Some Homes Win 10x More Than Others
```

**Narrative:**
```
Insulation. Heat pumps. Better ventilation. These upgrades don't benefit 
all homes equally.

Dense urban areas like Westminster (London's city center) gain £3.2M per household.
Sparse rural areas like Cornwall (southwest coastal region)? £0.3M.

Why the gap? Urban areas have:
• Older, leakier buildings (more room for improvement)
• Higher baseline pollution (more to reduce)
• More people per square mile (benefits multiply)

👇 Compare any two areas to see how geography shapes outcomes.
```

**Selector Labels:**
```
Compare:
[Dropdown 1] vs [Dropdown 2]
```

**Default Comparison:**
- LA 1: Westminster
- LA 2: Cornwall

**Comparison Metrics:**
- Excess Cold Reduction
- Damp Housing Improvement
- Excess Heat Mitigation
- **Total Housing Benefit**

**Map Instruction:**
```
💡 Click any area on the map to select it for comparison.
```

### **Content - Indonesian (ID)**

**Title:**
```
Mengapa Beberapa Rumah Menang 10x Lebih Banyak
```

**Narrative:**
```
Isolasi. Pompa panas. Ventilasi lebih baik. Peningkatan ini tidak menguntungkan 
semua rumah secara merata.

Area perkotaan padat seperti Westminster (pusat kota London) mendapat £3,2 juta per rumah tangga.
Area pedesaan jarang seperti Cornwall (wilayah pesisir barat daya)? £0,3 juta.

Mengapa kesenjangan? Area perkotaan memiliki:
• Bangunan yang lebih tua dan bocor (lebih banyak ruang untuk perbaikan)
• Polusi dasar yang lebih tinggi (lebih banyak yang harus dikurangi)  
• Lebih banyak orang per mil persegi (manfaat berlipat ganda)

👇 Bandingkan dua area mana pun untuk melihat bagaimana geografi membentuk hasil.
```

**Selector Labels:**
```
Bandingkan:
[Dropdown 1] vs [Dropdown 2]
```

**Default Comparison:**
- LA 1: Westminster (pusat kota London - perkotaan padat)
- LA 2: Cornwall (pantai barat daya - pedesaan jarang)

**Comparison Metrics:**
- Pengurangan Dingin Berlebihan
- Peningkatan Perumahan Lembab
- Mitigasi Panas Berlebihan
- **Total Manfaat Perumahan**

**Map Instruction:**
```
💡 Klik area mana pun di peta untuk memilihnya untuk perbandingan.
```

### **Interaction Spec**
1. Dropdowns populate from all 374 LAs (sorted alphabetically)
2. Selecting new LA → map zooms to show both areas + updates viz
3. Clicking map area → replaces LA 2 in comparison
4. Comparison shows:
   - Side-by-side bars (3 housing metrics)
   - Spider chart overlay
   - % difference callout

---

## 🚶 **CHAPTER 3: CLEAN & ACTIVE STREETS**

### **Layout**
```
┌─────────────────────────────────────────┐
│         Title + Text                    │
├─────────────────────────────────────────┤
│   [Toggle: 🚶 Physical Activity |      │
│            🌬️ Air Quality |            │
│            📊 Combined]                 │
├──────────────┬──────────────────────────┤
│   LEFT       │   RIGHT                  │
│   Time Series│   3D Map                 │
│   Chart      │   (Filtered by selected  │
│   (Selected  │    metric, animated      │
│    metric)   │    color transition)     │
└──────────────┴──────────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
The Double Win: Cleaner Air, Healthier Bodies
```

**Narrative:**
```
Reduce car trips → air pollution drops → people walk more → health improves.

It's a virtuous cycle. But it doesn't happen everywhere at once.

Dense cities (London, Birmingham) see air quality gains immediately—fewer cars means 
cleaner air for millions.

Smaller walkable towns (Cambridge, Oxford) excel in active travel—people actually 
switch from cars to bikes when distances are short.

🎮 Toggle between metrics to see which areas lead in each category.
```

**Toggle Buttons:**
- `🚶 Physical Activity`
- `🌬️ Air Quality`
- `📊 Combined`

**Chart Title (Dynamic):**
```
{Selected Metric} Benefits Over Time (£ Million)
```

**Interactive Prompt:**
```
💡 Notice how London dominates air quality, but smaller towns shine in active travel.
```

### **Content - Indonesian (ID)**

**Title:**
```
Kemenangan Ganda: Udara Lebih Bersih, Tubuh Lebih Sehat
```

**Narrative:**
```
Kurangi perjalanan mobil → polusi udara turun → orang lebih banyak berjalan → kesehatan meningkat.

Ini adalah siklus kebajikan. Tapi tidak terjadi di mana-mana secara bersamaan.

Pusat kota melihat peningkatan kualitas udara segera. Kota kecil unggul dalam 
manfaat perjalanan aktif.

🎮 Beralih antar metrik untuk melihat lingkungan mana yang memimpin di setiap kategori.
```

**Toggle Buttons:**
- `🚶 Aktivitas Fisik`
- `🌬️ Kualitas Udara`
- `📊 Gabungan`

**Chart Title (Dynamic):**
```
Manfaat {Metrik Terpilih} dari Waktu ke Waktu (£ Juta)
```

**Interactive Prompt:**
```
💡 Perhatikan bagaimana London mendominasi kualitas udara, tetapi kota kecil bersinar dalam perjalanan aktif.
```

### **Interaction Spec**
1. Clicking toggle button → chart updates data + map recolors (1-second transition)
2. Map color scale:
   - Physical Activity: Green gradient
   - Air Quality: Blue gradient
   - Combined: Purple gradient
3. Hovering map area → tooltip shows specific values for selected metric

---

## 🔇 **CHAPTER 4: QUIET CITIES**

### **Layout**
```
┌─────────────────────────────────────────┐
│         Title + Text                    │
├──────────────┬──────────────────────────┤
│   LEFT (40%) │   RIGHT (60%)            │
│              │                          │
│   Search:    │   3D Map                 │
│   [Input]    │   (Shows ranked LAs)     │
│              │                          │
│   Leaderboard│   Click row → zoom       │
│   Table      │                          │
│   (Top 20)   │   Your area: Rank #XX    │
│              │   (if searched)          │
└──────────────┴──────────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
The Quietest Transformation
```

**Narrative:**
```
Electric vehicles. Less traffic. Modal shift to walking and cycling.

The result? Noise pollution drops by 30-60% in urban centers.

🏆 These are the local authorities seeing the biggest gains.

Type your area to see where you rank.
```

**Search Box:**
- Placeholder: `Find your LA in the rankings...`

**Table Headers:**
- Rank
- Local Authority
- Benefit/Household
- Explore →

**Map Callout:**
```
💡 Click any row to see that area on the map. 
Even if you're not in the top 20, search to see your score.

Map Legend:
🔴 Major cities (London, Birmingham, Manchester)
🟡 Mid-size urban areas
🟢 Small towns and rural regions
```

### **Content - Indonesian (ID)**

**Title:**
```
Transformasi Paling Sunyi
```

**Narrative:**
```
Kendaraan listrik. Lalu lintas lebih sedikit. Pergeseran modal ke jalan kaki dan bersepeda.

Hasilnya? Polusi suara turun 30-60% di pusat kota.

🏆 Ini adalah otoritas lokal yang melihat keuntungan terbesar.

Ketik area Anda untuk melihat peringkat Anda.
```

**Search Box:**
- Placeholder: `Temukan LA Anda di peringkat...`

**Table Headers:**
- Peringkat
- Otoritas Lokal
- Manfaat/Rumah Tangga
- Jelajahi →

**Map Callout:**
```
💡 Klik baris mana pun untuk melihat area tersebut di peta. 
Bahkan jika Anda tidak di 20 besar, cari untuk melihat skor Anda.
```

### **Interaction Spec**
1. Table displays top 20 LAs by noise reduction benefit
2. Searching → highlights row if found + shows percentile rank
3. Clicking table row → map zooms to LA + pulses 3x
4. If searched area not in top 20 → show: "Your area ranks #143 (Top 38%)"

---

## ⚖️ **CHAPTER 5: THE TRADE-OFFS**

### **Layout**
```
┌─────────────────────────────────────────┐
│         Title + Text                    │
├──────────────┬──────────────────────────┤
│   LEFT       │   RIGHT                  │
│              │                          │
│   Calculator │   3D Map                 │
│   [Search]   │   (Spotlight on searched │
│   [Calculate]│    area)                 │
│              │                          │
│   Results:   │   UK Average comparison  │
│   ✅ Benefits│                          │
│   ⚠️ Costs   │                          │
│   Net: £XXM  │                          │
└──────────────┴──────────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
Yes, Your Commute Gets Longer. Here's Why It's Still Worth It.
```

**Narrative:**
```
Net-Zero means trade-offs. Rural areas (sparse regions far from cities) face longer 
travel times. Some urban roads get more congested before they get better.

But for 70% of UK areas, the health and air quality benefits dwarf the hassle.

The pattern is clear:
• Dense cities (London, Manchester): Big benefits, minor trade-offs
• Small towns (Cambridge, Bath): Moderate benefits, low trade-offs  
• Remote rural (Scottish highlands, Welsh valleys): Small benefits, higher hassle

🧮 Enter any area below to see its personalized balance sheet.
```

**Calculator Header:**
```
Your Area's Balance Sheet
```

**Search Box:**
- Placeholder: `Enter postcode or city name`
- Button: `Calculate`
- Helper text: `Try: London, Manchester, SW1A 1AA, or your UK postcode`

**Results Panel (Dynamic):**

**Benefits Section:**
```
✅ Benefits in Your Area:
• Air quality: £{X}M
• Physical activity: £{X}M
• Warm homes: £{X}M
• Noise reduction: £{X}M
Total: £{X}M
```

**Trade-offs Section:**
```
⚠️ Trade-offs in Your Area:
• Hassle costs: -£{X}M
• Congestion: -£{X}M
• Road safety: -£{X}M
Total: -£{X}M
```

**Verdict:**
```
Net Benefit: £{X}M

In your area, benefits outweigh trade-offs by {ratio}:1.
That's better than {percentile}% of UK areas.
```

**Comparison Note:**
```
🇬🇧 UK Average Net Benefit: £{X}M
Your area is {above/below} average by {X}%.
```

### **Content - Indonesian (ID)**

**Title:**
```
Ya, Perjalanan Anda Lebih Lama. Inilah Mengapa Ini Masih Layak.
```

**Narrative:**
```
Net-Zero berarti trade-off. Area pedesaan menghadapi waktu perjalanan lebih lama. 
Beberapa jalan menjadi lebih macet sebelum membaik.

Tapi untuk 70% area UK, manfaat kesehatan dan kualitas udara mengalahkan kerumitan.

🧮 Masukkan area Anda di bawah untuk melihat neraca keuangan personal Anda.
```

**Calculator Header:**
```
Neraca Area Anda
```

**Search Box:**
- Placeholder: `Masukkan kode pos atau nama LA`
- Button: `Hitung`

**Results Panel (Dynamic):**

**Benefits Section:**
```
✅ Manfaat di Area Anda:
• Kualitas udara: £{X} juta
• Aktivitas fisik: £{X} juta
• Rumah hangat: £{X} juta
• Pengurangan kebisingan: £{X} juta
Total: £{X} juta
```

**Trade-offs Section:**
```
⚠️ Trade-off di Area Anda:
• Biaya kerumitan: -£{X} juta
• Kemacetan: -£{X} juta
• Keamanan jalan: -£{X} juta
Total: -£{X} juta
```

**Verdict:**
```
Manfaat Bersih: £{X} juta

Di area Anda, manfaat melebihi trade-off sebesar {ratio}:1.
Itu lebih baik dari {percentile}% area UK.
```

**Comparison Note:**
```
🇬🇧 Rata-rata Manfaat Bersih UK: £{X} juta
Area Anda {di atas/di bawah} rata-rata sebesar {X}%.
```

### **Interaction Spec**
1. User enters area → pulls all metrics from dataset
2. Calculate button → animates results panel (slide in from left)
3. Map spotlight: area glows + surrounding areas dim
4. Ratio calculation: `benefits / abs(costs)`
5. Percentile: compare to all 46,426 areas

---

## 🎬 **OUTRO**

### **Layout**
```
┌──────────────────────────────────────────┐
│   [3D map in background, zoomed to UK]   │
│                                          │
│         Closing Statement                │
│                                          │
│   ┌────────────────────────────────┐    │
│   │  🔍 Search Another Area        │    │
│   ├────────────────────────────────┤    │
│   │  📊 Download Full Dataset      │    │
│   ├────────────────────────────────┤    │
│   │  🧪 Methodology                │    │
│   └────────────────────────────────┘    │
│                                          │
│   Stats:                                 │
│   46,426 | £99.7B | 67.6M               │
│   Areas  | Benefits| People             │
└──────────────────────────────────────────┘
```

### **Content - English (EN)**

**Statement:**
```
Net-Zero isn't just policy—it's personal.

Every postcode. Every street. Every household.

This is the future, mapped down to your neighborhood.

What will you do with this information?
```

**CTA Buttons:**
- `🔍 Search Another Area`
- `📊 Download Full Dataset`
- `🧪 How We Calculated This`

**Stats Labels:**
```
46,426          £99.7B          67.6M
Areas Analyzed | Total Benefits | People Affected
```

### **Content - Indonesian (ID)**

**Statement:**
```
Net-Zero bukan hanya kebijakan—ini personal.

Setiap kode pos. Setiap jalan. Setiap rumah tangga.

Ini adalah masa depan, dipetakan hingga ke lingkungan Anda.

Apa yang akan Anda lakukan dengan informasi ini?
```

**CTA Buttons:**
- `🔍 Cari Area Lain`
- `📊 Unduh Dataset Lengkap`
- `🧪 Bagaimana Kami Menghitungnya`

**Stats Labels:**
```
46.426          £99,7 Miliar    67,6 Juta
Area Dianalisis | Total Manfaat | Orang Terpengaruh
```

---

## 🌐 **I18N IMPLEMENTATION NOTES**

### **Translation Keys Structure**
```json
{
  "nav": {
    "langToggle": "ID / EN"
  },
  "hero": {
    "title": "...",
    "subtitle": "...",
    "searchPlaceholder": "...",
    "searchButton": "...",
    "meta": "...",
    "scrollCta": "..."
  },
  "chapter1": {
    "title": "...",
    "narrative": "...",
    "chartTitle": "...",
    "legend": [...],
    "mapCallout": "..."
  },
  // ... repeat for chapters 2-5
  "outro": {
    "statement": "...",
    "cta1": "...",
    "cta2": "...",
    "cta3": "...",
    "statsLabels": [...]
  }
}
```

### **Dynamic Content Rules**
- All static text → translation keys
- Numbers (£, M, %) → keep numeric format
- Area names → keep original (Westminster, Cornwall, etc.)
- **Geographic context labels → ALWAYS include (non-negotiable)**
- Metric names → translate in legend/labels
- UI elements (buttons, placeholders) → translate

---

## ✅ **CHECKLIST FOR IMPLEMENTATION**

### **Phase 0: Geographic Context (DO THIS FIRST!)**
- [ ] Create area lookup table with context labels (all 374 LAs)
- [ ] Format: `{ name: "Westminster", context: "London city center", type: "urban" }`
- [ ] Test context labels appear in ALL dropdowns
- [ ] Add mini-map legend UI component (collapsible)
- [ ] Verify tooltips include context on hover

### **Phase 1: Hero**
- [ ] Replace title with chosen option (Option 4)
- [ ] Add search box + explore button
- [ ] Connect search to 3D map zoom function
- [ ] Add meta text below search
- [ ] Implement scroll CTA

### **Phase 2: Chapter 1**
- [ ] Split layout 50/50 (chart | map)
- [ ] Replace narrative text
- [ ] Connect chart hover → map filter
- [ ] Add map tooltip on area click

### **Phase 3: Chapter 2**
- [ ] Build LA comparison dropdowns
- [ ] Create comparison viz (bars + spider)
- [ ] Connect map click → update comparison
- [ ] Add "vs" indicator

### **Phase 4: Chapter 3**
- [ ] Add metric toggle buttons
- [ ] Connect toggle → chart + map update
- [ ] Implement animated color transition on map
- [ ] Add interactive prompt text

### **Phase 5: Chapter 4**
- [ ] Build leaderboard table (top 20)
- [ ] Add search box for LA lookup
- [ ] Connect row click → map zoom
- [ ] Show percentile rank for searched area

### **Phase 6: Chapter 5**
- [ ] Build personalized calculator UI
- [ ] Connect search → data lookup
- [ ] Calculate benefits/costs/net
- [ ] Display ratio + percentile
- [ ] Add UK average comparison

### **Phase 7: Outro**
- [ ] Add three CTA buttons
- [ ] Display stats counters
- [ ] Add closing statement

### **Phase 8: I18N**
- [ ] Extract all text to translation files
- [ ] Implement language toggle
- [ ] Test all sections in both languages
- [ ] Verify number formatting (£ vs. locale)

---

## 📋 **FINAL NOTES**

**Assumptions:**
- 3D map library already integrated and functional
- Data CSV files accessible and parseable
- Plotly.js charts can be swapped/updated
- Layout is responsive (mobile considerations TBD)

**Next Steps:**
1. Review this plan for completeness
2. **CREATE CONTEXT LABELS FIRST** (Phase 0)
3. Execute implementation with SOTA agent
4. Test with users unfamiliar with UK geography
3. Test interactions thoroughly
4. Deploy and gather feedback

**Priority Order:**
1. **Phase 0: Geographic context** (critical foundation - without this, international users are lost)
2. Hero (first impression critical)
3. Chapter 5 (personalized calculator = engagement driver)
4. Chapters 1-4 (progressive story)
5. I18N (polish)

---

**🌏 Remember:** If someone from Jakarta or Bandung can understand the story without Googling UK places, you've succeeded.

---

**End of Execution Plan** 🚀
