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

## 🎮 **DUAL-MODE STRUCTURE**

### **Mode 1: Story Mode (Default)**
**Purpose:** Guided narrative that builds the activist's case step-by-step  
**Flow:** Hero → Ch1 (Evidence) → Ch2 (Housing) → Ch3 (Health) → Ch4 (Rankings) → Ch5 (Trade-offs) → Outro (Action)  
**UX:** Linear scrollytelling with fixed comparisons and narrative pacing

### **Mode 2: Free Explore**
**Purpose:** Sandbox for deep-dive research and custom comparisons  
**Features:**
- Click any area on 3D map → full data popup
- Compare up to 5 areas simultaneously
- Toggle all 11 metrics independently
- Time slider (2025 → 2050 animation)
- Filter by area type (urban/suburban/rural)
- Export custom comparison tables
- Bookmark areas for quick access

**Toggle UI (Top-Right Corner):**
```
┌─────────────────────────────────────┐
│ [Story Mode] [Free Explore]  │
└─────────────────────────────────────┘
```

---

## 🌍 **CONTEXT FOR NON-UK AUDIENCES**

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

## 📐 **OVERALL LAYOUT STRUCTURE**

### **Fixed Elements**
- **Top Navigation Bar**
  - Logo/Title (left): "UK Net-Zero Navigator"
  - Mode Toggle (center): [📖 Story Mode] [🗺️ Free Explore]
  - Language Toggle (right): EN ⇄ ID
  - Progress indicator (thin line showing scroll progress in Story Mode)

### **Main Content Structure (Story Mode)**
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
│  OUTRO (Full viewport with CTAs)    │
└─────────────────────────────────────┘
```

### **Free Explore Mode Layout**
```
┌──────────────────────────────────────────┐
│  [Search] [Compare] [Metrics ▼] [Export]│
├────────────────────┬─────────────────────┤
│                    │                     │
│   3D Map           │   Data Panel        │
│   (75% width)      │   (25% width)       │
│                    │                     │
│   Click any area → │   • Selected area   │
│   See popup        │   • Quick stats     │
│                    │   • Add to compare  │
│   [Time Slider     │   • Download data   │
│    2025 ▶ 2050]    │                     │
│                    │   Comparison Queue: │
│                    │   [Area 1] [×]      │
│                    │   [Area 2] [×]      │
│                    │   [+ Add area]      │
└────────────────────┴─────────────────────┘
```

---

## 🎬 **HERO SECTION**

### **Layout**
```
┌──────────────────────────────────────────┐
│         [Background: 3D map at low       │
│          altitude, slowly rotating]      │
│                                          │
│       UK NET-ZERO NAVIGATOR              │
│       Explore Local Benefits,            │
│       Challenge Your Council             │
│                                          │
│     ┌─────────────────────────────┐    │
│     │  Search Box + Explore BTN    │    │
│     └─────────────────────────────┘    │
│                                          │
│   Or, let's explore it ourself!         │
│                                          │
│                                          │
│              [Scroll CTA ↓]             │
└──────────────────────────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
UK Net-Zero Navigator
Explore Local Benefits, Challenge Your Council
```

**Subtitle:**
```
Your council says climate action is too expensive.
Let's prove them wrong with data from YOUR community.

£99.7 billion in co-benefits. 46,426 UK areas analyzed.
Zero excuses left.
```

**Search Box:**
- Placeholder: `Enter your postcode or council name (e.g., Manchester, SW1A 1AA)`
- Button: `🔍 Start Exploring`
- Helper text: `Not sure? Try: London, Birmingham, Edinburgh, Glasgow`

**Meta Text:**
```
A toolkit for community organizers | Built on UK Co-Benefits Atlas data
```

**Scroll CTA:**
```
Scroll to build your case ↓
```

### **Content - Indonesian (ID)**

**Title:**
```
UK Net-Zero Navigator
Jelajahi Manfaat Lokal, Tantang Dewan Anda
```

**Subtitle:**
```
Dewan Anda bilang aksi iklim terlalu mahal.
Mari buktikan mereka salah dengan data dari komunitas ANDA.

£99,7 miliar dalam manfaat bersama. 46.426 area UK dianalisis.
Nol alasan tersisa.
```

**Search Box:**
- Placeholder: `Masukkan kode pos atau nama dewan (contoh: Manchester, SW1A 1AA)`
- Button: `🔍 Mulai Menjelajahi`
- Helper text: `Tidak yakin? Coba: London, Birmingham, Edinburgh, Glasgow`

**Meta Text:**
```
Toolkit untuk pengorganisir komunitas | Dibangun dengan data UK Co-Benefits Atlas
```

**Scroll CTA:**
```
Gulir untuk membangun argumen Anda ↓
```

### **Interaction Spec**
1. User types area name or postcode
2. On Enter/Click → 3D map zooms from current position to searched area (3-second animation)
3. Area highlights with pulsing glow
4. Info card appears: "[Area Name]: £XX.XM total benefits — Scroll to see breakdown"
5. Auto-scroll to Chapter 1 (or offer "Free Explore" button)

---

## 📊 **CHAPTER 1: BUILD YOUR EVIDENCE**

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
│   Key Insight Box   │                      │
└─────────────────────┴──────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
Step 1: The £100 Billion They're Not Counting
```

