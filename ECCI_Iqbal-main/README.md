# Net-zero Co-Benefits – An Interactive Journey 🌍

An interactive scrollytelling visualization exploring how the UK's net-zero pathway (2025–2050) creates tangible benefits for communities: warmer homes, cleaner air, quieter streets, and healthier lives.

## 🎯 Overview

This project visualizes the co-benefits of the UK's climate action through an engaging, scroll-driven narrative. Users can explore how different aspects of net-zero policies impact everyday life across the UK.

## ✨ Features

- **Scrollytelling Interface** - Engaging scroll-based narrative experience
- **Interactive Visualizations** - Dynamic charts powered by Plotly.js
- **Multiple Co-Benefits Categories**:
  - Physical Activity
  - Air Quality
  - Noise Reduction
  - Warm Homes (Excess Cold, Dampness, Excess Heat)
  - Congestion
  - Road Safety
  - Hassle Costs
- **Creative Cursor Modes** - 5 unique cursor styles with trail effects
- **Keyboard Navigation** - Full keyboard accessibility
- **Responsive Design** - Works across devices

## 📊 Data

The visualizations are based on UK Climate Change Committee pathway analysis, projecting co-benefits from 2025 to 2050. Values are expressed in **million GBP (Net Present Value)** compared to business-as-usual scenarios.

## 🚀 Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (optional, for development)

### Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ECCI_Iqbal.git
   cd ECCI_Iqbal
   ```

2. Open `index.html` in your browser, or serve it with a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (npx)
   npx serve
   ```

3. Navigate to `http://localhost:8000` in your browser.

## 📁 Project Structure

```
ECCI_Iqbal/
├── index.html      # Main HTML structure with scrolly sections
├── main.js         # JavaScript engine for scrollytelling & visualizations
├── styles.css      # Styling with custom cursors & animations
└── README.md       # This file
```

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, animations, scroll snap
- **JavaScript** - Vanilla JS for interactivity
- **Plotly.js** - Interactive data visualizations
- **Google Fonts** - Inter font family

## 📖 Usage

- **Scroll** through the page to navigate the story
- **Use keyboard arrows** for section navigation
- **Hover** over charts for detailed data points
- **Experience** creative cursor effects throughout

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Data source: UK Climate Change Committee
- Visualization inspiration: Scrollytelling best practices
- Built for ECCI (Edinburgh Climate Change Institute)

---

*Exploring how climate action transforms lives across the UK* 🇬🇧
