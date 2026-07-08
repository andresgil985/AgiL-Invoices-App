/* =========================
   COMPATIBILIDAD CON AMBIENTE WEB / PWA
   ========================= */

if (typeof window.electronAPI === 'undefined') {
  console.log('Ambiente PWA: Inicializando persistencia en localStorage.');
  
  const delay = (val) => new Promise(resolve => setTimeout(() => resolve(val), 10));

  window.electronAPI = {
    getInvoices: () => {
      const data = localStorage.getItem('db_facturas') || '[]';
      return delay(JSON.parse(data));
    },
    saveInvoice: (invoiceData) => {
      const invoices = JSON.parse(localStorage.getItem('db_facturas') || '[]');
      if (!invoiceData.id) {
        invoiceData.id = Date.now();
        invoices.push(invoiceData);
      } else {
        const idx = invoices.findIndex(i => i.id === invoiceData.id);
        if (idx !== -1) {
          invoices[idx] = invoiceData;
        } else {
          invoices.push(invoiceData);
        }
      }
      localStorage.setItem('db_facturas', JSON.stringify(invoices));
      return delay({ success: true, id: invoiceData.id });
    },
    deleteInvoice: (id) => {
      const invoices = JSON.parse(localStorage.getItem('db_facturas') || '[]');
      const filtered = invoices.filter(i => i.id !== id);
      localStorage.setItem('db_facturas', JSON.stringify(filtered));
      return delay({ success: true });
    },
    getNextInvoiceNumber: () => {
      const invoices = JSON.parse(localStorage.getItem('db_facturas') || '[]');
      let maxNum = 0;
      invoices.forEach(i => {
        const num = parseInt(i.numero);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      });
      const nextNum = (maxNum + 1).toString().padStart(4, '0');
      return delay(nextNum);
    },
    importInvoices: (invoicesToImport) => {
      const invoices = JSON.parse(localStorage.getItem('db_facturas') || '[]');
      invoicesToImport.forEach(i => {
        if (!i.id) i.id = Date.now() + Math.random();
        invoices.push(i);
      });
      localStorage.setItem('db_facturas', JSON.stringify(invoices));
      return delay({ success: true, imported: invoicesToImport.length });
    },
    getClients: () => {
      const data = localStorage.getItem('db_clientes') || '[]';
      return delay(JSON.parse(data));
    },
    saveClient: (clientData) => {
      const clients = JSON.parse(localStorage.getItem('db_clientes') || '[]');
      if (!clientData.id) {
        clientData.id = Date.now();
        clients.push(clientData);
      } else {
        const idx = clients.findIndex(c => c.id === clientData.id);
        if (idx !== -1) {
          clients[idx] = clientData;
        } else {
          clients.push(clientData);
        }
      }
      localStorage.setItem('db_clientes', JSON.stringify(clients));
      return delay({ success: true, id: clientData.id });
    },
    deleteClient: (id) => {
      const clients = JSON.parse(localStorage.getItem('db_clientes') || '[]');
      const filtered = clients.filter(c => c.id !== id);
      localStorage.setItem('db_clientes', JSON.stringify(filtered));
      return delay({ success: true });
    },
    getUserProfile: () => {
      const data = localStorage.getItem('db_perfil');
      if (data) return delay(JSON.parse(data));
      const defaultProfile = {
        nombre: 'Mi Empresa',
        abn: '12 345 678 901',
        telefono: '+61 400 000 000',
        email: 'mi-empresa@correo.com',
        direccion: 'Calle Ficticia 123',
        banco: 'Commonwealth Bank',
        bsb: '064-000',
        cuenta: '1234-5678',
        mensaje_pago: 'Thank you for your business!'
      };
      return delay(defaultProfile);
    },
    saveUserProfile: (profile) => {
      localStorage.setItem('db_perfil', JSON.stringify(profile));
      return delay({ success: true });
    },
    getExpenses: () => {
      const data = localStorage.getItem('db_gastos') || '[]';
      return delay(JSON.parse(data));
    },
    saveExpense: (expenseData) => {
      const expenses = JSON.parse(localStorage.getItem('db_gastos') || '[]');
      if (!expenseData.id) {
        expenseData.id = Date.now();
        expenses.push(expenseData);
      } else {
        const idx = expenses.findIndex(e => e.id === expenseData.id);
        if (idx !== -1) {
          expenses[idx] = expenseData;
        } else {
          expenses.push(expenseData);
        }
      }
      localStorage.setItem('db_gastos', JSON.stringify(expenses));
      return delay({ success: true, id: expenseData.id });
    },
    deleteExpense: (id) => {
      const expenses = JSON.parse(localStorage.getItem('db_gastos') || '[]');
      const filtered = expenses.filter(e => e.id !== id);
      localStorage.setItem('db_gastos', JSON.stringify(filtered));
      return delay({ success: true });
    },
    getEmailConfig: () => {
      const data = localStorage.getItem('db_config_correo');
      return delay(data ? JSON.parse(data) : null);
    },
    saveEmailConfig: (config) => {
      localStorage.setItem('db_config_correo', JSON.stringify(config));
      return delay({ success: true });
    },
    sendInvoiceEmail: (emailData) => {
      alert('PWA: El envio SMTP requiere ejecutar la aplicacion en computadora (Windows). Simulacion de envio exitosa.');
      return delay({ success: true });
    },
    testEmailConnection: (config) => {
      alert('PWA: La prueba SMTP requiere la aplicacion en computadora (Windows). Simulacion exitosa.');
      return delay({ success: true });
    },
    savePDF: (pdfData) => {
      return delay({ success: false, error: 'PWA: Usando descarga local.' });
    },
    getDashboardStats: () => {
      const invoices = JSON.parse(localStorage.getItem('db_facturas') || '[]');
      const expenses = JSON.parse(localStorage.getItem('db_gastos') || '[]');
      const totalInvoiced = invoices.reduce((sum, i) => sum + (parseFloat(i.total) || 0), 0);
      const totalPaid = totalInvoiced;
      const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.monto) || 0), 0);
      const monthlySales = {};
      invoices.forEach(i => {
        const month = (i.fecha || '').substring(0, 7);
        if (month) monthlySales[month] = (monthlySales[month] || 0) + (parseFloat(i.total) || 0);
      });
      return delay({
        totalFacturado: totalInvoiced,
        totalCobrado: totalPaid,
        totalGastos: totalExpenses,
        graficoVentas: Object.entries(monthlySales).map(([mes, total]) => ({ mes, total })),
        facturasRecientes: invoices.slice(-5)
      });
    }
  };
}