**Narrative:**
```
When councils debate climate budgets, they focus on costs: insulation programs, 
EV charging infrastructure, road changes.

What they DON'T count? The £99.7 billion in health, housing, and quality-of-life 
gains across 46,426 UK communities from 2025 to 2050.

This isn't about polar bears. It's about:
• Asthma rates dropping 40% (cleaner air)
• Energy bills cut by £1,800/year (warmer homes)
• Hospital admissions down 25% (active travel)
• Property values up 14% (quieter neighborhoods)

👈 The chart shows national aggregates.
👉 The map shows YOUR area's reality.

**Your first talking point:** "This isn't just climate policy. It's a £100B 
investment in OUR health and OUR wallets."
```

**Chart Title:**
```
National Co-Benefits Over Time (£ Billion NPV)
```

**Chart Legend:**
- Air Quality
- Physical Activity
- Warm Homes
- Noise Reduction
- [Other co-benefits]

**Key Insight Box:**
```
💡 ACTIVIST TIP:
Councils respond to money, not morals. Lead with the ROI.

"For every £1 spent on climate action, we gain £4 in health savings alone."

Hover over the chart to filter the map by benefit type. See where YOUR area ranks.
```

### **Content - Indonesian (ID)**

**Title:**
```
Langkah 1: £100 Miliar yang Tidak Mereka Hitung
```

**Narrative:**
```
Ketika dewan memperdebatkan anggaran iklim, mereka fokus pada biaya: program isolasi, 
infrastruktur pengisian EV, perubahan jalan.

Apa yang TIDAK mereka hitung? £99,7 miliar dalam kesehatan, perumahan, dan peningkatan 
kualitas hidup di 46.426 komunitas UK dari 2025 hingga 2050.

Ini bukan tentang beruang kutub. Ini tentang:
• Tingkat asma turun 40% (udara lebih bersih)
• Tagihan energi dipotong £1.800/tahun (rumah lebih hangat)
• Rawat inap rumah sakit turun 25% (perjalanan aktif)
• Nilai properti naik 14% (lingkungan lebih tenang)

👈 Grafik menunjukkan agregat nasional.
👉 Peta menunjukkan realitas area ANDA.

**Poin pembicaraan pertama Anda:** "Ini bukan hanya kebijakan iklim. Ini investasi 
£100 miliar dalam kesehatan KITA dan dompet KITA."
```

**Key Insight Box:**
```
💡 TIP AKTIVIS:
Dewan merespons uang, bukan moral. Pimpin dengan ROI.

"Untuk setiap £1 yang dihabiskan untuk aksi iklim, kami mendapat £4 dalam penghematan 
kesehatan saja."

Arahkan kursor ke grafik untuk memfilter peta berdasarkan jenis manfaat. Lihat di mana 
area ANDA berada.
```

### **Interaction Spec**
1. Hover over chart legend item → map filters to show only that metric
2. Click area on map → show tooltip with specific numbers
3. "Download this chart" button → PNG export for presentations
4. Scroll progress (0-100%) controls time slider on chart (2025→2050)

---

## 🏠 **CHAPTER 2: HOUSING INEQUALITY**

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
│              │                          │
│   Activist   │                          │
│   Tip Box    │                          │
└──────────────┴──────────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
Step 2: Housing — Why Some Areas Win 10x More
```

**Narrative:**
```
Not all homes benefit equally from insulation and retrofit programs.

Dense urban areas like Westminster (London city center) gain £3.2M per household.
Sparse rural areas like Cornwall (southwest coast)? £0.3M.

Why the gap?
• Older, leakier buildings in cities = more room for improvement
• Higher baseline pollution = bigger air quality gains
• More people per square mile = benefits multiply

Your council might say: "We can't afford retrofits."
Your response: "Look at [neighboring council]. They're investing, and their 
residents gain £XXM more. Why are we falling behind?"

👇 Compare your council to a neighbor. Use this to create pressure.
```

**Selector Labels:**
```
Compare your council:
[Dropdown 1: Your Council] vs [Dropdown 2: Neighboring Council]
```

**Default Comparison:**
- LA 1: Manchester (northern industrial city - urban)
- LA 2: Cheshire East (suburban/rural neighbor)

**Comparison Metrics:**
- Excess Cold Reduction
- Damp Housing Improvement
- Excess Heat Mitigation
- **Total Housing Benefit**

**Activist Tip Box:**
```
📢 COUNCIL MEETING SCRIPT:

