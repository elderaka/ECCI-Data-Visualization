import type { Map as MapLibreMap } from 'maplibre-gl';
import { LAPORAN_SECTIONS, CO_BENEFITS_SECTIONS } from './Laporan/index';
import type { LaporanSection, VizConfig } from './Laporan/types';
import { flyToPosition } from '../story-scroll-helpers';
import type { LODControl } from '../lod-control';
import {
  fetchNationalOverview,
  fetchHousingComparison,
  fetchNationalCategoryTimeseries,
  fetchTopAreasByField,
  fetchTradeOffsData
} from '../services/cobenefits-api';
import {
  renderStackedAreaD3,
  renderHouseShapeViz,
  renderActiveStreetsViz,
  type TimeSeriesData,
  type HousingComparisonData
} from '../visualizations/d3-cobenefits-viz';

// Declare Plotly as a global (loaded from CDN)
declare const Plotly: any;

export type AppMode = 'story' | 'free' | 'pick-map';
export type StoryType = 'cobenefits' | 'laporan';

let currentStoryModeInstance: StoryMode | null = null;
export function isStoryModeActive(): boolean {
  return currentStoryModeInstance?.getMode() === 'story';
}

export class StoryMode {
  private map: MapLibreMap;
  private lodControl: LODControl;
  private mode: AppMode = 'story';
  private storyType: StoryType = 'cobenefits';
  private currentSection: number = 0;
  private currentSubsection: number = 0; // Track subsection within a section
  private scrollContainer: HTMLElement;
  private sectionsContainer: HTMLElement;
  private mapContainer: HTMLElement;
  private mapOverlay: HTMLElement;
  private observer: IntersectionObserver | null = null;
  private microwaveAnimationId: number | null = null;
  private microwaveStartTimeout: number | null = null;
  private currentSections: LaporanSection[] = CO_BENEFITS_SECTIONS;
  private isAutoPlaying: boolean = false;
  private autoPlayInterval: number | null = null;
  private autoPlaySpeedMultiplier: number = 1; // 1 = normal, 0.5 = fast, 1.5 = slow
  private progressBar: HTMLElement | null = null;
  private keyboardHandler: ((e: KeyboardEvent) => void) | null = null;
  private hintBox: HTMLElement | null = null;