/* =========================
   ESTADO GLOBAL
========================= */

let items = [{ desc: '', qty: 1, price: 0 }];
let calcLines = [{ qty: 1, unitPrice: 0 }];
let currentInvoiceId = null;
let clientsCache = [];
let expensesCache = [];
let balanceChartInstance = null;
function g(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function s(id, v) {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
}

function fmt(n) {
  return '$' + parseFloat(n || 0)
    .toFixed(2)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function fmtDate(d) {
  if (!d) return '';
  const p = d.split('-');
  return `${p[2]}/${p[1]}/${p[0]}`;
}

function parseDecimal(v) {
  const n = parseFloat(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/* =========================
   FECHAS AUTOMÃTICAS
========================= */

function setActiveMenu(key) {
  const ids = ['Dashboard', 'Invoice', 'Clients', 'Profile', 'Expenses', 'History'];
  ids.forEach((id) => {
    const el = document.getElementById('side' + id);
    if (el) el.classList.remove('active');
  });

  const target = document.getElementById('side' + key.charAt(0).toUpperCase() + key.slice(1));
  if (target) target.classList.add('active');
}

function showPage(page) {
  const dashboard = document.getElementById('dashboardPage');
  const invoice = document.getElementById('invoicePage');

  if (dashboard) dashboard.classList.toggle('active', page === 'dashboard');
  if (invoice) invoice.classList.toggle('active', page === 'invoice');

  setActiveMenu(page === 'dashboard' ? 'dashboard' : 'invoice');

  if (page === 'dashboard') {
    loadDashboard();
    loadExpenses();
  } else {
    loadHistory();
    loadClients();
    loadUserProfile();
    loadEmailConfig();
  }
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function navigateMenu(section) {
  const routes = {
    dashboard: { page: 'dashboard', target: 'dashboardTop', active: 'dashboard' },
    invoice: { page: 'invoice', target: 'invoicePage', active: 'invoice' },
    clients: { page: 'invoice', target: 'clientSection', active: 'clients' },
    profile: { page: 'invoice', target: 'profileSection', active: 'profile' },
    expenses: { page: 'dashboard', target: 'expenseSection', active: 'expenses' },
    history: { page: 'invoice', target: 'historySection', active: 'history' }
  };

  const route = routes[section] || routes.dashboard;
  showPage(route.page);
  setActiveMenu(route.active);
  setTimeout(() => scrollToSection(route.target), 80);
}

function toggleSubmenu(menuKey) {
  const subEl = document.getElementById('submenu' + menuKey.charAt(0).toUpperCase() + menuKey.slice(1));
  const btnEl = document.getElementById('side' + menuKey.charAt(0).toUpperCase() + menuKey.slice(1));
  if (!subEl) return;

  const isActive = subEl.classList.contains('active');

  // Cerrar otros submenús para mantener una barra lateral limpia
  document.querySelectorAll('.sidebar-submenu').forEach(el => {
    el.classList.remove('active');
  });
  document.querySelectorAll('.sidebar-btn').forEach(btn => {
    btn.classList.remove('expanded');
  });

  if (!isActive) {
    subEl.classList.add('active');
    if (btnEl) btnEl.classList.add('expanded');
  }
}

function renderSidebarClients(clients = []) {
  const subEl = document.getElementById('submenuClients');
  if (!subEl) return;

  if (clients.length === 0) {
    subEl.innerHTML = '<div class="sidebar-submenu-info">Sin clientes</div>';
    return;
  }

  subEl.innerHTML = clients.map(c => `
    <a class="sidebar-submenu-link" title="${escapeHTML(c.nombre)}" onclick="selectClientAndGo(${c.id}); event.stopPropagation();">
      ${escapeHTML(c.nombre)}
    </a>
  `).join('');
}

function selectClientAndGo(id) {
  const client = clientsCache.find(c => String(c.id) === String(id));
  if (!client) return;

  // Cargar datos en el formulario del cliente
  setInput('clientId', client.id);
  setInput('clientName', client.nombre);
  setInput('clientEmail', client.email);
  setInput('clientPhone', client.telefono);
  setInput('clientAddress', client.direccion);
  setInput('clientNotes', client.notes || client.notas); // Compatibilidad con notas

  // Ir a la sección de clientes
  navigateMenu('clients');
  setStatus(`Cliente "${client.nombre}" seleccionado.`);
}

function renderSidebarProfile(profile) {
  const subEl = document.getElementById('submenuProfile');
  if (!subEl) return;

  if (!profile || (!profile.nombre && !profile.empresa)) {
    subEl.innerHTML = '<div class="sidebar-submenu-info">Perfil vacío</div>';
    return;
  }

  const displayName = profile.empresa || profile.nombre || 'Sin nombre';
  const abn = profile.abn || 'Sin ABN';
  const email = profile.email || '';

  subEl.innerHTML = `
    <div class="sidebar-submenu-info" title="${escapeHTML(displayName)}">
      <div><strong>Empresa:</strong> ${escapeHTML(displayName)}</div>
      <div><strong>ABN:</strong> ${escapeHTML(abn)}</div>
      ${email ? `<div><strong>Email:</strong> ${escapeHTML(email)}</div>` : ''}
    </div>
    <a class="sidebar-submenu-link" onclick="navigateMenu('profile'); event.stopPropagation();" style="border-top: 1px dashed var(--border-color); margin-top: 4px; padding-top: 8px; text-align: center; font-weight: 600;">
      ✏️ Editar Perfil
    </a>
  `;
}

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
  localStorage.setItem('agil-theme', theme);
  
  // Redibujar gráfico si ya existe para cambiar los colores en caliente
  if (balanceChartInstance) {
    loadDashboard();
  }
}

function toggleTheme() {
  const current = document.body.classList.contains('dark') ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

function initTheme() {
  applyTheme(localStorage.getItem('agil-theme') || 'light');
}

function selectAccent(accent) {
  // Remover acentos previos
  document.body.classList.forEach(cls => {
    if (cls.startsWith('accent-')) {
      document.body.classList.remove(cls);
    }
  });
  // Agregar el nuevo acento
  document.body.classList.add('accent-' + accent);
  localStorage.setItem('agil-accent', accent);

  // Marcar botón activo en la paleta lateral
  document.querySelectorAll('.accent-color-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === 'btnAccent_' + accent);
  });

  // Redibujar gráfico para aplicar color de acento a la línea de balance
  if (balanceChartInstance) {
    loadDashboard();
  }
}

function initAccent() {
  const savedAccent = localStorage.getItem('agil-accent') || 'indigo';
  selectAccent(savedAccent);
}

async function startNewInvoiceFromDashboard() {
  await newInvoice();
  showPage('invoice');
}

function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function setAutomaticDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(today);
  due.setDate(today.getDate() + 8);

  const invDate = document.getElementById('invDate');
  const invDue = document.getElementById('invDue');

  if (invDate) invDate.value = toDateInputValue(today);
  if (invDue) invDue.value = toDateInputValue(due);
}

/* =========================
   CALCULADORA
========================= */

function renderCalculator() {
  const tb = document.getElementById('calcBody');
  if (!tb) return;

  tb.innerHTML = '';

  calcLines.forEach((line, i) => {
    const total = (line.qty || 0) * (line.unitPrice || 0);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="number" value="${line.qty}" 
        oninput="updateCalc(${i}, 'qty', this.value, this)"></td>
      <td><input type="number" value="${line.unitPrice}" 
        oninput="updateCalc(${i}, 'unitPrice', this.value, this)"></td>
      <td><input readonly class="amt-ro calc-line-total" value="${fmt(total)}"></td>
      <td><button class="btn-del" onclick="removeCalc(${i})">Ã—</button></td>
    `;
    tb.appendChild(tr);
  });

  calcTotal();
}

function calcTotal() {
  const total = calcLines.reduce((s, l) => s + (l.qty || 0) * (l.unitPrice || 0), 0);
  const el = document.getElementById('calcTotal');
  if (el) el.textContent = fmt(total);
  return total;
}

function updateCalc(i, field, value, input) {
  calcLines[i][field] = parseDecimal(value);

  const total = (calcLines[i].qty || 0) * (calcLines[i].unitPrice || 0);
  input.closest('tr').querySelector('.calc-line-total').value = fmt(total);

  calcTotal();
}

function addCalc() {
  calcLines.push({ qty: 1, unitPrice: 0 });
  renderCalculator();
}

function removeCalc(i) {
  if (calcLines.length > 1) {
    calcLines.splice(i, 1);
    renderCalculator();
  }
}

function applyCalcToInvoice() {
  const desc = (g('calcDesc') || 'Servicio').trim();

  // Mapear cada línea de cálculo preservando cantidad y precio unitario individuales
  items = calcLines.map(l => ({
    desc: desc,
    qty: l.qty || 1,
    price: l.unitPrice || 0
  }));

  renderItems();
  updatePreview();
}

/* =========================
   ITEMS FACTURA
========================= */

function renderItems() {
  const tb = document.getElementById('itemsBody');
  if (!tb) return;

  tb.innerHTML = '';

  items.forEach((it, i) => {
    const total = (it.qty || 0) * (it.price || 0);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input value="${escapeHTML(it.desc)}" oninput="items[${i}].desc=this.value"></td>
      <td><input type="number" value="${it.qty}" 
        oninput="updateItem(${i}, 'qty', this.value, this)"></td>
      <td><input type="number" value="${it.price}" 
        oninput="updateItem(${i}, 'price', this.value, this)"></td>
      <td><input readonly class="amt-ro item-total" value="${fmt(total)}"></td>
      <td><button class="btn-del" onclick="removeItem(${i})">×</button></td>
    `;
    tb.appendChild(tr);
  });

  calcInvoiceTotal();
}

function updateItem(i, field, value, input) {
  items[i][field] = parseDecimal(value);

  const total = (items[i].qty || 0) * (items[i].price || 0);
  input.closest('tr').querySelector('.item-total').value = fmt(total);

  calcInvoiceTotal();
}

function calcInvoiceTotal() {
  const sub = items.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);

  s('subtotal', fmt(sub));
  s('total', fmt(sub));
}

function addItem() {
  items.push({ desc: '', qty: 1, price: 0 });
  renderItems();
}

function removeItem(i) {
  if (items.length > 1) {
    items.splice(i, 1);
    renderItems();
  }
}

/* =========================
   PREVIEW
========================= */

function updatePreview() {
  const sub = items.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);

  s('p_clientName', g('clientName'));
  s('p_clientEmail', g('clientEmail'));
  s('p_clientPhone', g('clientPhone'));

  s('p_issuerName', g('issuerName'));
  s('p_abn', g('issuerABN'));
  s('bgText', ('Invoice ' + (g('invNumber') || '')).trim());
  s('p_contact', [g('issuerPhone'), g('issuerEmail')].filter(Boolean).join(' | '));
  s('p_address', g('issuerAddress'));

  s('p_date', fmtDate(g('invDate')));
  s('p_due', fmtDate(g('invDue')));

  s('p_bank', g('payBank'));
  s('p_bsb', g('payBSB'));
  s('p_acc', g('payAcc'));
  s('p_msg', g('payMsg'));

  s('p_sub', fmt(sub));
  s('p_total', fmt(sub));

  const rb = document.getElementById('p_rows');
  if (rb) {
    rb.innerHTML = items.map(it => `
      <tr>
        <td>${escapeHTML(it.desc)}</td>
        <td>${it.qty}</td>
        <td>${fmt(it.price)}</td>
        <td>${fmt(it.qty * it.price)}</td>
      </tr>
    `).join('');
  }

  const pw = document.getElementById('previewWrap');
  if (pw) pw.style.display = 'block';
}

/* =========================
   INIT
========================= */

window.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAccent();
  setAutomaticDates();
  renderCalculator();
  renderItems();
  updatePreview();
  loadHistory();
  loadClients();
  loadUserProfile();
  loadDashboard();
  loadExpenses();
  loadEmailConfig();
  setExpenseDateDefault();
  prepareNewInvoiceNumber();
});
/* =========================
   PERSISTENCIA E HISTORIAL
========================= */

