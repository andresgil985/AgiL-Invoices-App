/* ==========================================================================
   COMPATIBILIDAD CON AMBIENTE WEB / PWA
   ========================================================================== */
const DEFAULT_GOOGLE_CLIENT_ID = '750236352945-mmf1hh5ejrs5rr231j4e13dlvr0r2duo.apps.googleusercontent.com';

if (typeof window.electronAPI === 'undefined') {
  console.log('Ambiente PWA: Inicializando persistencia en localStorage.');
  
  const delay = (val) => new Promise(resolve => setTimeout(() => resolve(val), 10));

  window.electronAPI = {
    isPWA: true,
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
    },
    getGeneralConfig: () => {
      const data = localStorage.getItem('db_config_general');
      return delay(data ? JSON.parse(data) : { idioma: 'es', logo_base64: null });
    },
    saveGeneralConfig: (config) => {
      const current = JSON.parse(localStorage.getItem('db_config_general') || '{"idioma":"es","logo_base64":null}');
      const merged = { ...current, ...config };
      localStorage.setItem('db_config_general', JSON.stringify(merged));
      return delay({ success: true });
    },
    deleteLogo: () => {
      const current = JSON.parse(localStorage.getItem('db_config_general') || '{"idioma":"es","logo_base64":null}');
      current.logo_base64 = null;
      localStorage.setItem('db_config_general', JSON.stringify(current));
      return delay({ success: true });
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
let cachedLogoBase64 = null;
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
  const ids = ['Dashboard', 'Invoice', 'Clients', 'Profile', 'Expenses', 'History', 'Settings'];
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
  const settings = document.getElementById('settingsPage');

  if (dashboard) dashboard.classList.toggle('active', page === 'dashboard');
  if (invoice) invoice.classList.toggle('active', page === 'invoice');
  if (settings) settings.classList.toggle('active', page === 'settings');

  setActiveMenu(page === 'dashboard' ? 'dashboard' : (page === 'settings' ? 'settings' : 'invoice'));

  if (page === 'dashboard') {
    loadDashboard();
    loadExpenses();
  } else if (page === 'settings') {
    loadEmailConfig();
    loadGeneralConfig();
  } else {
    loadHistory();
    loadClients();
    loadUserProfile();
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
    history: { page: 'invoice', target: 'historySection', active: 'history' },
    settings: { page: 'settings', target: 'settingsPage', active: 'settings' }
  };

  const route = routes[section] || routes.dashboard;
  showPage(route.page);
  setActiveMenu(route.active);
  if (route.page !== 'settings') {
    setTimeout(() => scrollToSection(route.target), 80);
  }
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

function updatePreview() {
  const sub = items.reduce((s, it) => s + (it.qty || 0) * (it.price || 0), 0);

  renderLogoInInvoice(cachedLogoBase64);

  s('p_clientName', g('clientName'));
  s('p_clientEmail', g('clientEmail'));
  s('p_clientPhone', g('clientPhone'));

  s('p_issuerName', g('issuerName'));
  s('p_abn', g('issuerABN'));
  
  const bgText = document.getElementById('bgText');
  if (bgText) {
    const isEn = document.getElementById('settingLanguage')?.value === 'en';
    bgText.textContent = ((isEn ? 'Invoice ' : 'Factura ') + (g('invNumber') || '')).trim();
  }

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
  
  // Nuevas inicializaciones
  loadGeneralConfig().then(() => {
    checkAuthGate();
  });
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
  setInput('emailDefaultSubject', config.asunto_predeterminado || '');
  setInput('emailDefaultBody', config.cuerpo_predeterminado || '');
  
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
    nombre_remitente: g('emailSenderName').trim(),
    asunto_predeterminado: g('emailDefaultSubject').trim(),
    cuerpo_predeterminado: g('emailDefaultBody').trim()
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
    nombre_remitente: g('emailSenderName').trim(),
    asunto_predeterminado: g('emailDefaultSubject').trim(),
    cuerpo_predeterminado: g('emailDefaultBody').trim()
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

  setStatus('Generando factura...');
  
  await saveInvoice();
  if (!currentInvoiceId) {
    setStatus('No se pudo guardar la factura.');
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const previewCard = document.getElementById('invCard');
  if (previewCard) {
    await html2canvas(previewCard, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; 
      const pageHeight = 297;  
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    });
  }

  const pdfBase64 = pdf.output('datauristring').split(',')[1];
  const invoiceNumber = g('invoiceNumber') || '0001';

  if (googleToken) {
    setStatus('Enviando factura directamente por Gmail API...');
    try {
      await sendEmailViaGmailAPI(clientName, clientEmail, pdfBase64, invoiceNumber);
      setStatus('¡Factura enviada con éxito desde tu cuenta de Google!');
      alert('¡Factura enviada con éxito desde tu cuenta de Google!');
    } catch (err) {
      console.error(err);
      setStatus('Error al enviar correo por Google: ' + err.message);
      alert('Error al enviar correo por Google: ' + err.message);
    }
  } else {
    if (!window.electronAPI || !window.electronAPI.sendInvoiceEmail) {
      alert('Para enviar correos SMTP debes estar en la aplicación de Windows, o iniciar sesión con Google.');
      setStatus('SMTP requiere versión de Windows.');
      return;
    }

    setStatus('Enviando factura por correo SMTP...');
    await downloadPDF();
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
      setStatus('¡Factura enviada con éxito al correo del cliente (SMTP)!');
      alert('¡Factura enviada con éxito al correo del cliente (SMTP)!');
    } else {
      setStatus('Error al enviar correo (SMTP): ' + result.error);
      alert('Error al enviar correo (SMTP): ' + result.error);
    }
  }
}

/* ==========================================================================
   SECCIÓN DE CONFIGURACIONES, LOGOTIPO, IDIOMAS Y SINCRONIZACIÓN DE GOOGLE
   ========================================================================== */

function toggleSmtpAccordion() {
  const content = document.getElementById('smtpAccordionContent');
  const arrow = document.getElementById('smtpAccordionArrow');
  if (!content) return;
  if (content.style.display === 'none' || content.style.display === '') {
    content.style.display = 'flex';
    if (arrow) arrow.style.transform = 'rotate(180deg)';
  } else {
    content.style.display = 'none';
    if (arrow) arrow.style.transform = 'rotate(0deg)';
  }
}

async function loadGeneralConfig() {
  let config = null;
  if (window.electronAPI && window.electronAPI.getGeneralConfig) {
    config = await window.electronAPI.getGeneralConfig();
  } else {
    const data = localStorage.getItem('db_config_general');
    config = data ? JSON.parse(data) : { idioma: 'es', logo_base64: null, google_client_id: '' };
  }
  
  if (!config) return;
  
  // Idioma
  const langSelect = document.getElementById('settingLanguage');
  if (langSelect) langSelect.value = config.idioma || 'es';
  applyLanguage(config.idioma || 'es');
  
  // Logo
  cachedLogoBase64 = config.logo_base64 || null;
  const preview = document.getElementById('logoPreviewContainer');
  if (preview) {
    if (cachedLogoBase64) {
      preview.innerHTML = `<img src="${cachedLogoBase64}" style="max-width:100%; max-height:100%; object-fit:contain;">`;
    } else {
      preview.innerHTML = `<span style="font-size:11px; color:var(--text-secondary);" id="lbl_settings_no_logo">Sin Logo</span>`;
    }
  }
  
  // Google Client ID
  const googleClientIdInput = document.getElementById('googleClientId');
  if (googleClientIdInput) {
    googleClientIdInput.value = config.google_client_id || '';
  }
  
  updateGoogleSyncStatusUI();
  renderLogoInInvoice(cachedLogoBase64);
}

async function saveGeneralConfigAction(updatedFields = {}) {
  let current = null;
  if (window.electronAPI && window.electronAPI.getGeneralConfig) {
    current = await window.electronAPI.getGeneralConfig();
  } else {
    const data = localStorage.getItem('db_config_general');
    current = data ? JSON.parse(data) : { idioma: 'es', logo_base64: null, google_client_id: '' };
  }
  
  const merged = { ...current, ...updatedFields };
  
  if (window.electronAPI && window.electronAPI.saveGeneralConfig) {
    await window.electronAPI.saveGeneralConfig(merged);
  } else {
    localStorage.setItem('db_config_general', JSON.stringify(merged));
  }
  
  await loadGeneralConfig();
}

async function uploadLogoAction(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (e) => {
    const base64 = e.target.result;
    await saveGeneralConfigAction({ logo_base64: base64 });
    renderLogoInInvoice(base64);
  };
  reader.readAsDataURL(file);
}

async function deleteLogoAction() {
  if (window.electronAPI && window.electronAPI.deleteLogo) {
    await window.electronAPI.deleteLogo();
  } else {
    const data = localStorage.getItem('db_config_general');
    const config = data ? JSON.parse(data) : { idioma: 'es', logo_base64: null, google_client_id: '' };
    config.logo_base64 = null;
    localStorage.setItem('db_config_general', JSON.stringify(config));
  }
  cachedLogoBase64 = null;
  await loadGeneralConfig();
  renderLogoInInvoice(null);
}

function renderLogoInInvoice(logoBase64) {
  const previewLogoContainer = document.getElementById('previewLogoContainer');
  if (previewLogoContainer) {
    if (logoBase64) {
      previewLogoContainer.innerHTML = `<img src="${logoBase64}" style="max-height:80px; max-width:180px; object-fit:contain; border-radius:4px;">`;
    } else {
      previewLogoContainer.innerHTML = '';
    }
  }
}

/* --- TRADUCCIONES --- */
const translations = {
  es: {
    lbl_menu_dashboard: "Dashboard",
    lbl_menu_new_invoice: "Nueva Factura",
    lbl_menu_clients: "Clientes",
    lbl_menu_profile: "Perfil Emisor",
    lbl_menu_expenses: "Registrar Salida",
    lbl_menu_history: "Historial",
    lbl_menu_settings: "Configuraciones",
    
    lbl_settings_title: "Configuraciones Generales",
    lbl_settings_lang_section: "Idioma de la Aplicación",
    lbl_settings_lang_desc: "Selecciona el idioma de la interfaz del usuario. Esto cambiará también el contenido de los correos predeterminados.",
    lbl_settings_lang_select: "Seleccionar Idioma",
    lbl_settings_logo_section: "Logotipo de Factura",
    lbl_settings_logo_desc: "Sube una imagen (PNG o JPG) de tu logotipo. Se mostrará automáticamente en tus facturas.",
    lbl_settings_no_logo: "Sin Logo",
    lbl_settings_upload_btn: "Cargar Imagen",
    lbl_settings_delete_logo_btn: "Eliminar Logo",
    lbl_settings_google_section: "Sincronización en la Nube",
    lbl_settings_google_desc: "Conecta tu cuenta de Google para respaldar tus facturas en Google Drive y enviar correos sin configurar SMTP.",
    lbl_settings_google_btn: "Conectar cuenta de Google",
    lbl_settings_google_client_id: "Google Client ID (OAuth)",
    lbl_settings_smtp_title: "Configuración SMTP Avanzada (Opcional)",
    lbl_settings_smtp_desc: "Si no usas la API de Gmail, puedes ingresar tus credenciales SMTP clásicas para el envío de facturas.",
    lbl_smtp_host: "Servidor SMTP",
    lbl_smtp_port: "Puerto",
    lbl_smtp_user: "Usuario / Correo",
    lbl_smtp_pass: "Contraseña",
    lbl_smtp_sender: "Nombre Remitente",
    lbl_smtp_subject: "Asunto Predeterminado",
    lbl_smtp_body: "Mensaje Predeterminado",
    lbl_smtp_secure: "Usar SSL/TLS (Puerto 465)",
    lbl_smtp_save_btn: "Guardar correo",
    lbl_smtp_test_btn: "Probar conexión",
    lbl_login_subtitle: "Genera y gestiona facturas profesionales desde cualquier lugar",
    lbl_login_btn_text: "Iniciar sesión con Google",
    lbl_login_footer: "Sincroniza tus datos automáticamente con tu cuenta personal."
  },
  en: {
    lbl_menu_dashboard: "Dashboard",
    lbl_menu_new_invoice: "New Invoice",
    lbl_menu_clients: "Clients",
    lbl_menu_profile: "Issuer Profile",
    lbl_menu_expenses: "Register Expense",
    lbl_menu_history: "History",
    lbl_menu_settings: "Settings",
    
    lbl_settings_title: "General Settings",
    lbl_settings_lang_section: "App Language",
    lbl_settings_lang_desc: "Select the language for the user interface. This will also update default email templates.",
    lbl_settings_lang_select: "Select Language",
    lbl_settings_logo_section: "Invoice Logo",
    lbl_settings_logo_desc: "Upload a logo image (PNG or JPG). It will be automatically shown on your invoices.",
    lbl_settings_no_logo: "No Logo",
    lbl_settings_upload_btn: "Upload Image",
    lbl_settings_delete_logo_btn: "Delete Logo",
    lbl_settings_google_section: "Cloud Synchronization",
    lbl_settings_google_desc: "Connect your Google account to back up your invoices to Google Drive and send emails without SMTP setup.",
    lbl_settings_google_btn: "Connect Google Account",
    lbl_settings_google_client_id: "Google Client ID (OAuth)",
    lbl_settings_smtp_title: "Advanced SMTP Settings (Optional)",
    lbl_settings_smtp_desc: "If you do not use the Gmail API, you can enter your classic SMTP credentials for invoice delivery.",
    lbl_smtp_host: "SMTP Host",
    lbl_smtp_port: "Port",
    lbl_smtp_user: "User / Email",
    lbl_smtp_pass: "Password",
    lbl_smtp_sender: "Sender Name",
    lbl_smtp_subject: "Default Subject",
    lbl_smtp_body: "Default Message",
    lbl_smtp_secure: "Use SSL/TLS (Port 465)",
    lbl_smtp_save_btn: "Save email settings",
    lbl_smtp_test_btn: "Test connection",
    lbl_login_subtitle: "Generate and manage professional invoices from anywhere",
    lbl_login_btn_text: "Sign in with Google",
    lbl_login_footer: "Synchronously backup your data automatically with your personal account."
  }
};

async function changeLanguageAction() {
  const select = document.getElementById('settingLanguage');
  if (!select) return;
  const lang = select.value;
  
  await saveGeneralConfigAction({ idioma: lang });
  
  const subjectEl = document.getElementById('emailDefaultSubject');
  const bodyEl = document.getElementById('emailDefaultBody');
  if (subjectEl && bodyEl) {
    const isSubjectEmpty = !subjectEl.value.trim();
    const isBodyEmpty = !bodyEl.value.trim();
    
    const defaultSubjectES = 'Factura {numero} - {emisor}';
    const defaultBodyES = 'Estimado/a {cliente},\n\nAdjunto a este correo encontrará la factura {numero} correspondiente a nuestros servicios.\n\nSaludos cordiales,\n{emisor}';
    
    const defaultSubjectEN = 'Invoice {numero} - {emisor}';
    const defaultBodyEN = 'Dear {cliente},\n\nPlease find attached invoice {numero} for our services.\n\nBest regards,\n{emisor}';

    if (lang === 'en') {
      if (isSubjectEmpty || subjectEl.value.trim() === defaultSubjectES) {
        subjectEl.value = defaultSubjectEN;
      }
      if (isBodyEmpty || bodyEl.value.trim() === defaultBodyES) {
        bodyEl.value = defaultBodyEN;
      }
    } else {
      if (isSubjectEmpty || subjectEl.value.trim() === defaultSubjectEN) {
        subjectEl.value = defaultSubjectES;
      }
      if (isBodyEmpty || bodyEl.value.trim() === defaultBodyEN) {
        bodyEl.value = defaultBodyES;
      }
    }
    
    await saveEmailConfig();
  }
}

function applyLanguage(lang) {
  const dict = translations[lang] || translations.es;
  Object.keys(dict).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = dict[id];
      } else {
        el.textContent = dict[id];
      }
    }
  });

  const bgText = document.getElementById('bgText');
  if (bgText) {
    bgText.textContent = lang === 'en' ? 'Invoice' : 'Factura';
  }
}

