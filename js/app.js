(() => {
  'use strict';

  const { filterMotorcycles, dashboardMetrics, formatCOP, toCSV, validateMotorcycle, STATUS_LABELS, TYPES } = window.MotoCore;
  const STORAGE_KEY = 'sistema-motos-demo-v1';
  const EMPTY_FILTERS = () => ({ brand:'', status:'', minPrice:'', maxPrice:'', minCc:'', maxCc:'', year:'', type:'' });
  const SECTION = { resumen:'Resumen', inventario:'Inventario', categorias:'Categorías', reportes:'Reportes', configuracion:'Configuración de la demo' };
  const FILTER_IDS = { 'filter-min':'minPrice', 'filter-max':'maxPrice', 'filter-cc-min':'minCc', 'filter-cc-max':'maxCc' };
  const DEFAULT_IMAGE_BY_TYPE = {
    'Urbana': 'assets/motos/SM-2412.jpg',
    'Deportiva': 'assets/motos/SM-2409.jpg',
    'Naked': 'assets/motos/SM-2401.jpg',
    'Doble propósito': 'assets/motos/SM-2405.jpg',
    'Touring': 'assets/motos/SM-2413.jpg'
  };

  const ICON_PATHS = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    inventory: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 3 12V4a1 1 0 0 1 1-1h8a2 2 0 0 1 1.4.6l7.2 7.2a2 2 0 0 1 0 2.6Z"/><circle cx="7.5" cy="7.5" r="1.2"/>',
    categories: '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/>',
    reports: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    settings: '<path d="M4 7h9M19 7h1M4 17h3M13 17h7"/><circle cx="16" cy="7" r="2.5"/><circle cx="10" cy="17" r="2.5"/>',
    total: '<path d="M5 17h14M6.5 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm11 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM9 14l2.5-4h3l2.5 4M12 10l1.5-3h3"/>',
    available: '<circle cx="12" cy="12" r="8.5"/><path d="m8.5 12 2.3 2.3 4.8-5"/>',
    reserved: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    sold: '<path d="M5 4h14v16l-3.5-2-3.5 2-3.5-2L5 20V4Z"/><path d="m9 11 2 2 4-4"/>',
    value: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.2v9.6M14.5 9.3c-.5-.8-1.4-1.2-2.5-1.2-1.6 0-2.6.8-2.6 1.9 0 2.7 5.2 1.2 5.2 3.9 0 1.1-1 1.9-2.6 1.9-1.1 0-2-.4-2.5-1.2"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>',
    export: '<path d="M12 3v11m0 0 4-4m-4 4-4-4"/><path d="M4 17v3h16v-3"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
    table: '<rect x="3.5" y="4.5" width="17" height="15" rx="1.5"/><path d="M3.5 9.5h17M9.5 9.5v10M15 9.5v10"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="m15.5 4.5 4 4L8 20H4v-4L15.5 4.5Z"/><path d="m13.5 6.5 4 4"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    moto: '<circle cx="5.5" cy="17" r="3"/><circle cx="18.5" cy="17" r="3"/><path d="M8.5 17h7M10 17l2-6h4l2.5 6M6 11h5l2.5-3H17"/>',
    info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'
  };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const icon = (name, className = '') => `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON_PATHS[name] || ''}</svg>`;
  const km = value => new Intl.NumberFormat('es-CO').format(Number(value) || 0);
  const todayISO = () => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  };
  const shortDate = value => {
    if (!value) return '—';
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('es-CO', { day:'2-digit', month:'short' });
  };

  let storageAvailable = detectStorage();
  let lastFocusedElement = null;
  const initialBikes = () => JSON.parse(JSON.stringify(window.DEMO_MOTORCYCLES));
  const state = {
    bikes: loadBikes(),
    section: 'resumen',
    query: '',
    filters: EMPTY_FILTERS(),
    layout: 'grid',
    sidebarOpen: false
  };

  const root = document.getElementById('view-root');
  const sidebar = document.getElementById('sidebar');
  const sidebarScrim = document.getElementById('sidebar-scrim');
  const mobileMenu = document.getElementById('mobile-menu');
  const dialog = document.getElementById('app-dialog');
  const dialogContent = document.getElementById('dialog-content');
  const toastRegion = document.getElementById('toast-region');

  const bikes = () => state.bikes;

  function detectStorage() {
    try {
      const testKey = `${STORAGE_KEY}-test`;
      localStorage.setItem(testKey, '1');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  function loadBikes() {
    if (!storageAvailable) return initialBikes();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return initialBikes();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : initialBikes();
    } catch {
      storageAvailable = false;
      return initialBikes();
    }
  }

  function persist() {
    if (!storageAvailable) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.bikes));
      return true;
    } catch {
      storageAvailable = false;
      return false;
    }
  }

  function toast(message, type = 'success') {
    const node = document.createElement('div');
    node.className = `toast ${type}`;
    const iconName = type === 'success' ? 'available' : 'info';
    node.innerHTML = `<span class="toast-icon">${icon(iconName)}</span><span>${esc(message)}</span>`;
    while (toastRegion.children.length >= 3) toastRegion.firstElementChild.remove();
    toastRegion.appendChild(node);
    setTimeout(() => node.remove(), 4400);
  }

  function imageUrl(path, width = 800) {
    const value = String(path || '').trim();
    if (!value) return '';
    if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('assets/')) return value;
    return `https://images.unsplash.com/${encodeURIComponent(value)}?auto=format&fit=crop&w=${width}&q=82`;
  }

  function imageMarkup(moto, className = 'moto-image', width = 800, shellClass = '') {
    const label = `${moto.brand} ${moto.model}`;
    return `<div class="image-shell ${shellClass}"><img class="${className}" src="${esc(imageUrl(moto.image, width))}" alt="Motocicleta ${esc(label)}" loading="lazy" decoding="async" onerror="this.hidden=true;this.parentElement.classList.add('is-fallback')"><div class="image-fallback" aria-hidden="true"><span class="fallback-bike">${icon('moto')}</span><small>${esc(label)}</small></div></div>`;
  }

  function heroMarkup() {
    const source = imageUrl(window.DEMO_HERO_IMAGE || 'assets/hero-moto.jpg', 1600);
    return `<div class="hero-art" id="hero-art"><img class="hero-photo" src="${esc(source)}" alt="Motocicleta de exhibición en un entorno oscuro" fetchpriority="high" decoding="async" onerror="this.hidden=true;this.parentElement.classList.add('is-fallback')"><div class="image-fallback hero-fallback" aria-hidden="true"><span class="fallback-bike">${icon('moto')}</span><small>Vitrina digital Sistema Motos</small></div><span class="hero-label">Una vitrina digital para tu negocio</span></div>`;
  }

  function badge(status) {
    const label = STATUS_LABELS[status] || 'Sin estado';
    return `<span class="status-badge ${esc(status)}">${esc(label)}</span>`;
  }

  function heading(title, desc, eyebrow = 'RUTA MOTOR · DEMO', action = '') {
    return `<div class="page-heading"><div><div class="eyebrow">${esc(eyebrow)}</div><h1>${esc(title)}</h1><p>${esc(desc)}</p></div>${action ? `<div class="heading-actions">${action}</div>` : ''}</div>`;
  }

  function metricCard(label, value, foot, iconName, currency = false) {
    return `<article class="metric-card"><div class="metric-top"><span>${esc(label)}</span><span class="metric-icon">${icon(iconName)}</span></div><div class="metric-value${currency ? ' currency' : ''}">${esc(value)}</div><div class="metric-foot">${esc(foot)}</div></article>`;
  }

  function inventoryActionButtons() {
    return `<button class="btn btn-primary" data-action="add">${icon('plus')} Agregar motocicleta</button>`;
  }

  function render() {
    document.getElementById('section-name').textContent = SECTION[state.section];
    document.title = `Sistema Motos · ${SECTION[state.section]}`;
    document.querySelectorAll('[data-nav]').forEach(item => {
      const active = item.dataset.nav === state.section;
      item.classList.toggle('is-active', active);
      if (active) item.setAttribute('aria-current', 'page');
      else item.removeAttribute('aria-current');
    });
    document.getElementById('nav-count').textContent = String(bikes().length);
    if (state.section === 'resumen') renderDashboard();
    else if (state.section === 'inventario') renderInventory();
    else if (state.section === 'categorias') renderCategories();
    else if (state.section === 'reportes') renderReports();
    else renderSettings();
  }

  function renderDashboard() {
    const metrics = dashboardMetrics(bikes());
    const denominator = Math.max(metrics.total, 1);
    const statusRows = [
      ['available', 'Disponibles', metrics.available],
      ['reserved', 'Reservadas', metrics.reserved],
      ['sold', 'Vendidas', metrics.sold]
    ];
    const chartData = TYPES
      .map(type => ({ type, count: bikes().filter(bike => bike.type === type).length }))
      .filter(item => item.count)
      .sort((a, b) => b.count - a.count || a.type.localeCompare(b.type, 'es'));
    const chartMax = Math.max(...chartData.map(item => item.count), 1);
    const recent = [...bikes()].sort((a, b) => String(b.dateAdded || '').localeCompare(String(a.dateAdded || ''))).slice(0, 4);

    root.innerHTML = `
      <section class="overview-hero">
        <div class="hero-copy">
          <div class="eyebrow">ORDEN PARA CRECER</div>
          <h1>Todo tu inventario.<br>En una sola vista.</h1>
          <p>Una forma más clara de organizar, consultar y presentar cada motocicleta de tu negocio.</p>
          <div class="hero-actions"><button class="btn btn-primary" data-nav="inventario">Explorar inventario ${icon('arrow')}</button><button class="btn btn-quiet" data-nav="reportes">Ver reportes</button></div>
        </div>
        ${heroMarkup()}
      </section>
      <section class="metric-grid" aria-label="Indicadores del inventario">
        ${metricCard('Motocicletas', metrics.total, 'Registros totales en la demo', 'total')}
        ${metricCard('Disponibles', metrics.available, 'Listas para consultar', 'available')}
        ${metricCard('Reservadas', metrics.reserved, 'Con reserva activa', 'reserved')}
        ${metricCard('Vendidas', metrics.sold, 'Cerradas en la demo', 'sold')}
        ${metricCard('Valor estimado disponible', formatCOP(metrics.inventoryValue), 'Solo motos disponibles · COP', 'value', true)}
      </section>
      <section class="overview-grid">
        <article class="panel">
          <div class="panel-heading"><div><h2>Inventario por categoría</h2><p>Comparación de cantidades del inventario actual</p></div><button class="text-link" data-nav="reportes">Ver reportes ${icon('arrow')}</button></div>
          <div class="bar-chart category-chart">${chartData.length ? barRows(chartData.map(item => ({ label:item.type, value:item.count })), chartMax) : '<p class="report-note">Aún no hay categorías registradas.</p>'}</div>
        </article>
        <article class="panel">
          <div class="panel-heading"><div><h2>Estado del inventario</h2><p>Distribución actual de los registros</p></div><span class="metric-icon">${icon('dashboard')}</span></div>
          <div class="status-list">${statusRows.map(([key, label, count]) => `<div class="status-row"><span class="status-dot ${key}"></span><span>${label}</span><span class="status-count">${count} <small class="status-pct">· ${Math.round(count / denominator * 100)}%</small></span><div class="status-track"><span class="${key}-fill" style="width:${count / denominator * 100}%"></span></div></div>`).join('')}</div>
        </article>
      </section>
      <section class="panel section-gap">
        <div class="panel-heading"><div><h2>Actividad de demostración</h2><p>Ejemplos de registros recientes incluidos en los datos iniciales</p></div><button class="text-link" data-nav="inventario">Abrir inventario ${icon('arrow')}</button></div>
        <div class="recent-list">${recent.map(bike => `<div class="recent-item">${imageMarkup(bike, 'recent-photo', 120, 'recent-thumb')}<div class="recent-main"><strong>${esc(bike.brand)} ${esc(bike.model)} · ${esc(STATUS_LABELS[bike.status] || 'Sin estado')}</strong><small>Registro de ejemplo · ${esc(bike.id)}</small></div><span class="recent-time">${esc(shortDate(bike.dateAdded))}</span></div>`).join('')}</div>
      </section>`;
  }

  function activeFilterCount() {
    return Object.values(state.filters).filter(Boolean).length;
  }

  function filteredBikes() {
    return filterMotorcycles(bikes(), { ...state.filters, query: state.query });
  }

  function barRows(items, max, formatLabel = item => item.label) {
    return items.map(item => `<div class="bar-row"><span>${esc(formatLabel(item))}</span><div class="bar-track"><div class="bar-fill" style="width:${Math.max(item.value / Math.max(max, 1) * 100, item.value ? 4 : 0)}%"></div></div><span class="bar-val">${item.value}</span></div>`).join('');
  }

  function inventoryResultsMarkup(filtered) {
    const cards = state.layout === 'grid'
      ? `<div class="moto-grid">${filtered.map(bike => `<article class="moto-card"><div class="moto-image-wrap">${imageMarkup(bike, 'moto-image', 650)}${badge(bike.status)}</div><div class="moto-card-body"><div class="moto-brandline"><span>${esc(bike.brand)}</span><span class="moto-id">${esc(bike.id)}</span></div><h3 class="moto-name">${esc(bike.model)} <span class="moto-year">· ${esc(bike.year)}</span></h3><div class="moto-specs"><span>${esc(bike.cc)} cc</span><i class="spec-dot"></i><span>${km(bike.mileage)} km</span><i class="spec-dot"></i><span>${esc(bike.type)}</span></div><div class="moto-price-row"><div class="moto-price">${formatCOP(bike.price)}<small>PRECIO DE REFERENCIA · DEMO</small></div><button class="detail-link" data-action="details" data-id="${esc(bike.id)}">Ver ficha</button></div></div></article>`).join('')}</div>`
      : `<div class="table-wrap"><table class="inventory-table"><thead><tr><th scope="col">Motocicleta</th><th scope="col">Referencia</th><th scope="col">Año / cc</th><th scope="col">Precio ref.</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead><tbody>${filtered.map(bike => `<tr><td><div class="table-bike">${imageMarkup(bike, 'table-img', 120, 'table-thumb')}<span><strong>${esc(bike.brand)} ${esc(bike.model)}</strong><small>${esc(bike.type)} · ${km(bike.mileage)} km</small></span></div></td><td>${esc(bike.id)}</td><td>${esc(bike.year)} · ${esc(bike.cc)} cc</td><td>${formatCOP(bike.price)}</td><td>${badge(bike.status)}</td><td><button class="table-actions" data-action="details" data-id="${esc(bike.id)}">Ficha</button></td></tr>`).join('')}</tbody></table></div>`;

    return `<div class="result-line" id="result-line"><span><strong>${filtered.length}</strong> de ${bikes().length} motocicletas</span><span>${state.query || activeFilterCount() ? 'Resultados filtrados' : 'Datos ilustrativos de demostración'}</span></div>
      ${filtered.length ? cards : `<div class="empty-state"><div class="empty-icon">${icon('search')}</div><h3>No encontramos coincidencias</h3><p>Prueba con otra búsqueda o limpia los filtros para ver el inventario completo.</p><button class="btn btn-quiet btn-sm" data-action="clear-filters">Limpiar búsqueda y filtros</button></div>`}`;
  }

  function updateClearFilterLabel() {
    const button = document.querySelector('[data-action="clear-filters"]');
    if (!button) return;
    const count = activeFilterCount();
    button.innerHTML = count ? `Limpiar (${count})` : 'Limpiar filtros';
  }

  function setSearchVisibility() {
    const box = document.querySelector('.search-box');
    box?.classList.toggle('has-value', Boolean(state.query));
  }

  function updateInventoryStatus(filtered = filteredBikes()) {
    const status = document.getElementById('inventory-status');
    if (!status) return;
    const detail = state.query || activeFilterCount() ? 'Resultados filtrados.' : 'Inventario completo.';
    status.textContent = `${filtered.length} de ${bikes().length} motocicletas. ${detail}`;
  }

  function updateInventoryResults() {
    const container = document.getElementById('inventory-results');
    if (!container) return;
    const filtered = filteredBikes();
    container.innerHTML = inventoryResultsMarkup(filtered);
    updateClearFilterLabel();
    updateInventoryStatus(filtered);
  }

  function renderInventory() {
    const filtered = filteredBikes();
    const brands = [...new Set(bikes().map(bike => bike.brand))].sort((a, b) => a.localeCompare(b, 'es'));
    const searchClass = state.query ? ' has-value' : '';

    root.innerHTML = `${heading('Inventario', 'Consulta y administra las motocicletas registradas en tu negocio.', 'CONTROL DE INVENTARIO', inventoryActionButtons())}
      <div class="inventory-toolbar">
        <label class="search-box${searchClass}" aria-label="Buscar motocicletas"><span class="search-icon">${icon('search')}</span><input id="inventory-search" type="search" placeholder="Buscar por marca, modelo o referencia..." value="${esc(state.query)}" autocomplete="off"><button class="search-clear" type="button" data-action="clear-search" aria-label="Limpiar búsqueda">${icon('close')}</button></label>
        <span class="toolbar-spacer"></span>
        <button class="btn btn-quiet btn-sm" data-action="export">${icon('export')} Exportar CSV</button>
        <div class="view-toggle" role="group" aria-label="Cambiar vista"><button aria-label="Vista de tarjetas" title="Tarjetas" data-layout="grid" class="${state.layout === 'grid' ? 'is-active' : ''}">${icon('grid')}</button><button aria-label="Vista de tabla" title="Tabla" data-layout="table" class="${state.layout === 'table' ? 'is-active' : ''}">${icon('table')}</button></div>
      </div>
      <div class="filter-row" role="group" aria-label="Filtros de inventario">
        <select id="filter-brand" aria-label="Filtrar por marca"><option value="">Todas las marcas</option>${brands.map(brand => `<option value="${esc(brand)}" ${state.filters.brand === brand ? 'selected' : ''}>${esc(brand)}</option>`).join('')}</select>
        <select id="filter-status" aria-label="Filtrar por estado"><option value="">Todos los estados</option>${Object.entries(STATUS_LABELS).map(([key, label]) => `<option value="${key}" ${state.filters.status === key ? 'selected' : ''}>${label}</option>`).join('')}</select>
        <select id="filter-type" aria-label="Filtrar por categoría"><option value="">Todas las categorías</option>${TYPES.map(type => `<option value="${esc(type)}" ${state.filters.type === type ? 'selected' : ''}>${esc(type)}</option>`).join('')}</select>
        <div class="filter-group"><span class="filter-label">Precio (COP)</span><div class="filter-inputs"><input id="filter-min" type="number" inputmode="numeric" placeholder="Mínimo" min="0" step="1" value="${esc(state.filters.minPrice)}" aria-label="Precio mínimo en pesos colombianos"><input id="filter-max" type="number" inputmode="numeric" placeholder="Máximo" min="0" step="1" value="${esc(state.filters.maxPrice)}" aria-label="Precio máximo en pesos colombianos"></div></div>
        <div class="filter-group"><span class="filter-label">Cilindraje (cc)</span><div class="filter-inputs"><input id="filter-cc-min" type="number" inputmode="numeric" placeholder="Mínimo" min="0" step="1" value="${esc(state.filters.minCc)}" aria-label="Cilindraje mínimo en centímetros cúbicos"><input id="filter-cc-max" type="number" inputmode="numeric" placeholder="Máximo" min="0" step="1" value="${esc(state.filters.maxCc)}" aria-label="Cilindraje máximo en centímetros cúbicos"></div></div>
        <button class="text-link clear-filters" type="button" data-action="clear-filters">Limpiar filtros</button>
      </div>
      <div id="inventory-status" class="sr-only" role="status" aria-live="polite"></div>
      <div id="inventory-results">${inventoryResultsMarkup(filtered)}</div>`;
    updateClearFilterLabel();
    updateInventoryStatus(filtered);
  }

  function renderCategories() {
    const descriptions = {
      'Urbana': 'Agilidad y practicidad para el ritmo de la ciudad.',
      'Deportiva': 'Líneas dinámicas y una experiencia de manejo activa.',
      'Naked': 'Diseño expuesto y versatilidad para cada recorrido.',
      'Doble propósito': 'Preparadas para combinar asfalto y caminos abiertos.',
      'Touring': 'Comodidad para trayectos largos y escapadas.'
    };
    const marks = ['available', 'value', 'moto', 'arrow', 'reserved'];
    root.innerHTML = `${heading('Categorías', 'Explora el inventario por estilo y encuentra rápidamente el tipo de moto que buscas.', 'EXPLORAR INVENTARIO')}<div class="category-grid">${TYPES.map((type, index) => {
      const count = bikes().filter(bike => bike.type === type).length;
      return `<button class="category-card" data-category="${esc(type)}" aria-label="Ver ${esc(type)}, ${count} motocicletas"><span class="category-mark">${icon(marks[index] || 'moto')}</span><div class="category-num">${String(count).padStart(2, '0')}</div><h3>${esc(type)}</h3><p>${esc(descriptions[type])}</p><span class="category-arrow">${icon('arrow')}</span></button>`;
    }).join('')}</div><p class="report-note">Las cantidades se calculan directamente desde el inventario actual.</p>`;
  }

  function renderReports() {
    const byStatus = Object.entries(STATUS_LABELS).map(([key, label]) => ({ label, value: bikes().filter(bike => bike.status === key).length }));
    const brands = [...new Set(bikes().map(bike => bike.brand))].map(label => ({ label, value: bikes().filter(bike => bike.brand === label).length })).sort((a, b) => b.value - a.value);
    const bands = [{ label:'< $10 M', min:0, max:9999999 }, { label:'$10–15 M', min:10000000, max:14999999 }, { label:'$15–25 M', min:15000000, max:24999999 }, { label:'> $25 M', min:25000000, max:Infinity }].map(band => ({ label:band.label, value:bikes().filter(bike => bike.price >= band.min && bike.price <= band.max).length }));
    const maxBrand = Math.max(...brands.map(item => item.value), 1);
    const maxBand = Math.max(...bands.map(item => item.value), 1);
    root.innerHTML = `${heading('Reportes de inventario', 'Una lectura rápida de la composición actual del inventario.', 'DATOS DE DEMOSTRACIÓN', `<button class="btn btn-primary" data-action="export">${icon('export')} Exportar CSV</button>`)}<div class="reports-grid"><article class="panel report-panel"><div class="panel-heading"><div><h2>Motocicletas por estado</h2><p>Distribución según disponibilidad actual</p></div></div><div class="bar-chart">${barRows(byStatus, Math.max(...byStatus.map(item => item.value), 1))}</div></article><article class="panel report-panel"><div class="panel-heading"><div><h2>Inventario por marca</h2><p>Marcas presentes en los registros</p></div></div><div class="bar-chart">${barRows(brands, maxBrand)}</div></article><article class="panel report-panel"><div class="panel-heading"><div><h2>Rangos de precio</h2><p>Precio ilustrativo registrado por unidad</p></div></div><div class="price-bands">${barRows(bands, maxBand)}</div></article><article class="panel report-panel"><div class="panel-heading"><div><h2>Valor disponible estimado</h2><p>Suma de precios de las motos disponibles</p></div></div><div class="metric-value report-value">${formatCOP(dashboardMetrics(bikes()).inventoryValue)}</div><p class="report-note">Cálculo referencial sobre datos ficticios. No es un reporte contable ni una valoración de mercado.</p></article></div>`;
  }

  function renderSettings() {
    const metrics = dashboardMetrics(bikes());
    const storageLabel = storageAvailable ? 'Disponible' : 'No disponible';
    root.innerHTML = `${heading('Configuración de la demo', 'Consulta el alcance de esta experiencia y recupera los datos iniciales cuando quieras.', 'ENTORNO DE PRUEBA')}<div class="settings-grid"><section class="settings-card"><h2>Negocio de ejemplo</h2><p>Contexto ficticio para presentar la experiencia de Sistema Motos.</p><div class="setting-row"><div><strong>Nombre comercial</strong><small>Sin relación con un negocio real</small></div><span class="settings-badge">Ruta Motor</span></div><div class="setting-row"><div><strong>Ubicación de referencia</strong><small>Contexto visual para Bogotá, Colombia</small></div><span class="settings-badge">Bogotá</span></div><div class="setting-row"><div><strong>Modo de ejecución</strong><small>Los cambios se guardan solo en este navegador</small></div><span class="settings-badge">Local · Demo</span></div><div class="setting-row"><div><strong>Almacenamiento local</strong><small>${storageAvailable ? 'Los cambios pueden conservarse al recargar' : 'Solo durante esta sesión: el navegador bloqueó el guardado'}</small></div><span class="settings-badge ${storageAvailable ? '' : 'warn'}">${storageLabel}</span></div><div class="setting-row"><div><strong>Datos cargados</strong><small>${metrics.total} motocicletas · ${metrics.available} disponibles</small></div><span class="settings-badge">${formatCOP(metrics.inventoryValue)}</span></div></section><section class="settings-card"><h2>Alcance de esta demo</h2><p>Funciones reales dentro del navegador; sin servicios conectados.</p><div class="notice-box"><strong>Incluido</strong><br>Inventario, búsqueda, filtros, fichas, edición, estados, persistencia local y exportación CSV.<br><br><strong>No incluido</strong><br>Usuarios reales, sincronización entre dispositivos, backend, pagos ni integraciones externas.</div><div class="notice-box storage-note"><strong>Sobre el guardado</strong><br>${storageAvailable ? 'Cada cambio se intenta guardar en localStorage. La interfaz solo confirma el guardado cuando el navegador lo permite.' : 'El navegador no permite localStorage en este contexto. Puedes usar la demo, pero los cambios se perderán al recargar.'}</div><div style="margin-top:17px"><button class="btn btn-danger" data-action="reset">↺ Restaurar datos iniciales</button></div></section></div>`;
  }

  function showDialog() {
    if (!dialog.open) dialog.showModal();
  }

  function openDetails(id) {
    const bike = bikes().find(item => item.id === id);
    if (!bike) return;
    lastFocusedElement = document.activeElement;
    dialogContent.innerHTML = `<div class="dialog-head"><div><h2 id="dialog-title">${esc(bike.brand)} ${esc(bike.model)}</h2><p>Ficha de motocicleta · datos ilustrativos</p></div><button type="button" class="dialog-close" data-action="close-dialog" aria-label="Cerrar ficha">${icon('close')}</button></div><div class="dialog-body"><div class="detail-layout"><div>${imageMarkup(bike, 'detail-image', 900, 'detail-shell')}<div class="detail-badge-row">${badge(bike.status)}<span class="detail-reference">REF. ${esc(bike.id)}</span></div><p class="detail-description">${esc(bike.description)}</p><div class="detail-actions"><button class="btn btn-primary btn-sm" data-action="edit" data-id="${esc(bike.id)}">${icon('edit')} Editar información</button>${Object.entries(STATUS_LABELS).filter(([key]) => key !== bike.status).map(([key, label]) => `<button class="btn btn-sm" data-action="set-status" data-id="${esc(bike.id)}" data-status="${key}">Marcar ${label.toLowerCase()}</button>`).join('')}</div></div><div><div class="detail-price">${formatCOP(bike.price)}<small>Precio referencial · no verificado</small></div><div class="detail-data"><div><small>Año</small><strong>${esc(bike.year)}</strong></div><div><small>Cilindraje</small><strong>${esc(bike.cc)} cc</strong></div><div><small>Kilometraje</small><strong>${km(bike.mileage)} km</strong></div><div><small>Categoría</small><strong>${esc(bike.type)}</strong></div><div><small>Color</small><strong>${esc(bike.color || 'No definido')}</strong></div><div><small>Transmisión</small><strong>${esc(bike.transmission || 'No definida')}</strong></div><div><small>Registrada</small><strong>${esc(shortDate(bike.dateAdded))}</strong></div><div><small>Estado</small><strong>${esc(STATUS_LABELS[bike.status] || 'Sin estado')}</strong></div></div></div></div></div>`;
    showDialog();
  }

  function openForm(id = '') {
    const bike = id ? bikes().find(item => item.id === id) : null;
    const value = key => esc(bike?.[key] ?? '');
    if (!dialog.open) lastFocusedElement = document.activeElement;
    const maxYear = new Date().getFullYear() + 1;
    dialogContent.innerHTML = `<form id="moto-form" novalidate autocomplete="off"><div class="dialog-head"><div><h2 id="dialog-title">${bike ? 'Editar motocicleta' : 'Agregar motocicleta'}</h2><p>Los campos marcados con * son obligatorios · Ficha ilustrativa</p></div><button type="button" class="dialog-close" data-action="close-dialog" aria-label="Cerrar formulario">${icon('close')}</button></div><div class="dialog-body"><input type="hidden" name="originalId" value="${value('id')}"><div class="form-grid"><div class="field"><label for="field-brand">Marca <span class="required">*</span></label><input required id="field-brand" name="brand" maxlength="40" value="${value('brand')}" placeholder="Ej. Honda" aria-describedby="error-brand"><span class="field-error" id="error-brand" data-error="brand" aria-live="polite"></span></div><div class="field"><label for="field-model">Modelo <span class="required">*</span></label><input required id="field-model" name="model" maxlength="60" value="${value('model')}" placeholder="Ej. CB 300F" aria-describedby="error-model"><span class="field-error" id="error-model" data-error="model" aria-live="polite"></span></div><div class="field"><label for="field-id">Referencia interna <span class="required">*</span></label><input required id="field-id" name="id" maxlength="24" value="${value('id')}" placeholder="Ej. SM-2415" aria-describedby="error-id"><span class="field-error" id="error-id" data-error="id" aria-live="polite"></span></div><div class="field"><label for="field-year">Año <span class="required">*</span></label><input required type="number" inputmode="numeric" step="1" id="field-year" name="year" min="1990" max="${maxYear}" value="${value('year')}" placeholder="2024" aria-describedby="error-year"><span class="field-error" id="error-year" data-error="year" aria-live="polite"></span></div><div class="field"><label for="field-cc">Cilindraje (cc) <span class="required">*</span></label><input required type="number" inputmode="numeric" step="1" id="field-cc" name="cc" min="1" max="3000" value="${value('cc')}" placeholder="300" aria-describedby="error-cc"><span class="field-error" id="error-cc" data-error="cc" aria-live="polite"></span></div><div class="field"><label for="field-mileage">Kilometraje <span class="required">*</span></label><input required type="number" inputmode="numeric" step="1" id="field-mileage" name="mileage" min="0" max="300000" value="${value('mileage')}" placeholder="6500" aria-describedby="error-mileage"><span class="field-error" id="error-mileage" data-error="mileage" aria-live="polite"></span></div><div class="field"><label for="field-price">Precio COP <span class="required">*</span></label><input required type="number" inputmode="numeric" step="1" id="field-price" name="price" min="100000" max="500000000" value="${value('price')}" placeholder="18500000" aria-describedby="error-price"><span class="field-error" id="error-price" data-error="price" aria-live="polite"></span></div><div class="field"><label for="field-status">Estado</label><select id="field-status" name="status" aria-describedby="error-status">${Object.entries(STATUS_LABELS).map(([key, label]) => `<option value="${key}" ${(bike?.status || 'available') === key ? 'selected' : ''}>${label}</option>`).join('')}</select><span class="field-error" id="error-status" data-error="status" aria-live="polite"></span></div><div class="field"><label for="field-type">Categoría</label><select id="field-type" name="type" aria-describedby="error-type">${TYPES.map(type => `<option value="${esc(type)}" ${(bike?.type || 'Urbana') === type ? 'selected' : ''}>${esc(type)}</option>`).join('')}</select><span class="field-error" id="error-type" data-error="type" aria-live="polite"></span></div><div class="field"><label for="field-color">Color</label><input id="field-color" name="color" maxlength="40" value="${value('color')}" placeholder="Negro / rojo" aria-describedby="error-color"><span class="field-error" id="error-color" data-error="color" aria-live="polite"></span></div><div class="field full"><label for="field-description">Descripción comercial</label><textarea id="field-description" name="description" maxlength="300" placeholder="Una descripción breve..." aria-describedby="error-description">${value('description')}</textarea><span class="field-error" id="error-description" data-error="description" aria-live="polite"></span></div></div></div><div class="form-footer"><button type="button" class="btn btn-quiet" data-action="close-dialog">Cancelar</button><button type="submit" class="btn btn-primary">${bike ? 'Guardar cambios' : 'Registrar motocicleta'}</button></div></form>`;
    showDialog();
    document.getElementById('field-brand')?.focus();
  }

  function clearFormErrors(form) {
    form.querySelectorAll('.field-error').forEach(node => { node.textContent = ''; });
    form.querySelectorAll('[aria-invalid="true"]').forEach(node => node.removeAttribute('aria-invalid'));
  }

  function validateForm(form) {
    const values = Object.fromEntries(new FormData(form).entries());
    const errors = validateMotorcycle(values, bikes(), String(values.originalId || ''));
    clearFormErrors(form);
    Object.entries(errors).forEach(([key, message]) => {
      const errorNode = form.querySelector(`[data-error="${key}"]`);
      if (errorNode) errorNode.textContent = message;
      const field = form.querySelector(`[name="${key}"]`);
      if (field) field.setAttribute('aria-invalid', 'true');
    });
    return { valid: Object.keys(errors).length === 0, values, errors };
  }

  function saveForm(form) {
    const { valid, values, errors } = validateForm(form);
    if (!valid) {
      const order = ['brand', 'model', 'id', 'year', 'cc', 'mileage', 'price', 'status', 'type', 'color', 'description'];
      const first = order.find(key => errors[key]);
      if (first) form.querySelector(`[name="${first}"]`)?.focus();
      return;
    }

    const original = values.originalId;
    const old = original ? bikes().find(bike => bike.id === original) : null;
    const type = values.type;
    const updated = {
      ...(old || {}),
      id: values.id.trim(),
      brand: values.brand.trim(),
      model: values.model.trim(),
      year: Number(values.year),
      cc: Number(values.cc),
      mileage: Number(values.mileage),
      price: Number(values.price),
      status: values.status,
      type,
      color: values.color.trim() || 'No definido',
      transmission: old?.transmission || 'No especificada',
      description: values.description.trim() || `${values.brand.trim()} ${values.model.trim()} · ficha ilustrativa de demostración.`,
      dateAdded: old?.dateAdded || todayISO(),
      image: old?.image || DEFAULT_IMAGE_BY_TYPE[type] || 'assets/motos/SM-2401.jpg'
    };

    if (old) state.bikes = state.bikes.map(bike => bike.id === original ? updated : bike);
    else state.bikes = [updated, ...state.bikes];

    const saved = persist();
    dialog.close();
    render();
    root.focus({ preventScroll: true });
    if (saved) toast(old ? 'Motocicleta actualizada y guardada en este navegador.' : 'Motocicleta agregada y guardada en este navegador.', 'success');
    else toast('Los cambios se aplicaron en esta sesión, pero no se pudieron guardar en el almacenamiento local. Se perderán al recargar.', 'error');
  }

  function setStatus(id, status) {
    if (!STATUS_LABELS[status]) return;
    const current = bikes().find(bike => bike.id === id);
    if (!current || current.status === status) return;
    state.bikes = state.bikes.map(bike => bike.id === id ? { ...bike, status } : bike);
    const saved = persist();
    render();
    openDetails(id);
    if (saved) toast(`Estado actualizado: ${STATUS_LABELS[status]}. Guardado en este navegador.`, 'success');
    else toast('Los cambios se aplicaron en esta sesión, pero no se pudieron guardar en el almacenamiento local. Se perderán al recargar.', 'error');
  }

  function openResetConfirm() {
    lastFocusedElement = document.activeElement;
    dialogContent.innerHTML = `<div class="dialog-head"><div><h2 id="dialog-title">Restaurar datos de ejemplo</h2><p>Esta acción reemplaza los cambios guardados en este navegador.</p></div><button type="button" class="dialog-close" data-action="close-dialog" aria-label="Cerrar">${icon('close')}</button></div><div class="dialog-body"><div class="notice-box">Se recuperarán las ${window.DEMO_MOTORCYCLES.length} motocicletas iniciales y se perderán los cambios hechos en esta demo.</div><div class="form-footer" style="padding:18px 0 0;margin-top:18px;border:0"><button class="btn btn-quiet" data-action="close-dialog">Cancelar</button><button class="btn btn-danger" data-action="confirm-reset">Sí, restaurar datos</button></div></div>`;
    showDialog();
  }

  function resetData() {
    state.bikes = initialBikes();
    state.query = '';
    state.filters = EMPTY_FILTERS();
    const saved = persist();
    dialog.close();
    render();
    root.focus({ preventScroll: true });
    if (saved) toast('Datos iniciales restaurados y guardados en este navegador.', 'success');
    else toast('Los cambios se aplicaron en esta sesión, pero no se pudieron guardar en el almacenamiento local. Se perderán al recargar.', 'error');
  }

  function exportCSV() {
    const data = state.section === 'inventario' ? filteredBikes() : bikes();
    if (!data.length) {
      toast('No hay motocicletas para exportar con los filtros actuales.', 'info');
      return;
    }
    const blob = new Blob([toCSV(data)], { type:'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sistema-motos-inventario-${todayISO()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast(`CSV exportado con ${data.length} motocicletas.`, 'success');
  }

  function clearFilters() {
    const focusWasInResults = Boolean(document.activeElement?.closest('#inventory-results'));
    state.query = '';
    state.filters = EMPTY_FILTERS();
    const search = document.getElementById('inventory-search');
    if (search) search.value = '';
    ['filter-brand', 'filter-status', 'filter-type', 'filter-min', 'filter-max', 'filter-cc-min', 'filter-cc-max'].forEach(id => {
      const field = document.getElementById(id);
      if (field) field.value = '';
    });
    setSearchVisibility();
    updateInventoryResults();
    if (focusWasInResults) search?.focus();
    toast('Búsqueda y filtros restablecidos.', 'info');
  }

  function applyFilterFromDom() {
    state.filters.brand = document.getElementById('filter-brand')?.value || '';
    state.filters.status = document.getElementById('filter-status')?.value || '';
    state.filters.type = document.getElementById('filter-type')?.value || '';
    state.filters.minPrice = document.getElementById('filter-min')?.value || '';
    state.filters.maxPrice = document.getElementById('filter-max')?.value || '';
    state.filters.minCc = document.getElementById('filter-cc-min')?.value || '';
    state.filters.maxCc = document.getElementById('filter-cc-max')?.value || '';
    updateInventoryResults();
  }

  function setSidebar(open, restoreFocus = false) {
    state.sidebarOpen = open;
    sidebar.classList.toggle('is-open', open);
    sidebarScrim?.classList.toggle('is-visible', open);
    document.body.classList.toggle('menu-open', open);
    mobileMenu?.setAttribute('aria-expanded', String(open));
    mobileMenu?.setAttribute('aria-label', open ? 'Cerrar navegación' : 'Abrir navegación');
    if (open) {
      document.getElementById('sidebar-close')?.focus();
    } else if (restoreFocus) {
      mobileMenu?.focus();
    }
  }

  function navigate(section) {
    if (!SECTION[section]) return;
    state.section = section;
    setSidebar(false);
    render();
    window.scrollTo(0, 0);
    root.focus({ preventScroll: true });
  }

  document.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const nav = event.target.closest('[data-nav]');
    if (nav) { event.preventDefault(); navigate(nav.dataset.nav); return; }
    const category = event.target.closest('[data-category]');
    if (category) {
      state.filters.type = category.dataset.category;
      state.section = 'inventario';
      state.query = '';
      render();
      window.scrollTo(0, 0);
      root.focus({ preventScroll: true });
      return;
    }
    const layout = event.target.closest('[data-layout]');
    if (layout) {
      state.layout = layout.dataset.layout;
      document.querySelectorAll('[data-layout]').forEach(button => {
        const active = button.dataset.layout === state.layout;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      updateInventoryResults();
      return;
    }
    const action = event.target.closest('[data-action]');
    if (!action) return;
    const id = action.dataset.id;
    switch (action.dataset.action) {
      case 'add': openForm(); break;
      case 'details': openDetails(id); break;
      case 'edit': openForm(id); break;
      case 'set-status': setStatus(id, action.dataset.status); break;
      case 'close-dialog': dialog.close(); break;
      case 'clear-search': state.query = ''; document.getElementById('inventory-search').value = ''; setSearchVisibility(); updateInventoryResults(); document.getElementById('inventory-search')?.focus(); break;
      case 'clear-filters': clearFilters(); break;
      case 'export': exportCSV(); break;
      case 'reset': openResetConfirm(); break;
      case 'confirm-reset': resetData(); break;
    }
  });

  document.addEventListener('input', event => {
    if (event.target.id === 'inventory-search') {
      state.query = event.target.value;
      setSearchVisibility();
      updateInventoryResults();
      return;
    }
    if (FILTER_IDS[event.target.id]) {
      state.filters[FILTER_IDS[event.target.id]] = event.target.value;
      updateInventoryResults();
      return;
    }
    if (event.target.closest('#moto-form')) {
      const field = event.target.name;
      const error = dialogContent.querySelector(`[data-error="${field}"]`);
      if (error) error.textContent = '';
      event.target.removeAttribute('aria-invalid');
    }
  });

  document.addEventListener('change', event => {
    if (['filter-brand', 'filter-status', 'filter-type'].includes(event.target.id)) applyFilterFromDom();
  });

  document.addEventListener('submit', event => {
    if (event.target.getAttribute('id') === 'moto-form') {
      event.preventDefault();
      saveForm(event.target);
    }
  });

  mobileMenu?.addEventListener('click', () => setSidebar(!state.sidebarOpen));
  document.getElementById('sidebar-close')?.addEventListener('click', () => setSidebar(false, true));
  sidebarScrim?.addEventListener('click', () => setSidebar(false, true));

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && state.sidebarOpen) {
      setSidebar(false, true);
      return;
    }
    if (state.sidebarOpen && event.key === 'Tab') {
      const focusable = [...sidebar.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter(element => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => {
    const target = lastFocusedElement;
    lastFocusedElement = null;
    if (target && document.contains(target) && !dialogContent.contains(target)) target.focus();
    else root.focus({ preventScroll: true });
  });

  render();
  if (!storageAvailable) {
    toast('El navegador no permite guardar datos locales. La demo funciona, pero los cambios se perderán al recargar.', 'warning');
  }
})();