let historyCache = [];

function setInput(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value || '';
}

function setStatus(message) {
  const el = document.getElementById('historyStatus');
  if (el) el.textContent = message || '';
}

function escapeHTML(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function invoiceSubtotal() {
  return items.reduce((sum, item) => sum + (item.qty || 0) * (item.price || 0), 0);
}

function collectInvoiceData() {
  return {
    id: currentInvoiceId,
    numero: (g('invNumber') || `INV-${Date.now()}`).trim(),
    fecha: g('invDate'),
    vencimiento: g('invDue'),
    subtotal: invoiceSubtotal(),
    client: {
      id: g('clientId') ? Number(g('clientId')) : null,
      nombre: g('clientName').trim(),
      email: g('clientEmail').trim(),
      telefono: g('clientPhone').trim(),
      direccion: g('clientAddress').trim(),
      notas: g('clientNotes').trim()
    },
    emisor: {
      nombre: g('issuerName').trim(),
      abn: g('issuerABN').trim(),
      telefono: g('issuerPhone').trim(),
      email: g('issuerEmail').trim(),
      direccion: g('issuerAddress').trim()
    },
    pago: {
      banco: g('payBank').trim(),
      bsb: g('payBSB').trim(),
      cuenta: g('payAcc').trim(),
      mensaje: g('payMsg').trim()
    },
    items: items.map((item) => ({
      desc: item.desc || '',
      qty: Number(item.qty || 0),
      price: Number(item.price || 0)
    }))
  };
}

async function saveInvoice() {
  updatePreview();

  const data = collectInvoiceData();
  if (!data.client.nombre) {
    setStatus('Agrega el nombre del cliente antes de guardar.');
    return;
  }

  if (!window.electronAPI || !window.electronAPI.saveInvoice) {
    setStatus('No se pudo conectar con Electron para guardar la factura.');
    return;
  }

  const result = await window.electronAPI.saveInvoice(data);
  if (!result.success) {
    setStatus(`Error al guardar: ${result.error}`);
    return;
  }
  currentInvoiceId = result.id;
  setStatus((data.id ? 'Factura actualizada (#' : 'Factura guardada (#') + result.id + ').');
  await loadHistory();
  await loadClients();
  await loadDashboard();
}

async function loadHistory() {
  if (!window.electronAPI || !window.electronAPI.getInvoices) return;
  historyCache = await window.electronAPI.getInvoices();
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;

  const query = g('historySearch').trim().toLowerCase();
  const filtered = historyCache.filter((invoice) => {
    const text = [
      invoice.numero,
      invoice.cliente_nombre,
      invoice.cliente_email,
      invoice.fecha,
      invoice.total
    ].join(' ').toLowerCase();
    return text.includes(query);
  });

  if (!filtered.length) {
    list.innerHTML = '<div class="history-empty">No hay facturas guardadas.</div>';
    return;
  }

  list.innerHTML = filtered.map((invoice) => `
    <div class="history-row">
      <div>
        <div class="history-title">${escapeHTML(invoice.numero)} - ${escapeHTML(invoice.cliente_nombre)}</div>
        <div class="history-meta">${escapeHTML(invoice.fecha)} · ${fmt(invoice.total)} · ${escapeHTML(invoice.cliente_email)}</div>
      </div>
      <div class="history-buttons">
        <button class="btn-small" onclick="loadInvoice(${invoice.id})">Abrir</button>
        <button class="btn-small danger" onclick="deleteInvoice(${invoice.id})">Borrar</button>
      </div>
    </div>
  `).join('');
}

function loadInvoice(id) {
  const invoice = historyCache.find((item) => item.id === id);
  if (!invoice) return;

  currentInvoiceId = invoice.id;
  setInput('clientName', invoice.cliente_nombre);
  setInput('clientEmail', invoice.cliente_email);
  setInput('clientPhone', invoice.cliente_telefono);
  setInput('clientId', invoice.cliente_id);
  setInput('clientAddress', invoice.cliente_direccion);
  setInput('clientNotes', invoice.cliente_notas);
  setInput('invNumber', invoice.numero);
  setInput('invDate', invoice.fecha);
  setInput('invDue', invoice.vencimiento);

  const issuer = invoice.datos_emisor || {};
  setInput('issuerName', issuer.nombre);
  setInput('issuerABN', issuer.abn);
  setInput('issuerPhone', issuer.telefono);
  setInput('issuerEmail', issuer.email);
  setInput('issuerAddress', issuer.direccion);

  const payment = invoice.datos_pago || {};
  setInput('payBank', payment.banco);
  setInput('payBSB', payment.bsb);
  setInput('payAcc', payment.cuenta);
  setInput('payMsg', payment.mensaje);

  items = (invoice.items || []).map((item) => ({
    desc: item.descripcion || '',
    qty: Number(item.cantidad || 0),
    price: Number(item.precio_unitario || 0)
  }));

  if (!items.length) items = [{ desc: '', qty: 1, price: 0 }];

  renderItems();
  updatePreview();
  setStatus(`Factura ${invoice.numero} cargada.`);
}

async function deleteInvoice(id) {
  if (!window.confirm('¿Borrar esta factura del historial?')) return;

  const result = await window.electronAPI.deleteInvoice(id);
  if (!result.success) {
    setStatus(`Error al borrar: ${result.error}`);
    return;
  }

  setStatus('Factura borrada.');
  await loadHistory();
}

function exportHistory() {
  const backup = JSON.stringify(historyCache, null, 2);
  const blob = new Blob([backup], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `agil-invoices-backup-${toDateInputValue(new Date())}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
  setStatus('Respaldo exportado.');
}

function importHistory(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const parsed = JSON.parse(reader.result);
      const invoices = Array.isArray(parsed) ? parsed : [];

      if (!window.electronAPI || !window.electronAPI.importInvoices) {
        historyCache = invoices;
        renderHistory();
        setStatus('Respaldo cargado para revisar, pero no se pudo guardar en SQLite.');
        return;
      }

      const result = await window.electronAPI.importInvoices(invoices);
      if (!result.success) {
        setStatus(`Error al importar: ${result.error}`);
        return;
      }

      setStatus(`Respaldo importado: ${result.imported} facturas.`);
      await loadHistory();
      await prepareNewInvoiceNumber();
    } catch (error) {
      setStatus('El archivo de respaldo no es JSON valido.');
    }
  };

  reader.readAsText(file);
  event.target.value = '';
}

async function prepareNewInvoiceNumber() {
  if (!window.electronAPI || !window.electronAPI.getNextInvoiceNumber) return;
  const number = await window.electronAPI.getNextInvoiceNumber();
  setInput('invNumber', number);
}

async function newInvoice() {
  currentInvoiceId = null;
  ['clientId', 'clientName', 'clientEmail', 'clientPhone', 'clientAddress', 'clientNotes', 'calcDesc'].forEach((id) => setInput(id, ''));
  items = [{ desc: '', qty: 1, price: 0 }];
  calcLines = [{ qty: 1, unitPrice: 0 }];
  setAutomaticDates();
  await prepareNewInvoiceNumber();
  
  // Cargar datos por defecto del perfil emisor y banco
  await loadUserProfile();

  renderCalculator();
  renderItems();
  updatePreview();
  setStatus('Nueva factura lista.');
}

async function downloadPDF() {
  updatePreview();

  const card = document.getElementById('invCard');
  if (!card || !window.html2canvas || !window.jspdf) {
    setStatus('No se pudieron cargar las librerias para crear el PDF.');
    return;
  }

  // Guardar o actualizar la factura en base de datos antes de generar el PDF para asegurar sincronización
  await saveInvoice();
  if (!currentInvoiceId) return;

  const invoiceData = collectInvoiceData();

  const canvas = await window.html2canvas(card, {
    scale: 2,
    backgroundColor: null
  });

  const image = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 12;
  const maxWidth = pageWidth - margin * 2;
  const imgHeight = (canvas.height * maxWidth) / canvas.width;
  const y = Math.max(margin, (pageHeight - imgHeight) / 2);

  pdf.addImage(image, 'PNG', margin, y, maxWidth, imgHeight);

  const result = await window.electronAPI.savePDF({
    base64: pdf.output('datauristring'),
    clientName: invoiceData.client.nombre,
    invoiceNumber: invoiceData.numero,
    invoiceId: currentInvoiceId
  });

  if (result.success) {
    setStatus('PDF guardado: ' + result.fileName);
    await loadHistory();
  } else {
    // Si no se pudo guardar en disco por Node (como en ambiente PWA), forzar descarga del navegador
    pdf.save(`Factura-${invoiceData.numero || 'sin-numero'}.pdf`);
    setStatus('PDF descargado localmente.');
    await loadHistory();
  }
}


/* =========================
   PERFIL, CLIENTES Y DASHBOARD
========================= */

function setProfileStatus(message) {
  const el = document.getElementById('profileStatus');
  if (el) el.textContent = message || '';
}

async function loadUserProfile() {
  if (!window.electronAPI || !window.electronAPI.getUserProfile) return;
  const profile = await window.electronAPI.getUserProfile();
  if (!profile) return;
  setInput('issuerName', profile.empresa || profile.nombre || '');
  setInput('issuerABN', profile.abn);
  setInput('issuerPhone', profile.telefono);
  setInput('issuerEmail', profile.email);
  setInput('issuerAddress', profile.direccion);
  setInput('payBank', profile.banco);
  setInput('payBSB', profile.bsb);
  setInput('payAcc', profile.cuenta);
  setInput('payMsg', profile.mensaje_pago);
  updatePreview();
  // Actualizar el submenú de perfil en la barra lateral
  renderSidebarProfile(profile);
}

async function saveUserProfile() {
  if (!window.electronAPI || !window.electronAPI.saveUserProfile) return;
  const result = await window.electronAPI.saveUserProfile({
    empresa: g('issuerName').trim(),
    nombre: g('issuerName').trim(),
    abn: g('issuerABN').trim(),
    telefono: g('issuerPhone').trim(),
    email: g('issuerEmail').trim(),
    direccion: g('issuerAddress').trim(),
    banco: g('payBank').trim(),
    bsb: g('payBSB').trim(),
    cuenta: g('payAcc').trim(),
    mensaje_pago: g('payMsg').trim()
  });
  if (result.success) {
    setProfileStatus('Perfil guardado.');
    await loadUserProfile(); // Recarga para actualizar vista previa y submenú del sidebar
  } else {
    setProfileStatus('Error al guardar perfil: ' + result.error);
  }
}

async function loadClients() {
  if (!window.electronAPI || !window.electronAPI.getClients) return;
  clientsCache = await window.electronAPI.getClients();
  renderClients();
  // Actualizar el submenú de clientes en la barra lateral
  renderSidebarClients(clientsCache);
}

function renderClients() {
  const list = document.getElementById('clientList');
  if (!list) return;

  if (!clientsCache.length) {
    list.innerHTML = '<div class="history-empty">No hay clientes guardados.</div>';
    return;
  }

  list.innerHTML = clientsCache.map((client) => {
    return '<div class="client-row">' +
      '<div>' +
        '<div class="client-title">' + escapeHTML(client.nombre) + '</div>' +
        '<div class="client-meta">' + escapeHTML(client.email || '') + ' ' + escapeHTML(client.telefono || '') + '</div>' +
      '</div>' +
      '<div class="history-buttons">' +
        '<button class="btn-small" onclick="selectClient(' + client.id + ')">Usar</button>' +
        '<button class="btn-small danger" onclick="deleteClient(' + client.id + ')">Borrar</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function selectClient(id) {
  const client = clientsCache.find((item) => item.id === id);
  if (!client) return;
  setInput('clientId', client.id);
  setInput('clientName', client.nombre);
  setInput('clientEmail', client.email);
  setInput('clientPhone', client.telefono);
  setInput('clientAddress', client.direccion);
  setInput('clientNotes', client.notas);
  updatePreview();
  setStatus('Cliente seleccionado.');
}

function clearClientForm() {
  ['clientId', 'clientName', 'clientEmail', 'clientPhone', 'clientAddress', 'clientNotes'].forEach((id) => setInput(id, ''));
  updatePreview();
  setStatus('Formulario de cliente limpio.');
}

async function saveClientFromForm() {
  if (!window.electronAPI || !window.electronAPI.saveClient) return;
  const client = collectInvoiceData().client;
  if (!client.nombre) {
    setStatus('Agrega el nombre del cliente antes de guardarlo.');
    return;
  }
  const result = await window.electronAPI.saveClient(client);
  if (!result.success) {
    setStatus('Error al guardar cliente: ' + result.error);
    return;
  }
  setInput('clientId', result.id);
  setStatus('Cliente guardado (#' + result.id + ').');
  await loadClients();
  await loadDashboard();
}

async function deleteClient(id) {
  if (!window.confirm('?Borrar este cliente?')) return;
  const result = await window.electronAPI.deleteClient(id);
  if (!result.success) {
    setStatus(result.error);
    return;
  }
  if (String(g('clientId')) === String(id)) clearClientForm();
  setStatus('Cliente borrado.');
  await loadClients();
  await loadDashboard();
}

async function loadDashboard() {
  if (!window.electronAPI || !window.electronAPI.getDashboardStats) return;
  const stats = await window.electronAPI.getDashboardStats();
  s('dashboardInvoices', stats.invoiceCount || 0);
  s('dashboardClients', stats.clientCount || 0);
  s('dashboardRevenue', fmt(stats.totalRevenue || 0));
  s('dashboardExpenses', fmt(stats.totalExpenses || 0));
  s('dashboardBalance', fmt(stats.balance || 0));
  renderDashboardInvoices(stats.recentInvoices || []);
  renderExpenses(stats.recentExpenses || expensesCache || []);
  renderBalanceChart(stats.monthlyStats || []);
}

function renderBalanceChart(monthlyData = []) {
  const ctx = document.getElementById('balanceChart');
  if (!ctx) return;

  if (balanceChartInstance) {
    balanceChartInstance.destroy();
  }

  const isDark = document.body.classList.contains('dark');
  const computedStyles = getComputedStyle(document.body);
  
  // Leer dinámicamente las variables CSS para adaptabilidad total del tema
  const accentColor = computedStyles.getPropertyValue('--accent-color').trim() || '#4f46e5';
  const gridColor = isDark ? '#2e2c26' : '#efede7';
  const tickColor = isDark ? '#a9a69c' : '#706d64';
  const legendColor = isDark ? '#a9a69c' : '#706d64';

  let labels = [];
  let revenueData = [];
  let expensesData = [];
  let balanceData = [];

  if (monthlyData.length === 0) {
    labels = ['Sin datos'];
    revenueData = [0];
    expensesData = [0];
    balanceData = [0];
  } else {
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    labels = monthlyData.map(d => {
      const parts = d.month.split('-');
      const year = parts[0];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${monthNames[monthIdx]} ${year}`;
    });
    revenueData = monthlyData.map(d => d.revenue || 0);
    expensesData = monthlyData.map(d => d.expenses || 0);
    balanceData = monthlyData.map(d => d.balance || 0);
  }

  balanceChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Ingresos',
          data: revenueData,
          backgroundColor: '#10b981',
          borderRadius: 5,
          borderWidth: 0,
          barPercentage: 0.5,
          categoryPercentage: 0.5,
          order: 2
        },
        {
          label: 'Gastos',
          data: expensesData,
          backgroundColor: '#f43f5e',
          borderRadius: 5,
          borderWidth: 0,
          barPercentage: 0.5,
          categoryPercentage: 0.5,
          order: 2
        },
        {
          label: 'Balance Neto',
          data: balanceData,
          type: 'line',
          borderColor: accentColor,
          borderWidth: 3,
          pointBackgroundColor: accentColor,
          pointBorderColor: isDark ? '#181613' : '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4,
          fill: false,
          order: 1
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              family: 'Plus Jakarta Sans',
              size: 11,
              weight: '600'
            },
            color: legendColor,
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 15
          }
        },
        tooltip: {
          backgroundColor: isDark ? '#23211c' : '#1c1a17',
          titleColor: isDark ? '#f3f1ea' : '#ffffff',
          bodyColor: isDark ? '#a9a69c' : '#ffffff',
          titleFont: { family: 'Plus Jakarta Sans', size: 12, weight: '700' },
          bodyFont: { family: 'Plus Jakarta Sans', size: 13 },
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              if (context.parsed.y !== null) label += fmt(context.parsed.y);
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: 'Plus Jakarta Sans', size: 11, weight: '500' },
            color: tickColor
          }
        },
        y: {
          grid: { color: gridColor },
          border: { dash: [4, 4] },
          ticks: {
            font: { family: 'Fira Code', size: 11 },
            color: tickColor,
            callback: function(value) { return fmt(value); }
          }
        }
      }
    }
  });
}

