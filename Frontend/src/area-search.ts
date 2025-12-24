/**
 * Area Search with Autocomplete
 * Provides debounced search with suggestions for UK small areas
 */

import { LngLatBounds } from 'maplibre-gl';

const API_BASE_URL = 'http://localhost:3000';

interface AreaResult {
  id: string;
  name: string;
  lookups_local_authority: string | null;
  lookups_nation: string | null;
  urban_rural?: string | null;
  area_type_display?: string | null;
  type: 'small_area' | 'local_authority' | 'nation';
}

interface SelectedArea {
  id: string;
  name: string;
  localAuthority: string;
  nation: string;
  type: 'small_area' | 'local_authority' | 'nation';
  urbanRural: string;
  areaTypeDisplay: string;
  center: [number, number];
}

export class AreaSearch {
  private input: HTMLInputElement;
  private suggestionsContainer: HTMLElement;
  private searchBtn: HTMLButtonElement;
  private surpriseBtn: HTMLButtonElement;
  private mapPickBtn: HTMLButtonElement;
  private resetBtn: HTMLButtonElement;
  private container: HTMLElement;
  private layerToggle: HTMLElement;
  private debounceTimer: number | null = null;
  private selectedIndex: number = -1;
  private suggestions: AreaResult[] = [];
  private onSelectCallback: ((area: SelectedArea) => void) | null = null;
  private onMapPickModeChange: ((enabled: boolean, layer: string) => void) | null = null;
  private onResetCallback: (() => void) | null = null;
  private isPickingMode: boolean = false;
  private currentLayer: string = 'nation';
  private map: any | null = null;
  
  // Store element IDs for reinit
  private inputId: string;
  private suggestionsId: string;
  private searchBtnId: string;
  private surpriseBtnId: string;
  private mapPickBtnId: string;
  private resetBtnId: string;
  private containerId: string;
  private layerToggleId: string;
  
  // Store event handlers for cleanup
  private handlers: Map<HTMLElement, Map<string, EventListener>> = new Map();

  constructor(
    inputId: string = 'area-search',
    suggestionsId: string = 'area-suggestions',
    searchBtnId: string = 'area-search-btn',
    surpriseBtnId: string = 'area-surprise-btn',
    mapPickBtnId: string = 'area-map-pick-btn',
    resetBtnId: string = 'area-reset-btn',
    containerId: string = 'area-search-container',
    layerToggleId: string = 'map-layer-toggle'
  ) {
    // Store IDs for later reinit
    this.inputId = inputId;
    this.suggestionsId = suggestionsId;
    this.searchBtnId = searchBtnId;
    this.surpriseBtnId = surpriseBtnId;
    this.mapPickBtnId = mapPickBtnId;
    this.resetBtnId = resetBtnId;
    this.containerId = containerId;
    this.layerToggleId = layerToggleId;

    this.input = document.getElementById(inputId) as HTMLInputElement;
    this.suggestionsContainer = document.getElementById(suggestionsId) as HTMLElement;
    this.searchBtn = document.getElementById(searchBtnId) as HTMLButtonElement;
    this.surpriseBtn = document.getElementById(surpriseBtnId) as HTMLButtonElement;
    this.mapPickBtn = document.getElementById(mapPickBtnId) as HTMLButtonElement;
    this.resetBtn = document.getElementById(resetBtnId) as HTMLButtonElement;
    this.container = document.getElementById(containerId) as HTMLElement;
    this.layerToggle = document.getElementById(layerToggleId) as HTMLElement;

    if (!this.input || !this.suggestionsContainer || !this.searchBtn || !this.surpriseBtn || !this.mapPickBtn || !this.resetBtn || !this.container || !this.layerToggle) {
      console.warn('Area search elements not found. Search will be inactive.');
      return;
    }

    this.init();
  }

  private addEventListenerTracked(element: HTMLElement, event: string, handler: EventListener): void {
    element.addEventListener(event, handler);
    if (!this.handlers.has(element)) {
      this.handlers.set(element, new Map());
    }
    this.handlers.get(element)!.set(event, handler);
  }

