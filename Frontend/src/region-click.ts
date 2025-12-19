import type { Map as MapLibreMap, LngLat } from 'maplibre-gl';
import { LngLatBounds } from 'maplibre-gl';
import { RegionDialog, type RegionDialogData } from './region-dialog';
import type { CompassControl } from './compass-control';
import type { LODControl } from './lod-control';

// Calculate centroid of a feature
function getFeatureCentroid(feature: any): LngLat {
  const bounds = new LngLatBounds();
  
  if (feature.geometry.type === 'Polygon') {
    feature.geometry.coordinates[0].forEach((coord: number[]) => {
      bounds.extend([coord[0], coord[1]]);
    });
  } else if (feature.geometry.type === 'MultiPolygon') {
    feature.geometry.coordinates.forEach((polygon: number[][][]) => {
      polygon[0].forEach((coord: number[]) => {
        bounds.extend([coord[0], coord[1]]);
      });
    });
  }
  
  return bounds.getCenter();
}

// Flag to temporarily disable zone clamping during navigation
let isNavigating = false;

// Dialog management
let hoverDialog: RegionDialog | null = null;
let hoverTimeout: number | null = null;
let persistentDialogs: Map<string, RegionDialog> = new Map();
let comparingDialog: RegionDialog | null = null;

// Get region color based on type
function getRegionColor(layerId: string): string {
  if (layerId.includes('nation')) return '#3b82f6';
  if (layerId.includes('las')) return '#10b981';
  if (layerId.includes('sa')) return '#f59e0b';
  return '#64748b';
}

// Get region type
function getRegionType(layerId: string): 'nation' | 'local-authority' | 'small-area' {
  if (layerId.includes('nation')) return 'nation';
  if (layerId.includes('las')) return 'local-authority';
  return 'small-area';
}

// Get region ID from feature
function getRegionId(feature: any): string {
  return `${feature.layer.id}-${feature.id || feature.properties.id || JSON.stringify(feature.properties)}`;
}

// Get region name
function getRegionName(feature: any): string {
    console.log('Getting name for feature:', feature.properties, 'from layer:', feature.layer.id);
  const type = getRegionType(feature.layer.id);
  
  if (type === 'small-area') {
    return feature.properties.small_area + ' - ' + feature.properties.lookups_local_authority ; // All small areas named "SA" for now
  }else if (type === 'local-authority') {
    return feature.properties.lookups_local_authority || feature.properties.name || `LA ${feature.id || 'Unknown'}`;
  }else if (type === 'nation') {
    return (feature.properties.lookups_nation == 'Eng/Wales' ) ? 'England/Wales' : (feature.properties.lookups_nation == 'NI' ) ? 'Northern Ireland' : feature.properties.lookups_nation || feature.properties.name || `Nation ${feature.id || 'Unknown'}`;
  }
  
  // Try common property names for labels
  return feature.properties.LabelText || 
         feature.properties.name || 
         feature.properties.NAME || 
         feature.properties.label ||
         `${type} ${feature.id || 'Unknown'}`;
}

