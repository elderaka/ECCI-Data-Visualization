/* ============================================
   NET-ZERO CO-BENEFITS - MAIN JAVASCRIPT
   Scrollytelling Engine with Keyboard Nav
   5 Creative Cursor Modes with Trails
   ============================================ */

// ============================================
// DATA PLACEHOLDER (Replace with real data)
// ============================================
const years = [
  2025, 2026, 2027, 2028, 2029, 2030,
  2031, 2032, 2033, 2034, 2035, 2036,
  2037, 2038, 2039, 2040, 2041, 2042,
  2043, 2044, 2045, 2046, 2047, 2048,
  2049, 2050
];

const nationalSeries = {
  sum: [
    1500, 2400, 3200, 3800, 4300, 4800,
    5200, 5500, 5800, 6100, 6400, 6600,
    6800, 6900, 7000, 7050, 7100, 7120,
    7135, 7140, 7145, 7150, 7152, 7154,
    7155, 7155
  ],
  physical_activity: [
    400, 600, 800, 1000, 1300, 1600,
    1900, 2200, 2500, 2800, 3100, 3400,
    3700, 4000, 4300, 4600, 4900, 5200,
    5500, 5800, 6100, 6400, 6700, 7000,
    7300, 7600
  ],
  air_quality: [
    350, 500, 650, 780, 900, 1020,
    1120, 1180, 1230, 1270, 1300, 1320,
    1330, 1335, 1340, 1343, 1345, 1347,
    1348, 1349, 1350, 1350, 1350, 1350,
    1350, 1350
  ],
  noise: [
    100, 150, 220, 300, 380, 450,
    520, 580, 640, 690, 720, 740,
    750, 755, 760, 762, 764, 765,
    766, 766, 767, 767, 767, 767,
    767, 767
  ],
  excess_cold: [
    50, 70, 110, 150, 190, 230,
    260, 280, 300, 315, 325, 335,
    340, 342, 344, 346, 348, 349,
    350, 350, 351, 351, 351, 351,
    351, 351
  ],
  dampness: [
    15, 24, 33, 42, 50, 58,
    66, 73, 79, 84, 88, 91,
    93, 94, 95, 96, 96, 97,
    97, 97, 98, 98, 98, 98,
    98, 98
  ],
  excess_heat: [
    0.1, 0.1, 0.12, 0.14, 0.16, 0.18,
    0.2, 0.22, 0.24, 0.26, 0.28, 0.3,
    0.32, 0.34, 0.36, 0.38, 0.4, 0.42,
    0.44, 0.46, 0.48, 0.5, 0.52, 0.54,
    0.56, 0.58
  ],
  congestion: [
    350, 600, 800, 950, 1100, 1200,
    1050, 900, 700, 500, 200, 0,
    -150, -300, -450, -600, -800, -1000,
    -1200, -1400, -1600, -1800, -2000, -2200,
    -2350, -2450
  ],
  road_safety: [
    50, 100, 150, 200, 240, 260,
    230, 200, 150, 100, 40, 0,
    -40, -80, -120, -180, -220, -260,
    -300, -340, -380, -430, -470, -510,
    -540, -570
  ],
  hassle_costs: [
    -200, -260, -320, -380, -440, -500,
    -560, -620, -680, -740, -800, -860,
    -920, -980, -1040, -1100, -1180, -1260,
    -1340, -1420, -1500, -1580, -1660, -1740,
    -1820, -1900
  ]
};

const warmHomesData = {
  labels: ["Northern City", "Southern Town"],
  excess_cold: [0.42, 0.18],
  dampness: [0.08, 0.03],
  excess_heat: [0.01, 0.00]
};

const noiseRanking = {
  la: ["Manchester", "Birmingham", "Leeds", "Sheffield", "Liverpool", "Bristol", "Newcastle", "Nottingham"],
  noise_per_hh: [0.31, 0.27, 0.25, 0.22, 0.21, 0.19, 0.18, 0.17]
};

// ============================================
// CREATIVE CURSOR SYSTEM - 7 WILD OPTIONS + AUTO MODE
// ============================================
class CreativeCursorManager {
  constructor() {
    this.currentMode = 'none';
    this.manualMode = null; // User's manual selection (null = auto)
    this.mouseX = 0;
    this.mouseY = 0;
    this.cursorX = 0;
    this.cursorY = 0;
    this.isHovering = false;
    this.trailInterval = null;
    this.mainCursor = null;
    this.orbitElement = null;
    this.planets = [];
    this.lastTrailTime = 0;
    this.trailDelay = 50;
    this.paintColors = ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6'];
    this.currentPaintColor = 0;
    
    // Section-to-cursor mapping for auto mode
    this.sectionCursors = {
      'hero': 'galaxy',
      'intro': 'spark',
      'warm_homes': 'brush',
      'clean_active': 'leaf',
      'quiet_cities': 'ripple',
      'trade_offs': 'spark',
      'outro': 'galaxy'
    };
    
    this.init();
  }

  init() {
    this.bindMouseEvents();
    this.animate();
  }
  
  // Called when section changes - auto-switch cursor if not manually set
  onSectionChange(story) {
    if (this.manualMode === null || this.manualMode === 'auto') {
      const cursor = this.sectionCursors[story] || 'spark';
      this.setMode(cursor, false); // false = don't update manual mode
    }
  }
  
  // Set manual mode (user clicked a cursor button)
  setManualMode(mode) {
    this.manualMode = mode;
    if (mode === 'auto') {
      // Let section change handle it
      return;
    }
    this.setMode(mode, false);
  }

  bindMouseEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      // Create trail effects based on mode
      if (this.currentMode !== 'none') {
        this.createTrail();
      }
    });

    // Hover detection
    const interactiveElements = 'a, button, .story-card, .viz-panel, .nav-dot, .cursor-btn, .hero-cta, .outro-cta';
    
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactiveElements)) {
        this.setHover(true);
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactiveElements)) {
        this.setHover(false);
      }
    });
  }

  setHover(state) {
    this.isHovering = state;
    if (this.mainCursor) {
      this.mainCursor.classList.toggle('hover', state);
    }
  }

  setMode(mode) {
    // Cleanup previous mode
    this.cleanup();
    
    document.body.classList.remove('custom-cursor');
    this.currentMode = mode;
    
    if (mode === 'none') {
      return;
    }
    
    document.body.classList.add('custom-cursor');
    this.setupMode(mode);
  }

  cleanup() {
    // Remove main cursor
    if (this.mainCursor) {
      this.mainCursor.remove();
      this.mainCursor = null;
    }
    
    // Remove orbit
    if (this.orbitElement) {
      this.orbitElement.remove();
      this.orbitElement = null;
    }
    
    // Remove planets
    this.planets.forEach(p => p.remove());
    this.planets = [];
    
    // Clear any remaining trails
    document.querySelectorAll('[class*="cursor-"][class*="-trail"], [class*="cursor-"][class*="-ring"], .cursor-paint-stroke, .cursor-galaxy-trail').forEach(el => el.remove());
  }

  setupMode(mode) {
    switch(mode) {
      case 'leaf':
        this.mainCursor = document.createElement('div');
        this.mainCursor.className = 'cursor-leaf';
        document.body.appendChild(this.mainCursor);
        this.trailDelay = 80;
        break;
        
      case 'spark':
        this.mainCursor = document.createElement('div');
        this.mainCursor.className = 'cursor-spark';
        document.body.appendChild(this.mainCursor);
        this.trailDelay = 30;
        break;
        
      case 'ripple':
        this.mainCursor = document.createElement('div');
        this.mainCursor.className = 'cursor-ripple';
        document.body.appendChild(this.mainCursor);
        this.trailDelay = 200;
        break;
        
      case 'galaxy':
        this.mainCursor = document.createElement('div');
        this.mainCursor.className = 'cursor-galaxy';
        document.body.appendChild(this.mainCursor);
        
        // Create orbit ring
        this.orbitElement = document.createElement('div');
        this.orbitElement.className = 'cursor-galaxy-orbit';
        document.body.appendChild(this.orbitElement);
        
        // Create orbiting planets
        const planetEmojis = ['🪐', '🌙', '☄️'];
        planetEmojis.forEach((emoji, i) => {
          const planet = document.createElement('div');
          planet.className = 'cursor-galaxy-planet';
          planet.textContent = emoji;
          planet.dataset.angle = (i * 120) * (Math.PI / 180);
          planet.dataset.speed = 0.02 + (i * 0.01);
          document.body.appendChild(planet);
          this.planets.push(planet);
        });
        
        this.trailDelay = 100;
        break;
        
      case 'brush':
        this.mainCursor = document.createElement('div');
        this.mainCursor.className = 'cursor-brush';
        document.body.appendChild(this.mainCursor);
        this.trailDelay = 20;
        break;
        
      case 'fire':
        this.mainCursor = document.createElement('div');
        this.mainCursor.className = 'cursor-fire';
        document.body.appendChild(this.mainCursor);
        this.trailDelay = 25;
        break;
        
      case 'snow':
        this.mainCursor = document.createElement('div');
        this.mainCursor.className = 'cursor-snow';
        document.body.appendChild(this.mainCursor);
        this.trailDelay = 60;
        break;
    }
  }

  createTrail() {
    const now = Date.now();
    if (now - this.lastTrailTime < this.trailDelay) return;
    this.lastTrailTime = now;

    switch(this.currentMode) {
      case 'leaf':
        this.createLeafTrail();
        break;
      case 'spark':
        this.createSparkTrail();
        break;
      case 'fire':
        this.createFireTrail();
        break;
      case 'snow':
        this.createSnowTrail();
        break;
      case 'ripple':
        this.createRippleTrail();
        break;
      case 'galaxy':
        this.createGalaxyTrail();
        break;
      case 'brush':
        this.createBrushTrail();
        break;
    }
  }

  createLeafTrail() {
    const trail = document.createElement('div');
    trail.className = 'cursor-leaf-trail';
    trail.textContent = ['🍂', '🍃', '🌿', '☘️'][Math.floor(Math.random() * 4)];
    trail.style.left = `${this.mouseX + (Math.random() - 0.5) * 20}px`;
    trail.style.top = `${this.mouseY + (Math.random() - 0.5) * 20}px`;
    trail.style.fontSize = `${10 + Math.random() * 8}px`;
    document.body.appendChild(trail);
    
    setTimeout(() => trail.remove(), 1000);
  }

  createSparkTrail() {
    const trail = document.createElement('div');
    trail.className = 'cursor-spark-trail';
    trail.style.left = `${this.mouseX + (Math.random() - 0.5) * 30}px`;
    trail.style.top = `${this.mouseY + (Math.random() - 0.5) * 30}px`;
    trail.style.width = `${4 + Math.random() * 6}px`;
    trail.style.height = trail.style.width;
    document.body.appendChild(trail);
    
    setTimeout(() => trail.remove(), 600);
  }

  createRippleTrail() {
    const ring = document.createElement('div');
    ring.className = 'cursor-ripple-ring';
    ring.style.left = `${this.mouseX}px`;
    ring.style.top = `${this.mouseY}px`;
    document.body.appendChild(ring);
    
    setTimeout(() => ring.remove(), 1000);
  }

  createGalaxyTrail() {
    const stars = ['✦', '✧', '⋆', '✶', '✴'];
    const trail = document.createElement('div');
    trail.className = 'cursor-galaxy-trail';
    trail.textContent = stars[Math.floor(Math.random() * stars.length)];
    trail.style.left = `${this.mouseX + (Math.random() - 0.5) * 40}px`;
    trail.style.top = `${this.mouseY + (Math.random() - 0.5) * 40}px`;
    trail.style.color = ['#93C5FD', '#C4B5FD', '#FDE68A', '#A7F3D0'][Math.floor(Math.random() * 4)];
    document.body.appendChild(trail);
    
    setTimeout(() => trail.remove(), 800);
  }

  createBrushTrail() {
    const stroke = document.createElement('div');
    stroke.className = 'cursor-paint-stroke';
    stroke.style.left = `${this.mouseX}px`;
    stroke.style.top = `${this.mouseY}px`;
    stroke.style.background = this.paintColors[this.currentPaintColor];
    stroke.style.width = `${8 + Math.random() * 8}px`;
    stroke.style.height = stroke.style.width;
    document.body.appendChild(stroke);
    
    // Cycle through colors
    this.currentPaintColor = (this.currentPaintColor + 1) % this.paintColors.length;
    
    setTimeout(() => stroke.remove(), 1500);
  }

  createFireTrail() {
    const flames = ['🔥', '🧡', '💛', '❤️‍🔥'];
    const trail = document.createElement('div');
    trail.className = 'cursor-fire-trail';
    trail.textContent = flames[Math.floor(Math.random() * flames.length)];
    trail.style.left = `${this.mouseX + (Math.random() - 0.5) * 20}px`;
    trail.style.top = `${this.mouseY + (Math.random() - 0.5) * 20}px`;
    trail.style.fontSize = `${12 + Math.random() * 10}px`;
    document.body.appendChild(trail);
    
    setTimeout(() => trail.remove(), 600);
  }

  createSnowTrail() {
    const flakes = ['❄️', '❅', '❆', '✻', '✼'];
    const trail = document.createElement('div');
    trail.className = 'cursor-snow-trail';
    trail.textContent = flakes[Math.floor(Math.random() * flakes.length)];
    trail.style.left = `${this.mouseX + (Math.random() - 0.5) * 30}px`;
    trail.style.top = `${this.mouseY + (Math.random() - 0.5) * 30}px`;
    trail.style.fontSize = `${8 + Math.random() * 8}px`;
    trail.style.color = ['#93C5FD', '#BFDBFE', '#DBEAFE', '#E0E7FF'][Math.floor(Math.random() * 4)];
    document.body.appendChild(trail);
    
    setTimeout(() => trail.remove(), 1200);
  }

  animate() {
    // Smooth cursor following
    const ease = 0.2;
    this.cursorX += (this.mouseX - this.cursorX) * ease;
    this.cursorY += (this.mouseY - this.cursorY) * ease;

    if (this.mainCursor) {
      this.mainCursor.style.left = `${this.cursorX}px`;
      this.mainCursor.style.top = `${this.cursorY}px`;
    }
    
    if (this.orbitElement) {
      this.orbitElement.style.left = `${this.cursorX}px`;
      this.orbitElement.style.top = `${this.cursorY}px`;
    }
    
    // Animate planets orbiting
    this.planets.forEach(planet => {
      let angle = parseFloat(planet.dataset.angle);
      const speed = parseFloat(planet.dataset.speed);
      angle += speed;
      planet.dataset.angle = angle;
      
      const radius = 35;
      const x = this.cursorX + Math.cos(angle) * radius;
      const y = this.cursorY + Math.sin(angle) * radius;
      
      planet.style.left = `${x}px`;
      planet.style.top = `${y}px`;
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================
// MAGNETIC SCROLL & KEYBOARD NAVIGATION
// ============================================
class MagneticScrollManager {
  constructor() {
    this.sections = [];
    this.currentIndex = 0;
    this.isScrolling = false;
    this.scrollTimeout = null;
    this.progressBar = null;
    this.navDots = [];
    
    this.init();
  }

  init() {
    this.sections = Array.from(document.querySelectorAll('.snap-section'));
    this.createProgressBar();
    this.createNavDots();
    this.createKeyboardHint();
    this.bindEvents();
    this.setupIntersectionObserver();
    
    // Initial state
    if (this.sections[0]) {
      this.sections[0].classList.add('visible');
    }
  }

  createProgressBar() {
    this.progressBar = document.createElement('div');
    this.progressBar.className = 'scroll-progress';
    document.body.prepend(this.progressBar);
  }

  createNavDots() {
    const labels = ['Welcome', 'Overview', 'Warm Homes', 'Active Streets', 'Quiet Cities', 'Trade-offs', 'Take Action'];
    
    const nav = document.createElement('nav');
    nav.className = 'nav-dots';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Section navigation');
    
    this.sections.forEach((section, i) => {
      const dot = document.createElement('button');
      dot.className = 'nav-dot';
      dot.dataset.label = labels[i] || `Section ${i + 1}`;
      dot.dataset.index = i;
      dot.setAttribute('aria-label', `Go to ${labels[i] || `Section ${i + 1}`}`);
      
      dot.addEventListener('click', () => {
        this.goToSection(i);
      });
      
      nav.appendChild(dot);
      this.navDots.push(dot);
    });
    
    document.body.appendChild(nav);
  }

  createKeyboardHint() {
    const hint = document.createElement('div');
    hint.className = 'keyboard-hint';
    hint.innerHTML = `
      <span class="key">↑</span>
      <span class="key">↓</span>
      <span>or</span>
      <span class="key">Space</span>
      <span>to navigate</span>
    `;
    document.body.appendChild(hint);
  }

  bindEvents() {
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      switch(e.key) {
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
          e.preventDefault();
          this.goToSection(this.currentIndex + 1);
          break;
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault();
          this.goToSection(this.currentIndex - 1);
          break;
        case 'Home':
          e.preventDefault();
          this.goToSection(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToSection(this.sections.length - 1);
          break;
        // Number keys 1-7 for quick navigation
        case '1': case '2': case '3': case '4': case '5': case '6': case '7':
          e.preventDefault();
          this.goToSection(parseInt(e.key) - 1);
          break;
      }
    });

    // Mouse wheel with INSTANT magnetic effect (no lag)
    let lastWheelTime = 0;
    const wheelCooldown = 400; // ms between navigations

    window.addEventListener('wheel', (e) => {
      e.preventDefault();
      
      const now = Date.now();
      if (now - lastWheelTime < wheelCooldown) return;
      
      // Instant response - no accumulation needed
      if (e.deltaY > 10) {
        this.goToSection(this.currentIndex + 1);
        lastWheelTime = now;
      } else if (e.deltaY < -10) {
        this.goToSection(this.currentIndex - 1);
        lastWheelTime = now;
      }
    }, { passive: false });

    // Touch support for mobile
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', (e) => {
      touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.goToSection(this.currentIndex + 1);
        } else {
          this.goToSection(this.currentIndex - 1);
        }
      }
    }, { passive: true });

    // Scroll event for progress bar
    window.addEventListener('scroll', () => {
      this.updateProgress();
    }, { passive: true });
  }

  goToSection(index) {
    // Clamp index
    index = Math.max(0, Math.min(index, this.sections.length - 1));
    
    if (index === this.currentIndex || this.isScrolling) return;
    
    this.isScrolling = true;
    this.currentIndex = index;
    
    // Smooth scroll to section
    this.sections[index].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
    
    // Update active states
    this.setActiveDot(index);
    
    // Trigger story change (for viz AND cursor)
    const story = this.sections[index].dataset.story;
    if (story) {
      window.dispatchEvent(new CustomEvent('storyChange', { detail: { story, index } }));
    }
    
    // Reset scrolling flag quickly for snappy feel
    clearTimeout(this.scrollTimeout);
    this.scrollTimeout = setTimeout(() => {
      this.isScrolling = false;
    }, 500); // Reduced from 800ms
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
          const index = this.sections.indexOf(entry.target);
          if (index !== -1 && !this.isScrolling) {
            this.currentIndex = index;
            this.setActiveDot(index);
          }
          
          // Add visible class for animations
          entry.target.classList.add('visible');
          
          // Trigger viz AND cursor update
          const story = entry.target.dataset.story;
          if (story) {
            window.dispatchEvent(new CustomEvent('storyChange', { detail: { story, index } }));
          }
        }
      });
    }, {
      threshold: [0.5],
      rootMargin: '0px'
    });

    this.sections.forEach(section => observer.observe(section));
  }

  setActiveDot(index) {
    this.navDots.forEach((dot, i) => {
      dot.classList.toggle('active', i === index);
    });
  }

  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    this.progressBar.style.width = `${progress}%`;
  }
}

