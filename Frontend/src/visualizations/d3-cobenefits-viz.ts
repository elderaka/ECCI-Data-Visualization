/**
 * D3.js Creative Visualizations for Co-Benefits
 * Adapted from Iqbal's designs to use real Backend API data
 */

import * as d3 from 'd3';

export interface TimeSeriesData {
  year: number;
  [key: string]: number;
}

export interface HousingComparisonData {
  name: string;
  excessCold: number;
  dampness: number;
  excessHeat: number;
}

export interface NoiseRankingData {
  name: string;
  value: number;
}

/**
 * Renders a beautiful stacked area chart with D3
 * Shows multiple co-benefit categories over time
 */
export function renderStackedAreaD3(
  containerId: string,
  data: TimeSeriesData[],
  categories: string[]
): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  // Clear previous content
  container.innerHTML = '';

  // Setup SVG
  const margin = { top: 40, right: 30, bottom: 60, left: 80 };
  const containerWidth = container.clientWidth || 800;
  const containerHeight = container.clientHeight || 500;
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

  // Color palette
  const colorMap: Record<string, { base: string; gradient: string }> = {
    'Physical Activity': { base: '#10B981', gradient: '#34D399' },
    'Air Quality': { base: '#3B82F6', gradient: '#60A5FA' },
    'Excess Cold': { base: '#06B6D4', gradient: '#22D3EE' },
    'Noise': { base: '#8B5CF6', gradient: '#A78BFA' },
    'Sum': { base: '#F59E0B', gradient: '#FCD34D' }
  };

  // Define gradients
  const defs = svg.append('defs');
  categories.forEach((key) => {
    const color = colorMap[key] || { base: '#94A3B8', gradient: '#CBD5E1' };
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
  const stack = d3.stack<TimeSeriesData>()
    .keys(categories)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone);

  const series = stack(data);

  // Scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year) as [number, number])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(series, s => d3.max(s, d => d[1])) || 0])
    .nice()
    .range([height, 0]);

  // Area generator
  const area = d3.area<d3.SeriesPoint<TimeSeriesData>>()
    .x(d => xScale(d.data.year))
    .y0(d => yScale(d[0]))
    .y1(d => yScale(d[1]))
    .curve(d3.curveCatmullRom.alpha(0.5));

  // Draw areas
  const areas = g.selectAll('.area')
    .data(series)
    .join('path')
    .attr('class', 'area')
    .attr('d', area)
    .attr('fill', d => {
      return `url(#gradient-${d.key.replace(/\s+/g, '-')})`;
    })
    .attr('stroke', d => {
      const colorInfo = colorMap[d.key] || { base: '#94A3B8' };
      return colorInfo.base;
    })
    .attr('stroke-width', 1.5)
    .attr('opacity', 0);

  // Animate areas
  areas.transition()
    .duration(1500)
    .delay((_, i) => i * 200)
    .attr('opacity', 1);

  // Axes
  const xAxis = d3.axisBottom(xScale)
    .ticks(6)
    .tickFormat(d => String(d));

  const yAxis = d3.axisLeft(yScale)
    .ticks(6)
    .tickFormat(d => `£${(d as number / 1000).toFixed(1)}B`);

  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .style('color', '#6B7A8A')
    .selectAll('text')
    .style('font-size', '12px');

  g.append('g')
    .call(yAxis)
    .style('color', '#6B7A8A')
    .selectAll('text')
    .style('font-size', '12px');

  // Interactive overlay
  let hoveredArea: string | null = null;

  const tooltip = d3.select('body').append('div')
    .style('position', 'fixed')
    .style('opacity', 0)
    .style('background', 'rgba(255, 255, 255, 0.98)')
    .style('padding', '12px 16px')
    .style('border-radius', '8px')
    .style('box-shadow', '0 8px 24px rgba(0,0,0,0.12)')
    .style('pointer-events', 'none')
    .style('z-index', '10000')
    .style('font-size', '13px')
    .style('color', '#1A202C');

  const tooltipLine = g.append('line')
    .attr('stroke', '#3B82F6')
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '4 4')
    .attr('opacity', 0)
    .attr('y1', 0)
    .attr('y2', height);

  const overlay = g.append('rect')
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'none')
    .attr('pointer-events', 'all');

  overlay.on('mousemove', (event) => {
    const [mouseX] = d3.pointer(event);
    const year = Math.round(xScale.invert(mouseX));
    const dataPoint = data.find(d => d.year === year);

    if (!dataPoint) return;

    tooltipLine.attr('x1', xScale(year))
      .attr('x2', xScale(year))
      .attr('opacity', 1);

    // Find hovered area
    hoveredArea = null;
    const mouseY = d3.pointer(event)[1];
    const stackedData = series.find(s => {
      const point = s.find(p => p.data.year === year);
      if (!point) return false;
      const y0 = yScale(point[0]);
      const y1 = yScale(point[1]);
      return mouseY >= y1 && mouseY <= y0;
    });

    if (stackedData) {
      hoveredArea = stackedData.key;
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
          <div style="color: #10B981; font-weight: 600;">£${value.toFixed(2)}M</div>
        `);
    }
  });

  overlay.on('mouseleave', () => {
    tooltipLine.attr('opacity', 0);
    tooltip.style('opacity', 0);
    hoveredArea = null;
    areas.transition().duration(200).attr('opacity', 1);
  });

  // Cleanup
  setTimeout(() => {
    const cleanupHandler = () => tooltip.remove();
    window.addEventListener('storyChange', cleanupHandler, { once: true });
  }, 100);
}

/**
 * Renders house-shaped visualization for housing comfort comparison
 */
export function renderHouseShapeViz(
  containerId: string,
  data: HousingComparisonData[]
): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  // Colors
  const colors = {
    excessCold: { base: '#3B82F6', light: '#60A5FA' },
    dampness: { base: '#14B8A6', light: '#2DD4BF' },
    excessHeat: { base: '#F97316', light: '#FB923C' }
  };

  // Setup SVG
  const margin = { top: 60, right: 40, bottom: 80, left: 40 };
  const containerWidth = container.clientWidth || 800;
  const containerHeight = container.clientHeight || 500;
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

  const houseWidth = Math.min(width / 2.5, 250);
  const houseBodyHeight = height * 0.6;
  const roofHeight = height * 0.2;
  const spacing = (width - houseWidth * 2) / 3;

  const maxTotal = d3.max(data, d => d.excessCold + d.dampness + d.excessHeat) || 1;

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

  // Tooltip
  const tooltip = d3.select('body').append('div')
    .style('position', 'fixed')
    .style('opacity', 0)
    .style('background', 'rgba(255, 255, 255, 0.98)')
    .style('padding', '12px 16px')
    .style('border-radius', '8px')
    .style('box-shadow', '0 8px 24px rgba(0,0,0,0.12)')
    .style('pointer-events', 'none')
    .style('z-index', '10000')
    .style('font-size', '13px');

  // Draw houses
  data.forEach((house, i) => {
    const x = spacing + i * (houseWidth + spacing);
    const total = house.excessCold + house.dampness + house.excessHeat;
    const scale = total / maxTotal;
    const scaledBodyHeight = houseBodyHeight * scale;
    const scaledRoofHeight = roofHeight * scale;

    const houseGroup = g.append('g')
      .attr('class', 'house')
      .attr('opacity', 0);

    // House segments
    const segments = [
      { key: 'excessCold', value: house.excessCold, label: 'Excess Cold' },
      { key: 'dampness', value: house.dampness, label: 'Dampness' },
      { key: 'excessHeat', value: house.excessHeat, label: 'Excess Heat' }
    ];

    let cumulativeHeight = 0;
    segments.forEach((seg) => {
      const segHeight = (seg.value / total) * scaledBodyHeight;
      const y = height - cumulativeHeight - segHeight;

      houseGroup.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('width', houseWidth)
        .attr('height', segHeight)
        .attr('fill', `url(#house-gradient-${seg.key})`)
        .attr('stroke', colors[seg.key as keyof typeof colors].base)
        .attr('stroke-width', 2)
        .on('mouseover', function(event) {
          d3.select(this).attr('opacity', 0.8);
          tooltip
            .style('opacity', 1)
            .style('left', `${event.pageX + 15}px`)
            .style('top', `${event.pageY - 40}px`)
            .html(`
              <div style="font-weight: 600;">${house.name}</div>
              <div style="color: #6B7A8A; margin-top: 4px;">${seg.label}</div>
              <div style="color: ${colors[seg.key as keyof typeof colors].base}; font-weight: 600;">£${seg.value.toFixed(2)}M per household</div>
            `);
        })
        .on('mouseout', function() {
          d3.select(this).attr('opacity', 1);
          tooltip.style('opacity', 0);
        });

      cumulativeHeight += segHeight;
    });

    // Roof
    const roofY = height - scaledBodyHeight - scaledRoofHeight;
    const roofPath = `
      M ${x + houseWidth / 2},${roofY}
      L ${x + houseWidth},${roofY + scaledRoofHeight}
      L ${x},${roofY + scaledRoofHeight}
      Z
    `;

    houseGroup.append('path')
      .attr('d', roofPath)
      .attr('fill', '#64748B')
      .attr('stroke', '#475569')
      .attr('stroke-width', 2);

    // Label
    g.append('text')
      .attr('x', x + houseWidth / 2)
      .attr('y', height + 30)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('font-weight', '600')
      .style('fill', '#1A202C')
      .text(house.name);

    g.append('text')
      .attr('x', x + houseWidth / 2)
      .attr('y', height + 48)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('fill', '#6B7A8A')
      .text(`£${total.toFixed(2)}M total`);

    // Animate
    houseGroup.transition()
      .duration(800)
      .delay(i * 400)
      .attr('opacity', 1);
  });

  // Cleanup
  setTimeout(() => {
    const cleanupHandler = () => tooltip.remove();
    window.addEventListener('storyChange', cleanupHandler, { once: true });
  }, 100);
}