"I live in [Your Area]. Our housing stock needs urgent retrofits.

The data shows we could save residents £[X]M in energy costs and health benefits 
by 2050. That's [Y] households with warmer homes and lower bills.

[Neighboring Council] has already started. Are we going to let them leave us behind?"

[Download this comparison as PDF]
```

### **Content - Indonesian (ID)**

**Title:**
```
Langkah 2: Perumahan — Mengapa Beberapa Area Menang 10x Lebih Banyak
```

**Narrative:**
```
Tidak semua rumah mendapat manfaat yang sama dari program isolasi dan retrofit.

Area perkotaan padat seperti Westminster (pusat kota London) mendapat £3,2 juta per rumah tangga.
Area pedesaan jarang seperti Cornwall (pantai barat daya)? £0,3 juta.

Mengapa kesenjangan?
• Bangunan yang lebih tua dan bocor di kota = lebih banyak ruang untuk perbaikan
• Polusi dasar yang lebih tinggi = peningkatan kualitas udara yang lebih besar
• Lebih banyak orang per mil persegi = manfaat berlipat ganda

Dewan Anda mungkin berkata: "Kami tidak mampu retrofit."
Respons Anda: "Lihat [dewan tetangga]. Mereka berinvestasi, dan penduduk mereka 
mendapat £XXM lebih banyak. Mengapa kita tertinggal?"

👇 Bandingkan dewan Anda dengan tetangga. Gunakan ini untuk menciptakan tekanan.
```

**Activist Tip Box:**
```
📢 SKRIP RAPAT DEWAN:

"Saya tinggal di [Area Anda]. Stok perumahan kami membutuhkan retrofit mendesak.

Data menunjukkan kami dapat menghemat £[X] juta untuk penduduk dalam biaya energi dan 
manfaat kesehatan hingga 2050. Itu [Y] rumah tangga dengan rumah lebih hangat dan tagihan lebih rendah.

[Dewan Tetangga] sudah mulai. Apakah kita akan membiarkan mereka meninggalkan kita?"

[Unduh perbandingan ini sebagai PDF]
```

### **Interaction Spec**
1. Dropdowns populate from all 374 LAs (sorted alphabetically, with context labels)
2. Selecting new LA → map zooms to show both areas + updates viz
3. Clicking map area → replaces LA 2 in comparison
4. "Download PDF Report" button → generates shareable document with:
   - Comparison chart
   - Key numbers
   - Suggested talking points
   - Councillor contact info (if available)

---

## 🚶 **CHAPTER 3: HEALTH BENEFITS**

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
│              │                          │
│   Top 5 List │   Click area → highlight │
│              │                          │
│   Activist   │                          │
│   Tip Box    │                          │
└──────────────┴──────────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
Step 3: Health — The Double Dividend Nobody Talks About
```

**Narrative:**
```
Reduce car trips → air pollution drops → people walk more → health improves.

It's a virtuous cycle. But councils frame this as "traffic management" instead 
of what it really is: a public health intervention.

Dense cities (London, Birmingham) see massive air quality gains — fewer cars 
means cleaner air for millions.

Smaller walkable towns (Cambridge, Oxford) excel in active travel — people 
actually switch from cars to bikes when distances are short.

**Your argument to councils:** "This isn't about bikes vs cars. It's about 
cutting hospital admissions by 25%. That saves the NHS £[X]M in YOUR area."

🎮 Toggle between metrics. Notice how different areas lead in different categories.
```

**Toggle Buttons:**
- `🚶 Physical Activity`
- `🌬️ Air Quality`
- `📊 Combined Net Benefit`

**Chart Title (Dynamic):**
```
{Selected Metric} Benefits Over Time (£ Million NPV)
```

**Top 5 Leaders (Dynamic):**
```
Top 5 Areas for {Selected Metric}:
1. [Area Name] (context): £XX.XM
2. [Area Name] (context): £XX.XM
...
```

**Activist Tip Box:**
```
💡 HEALTH DATA WINS ARGUMENTS:

Convert £M into tangible outcomes:
• £10M in air quality benefits = ~12,000 avoided asthma attacks
• £15M in physical activity gains = ~8,000 fewer hospital admissions
• £5M in combined health = ~50,000 extra healthy life years

Find your council's NHS contact. Send them this data. They'll back your case.

[Calculate health outcomes for YOUR area]
```

### **Content - Indonesian (ID)**

**Title:**
```
Langkah 3: Kesehatan — Dividen Ganda yang Tidak Ada yang Bicarakan
```

