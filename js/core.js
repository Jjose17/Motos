(function (root) {
  const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  const numericOr = (value, fallback) => {
    if (value === '' || value == null) return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const STATUS_LABELS = { available: 'Disponible', reserved: 'Reservada', sold: 'Vendida' };
  const TYPES = ['Urbana', 'Deportiva', 'Naked', 'Doble propósito', 'Touring'];
  const LIMITS = { minPrice: 100000, maxPrice: 500000000, maxMileage: 300000, maxCc: 3000 };
  const currentYear = () => new Date().getFullYear();

  function filterMotorcycles(motorcycles, filters = {}) {
    const query = normalize(filters.query);
    const brand = normalize(filters.brand);
    const status = normalize(filters.status);
    const type = normalize(filters.type);
    const minPrice = numericOr(filters.minPrice, -Infinity);
    const maxPrice = numericOr(filters.maxPrice, Infinity);
    const minCc = numericOr(filters.minCc, -Infinity);
    const maxCc = numericOr(filters.maxCc, Infinity);
    const year = filters.year === '' || filters.year == null ? '' : String(filters.year);
    return motorcycles.filter(moto => {
      const searchable = normalize([moto.id, moto.brand, moto.model, moto.year, moto.cc, moto.type, moto.color, moto.description].join(' '));
      return (!query || searchable.includes(query)) && (!brand || normalize(moto.brand) === brand) &&
        (!status || normalize(moto.status) === status) && (!type || normalize(moto.type) === type) &&
        Number(moto.price) >= minPrice && Number(moto.price) <= maxPrice &&
        Number(moto.cc) >= minCc && Number(moto.cc) <= maxCc && (!year || String(moto.year) === year);
    });
  }

  function dashboardMetrics(motorcycles) {
    return motorcycles.reduce((metrics, moto) => {
      metrics.total += 1;
      if (moto.status === 'available') {
        metrics.available += 1;
        metrics.inventoryValue += Number(moto.price) || 0;
      } else if (moto.status === 'reserved') metrics.reserved += 1;
      else if (moto.status === 'sold') metrics.sold += 1;
      return metrics;
    }, { total: 0, available: 0, reserved: 0, sold: 0, inventoryValue: 0 });
  }

  function formatCOP(value) {
    return '$ ' + new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 }).format(Number(value) || 0) + ' COP';
  }

  function validateMotorcycle(values, motorcycles = [], originalId = '') {
    const errors = {};
    const text = key => String(values[key] ?? '').trim();
    const brand = text('brand');
    const model = text('model');
    const id = text('id');

    if (!brand) errors.brand = 'Este campo es obligatorio.';
    else if (brand.length > 40) errors.brand = 'La marca no puede superar 40 caracteres.';
    if (!model) errors.model = 'Este campo es obligatorio.';
    else if (model.length > 60) errors.model = 'El modelo no puede superar 60 caracteres.';
    if (!id) errors.id = 'Este campo es obligatorio.';
    else if (!/^[A-Za-z0-9][A-Za-z0-9._-]{2,23}$/.test(id)) errors.id = 'Usa de 3 a 24 caracteres: letras, números, punto, guion o guion bajo.';
    else {
      const normalizedId = normalize(id);
      const normalizedOriginal = normalize(originalId);
      const duplicate = motorcycles.some(bike => normalize(bike.id) === normalizedId && normalize(bike.id) !== normalizedOriginal);
      if (duplicate) errors.id = 'Esta referencia ya está registrada.';
    }

    const year = Number(values.year);
    const cc = Number(values.cc);
    const mileage = Number(values.mileage);
    const price = Number(values.price);
    const maxYear = currentYear() + 1;

    if (!Number.isInteger(year) || year < 1990 || year > maxYear) errors.year = `Usa un año entero entre 1990 y ${maxYear}.`;
    if (!Number.isInteger(cc) || cc < 1 || cc > LIMITS.maxCc) errors.cc = `Ingresa un cilindraje entero entre 1 y ${LIMITS.maxCc} cc.`;
    if (!Number.isInteger(mileage) || mileage < 0 || mileage > LIMITS.maxMileage) errors.mileage = `Ingresa un kilometraje entero entre 0 y ${new Intl.NumberFormat('es-CO').format(LIMITS.maxMileage)} km.`;
    if (!Number.isInteger(price) || price < LIMITS.minPrice || price > LIMITS.maxPrice) {
      errors.price = `Ingresa un precio entero entre ${formatCOP(LIMITS.minPrice)} y ${formatCOP(LIMITS.maxPrice)}.`;
    }
    if (!STATUS_LABELS[values.status]) errors.status = 'Selecciona un estado válido.';
    if (!TYPES.includes(values.type)) errors.type = 'Selecciona una categoría válida.';
    if (text('color').length > 40) errors.color = 'El color no puede superar 40 caracteres.';
    if (text('description').length > 300) errors.description = 'La descripción no puede superar 300 caracteres.';

    return errors;
  }

  const CSV_HEADERS = [
    'Referencia interna', 'Marca', 'Modelo', 'Año', 'Cilindraje (cc)', 'Kilometraje (km)',
    'Precio de referencia (COP)', 'Estado', 'Categoría', 'Color', 'Fecha de ingreso',
    'Transmisión', 'Descripción'
  ];

  function csvCell(value) {
    if (typeof value === 'number' && Number.isFinite(value)) return String(value);
    let text = String(value ?? '');
    // Neutraliza valores que una hoja de cálculo podría interpretar como fórmula.
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function toCSV(motorcycles) {
    const rows = motorcycles.map(m => [
      m.id, m.brand, m.model, m.year, m.cc, m.mileage, m.price,
      STATUS_LABELS[m.status] || m.status || '', m.type, m.color, m.dateAdded,
      m.transmission, m.description
    ]);
    return '\uFEFF' + [CSV_HEADERS, ...rows].map(row => row.map(csvCell).join(',')).join('\r\n');
  }

  const api = {
    filterMotorcycles, dashboardMetrics, formatCOP, toCSV, validateMotorcycle,
    STATUS_LABELS, TYPES, LIMITS
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.MotoCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