/* --- GOOGLE OAUTH & DRIVE / GMAIL --- */
let tokenClient = null;
let googleToken = null;

function initGoogleClient(clientId) {
  if (typeof google === 'undefined') {
    console.warn('Google Identity Services SDK no cargado aún.');
    return;
  }
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/gmail.send',
    callback: (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        googleToken = tokenResponse.access_token;
        localStorage.setItem('google_access_token', googleToken);
        localStorage.setItem('google_token_expiry', (Date.now() + (tokenResponse.expires_in * 1000)).toString());
        updateGoogleSyncStatusUI();
        
        // Esconder Login Overlay y mostrar panel principal
        const loginOverlay = document.getElementById('loginOverlay');
        const appLayout = document.querySelector('.app-layout');
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (appLayout) appLayout.style.display = 'grid';
        
        syncGoogleDrive().catch(err => console.error('Sync failed:', err));
      }
    },
  });
}

async function handleGoogleAuth() {
  let clientId = '';
  const googleClientIdInput = document.getElementById('googleClientId');
  if (googleClientIdInput && googleClientIdInput.value.trim()) {
    clientId = googleClientIdInput.value.trim();
  }
  if (!clientId) {
    clientId = DEFAULT_GOOGLE_CLIENT_ID;
  }

  if (!clientId || clientId.includes('YOUR_GOOGLE_CLIENT_ID_HERE')) {
    alert('Por favor, configure un Google Client ID válido en el código o en la pestaña de configuraciones.');
    return;
  }
  
  await saveGeneralConfigAction({ google_client_id: clientId });
  
  if (!tokenClient) {
    initGoogleClient(clientId);
  }
  
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  } else {
    alert('Error al inicializar el cliente de Google. Revisa tu conexión a internet.');
  }
}