**Narrative:**
```
Kurangi perjalanan mobil → polusi udara turun → orang lebih banyak berjalan → kesehatan meningkat.

Ini adalah siklus kebajikan. Tapi dewan membingkai ini sebagai "manajemen lalu lintas" 
alih-alih apa yang sebenarnya: intervensi kesehatan masyarakat.

Kota padat (London, Birmingham) melihat peningkatan kualitas udara yang besar — lebih 
sedikit mobil berarti udara lebih bersih untuk jutaan orang.

Kota kecil yang dapat dilalui dengan berjalan kaki (Cambridge, Oxford) unggul dalam 
perjalanan aktif — orang benar-benar beralih dari mobil ke sepeda ketika jaraknya pendek.

**Argumen Anda ke dewan:** "Ini bukan tentang sepeda vs mobil. Ini tentang memotong 
rawat inap rumah sakit sebesar 25%. Itu menghemat NHS £[X] juta di area ANDA."

🎮 Beralih antar metrik. Perhatikan bagaimana area yang berbeda memimpin dalam kategori yang berbeda.
```

**Activist Tip Box:**
```
💡 DATA KESEHATAN MENANG ARGUMEN:

Konversi £M ke hasil nyata:
• £10 juta dalam manfaat kualitas udara = ~12.000 serangan asma dihindari
• £15 juta dalam peningkatan aktivitas fisik = ~8.000 rawat inap rumah sakit lebih sedikit
• £5 juta dalam kesehatan gabungan = ~50.000 tahun hidup sehat ekstra

Temukan kontak NHS dewan Anda. Kirim data ini kepada mereka. Mereka akan mendukung kasus Anda.

[Hitung hasil kesehatan untuk area ANDA]
```

### **Interaction Spec**
1. Clicking toggle button → chart updates data + map recolors (1-second transition)
2. Map color scale adjusts dynamically per metric
3. Hovering Top 5 list item → map highlights that area with pulsing border
4. "Calculate health outcomes" button → opens mini-calculator:
   - Input: £M benefit value
   - Output: Estimated avoided hospital admissions, asthma attacks, etc.

---

## 🔇 **CHAPTER 4: THE RANKING BOARD**

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
│              │                          │
│   "Show all  │   Color code:            │
│    374 LAs"  │   🥇 Top 20              │
│              │   🥈 Top 100             │
│   Activist   │   🥉 Others              │
│   Tip Box    │                          │
└──────────────┴──────────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
Step 4: Where Does Your Council Rank?
```

**Narrative:**
```
This is the data councils hate: public rankings.

We've ranked all 374 UK Local Authorities by total co-benefits (2025-2050).

Some urban centers gain £50M+. Others? Less than £1M.

But here's the key: it's not about being #1. It's about being better than 
YOUR neighbors.

**The pressure tactic:** "Council X (next door) ranks #42. We're #87. Their 
residents will gain twice as much. Why? Because they're ACTING, and we're not."

Type your area below. See your rank. Then ask your councillors why you're 
not higher.
```

**Search Box:**
- Placeholder: `Find your council in the rankings...`
- Button: `Search`

**Table Headers:**
- **Rank** | **Local Authority** | **Context** | **Total Benefit (£M)** | **View →**

**Top 3 Example:**
| Rank | Area | Context | Benefit | Action |
|------|------|---------|---------|--------|
| 1 | Westminster | London city center | £54.2M | 📍 View |
| 2 | Camden | North London | £48.1M | 📍 View |
| 3 | Tower Hamlets | East London | £42.7M | 📍 View |

**Your Area Card (If Searched):**
```
┌─────────────────────────────────────┐
│ 🎯 Your Area: Manchester            │
│    (northern industrial city)       │
│                                     │
│ Rank: #12 out of 374 (Top 3%)      │
│ Total Benefit: £26.3M               │
│                                     │
│ You rank ABOVE 362 councils.       │
│ You rank BELOW 11 councils.         │
│                                     │
│ Nearest neighbors:                  │
│ • Salford: #18 (£22.1M)            │
│ • Trafford: #25 (£19.8M)           │
│                                     │
│ [Compare with neighbors]            │
│ [Download ranking report]           │
└─────────────────────────────────────┘
```

**Activist Tip Box:**
```
💡 RANKINGS CREATE ACCOUNTABILITY:

Councils care about reputation. Use neighbor comparisons to create pressure.

"Why does [neighboring council] rank higher? What are they doing that we're not?"

Present this at public meetings. Ask for a response on record.

Pro tip: Contact local press with this data. "Our area ranks #XX — here's what 
that means for residents."

[Generate press release template]
```

### **Content - Indonesian (ID)**

**Title:**
```
Langkah 4: Di Mana Peringkat Dewan Anda?
```

**Narrative:**
```
Ini adalah data yang dibenci dewan: peringkat publik.

Kami telah memberi peringkat semua 374 Otoritas Lokal UK berdasarkan total manfaat bersama (2025-2050).

Beberapa pusat kota mendapat £50 juta+. Lainnya? Kurang dari £1 juta.

Tapi inilah kuncinya: ini bukan tentang menjadi #1. Ini tentang menjadi lebih baik dari 
tetangga ANDA.