export function setupRegionClick(map: MapLibreMap, compassControl?: CompassControl, lodControl?: LODControl) {
  // Define clickable layers
  const clickableLayers = [
    'nations-fill',
    'las-fill',
    'sa-fill',
  ];

  // Hover to show temporary dialog (after 2 second delay)
  map.on('mousemove', clickableLayers, (e) => {
    const currentZoom = map.getZoom();
    let validLayers: string[] = [];
    
    // Check if in manual mode - if so, query all visible layers
    if (lodControl?.isManualMode()) {
      // In manual mode, query only layers that have opacity > 0
      validLayers = clickableLayers.filter(layer => {
        const opacity = map.getPaintProperty(layer, 'fill-opacity') as number;
        return opacity > 0;
      });
    } else {
      // Automatic mode: use zoom-based logic
      if (currentZoom >= 10) {
        validLayers = ['sa-fill', 'las-fill', 'nations-fill'];
      } else if (currentZoom >= 7) {
        validLayers = ['las-fill', 'nations-fill'];
      } else {
        validLayers = ['nations-fill'];
      }
    }
    
    const features = map.queryRenderedFeatures(e.point, {
      layers: validLayers,
    });

    if (features.length === 0) {
      // Clear timeout and dialog
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      if (hoverDialog) {
        hoverDialog.close();
        hoverDialog = null;
      }
      return;
    }

    const feature = features[0];
    const featureId = getRegionId(feature);
    
    // Don't show hover dialog if this region has a persistent dialog
    if (persistentDialogs.has(featureId)) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      if (hoverDialog) {
        hoverDialog.close();
        hoverDialog = null;
      }
      return;
    }

    // If hovering over a different region, reset timeout
    if (hoverDialog && getRegionId((hoverDialog.getData() as any).properties.feature) !== featureId) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      if (hoverDialog) {
        hoverDialog.close();
        hoverDialog = null;
      }
    }

    // Start 2-second timeout if not already started
    if (!hoverTimeout && !hoverDialog) {
      hoverTimeout = window.setTimeout(() => {
        const dialogData: RegionDialogData = {
          id: featureId,
          name: getRegionName(feature),
          type: getRegionType(feature.layer.id),
          color: getRegionColor(feature.layer.id),
          properties: { feature },
          smallArea: feature.properties.small_area,
        };
        
        hoverDialog = new RegionDialog(dialogData, e.originalEvent.clientX + 10, e.originalEvent.clientY + 10);
        hoverTimeout = null;
      }, 500); // 2 second delay
    } else if (hoverDialog) {
      // Update position of existing hover dialog
      hoverDialog.setPosition(e.originalEvent.clientX + 10, e.originalEvent.clientY + 10);
    }
    
    map.getCanvas().style.cursor = 'pointer';
  });

  // Clear hover dialog when mouse leaves
  map.on('mouseleave', clickableLayers, () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      hoverTimeout = null;
    }
    if (hoverDialog) {
      hoverDialog.close();
      hoverDialog = null;
    }
    map.getCanvas().style.cursor = '';
  });

  // Click to make dialog persistent
  map.on('click', (e) => {
    const currentZoom = map.getZoom();
    
    // Determine which layers are visible at current zoom
    let validLayers: string[] = [];
    
    // Check if in manual mode - if so, query all visible layers
    if (lodControl?.isManualMode()) {
      // In manual mode, query only layers that have opacity > 0
      validLayers = clickableLayers.filter(layer => {
        const opacity = map.getPaintProperty(layer, 'fill-opacity') as number;
        return opacity > 0;
      });
    } else {
      // Automatic mode: use zoom-based logic
      if (currentZoom >= 10) {
        validLayers = ['sa-fill', 'las-fill', 'nations-fill'];
      } else if (currentZoom >= 7) {
        validLayers = ['las-fill', 'nations-fill'];
      } else {
        validLayers = ['nations-fill'];
      }
    }
    
    const features = map.queryRenderedFeatures(e.point, {
      layers: validLayers,
    });

    if (features.length === 0) {
      // Clicked on empty space - close non-comparing dialogs
      persistentDialogs.forEach((dialog, id) => {
        if (!dialog.isInCompareMode()) {
          dialog.close();
          persistentDialogs.delete(id);
        }
      });
      return;
    }

    const feature = features[0];
    const featureId = getRegionId(feature);
    
    console.log('Clicked feature:', feature.properties, 'from layer:', feature.layer.id, 'at zoom:', currentZoom);

    // Check if dialog already exists
    if (persistentDialogs.has(featureId)) {
      return; // Already showing dialog for this region
    }

    // Close hover dialog if exists
    if (hoverDialog) {
      hoverDialog.close();
      hoverDialog = null;
    }

    // Always close existing non-comparing dialogs (except the one waiting to compare)
    console.log('Closing non-comparing dialogs');
    const dialogsToClose: string[] = [];
    persistentDialogs.forEach((dialog, id) => {
      // Check if this dialog is in an active comparison (both dialogs are comparing)
      const isInActiveComparison = dialog.isInCompareMode() && 
                                   dialog.getLinkedDialog()?.isInCompareMode();
      // Keep the dialog that's waiting for a second dialog to compare (blue state)
      const isWaitingToCompare = dialog === comparingDialog && !dialog.getLinkedDialog();
      
      if (!isWaitingToCompare) {
        // Close single dialogs and active comparisons
        dialog.close();
        dialogsToClose.push(id);
        
        // If this dialog is in an active comparison, also close its linked dialog
        if (isInActiveComparison) {
          const linked = dialog.getLinkedDialog();
          if (linked) {
            const linkedId = Array.from(persistentDialogs.entries())
              .find(([, d]) => d === linked)?.[0];
            if (linkedId) {
              console.log('Closing linked comparison dialog:', linkedId);
              linked.close();
              dialogsToClose.push(linkedId);
            }
          }
        }
      }
    });
    // Remove after iteration to avoid concurrent modification
    dialogsToClose.forEach(id => persistentDialogs.delete(id));

    // Create persistent dialog pinned to map coordinates
    const centroid = getFeatureCentroid(feature);
    const point = map.project(centroid);
    
    const dialogData: RegionDialogData = {
      id: featureId,
      name: getRegionName(feature),
      type: getRegionType(feature.layer.id),
      color: getRegionColor(feature.layer.id),
      properties: { feature },
      smallArea: feature.properties.small_area,
    };
    
    const dialog = new RegionDialog(
      dialogData, 
      point.x + 10, 
      point.y - 50, // Position above centroid
      map, 
      centroid // Pass map and coordinates for tracking
    );
    
    // Set up callbacks before making persistent
    // Handle close
    dialog.setOnClose(() => {
      persistentDialogs.delete(featureId);
    });
    
    // Handle compare mode
    dialog.setOnCompare((thisDialog) => {
      console.log('Compare callback triggered, isInCompareMode:', thisDialog.isInCompareMode());
      if (thisDialog.isInCompareMode()) {
        // Check if this dialog has a linked dialog
        const linked = thisDialog.getLinkedDialog();
        if (linked && linked.isInCompareMode()) {
          // Both dialogs are now in compare mode, clear comparingDialog
          comparingDialog = null;
          console.log('Both dialogs in compare mode, cleared comparingDialog');
        } else {
          // Entering compare mode - waiting for second region
          comparingDialog = thisDialog;
          console.log('Set comparingDialog, waiting for second region click');
        }
      } else {
        // Exiting compare mode
        if (comparingDialog === thisDialog) {
          comparingDialog = null;
          console.log('Cleared comparingDialog');
        }
        // If this dialog was linked, unlink both
        const linked = thisDialog.getLinkedDialog();
        if (linked) {
          linked.unlinkCompare();
        }
      }
    });
    
    // Check if another dialog is waiting to compare
    const shouldLinkForCompare = comparingDialog && comparingDialog !== dialog;
    if (shouldLinkForCompare) {
      const otherDialog = comparingDialog;
      console.log('Another dialog is waiting to compare, will link when ready');
      dialog.setOnReady(() => {
        console.log('Second dialog ready, showing compare prompt');
        // Don't auto-toggle compare mode, just link them
        // The second dialog will show "Compare with X?" button
        dialog.linkCompare(otherDialog!);
        otherDialog!.linkCompare(dialog);
        // Don't clear comparingDialog yet - let the user decide
      });
    }
    
    // Make persistent (this triggers the dialog to be fully ready)
    dialog.makePersistent();
    
    // Store in map
    persistentDialogs.set(featureId, dialog);

    // Navigate to region
    const bounds = new LngLatBounds();
    
    if (feature.geometry.type === 'Polygon') {
      feature.geometry.coordinates[0].forEach((coord: number[]) => {
        bounds.extend([coord[0], coord[1]]);
      });
    } else if (feature.geometry.type === 'MultiPolygon') {
      feature.geometry.coordinates.forEach((polygon: number[][][]) => {
        polygon[0].forEach((coord: number[]) => {
          bounds.extend([coord[0], coord[1]]);
        });
      });
    } else {
      console.warn('Unknown geometry type:', feature.geometry.type);
      return;
    }

    // Set navigation flag to disable zone clamping
    isNavigating = true;
    console.log('Navigation started - zone clamping disabled');

    // Update compass control with the new center
    if (compassControl) {
      compassControl.setLastClickedCenter(centroid);
    }

    // Smooth fly to the region with padding and pitch
    map.fitBounds(bounds, {
      padding: { top: 80, bottom: 80, left: 80, right: 80 },
      pitch: 45, // Add 45-degree pitch for nice 3D view
      duration: 1500, // 1.5 second smooth transition
      essential: true,
    });

    // Re-enable zone clamping after navigation completes
    setTimeout(() => {
      isNavigating = false;
      console.log('Navigation completed - zone clamping re-enabled');
    }, 1600); // Slightly longer than duration
  });
}

// Export function to check if navigation is in progress
export function isNavigationActive(): boolean {
  return isNavigating;
}
