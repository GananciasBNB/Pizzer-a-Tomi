// ============================================================
//  PIZZERÍA TOMI — Apps Script Backend (V1.3)
//  Sheet ID: 1wnGBVLBZ3bOf5qaPVoKZGN6ER3PEh02OYUuF6d7cwE4
//  INSTRUCCIONES:
//  1. Pegá este código en https://script.google.com
//  2. Guardá el proyecto
//  3. Implementación > Nueva implementación > Aplicación web
//     - Ejecutar como: Yo
//     - Quién puede acceder: Cualquier usuario, incluso anónimos
//  4. Copiá la URL y pegála en sheetsApi.ts (SCRIPT_URL)
//  5. PRIMERA VEZ: ejecutá manualmente seedInitialData() desde el editor
//     si el Sheet ya tiene datos en Ingredientes pero no en Categorias/Productos
// ============================================================

const SHEET_ID = '1wnGBVLBZ3bOf5qaPVoKZGN6ER3PEh02OYUuF6d7cwE4';

const HEADERS = {
  Pedidos:     ['ID', 'Fecha', 'Hora', 'Cliente', 'Telefono', 'Direccion', 'Items', 'Total', 'Pago', 'Estado', 'Timestamp'],
  Clientes:    ['ID', 'Nombre', 'Telefono', 'Direccion', 'FechaUltimaCompra', 'NroPedidos', 'TotalGastado'],
  Productos:   ['ID', 'Nombre', 'Descripcion', 'Precio', 'Imagen', 'CategoriaID', 'Estado', 'Stock', 'Receta', 'Quitar', 'EtiquetaPromo'],
  Categorias:  ['ID', 'Nombre', 'Descripcion', 'Visible', 'Acento'],
  Ingredientes:['ID', 'Nombre', 'Stock', 'Activo'],
};