// ============================================
// PARTICLE SYSTEM
// ============================================
class ParticleSystem {
  constructor() {
    this.container = null;
    this.particleCount = 12;
    this.init();
  }

  init() {
    this.container = document.createElement('div');
    this.container.className = 'particles';
    document.body.prepend(this.container);
    
    for (let i = 0; i < this.particleCount; i++) {
      this.createParticle(i);
    }
  }

  createParticle(index) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    
    const size = 4 + Math.random() * 8;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    
    particle.style.animationDelay = `${index * 0.8}s`;
    particle.style.animationDuration = `${12 + Math.random() * 8}s`;
    
    const colors = [
      'rgba(59, 130, 246, 0.25)',
      'rgba(16, 185, 129, 0.25)',
      'rgba(251, 191, 36, 0.2)',
      'rgba(251, 113, 133, 0.2)'
    ];
    particle.style.background = colors[Math.floor(Math.random() * colors.length)];
    
    this.container.appendChild(particle);
  }
}

// ============================================
// VISUALIZATION MANAGER
// ============================================
class VizManager {
  constructor() {
    this.currentStory = 'intro';
    this.plotlyConfig = {
      responsive: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
    };
    this.lightTheme = {
      paper_bgcolor: 'rgba(250, 251, 252, 0)',
      plot_bgcolor: 'rgba(250, 251, 252, 0)',
      font: { color: '#4A5568', family: 'Inter, sans-serif' },
      colorway: ['#3B82F6', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4'],
      xaxis: {
        gridcolor: 'rgba(0, 0, 0, 0.06)',
        zerolinecolor: 'rgba(0, 0, 0, 0.1)',
        tickfont: { color: '#6B7A8A' }
      },
      yaxis: {
        gridcolor: 'rgba(0, 0, 0, 0.06)',
        zerolinecolor: 'rgba(0, 0, 0, 0.1)',
        tickfont: { color: '#6B7A8A' }
      }
    };
    this.init();
  }

  init() {
    window.addEventListener('storyChange', (e) => {
      this.renderStory(e.detail.story);
    });
    
    // Initial render
    setTimeout(() => this.renderStory('intro'), 500);
  }

  updateMeta(title, subtitle, badge, caption, tags) {
    const titleEl = document.getElementById('viz-title-text');
    const subtitleEl = document.getElementById('viz-subtitle-text');
    const badgeEl = document.getElementById('viz-badge-text');
    const captionEl = document.getElementById('viz-caption-main');
    const tagsEl = document.getElementById('viz-tags');

    if (titleEl) titleEl.textContent = title;
    if (subtitleEl) subtitleEl.textContent = subtitle;
    if (badgeEl) badgeEl.textContent = badge;
    if (captionEl) captionEl.textContent = caption;
    
    if (tagsEl) {
      tagsEl.innerHTML = '';
      tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = 'legend-tag';
        span.textContent = tag;
        tagsEl.appendChild(span);
      });
    }
  }

  renderStory(story) {
    this.currentStory = story;
    
    switch(story) {
      case 'hero':
        // No chart for hero
        break;
      case 'intro':
        this.renderIntro();
        break;
      case 'warm_homes':
        this.renderWarmHomes();
        break;
      case 'clean_active':
        this.renderCleanActive();
        break;
      case 'quiet_cities':
        this.renderQuietCities();
        break;
      case 'trade_offs':
        this.renderTradeOffs();
        break;
      case 'outro':
        this.renderOutro();
        break;
      default:
        this.renderIntro();
    }
  }

  renderIntro() {
    this.updateMeta(
      'National Co-Benefits Over Time',
      'Stacked view of cumulative benefits · Hover to explore',
      'Overview',
      'Aggregated co-benefits across all UK small areas from 2025-2050',
      ['Physical Activity', 'Air Quality', 'Energy Savings', 'Noise Reduction']
    );

    this.renderStackedAreaD3('viz-plot-intro');
  }

  renderStackedAreaD3(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    // Generate data
    const data = [];
    for (let year = 2025; year <= 2050; year++) {
      const progress = (year - 2025) / 25;
      data.push({
        year,
        'Physical Activity': 1.2 + progress * 3.5 + Math.random() * 0.5,
        'Air Quality': 0.8 + progress * 2.2 + Math.random() * 0.3,
        'Energy Savings': 0.5 + progress * 1.8 + Math.random() * 0.4,
        'Noise Reduction': 0.3 + progress * 1.2 + Math.random() * 0.2
      });
    }

    // Setup SVG - Use parent container dimensions
    const margin = { top: 40, right: 30, bottom: 60, left: 80 };
    const containerWidth = container.clientWidth || container.parentElement.clientWidth || 800;
    const containerHeight = container.clientHeight || container.parentElement.clientHeight || 500;
    const width = Math.max(containerWidth - margin.left - margin.right, 400);
    const height = Math.max(containerHeight - margin.top - margin.bottom, 300);

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Color palette - Nature/Climate theme
    const colorMap = {
      'Physical Activity': { base: '#10B981', gradient: '#34D399' },
      'Air Quality': { base: '#3B82F6', gradient: '#60A5FA' },
      'Energy Savings': { base: '#06B6D4', gradient: '#22D3EE' },
      'Noise Reduction': { base: '#8B5CF6', gradient: '#A78BFA' }
    };

    // Define gradients
    const defs = svg.append('defs');
    Object.entries(colorMap).forEach(([key, color]) => {
      const gradientId = `gradient-${key.replace(/\s+/g, '-')}`;
      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color.gradient)
        .attr('stop-opacity', 0.8);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color.base)
        .attr('stop-opacity', 0.4);
    });

    // Stack data
    const keys = ['Physical Activity', 'Air Quality', 'Energy Savings', 'Noise Reduction'];
    const stack = d3.stack()
      .keys(keys)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    const series = stack(data);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([2025, 2050])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(series, d => d3.max(d, d => d[1]))])
      .nice()
      .range([height, 0]);

    // Area generator with smooth curves
    const area = d3.area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    // Draw areas
    const areas = g.selectAll('.area')
      .data(series)
      .join('path')
      .attr('class', 'area')
      .attr('fill', d => `url(#gradient-${d.key.replace(/\s+/g, '-')})`)
      .attr('opacity', 1)
      .style('cursor', 'pointer')
      .attr('d', area);

    // Grow animation from left to right
    areas.each(function() {
      const path = d3.select(this);
      const totalLength = this.getTotalLength();

      path
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeQuadInOut)
        .attr('stroke-dashoffset', 0)
        .on('end', function() {
          d3.select(this).attr('stroke-dasharray', 'none');
        });
    });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => d.toString()).ticks(6))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6B7A8A');

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `£${d}B`))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#6B7A8A');

    // Axis labels
    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + 45})`)
      .style('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', '#4A5568')
      .style('font-weight', '500')
      .text('Year');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -height / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', '#4A5568')
      .style('font-weight', '500')
      .text('Million GBP (Cumulative)');

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .style('position', 'fixed')
      .style('opacity', 0)
      .style('background', 'rgba(255, 255, 255, 0.95)')
      .style('backdrop-filter', 'blur(12px)')
      .style('border', '1px solid rgba(0, 0, 0, 0.1)')
      .style('border-radius', '12px')
      .style('padding', '12px 16px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('box-shadow', '0 8px 24px rgba(0, 0, 0, 0.12)')
      .style('z-index', '1000')
      .style('font-family', 'Inter, sans-serif');

    const tooltipLine = g.append('line')
      .attr('stroke', '#4A5568')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0)
      .attr('y1', 0)
      .attr('y2', height);

    // Interaction overlay
    const overlay = g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'crosshair');

    let hoveredArea = null;

    overlay.on('mousemove', function(event) {
      const [mouseX, mouseY] = d3.pointer(event);
      const year = Math.round(xScale.invert(mouseX));
      const dataPoint = data.find(d => d.year === year);

      if (!dataPoint) return;

      tooltipLine.attr('x1', xScale(year))
        .attr('x2', xScale(year))
        .attr('opacity', 1);

      // Find which area is hovered
      let newHoveredArea = null;
      for (const key of keys) {
        const seriesData = series.find(s => s.key === key);
        if (!seriesData) continue;

        const point = seriesData.find(p => p.data.year === year);
        if (!point) continue;

        const y0 = yScale(point[0]);
        const y1 = yScale(point[1]);

        if (mouseY >= y1 && mouseY <= y0) {
          newHoveredArea = key;
          break;
        }
      }

      // Update area opacities
      if (newHoveredArea !== hoveredArea) {
        hoveredArea = newHoveredArea;
        areas.transition().duration(200)
          .attr('opacity', d => (hoveredArea === null || d.key === hoveredArea ? 1 : 0.3));
      }

      // Show tooltip
      if (hoveredArea) {
        const value = dataPoint[hoveredArea];
        tooltip
          .style('opacity', 1)
          .style('left', `${event.pageX + 15}px`)
          .style('top', `${event.pageY - 40}px`)
          .html(`
            <div style="font-weight: 600; margin-bottom: 4px;">${hoveredArea}</div>
            <div style="color: #6B7A8A;">Year: ${year}</div>
            <div style="color: #10B981; font-weight: 600;">£${value.toFixed(2)}B</div>
          `);
      }
    });

    overlay.on('mouseleave', () => {
      tooltipLine.attr('opacity', 0);
      tooltip.style('opacity', 0);
      hoveredArea = null;
      areas.transition().duration(200).attr('opacity', 1);
    });

    // Cleanup on section change
    const cleanupHandler = () => {
      tooltip.remove();
    };
    window.addEventListener('storyChange', cleanupHandler, { once: true });
  }

  renderWarmHomes() {
    this.updateMeta(
      'Housing Comfort Benefits Per Household',
      'Excess cold · Dampness · Overheating prevention',
      'Warm Homes',
      'Comparing housing co-benefits between two contrasting local authorities',
      ['Excess Cold', 'Dampness', 'Excess Heat']
    );

    this.renderHouseShapeViz('viz-plot-warm');
  }

  renderHouseShapeViz(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    // Data for two contrasting areas
    const data = [
      {
        name: 'Northern City',
        excessCold: 0.42,
        dampness: 0.08,
        excessHeat: 0.01
      },
      {
        name: 'Southern Town',
        excessCold: 0.18,
        dampness: 0.03,
        excessHeat: 0.005
      }
    ];

    // Color palette
    const colors = {
      excessCold: { base: '#3B82F6', light: '#60A5FA' },
      dampness: { base: '#14B8A6', light: '#2DD4BF' },
      excessHeat: { base: '#F97316', light: '#FB923C' }
    };

    // Setup SVG
    const margin = { top: 60, right: 40, bottom: 80, left: 40 };
    const containerWidth = container.clientWidth || container.parentElement.clientWidth || 800;
    const containerHeight = container.clientHeight || container.parentElement.clientHeight || 500;
    const width = Math.max(containerWidth - margin.left - margin.right, 400);
    const height = Math.max(containerHeight - margin.top - margin.bottom, 300);

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Calculate house dimensions
    const houseWidth = Math.min(width / 2.5, 250);
    const houseBodyHeight = height * 0.6;
    const roofHeight = height * 0.2;
    const spacing = (width - houseWidth * 2) / 3;

    // Get max total value for scaling
    const maxTotal = d3.max(data, d => d.excessCold + d.dampness + d.excessHeat);

    // Create gradients
    const defs = svg.append('defs');
    Object.entries(colors).forEach(([key, color]) => {
      const gradientId = `house-gradient-${key}`;
      const gradient = defs.append('linearGradient')
        .attr('id', gradientId)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');

      gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', color.light)
        .attr('stop-opacity', 0.9);

      gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', color.base)
        .attr('stop-opacity', 1);
    });

    // Function to create house path
    const createHousePath = (x, y, width, bodyHeight, roofHeight) => {
      const roofPeakX = x + width / 2;
      const roofPeakY = y;
      const roofLeftX = x;
      const roofLeftY = y + roofHeight;
      const roofRightX = x + width;
      const roofRightY = y + roofHeight;
      const bottomLeftX = x;
      const bottomLeftY = y + roofHeight + bodyHeight;
      const bottomRightX = x + width;
      const bottomRightY = y + roofHeight + bodyHeight;

      return `
        M ${roofPeakX},${roofPeakY}
        L ${roofRightX},${roofRightY}
        L ${bottomRightX},${bottomRightY}
        L ${bottomLeftX},${bottomLeftY}
        L ${roofLeftX},${roofLeftY}
        Z
      `;
    };

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .style('position', 'fixed')
      .style('opacity', 0)
      .style('background', 'rgba(255, 255, 255, 0.98)')
      .style('backdrop-filter', 'blur(12px)')
      .style('border', '1px solid rgba(0, 0, 0, 0.1)')
      .style('border-radius', '12px')
      .style('padding', '12px 16px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('box-shadow', '0 8px 24px rgba(0, 0, 0, 0.15)')
      .style('z-index', '1000')
      .style('font-family', 'Inter, sans-serif');

    // Draw houses
    data.forEach((house, i) => {
      const x = spacing + i * (houseWidth + spacing);
      const y = 0;

      const total = house.excessCold + house.dampness + house.excessHeat;
      const scale = total / maxTotal;

      // House group
      const houseGroup = g.append('g').attr('class', 'house-group');

      // House outline
      const housePath = createHousePath(x, y, houseWidth, houseBodyHeight, roofHeight);

      houseGroup.append('path')
        .attr('d', housePath)
        .attr('fill', 'none')
        .attr('stroke', '#D1D5DB')
        .attr('stroke-width', 3)
        .attr('stroke-linejoin', 'round');

      // Calculate layer heights
      const totalFilledHeight = houseBodyHeight * scale;
      const excessColdHeight = (house.excessCold / total) * totalFilledHeight;
      const dampnessHeight = (house.dampness / total) * totalFilledHeight;
      const excessHeatHeight = (house.excessHeat / total) * totalFilledHeight;

      // Create clip path for house shape
      const clipId = `house-clip-${i}`;
      defs.append('clipPath')
        .attr('id', clipId)
        .append('rect')
        .attr('x', x)
        .attr('y', y + roofHeight)
        .attr('width', houseWidth)
        .attr('height', houseBodyHeight);

      // Layer data
      const layers = [
        {
          key: 'excessCold',
          label: 'Excess Cold',
          value: house.excessCold,
          height: excessColdHeight,
          color: 'excessCold',
          y: y + roofHeight + houseBodyHeight - excessColdHeight
        },
        {
          key: 'dampness',
          label: 'Dampness',
          value: house.dampness,
          height: dampnessHeight,
          color: 'dampness',
          y: y + roofHeight + houseBodyHeight - excessColdHeight - dampnessHeight
        },
        {
          key: 'excessHeat',
          label: 'Excess Heat',
          value: house.excessHeat,
          height: excessHeatHeight,
          color: 'excessHeat',
          y: y + roofHeight + houseBodyHeight - excessColdHeight - dampnessHeight - excessHeatHeight
        }
      ];

      // Draw layers with animation
      layers.forEach(layer => {
        const rect = houseGroup.append('rect')
          .attr('x', x)
          .attr('y', y + roofHeight + houseBodyHeight)
          .attr('width', houseWidth)
          .attr('height', 0)
          .attr('fill', `url(#house-gradient-${layer.color})`)
          .attr('clip-path', `url(#${clipId})`)
          .attr('opacity', 0.9)
          .style('cursor', 'pointer');

        // Animate fill rising
        rect.transition()
          .delay(i * 400)
          .duration(1500)
          .ease(d3.easeCubicOut)
          .attr('y', layer.y)
          .attr('height', layer.height);

        // Hover interactions
        rect.on('mouseover', function(event) {
          d3.select(this).transition().duration(200).attr('opacity', 1);

          tooltip
            .style('opacity', 1)
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 40}px`)
            .html(`
              <div style="font-weight: 600; margin-bottom: 4px; color: ${colors[layer.color].base};">
                ${layer.label}
              </div>
              <div style="color: #6B7280;">Area: ${house.name}</div>
              <div style="color: #059669; font-weight: 600; margin-top: 4px;">
                £${layer.value.toFixed(2)}M per household
              </div>
            `);
        })
        .on('mousemove', function(event) {
          tooltip
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 40}px`);
        })
        .on('mouseleave', function() {
          d3.select(this).transition().duration(200).attr('opacity', 0.9);
          tooltip.style('opacity', 0);
        });
      });

      // Add house label
      houseGroup.append('text')
        .attr('x', x + houseWidth / 2)
        .attr('y', y + roofHeight + houseBodyHeight + 30)
        .attr('text-anchor', 'middle')
        .style('font-size', '15px')
        .style('font-weight', '600')
        .style('fill', '#1F2937')
        .text(house.name);

      // Add total value label
      houseGroup.append('text')
        .attr('x', x + houseWidth / 2)
        .attr('y', y + roofHeight + houseBodyHeight + 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('fill', '#6B7280')
        .text(`£${total.toFixed(2)}M total`);

      // Add decorative door
      const doorWidth = houseWidth * 0.2;
      const doorHeight = houseBodyHeight * 0.3;
      const doorX = x + houseWidth / 2 - doorWidth / 2;
      const doorY = y + roofHeight + houseBodyHeight - doorHeight;

      houseGroup.append('rect')
        .attr('x', doorX)
        .attr('y', doorY)
        .attr('width', doorWidth)
        .attr('height', doorHeight)
        .attr('fill', '#8B5A3C')
        .attr('rx', 4)
        .attr('opacity', 0)
        .transition()
        .delay(i * 400 + 1500)
        .duration(600)
        .attr('opacity', 0.8);

      // Add decorative window
      const windowSize = houseWidth * 0.15;
      const windowX = x + houseWidth * 0.25 - windowSize / 2;
      const windowY = y + roofHeight + houseBodyHeight * 0.3;

      houseGroup.append('rect')
        .attr('x', windowX)
        .attr('y', windowY)
        .attr('width', windowSize)
        .attr('height', windowSize)
        .attr('fill', '#93C5FD')
        .attr('rx', 3)
        .attr('opacity', 0)
        .transition()
        .delay(i * 400 + 1700)
        .duration(600)
        .attr('opacity', 0.6);

      houseGroup.append('line')
        .attr('x1', windowX + windowSize / 2)
        .attr('y1', windowY)
        .attr('x2', windowX + windowSize / 2)
        .attr('y2', windowY + windowSize)
        .attr('stroke', '#60A5FA')
        .attr('stroke-width', 1)
        .attr('opacity', 0)
        .transition()
        .delay(i * 400 + 1700)
        .duration(600)
        .attr('opacity', 0.8);

      houseGroup.append('line')
        .attr('x1', windowX)
        .attr('y1', windowY + windowSize / 2)
        .attr('x2', windowX + windowSize)
        .attr('y2', windowY + windowSize / 2)
        .attr('stroke', '#60A5FA')
        .attr('stroke-width', 1)
        .attr('opacity', 0)
        .transition()
        .delay(i * 400 + 1700)
        .duration(600)
        .attr('opacity', 0.8);
    });

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${width / 2 - 120}, ${height + 20})`);

    const legendData = [
      { label: 'Excess Cold', color: colors.excessCold.base },
      { label: 'Dampness', color: colors.dampness.base },
      { label: 'Excess Heat', color: colors.excessHeat.base }
    ];

    legendData.forEach((item, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(${i * 90}, 0)`);

      legendItem.append('rect')
        .attr('width', 12)
        .attr('height', 12)
        .attr('fill', item.color)
        .attr('rx', 2);

      legendItem.append('text')
        .attr('x', 18)
        .attr('y', 10)
        .style('font-size', '11px')
        .style('fill', '#6B7280')
        .text(item.label);
    });

    // Cleanup on section change
    const cleanupHandler = () => {
      tooltip.remove();
    };
    window.addEventListener('storyChange', cleanupHandler, { once: true });
  }

  renderCleanActive() {
    this.updateMeta(
      'Health Benefits Over Time',
      'Physical activity and air quality improvements',
      'Active Streets',
      'Health-related co-benefits dominate the positive impact of net-zero transition',
      ['Physical Activity', 'Air Quality', 'Hospital Admissions Prevented']
    );

    this.renderActiveStreetsViz('viz-plot-active');
  }

  renderActiveStreetsViz(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear previous content
    container.innerHTML = '';

    // Generate realistic data
    const data = [];
    for (let year = 2025; year <= 2050; year++) {
      const progress = (year - 2025) / 25;
      // Physical activity has steady, steep growth
      const physicalActivity = 0.4 + progress * 6.5 + Math.sin(progress * Math.PI) * 0.3;
      // Air quality improves steadily
      const airQuality = 0.35 + progress * 1.2 + Math.random() * 0.15;
      data.push({ year, physicalActivity, airQuality });
    }

    // Setup SVG
    const margin = { top: 40, right: 40, bottom: 60, left: 80 };
    const containerWidth = container.clientWidth || container.parentElement.clientWidth || 800;
    const containerHeight = container.clientHeight || container.parentElement.clientHeight || 500;
    const width = Math.max(containerWidth - margin.left - margin.right, 400);
    const height = Math.max(containerHeight - margin.top - margin.bottom, 300);

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    // Create gradients
    const defs = svg.append('defs');

    // Sky gradient (background) - transitions from hazy grey to clear blue
    const skyGradient = defs.append('linearGradient')
      .attr('id', 'sky-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');

    skyGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#B0B8C0')
      .attr('stop-opacity', 0.3);

    skyGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#87CEEB')
      .attr('stop-opacity', 0.8);

    // Hill gradient - lush green to teal
    const hillGradient = defs.append('linearGradient')
      .attr('id', 'hill-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    hillGradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#10B981')
      .attr('stop-opacity', 0.9);

    hillGradient.append('stop')
      .attr('offset', '50%')
      .attr('stop-color', '#14B8A6')
      .attr('stop-opacity', 0.7);

    hillGradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#059669')
      .attr('stop-opacity', 0.5);

    // Background rectangle with sky gradient
    svg.append('rect')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('fill', 'url(#sky-gradient)');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([2025, 2050])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.physicalActivity)])
      .nice()
      .range([height, 0]);

    // Area generator with smooth curves
    const area = d3.area()
      .x(d => xScale(d.year))
      .y0(height)
      .y1(d => yScale(d.physicalActivity))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Line generator for the top edge
    const line = d3.line()
      .x(d => xScale(d.year))
      .y(d => yScale(d.physicalActivity))
      .curve(d3.curveCatmullRom.alpha(0.5));

    // Draw the hill (area)
    const hillPath = g.append('path')
      .datum(data)
      .attr('class', 'hill-area')
      .attr('fill', 'url(#hill-gradient)')
      .attr('d', area);

    // Draw the path outline
    const pathOutline = g.append('path')
      .datum(data)
      .attr('class', 'hill-outline')
      .attr('fill', 'none')
      .attr('stroke', '#059669')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Get total path length for animation
    const totalLength = pathOutline.node().getTotalLength();

    // Animate the path drawing
    hillPath
      .attr('opacity', 0)
      .transition()
      .duration(2500)
      .ease(d3.easeQuadInOut)
      .attr('opacity', 1);

    pathOutline
      .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
      .attr('stroke-dashoffset', totalLength)
      .transition()
      .duration(2500)
      .ease(d3.easeQuadInOut)
      .attr('stroke-dashoffset', 0);

    // Add traveler (cyclist/runner icon)
    const travelerGroup = g.append('g')
      .attr('class', 'traveler')
      .attr('opacity', 0);

    // Simple cyclist icon (circle + emoji)
    travelerGroup.append('circle')
      .attr('r', 8)
      .attr('fill', '#F59E0B')
      .attr('stroke', '#FFF')
      .attr('stroke-width', 2);

    travelerGroup.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-size', '12px')
      .text('🚴');

    // Animate traveler along the path
    travelerGroup
      .transition()
      .delay(200)
      .duration(0)
      .attr('opacity', 1)
      .transition()
      .duration(2500)
      .ease(d3.easeQuadInOut)
      .attrTween('transform', () => {
        return (t) => {
          const point = pathOutline.node().getPointAtLength(t * totalLength);
          return `translate(${point.x}, ${point.y - 20})`;
        };
      });

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => d.toString()).ticks(6))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#4A5568');

    g.append('g')
      .call(d3.axisLeft(yScale).tickFormat(d => `£${d}M`))
      .selectAll('text')
      .style('font-size', '12px')
      .style('fill', '#4A5568');

    // Axis labels
    g.append('text')
      .attr('transform', `translate(${width / 2}, ${height + 45})`)
      .style('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', '#4A5568')
      .style('font-weight', '500')
      .text('Year');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -60)
      .attr('x', -height / 2)
      .style('text-anchor', 'middle')
      .style('font-size', '13px')
      .style('fill', '#4A5568')
      .style('font-weight', '500')
      .text('Physical Activity Benefit (Million GBP)');

    // Tooltip
    const tooltip = d3.select('body').append('div')
      .style('position', 'fixed')
      .style('opacity', 0)
      .style('background', 'rgba(255, 255, 255, 0.98)')
      .style('backdrop-filter', 'blur(12px)')
      .style('border', '1px solid rgba(0, 0, 0, 0.1)')
      .style('border-radius', '12px')
      .style('padding', '12px 16px')
      .style('font-size', '13px')
      .style('pointer-events', 'none')
      .style('box-shadow', '0 8px 24px rgba(0, 0, 0, 0.15)')
      .style('z-index', '1000')
      .style('font-family', 'Inter, sans-serif');

    // Vertical guideline
    const guideline = g.append('line')
      .attr('stroke', '#6B7280')
      .attr('stroke-width', 2)
      .attr('stroke-dasharray', '4,4')
      .attr('opacity', 0)
      .attr('y1', 0)
      .attr('y2', height);

    // Traveler marker for hover
    const hoverTraveler = g.append('g')
      .attr('class', 'hover-traveler')
      .attr('opacity', 0);

    hoverTraveler.append('circle')
      .attr('r', 10)
      .attr('fill', '#EF4444')
      .attr('stroke', '#FFF')
      .attr('stroke-width', 3);

    // Interactive overlay
    const overlay = g.append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', 'none')
      .attr('pointer-events', 'all')
      .style('cursor', 'crosshair');

    overlay.on('mousemove', function(event) {
      const [mouseX] = d3.pointer(event);
      const year = Math.round(xScale.invert(mouseX));
      const dataPoint = data.find(d => d.year === year);

      if (!dataPoint) return;

      const x = xScale(year);
      const y = yScale(dataPoint.physicalActivity);

      // Show guideline
      guideline
        .attr('x1', x)
        .attr('x2', x)
        .attr('opacity', 1);

      // Show hover traveler
      hoverTraveler
        .attr('transform', `translate(${x}, ${y})`)
        .attr('opacity', 1);

      // Calculate hospital admissions prevented (example conversion)
      const admissionsPrevented = Math.round(dataPoint.physicalActivity * 100);

      // Show tooltip
      tooltip
        .style('opacity', 1)
        .style('left', `${event.pageX + 15}px`)
        .style('top', `${event.pageY - 60}px`)
        .html(`
          <div style="font-weight: 600; margin-bottom: 6px; color: #10B981;">
            Physical Activity Benefit
          </div>
          <div style="color: #4A5568; margin-bottom: 4px;">Year: ${year}</div>
          <div style="color: #059669; font-weight: 600;">Health Value: £${dataPoint.physicalActivity.toFixed(2)}M</div>
          <div style="color: #6B7280; font-size: 12px; margin-top: 4px;">
            ≈ ${admissionsPrevented} hospital admissions prevented
          </div>
        `);
    });

    overlay.on('mouseleave', () => {
      guideline.attr('opacity', 0);
      hoverTraveler.attr('opacity', 0);
      tooltip.style('opacity', 0);
    });

    // Cleanup on section change
    const cleanupHandler = () => {
      tooltip.remove();
    };
    window.addEventListener('storyChange', cleanupHandler, { once: true });
  }

  renderQuietCities() {
    this.updateMeta(
      'Top Areas by Noise Reduction Benefits',
      'Million GBP per household from quieter streets',
      'Quiet Cities',
      'Urban areas with highest potential gains from noise reduction policies',
      ['Noise Benefits', 'Per Household', 'Top 8 Areas']
    );

    const traces = [{
      x: noiseRanking.noise_per_hh,
      y: noiseRanking.la,
      type: 'bar',
      orientation: 'h',
      name: 'Noise Benefits',
      marker: {
        color: noiseRanking.noise_per_hh.map((val, i) => {
          const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F3F0FF', '#F5F3FF', '#FAF5FF'];
          return colors[i];
        }),
        line: { color: '#7C3AED', width: 1 }
      },
      text: noiseRanking.noise_per_hh.map(v => `£${v.toFixed(2)}M`),
      textposition: 'outside',
      textfont: { color: '#4A5568', size: 10 }
    }];

    const layout = {
      ...this.lightTheme,
      margin: { t: 30, r: 70, b: 50, l: 90 },
      xaxis: {
        ...this.lightTheme.xaxis,
        title: { text: 'Million GBP per Household', font: { size: 12 } }
      },
      yaxis: {
        ...this.lightTheme.yaxis,
        autorange: 'reversed',
        tickfont: { size: 10 }
      },
      showlegend: false
    };

    Plotly.react('viz-plot-quiet', traces, layout, this.plotlyConfig);
  }

  renderTradeOffs() {
    this.updateMeta(
      'The Rebound Effect: When Benefits Turn Negative',
      'Congestion, safety, and hassle costs over time',
      'Trade-offs',
      'Some transport benefits decrease as EV adoption increases driving demand',
      ['Congestion', 'Road Safety', 'Hassle Costs']
    );

    const traces = [
      {
        x: years,
        y: nationalSeries.congestion,
        mode: 'lines+markers',
        name: 'Congestion',
        line: { width: 3, color: '#F59E0B', shape: 'spline' },
        marker: { size: 5 }
      },
      {
        x: years,
        y: nationalSeries.road_safety,
        mode: 'lines+markers',
        name: 'Road Safety',
        line: { width: 3, color: '#3B82F6', shape: 'spline' },
        marker: { size: 5 }
      },
      {
        x: years,
        y: nationalSeries.hassle_costs,
        mode: 'lines+markers',
        name: 'Hassle Costs',
        line: { width: 3, color: '#F43F5E', shape: 'spline' },
        marker: { size: 5 }
      }
    ];

    const layout = {
      ...this.lightTheme,
      margin: { t: 30, r: 20, b: 50, l: 70 },
      xaxis: {
        ...this.lightTheme.xaxis,
        title: { text: 'Year', font: { size: 12 } },
        tickmode: 'linear',
        tick0: 2025,
        dtick: 5
      },
      yaxis: {
        ...this.lightTheme.yaxis,
        title: { text: 'Million GBP (NPV)', font: { size: 12 } },
        zeroline: true,
        zerolinecolor: 'rgba(244, 63, 94, 0.5)',
        zerolinewidth: 2
      },
      legend: {
        orientation: 'h',
        y: 1.12,
        x: 0,
        font: { size: 10 }
      },
      shapes: [{
        type: 'rect',
        xref: 'paper',
        yref: 'y',
        x0: 0,
        x1: 1,
        y0: -3000,
        y1: 0,
        fillcolor: 'rgba(244, 63, 94, 0.05)',
        line: { width: 0 }
      }],
      annotations: [{
        x: 2043,
        y: -1200,
        text: '⚠️ Negative Zone',
        showarrow: false,
        font: { size: 11, color: '#F43F5E' }
      }],
      hovermode: 'x unified'
    };

    Plotly.react('viz-plot-tradeoffs', traces, layout, this.plotlyConfig);
  }

  renderOutro() {
    this.updateMeta(
      'Where Should We Focus?',
      'Distribution of co-benefit categories',
      'Summary',
      'A breakdown of where the value lies in the net-zero transition',
      ['Health', 'Housing', 'Environment', 'Transport']
    );

    const trace = {
      values: [55, 20, 15, 10],
      labels: ['Health & Wellbeing', 'Housing Comfort', 'Noise & Environment', 'Transport (Net)'],
      type: 'pie',
      hole: 0.5,
      textinfo: 'label+percent',
      textposition: 'outside',
      textfont: { size: 11, color: '#4A5568' },
      marker: {
        colors: ['#10B981', '#F59E0B', '#8B5CF6', '#3B82F6'],
        line: { color: '#FFFFFF', width: 3 }
      },
      pull: [0.05, 0, 0, 0]
    };

    const layout = {
      ...this.lightTheme,
      margin: { t: 40, r: 60, b: 40, l: 60 },
      showlegend: false,
      annotations: [{
        text: '<b>2025-2050</b><br>Total Benefits',
        x: 0.5,
        y: 0.5,
        font: { size: 13, color: '#1A202C' },
        showarrow: false
      }]
    };

    // Outro doesn't have its own plot div, so we skip or use intro
    // For now, skip rendering on outro
  }
}