function loadGoogleToken() {
  const token = localStorage.getItem('google_access_token');
  const expiry = localStorage.getItem('google_token_expiry');
  if (token && expiry && Date.now() < parseInt(expiry)) {
    googleToken = token;
  } else {
    googleToken = null;
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
  }
  updateGoogleSyncStatusUI();
}

function updateGoogleSyncStatusUI() {
  const btn = document.getElementById('btnGoogleAuth');
  const status = document.getElementById('googleSyncStatus');
  if (!btn || !status) return;

  const isEn = document.getElementById('settingLanguage')?.value === 'en';

  if (googleToken) {
    btn.innerHTML = `<span>${isEn ? 'Disconnect Google Account' : 'Desconectar cuenta de Google'}</span>`;
    btn.onclick = handleGoogleLogout;
    status.innerHTML = `<span style="color:#34A853; font-weight:bold;">${isEn ? 'Connected ✔' : 'Conectado ✔'}</span>`;
  } else {
    btn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
      <span>${isEn ? 'Connect Google Account' : 'Conectar cuenta de Google'}</span>
    `;
    btn.onclick = handleGoogleAuth;
    status.textContent = isEn ? 'Not connected' : 'No conectado';
  }
}

function handleGoogleLogout() {
  googleToken = null;
  localStorage.removeItem('google_access_token');
  localStorage.removeItem('google_token_expiry');
  updateGoogleSyncStatusUI();
  
  const isEn = document.getElementById('settingLanguage')?.value === 'en';
  alert(isEn ? 'Google account disconnected.' : 'Cuenta de Google desconectada.');

  const isPC = window.electronAPI && !window.electronAPI.isPWA;
  if (!isPC) {
    const loginOverlay = document.getElementById('loginOverlay');
    const appLayout = document.querySelector('.app-layout');
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (appLayout) appLayout.style.display = 'none';
  }
}

function checkAuthGate() {
  const isPC = window.electronAPI && !window.electronAPI.isPWA;
  // En PC (Electron) no aplicamos login obligatorio para permitir uso local y offline
  if (isPC) {
    const loginOverlay = document.getElementById('loginOverlay');
    if (loginOverlay) loginOverlay.style.display = 'none';
    const appLayout = document.querySelector('.app-layout');
    if (appLayout) appLayout.style.display = 'grid';
    return;
  }

  // En PWA (Navegador/Celular)
  loadGoogleToken();
  const loginOverlay = document.getElementById('loginOverlay');
  const appLayout = document.querySelector('.app-layout');

  const generalConfigStr = localStorage.getItem('db_config_general');
  const generalConfig = generalConfigStr ? JSON.parse(generalConfigStr) : {};
  const savedClientId = generalConfig.google_client_id || DEFAULT_GOOGLE_CLIENT_ID;

  if (googleToken) {
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (appLayout) appLayout.style.display = 'grid';

    if (savedClientId && !savedClientId.includes('YOUR_GOOGLE_CLIENT_ID_HERE') && !tokenClient) {
      initGoogleClient(savedClientId);
    }
    syncGoogleDrive().catch(err => console.error('Auto-sync failed:', err));
  } else {
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (appLayout) appLayout.style.display = 'none';

    if (savedClientId && !savedClientId.includes('YOUR_GOOGLE_CLIENT_ID_HERE') && !tokenClient) {
      initGoogleClient(savedClientId);
    }
  }
}

async function saveGoogleClientIdAction() {
  const el = document.getElementById('googleClientId');
  if (el) {
    await saveGeneralConfigAction({ google_client_id: el.value.trim() });
  }
}

/* --- SINCRONIZACIÓN DE GOOGLE DRIVE (API) --- */
async function syncGoogleDrive() {
  if (!googleToken) return;
  
  let backupData = {};
  if (window.electronAPI && window.electronAPI.getInvoices) {
    const invoices = await window.electronAPI.getInvoices();
    const clients = await window.electronAPI.getClients();
    const expenses = await window.electronAPI.getExpenses();
    const profile = await window.electronAPI.getUserProfile();
    const emailConfig = await window.electronAPI.getEmailConfig();
    const generalConfig = await window.electronAPI.getGeneralConfig();
    backupData = { invoices, clients, expenses, profile, emailConfig, generalConfig };
  } else {
    backupData = {
      invoices: JSON.parse(localStorage.getItem('db_facturas') || '[]'),
      clients: JSON.parse(localStorage.getItem('db_clientes') || '[]'),
      expenses: JSON.parse(localStorage.getItem('db_gastos') || '[]'),
      profile: JSON.parse(localStorage.getItem('db_perfil') || '{}'),
      emailConfig: JSON.parse(localStorage.getItem('db_config_correo') || '{}'),
      generalConfig: JSON.parse(localStorage.getItem('db_config_general') || '{}')
    };
  }
  
  const statusEl = document.getElementById('googleSyncStatus');
  const isEn = document.getElementById('settingLanguage')?.value === 'en';
  if (statusEl) statusEl.textContent = isEn ? 'Checking backup file...' : 'Buscando copia de seguridad...';

  try {
    const searchRes = await fetch('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name=%27db_backup.json%27', {
      headers: { 'Authorization': `Bearer ${googleToken}` }
    });
    const searchData = await searchRes.json();
    
    let fileId = null;
    if (searchData.files && searchData.files.length > 0) {
      fileId = searchData.files[0].id;
    }
    
    if (fileId) {
      if (statusEl) statusEl.textContent = isEn ? 'Syncing cloud data...' : 'Sincronizando datos...';
      const downloadRes = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${googleToken}` }
      });
      const cloudData = await downloadRes.json();
      
      backupData = mergeSyncData(backupData, cloudData);
      await saveMergedDataLocally(backupData);
      await uploadToDrive(fileId, backupData);
    } else {
      if (statusEl) statusEl.textContent = isEn ? 'Creating backup file...' : 'Creando copia de seguridad...';
      await createInDrive(backupData);
    }
    
    if (statusEl) {
      const dateStr = new Date().toLocaleTimeString();
      statusEl.innerHTML = `<span style="color:#34A853; font-weight:bold;">${isEn ? 'Synced with Drive ✔' : 'Sincronizado con Drive ✔'} (${dateStr})</span>`;
    }
  } catch (err) {
    console.error('Error al sincronizar con Google Drive:', err);
    if (statusEl) statusEl.innerHTML = `<span style="color:#EA4335;">${isEn ? 'Sync error' : 'Error de sincronización'}</span>`;
  }
}