**Taktik tekanan:** "Dewan X (sebelah) peringkat #42. Kami #87. Penduduk mereka akan 
mendapat dua kali lebih banyak. Mengapa? Karena mereka BERTINDAK, dan kami tidak."

Ketik area Anda di bawah. Lihat peringkat Anda. Lalu tanyakan kepada dewan Anda mengapa 
Anda tidak lebih tinggi.
```

**Activist Tip Box:**
```
💡 PERINGKAT MENCIPTAKAN AKUNTABILITAS:

Dewan peduli dengan reputasi. Gunakan perbandingan tetangga untuk menciptakan tekanan.

"Mengapa [dewan tetangga] peringkat lebih tinggi? Apa yang mereka lakukan yang tidak kami lakukan?"

Presentasikan ini di rapat publik. Minta tanggapan resmi.

Tip pro: Hubungi pers lokal dengan data ini. "Area kami peringkat #XX — inilah artinya 
bagi penduduk."

[Buat template siaran pers]
```

### **Interaction Spec**
1. Table displays top 20 LAs by total benefit
2. Searching → highlights row if in top 20, OR shows "Your Area Card" below table
3. Clicking table row → map zooms to LA + pulses 3x
4. "Show all 374 LAs" button → expands table OR opens modal with full rankings
5. "Compare with neighbors" → automatically selects 2-3 nearby LAs for comparison
6. "Download ranking report" → generates PDF with:
   - Your area's rank and stats
   - Neighbor comparisons
   - Suggested talking points

---

## ⚖️ **CHAPTER 5: THE TRADE-OFFS (HONESTY WINS)**

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
│   ⚠️ Costs   │   Net Benefit:           │
│   📊 Verdict │   [Visual balance scale] │
│              │                          │
│   Activist   │                          │
│   Tip Box    │                          │
└──────────────┴──────────────────────────┘
```

### **Content - English (EN)**

**Title:**
```
Step 5: The Trade-offs (Yes, They Exist. Benefits Still Win.)
```

**Narrative:**
```
Let's be honest: Net-Zero means some trade-offs.

Rural areas (sparse regions far from cities) face longer travel times. Some 
urban roads get more congested before they get better.

**If you hide this, councils will use it against you.**

Instead, lead with transparency:

"Yes, commutes might get 8 minutes longer in some areas. But residents save 
£2,400/year in energy costs and breathe air that won't give their kids asthma. 
The benefits outweigh costs 12:1."

The pattern is clear:
• Dense cities (London, Manchester): Huge benefits, minor trade-offs
• Small towns (Cambridge, Bath): Moderate benefits, low trade-offs  
• Remote rural (Scottish highlands, Welsh valleys): Small benefits, higher hassle

🧮 Calculate the balance for YOUR area. Then show councillors it's not even close.
```

**Calculator Header:**
```
Your Area's Net Benefit Calculator
```

**Search Box:**
- Placeholder: `Enter your postcode or council name`
- Button: `Calculate Balance`
- Helper text: `Try: London, Manchester, SW1A 1AA, or your UK postcode`

**Results Panel (Dynamic):**

**Benefits Section:**
```
✅ Benefits in Your Area (2025-2050):
• Air quality: £{X}M
• Physical activity: £{X}M
• Warm homes: £{X}M
• Noise reduction: £{X}M
• [Other benefits]
───────────────
Total Benefits: £{X}M
```

**Trade-offs Section:**
```
⚠️ Trade-offs in Your Area (2025-2050):
• Hassle costs: -£{X}M
• Congestion: -£{X}M
• Road safety: -£{X}M
───────────────
Total Trade-offs: -£{X}M
```

**Verdict Section:**
```
📊 The Verdict:

Net Benefit: £{X}M

In your area, benefits outweigh trade-offs by {ratio}:1.

That's better than {percentile}% of UK areas.

For every £1 of inconvenience, residents gain £{ratio} in benefits.
```

**UK Average Comparison:**
```
🇬🇧 UK Average Net Benefit: £{X}M

Your area is {X}% {above/below} the national average.

{If above:}
Your area is a climate action winner. Show this to your council.

{If below:}
Even below average, benefits still outweigh costs {ratio}:1. The case holds.
```

**Activist Tip Box:**
```
💡 HONESTY = CREDIBILITY:

Councils will try to dismiss you with "but what about [trade-off]?"

Don't dodge it. Own it:

"You're right, there are trade-offs. Let's look at them:
- Hassle costs: -£{X}M
- Benefits: +£{Y}M
- Net gain: £{Z}M

The benefits are {ratio} times larger. That's not even close. Are you really 
going to reject a 12:1 return because of minor inconveniences?"

This transparency makes you unassailable.

[Download full balance sheet for YOUR area]
```

### **Content - Indonesian (ID)**

**Title:**
```
Langkah 5: Trade-off (Ya, Mereka Ada. Manfaat Masih Menang.)
```