/**
 * Renders animated landscape with health benefits over time
 */
export function renderActiveStreetsViz(
  containerId: string,
  data: TimeSeriesData[]
): void {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  // Setup SVG
  const margin = { top: 40, right: 40, bottom: 60, left: 80 };
  const containerWidth = container.clientWidth || 800;
  const containerHeight = container.clientHeight || 500;
  const width = Math.max(containerWidth - margin.left - margin.right, 400);
  const height = Math.max(containerHeight - margin.top - margin.bottom, 300);

  const svg = d3.select(container)
    .append('svg')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
    .attr('preserveAspectRatio', 'xMidYMid meet');

  // Gradients
  const defs = svg.append('defs');

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

  svg.append('rect')
    .attr('width', '100%')
    .attr('height', '100%')
    .attr('fill', 'url(#sky-gradient)');

  const g = svg.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  // Scales - use physical_activity if available, otherwise first numeric field
  const valueKey = 'physical_activity' in data[0] ? 'physical_activity' : Object.keys(data[0]).find(k => k !== 'year') || 'value';
  
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year) as [number, number])
    .range([0, width]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d[valueKey]) || 0])
    .nice()
    .range([height, 0]);

  // Area generator
  const area = d3.area<TimeSeriesData>()
    .x(d => xScale(d.year))
    .y0(height)
    .y1(d => yScale(d[valueKey]))
    .curve(d3.curveCatmullRom.alpha(0.5));

  const line = d3.line<TimeSeriesData>()
    .x(d => xScale(d.year))
    .y(d => yScale(d[valueKey]))
    .curve(d3.curveCatmullRom.alpha(0.5));

  // Draw hill
  const hillPath = g.append('path')
    .datum(data)
    .attr('fill', 'url(#hill-gradient)')
    .attr('d', area);

  const pathOutline = g.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#059669')
    .attr('stroke-width', 3)
    .attr('d', line);

  // Animate
  const totalLength = pathOutline.node()!.getTotalLength();

  hillPath
    .attr('opacity', 0)
    .transition()
    .duration(2500)
    .attr('opacity', 1);

  pathOutline
    .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
    .attr('stroke-dashoffset', totalLength)
    .transition()
    .duration(2500)
    .attr('stroke-dashoffset', 0);

  // Axes
  const xAxis = d3.axisBottom(xScale).ticks(6).tickFormat(d => String(d));
  const yAxis = d3.axisLeft(yScale).ticks(6).tickFormat(d => `£${(d as number / 1000).toFixed(1)}B`);

  g.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(xAxis)
    .style('color', '#6B7A8A');

  g.append('g')
    .call(yAxis)
    .style('color', '#6B7A8A');
}