// ── Helpers ───────────────────────────────────────────────
function getSS() {
  try {
    if (SHEET_ID && SHEET_ID.length > 10) return SpreadsheetApp.openById(SHEET_ID);
  } catch (e) {
    console.error('Error abriendo por ID, usando activo:', e);
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getSheet(name) {
  const ss = getSS();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    console.log('Creando pestaña nueva:', name);
    sheet = ss.insertSheet(name);
    if (sheet.getName() !== name) sheet.setName(name);
    if (HEADERS[name]) {
      sheet.appendRow(HEADERS[name]);
      sheet.getRange(1, 1, 1, HEADERS[name].length)
        .setFontWeight('bold')
        .setBackground('#0A3161')
        .setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

function generateId(prefix) {
  return prefix + '-' + new Date().getTime() + '-' + Math.floor(Math.random() * 1000);
}

function sheetToJson(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => { obj[h] = row[i]; });
    return obj;
  });
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── GET Handler ───────────────────────────────────────────
// También maneja acciones de escritura cuando el browser convierte POST→GET
// por el redirect 302 de Apps Script (el body se pierde pero los URL params llegan).
function doGet(e) {
  try {
    const action = e.parameter.action || '';
    if (action === 'ping')           return jsonResponse({ ok: true, message: 'Pong' });
    if (action === 'getDashboard')   return getDashboard();
    if (action === 'getPedidos')     return getAll('Pedidos');
    if (action === 'getProducts')    return getAll('Productos');
    if (action === 'getCategories')  return getAll('Categorias');
    if (action === 'getIngredientes')return getAll('Ingredientes');
    if (action === 'getClientes')    return getAll('Clientes');

    // Acciones de escritura vía URL params (POST redirigido a GET)
    let data = {};
    if (e.parameter.data) {
      try { data = JSON.parse(decodeURIComponent(e.parameter.data)); } catch (parseErr) {
        return jsonResponse({ ok: false, error: 'No se pudo parsear data: ' + parseErr });
      }
    }
    if (action === 'savePedido')        return savePedido(data);
    if (action === 'saveCliente')       return saveCliente(data);
    if (action === 'saveProducto')      return saveProducto(data);
    if (action === 'saveCategoria')     return saveCategoria(data);
    if (action === 'removeProducto')    return removeProducto(data);
    if (action === 'removeCategoria')   return removeCategoria(data);
    if (action === 'updateIngrediente') return updateIngrediente(data);
    if (action === 'removeIngrediente') return removeIngrediente(data);
    if (action === 'updateStockBatch')  return updateStockBatch(data);

    return jsonResponse({ ok: true, message: 'Pizzería Tomi API v1.3 — Ready' });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

// ── POST Handler ──────────────────────────────────────────
// IMPORTANTE: Apps Script redirige POSTs. Si el browser convierte POST→GET,
// el body se pierde, pero los URL params (action, data) siguen disponibles.
function doPost(e) {
  try {
    let action = '';
    let data = {};

    // Primero intentar leer del body (POST normal)
    if (e.postData && e.postData.contents) {
      try {
        const body = JSON.parse(e.postData.contents);
        action = body.action || '';
        data = body.data || {};
      } catch (parseErr) {
        console.warn('No se pudo parsear body POST:', parseErr);
      }
    }

    // Fallback: leer de URL params (cuando el browser redirigió POST→GET)
    if (!action && e.parameter && e.parameter.action) {
      action = e.parameter.action || '';
      try {
        data = e.parameter.data ? JSON.parse(decodeURIComponent(e.parameter.data)) : {};
      } catch (parseErr) {
        console.warn('No se pudo parsear data del URL param:', parseErr);
        data = {};
      }
    }

    console.log('doPost action:', action, '| data keys:', Object.keys(data));

    if (!action) return jsonResponse({ ok: false, error: 'Acción no especificada' });

    if (action === 'savePedido')        return savePedido(data);
    if (action === 'saveCliente')       return saveCliente(data);
    if (action === 'saveProducto')      return saveProducto(data);
    if (action === 'saveCategoria')     return saveCategoria(data);
    if (action === 'removeProducto')    return removeProducto(data);
    if (action === 'removeCategoria')   return removeCategoria(data);
    if (action === 'updateIngrediente') return updateIngrediente(data);
    if (action === 'removeIngrediente') return removeIngrediente(data);
    if (action === 'updateStockBatch')  return updateStockBatch(data);
    return jsonResponse({ ok: false, error: 'Acción desconocida: ' + action });
  } catch (err) {
    console.error('Error en doPost:', err);
    return jsonResponse({ ok: false, error: err.toString() });
  }
}


// ── SEED Inicial ──────────────────────────────────────────
// EJECUTAR MANUALMENTE UNA SOLA VEZ si el Sheet ya tiene Ingredientes
// pero todavía no tiene Categorias o Productos.
// Clic en ▶ Run con esta función seleccionada en el editor.
function seedInitialData() {
  const catSheet = getSheet('Categorias');
  const catData = catSheet.getDataRange().getValues();
  if (catData.length < 2) {
    // Categorías vacías → sembrar
    const cats = [
      { id: 'cat-001', nombre: 'Pizzas Clásicas & NY', desc: 'Medianas y familiares hechas al horno de leña.', acento: '#F77F00' },
      { id: 'cat-002', nombre: 'Especiales y Gourmet',  desc: 'Combinaciones de autor con ingredientes premium.', acento: '#D62828' },
      { id: 'cat-003', nombre: 'Bebidas & Extras',      desc: 'Agregados crujientes, dips y gaseosas heladas.', acento: '#FFB703' },
    ];
    cats.forEach(c => catSheet.appendRow([c.id, c.nombre, c.desc, true, c.acento]));
    console.log('✅ Categorías sembradas:', cats.length);
  }

  const prodSheet = getSheet('Productos');
  const prodData = prodSheet.getDataRange().getValues();
  if (prodData.length < 2) {
    // Productos vacíos → sembrar
    const prods = [
      ['prod-001','Pepperoni Clásica','Doble capa de pepperoni, queso muzzarella artesanal y toque de oregano.',12000,'https://images.unsplash.com/photo-1628840042765-356cda07504e?q=80&w=800&auto=format&fit=crop','cat-001','promo',12,'[]','["Salsa de tomate","Muzzarella","Pepperoni ahumado"]','Promo 2x1'],
      ['prod-002','Cuatro Quesos Tomi','Muzzarella, provolone, parmesano y queso azul con reducción de honey.',15000,'https://images.unsplash.com/photo-1601924638867-3ec5f0b6cf48?q=80&w=800&auto=format&fit=crop','cat-001','limited',5,'[]','["Muzzarella","Provolone","Parmesano","Queso azul"]',''],
      ['prod-003','Suprema Tomi Especial','Albahaca fresca, cebolla morada, panceta crocante y tomates confitados.',16500,'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop','cat-002','normal',8,'[]','["Albahaca","Cebolla morada","Panceta","Tomates confitados"]',''],
      ['prod-004','Cajun Wings (6u)','Alitas caramelizadas con glaseado casero, acompañadas de tu dip favorito.',7500,'https://images.unsplash.com/photo-1606755962772-0f7d0d6d7f57?q=80&w=1200&auto=format&fit=crop','cat-003','normal',20,'[]','[]',''],
    ];
    prods.forEach(row => prodSheet.appendRow(row));
    console.log('✅ Productos sembrados:', prods.length);
  }

  const ingSheet = getSheet('Ingredientes');
  const ingData = ingSheet.getDataRange().getValues();
  if (ingData.length < 2) {
    ingSheet.appendRow(['ing-01','Harina 00',42,true]);
    ingSheet.appendRow(['ing-02','Pepperoni artesanal',18,true]);
    ingSheet.appendRow(['ing-03','Queso muzzarella',35,true]);
    console.log('✅ Ingredientes sembrados');
  }

  console.log('🎉 seedInitialData completado.');
}

// ── PRODUCTOS ─────────────────────────────────────────────
function saveProducto(p) {
  const sheet = getSheet('Productos');
  const rows = sheet.getDataRange().getValues();
  const rowValues = [
    String(p.id),
    String(p.nombre || ''),
    String(p.descripcion || ''),
    Number(p.precio) || 0,
    String(p.imagen || ''),
    String(p.categoria || ''),
    String(p.estado || 'normal'),
    Number(p.stock) || 0,
    String(p.receta || '[]'),
    String(p.quitar || '[]'),
    String(p.etiquetaPromo || ''),
  ];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(p.id)) {
      sheet.getRange(i + 1, 1, 1, rowValues.length).setValues([rowValues]);
      return jsonResponse({ ok: true, updated: true });
    }
  }
  sheet.appendRow(rowValues);
  return jsonResponse({ ok: true, created: true, id: p.id });
}

function removeProducto(data) {
  const sheet = getSheet('Productos');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ ok: true, deleted: true });
    }
  }
  return jsonResponse({ ok: false, error: 'Producto no encontrado' });
}