// ============================================
// CURSOR TOGGLE UI - COLLAPSIBLE + AUTO MODE
// ============================================
function createCursorToggle(cursorManager) {
  const toggle = document.createElement('div');
  toggle.className = 'cursor-toggle collapsed';
  toggle.innerHTML = `
    <button class="cursor-toggle-trigger" title="Cursor Options">
      <span class="trigger-icon">🎨</span>
      <span class="trigger-label">Cursor</span>
    </button>
    <div class="cursor-toggle-panel">
      <div class="cursor-toggle-label">Cursor Style</div>
      <div class="cursor-toggle-buttons">
        <button class="cursor-btn active" data-cursor="auto" data-name="Auto (per section)" title="Auto - Changes per section">🔄</button>
        <button class="cursor-btn" data-cursor="none" data-name="Default" title="Default Cursor">🖱️</button>
        <button class="cursor-btn" data-cursor="leaf" data-name="Leaf Trail" title="Leaf Trail">🍃</button>
        <button class="cursor-btn" data-cursor="spark" data-name="Energy Spark" title="Energy Spark">⚡</button>
        <button class="cursor-btn" data-cursor="ripple" data-name="Water Ripple" title="Water Ripple">💧</button>
        <button class="cursor-btn" data-cursor="galaxy" data-name="Galaxy Orbit" title="Galaxy Orbit">🌟</button>
        <button class="cursor-btn" data-cursor="brush" data-name="Paint Brush" title="Paint Brush">🎨</button>
        <button class="cursor-btn" data-cursor="fire" data-name="Fire Trail" title="Fire Trail">🔥</button>
        <button class="cursor-btn" data-cursor="snow" data-name="Snowflakes" title="Snowflakes">❄️</button>
      </div>
    </div>
  `;
  document.body.appendChild(toggle);

  // Toggle expand/collapse
  const trigger = toggle.querySelector('.cursor-toggle-trigger');
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle.classList.toggle('collapsed');
  });
  
  // Collapse when clicking outside
  document.addEventListener('click', (e) => {
    if (!toggle.contains(e.target)) {
      toggle.classList.add('collapsed');
    }
  });

  // Cursor button handlers
  toggle.querySelectorAll('.cursor-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggle.querySelectorAll('.cursor-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      cursorManager.setManualMode(btn.dataset.cursor);
      
      // Update trigger icon to match selection
      trigger.querySelector('.trigger-icon').textContent = btn.textContent;
    });
  });
  
  return toggle;
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all systems
  const cursorManager = new CreativeCursorManager();
  const scrollManager = new MagneticScrollManager();
  const particleSystem = new ParticleSystem();
  const vizManager = new VizManager();
  
  // Create cursor toggle UI
  const cursorToggle = createCursorToggle(cursorManager);
  
  // Listen for section changes to auto-switch cursor
  window.addEventListener('storyChange', (e) => {
    cursorManager.onSectionChange(e.detail.story);
  });
  
  // Set auto mode as default - trigger initial cursor
  cursorManager.manualMode = 'auto';
  cursorManager.onSectionChange('hero');
  
  console.log('🌍 Net-zero Co-Benefits Scrollytelling initialized!');
  console.log('⌨️ Use Arrow Keys, Space, PageUp/Down, or numbers 1-7 to navigate');
  console.log('🎨 Cursor changes automatically per section! Click the cursor button to customize.');
});