  private selectedArea: any = null; // SelectedArea from types

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
    this.setupKeyboardNavigation();
    this.createHintBox();
    this.goToSection(0);
  }

  /**
   * Helper to resolve dynamic section properties (title, content, camera, etc.)
   */
  private resolveProperty<T>(prop: T | ((area?: any) => T)): T {
    return typeof prop === 'function' ? prop(this.selectedArea) : prop;
  }

  /**
   * Set the selected area for dynamic content
   */
  public setSelectedArea(area: any): void {
    this.selectedArea = area;
    this.createSections(); // Re-render with new area
    this.setupScrollListener();
    this.goToSection(0);
  }

  /**
   * Switch between story types (co-benefits vs laporan/progress)
   */
  public setStoryType(type: StoryType): void {
    this.storyType = type;
    this.currentSections = type === 'cobenefits' ? CO_BENEFITS_SECTIONS : LAPORAN_SECTIONS;
    this.createSections();
    this.setupScrollListener();
    this.goToSection(0);
  }

  public getStoryType(): StoryType {
    return this.storyType;
  }

  private createSections(): void {
    this.sectionsContainer.innerHTML = '';
    
    this.currentSections.forEach((section, index) => {
      const sectionEl = document.createElement('section');
      sectionEl.className = 'story-section';
      sectionEl.dataset.section = index.toString();
      sectionEl.dataset.story = section.storyKey || section.id;
      
      // Apply theme class
      if (section.theme) {
        sectionEl.classList.add(`section-${section.theme}`);
      }
      
      // Apply layout class
      if (section.layout === 'scrolly') {
        sectionEl.classList.add('scrolly-section');
      } else if (section.layout === 'single-left') {
        sectionEl.classList.add('single-left-section');
      } else if (section.layout === 'stacked') {
        sectionEl.classList.add('stacked-section');
      }
      
      // Apply align (horizontal) and justify (vertical) to section
      const align = section.align || 'start';
      const justify = section.justify || 'start';
      sectionEl.style.justifyContent = align === 'start' ? 'flex-start' : align === 'end' ? 'flex-end' : 'center';
      sectionEl.style.alignItems = justify === 'start' ? 'flex-start' : justify === 'end' ? 'flex-end' : 'center';
      
      if (section.layout === 'scrolly') {
        // Two-column scrolly layout
        this.createScrollyLayout(sectionEl, section, index);
      } else if (section.layout === 'single-left') {
        // Single card on left column
        this.createSingleLeftLayout(sectionEl, section, index);
      } else if (section.layout === 'stacked') {
        // Vertically stacked cards
        this.createStackedLayout(sectionEl, section, index);
      } else {
        // Single column layout (original)
        this.createSingleLayout(sectionEl, section, index);
      }
      
      this.sectionsContainer.appendChild(sectionEl);
    });
    
    // Wire any "switch to free mode" buttons to the same handler as navbar
    const freeBtns = this.sectionsContainer.querySelectorAll('.js-free-mode-btn');
    freeBtns.forEach(btn => {
      btn.addEventListener('click', () => this.setMode('free'));
    });
  }

  /**
   * Create single-column layout (original style)
   */
  private createSingleLayout(sectionEl: HTMLElement, section: LaporanSection, index: number): void {
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
    
    content.innerHTML = this.renderSectionContent(section, index);
    sectionEl.appendChild(content);
  }

  /**
   * Create single-left layout (card on left column only)
   */
  private createSingleLeftLayout(sectionEl: HTMLElement, section: LaporanSection, index: number): void {
    const storyCard = document.createElement('article');
    storyCard.className = 'story-card';
    storyCard.innerHTML = this.renderStoryCard(section, index);
    sectionEl.appendChild(storyCard);
  }

  /**
   * Create stacked layout (vertically stacked cards)
   */
  private createStackedLayout(sectionEl: HTMLElement, section: LaporanSection, index: number): void {
    const stackContainer = document.createElement('div');
    stackContainer.className = 'stack-container';
    
    const content = this.resolveProperty(section.content);
    
    content.forEach((item, itemIndex) => {
      const card = document.createElement('div');
      card.className = 'stack-card';
      card.innerHTML = this.renderContentItem(item, itemIndex);
      stackContainer.appendChild(card);
    });
    
    sectionEl.appendChild(stackContainer);
  }

  /**
   * Create two-column scrolly layout (Iqbal's style)
   * Supports subsections for progressive disclosure
   */
  private createScrollyLayout(sectionEl: HTMLElement, section: LaporanSection, index: number): void {
    // Check if section has subsections
    if (section.subsections && section.subsections.length > 0) {
      // Create container for each subsection
      section.subsections.forEach((subsection, subIndex) => {
        const subsectionEl = document.createElement('div');
        subsectionEl.className = 'subsection';
        subsectionEl.dataset.section = index.toString();
        subsectionEl.dataset.subsection = subIndex.toString();
        subsectionEl.style.minHeight = '100vh';
        
        // Make the first subsection visible by default
        if (subIndex === 0) {
          subsectionEl.classList.add('visible');
        }
        
        // Check if this subsection has a specific layout
        const subsectionLayout = subsection.layout || 'scrolly';
        
        if (subsectionLayout === 'single') {
          // Single column centered layout
          subsectionEl.classList.add('subsection-single');
          const content = document.createElement('div');
          content.className = 'section-content';
          content.innerHTML = this.renderSubsectionContent(section, subsection, index, subIndex);
          subsectionEl.appendChild(content);
        } else if (subsectionLayout === 'single-left') {
          // Single card on left column only
          subsectionEl.classList.add('subsection-single-left');
          const storyCard = document.createElement('article');
          storyCard.className = 'story-card';
          storyCard.dataset.subsectionId = subsection.id;
          storyCard.innerHTML = this.renderStoryCardFromSubsection(section, subsection, index, subIndex);
          subsectionEl.appendChild(storyCard);
        } else {
          // Two-column scrolly layout
          subsectionEl.classList.add('subsection-scrolly');
          
          // For second subsection (index 1), reverse the order (viz left, text right)
          if (subIndex === 1) {
            subsectionEl.classList.add('reverse');
          }
          
          // Story card (text)
          const storyCard = document.createElement('article');
          storyCard.className = 'story-card';
          storyCard.dataset.subsectionId = subsection.id;
          storyCard.innerHTML = this.renderStoryCardFromSubsection(section, subsection, index, subIndex);
          
          // Viz panel (visualization)
          const vizPanel = document.createElement('aside');
          vizPanel.className = 'viz-panel';
          vizPanel.dataset.subsectionId = subsection.id;
          
          if (subsection.vizPanel === null) {
            // No viz panel - hide it
            vizPanel.style.opacity = '0';
            vizPanel.style.pointerEvents = 'none';
            vizPanel.innerHTML = '';
          } else {
            const viz = this.resolveProperty(subsection.vizPanel);
            vizPanel.innerHTML = this.renderVizPanelFromConfig(viz, section.id, subIndex);
          }
          
          subsectionEl.appendChild(storyCard);
          subsectionEl.appendChild(vizPanel);
        }
        
        sectionEl.appendChild(subsectionEl);
      });
    } else {
      // Original behavior - no subsections
      const storyCard = document.createElement('article');
      storyCard.className = 'story-card';
      storyCard.innerHTML = this.renderStoryCard(section, index);
      
      const vizPanel = document.createElement('aside');
      vizPanel.className = 'viz-panel';
      
      // Check if vizPanel is defined
      if (section.vizPanel) {
        vizPanel.innerHTML = this.renderVizPanel(section);
      } else {
        // Keep viz panel in DOM but make it invisible to maintain grid layout
        vizPanel.style.visibility = 'hidden';
        vizPanel.style.pointerEvents = 'none';
        vizPanel.innerHTML = '';
      }
      
      // Control layout direction
      if (section.reverseLayout) {
        // Reverse: viz left, text right
        sectionEl.style.direction = 'rtl';
        storyCard.style.direction = 'ltr';
        vizPanel.style.direction = 'ltr';
      } else {
        // Normal: text left, viz right - explicitly set to override CSS nth-child
        sectionEl.style.direction = 'ltr';
        storyCard.style.direction = 'ltr';
        vizPanel.style.direction = 'ltr';
      }
      
      sectionEl.appendChild(storyCard);
      sectionEl.appendChild(vizPanel);
    }
  }

  /**
   * Render the story card content (left column of scrolly layout)
   */
  private renderStoryCard(section: LaporanSection, index: number): string {
    const title = this.resolveProperty(section.title);
    const content = this.resolveProperty(section.content);
    const chapterLabel = this.resolveProperty(section.chapterLabel);
    
    let html = '';
    
    // Chapter label
    if (chapterLabel) {
      html += `
        <div class="chapter-label">
          ${section.chapterIcon ? `<span class="icon">${section.chapterIcon}</span>` : ''}
          ${chapterLabel}
        </div>
      `;
    }
    
    // Title
    html += `<h2>${title}</h2>`;
    
    // Content
    content.forEach(contentItem => {
      html += this.renderContentItem(contentItem);
    });
    
    // Meta note
    if (section.metaNote) {
      const noteText = this.resolveProperty(section.metaNote.text);
      const noteClass = section.metaNote.type ? section.metaNote.type : '';
      html += `
        <div class="meta-note ${noteClass}">
          ${section.metaNote.icon ? `<span>${section.metaNote.icon}</span>` : ''}
          <span>${noteText}</span>
        </div>
      `;
    }
    
    // Free mode button on last section
    if (index === this.currentSections.length - 1) {
      html += `
        <button class="free-mode-button js-free-mode-btn">
          Switch to Free Mode
        </button>
      `;
    }
    
    return html;
  }

  /**
   * Render subsection content for single-column layout
   */
  private renderSubsectionContent(section: LaporanSection, subsection: any, sectionIndex: number, subIndex: number): string {
    const title = this.resolveProperty(section.title);
    const content = this.resolveProperty(subsection.content || section.content);
    const chapterLabel = this.resolveProperty(section.chapterLabel);
    
    let html = '';
    
    // Chapter label (only on first subsection)
    if (subIndex === 0 && chapterLabel) {
      html += `
        <div class="chapter-label">
          ${section.chapterIcon ? `<span class="icon">${section.chapterIcon}</span>` : ''}
          ${chapterLabel}
        </div>
      `;
    }
    
    // Title (only on first subsection)
    if (subIndex === 0) {
      html += `<h2>${title}</h2>`;
    }
    
    // Content
    content.forEach((contentItem: any) => {
      html += this.renderContentItem(contentItem);
    });
    
    return html;
  }

  /**
   * Render story card from subsection data
   */
  private renderStoryCardFromSubsection(section: LaporanSection, subsection: any, sectionIndex: number, subIndex: number): string {
    const title = this.resolveProperty(section.title);
    const content = this.resolveProperty(subsection.content || section.content);
    const chapterLabel = this.resolveProperty(section.chapterLabel);
    
    let html = '';
    
    // Chapter label (only on first subsection)
    if (subIndex === 0 && chapterLabel) {
      html += `
        <div class="chapter-label">
          ${section.chapterIcon ? `<span class="icon">${section.chapterIcon}</span>` : ''}
          ${chapterLabel}
        </div>
      `;
    }
    
    // Title (only on first subsection)
    if (subIndex === 0) {
      html += `<h2>${title}</h2>`;
    }
    
    // Content
    content.forEach((contentItem: any) => {
      html += this.renderContentItem(contentItem);
    });
    
    // Meta note (only on last subsection)
    if (subIndex === (section.subsections?.length || 1) - 1 && section.metaNote) {
      const noteText = this.resolveProperty(section.metaNote.text);
      const noteClass = section.metaNote.type ? section.metaNote.type : '';
      html += `
        <div class="meta-note ${noteClass}">
          ${section.metaNote.icon ? `<span>${section.metaNote.icon}</span>` : ''}
          <span>${noteText}</span>
        </div>
      `;
    }
    
    return html;
  }

  /**
   * Render viz panel from VizConfig
   */
  private renderVizPanelFromConfig(viz: VizConfig | undefined, sectionId: string, subIndex: number): string {
    if (!viz) {
      return '<div class="viz-body"><p style="color: var(--text-muted); text-align: center; padding: 2rem;">Visualization will appear here</p></div>';
    }
    
    const plotId = `viz-plot-${sectionId}-${subIndex}`;
    
    return `
      <div class="viz-header">
        <div class="viz-title-group">
          <h3 class="viz-title">${viz.title || 'Chart'}</h3>
          <p class="viz-subtitle">${viz.subtitle || ''}</p>
        </div>
        <div class="viz-badge">
          <span class="viz-badge-dot"></span>
          <span>${viz.badge || 'Data'}</span>
        </div>
      </div>
      
      <div class="viz-body">
        <div id="${plotId}"></div>
      </div>
      
      <div class="viz-footer">
        <p class="viz-caption">${viz.caption || ''}</p>
        <span class="viz-tech">Plotly.js</span>
      </div>
      
      ${viz.tags ? `
        <div class="legend-tags">
          ${viz.tags.map(tag => `<span class="legend-tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
    `;
  }

  /**
   * Render the visualization panel (right column of scrolly layout)
   */
  private renderVizPanel(section: LaporanSection): string {
    const viz = this.resolveProperty(section.vizPanel);
    if (!viz) {
      return '<div class="viz-body"><p style="color: var(--text-muted); text-align: center; padding: 2rem;">Visualization will appear here</p></div>';
    }
    
    const plotId = `viz-plot-${section.id}`;
    
    return `
      <div class="viz-header">
        <div class="viz-title-group">
          <h3 class="viz-title">${viz.title || 'Chart'}</h3>
          <p class="viz-subtitle">${viz.subtitle || ''}</p>
        </div>
        <div class="viz-badge">
          <span class="viz-badge-dot"></span>
          <span>${viz.badge || 'Data'}</span>
        </div>
      </div>
      
      <div class="viz-body">
        <div id="${plotId}"></div>
      </div>
      
      <div class="viz-footer">
        <p class="viz-caption">${viz.caption || ''}</p>
        <span class="viz-tech">Plotly.js</span>
      </div>
      
      ${viz.tags ? `
        <div class="legend-tags">
          ${viz.tags.map(tag => `<span class="legend-tag">${tag}</span>`).join('')}
        </div>
      ` : ''}
    `;
  }

  /**
   * Render section content (for single layout)
   */
  private renderSectionContent(section: LaporanSection, index: number): string {
    const title = this.resolveProperty(section.title);
    const content = this.resolveProperty(section.content);
    
    let html = `<h1>${title}</h1>`;
    
    content.forEach(contentItem => {
      html += this.renderContentItem(contentItem);
    });
    
    if (index === this.currentSections.length - 1) {
      html += `
        <button class="free-mode-button js-free-mode-btn">
          Switch to Free Mode
        </button>
      `;
    }
    
    return html;
  }

  /**
   * Render a single content item
   */
  private renderContentItem(contentItem: any): string {
    let html = '';
    
    if (contentItem.type === 'text') {
      if (contentItem.heading) {
        html += `<h2>${contentItem.heading}</h2>`;
      }
      if (contentItem.subheading) {
        html += `<h3>${contentItem.subheading}</h3>`;
      }
      if (contentItem.body) {
        const body = this.resolveProperty(contentItem.body);
        html += `<p>${body}</p>`;
      }
    } else if (contentItem.type === 'list' && contentItem.items) {
      const items = this.resolveProperty(contentItem.items);
      html += '<ul>';
      items.forEach((item: string) => {
        html += `<li>${item}</li>`;
      });
      html += '</ul>';
    } else if (contentItem.type === 'card-grid' && contentItem.cards) {
      html += '<div class="card-grid">';
      contentItem.cards.forEach((card: any) => {
        html += `<div class="card">`;
        
        if (card.icon) {
          html += `<div class="card-icon">${card.icon}</div>`;
        } else if (card.image) {
          html += `<img src="${card.image}" alt="${card.title}" class="card-image" />`;
        }
        
        html += `
            <h4>${card.title}</h4>
            <p>${card.description}</p>
          </div>
        `;
      });
      html += '</div>';
    } else if (contentItem.type === 'animation' && contentItem.items) {
      const items = this.resolveProperty(contentItem.items);
      html += '<ul class="animated-list">';
      items.forEach((item: string) => {
        html += `<li>${item}</li>`;
      });
      html += '</ul>';
    }
    
    return html;
  }
  private setupScrollListener(): void {
    // Disconnect existing observer if any
    if (this.observer) {
      this.observer.disconnect();
    }
    
    const options = {
      root: this.scrollContainer,
      rootMargin: '0px',
      threshold: 0.3, 
    };
    this.observer = new IntersectionObserver((entries) => {
      if (this.mode !== 'story') return;
      
      // Sort entries: subsections first, then sections
      const sortedEntries = [...entries].sort((a, b) => {
        const aIsSubsection = a.target.getAttribute('data-subsection') !== null;
        const bIsSubsection = b.target.getAttribute('data-subsection') !== null;
        if (aIsSubsection && !bIsSubsection) return -1;
        if (!aIsSubsection && bIsSubsection) return 1;
        return 0;
      });
      
      sortedEntries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Check if this is a subsection or regular section
          const subsectionIndex = entry.target.getAttribute('data-subsection');
          
          if (subsectionIndex !== null) {
            // Subsection detected
            const sectionIndex = parseInt(entry.target.getAttribute('data-section') || '0');
            const subIndex = parseInt(subsectionIndex);
            
            if (sectionIndex !== this.currentSection || subIndex !== this.currentSubsection) {
              // Remove visible class from all subsections in this section
              const allSubsections = this.sectionsContainer.querySelectorAll(`[data-section="${sectionIndex}"][data-subsection]`);
              allSubsections.forEach(sub => sub.classList.remove('visible'));
              
              // Go to new subsection
              this.goToSubsection(sectionIndex, subIndex);
            }
            
            // Add visible class to current subsection only
            entry.target.classList.add('visible');
          } else {
            // Regular section (no subsections)
            const sectionIndex = parseInt(entry.target.getAttribute('data-section') || '0');
            if (sectionIndex !== this.currentSection) {
              this.goToSection(sectionIndex);
            }
            
            // Add visible class for animations
            entry.target.classList.add('visible');
          }
          
          // Dispatch story change event for visualizations
          const storyKey = entry.target.getAttribute('data-story');
          if (storyKey) {
            window.dispatchEvent(new CustomEvent('storyChange', { 
              detail: { story: storyKey, index: parseInt(entry.target.getAttribute('data-section') || '0') } 
            }));
            
            // Render visualization if present
            const sectionIndex = parseInt(entry.target.getAttribute('data-section') || '0');
            this.renderVisualization(sectionIndex);
          }
        } else {
          // Remove visible class when not intersecting
          entry.target.classList.remove('visible');
        }
      });
    }, options);
    
    // Observe both sections and subsections
    const sections = this.sectionsContainer.querySelectorAll('.story-section, .subsection');
    sections.forEach((section) => {
      this.observer?.observe(section);
    });
  }

  /**
   * Go to a specific subsection within a section with FLIP animations
   */
  private goToSubsection(sectionIndex: number, subIndex: number): void {
    const oldSectionIndex = this.currentSection;
    const oldSubIndex = this.currentSubsection;
    
    this.currentSection = sectionIndex;
    this.currentSubsection = subIndex;
    
    const section = this.currentSections[sectionIndex];
    if (!section || !section.subsections) return;
    
    const subsection = section.subsections[subIndex];
    if (!subsection) return;
    
    // Apply FLIP animation if transitioning from subsection 0 to 1
    if (oldSectionIndex === sectionIndex && oldSubIndex === 0 && subIndex === 1) {
      this.applyFLIPAnimation(sectionIndex, oldSubIndex, subIndex);
    }
    
    // Update camera position
    const cameraPosition = this.resolveProperty(subsection.cameraPosition);
    if (cameraPosition) {
      flyToPosition(this.map, cameraPosition, { duration: subsection.duration || 1000 });
    }
    
    // Update map opacity
    if (subsection.mapOpacity !== undefined) {
      this.mapOverlay.style.opacity = (1 - subsection.mapOpacity).toString();
    }
    
    // Update heatmap
    if (subsection.showHeatmap !== undefined) {
      // Dispatch event for heatmap control
      window.dispatchEvent(new CustomEvent('toggleHeatmap', {
        detail: { 
          show: subsection.showHeatmap,
          field: this.resolveProperty(subsection.heatmapField)
        }
      }));
    }
    
    // Update progress bar
    this.updateProgressBar();
  }

  /**
   * Apply FLIP (First, Last, Invert, Play) animation for subsection transitions
   * Smoothly moves story card from center-right to left when viz panel appears
   */
  private applyFLIPAnimation(sectionIndex: number, fromSubIndex: number, toSubIndex: number): void {
    const section = this.currentSections[sectionIndex];
    if (!section || !section.subsections) return;
    
    // Get the story cards and viz panels
    const subsections = this.sectionsContainer.querySelectorAll(`[data-section="${sectionIndex}"][data-subsection]`);
    const oldSubsection = subsections[fromSubIndex] as HTMLElement;
    const newSubsection = subsections[toSubIndex] as HTMLElement;
    
    if (!oldSubsection || !newSubsection) return;
    
    const oldStoryCard = oldSubsection.querySelector('.story-card') as HTMLElement;
    const newStoryCard = newSubsection.querySelector('.story-card') as HTMLElement;
    const newVizPanel = newSubsection.querySelector('.viz-panel') as HTMLElement;
    
    if (!oldStoryCard || !newStoryCard || !newVizPanel) return;
    
    // FIRST: Get initial positions
    const oldRect = oldStoryCard.getBoundingClientRect();
    const newRect = newStoryCard.getBoundingClientRect();
    
    // LAST: Calculate the difference
    const deltaX = oldRect.left - newRect.left;
    const deltaY = oldRect.top - newRect.top;
    const deltaW = oldRect.width / newRect.width;
    const deltaH = oldRect.height / newRect.height;
    
    // INVERT: Apply transform to new card to make it look like it's at old position
    newStoryCard.style.transformOrigin = 'top left';
    newStoryCard.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
    newStoryCard.style.transition = 'none';
    
    // Also set viz panel to invisible initially
    newVizPanel.style.opacity = '0';
    newVizPanel.style.transform = 'translateX(20px)';
    newVizPanel.style.transition = 'none';
    
    // PLAY: Animate to final position
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        // Story card slides to left position
        newStoryCard.style.transition = 'transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 0.6s ease';
        newStoryCard.style.transform = 'translate(0, 0) scale(1, 1)';
        
        // Viz panel fades in from right
        newVizPanel.style.transition = 'opacity 0.6s ease 0.3s, transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1) 0.3s';
        newVizPanel.style.opacity = '1';
        newVizPanel.style.transform = 'translateX(0)';
        newVizPanel.style.pointerEvents = 'auto';
      });
    });
  }

  /**
   * Render Plotly visualization for a section
   */
  private async renderVisualization(index: number): Promise<void> {
    const section = this.currentSections[index];
    const vizPanel = this.resolveProperty(section.vizPanel);
    if (!vizPanel || !vizPanel.dataEndpoint) return;
    
    const plotId = `viz-plot-${section.id}`;
    const plotEl = document.getElementById(plotId);
    if (!plotEl) return;
    
    const endpoint = vizPanel.dataEndpoint || '';
    const storyKey = section.storyKey || section.id;
    
    try {
      // Use D3 visualizations for specific story sections
      if (storyKey === 'intro' && endpoint.includes('national-overview')) {
        await this.renderIntroD3Viz(plotId);
        return;
      }
      
      if (storyKey === 'warm_homes' && endpoint.includes('housing')) {
        await this.renderWarmHomesD3Viz(plotId);
        return;
      }
      
      if (storyKey === 'clean_active' && endpoint.includes('health')) {
        await this.renderActiveStreetsD3Viz(plotId);
        return;
      }
      
      // Fall back to Plotly for other visualizations
      if (typeof Plotly === 'undefined') {
        console.warn('Plotly.js not loaded. Skipping visualization.');
        return;
      }
      
      const data = await this.getVisualizationData(vizPanel);
      const layout = this.getPlotlyLayout(vizPanel);
      
      const config = {
        responsive: true,
        displaylogo: false,
        modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d']
      };
      
      const existingPlot = (plotEl as any)._fullLayout;
      if (existingPlot) {
        await Plotly.animate(plotId, {
          data,
          layout
        }, {
          transition: {
            duration: 800,
            easing: 'cubic-in-out'
          },
          frame: {
            duration: 800,
            redraw: true
          }
        });
      } else {
        await Plotly.newPlot(plotId, data, layout, config);
        
        await Plotly.animate(plotId, {
          data: data.map(trace => ({
            ...trace,
            opacity: [1]
          }))
        }, {
          transition: {
            duration: 600,
            easing: 'cubic-out'
          }
        });
      }
    } catch (error) {
      console.error('Error rendering visualization:', error);
    }
  }

  /**
   * Render intro stacked area chart with D3
   */
  private async renderIntroD3Viz(containerId: string): Promise<void> {
    try {
      const apiData = await fetchNationalOverview();
      const data: TimeSeriesData[] = apiData.years.map((year, i) => ({
        year,
        'Physical Activity': apiData.physical_activity[i],
        'Air Quality': apiData.air_quality[i],
        'Sum': apiData.sum[i],
        'Noise': apiData.noise[i]
      }));
      
      const categories = ['Physical Activity', 'Air Quality', 'Sum', 'Noise'];
      renderStackedAreaD3(containerId, data, categories);
    } catch (error) {
      console.error('Error rendering intro D3 viz:', error);
    }
  }

  /**
   * Render warm homes house-shaped viz with D3
   */
  private async renderWarmHomesD3Viz(containerId: string): Promise<void> {
    try {
      const apiData = await fetchHousingComparison();
      const data: HousingComparisonData[] = apiData.labels.map((label, i) => ({
        name: label,
        excessCold: apiData.excess_cold[i],
        dampness: apiData.dampness[i],
        excessHeat: apiData.excess_heat[i]
      }));
      
      renderHouseShapeViz(containerId, data);
    } catch (error) {
      console.error('Error rendering warm homes D3 viz:', error);
    }
  }

  /**
   * Render active streets landscape viz with D3
   */
  private async renderActiveStreetsD3Viz(containerId: string): Promise<void> {
    try {
      const apiData = await fetchNationalCategoryTimeseries('health_wellbeing');
      const data: TimeSeriesData[] = apiData.map(item => ({
        year: item.year,
        physical_activity: item.value  // Rename to match expected key
      }));
      
      renderActiveStreetsViz(containerId, data);
    } catch (error) {
      console.error('Error rendering active streets D3 viz:', error);
    }
  }

  /**
   * Get visualization data from real API endpoints
   */
  private async getVisualizationData(viz: VizConfig): Promise<any[]> {
    // Parse the data endpoint to determine what data to fetch
    const endpoint = viz.dataEndpoint || '';
    
    try {
      // Area-specific timeseries (when viewing a specific area)
      if (endpoint.includes('/timeseries/area/area/') || endpoint.includes('/timeseries/region/area/') || endpoint.includes('/timeseries/nation/area/')) {
        const response = await fetch(`http://localhost:3000${endpoint}`);
        if (response.ok) {
          const data: TimeseriesDataPoint[] = await response.json();
          
          if (data.length > 0) {
            return [
              {
                x: data.map(d => d.year),
                y: data.map(d => (d.health_wellbeing || 0) + (d.housing_comfort || 0) + (d.road_mobility || 0)),
                mode: 'lines',
                name: 'Total Benefits (£M)',
                line: { width: 4, color: '#3B82F6', shape: 'spline' },
                fill: 'tozeroy',
                fillcolor: 'rgba(59, 130, 246, 0.1)'
              },
              {
                x: data.map(d => d.year),
                y: data.map(d => d.health_wellbeing || 0),
                mode: 'lines',
                name: 'Health & Wellbeing',
                line: { width: 2, color: '#10B981', shape: 'spline' }
              },
              {
                x: data.map(d => d.year),
                y: data.map(d => d.housing_comfort || 0),
                mode: 'lines',
                name: 'Housing Comfort',
                line: { width: 2, color: '#F59E0B', shape: 'spline' }
              },
              {
                x: data.map(d => d.year),
                y: data.map(d => d.road_mobility || 0),
                mode: 'lines',
                name: 'Road Mobility',
                line: { width: 2, color: '#8B5CF6', shape: 'spline' }
              }
            ];
          }
        }
      }
      
      // National overview / sum timeseries
      if (endpoint.includes('/timeseries/nation/category/sum') || endpoint.includes('national-overview')) {
        const response = await fetch(`http://localhost:3000${endpoint}`);
        if (response.ok) {
          const data: any[] = await response.json();
          
          // Aggregate by year across all nations
          const yearMap = new Map<number, { health: number; housing: number; road: number }>();
          data.forEach(row => {
            const year = row.year || row.time_year;
            const current = yearMap.get(year) || { health: 0, housing: 0, road: 0 };
            yearMap.set(year, {
              health: current.health + (row.health_wellbeing || 0),
              housing: current.housing + (row.housing_comfort || 0),
              road: current.road + (row.road_mobility || 0)
            });
          });
          
          const years = Array.from(yearMap.keys()).sort((a, b) => a - b);
          const aggregated = years.map(y => yearMap.get(y)!);
          
          if (years.length > 0) {
            return [
              {
                x: years,
                y: aggregated.map(d => d.health + d.housing + d.road),
                mode: 'lines',
                name: 'Total Benefits (£M)',
                line: { width: 4, color: '#3B82F6', shape: 'spline' },
                fill: 'tozeroy',
                fillcolor: 'rgba(59, 130, 246, 0.1)'
              },
              {
                x: years,
                y: aggregated.map(d => d.health),
                mode: 'lines',
                name: 'Health & Wellbeing',
                line: { width: 2, color: '#10B981', shape: 'spline' }
              },
              {
                x: years,
                y: aggregated.map(d => d.housing),
                mode: 'lines',
                name: 'Housing Comfort',
                line: { width: 2, color: '#F59E0B', shape: 'spline' }
              },
              {
                x: years,
                y: aggregated.map(d => d.road),
                mode: 'lines',
                name: 'Road Mobility',
                line: { width: 2, color: '#8B5CF6', shape: 'spline' }
              }
            ];
          }
        }
      }
      
      // Housing comfort stacked bar chart
      if (endpoint.includes('housing') || viz.type === 'stacked-bar') {
        const data = await fetchHousingComparison();
        if (data.labels.length > 0) {
          return [
            {
              x: data.labels,
              y: data.excess_cold,
              name: 'Excess Cold',
              type: 'bar',
              marker: { color: '#3B82F6' }
            },
            {
              x: data.labels,
              y: data.dampness,
              name: 'Dampness',
              type: 'bar',
              marker: { color: '#FB923C' }
            },
            {
              x: data.labels,
              y: data.excess_heat,
              name: 'Excess Heat',
              type: 'bar',
              marker: { color: '#F43F5E' }
            }
          ];
        }
      }
      
      // Comparison chart (area vs national average)
      if (viz.type === 'comparison' && endpoint.includes('/api/area-data/')) {
        try {
          const areaId = endpoint.split('/').pop();
          const response = await fetch(`http://localhost:3000${endpoint}`);
          
          let areaData: any = null;
          let areaName = 'Selected Area';
          
          if (response.ok) {
            areaData = await response.json();
            areaName = areaData.small_area || areaData.name || 'Selected Area';
          } else {
            // If area-data fails (for nations/LAs), try to get aggregated data
            // For nations: aggregate from nation's small areas
            // For now, show national average as comparison
            console.warn('Area data not found, using national average');
          }
          
          // Fetch national average from category-data
          const nationalResponse = await fetch(`http://localhost:3000/api/category-data/nation`);
          let nationalAvg = { physical_activity: 0, air_quality: 0, noise: 0 };
          
          if (nationalResponse.ok) {
            const nationalData: any[] = await nationalResponse.json();
            // Calculate average across all nations
            if (nationalData.length > 0) {
              nationalAvg = {
                physical_activity: nationalData.reduce((sum, d) => sum + (d.physical_activity || 0), 0) / nationalData.length,
                air_quality: nationalData.reduce((sum, d) => sum + (d.air_quality || 0), 0) / nationalData.length,
                noise: nationalData.reduce((sum, d) => sum + (d.noise || 0), 0) / nationalData.length
              };
            }
          }
          
          // If we have area data, show comparison; otherwise just show national
          if (areaData) {
            return [
              {
                x: ['Physical Activity', 'Air Quality', 'Noise'],
                y: [areaData.physical_activity || 0, areaData.air_quality || 0, areaData.noise || 0],
                name: areaName,
                type: 'bar',
                marker: { color: '#10B981' }
              },
              {
                x: ['Physical Activity', 'Air Quality', 'Noise'],
                y: [nationalAvg.physical_activity, nationalAvg.air_quality, nationalAvg.noise],
                name: 'National Average',
                type: 'bar',
                marker: { color: '#6B7280' }
              }
            ];
          } else {
            // Fallback: just show national average
            return [
              {
                x: ['Physical Activity', 'Air Quality', 'Noise'],
                y: [nationalAvg.physical_activity, nationalAvg.air_quality, nationalAvg.noise],
                name: 'National Average',
                type: 'bar',
                marker: { color: '#6B7280' }
              }
            ];
          }
        } catch (error) {
          console.error('Error fetching comparison data:', error);
        }
      }
      
      // Health / Physical activity timeseries
      if (endpoint.includes('health') || endpoint.includes('physical')) {
        const data = await fetchNationalCategoryTimeseries('health_wellbeing');
        if (data.length > 0) {
          return [
            {
              x: data.map(d => d.year),
              y: data.map(d => d.value),
              mode: 'lines+markers',
              name: 'Health & Wellbeing',
              line: { width: 3, color: '#10B981', shape: 'spline' },
              marker: { size: 6, color: '#10B981' },
              fill: 'tozeroy',
              fillcolor: 'rgba(16, 185, 129, 0.1)'
            }
          ];
        }
      }
      
      // Transport / Congestion timeseries
      if (endpoint.includes('/timeseries/nation/category/congestion') || endpoint.includes('congestion')) {
        const response = await fetch(`http://localhost:3000${endpoint}`);
        if (response.ok) {
          const data: any[] = await response.json();
          
          // Aggregate by year
          const yearMap = new Map<number, { congestion: number; road_safety: number }>();
          data.forEach(row => {
            const year = row.year || row.time_year;
            const current = yearMap.get(year) || { congestion: 0, road_safety: 0 };
            yearMap.set(year, {
              congestion: current.congestion + (row.congestion || 0),
              road_safety: current.road_safety + (row.road_safety || 0)
            });
          });
          
          const years = Array.from(yearMap.keys()).sort((a, b) => a - b);
          const aggregated = years.map(y => yearMap.get(y)!);
          
          if (years.length > 0) {
            return [
              {
                x: years,
                y: aggregated.map(d => d.congestion),
                mode: 'lines',
                name: 'Congestion Changes',
                line: { width: 3, color: '#3B82F6', shape: 'spline' }
              },
              {
                x: years,
                y: aggregated.map(d => d.road_safety),
                mode: 'lines',
                name: 'Road Safety',
                line: { width: 3, color: '#10B981', shape: 'spline' }
              },
              {
                x: years,
                y: years.map((_, i) => -200 - i * 50),
                mode: 'lines',
                name: 'Hassle Costs',
                line: { width: 3, color: '#F43F5E', dash: 'dash', shape: 'spline' },
                fill: 'tozeroy',
                fillcolor: 'rgba(244, 63, 94, 0.1)'
              }
            ];
          }
        }
      }
      
      // Noise horizontal bar chart (top areas)
      if (endpoint.includes('noise') || viz.type === 'horizontal-bar') {
        const topAreas = await fetchTopAreasByField('noise', 'region', 8, 'desc');
        if (topAreas.length > 0) {
          const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F3F0FF', '#F5F3FF', '#FAF5FF'];
          return [{
            x: topAreas.map(a => a.value),
            y: topAreas.map(a => a.name),
            type: 'bar',
            orientation: 'h',
            marker: {
              color: topAreas.map((_, i) => colors[i % colors.length])
            },
            hovertemplate: '%{y}: %{x:.2f}<extra></extra>'
          }];
        }
      }
    } catch (error) {
      console.error('Error fetching visualization data:', error);
    }
    
    // Fallback to placeholder data if API fails
    return this.getPlaceholderData(viz);
  }

  /**
   * Fallback placeholder data when API is unavailable
   */
  private getPlaceholderData(viz: VizConfig): any[] {
    const years = Array.from({ length: 26 }, (_, i) => 2025 + i);
    
    switch (viz.type) {
      case 'timeseries':
        return [
          {
            x: years,
            y: years.map((_, i) => 1500 + i * 250 + Math.sin(i) * 200),
            mode: 'lines',
            name: 'Total Sum (demo)',
            line: { width: 4, color: '#3B82F6', shape: 'spline' },
            fill: 'tozeroy',
            fillcolor: 'rgba(59, 130, 246, 0.1)'
          }
        ];
      
      case 'stacked-bar':
        return [
          {
            x: ['Region A', 'Region B', 'Region C', 'Region D'],
            y: [0.42, 0.18, 0.28, 0.15],
            name: 'Excess Cold',
            type: 'bar',
            marker: { color: '#3B82F6' }
          },
          {
            x: ['Region A', 'Region B', 'Region C', 'Region D'],
            y: [0.08, 0.03, 0.05, 0.02],
            name: 'Dampness',
            type: 'bar',
            marker: { color: '#FB923C' }
          }
        ];
      
      case 'horizontal-bar':
        return [{
          x: [0.31, 0.27, 0.25, 0.22, 0.21, 0.19, 0.18, 0.17],
          y: ['Area 1', 'Area 2', 'Area 3', 'Area 4', 'Area 5', 'Area 6', 'Area 7', 'Area 8'],
          type: 'bar',
          orientation: 'h',
          marker: {
            color: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F3F0FF', '#F5F3FF', '#FAF5FF']
          }
        }];
      
      default:
        return [];
    }
  }

  /**
   * Get Plotly layout configuration
   */
  private getPlotlyLayout(viz: VizConfig): any {
    const baseLayout = {
      paper_bgcolor: 'rgba(15, 23, 42, 0)',
      plot_bgcolor: 'rgba(15, 23, 42, 0)',
      font: { color: '#94A3B8', family: 'Inter, sans-serif' },
      margin: { t: 30, r: 20, b: 50, l: 70 },
      xaxis: {
        gridcolor: 'rgba(71, 85, 105, 0.3)',
        zerolinecolor: 'rgba(71, 85, 105, 0.5)',
        tickfont: { color: '#94A3B8' }
      },
      yaxis: {
        gridcolor: 'rgba(71, 85, 105, 0.3)',
        zerolinecolor: 'rgba(71, 85, 105, 0.5)',
        tickfont: { color: '#94A3B8' }
      },
      legend: {
        orientation: 'h',
        y: 1.12,
        x: 0,
        font: { size: 10, color: '#94A3B8' }
      },
      hovermode: 'x unified'
    };
    
    if (viz.type === 'stacked-bar') {
      return { ...baseLayout, barmode: 'stack' };
    }
    
    if (viz.type === 'horizontal-bar') {
      return {
        ...baseLayout,
        yaxis: { ...baseLayout.yaxis, autorange: 'reversed' },
        showlegend: false
      };
    }
    
    return baseLayout;
  }

  private goToSection(index: number): void {
    // Auto-switch to free mode if scrolling past the last section
    if (index >= this.currentSections.length) {
      this.setMode('free');
      return;
    }
    
    if (index < 0) return;
    
    const oldIndex = this.currentSection;
    this.currentSection = index;
    const section = this.currentSections[index];
    
    // Notify navbar of section change
    window.dispatchEvent(new CustomEvent('sectionChange', { detail: { index } }));
    
    // Stop microwave animation if active
    this.stopMicrowaveAnimation();
    
    // Check if should move camera (respecting disableCameraMove flag)
    const shouldMoveCamera = !section.disableCameraMove;
    
    // Check if should start microwave (respecting disableMicrowave flag)
    const shouldStartMicrowave = !section.disableMicrowave && index < 7;
    
    if (shouldMoveCamera) {
      const cameraPosition = this.resolveProperty(section.cameraPosition);
      // Check if section is before tech stack (section 0-6) or has explicit camera position
      if (index < 7 && !cameraPosition) {
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
      } else if (cameraPosition) {
        // Use explicit camera position if specified
        flyToPosition(this.map, cameraPosition, {
          duration: 2000,
          essential: true,
        });
      }
      // If no cameraPosition specified and section 7+, camera stays at current position
    }
    
    // Start microwave animation if section allows it
    if (shouldStartMicrowave) {
      // Clear any pending timeouts first
      if (this.microwaveStartTimeout !== null) {
        clearTimeout(this.microwaveStartTimeout);
        this.microwaveStartTimeout = null;
      }
      this.microwaveStartTimeout = window.setTimeout(() => {
        // Only start if still in story mode
        if (this.mode === 'story') {
          this.startMicrowaveAnimation();
        }
        this.microwaveStartTimeout = null;
      }, 2000);
    }
    
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

  public pause(): void {
    console.log('⏸️ Story mode paused');
    this.stopMicrowaveAnimation();
  }

  public resume(): void {
    console.log('▶️ Story mode resumed');
    // Restart microwave if current section allows it
    const section = this.currentSections[this.currentSection];
    if (section && !section.disableMicrowave && this.currentSection < 7) {
      this.startMicrowaveAnimation();
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
      this.scrollContainer.style.overflow = '';
      this.scrollContainer.style.pointerEvents = '';
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
      document.body.classList.remove('free-mode', 'pick-map-mode');
      this.hideMapControls();
      
      // Show hint box in story mode
      if (this.hintBox) {
        this.hintBox.style.display = 'block';
      }
    } else if (mode === 'pick-map') {
      // PICK-MAP MODE - Enable map interaction for area selection
      console.log('🗺️ Entering pick-map mode');
      
      // Stop any story mode animations
      this.stopMicrowaveAnimation();
      if (this.microwaveStartTimeout !== null) {
        clearTimeout(this.microwaveStartTimeout);
        this.microwaveStartTimeout = null;
      }
      
      // Keep scroll container visible but disable scrolling
      this.scrollContainer.style.display = 'block';
      this.scrollContainer.style.overflow = 'hidden';
      this.scrollContainer.style.pointerEvents = 'none';
      
      // Enable map interaction
      this.mapContainer.style.pointerEvents = 'auto';
      this.map.scrollZoom.enable();
      this.map.dragPan.enable();
      this.map.doubleClickZoom.enable();
      this.map.touchZoomRotate.enable();
      this.map.dragRotate.enable();
      
      // Set single consistent class
      document.body.classList.add('pick-map-mode');
      document.body.classList.remove('story-mode', 'free-mode');
      
      // Hide controls and hint box
      this.hideMapControls();
      if (this.hintBox) {
        this.hintBox.style.display = 'none';
      }
      
      console.log('✅ Pick-map mode active');
    } else {
      // FREE MODE
      // Clear any pending rotation start timers
      if (this.microwaveStartTimeout !== null) {
        clearTimeout(this.microwaveStartTimeout);
        this.microwaveStartTimeout = null;
      }
      // STOP MAP SPINNING when switching to free mode
      this.stopMicrowaveAnimation();
      // Reset map bearing to north (0 degrees)
      this.map.easeTo({ bearing: 0, duration: 1000 });
      
      this.scrollContainer.style.display = 'none';
      this.scrollContainer.style.overflow = '';
      this.scrollContainer.style.pointerEvents = '';
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
      document.body.classList.remove('pick-map-mode');
      
      // Stop autoplay and hide hint box in free mode
      this.stopAutoPlay();
      if (this.hintBox) {
        this.hintBox.style.display = 'none';
      }
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
  
  /**
   * Setup keyboard navigation (Arrow keys, Space for auto-play)
   */
  private setupKeyboardNavigation(): void {
    this.keyboardHandler = (e: KeyboardEvent) => {
      if (this.mode !== 'story') return;
      
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      switch(e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          this.nextSection();
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          this.previousSection();
          break;
        case ' ': // Space bar
          e.preventDefault();
          this.toggleAutoPlay();
          break;
        case 'Home':
          e.preventDefault();
          this.goToSectionIndex(0);
          break;
        case 'End':
          e.preventDefault();
          this.goToSectionIndex(this.currentSections.length - 1);
          break;
        case '1':
          e.preventDefault();
          this.setAutoPlaySpeed(0.5); // 2x faster
          break;
        case '2':
          e.preventDefault();
          this.setAutoPlaySpeed(1);   // normal
          break;
        case '3':
          e.preventDefault();
          this.setAutoPlaySpeed(1.5); // 1.5x slower
          break;
      }
    };
    
    window.addEventListener('keydown', this.keyboardHandler);
  }
  
  /**
   * Navigate to next section
   */
  public nextSection(): void {
    const nextIndex = this.currentSection + 1;
    if (nextIndex < this.currentSections.length) {
      this.goToSectionIndex(nextIndex);
    }
  }
  
  /**
   * Navigate to previous section
   */
  public previousSection(): void {
    const prevIndex = this.currentSection - 1;
    if (prevIndex >= 0) {
      this.goToSectionIndex(prevIndex);
    }
  }
  
  /**
   * Go to specific section by index
   */
  public goToSectionIndex(index: number): void {
    if (index < 0 || index >= this.currentSections.length) return;
    
    // Restart autoplay for new section if currently playing
    if (this.isAutoPlaying) {
      this.stopAutoPlay();
      // Will restart after scrollIntoView triggers the observer
      // Set a flag to restart after navigation completes
      setTimeout(() => {
        if (this.mode === 'story') {
          this.startAutoPlay();
        }
      }, 100);
    }
    
    const sectionEl = this.sectionsContainer.querySelector(`[data-section="${index}"]`);
    if (sectionEl) {
      sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
  
  /**
   * Toggle auto-play mode
   */
  public toggleAutoPlay(): void {
    if (this.isAutoPlaying) {
      this.stopAutoPlay();
    } else {
      this.startAutoPlay();
    }
  }

  /**
   * Set autoplay speed multiplier and restart if currently playing
   */
  private setAutoPlaySpeed(multiplier: number): void {
    this.autoPlaySpeedMultiplier = multiplier;
    this.updateHintBox();
    if (this.isAutoPlaying) {
      // Restart autoplay on current section with new speed
      this.stopAutoPlay();
      this.startAutoPlay();
    }
  }
  
  /**
   * Start auto-play mode
   */
  private startAutoPlay(): void {
    if (this.isAutoPlaying) return;
    
    this.isAutoPlaying = true;
    this.createProgressBar();
    this.updateProgressBar(0); // Reset progress to 0 for new section
    this.updateHintBox(); // Update hint to show autoplay is active
    
    // Auto-play duration per section based on estimated reading time
    const duration = this.getAutoPlayDuration(this.currentSections[this.currentSection]);
    const effectiveDuration = duration * this.autoPlaySpeedMultiplier;
    const startTime = Date.now();
    
    const playNext = () => {
      if (!this.isAutoPlaying) return;
      
      // Update progress bar
      const elapsed = Date.now() - startTime;
      const progress = Math.min((elapsed / effectiveDuration) * 100, 100);
      this.updateProgressBar(progress);
      
      // Move to next section when duration is complete
      if (elapsed >= effectiveDuration) {
        if (this.currentSection < this.currentSections.length - 1) {
          this.nextSection();
          // Reset timer for next section
          this.startAutoPlay();
        } else {
          // End of story, stop auto-play
          this.stopAutoPlay();
        }
        return;
      }
      
      // Continue animation
      this.autoPlayInterval = requestAnimationFrame(playNext) as any;
    };
    
    playNext();
  }

  /**
   * Estimate autoplay duration from section word count (average reading speed ~200 wpm)
   */
  private getAutoPlayDuration(section: LaporanSection | undefined): number {
    const wordsPerMinute = 200;
    const wordsPerSecond = wordsPerMinute / 60;
    const wordCount = section ? this.getSectionWordCount(section) : 120; // default fallback
    const estimatedSeconds = wordCount / wordsPerSecond;
    const minMs = 4000;  // 4s minimum so animations have time
    const maxMs = 15000; // 15s maximum to avoid overly long waits
    const durationMs = estimatedSeconds * 1000;
    return Math.min(maxMs, Math.max(minMs, durationMs));
  }
  
  /**
   * Rough word count of a section's textual content
   */
  private getSectionWordCount(section: LaporanSection): number {
    const title = this.resolveProperty(section.title);
    const content = this.resolveProperty(section.content);
    const vizPanel = this.resolveProperty(section.vizPanel);
    const metaNote = section.metaNote;
    
    let count = 0;
    const add = (text?: string) => {
      if (text) {
        count += this.countWords(text);
      }
    };
    add(title);
    if (metaNote?.text) add(this.resolveProperty(metaNote.text));
    if (vizPanel?.caption) add(this.resolveProperty(vizPanel.caption));
    if (vizPanel?.subtitle) add(this.resolveProperty(vizPanel.subtitle));
    content.forEach(item => {
      add(item.heading);
      add(item.subheading);
      const body = this.resolveProperty(item.body);
      add(body);
      if (item.items) {
        const items = this.resolveProperty(item.items);
        items.forEach((text: string) => add(text));
      }
      if (item.cards) {
        item.cards.forEach((card: any) => {
          add(card.title);
          add(card.description);
        });
      }
    });
    // Fallback to a reasonable default if content is sparse
    if (count === 0) count = 120;
    return count;
  }
  
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(Boolean).length;
  }

  private getSpeedLabel(): string {
    if (this.autoPlaySpeedMultiplier <= 0.6) return 'Fast (2x)';
    if (this.autoPlaySpeedMultiplier >= 1.4) return 'Slow (1.5x)';
    return 'Normal (1x)';
  }
  
  /**
   * Stop auto-play mode
   */
  private stopAutoPlay(): void {
    this.isAutoPlaying = false;
    if (this.autoPlayInterval !== null) {
      cancelAnimationFrame(this.autoPlayInterval);
      this.autoPlayInterval = null;
    }
    this.removeProgressBar();
    this.updateHintBox(); // Update hint to show normal shortcuts
  }
  
  /**
   * Create progress bar UI
   */
  private createProgressBar(): void {
    if (this.progressBar) return;
    
    this.progressBar = document.createElement('div');
    this.progressBar.id = 'autoplay-progress';
    this.progressBar.style.cssText = `
      position: fixed;
      top: 60px;
      left: 0;
      right: 0;
      height: 3px;
      background: rgba(59, 130, 246, 0.2);
      z-index: 9998;
      overflow: hidden;
    `;
    
    const fill = document.createElement('div');
    fill.id = 'autoplay-progress-fill';
    fill.style.cssText = `
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, var(--primary-500), var(--growth-500));
      transition: width 0.1s linear;
    `;
    
    this.progressBar.appendChild(fill);
    document.body.appendChild(this.progressBar);
  }
  
  /**
   * Update progress bar
   */
  private updateProgressBar(progress: number): void {
    if (!this.progressBar) return;
    const fill = this.progressBar.querySelector('#autoplay-progress-fill') as HTMLElement;
    if (fill) {
      fill.style.width = `${progress}%`;
    }
  }
  
  /**
   * Remove progress bar
   */
  private removeProgressBar(): void {
    if (this.progressBar) {
      this.progressBar.remove();
      this.progressBar = null;
    }
  }
  
  /**
   * Create hint box for keyboard shortcuts
   */
  private createHintBox(): void {
    if (this.hintBox) return;
    
    this.hintBox = document.createElement('div');
    this.hintBox.id = 'keyboard-hint-box';
    this.hintBox.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: var(--bg-elevated);
      border: var(--border-subtle);
      border-radius: var(--radius-lg);
      padding: 16px 20px;
      box-shadow: var(--shadow-lg);
      z-index: 9000;
      font-size: 13px;
      color: var(--text-secondary);
      min-width: 280px;
      transition: all 0.3s ease;
    `;
    
    this.updateHintBox();
    document.body.appendChild(this.hintBox);
  }
  
  /**
   * Update hint box content based on autoplay state
   */
  private updateHintBox(): void {
    if (!this.hintBox) return;
    
    if (this.isAutoPlaying) {
      this.hintBox.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
          <div style="width: 8px; height: 8px; background: var(--growth-500); border-radius: 50%; animation: pulse 2s ease-in-out infinite;"></div>
          <span style="color: var(--growth-400); font-weight: 600;">Autoplay Active</span>
        </div>
        <div style="color: var(--text-muted); font-size: 12px; display: flex; flex-direction: column; gap: 6px;">
          <span>Press <kbd style="background: var(--dark-700); padding: 2px 6px; border-radius: 4px; font-family: monospace;">Space</kbd> to pause</span>
          <span>Speed: <strong style="color: var(--text-primary);">${this.getSpeedLabel()}</strong> (1=Fast, 2=Normal, 3=Slow)</span>
        </div>
      `;
    } else {
      this.hintBox.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 8px; color: var(--text-primary);">
          Keyboard Shortcuts
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Navigate</span>
            <span style="color: var(--text-muted);">
              <kbd style="background: var(--dark-700); padding: 2px 6px; border-radius: 4px; font-family: monospace;">↑</kbd>
              <kbd style="background: var(--dark-700); padding: 2px 6px; border-radius: 4px; font-family: monospace;">↓</kbd>
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Autoplay</span>
            <kbd style="background: var(--dark-700); padding: 2px 6px; border-radius: 4px; font-family: monospace;">Space</kbd>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Speed</span>
            <span style="color: var(--text-muted);">
              <kbd style="background: var(--dark-700); padding: 2px 6px; border-radius: 4px; font-family: monospace;">1</kbd>
              <kbd style="background: var(--dark-700); padding: 2px 6px; border-radius: 4px; font-family: monospace;">2</kbd>
              <kbd style="background: var(--dark-700); padding: 2px 6px; border-radius: 4px; font-family: monospace;">3</kbd>
            </span>
          </div>
        </div>
      `;
    }
  }
  
  /**
   * Remove hint box
   */
  private removeHintBox(): void {
    if (this.hintBox) {
      this.hintBox.remove();
      this.hintBox = null;
    }
  }
  
  public cleanup(): void {
    // Stop auto-play
    this.stopAutoPlay();
    
    // Remove hint box
    this.removeHintBox();
    
    // Remove keyboard handler
    if (this.keyboardHandler) {
      window.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
    
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    if (currentStoryModeInstance === this) {
      currentStoryModeInstance = null;
    }
  }
}