// ── CATEGORÍAS ────────────────────────────────────────────
function saveCategoria(c) {
  const sheet = getSheet('Categorias');
  const rows = sheet.getDataRange().getValues();
  const rowValues = [
    String(c.id),
    String(c.nombre || ''),
    String(c.descripcion || ''),
    Boolean(c.visible),
    String(c.accent || '#D22630'),
  ];
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(c.id)) {
      sheet.getRange(i + 1, 1, 1, rowValues.length).setValues([rowValues]);
      return jsonResponse({ ok: true, updated: true });
    }
  }
  sheet.appendRow(rowValues);
  return jsonResponse({ ok: true, created: true, id: c.id });
}

function removeCategoria(data) {
  const sheet = getSheet('Categorias');
  const values = sheet.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ ok: true, deleted: true });
    }
  }
  return jsonResponse({ ok: false, error: 'Categoría no encontrada' });
}

// ── PEDIDOS ───────────────────────────────────────────────
function savePedido(data) {
  const sheet = getSheet('Pedidos');
  const now = new Date();
  const id = generateId('PED');
  const fecha = Utilities.formatDate(now, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy');
  const hora  = Utilities.formatDate(now, 'America/Argentina/Buenos_Aires', 'HH:mm');
  sheet.appendRow([id, fecha, hora, data.cliente || 'Anónimo', data.telefono || '', data.direccion || '',
    JSON.stringify(data.items || []), data.total || 0, data.pago || '', 'Pendiente', now.toISOString()]);
  if (data.guardarCliente && data.telefono)
    saveCliente({ nombre: data.cliente || 'Anónimo', telefono: data.telefono, direccion: data.direccion || '', totalGastado: data.total || 0 });
  if (data.deductions && data.deductions.length > 0)
    updateStockBatch({ deductions: data.deductions });
  return jsonResponse({ ok: true, id });
}

function saveCliente(data) {
  const sheet = getSheet('Clientes');
  const rows = sheet.getDataRange().getValues();
  const now = new Date();
  const fecha = Utilities.formatDate(now, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy');
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][2]) === String(data.telefono)) {
      sheet.getRange(i + 1, 5).setValue(fecha);
      sheet.getRange(i + 1, 6).setValue((Number(rows[i][5]) || 0) + 1);
      sheet.getRange(i + 1, 7).setValue((Number(rows[i][6]) || 0) + (data.totalGastado || 0));
      return jsonResponse({ ok: true, updated: true });
    }
  }
  const id = generateId('CLI');
  sheet.appendRow([id, data.nombre || 'Anónimo', data.telefono || '', data.direccion || '', fecha, 1, data.totalGastado || 0]);
  return jsonResponse({ ok: true, created: true, id });
}