function mergeSyncData(local, cloud) {
  const mergedInvoices = mergeArrayById(local.invoices, cloud.invoices);
  const mergedClients = mergeArrayById(local.clients, cloud.clients);
  const mergedExpenses = mergeArrayById(local.expenses, cloud.expenses);
  
  return {
    invoices: mergedInvoices,
    clients: mergedClients,
    expenses: mergedExpenses,
    profile: { ...cloud.profile, ...local.profile },
    emailConfig: { ...cloud.emailConfig, ...local.emailConfig },
    generalConfig: { ...cloud.generalConfig, ...local.generalConfig }
  };
}

function mergeArrayById(localArr = [], cloudArr = []) {
  const map = new Map();
  if (Array.isArray(cloudArr)) {
    cloudArr.forEach(item => { if(item && item.id) map.set(item.id, item); });
  }
  if (Array.isArray(localArr)) {
    localArr.forEach(item => { if(item && item.id) map.set(item.id, item); });
  }
  return Array.from(map.values());
}

async function saveMergedDataLocally(data) {
  if (window.electronAPI && window.electronAPI.importInvoices) {
    for (const invoice of (data.invoices || [])) {
      await window.electronAPI.saveInvoice(invoice);
    }
    for (const client of (data.clients || [])) {
      await window.electronAPI.saveClient(client);
    }
    for (const expense of (data.expenses || [])) {
      await window.electronAPI.saveExpense(expense);
    }
    if (data.profile) await window.electronAPI.saveUserProfile(data.profile);
    if (data.emailConfig) await window.electronAPI.saveEmailConfig(data.emailConfig);
    if (data.generalConfig) await window.electronAPI.saveGeneralConfig(data.generalConfig);
  } else {
    localStorage.setItem('db_facturas', JSON.stringify(data.invoices || []));
    localStorage.setItem('db_clientes', JSON.stringify(data.clients || []));
    localStorage.setItem('db_gastos', JSON.stringify(data.expenses || []));
    localStorage.setItem('db_perfil', JSON.stringify(data.profile || {}));
    localStorage.setItem('db_config_correo', JSON.stringify(data.emailConfig || {}));
    localStorage.setItem('db_config_general', JSON.stringify(data.generalConfig || {}));
  }
  
  if (typeof loadDashboard === 'function') loadDashboard();
  if (typeof loadHistory === 'function') loadHistory();
  if (typeof loadClients === 'function') loadClients();
  if (typeof loadUserProfile === 'function') loadUserProfile();
}

