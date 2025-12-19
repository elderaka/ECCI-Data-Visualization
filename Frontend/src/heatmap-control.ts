import type { Map as MapLibreMap } from 'maplibre-gl';
import type { LoadingScreen } from './loading-screen';
import { API_SERVER_URL } from './config';
import type { LODControl } from './lod-control';
export class HeatmapControl {
  private map: MapLibreMap;
  private container: HTMLDivElement;
  private selectedField: string | null = null;
  private loadingScreen: LoadingScreen | null = null;
  private lodControl: LODControl | null = null;
  private currentLOD: 'nation' | 'region' | 'area' | null = null; 
  constructor(map: MapLibreMap, loadingScreen?: LoadingScreen, lodControl?: LODControl) {
    this.map = map;
    this.loadingScreen = loadingScreen || null;
    this.lodControl = lodControl || null;
    this.container = this.createControl();
    if (this.lodControl) {
      this.map.on('zoom', () => {
        if (this.selectedField && !this.lodControl?.isManualMode()) {
          const zoom = Math.floor(this.map.getZoom());
          const newLOD = zoom < 7 ? 'nation' : zoom < 10 ? 'region' : 'area';
          if (newLOD !== this.currentLOD) {
            console.log(`🔄 LOD threshold crossed: ${this.currentLOD} → ${newLOD}`);
            this.updateHeatmap(this.selectedField);
          }
        }
      });
    }
  }
  onAdd(map: MapLibreMap): HTMLElement {
    this.map = map;
    return this.container;
  }
  onRemove(): void {
    this.container.parentNode?.removeChild(this.container);
  }
  getDefaultPosition(): string {
    return 'top-right';
  }
  private createControl(): HTMLDivElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'maplibregl-ctrl maplibregl-ctrl-group heatmap-wrapper';
    wrapper.style.cssText = `
      position: fixed;
      right: 12px;
      top: 50%;
      display: flex;
      align-items: center;
      opacity: 0;
      pointer-events: none;
      z-index: 100;
      background: transparent;
      border: none;
      padding: 0;
      box-shadow: none;
    `;
    let isOpen = false;
    let hoverTimeout: number | null = null;
    wrapper.addEventListener('mouseenter', () => {
      if (!isOpen) {
        hoverTimeout = window.setTimeout(() => {
          container.style.transform = 'translateX(0)';
        }, 500); 
      }
    });
    wrapper.addEventListener('mouseleave', () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      if (!isOpen) {
        container.style.transform = 'translateX(100%)';
      }
    });
    const toggleBtn = document.createElement('button');
    toggleBtn.innerHTML = '◀';
    toggleBtn.style.cssText = `
      background: #1e293b;
      border: 1px solid #475569;
      border-right: none;
      border-radius: 8px 0 0 8px;
      padding: 12px 8px;
      color: #f1f5f9;
      cursor: pointer;
      font-size: 16px;
      transition: background 0.2s;
      z-index: 101;
      flex-shrink: 0;
    `;
    toggleBtn.addEventListener('mouseenter', () => {
      toggleBtn.style.background = '#334155';
    });
    toggleBtn.addEventListener('mouseleave', () => {
      toggleBtn.style.background = '#1e293b';
    });
    toggleBtn.addEventListener('click', () => {
      isOpen = !isOpen;
      if (isOpen) {
        container.style.transform = 'translateX(0)';
        toggleBtn.innerHTML = '▶';
      } else {
        container.style.transform = 'translateX(100%)';
        toggleBtn.innerHTML = '◀';
      }
    });
    const container = document.createElement('div');
    container.style.cssText = `
      background: #1e293b;
      border: 1px solid #475569;
      border-left: none;
      border-radius: 0 8px 8px 0;
      padding: 12px;
      min-width: 200px;
      max-width: 250px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      flex-shrink: 0;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    `;
    wrapper.appendChild(toggleBtn);
    wrapper.appendChild(container);
    return this.populatePanel(wrapper, container);
  }
  private populatePanel(wrapper: HTMLDivElement, container: HTMLDivElement): HTMLDivElement {
    const title = document.createElement('div');
    title.textContent = 'Data Visualization';
    title.style.cssText = `
      color: #f1f5f9;
      font-weight: 600;
      font-size: 13px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #475569;
    `;
    container.appendChild(title);
    const fieldsContainer = document.createElement('div');
    fieldsContainer.style.cssText = `
      max-height: 300px;
      overflow-y: auto;
      padding-right: 4px;
    `;
    const fields = [
      { value: null, label: 'None' },
      { value: 'air_quality', label: 'Air Quality' },
      { value: 'congestion', label: 'Congestion' },
      { value: 'dampness', label: 'Dampness' },
      { value: 'diet_change', label: 'Diet Change' },
      { value: 'excess_cold', label: 'Excess Cold' },
      { value: 'excess_heat', label: 'Excess Heat' },
      { value: 'hassle_costs', label: 'Hassle Costs' },
      { value: 'noise', label: 'Noise' },
      { value: 'physical_activity', label: 'Physical Activity' },
      { value: 'road_repairs', label: 'Road Repairs' },
      { value: 'road_safety', label: 'Road Safety' },
      { value: 'sum', label: 'Total Sum' },
    ];
    fields.forEach(field => {
      const option = this.createRadioOption(field.value, field.label);
      fieldsContainer.appendChild(option);
    });
    container.appendChild(fieldsContainer);
    return wrapper;
  }
  private createRadioOption(value: string | null, label: string): HTMLDivElement {
    const option = document.createElement('div');
    option.style.cssText = `
      display: flex;
      align-items: center;
      padding: 6px 8px;
      margin-bottom: 4px;
      border-radius: 4px;
      cursor: pointer;
      transition: background 0.2s;
    `;
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'heatmap-field';
    radio.value = value || 'none';
    radio.checked = value === null;
    radio.style.cssText = `
      margin-right: 8px;
      cursor: pointer;
    `;
    const labelElem = document.createElement('label');
    labelElem.textContent = label;
    labelElem.style.cssText = `
      color: #e2e8f0;
      font-size: 12px;
      cursor: pointer;
      flex: 1;
    `;
    option.addEventListener('mouseenter', () => {
      option.style.background = '#334155';
    });
    option.addEventListener('mouseleave', () => {
      option.style.background = 'transparent';
    });
    const handleClick = () => {
      radio.checked = true;
      this.selectedField = value;
      this.updateHeatmap(value);
    };
    option.addEventListener('click', handleClick);
    radio.addEventListener('change', handleClick);
    option.appendChild(radio);
    option.appendChild(labelElem);
    return option;
  }
  private async updateHeatmap(field: string | null): Promise<void> {
    console.log('Updating heatmap for field:', field);
    if (!field) {
      this.removeHeatmap();
      this.resetOutlineWidths();
      return;
    }
    this.thinOutlines();
    if (this.loadingScreen) {
      this.loadingScreen.setProgress(0);
      this.loadingScreen.show();
    }
    try {
      const activeLevel = this.lodControl?.getActiveLevel();
      let currentLOD: 'nation' | 'region' | 'area';
      if (activeLevel === 'nations') {
        currentLOD = 'nation';
      } else if (activeLevel === 'las') {
        currentLOD = 'region';
      } else if (activeLevel === 'sa') {
        currentLOD = 'area';
      } else {
        const zoom = Math.floor(this.map.getZoom());
        currentLOD = zoom < 7 ? 'nation' : zoom < 10 ? 'region' : 'area';
      }
      console.log(`Fetching heatmap data for LOD: ${currentLOD}`);
      if (this.loadingScreen) {
        this.loadingScreen.setProgress(30);
      }
      const dataResponse = await fetch(`${API_SERVER_URL}/api/heatmap-data/${field}/${currentLOD}`);
      if (!dataResponse.ok) {
        throw new Error(`Failed to fetch heatmap data`);
      }
      const dataMap = await dataResponse.json(); 
      const values = Object.values(dataMap).filter((v): v is number => typeof v === 'number');
      if (values.length === 0) {
        throw new Error('No valid data to display');
      }
      const sortedValues = values.sort((a, b) => a - b);
      const min = sortedValues[0];
      const max = sortedValues[sortedValues.length - 1];
      const p25 = sortedValues[Math.floor(sortedValues.length * 0.25)];
      const p50 = sortedValues[Math.floor(sortedValues.length * 0.50)];
      const p75 = sortedValues[Math.floor(sortedValues.length * 0.75)];
      console.log(`Field ${field} - LOD ${currentLOD}:`, {
        count: values.length,
        min: min.toFixed(2),
        p25: p25.toFixed(2),
        p50: p50.toFixed(2),
        p75: p75.toFixed(2),
        max: max.toFixed(2)
      });
      if (this.loadingScreen) {
        this.loadingScreen.setProgress(60);
      }
      this.applyHeatmapColors(field, dataMap, sortedValues, min, max, p25, p50, p75, currentLOD);
      if (this.loadingScreen) {
        this.loadingScreen.setProgress(100);
        setTimeout(() => {
          this.loadingScreen?.hide();
        }, 300);
      }
    } catch (error) {
      console.error('Error updating heatmap:', error);
      if (this.loadingScreen) {
        this.loadingScreen.hide();
      }
    }
  }
  private addHeatmapSource(): void {
    console.log('Heatmap will use existing PMTiles sources (nations, local_authorities, small_areas)');
  }
  private applyHeatmapColors(
    field: string, 
    dataMap: Record<string, any>,
    sortedValues: number[],
    min: number, 
    max: number, 
    p25: number, 
    p50: number, 
    p75: number,
    currentLOD: string
  ): void {
    console.log(`Applying heatmap colors for ${field} at LOD: ${currentLOD}`);
    console.log(`Range: ${min} to ${max}, Percentiles: 25th=${p25}, 50th=${p50}, 75th=${p75}`);
    console.log(`Data for ${Object.keys(dataMap).length} regions:`, dataMap);
    let fillLayerId: string;
    let sourceName: string;  
    let sourceLayer: string; 
    let propertyKey: string;
    if (currentLOD === 'nation') {
      fillLayerId = 'nations-fill';
      sourceName = 'nations';
      sourceLayer = 'nation'; 
      propertyKey = 'lookups_nation';
    } else if (currentLOD === 'region') {
      fillLayerId = 'las-fill';
      sourceName = 'las'; 
      sourceLayer = 'local_authorities'; 
      propertyKey = 'lookups_local_authority';
    } else {
      fillLayerId = 'sa-fill';
      sourceName = 'sa'; 
      sourceLayer = 'small_areas'; 
      propertyKey = 'small_area';
    }
    const matchExpression: any = ['match', ['get', propertyKey]];
    Object.entries(dataMap).forEach(([id, value]) => {
      if (id !== 'null' && typeof value === 'number') {
        matchExpression.push(id, value);
      }
    });
    matchExpression.push(p50); 
    const colorStops: [number, string][] = [];
    const range = max - min;
    console.log(`🎨 Building color stops for ${currentLOD}: min=${min}, p50=${p50}, max=${max}, range=${range}`);
    if (currentLOD === 'nation') {
      colorStops.push(
        [min, '#1a9641'],                    
        [min + range * 0.5, '#ffffbf'],      
        [max, '#d7191c']                     
      );
      console.log(`Nation color stops: ${min} (green), ${min + range * 0.5} (yellow), ${max} (red)`);
    } else if (currentLOD === 'region') {
      colorStops.push(
        [min, '#1a9641'],                    
        [min + range * 0.25, '#a6d96a'],     
        [min + range * 0.5, '#ffffbf'],      
        [min + range * 0.75, '#fdae61'],     
        [max, '#d7191c']                     
      );
      console.log(`Region color stops: 5 colors from ${min} to ${max}`);
    } else {
      colorStops.push(
        [min, '#006837'],                    
        [min + range * 0.15, '#1a9641'],     
        [min + range * 0.35, '#a6d96a'],     
        [min + range * 0.5, '#ffffbf'],      
        [min + range * 0.65, '#fdae61'],     
        [min + range * 0.85, '#d7191c'],     
        [max, '#a50026']                     
      );
      console.log(`Area color stops: 7 colors from ${min} to ${max}`);
    }
    const uniqueStops = colorStops.filter((stop, index, arr) => {
      return index === 0 || stop[0] !== arr[index - 1][0];
    });
    if (uniqueStops.length < 2) {
      const fillColorExpression: any = '#ffffbf'; 
      if (this.map.getLayer(fillLayerId)) {
        this.map.setPaintProperty(fillLayerId, 'fill-color', fillColorExpression);
        this.map.setPaintProperty(fillLayerId, 'fill-opacity', 0.7);
        console.log(`✅ Applied uniform heatmap to ${fillLayerId}`);
      }
      return;
    }
    const fillColorExpression: any = ['interpolate', ['linear'], matchExpression];
    uniqueStops.forEach(([value, color]) => {
      fillColorExpression.push(value, color);
    });
    console.log('Fill color expression:', JSON.stringify(fillColorExpression, null, 2));
    console.log(`🔍 Looking for property "${propertyKey}" in ${fillLayerId} features`);
    console.log(`📊 Data map keys:`, Object.keys(dataMap));
    if (this.map.getLayer(fillLayerId)) {
      const features = this.map.querySourceFeatures(sourceName, {
        sourceLayer: sourceLayer
      });
      if (features.length > 0) {
        console.log(`🗺️ Sample feature properties:`, features[0].properties);
        console.log(`🔑 Property "${propertyKey}" value:`, features[0].properties[propertyKey]);
      }
    }
    if (this.map.getLayer(fillLayerId)) {
      this.map.setPaintProperty(fillLayerId, 'fill-color', fillColorExpression);
      this.map.setPaintProperty(fillLayerId, 'fill-opacity', 0.7);
      const visibility = this.map.getLayoutProperty(fillLayerId, 'visibility');
      const allFillLayers = ['nations-fill', 'las-fill', 'sa-fill'];
      allFillLayers.forEach(layerId => {
        if (layerId !== fillLayerId && this.map.getLayer(layerId)) {
          this.map.setPaintProperty(layerId, 'fill-opacity', 0);
        }
      });
      const actualColor = this.map.getPaintProperty(fillLayerId, 'fill-color');
      console.log(`✅ Applied heatmap to ${fillLayerId}`);
      console.log(`   Visibility: ${visibility || 'visible'}`);
      console.log(`   Actual fill-color after setting:`, actualColor);
      this.currentLOD = currentLOD as 'nation' | 'region' | 'area';
      this.addHeatmapDebugLabels(field, dataMap, currentLOD, sourceName, sourceLayer, propertyKey, matchExpression);
    } else {
      console.error(`❌ Layer ${fillLayerId} not found`);
    }
  }
  private addHeatmapDebugLabels(
    field: string, 
    dataMap: Record<string, any>, 
    currentLOD: string, 
    sourceName: string,
    sourceLayer: string, 
    propertyKey: string,
    matchExpression: any
  ): void {
    const labelLayerId = 'heatmap-debug-labels';
    if (this.map.getLayer(labelLayerId)) {
      this.map.removeLayer(labelLayerId);
    }
    this.map.addLayer({
      id: labelLayerId,
      type: 'symbol',
      source: sourceName,
      'source-layer': sourceLayer,
      layout: {
        'text-field': [
          'concat',
          ['get', propertyKey],
          '\n',
          ['to-string', ['round', matchExpression]]
        ],
        'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'],
        'text-size': 12,
        'text-anchor': 'center',
        'visibility': 'none' 
      },
      paint: {
        'text-color': '#ffffff',
        'text-halo-color': '#000000',
        'text-halo-width': 2
      }
    });
    console.log(`📝 Added debug labels layer: ${labelLayerId}`);
  }
  private thinOutlines(): void {
    if (this.map.getLayer('nations-outline')) {
      this.map.setPaintProperty('nations-outline', 'line-width', 0.5);
    }
    if (this.map.getLayer('nations-fill')) {
      this.map.setPaintProperty('nations-fill', 'fill-opacity', 0.8);
    }
    if (this.map.getLayer('las-outline')) {
      this.map.setPaintProperty('las-outline', 'line-width', 0.1);
    }
    if (this.map.getLayer('las-fill')) {
      this.map.setPaintProperty('las-fill', 'fill-opacity', 0.8);
    }
    if (this.map.getLayer('sa-outline')) {
      this.map.setPaintProperty('sa-outline', 'line-width', 0.001);
    }
    if (this.map.getLayer('sa-fill')) {
      this.map.setPaintProperty('sa-fill', 'fill-opacity', 0.8);
    }
  }
  private resetOutlineWidths(): void {
    if (this.map.getLayer('nations-outline')) {
      this.map.setPaintProperty('nations-outline', 'line-width', 2);
    }
    if (this.map.getLayer('las-outline')) {
      this.map.setPaintProperty('las-outline', 'line-width', 1.5);
    }
    if (this.map.getLayer('sa-outline')) {
      this.map.setPaintProperty('sa-outline', 'line-width', 0.2);
    }
  }
  private removeHeatmap(): void {
    if (this.map.getLayer('heatmap-debug-labels')) {
      this.map.removeLayer('heatmap-debug-labels');
    }
    const layers = ['nations-fill', 'las-fill', 'sa-fill'];
    layers.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.setPaintProperty(layerId, 'fill-color', '#1e3a8a');
        this.map.setPaintProperty(layerId, 'fill-opacity', 0.5);
      }
    });
    
    const heatmapLayers = ['heatmap-nations', 'heatmap-las', 'heatmap-sa'];
    heatmapLayers.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.setLayoutProperty(layerId, 'visibility', 'none');
      }
    });
    const labelLayers = ['heatmap-nations-labels', 'heatmap-las-labels', 'heatmap-sa-labels'];
    labelLayers.forEach(layerId => {
      if (this.map.getLayer(layerId)) {
        this.map.removeLayer(layerId);
      }
    });
    if (this.lodControl) {
      if (this.lodControl.isManualMode()) {
        const level = this.lodControl.getActiveLevel();
        if (level) {
          const fillLayer = `${level}-fill`;
          const outlineLayer = `${level}-outline`;
          if (this.map.getLayer(fillLayer)) {
            this.map.setLayoutProperty(fillLayer, 'visibility', 'visible');
          }
          if (this.map.getLayer(outlineLayer)) {
            this.map.setLayoutProperty(outlineLayer, 'visibility', 'visible');
          }
        }
      } else {
        this.lodControl.setAutomaticMode();
      }
    } else {
      const allLayers = ['nations-fill', 'nations-outline', 'las-fill', 'las-outline', 'sa-fill', 'sa-outline'];
      allLayers.forEach(layerId => {
        if (this.map.getLayer(layerId)) {
          this.map.setLayoutProperty(layerId, 'visibility', 'visible');
        }
      });
    }
    console.log('Heatmap removed, restored default layers');
  }
  public getContainer(): HTMLDivElement {
    return this.container;
  }
  public getSelectedField(): string | null {
    return this.selectedField;
  }
  public onLODChange(): void {
    if (this.selectedField) {
      console.log('🔄 LOD changed, reloading heatmap');
      this.updateHeatmap(this.selectedField);
    }
  }
}