**Narrative:**
```
Mari jujur: Net-Zero berarti beberapa trade-off.

Area pedesaan (wilayah jarang jauh dari kota) menghadapi waktu perjalanan lebih lama. 
Beberapa jalan perkotaan menjadi lebih macet sebelum membaik.

**Jika Anda menyembunyikan ini, dewan akan menggunakannya melawan Anda.**

Sebaliknya, pimpin dengan transparansi:

"Ya, perjalanan mungkin 8 menit lebih lama di beberapa area. Tapi penduduk menghemat 
£2.400/tahun dalam biaya energi dan menghirup udara yang tidak akan membuat anak-anak 
mereka asma. Manfaat melebihi biaya 12:1."

Polanya jelas:
• Kota padat (London, Manchester): Manfaat besar, trade-off kecil
• Kota kecil (Cambridge, Bath): Manfaat moderat, trade-off rendah  
• Pedesaan terpencil (dataran tinggi Skotlandia, lembah Wales): Manfaat kecil, kerumitan lebih tinggi

🧮 Hitung keseimbangan untuk area ANDA. Lalu tunjukkan kepada dewan bahkan tidak dekat.
```

**Activist Tip Box:**
```
💡 KEJUJURAN = KREDIBILITAS:

Dewan akan mencoba menolak Anda dengan "tapi bagaimana dengan [trade-off]?"

Jangan menghindar. Terima:

"Anda benar, ada trade-off. Mari lihat mereka:
- Biaya kerumitan: -£{X} juta
- Manfaat: +£{Y} juta
- Keuntungan bersih: £{Z} juta

Manfaatnya {ratio} kali lebih besar. Itu bahkan tidak dekat. Apakah Anda benar-benar 
akan menolak pengembalian 12:1 karena ketidaknyamanan kecil?"

Transparansi ini membuat Anda tak terkalahkan.

[Unduh neraca lengkap untuk area ANDA]
```

### **Interaction Spec**
1. User enters area → pulls all metrics from dataset
2. Calculate button → animates results panel (slide in from left, 0.8s)
3. Benefits/Trade-offs count up with GSAP animation (1.5s)
4. Ratio calculated: `benefits / abs(costs)`
5. Percentile: compare to all 46,426 areas
6. Map spotlight: area glows + surrounding areas dim to 40% opacity
7. Visual balance scale tips toward "Benefits" side proportionally
8. "Download balance sheet" generates PDF with:
   - Full breakdown
   - Comparison to UK average
   - Suggested responses to common objections

---

## 🎬 **OUTRO: TAKE ACTION**

### **Layout**
```
┌──────────────────────────────────────────┐
│   [3D map in background, zoomed to UK]   │
│                                          │
│         Closing Statement                │
│                                          │
│   ┌────────────────────────────────┐    │
│   │  🔍 Explore More Areas         │    │
│   ├────────────────────────────────┤    │
│   │  📊 Download Full Toolkit      │    │
│   ├────────────────────────────────┤    │
│   │  📧 Email Your Councillor      │    │
│   ├────────────────────────────────┤    │
│   │  🧪 See Methodology            │    │
│   └────────────────────────────────┘    │
│                                          │
│   Stats:                                 │
│   46,426 | £99.7B | 374 LAs             │
│   Areas  | Benefits| Ranked             │
└──────────────────────────────────────────┘
```

### **Content - English (EN)**

**Statement:**
```
You Have the Data. Now Make Them Act.

Your council has the evidence. They have the numbers. They have zero excuses.

Every postcode. Every street. Every household has a stake in climate action.

This isn't about believing in climate change. It's about believing in £99.7 
billion in health, housing, and quality of life gains for UK communities.

What happens next is up to you.
```

**CTA Buttons:**

**1. Explore More Areas (Primary)**
```
🔍 Switch to Free Explore Mode
Research any UK area • Compare up to 5 councils • Export custom data
```
- **Action:** Switches to Free Explore mode (if in Story Mode)
- **Alternative:** "Return to Story" (if in Free Explore)

**2. Download Full Toolkit (Secondary)**
```
📊 Download Activist Toolkit
Get ready-to-use reports, scripts, and templates for YOUR area
```
- **Action:** Opens form:
  ```
  ┌──────────────────────────────────────┐
  │ Get Your Free Activist Toolkit       │
  │                                      │
  │ Your Email: [            ]           │
  │ Your Postcode: [        ]            │
  │ Your Council: [Dropdown]             │
  │                                      │
  │ What you'll get:                     │
  │ ✅ Custom data report for your area  │
  │ ✅ Council meeting script templates  │
  │ ✅ Email template for councillors    │
  │ ✅ Press release template            │
  │ ✅ Social media graphics             │
  │                                      │
  │ [Send Me the Toolkit]                │
  └──────────────────────────────────────┘
  ```

