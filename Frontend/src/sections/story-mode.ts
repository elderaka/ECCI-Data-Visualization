import type { Map as MapLibreMap } from 'maplibre-gl';
import { LAPORAN_SECTIONS } from './Laporan/index';
import { flyToPosition } from '../story-scroll-helpers';
import type { LODControl } from '../lod-control';
export type AppMode = 'story' | 'free';
let currentStoryModeInstance: StoryMode | null = null;
export function isStoryModeActive(): boolean {
  return currentStoryModeInstance?.getMode() === 'story';
}
export class StoryMode {
  private map: MapLibreMap;
  private lodControl: LODControl;
  private mode: AppMode = 'story';
  private currentSection: number = 0;
  private scrollContainer: HTMLElement;
  private sectionsContainer: HTMLElement;
  private mapContainer: HTMLElement;
  private mapOverlay: HTMLElement;
  private observer: IntersectionObserver | null = null;
  private microwaveAnimationId: number | null = null;

  constructor(map: MapLibreMap, lodControl: LODControl) {
    this.map = map;
    this.lodControl = lodControl;
    this.scrollContainer = document.getElementById('scroll-container')!;
    this.sectionsContainer = document.getElementById('sections-container')!;
    this.mapContainer = document.getElementById('map')!;
    currentStoryModeInstance = this;
    this.mapOverlay = document.createElement('div');
    this.mapOverlay.id = 'map-overlay';
    this.mapOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: #0f172a;
      opacity: 0;
      pointer-events: none;
      transition: opacity 1s ease;
      z-index: 1;
    `;
    this.mapContainer.appendChild(this.mapOverlay);
    this.init();
  }
  private init(): void {
    this.createSections();
    this.setMode('story');
    this.setupScrollListener();
    this.goToSection(0);
  }
  private createSections(): void {
    this.sectionsContainer.innerHTML = '';
    LAPORAN_SECTIONS.forEach((section, index) => {
      const sectionEl = document.createElement('section');
      sectionEl.className = 'story-section';
      sectionEl.dataset.section = index.toString();
      
      // Apply align (horizontal) and justify (vertical) to section
      const align = section.align || 'start';
      const justify = section.justify || 'start';
      sectionEl.style.justifyContent = align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center';
      sectionEl.style.alignItems = justify === 'start' ? 'flex-start' : justify === 'end' ? 'flex-end' : 'center';
      
      const content = document.createElement('div');
      content.className = 'section-content';
      
      // Apply custom width and margins if specified
      if (section.width) {
        content.style.maxWidth = section.width;
      }
      if (section.marginLeft) {
        content.style.marginLeft = section.marginLeft;
      }
      if (section.marginTop) {
        content.style.marginTop = section.marginTop;
      }
      
      // Render content based on type
      let contentHTML = `<h1>${section.title}</h1>`;
      
      section.content.forEach(contentItem => {
        if (contentItem.type === 'text') {
          if (contentItem.heading) {
            contentHTML += `<h2>${contentItem.heading}</h2>`;
          }
          if (contentItem.subheading) {
            contentHTML += `<h3>${contentItem.subheading}</h3>`;
          }
          if (contentItem.body) {
            contentHTML += `<p>${contentItem.body}</p>`;
          }
        } else if (contentItem.type === 'list' && contentItem.items) {
          contentHTML += '<ul>';
          contentItem.items.forEach(item => {
            contentHTML += `<li>${item}</li>`;
          });
          contentHTML += '</ul>';
        } else if (contentItem.type === 'card-grid' && contentItem.cards) {
          contentHTML += '<div class="card-grid">';
          contentItem.cards.forEach(card => {
            contentHTML += `
              <div class="card">`;
            
            // Add icon or image if present
            if (card.icon) {
              contentHTML += `<div class="card-icon">${card.icon}</div>`;
            } else if (card.image) {
              contentHTML += `<img src="${card.image}" alt="${card.title}" class="card-image" />`;
            }
            
            contentHTML += `
                <h4>${card.title}</h4>
                <p>${card.description}</p>
              </div>
            `;
          });
          contentHTML += '</div>';
        } else if (contentItem.type === 'animation' && contentItem.items) {
          contentHTML += '<ul class="animated-list">';
          contentItem.items.forEach(item => {
            contentHTML += `<li>${item}</li>`;
          });
          contentHTML += '</ul>';
        }
      });
      
      if (index === LAPORAN_SECTIONS.length - 1) {
        contentHTML += `
          <button id="free-mode-btn" class="free-mode-button">
            Switch to Free Mode
          </button>
        `;
      }
      
      content.innerHTML = contentHTML;
      sectionEl.appendChild(content);
      this.sectionsContainer.appendChild(sectionEl);
    });
    const freeBtn = document.getElementById('free-mode-btn');
    if (freeBtn) {
      freeBtn.addEventListener('click', () => this.setMode('free'));
    }
  }
  private setupScrollListener(): void {
    const options = {
      root: this.scrollContainer,
      rootMargin: '0px',
      threshold: 0.5, 
    };
    this.observer = new IntersectionObserver((entries) => {
      if (this.mode !== 'story') return;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionIndex = parseInt(entry.target.getAttribute('data-section') || '0');
          if (sectionIndex !== this.currentSection) {
            
            this.goToSection(sectionIndex);
          }
        }
      });
    }, options);
    const sections = this.sectionsContainer.querySelectorAll('.story-section');
    sections.forEach((section) => {
      this.observer?.observe(section);
    });
  }
  private goToSection(index: number): void {
    if (index < 0 || index >= LAPORAN_SECTIONS.length) return;
    this.currentSection = index;
    const section = LAPORAN_SECTIONS[index];
    
    // Stop microwave animation if active
    this.stopMicrowaveAnimation();
    
    // Check if section is before tech stack (section 0-6)
    if (index < 7) {
      flyToPosition(this.map, {
        center: [-5, 55],
        zoom: 6.5,
        pitch: 60,
        bearing: this.map.getBearing(),
        timestamp: new Date().toISOString(),
      }, {
        duration: 2000,
        essential: true,
      });
      
      // Start animation after transition
      setTimeout(() => {
        this.startMicrowaveAnimation();
      }, 2000);
    } else if (section.cameraPosition) {
      // Normal camera movement only if cameraPosition is specified
      flyToPosition(this.map, section.cameraPosition, {
        duration: 2000,
        essential: true,
      });
    }
    // If no cameraPosition specified, camera stays at current position
    
    const overlayOpacity = 1 - (section.mapOpacity || 1);
    this.mapOverlay.style.opacity = overlayOpacity.toString();
  }

  private startMicrowaveAnimation(): void {
    let bearing = this.map.getBearing(); // Start from current bearing for seamless transition
    
    const animate = () => {
      bearing += 0.03; // Rotation speed (degrees per frame)
      if (bearing >= 360) bearing -= 360;
      
      this.map.setBearing(bearing);
      
      this.microwaveAnimationId = requestAnimationFrame(animate);
    };
    
    animate();
  }

  private stopMicrowaveAnimation(): void {
    if (this.microwaveAnimationId !== null) {
      cancelAnimationFrame(this.microwaveAnimationId);
      this.microwaveAnimationId = null;
    }
  }

  public resetToFirstSection(): void {
    // Fly camera to section 0
    this.goToSection(0);
    this.currentSection = 0;
  }

  public setMode(mode: AppMode): void {
    
    this.mode = mode;
    
    if (mode === 'story') {
      this.scrollContainer.style.display = 'block';
      this.mapContainer.style.pointerEvents = 'none';
      this.map.scrollZoom.disable();
      this.map.boxZoom.disable();
      this.map.dragRotate.disable();
      this.map.dragPan.disable();
      this.map.keyboard.disable();
      this.map.doubleClickZoom.disable();
      this.map.touchZoomRotate.disable();
      // Remove bounds restriction for story mode
      this.map.setMaxBounds(null as any);
      
      // Use automatic zoom-based layer switching in story mode
      this.lodControl.setAutomaticMode();
      document.body.classList.add('story-mode');
      document.body.classList.remove('free-mode');
      this.hideMapControls();
    } else {
      this.scrollContainer.style.display = 'none';
      this.mapContainer.style.pointerEvents = 'auto';
      this.mapOverlay.style.opacity = '0';
      this.map.scrollZoom.enable();
      this.map.boxZoom.enable();
      this.map.dragRotate.enable();
      this.map.dragPan.enable();
      this.map.keyboard.enable();
      this.map.doubleClickZoom.enable();
      this.map.touchZoomRotate.enable();
      this.map.setMaxPitch(60);
      
      // Restore bounds restriction for free mode
      this.map.setMaxBounds([
        [-30, 40], // Southwest coordinates (wide padding for low zoom)
        [20, 70]   // Northeast coordinates (wide padding for low zoom)
      ] as any);
      // Keep LOD control in automatic mode (user can switch to manual by clicking buttons)
      // No need to call anything - it stays in automatic mode by default
      
      this.showMapControls();
      document.body.classList.add('free-mode');
      document.body.classList.remove('story-mode');
    }
  }
  private showMapControls(): void {
    const controls = document.querySelectorAll('.maplibregl-ctrl-group');
    controls.forEach((control: any) => {
      control.style.transition = 'opacity 0.5s ease';
      control.style.opacity = '1';
      control.style.pointerEvents = 'auto';
    });
  }
  private hideMapControls(): void {
    const controls = document.querySelectorAll('.maplibregl-ctrl-group');
    controls.forEach((control: any) => {
      control.style.opacity = '0';
      control.style.pointerEvents = 'none';
    });
  }
  public getMode(): AppMode {
    return this.mode;
  }
  public getCurrentSection(): number {
    return this.currentSection;
  }
  public cleanup(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (currentStoryModeInstance === this) {
      currentStoryModeInstance = null;
    }
  }
}