function setDashboardStatus(message) {
  const el = document.getElementById('dashboardStatus');
  if (el) el.textContent = message || '';
}

function setExpenseDateDefault() {
  const el = document.getElementById('expenseDate');
  if (el && !el.value) el.value = toDateInputValue(new Date());
}

function collectExpenseData() {
  return {
    fecha: g('expenseDate'),
    categoria: g('expenseCategory').trim(),
    descripcion: g('expenseDescription').trim(),
    monto: parseDecimal(g('expenseAmount')),
    notas: g('expenseNotes').trim()
  };
}

function clearExpenseForm() {
  ['expenseCategory', 'expenseDescription', 'expenseAmount', 'expenseNotes'].forEach((id) => setInput(id, ''));
  setExpenseDateDefault();
  setDashboardStatus('');
}

async function saveExpenseFromDashboard() {
  if (!window.electronAPI || !window.electronAPI.saveExpense) return;

  const expense = collectExpenseData();
  if (!expense.descripcion && !expense.categoria) {
    setDashboardStatus('Agrega una descripcion o categoria.');
    return;
  }

  if (!expense.monto || expense.monto <= 0) {
    setDashboardStatus('Agrega un monto mayor que cero.');
    return;
  }

  const result = await window.electronAPI.saveExpense(expense);
  if (!result.success) {
    setDashboardStatus('Error al guardar salida: ' + result.error);
    return;
  }

  setDashboardStatus('Salida guardada (#' + result.id + ').');
  clearExpenseForm();
  await loadExpenses();
  await loadDashboard();
}