**3. Email Your Councillor (Tertiary)**
```
📧 Find & Contact Your Councillors
Pre-written email templates with YOUR area's data
```
- **Action:** Opens tool:
  ```
  ┌──────────────────────────────────────┐
  │ Contact Your Councillors             │
  │                                      │
  │ Enter your postcode: [       ]       │
  │ [Find My Councillors]                │
  │                                      │
  │ Your councillors:                    │
  │ • Cllr. Jane Smith (Labour)          │
  │   jane.smith@council.gov.uk          │
  │ • Cllr. John Doe (Conservative)      │
  │   john.doe@council.gov.uk            │
  │                                      │
  │ Email template:                      │
  │ [Subject: Climate Action Benefits    │
  │  for [Your Area]]                    │
  │                                      │
  │ Dear Councillor [Name],              │
  │                                      │
  │ I'm writing as a resident of [Area]  │
  │ to urge action on climate co-benefits│
  │                                      │
  │ According to the UK Co-Benefits Atlas│
  │ our area stands to gain £[X]M in... │
  │                                      │
  │ [Customize template]                 │
  │ [Send Email]                         │
  └──────────────────────────────────────┘
  ```

**4. See Methodology (Quaternary)**
```
🧪 How We Calculated This
Full methodology, data sources, and assumptions
```
- **Action:** Opens modal with:
  - Data source: UK Co-Benefits Atlas
  - Aggregation methods
  - NPV calculations
  - Limitations and caveats
  - Links to raw data

**Stats Labels:**
```
46,426          £99.7B          374 LAs
Areas Analyzed | Total Benefits | Ranked
```

### **Content - Indonesian (ID)**

**Statement:**
```
Anda Punya Data. Sekarang Buat Mereka Bertindak.

Dewan Anda memiliki bukti. Mereka memiliki angka. Mereka tidak punya alasan.

Setiap kode pos. Setiap jalan. Setiap rumah tangga memiliki kepentingan dalam aksi iklim.

Ini bukan tentang percaya pada perubahan iklim. Ini tentang percaya pada £99,7 
miliar dalam kesehatan, perumahan, dan peningkatan kualitas hidup untuk komunitas UK.

Apa yang terjadi selanjutnya terserah Anda.
```

**CTA Buttons:**
```
🔍 Beralih ke Mode Jelajah Bebas
📊 Unduh Toolkit Aktivis
📧 Email Dewan Anda
🧪 Lihat Metodologi
```

---

## 🌐 **I18N IMPLEMENTATION NOTES**

### **Language Support**
- **Primary:** English (UK)
- **Secondary:** Indonesian

