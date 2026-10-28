const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  filterMotorcycles, dashboardMetrics, formatCOP, toCSV, validateMotorcycle,
  STATUS_LABELS, TYPES, LIMITS
} = require('../js/core.js');
const motorcycles = require('../js/data.js');

const sample = [
  { id: 'A-1', brand: 'Honda', model: 'CB 300F', year: 2024, cc: 300, mileage: 1200, price: 18000000, status: 'available', type: 'Naked' },
  { id: 'A-2', brand: 'Yamaha', model: 'FZ 25', year: 2022, cc: 250, mileage: 8000, price: 12500000, status: 'reserved', type: 'Naked' },
  { id: 'A-3', brand: 'Honda', model: 'XR 150L', year: 2021, cc: 150, mileage: 14000, price: 9500000, status: 'sold', type: 'Doble propósito' }
];

// Filtros: texto, combinación y valores numéricos parciales.
assert.equal(filterMotorcycles(sample, { query: 'cb 300' }).length, 1, 'search matches model text');
assert.equal(filterMotorcycles(sample, { query: 'doble proposito' }).length, 1, 'search ignores accents');
assert.equal(filterMotorcycles(sample, { brand: 'Honda', status: 'sold' }).length, 1, 'filters combine');
assert.equal(filterMotorcycles(sample, { query: 'honda', status: 'available' }).length, 1, 'search combines with filters');
assert.equal(filterMotorcycles(sample, { brand: 'Honda', type: 'Naked', minPrice: 15000000, maxPrice: 20000000 }).length, 1, 'all filters combine');
assert.equal(filterMotorcycles(sample, { minPrice: 13000000 }).length, 1, 'min price filter applies');
assert.equal(filterMotorcycles(sample, { maxCc: 200, status: 'available' }).length, 0, 'cc and status combine');
assert.equal(filterMotorcycles(sample, { minPrice: '', maxPrice: '', minCc: '', maxCc: '' }).length, 3, 'empty numeric filters do not filter');
assert.equal(filterMotorcycles(sample, { year: '2021' }).length, 1, 'year filter applies');
assert.equal(filterMotorcycles(sample, { query: 'sin coincidencias' }).length, 0, 'empty result is possible');

// Métricas del tablero.
assert.deepEqual(dashboardMetrics(sample), { total: 3, available: 1, reserved: 1, sold: 1, inventoryValue: 18000000 });
assert.deepEqual(dashboardMetrics([]), { total: 0, available: 0, reserved: 0, sold: 0, inventoryValue: 0 });
assert.equal(dashboardMetrics([{ price: 100, status: 'sold' }]).inventoryValue, 0, 'sold units do not add inventory value');

// Moneda.
assert.match(formatCOP(12500000), /^\$ 12\.500\.000 COP$/);
assert.match(formatCOP(0), /^\$ 0 COP$/);

// CSV: encabezados, estados legibles, comillas y neutralización de fórmulas.
const csv = toCSV(sample);
assert.ok(csv.startsWith('\uFEFF'), 'CSV includes UTF-8 BOM');
assert.ok(csv.includes('"Referencia interna","Marca","Modelo"'), 'CSV has Spanish headers');
assert.ok(csv.includes('"Disponible"'), 'CSV localizes available status');
assert.ok(csv.includes('"Reservada"'), 'CSV localizes reserved status');
assert.ok(csv.includes('"Vendida"'), 'CSV localizes sold status');
assert.ok(csv.includes('"Doble propósito"'), 'CSV keeps category text');
assert.equal(csv.split('\r\n').length, 4, 'CSV has header plus one row per motorcycle');

const tricky = [{
  id: 'CSV-1', brand: '=SUM(A1:A2)', model: 'CB "Race"', year: 2024, cc: 300, mileage: 0,
  price: 10000000, status: 'available', type: 'Naked', color: '+Rojo', dateAdded: '2026-10-01',
  transmission: '-Manual', description: '@riesgo, con "comillas" y, coma'
}];
const trickyCsv = toCSV(tricky);
assert.ok(trickyCsv.includes('"\'=SUM(A1:A2)"'), 'CSV neutralizes formulas starting with =');
assert.ok(trickyCsv.includes('"CB ""Race"""'), 'CSV escapes double quotes');
assert.ok(trickyCsv.includes('"\'+Rojo"'), 'CSV neutralizes formulas starting with +');
assert.ok(trickyCsv.includes('"\'-Manual"'), 'CSV neutralizes formulas starting with -');
assert.ok(trickyCsv.includes('"\'@riesgo, con ""comillas"" y, coma"'), 'CSV quotes commas, quotes and formulas');
assert.ok(trickyCsv.includes(',10000000,'), 'CSV writes numeric values without quotes');