async function uploadToDrive(fileId, data) {
  const boundary = 'foo_bar_baz';
  const metadata = { name: 'db_backup.json' };
  
  const multipartBody = 
    `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}` +
    `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}` +
    `\r\n--${boundary}--`;

  await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${googleToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });
}

async function createInDrive(data) {
  const boundary = 'foo_bar_baz';
  const metadata = {
    name: 'db_backup.json',
    parents: ['appDataFolder']
  };
  
  const multipartBody = 
    `\r\n--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}` +
    `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(data)}` +
    `\r\n--${boundary}--`;

  await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${googleToken}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });
}

/* --- ENVÍO GMAIL API --- */
async function sendEmailViaGmailAPI(clientName, clientEmail, pdfBase64, invoiceNumber) {
  if (!googleToken) {
    throw new Error('Google token not found.');
  }

  let emisorName = 'Emisor';
  if (window.electronAPI && window.electronAPI.getUserProfile) {
    const profile = await window.electronAPI.getUserProfile();
    emisorName = profile.nombre || 'Emisor';
  } else {
    const profile = JSON.parse(localStorage.getItem('db_perfil') || '{}');
    emisorName = profile.nombre || 'Emisor';
  }

  let emailConfig = {};
  if (window.electronAPI && window.electronAPI.getEmailConfig) {
    emailConfig = await window.electronAPI.getEmailConfig();
  } else {
    emailConfig = JSON.parse(localStorage.getItem('db_config_correo') || '{}');
  }

  let subject = emailConfig.asunto_predeterminado || 'Factura {numero} - {emisor}';
  let body = emailConfig.cuerpo_predeterminado || 'Estimado/a {cliente},\n\nAdjunto a este correo encontrará la factura {numero} correspondiente a nuestros servicios.\n\nSaludos cordiales,\n{emisor}';

  subject = subject.replace(/{numero}/g, invoiceNumber).replace(/{emisor}/g, emisorName).replace(/{cliente}/g, clientName);
  body = body.replace(/{numero}/g, invoiceNumber).replace(/{emisor}/g, emisorName).replace(/{cliente}/g, clientName);

  const boundary = 'mime_boundary_string_123';
  const fileName = `Factura-${invoiceNumber}.pdf`;

  const mimeParts = [
    `To: ${clientEmail}`,
    `Subject: =?UTF-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset="UTF-8"`,
    `Content-Transfer-Encoding: 7bit`,
    ``,
    body,
    ``,
    `--${boundary}`,
    `Content-Type: application/pdf; name="${fileName}"`,
    `Content-Disposition: attachment; filename="${fileName}"`,
    `Content-Transfer-Encoding: base64`,
    ``,
    pdfBase64,
    ``,
    `--${boundary}--`
  ];

  const mimeString = mimeParts.join('\r\n');

  const base64Safe = btoa(unescape(encodeURIComponent(mimeString)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${googleToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: base64Safe })
  });

  if (!response.ok) {
    const errorDetails = await response.text();
    throw new Error('Gmail API Error: ' + errorDetails);
  }

  return await response.json();
}