### **Translation Keys Structure**
```json
{
  "nav": {
    "title": "UK Net-Zero Navigator",
    "modeStory": "Story Mode",
    "modeFree": "Free Explore",
    "langToggle": "EN / ID"
  },
  "hero": {
    "title": "UK Net-Zero Navigator",
    "subtitle": "Explore Local Benefits, Challenge Your Council",
    "tagline": "Your council says climate action is too expensive...",
    "searchPlaceholder": "Enter your postcode or council name",
    "searchButton": "Start Exploring",
    "meta": "A toolkit for community organizers",
    "scrollCta": "Scroll to build your case ↓"
  },
  "chapter1": {
    "title": "Step 1: The £100 Billion They're Not Counting",
    "narrative": "When councils debate climate budgets...",
    "activistTip": {
      "title": "ACTIVIST TIP:",
      "content": "Councils respond to money, not morals..."
    },
    "downloadChart": "Download this chart"
  },
  // ... repeat for chapters 2-5
  "outro": {
    "statement": "You Have the Data. Now Make Them Act.",
    "cta1": "Explore More Areas",
    "cta2": "Download Activist Toolkit",
    "cta3": "Email Your Councillor",
    "cta4": "See Methodology"
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

### **Phase 1: Navigation & Mode Toggle**
- [ ] Build top navigation bar with mode toggle
- [ ] Implement Story Mode (default, linear scrollytelling)
- [ ] Implement Free Explore Mode (sandbox with full controls)
- [ ] Add smooth transition between modes
- [ ] Save user's mode preference in localStorage

### **Phase 2: Hero + Search**
- [ ] Replace title with "UK Net-Zero Navigator"
- [ ] Update subtitle with activist framing
- [ ] Add search box + explore button
- [ ] Connect search to 3D map zoom function
- [ ] Add "Free Explore" alternative CTA
- [ ] Implement scroll CTA for Story Mode

### **Phase 3: Chapter 1 - Evidence Builder**
- [ ] Reframe narrative as "Step 1: The £100B They're Not Counting"
- [ ] Add "Activist Tip" box with council meeting tactics
- [ ] Connect chart hover → map filter
- [ ] Add "Download chart" button (PNG export)
- [ ] Update all copy to activist empowerment tone

### **Phase 4: Chapter 2 - Housing Comparison**
- [ ] Reframe as "Step 2: Housing Inequality"
- [ ] Build LA comparison dropdowns with context labels
- [ ] Add default comparison (urban vs rural neighbor)
- [ ] Create "Activist Tip" box with council meeting script
- [ ] Add "Download PDF Report" button
- [ ] Generate shareable comparison report

### **Phase 5: Chapter 3 - Health Benefits**
- [ ] Reframe as "Step 3: Health — The Double Dividend"
- [ ] Add metric toggle buttons (Physical Activity, Air Quality, Combined)
- [ ] Build Top 5 leaders list (updates dynamically)
- [ ] Add "Activist Tip" box with NHS partnership suggestion
- [ ] Create mini health outcomes calculator
- [ ] Connect toggle → chart + map update

### **Phase 6: Chapter 4 - Ranking Board**
- [ ] Reframe as "Step 4: Where Does Your Council Rank?"
- [ ] Build leaderboard table (top 20 default)
- [ ] Add search box for LA lookup
- [ ] Create "Your Area Card" for searched areas
- [ ] Show neighbor comparisons automatically
- [ ] Add "Activist Tip" box with press release tactics
- [ ] Build "Download ranking report" PDF generator
- [ ] Add "Generate press release template" button

### **Phase 7: Chapter 5 - Trade-offs Calculator**
- [ ] Reframe as "Step 5: The Trade-offs (Honesty Wins)"
- [ ] Build personalized calculator UI
- [ ] Connect search → data lookup
- [ ] Calculate benefits/costs/net/ratio/percentile
- [ ] Create visual balance scale (tips toward benefits)
- [ ] Add UK average comparison
- [ ] Build "Activist Tip" box with objection handling
- [ ] Add "Download balance sheet" PDF generator

### **Phase 8: Outro - Action CTAs**
- [ ] Update closing statement with empowerment message
- [ ] Build "Switch to Free Explore" button
- [ ] Create "Download Activist Toolkit" form
- [ ] Build "Email Your Councillor" tool with:
  - [ ] Postcode → councillor lookup
  - [ ] Pre-written email templates
  - [ ] Customization interface
- [ ] Add "See Methodology" modal
- [ ] Display final stats counter

### **Phase 9: Free Explore Mode**
- [ ] Build full-screen 3D map interface
- [ ] Add control panel (search, compare, metrics, export)
- [ ] Implement click-any-area → full data popup
- [ ] Build comparison queue (up to 5 areas)
- [ ] Add time slider (2025 → 2050 animation)
- [ ] Implement area type filter (urban/suburban/rural)
- [ ] Add bookmark functionality
- [ ] Build CSV export feature

### **Phase 10: I18N**
- [ ] Extract all text to translation files (en.json, id.json)
- [ ] Implement language toggle
- [ ] Test all sections in both languages
- [ ] Verify number formatting (£ vs. locale)
- [ ] Translate activist tips and scripts
- [ ] Test PDF downloads in both languages

### **Phase 11: Polish & Testing**
- [ ] Test all interactions with real UK postcodes
- [ ] Verify PDF downloads work (reports, scripts, templates)
- [ ] Test email councillor tool with real data
- [ ] Ensure geographic context appears everywhere
- [ ] Test mode switching (Story ↔ Free Explore)
- [ ] Mobile responsive testing
- [ ] Accessibility audit (WCAG AA)

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

**Priority Order:**
1. **Phase 0: Geographic context** (critical foundation - without this, international users are lost)
2. **Phase 1-2: Navigation + Hero** (first impression + mode toggle)
3. **Phase 6-7: Ranking + Trade-offs** (most persuasive chapters for councils)
4. **Phase 3-5: Evidence building chapters** (story flow)
5. **Phase 8: Outro CTAs** (conversion)
6. **Phase 9: Free Explore** (advanced users)
7. **Phase 10-11: I18N + Polish** (final touches)

---

**🎯 Success Criteria:**

1. **Judges can clearly identify:**
   - Specific audience: Community organizers/activists
   - Specific problem: Councils dismiss climate action as too expensive
   - Specific solution: Local data toolkit ready for council meetings

2. **Tech showcase:**
   - Dual-mode navigation (Story + Free Explore)
   - 3D map with multi-level data (nation → LA → area)
   - Interactive comparisons, rankings, calculators
   - Downloadable reports and email templates

3. **Real-world utility:**
   - PDFs ready for council meetings
   - Email templates pre-written
   - Press release generator
   - Transparent trade-off handling

4. **International accessibility:**
   - Non-UK users can understand without Googling
   - All area names have context labels
   - i18n support for wider reach

---

**🌏 Remember:** If an activist in Jakarta can use this toolkit to understand UK climate politics, and a councillor in Birmingham can't dismiss the data, you've succeeded.

---

**End of Execution Plan** 🚀