  private init(): void {
    console.log('🔧 Initializing area search event listeners');
    
    // Input event with debounce
    const inputHandler = (e: Event) => {
      const query = (e.target as HTMLInputElement).value.trim();
      
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      if (query.length < 2) {
        this.hideSuggestions();
        return;
      }

      this.debounceTimer = window.setTimeout(() => {
        this.fetchSuggestions(query);
      }, 300);
    };
    this.addEventListenerTracked(this.input, 'input', inputHandler);

    // Keyboard navigation
    const keydownHandler = (e: Event) => {
      const keyEvent = e as KeyboardEvent;
      if (!this.suggestionsContainer.classList.contains('active')) return;

      switch (keyEvent.key) {
        case 'ArrowDown':
          keyEvent.preventDefault();
          this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
          this.updateSelectedItem();
          break;
        case 'ArrowUp':
          keyEvent.preventDefault();
          this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
          this.updateSelectedItem();
          break;
        case 'Enter':
          keyEvent.preventDefault();
          if (this.selectedIndex >= 0) {
            this.selectArea(this.suggestions[this.selectedIndex]);
          }
          break;
        case 'Escape':
          this.hideSuggestions();
          break;
      }
    };
    this.addEventListenerTracked(this.input, 'keydown', keydownHandler);

    // Search button click
    const searchBtnHandler = () => {
      if (this.selectedIndex >= 0 && this.suggestions.length > 0) {
        this.selectArea(this.suggestions[this.selectedIndex]);
      } else if (this.input.value.trim()) {
        this.fetchSuggestions(this.input.value.trim(), true);
      }
    };
    this.addEventListenerTracked(this.searchBtn, 'click', searchBtnHandler);

    // Surprise Me button click
    const surpriseBtnHandler = () => {
      this.selectRandomArea();
    };
    this.addEventListenerTracked(this.surpriseBtn, 'click', surpriseBtnHandler);

    // Map Pick button click
    const mapPickBtnHandler = () => {
      this.toggleMapPickingMode();
    };
    this.addEventListenerTracked(this.mapPickBtn, 'click', mapPickBtnHandler);

    // Reset button click
    const resetBtnHandler = () => {
      this.resetSelection();
    };
    this.addEventListenerTracked(this.resetBtn, 'click', resetBtnHandler);

    // Layer toggle buttons
    const layerBtns = this.layerToggle.querySelectorAll('.layer-toggle-btn');
    layerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const layer = target.dataset.layer;
        if (layer) {
          this.setActiveLayer(layer);
        }
      });
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.input.contains(e.target as Node) && 
          !this.suggestionsContainer.contains(e.target as Node)) {
        this.hideSuggestions();
      }
    });
  }

  private async fetchSuggestions(query: string, selectFirst: boolean = false): Promise<void> {
    this.showLoading();

    try {
      // Search by area name or code
      const response = await fetch(`${API_BASE_URL}/api/search-areas?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results: AreaResult[] = await response.json();
      this.suggestions = results;
      this.renderSuggestions(results);

      if (selectFirst && results.length > 0) {
        this.selectArea(results[0]);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      this.showEmpty('Error loading suggestions');
    }
  }

  private renderSuggestions(results: AreaResult[]): void {
    if (results.length === 0) {
      this.showEmpty('No areas found');
      return;
    }

    this.suggestionsContainer.innerHTML = '';
    this.suggestionsContainer.classList.add('active');

    results.forEach((result, index) => {
      const item = document.createElement('div');
      item.className = 'area-suggestion-item';
      item.dataset.index = index.toString();

      const name = document.createElement('div');
      name.className = 'area-suggestion-name';
      name.textContent = result.name;

      const meta = document.createElement('div');
      meta.className = 'area-suggestion-meta';
      
      // Build metadata based on type
      if (result.type === 'nation') {
        meta.textContent = 'Nation';
      } else if (result.type === 'local_authority') {
        const nation = document.createElement('span');
        nation.textContent = result.lookups_nation || '';
        meta.appendChild(nation);
      } else {
        const la = document.createElement('span');
        la.textContent = result.lookups_local_authority || '';
        
        const sep1 = document.createElement('span');
        sep1.className = 'separator';
        sep1.textContent = '•';
        
        const nation = document.createElement('span');
        nation.textContent = result.lookups_nation || '';

        meta.appendChild(la);
        meta.appendChild(sep1);
        meta.appendChild(nation);
      }

      // Add type badge with color coding
      const sep = document.createElement('span');
      sep.className = 'separator';
      sep.textContent = '•';
      
      const type = document.createElement('span');
      type.className = 'area-suggestion-type';
      
      if (result.type === 'nation') {
        type.textContent = 'Nation';
        type.style.background = '#10b981';
      } else if (result.type === 'local_authority') {
        type.textContent = 'Local Authority';
        type.style.background = '#3b82f6';
      } else if (result.area_type_display) {
        type.textContent = result.area_type_display;
      }
      
      if (type.textContent) {
        meta.appendChild(sep);
        meta.appendChild(type);
      }

      item.appendChild(name);
      item.appendChild(meta);

      item.addEventListener('click', () => {
        this.selectArea(result);
      });

      this.suggestionsContainer.appendChild(item);
    });
  }

  private updateSelectedItem(): void {
    const items = this.suggestionsContainer.querySelectorAll('.area-suggestion-item');
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected');
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  private async selectRandomArea(): Promise<void> {
    try {
      this.surpriseBtn.disabled = true;
      this.surpriseBtn.textContent = 'Loading...';
      
      const response = await fetch(`${API_BASE_URL}/api/random-area`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch random area');
      }

      const result: AreaResult = await response.json();
      this.input.value = result.name;
      this.hideSuggestions();
      
      // Query map to get feature geometry and calculate centroid
      let centroid: [number, number] | undefined = undefined;
      
      // Function to query features and calculate centroid
      const calculateCentroid = () => {
        try {
          // Determine which layer to query based on type
          let layerId: string;
          let propertyKey: string;
          let propertyValue: string;
          
          if (result.type === 'nation') {
            layerId = 'nations-fill';
            propertyKey = 'lookups_nation';
            propertyValue = result.id;
          } else if (result.type === 'local_authority') {
            layerId = 'las-fill';
            propertyKey = 'lookups_local_authority';
            propertyValue = result.id;
          } else {
            layerId = 'sa-fill';
            propertyKey = 'small_area';
            propertyValue = result.id;
          }
          
          console.log('🔍 Querying for random area:', { layerId, propertyKey, propertyValue });
          
          // Check if layer exists
          if (!this.map.getLayer(layerId)) {
            console.warn('⚠️ Layer not loaded yet:', layerId);
            return undefined;
          }
          
          // Query rendered features from the specific layer
          const features = this.map.queryRenderedFeatures(undefined, {
            layers: [layerId]
          }).filter((f: any) => f.properties[propertyKey] === propertyValue);
          
          console.log('📍 Features found for random area:', features.length);
          
          if (features.length > 0) {
            const feature = features[0];
            console.log('✅ Found feature for random area:', feature.properties);
            
            // Calculate centroid from geometry
            const bounds = new LngLatBounds();
            
            if (feature.geometry.type === 'Polygon') {
              (feature.geometry as any).coordinates[0].forEach((coord: number[]) => {
                bounds.extend([coord[0], coord[1]]);
              });
            } else if (feature.geometry.type === 'MultiPolygon') {
              (feature.geometry as any).coordinates.forEach((polygon: number[][][]) => {
                polygon[0].forEach((coord: number[]) => {
                  bounds.extend([coord[0], coord[1]]);
                });
              });
            }
            
            const center = bounds.getCenter();
            return [center.lng, center.lat] as [number, number];
          } else {
            console.warn('⚠️ No features found for random area');
            return undefined;
          }
        } catch (error) {
          console.error('Error calculating centroid for random area:', error);
          return undefined;
        }
      };
      
      // Wait for map to be ready and calculate centroid
      if (this.map) {
        if (this.map.isStyleLoaded() && this.map.loaded()) {
          console.log('✅ Map ready, calculating centroid immediately');
          centroid = calculateCentroid();
        } else {
          // Wait for map to be idle (all sources loaded)
          console.log('⏳ Waiting for map to be ready...');
          await new Promise<void>((resolve) => {
            this.map.once('idle', () => {
              console.log('✅ Map idle, calculating centroid');
              centroid = calculateCentroid();
              resolve();
            });
          });
        }
      }
      
      // If centroid wasn't calculated, use fallback based on type
      if (!centroid) {
        console.log('📍 Using fallback centroid for type:', result.type);
        if (result.type === 'nation') {
          // Northern Ireland vs England/Wales default positions
          centroid = result.id === 'NI' ? [-6.5, 54.7] : [-2, 52.5];
        } else {
          // Generic UK center as last resort
          centroid = [-3, 55];
        }
      }
      
      // Use fetchAndSelectArea to properly handle the selection with centroid
      await this.fetchAndSelectArea(result, centroid);
      
    } catch (error) {
      console.error('Error selecting random area:', error);
      alert('Failed to load random area. Please try again.');
    } finally {
      this.surpriseBtn.disabled = false;
      this.surpriseBtn.textContent = 'Surprise Me!';
    }
  }

  private async selectArea(result: AreaResult, centroid?: [number, number]): Promise<void> {
    this.hideSuggestions();
    this.input.value = result.name;

    // For nations and LAs, set proper localAuthority field
    let localAuthority: string;
    if (result.type === 'nation') {
      // Nations don't have a local authority - use nation name
      localAuthority = result.name;
    } else if (result.type === 'local_authority') {
      // LAs use their own name
      localAuthority = result.name;
    } else {
      // Small areas use lookups_local_authority
      localAuthority = result.lookups_local_authority || result.name;
    }

    const selectedArea: SelectedArea = {
      id: result.id,
      name: result.name,
      localAuthority: localAuthority,
      nation: result.lookups_nation || result.name,
      type: result.type,
      urbanRural: result.urban_rural || '',
      areaTypeDisplay: result.area_type_display || '',
      center: centroid || [-3, 55] // Use provided centroid or default
    };

    if (this.onSelectCallback) {
      this.onSelectCallback(selectedArea);
    }
    
    // Show reset button
    this.showResetButton();
    
    // Clear input focus to allow re-searching
    this.input.blur();
    
    // Auto-scroll to intro section (second section)
    setTimeout(() => {
      const contentSection = document.querySelector('[data-story="intro"]');
      if (contentSection) {
        contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollBy({ top: 800, behavior: 'smooth' });
      }
    }, 300);
  }
  
  private showLoading(): void {
    this.suggestionsContainer.innerHTML = '<div class="area-suggestions-loading">Searching</div>';
    this.suggestionsContainer.classList.add('active');
  }

  private showEmpty(message: string): void {
    this.suggestionsContainer.innerHTML = `<div class="area-suggestions-empty">${message}</div>`;
    this.suggestionsContainer.classList.add('active');
  }

  private hideSuggestions(): void {
    this.suggestionsContainer.classList.remove('active');
    this.selectedIndex = -1;
  }

  public onSelect(callback: (area: SelectedArea) => void): void {
    this.onSelectCallback = callback;
  }

  public onMapPickMode(callback: (enabled: boolean, layer: string) => void): void {
    this.onMapPickModeChange = callback;
  }

  public onReset(callback: () => void): void {
    this.onResetCallback = callback;
  }

  public setMap(map: any): void {
    this.map = map;
  }

  /**
   * Destroy all event listeners (call before DOM re-render)
   */
  public destroy(): void {
    console.log('🧹 Destroying area search event listeners');
    
    // Remove all tracked event listeners
    this.handlers.forEach((eventMap, element) => {
      eventMap.forEach((handler, event) => {
        element.removeEventListener(event, handler);
      });
    });
    
    this.handlers.clear();
    
    // Clear debounce timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
  }

  /**
   * Reinitialize after DOM re-render (e.g., when area is selected)
   */
  public reinit(): void {
    console.log('🔄 Reinitializing area search after DOM update');
    
    // Destroy old listeners first
    this.destroy();
    
    // Re-query DOM elements
    this.input = document.getElementById(this.inputId) as HTMLInputElement;
    this.suggestionsContainer = document.getElementById(this.suggestionsId) as HTMLElement;
    this.searchBtn = document.getElementById(this.searchBtnId) as HTMLButtonElement;
    this.surpriseBtn = document.getElementById(this.surpriseBtnId) as HTMLButtonElement;
    this.mapPickBtn = document.getElementById(this.mapPickBtnId) as HTMLButtonElement;
    this.resetBtn = document.getElementById(this.resetBtnId) as HTMLButtonElement;
    this.container = document.getElementById(this.containerId) as HTMLElement;
    this.layerToggle = document.getElementById(this.layerToggleId) as HTMLElement;

    if (!this.input || !this.suggestionsContainer || !this.searchBtn || !this.surpriseBtn || !this.mapPickBtn || !this.resetBtn || !this.container || !this.layerToggle) {
      console.warn('⚠️ Area search elements not found after reinit. Search will be inactive.');
      return;
    }

    // Re-attach event listeners
    this.init();
    
    console.log('✅ Area search reinitialized successfully');
  }

  private showResetButton(): void {
    this.resetBtn.style.display = 'block';
  }

  private hideResetButton(): void {
    this.resetBtn.style.display = 'none';
  }

  private resetSelection(): void {
    console.log('🔄 Resetting area selection');
    
    // Clear input
    this.input.value = '';
    this.hideSuggestions();
    
    // Hide reset button
    this.hideResetButton();
    
    // Notify callback to clear selected area
    if (this.onResetCallback) {
      this.onResetCallback();
    }
    
    // Scroll back to hero
    const heroSection = document.querySelector('[data-story="hero"]');
    if (heroSection) {
      heroSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  private toggleMapPickingMode(): void {
    this.isPickingMode = !this.isPickingMode;
    
    console.log('🔘 Toggle map picking mode:', this.isPickingMode);
    
    if (this.isPickingMode) {
      this.mapPickBtn.textContent = 'Let me search';
      this.hideSuggestions();
      
      if (this.onMapPickModeChange) {
        this.onMapPickModeChange(true, this.currentLayer);
      }
    } else {
      this.mapPickBtn.textContent = 'Pick on the map';
      
      if (this.onMapPickModeChange) {
        this.onMapPickModeChange(false, this.currentLayer);
      }
    }
  }

  private setActiveLayer(layer: string): void {
    this.currentLayer = layer;
    
    // Update active button
    const layerBtns = this.layerToggle.querySelectorAll('.layer-toggle-btn');
    layerBtns.forEach(btn => {
      if ((btn as HTMLElement).dataset.layer === layer) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
    
    // Notify callback
    if (this.onMapPickModeChange && this.isPickingMode) {
      this.onMapPickModeChange(true, layer);
    }
  }

  public handleMapClick(feature: any, centroid: [number, number]): void {
    if (!this.isPickingMode) return;
    
    console.log('🎯 Clicked feature:', feature.properties, 'Layer:', feature.layer.id, 'Centroid:', centroid);
    
    // Detect actual layer type from feature
    let layerType: 'small_area' | 'local_authority' | 'nation';
    if (feature.layer.id.includes('nations')) {
      layerType = 'nation';
    } else if (feature.layer.id.includes('las')) {
      layerType = 'local_authority';
    } else {
      layerType = 'small_area';
    }
    
    console.log('🔍 Detected layer type:', layerType);
    
    // Extract proper ID and name based on layer type
    let id: string;
    let name: string;
    
    if (layerType === 'nation') {
      // Nations use lookups_nation property
      const nationCode = feature.properties.lookups_nation;
      id = nationCode;
      name = nationCode === 'Eng/Wales' ? 'England/Wales' : nationCode === 'NI' ? 'Northern Ireland' : nationCode;
    } else if (layerType === 'local_authority') {
      // Local authorities use lookups_local_authority
      id = feature.properties.lookups_local_authority || feature.properties.name;
      name = feature.properties.lookups_local_authority || feature.properties.name;
    } else {
      // Small areas use small_area property
      id = feature.properties.small_area || feature.properties.id;
      name = feature.properties.small_area || feature.properties.name;
    }
    
    // Convert map feature to area selection
    const result: AreaResult = {
      id: id,
      name: name,
      lookups_local_authority: feature.properties.lookups_local_authority || null,
      lookups_nation: feature.properties.lookups_nation || null,
      urban_rural: feature.properties.urban_rural || null,
      area_type_display: feature.properties.area_type_display || null,
      type: layerType
    };
    
    console.log('✅ Parsed area result:', result);
    
    // Exit picking mode
    this.toggleMapPickingMode();
    
    // Fetch proper area data from API and select it with centroid
    this.fetchAndSelectArea(result, centroid);
  }

  private async fetchAndSelectArea(result: AreaResult, centroid: [number, number]): Promise<void> {
    // For nations and local authorities, use the data directly
    // Story mode will handle the camera position based on UK_DEFAULT_CAMERA
    if (result.type === 'nation' || result.type === 'local_authority') {
      console.log('📍 Using direct data for', result.type, 'with centroid:', centroid);
      this.selectArea(result, centroid);
      return;
    }
    
    // For small areas, try to get more complete data from API
    try {
      const searchQuery = result.name;
      const response = await fetch(`${API_BASE_URL}/api/search-areas?q=${encodeURIComponent(searchQuery)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch area details');
      }
      
      const areas: AreaResult[] = await response.json();
      
      // Find exact match
      const matchedArea = areas.find(a => 
        a.id === result.id && a.type === result.type
      );
      
      if (matchedArea) {
        console.log('🔍 Found matched area from API:', matchedArea);
        this.selectArea(matchedArea, centroid);
      } else {
        console.warn('⚠️ No exact match found, using clicked area');
        this.selectArea(result, centroid);
      }
    } catch (error) {
      console.error('Error fetching area details:', error);
      // Fallback to using the clicked result
      this.selectArea(result, centroid);
    }
  }
}