// ── INGREDIENTES ──────────────────────────────────────────
function updateIngrediente(data) {
  const sheet = getSheet('Ingredientes');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.id)) {
      if (data.nombre !== undefined) sheet.getRange(i + 1, 2).setValue(data.nombre);
      if (data.stock  !== undefined) sheet.getRange(i + 1, 3).setValue(data.stock);
      if (data.activo !== undefined) sheet.getRange(i + 1, 4).setValue(data.activo);
      return jsonResponse({ ok: true, updated: true });
    }
  }
  const id = data.id || generateId('ING');
  sheet.appendRow([id, data.nombre || 'Nuevo', data.stock || 0, true]);
  return jsonResponse({ ok: true, created: true, id });
}

function removeIngrediente(data) {
  const sheet = getSheet('Ingredientes');
  const rows = sheet.getDataRange().getValues();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][0]) === String(data.id)) {
      sheet.deleteRow(i + 1);
      return jsonResponse({ ok: true, deleted: true });
    }
  }
  return jsonResponse({ ok: false, error: 'Ingrediente no encontrado' });
}

function updateStockBatch(data) {
  const sheet = getSheet('Ingredientes');
  const rows = sheet.getDataRange().getValues();
  (data.deductions || []).forEach(({ ingredientId, amount }) => {
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]) === String(ingredientId)) {
        const currentStock = Number(rows[i][2]) || 0;
        sheet.getRange(i + 1, 3).setValue(Math.max(0, currentStock - amount));
        break;
      }
    }
  });
  return jsonResponse({ ok: true, message: 'Stock actualizado' });
}

function getAll(sheetName) {
  const sheet = getSheet(sheetName);
  return jsonResponse({ ok: true, data: sheetToJson(sheet) });
}

// ── DASHBOARD ─────────────────────────────────────────────
function getDashboard() {
  try {
    const pedidos = sheetToJson(getSheet('Pedidos'));
    const ingredientes = sheetToJson(getSheet('Ingredientes'));
    const now = new Date();
    const today = Utilities.formatDate(now, 'America/Argentina/Buenos_Aires', 'dd/MM/yyyy');
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    let ventasHoy = 0, ventasSemana = 0, ventasMes = 0, pedidosHoy = 0;
    const productRanking = {};
    pedidos.forEach(p => {
      const total = Number(p['Total']) || 0;
      const fechaStr = p['Fecha'];
      const fecha = parseFecha(fechaStr);
      if (fecha) {
        if (fechaStr === today)  { ventasHoy += total; pedidosHoy++; }
        if (fecha >= weekAgo)      ventasSemana += total;
        if (fecha.getMonth() === now.getMonth() && fecha.getFullYear() === now.getFullYear())
          ventasMes += total;
      }
      try {
        JSON.parse(p['Items'] || '[]').forEach(item => {
          const key = item.name || item.nombre || 'Desconocido';
          productRanking[key] = (productRanking[key] || 0) + (Number(item.quantity) || 1);
        });
      } catch (err) {}
    });
    const ranking = Object.entries(productRanking)
      .sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([n, c]) => ({ nombre: n, cantidad: c }));
    const stockBajo = ingredientes
      .filter(i => Number(i['Stock']) < 5)
      .map(i => ({ nombre: i['Nombre'], stock: i['Stock'] }));
    return jsonResponse({
      ok: true,
      data: {
        ventasHoy, ventasSemana, ventasMes, pedidosHoy,
        totalPedidos: pedidos.length,
        totalClientes: getSheet('Clientes').getLastRow() - 1,
        ranking,
        ultimosPedidos: [],
        stockBajo,
      },
    });
  } catch (e) { return jsonResponse({ ok: false, error: e.toString() }); }
}

function parseFecha(fechaStr) {
  if (!fechaStr) return null;
  const parts = String(fechaStr).split('/');
  return parts.length === 3 ? new Date(parts[2], parts[1] - 1, parts[0]) : null;
}