async function loadExpenses() {
  if (!window.electronAPI || !window.electronAPI.getExpenses) return;
  expensesCache = await window.electronAPI.getExpenses();
  renderExpenses(expensesCache);
}let activeKpiType = null;

function handleKpiClick(type) {
  const panel = document.getElementById('kpiDetailPanel');
  const content = document.getElementById('kpiDetailContent');
  const title = document.getElementById('kpiDetailTitle');
  if (!panel || !content || !title) return;

  if (activeKpiType === type) {
    closeKpiDetail();
    return;
  }

  activeKpiType = type;
  panel.style.display = 'block';

  // Quitar la clase activa de todos los stat-box
  document.querySelectorAll('.stat-box').forEach(el => el.classList.remove('active-kpi'));
  
  // Asignar clase activa al stat-box correcto
  let targetBoxIdx = 1;
  if (type === 'invoices') targetBoxIdx = 1;
  else if (type === 'clients') targetBoxIdx = 2;
  else if (type === 'revenue') targetBoxIdx = 3;
  else if (type === 'expenses') targetBoxIdx = 4;
  else if (type === 'balance') targetBoxIdx = 5;
  
  const box = document.querySelector(`.stat-box:nth-child(${targetBoxIdx})`);
  if (box) box.classList.add('active-kpi');

  // Cargar contenido interactivo según el KPI pulsado
  if (type === 'clients') {
    title.textContent = 'Listado de Clientes (Acceso Rápido)';
    if (clientsCache.length === 0) {
      content.innerHTML = '<p style="font-size:13px;color:var(--text-secondary);">No hay clientes guardados.</p>';
    } else {
      content.innerHTML = `
        <div class="money-list" style="max-height: 250px; overflow-y: auto;">
          ${clientsCache.map(c => `
            <div class="money-row" style="margin-bottom: 6px;">
              <div>
                <div class="money-title">${escapeHTML(c.nombre)}</div>
                <div class="money-meta">${escapeHTML(c.email || 'Sin correo')} · ${escapeHTML(c.telefono || 'Sin teléfono')}</div>
              </div>
              <button class="btn-primary" onclick="selectClientAndGo(${c.id})" style="padding: 6px 12px; font-size:11px;">Facturar a este cliente</button>
            </div>
          `).join('')}
        </div>
      `;
    }
  } else if (type === 'invoices') {
    title.textContent = 'Historial Reciente de Facturas (Últimas 10)';
    if (historyCache.length === 0) {
      content.innerHTML = '<p style="font-size:13px;color:var(--text-secondary);">No hay facturas registradas.</p>';
    } else {
      content.innerHTML = `
        <div class="money-list" style="max-height: 250px; overflow-y: auto;">
          ${historyCache.slice(0, 10).map(inv => `
            <div class="money-row" style="margin-bottom: 6px;">
              <div>
                <div class="money-title">${escapeHTML(inv.numero)} - ${escapeHTML(inv.cliente_nombre)}</div>
                <div class="money-meta">${escapeHTML(inv.fecha)} · <strong>${fmt(inv.total)}</strong></div>
              </div>
              <button class="btn-secondary" onclick="loadInvoice(${inv.id}); showPage('invoice');" style="padding: 6px 12px; font-size:11px;">Abrir Factura</button>
            </div>
          `).join('')}
        </div>
      `;
    }
  } else if (type === 'expenses') {
    title.textContent = 'Egresos y Salidas Registradas (Últimas 10)';
    if (expensesCache.length === 0) {
      content.innerHTML = '<p style="font-size:13px;color:var(--text-secondary);">No hay gastos registrados.</p>';
    } else {
      content.innerHTML = `
        <div class="money-list" style="max-height: 250px; overflow-y: auto;">
          ${expensesCache.slice(0, 10).map(exp => `
            <div class="money-row" style="margin-bottom: 6px;">
              <div>
                <div class="money-title">${escapeHTML(exp.categoria)} - ${escapeHTML(exp.descripcion)}</div>
                <div class="money-meta">${escapeHTML(exp.fecha)}</div>
              </div>
              <span class="money-amount expense-amt">${fmt(exp.monto)}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
  } else if (type === 'revenue') {
    title.textContent = 'Detalle e Resumen de Ingresos';
    const totalRev = historyCache.reduce((acc, inv) => acc + (inv.total || 0), 0);
    content.innerHTML = `
      <div style="font-size:13.5px;color:var(--text-secondary);line-height: 1.6;">
        <p>Total de ingresos brutos acumulados: <strong style="color:var(--revenue); font-size: 15px;">${fmt(totalRev)}</strong></p>
        <p>Número total de facturas emitidas: <strong>${historyCache.length} facturas</strong></p>
        <button class="btn-primary" onclick="navigateMenu('invoice')" style="margin-top: 10px;">Crear o gestionar facturas</button>
      </div>
    `;
  } else if (type === 'balance') {
    title.textContent = 'Detalles del Emisor & Balance Neto';
    
    // Obtener los valores dinámicos del perfil emisor
    const company = g('issuerName') || 'No configurado';
    const abn = g('issuerABN') || 'No configurado';
    const phone = g('issuerPhone') || 'No configurado';
    const email = g('issuerEmail') || 'No configurado';
    const address = g('issuerAddress') || 'No configurado';

    content.innerHTML = `
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px; font-size:13px; line-height: 1.6;">
        <div>
          <p style="margin-bottom:6px; color:var(--text-main); font-weight:700; text-transform:uppercase; font-size: 11px;">Datos del Emisor Registrado:</p>
          <p><strong>Empresa / Nombre:</strong> ${escapeHTML(company)}</p>
          <p><strong>ABN / Registro Fiscal:</strong> ${escapeHTML(abn)}</p>
          <p><strong>Teléfono:</strong> ${escapeHTML(phone)}</p>
          <p><strong>Email:</strong> ${escapeHTML(email)}</p>
          <p><strong>Dirección:</strong> ${escapeHTML(address)}</p>
          <button class="btn-secondary" onclick="navigateMenu('profile')" style="margin-top:8px; padding: 6px 12px; font-size: 11px;">Editar Datos del Emisor</button>
        </div>
        <div style="border-left: 1px solid var(--border-color); padding-left: 20px;">
          <p style="margin-bottom:6px; color:var(--text-main); font-weight:700; text-transform:uppercase; font-size: 11px;">Resumen del Estado General:</p>
          <p><strong>Total Facturado:</strong> <span style="color:var(--revenue); font-weight:600;">${document.getElementById('dashboardRevenue').textContent}</span></p>
          <p><strong>Total Salidas:</strong> <span style="color:var(--expenses); font-weight:600;">${document.getElementById('dashboardExpenses').textContent}</span></p>
          <p><strong>Balance Total Neto:</strong> <span style="color:var(--balance); font-weight:700;">${document.getElementById('dashboardBalance').textContent}</span></p>
        </div>
      </div>
    `;
  }
}

function closeKpiDetail() {
  const panel = document.getElementById('kpiDetailPanel');
  if (panel) panel.style.display = 'none';
  activeKpiType = null;
  document.querySelectorAll('.stat-box').forEach(el => el.classList.remove('active-kpi'));
}function renderDashboardInvoices(invoices) {
  const list = document.getElementById('dashboardRecentInvoices');
  if (!list) return;

  if (!invoices.length) {
    list.innerHTML = '<div class="history-empty">No hay facturas guardadas.</div>';
    return;
  }

  list.innerHTML = invoices.map((invoice) => {
    return '<div class="money-row">' +
      '<div>' +
        '<div class="money-title">' + escapeHTML(invoice.numero || 'Factura') + ' - ' + escapeHTML(invoice.cliente_nombre || 'Cliente') + '</div>' +
        '<div class="money-meta">' + escapeHTML(invoice.fecha || '') + '</div>' +
      '</div>' +
      '<div class="history-buttons">' +
        '<span class="money-amount income-amt">' + fmt(invoice.total || 0) + '</span>' +
        '<button class="btn-small" onclick="openInvoiceFromDashboard(' + invoice.id + ')">Abrir</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function renderExpenses(expenses) {
  const list = document.getElementById('expenseList');
  if (!list) return;

  if (!expenses.length) {
    list.innerHTML = '<div class="history-empty">No hay salidas registradas.</div>';
    return;
  }

  list.innerHTML = expenses.map((expense) => {
    return '<div class="money-row">' +
      '<div>' +
        '<div class="money-title">' + escapeHTML(expense.categoria || expense.descripcion || 'Salida') + '</div>' +
        '<div class="money-meta">' + escapeHTML(expense.fecha || '') + ' ' + escapeHTML(expense.descripcion || '') + '</div>' +
      '</div>' +
      '<div class="history-buttons">' +
        '<span class="money-amount expense-amt">' + fmt(expense.monto || 0) + '</span>' +
        '<button class="btn-small danger" onclick="deleteExpense(' + expense.id + ')">Borrar</button>' +
      '</div>' +
    '</div>';
  }).join('');
}

function openInvoiceFromDashboard(id) {
  loadInvoice(id);
  showPage('invoice');
}

async function deleteExpense(id) {
  if (!window.confirm('Borrar esta salida?')) return;
  const result = await window.electronAPI.deleteExpense(id);
  if (!result.success) {
    setDashboardStatus('Error al borrar salida: ' + result.error);
    return;
  }

  setDashboardStatus('Salida borrada.');
  await loadExpenses();
  await loadDashboard();
}

function addCalcLine() {
  addCalc();
}

function applyCalculatedTotal() {
  applyCalcToInvoice();
}

/* =========================
   CONFIGURACIÓN Y ENVÍO DE CORREO (SMTP)
   ========================= */

function setEmailConfigStatus(message) {
  const el = document.getElementById('emailConfigStatus');
  if (el) el.textContent = message || '';
}

async function loadEmailConfig() {
  if (!window.electronAPI || !window.electronAPI.getEmailConfig) return;
  const config = await window.electronAPI.getEmailConfig();
  if (!config) return;
  setInput('emailHost', config.host || '');
  setInput('emailPort', config.port || 587);
  setInput('emailUser', config.usuario || '');
  setInput('emailPass', config.contrasena || '');
  setInput('emailSenderName', config.nombre_remitente || '');
  
  const secureEl = document.getElementById('emailSecure');
  if (secureEl) secureEl.checked = config.secure === 1;
}

async function saveEmailConfig() {
  if (!window.electronAPI || !window.electronAPI.saveEmailConfig) return;
  
  const secureEl = document.getElementById('emailSecure');
  const config = {
    host: g('emailHost').trim(),
    port: parseInt(g('emailPort')) || 587,
    secure: secureEl ? secureEl.checked : false,
    usuario: g('emailUser').trim(),
    contrasena: g('emailPass').trim(),
    nombre_remitente: g('emailSenderName').trim()
  };

  if (!config.host || !config.usuario || !config.contrasena) {
    setEmailConfigStatus('Por favor, completa los campos obligatorios (Servidor, Usuario y Contraseña).');
    return;
  }

  const result = await window.electronAPI.saveEmailConfig(config);
  if (result.success) {
    setEmailConfigStatus('Configuración de correo guardada.');
    await loadEmailConfig();
  } else {
    setEmailConfigStatus('Error al guardar: ' + result.error);
  }
}

async function testEmailConfig() {
  if (!window.electronAPI || !window.electronAPI.testEmailConnection) return;
  
  const secureEl = document.getElementById('emailSecure');
  const config = {
    host: g('emailHost').trim(),
    port: parseInt(g('emailPort')) || 587,
    secure: secureEl ? secureEl.checked : false,
    usuario: g('emailUser').trim(),
    contrasena: g('emailPass').trim(),
    nombre_remitente: g('emailSenderName').trim()
  };

  if (!config.host || !config.usuario || !config.contrasena) {
    setEmailConfigStatus('Completa Servidor, Usuario y Contraseña para probar.');
    return;
  }

  setEmailConfigStatus('Probando conexión y enviando correo de prueba...');
  const result = await window.electronAPI.testEmailConnection(config);
  if (result.success) {
    setEmailConfigStatus('¡Éxito! Correo de prueba enviado a ' + config.usuario);
  } else {
    setEmailConfigStatus('Error de conexión: ' + result.error);
  }
}

async function sendInvoiceEmailAction() {
  const clientName = g('clientName').trim();
  const clientEmail = g('clientEmail').trim();

  if (!clientName) {
    setStatus('Ingresa el nombre del cliente antes de enviar.');
    alert('Ingresa el nombre del cliente antes de enviar.');
    return;
  }

  if (!clientEmail) {
    setStatus('Ingresa el correo electrónico del cliente.');
    alert('Ingresa el correo electrónico del cliente.');
    return;
  }

  setStatus('Guardando factura y PDF antes de enviar...');
  
  // Guardamos o actualizamos la factura en SQLite
  await saveInvoice();
  if (!currentInvoiceId) {
    setStatus('No se pudo guardar la factura.');
    return;
  }

  // Generamos e instalamos el PDF localmente
  await downloadPDF();

  setStatus('Enviando factura por correo...');
  const receiptEl = document.getElementById('sendRequestReceipt');
  const requestReceipt = receiptEl ? receiptEl.checked : false;

  const emailData = {
    invoiceId: currentInvoiceId,
    recipientEmail: clientEmail,
    recipientName: clientName,
    requestReadReceipt: requestReceipt
  };

  const result = await window.electronAPI.sendInvoiceEmail(emailData);
  if (result.success) {
    setStatus('¡Factura enviada con éxito al correo del cliente!');
    alert('¡Factura enviada con éxito al correo del cliente!');
  } else {
    setStatus('Error al enviar correo: ' + result.error);
    alert('Error al enviar correo: ' + result.error);
  }
}