// Validación de formularios.
const validBike = {
  id: 'SM-9999', brand: 'Honda', model: 'CB 300F', year: 2024, cc: 300,
  mileage: 1000, price: 18000000, status: 'available', type: 'Naked',
  color: 'Rojo', description: 'Ficha de prueba.'
};
assert.deepEqual(validateMotorcycle(validBike, []), {}, 'complete record is valid');
assert.ok(validateMotorcycle({ ...validBike, status: 'vendida' }, []).status, 'invalid status is rejected');
assert.ok(validateMotorcycle({ ...validBike, type: 'Eléctrica' }, []).type, 'invalid type is rejected');
assert.ok(validateMotorcycle({ ...validBike, mileage: -1 }, []).mileage, 'negative mileage is rejected');
assert.ok(validateMotorcycle({ ...validBike, price: -1 }, []).price, 'negative price is rejected');
assert.ok(validateMotorcycle({ ...validBike, cc: 0 }, []).cc, 'zero displacement is rejected');
assert.ok(validateMotorcycle({ ...validBike, year: 1989 }, []).year, 'year before 1990 is rejected');
assert.ok(validateMotorcycle({ ...validBike, year: new Date().getFullYear() + 2 }, []).year, 'future year is rejected');
assert.ok(validateMotorcycle({ ...validBike, mileage: LIMITS.maxMileage + 1 }, []).mileage, 'mileage over limit is rejected');
assert.ok(validateMotorcycle({ ...validBike, price: LIMITS.minPrice - 1 }, []).price, 'price under limit is rejected');
assert.ok(validateMotorcycle({ ...validBike, id: 'a' }, []).id, 'short reference is rejected');
assert.ok(validateMotorcycle({ ...validBike, id: 'SM/<999>' }, []).id, 'invalid reference characters are rejected');
assert.ok(validateMotorcycle({ ...validBike, brand: 'x'.repeat(41) }, []).brand, 'long brand is rejected');
assert.ok(validateMotorcycle({ ...validBike, model: 'x'.repeat(61) }, []).model, 'long model is rejected');
assert.ok(validateMotorcycle({ ...validBike, description: 'x'.repeat(301) }, []).description, 'long description is rejected');

const duplicate = [{ ...validBike, id: 'SM-9999' }];
assert.match(validateMotorcycle(validBike, duplicate).id, /ya está registrada/, 'duplicate reference is rejected');
assert.equal(validateMotorcycle(validBike, duplicate, 'SM-9999').id, undefined, 'editing keeps its own reference valid');
assert.match(validateMotorcycle({ ...validBike, id: 'sm-9999' }, duplicate).id, /ya está registrada/, 'duplicate detection is case-insensitive');

const empty = validateMotorcycle({ status: '', type: '' }, []);
for (const field of ['brand', 'model', 'id', 'year', 'cc', 'mileage', 'price', 'status', 'type']) {
  assert.ok(empty[field], `empty ${field} is rejected`);
}

// Integridad de los datos de demostración y de sus fotografías.
assert.ok(motorcycles.length >= 12 && motorcycles.length <= 18, 'inventory has between 12 and 18 motorcycles');
assert.equal(new Set(motorcycles.map(bike => bike.id)).size, motorcycles.length, 'references are unique');
assert.equal(new Set(motorcycles.map(bike => bike.image)).size, motorcycles.length, 'photos are unique');
assert.ok(Object.keys(STATUS_LABELS).every(status => motorcycles.some(bike => bike.status === status)), 'every status appears');

for (const bike of motorcycles) {
  assert.match(bike.id, /^SM-\d{4}$/, `valid reference: ${bike.id}`);
  assert.ok(bike.brand && bike.model && bike.color && bike.transmission && bike.description, `complete text fields: ${bike.id}`);
  assert.ok(Number.isInteger(bike.year) && bike.year >= 1990 && bike.year <= new Date().getFullYear() + 1, `valid year: ${bike.id}`);
  assert.ok(Number.isInteger(bike.cc) && bike.cc > 0 && bike.cc <= LIMITS.maxCc, `valid displacement: ${bike.id}`);
  assert.ok(Number.isInteger(bike.mileage) && bike.mileage >= 0 && bike.mileage <= LIMITS.maxMileage, `valid mileage: ${bike.id}`);
  assert.ok(Number.isInteger(bike.price) && bike.price >= LIMITS.minPrice && bike.price <= LIMITS.maxPrice, `valid price: ${bike.id}`);
  assert.ok(STATUS_LABELS[bike.status], `valid status: ${bike.id}`);
  assert.ok(TYPES.includes(bike.type), `valid category: ${bike.id}`);
  assert.match(bike.dateAdded, /^\d{4}-\d{2}-\d{2}$/, `valid date: ${bike.id}`);
  assert.ok(!Number.isNaN(new Date(`${bike.dateAdded}T12:00:00`).getTime()), `parseable date: ${bike.id}`);
  assert.match(bike.description, /demostraci|demostrativ|ejemplo|ilustrativ|muestra/i, `illustrative notice: ${bike.id}`);
  assert.equal(bike.image, `assets/motos/${bike.id}.jpg`, `photo matches reference: ${bike.id}`);
  assert.ok(fs.existsSync(path.join(__dirname, '..', bike.image)), `photo exists: ${bike.image}`);
  assert.deepEqual(validateMotorcycle(bike, motorcycles, bike.id), {}, `seed record is valid: ${bike.id}`);
}

assert.ok(fs.existsSync(path.join(__dirname, '..', 'assets', 'hero-moto.jpg')), 'hero photo exists');
assert.equal(toCSV(motorcycles).split('\r\n').length, motorcycles.length + 1, 'CSV exports every seed record');

console.log(`core tests passed (${motorcycles.length} seed motorcycles, ${motorcycles.length + 1} CSV rows)`);
