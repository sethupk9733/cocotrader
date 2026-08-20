import { store } from './store.js';
import { t, getLang, setLang, translations } from './i18n.js';

// Dynamic DOM Element Getters (Guarantees fresh lookup even if DOM loads asynchronously)
const getEl = (id) => document.getElementById(id);
const getViewContainer = () => getEl('contentView');
const getModalBackdrop = () => getEl('modalBackdrop');
const getModalTitle = () => getEl('modalTitle');
const getModalBody = () => getEl('modalBody');
const getTabTitle = () => getEl('currentTabTitle');
const getTabSubtitle = () => getEl('currentTabSubtitle');

let currentTab = 'dashboard';

// Top-Level Window Exports for Inline Event Handlers
window.store = store;
window.switchTab = switchTab;
window.openNewLotModal = openNewLotModal;
window.updateStageModal = updateStageModal;
window.openNewClientModal = openNewClientModal;
window.openReturnClientAdvanceModal = openReturnClientAdvanceModal;
window.openNewWorkerModal = openNewWorkerModal;
window.openReturnWorkerAdvanceModal = openReturnWorkerAdvanceModal;
window.openNewCoconutSaleModal = openNewCoconutSaleModal;
window.openNewHuskSaleModal = openNewHuskSaleModal;
window.openNewExpenseModal = openNewExpenseModal;
window.openGenerateClientBillModal = openGenerateClientBillModal;
window.printClientBill = printClientBill;
window.exportDataJSON = exportDataJSON;
window.openModal = openModal;
window.closeModal = closeModal;
window.resetAppDatabase = () => {
  try { localStorage.clear(); } catch(e) {}
  location.reload();
};

window.toggleLanguage = function() {
  const newLang = getLang() === 'en' ? 'ta' : 'en';
  setLang(newLang);
  updateUILanguage();
  switchTab(currentTab);
};

function updateUILanguage() {
  const lang = getLang();
  const langBtnText = getEl('langBtnText');
  if (langBtnText) {
    langBtnText.textContent = lang === 'en' ? 'தமிழ் (Tamil)' : 'English (EN)';
  }

  const navMap = {
    dashboard: t('navDashboard'),
    lots: t('navLots'),
    rates: t('navRates'),
    clients: t('navClients'),
    workers: t('navWorkers'),
    sales: t('navSales'),
    expenses: t('navExpenses'),
    analytics: t('navAnalytics')
  };

  document.querySelectorAll('[data-tab]').forEach(btn => {
    const tabKey = btn.getAttribute('data-tab');
    const span = btn.querySelector('span');
    if (span && navMap[tabKey]) {
      span.textContent = navMap[tabKey];
    }
  });

  const quickBatchBtn = getEl('txtBtnQuickBatch');
  if (quickBatchBtn) quickBatchBtn.textContent = t('btnNewLot');
  const exportBtn = getEl('txtBtnExport');
  if (exportBtn) exportBtn.textContent = t('btnExport');
}

// Reliable Initialization Handler
function initApp() {
  closeModal();
  setupNavigation();
  setupGlobalEvents();
  updateUILanguage();
  renderView(currentTab);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Event Delegation Navigation
function setupNavigation() {
  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-tab]');
    if (tabBtn) {
      const tab = tabBtn.getAttribute('data-tab');
      if (tab) {
        e.preventDefault();
        switchTab(tab);
      }
    }
  });

  const themeBtn = getEl('themeToggle');
  themeBtn?.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    document.body.classList.toggle('dark-theme');
  });
}

function switchTab(tabName) {
  currentTab = tabName;
  document.querySelectorAll('[data-tab]').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });

  const lang = getLang();
  const titles = translations[lang] ? translations[lang].tabTitles : translations.en.tabTitles;

  const titleEl = getTabTitle();
  const subEl = getTabSubtitle();
  if (titles[tabName] && titleEl && subEl) {
    titleEl.textContent = titles[tabName].title;
    subEl.textContent = titles[tabName].sub;
  }

  renderView(tabName);
}

function setupGlobalEvents() {
  getEl('langToggleBtn')?.addEventListener('click', () => window.toggleLanguage());
  getEl('btnQuickBatch')?.addEventListener('click', () => openNewLotModal());
  getEl('btnExportData')?.addEventListener('click', () => exportDataJSON());
  
  const mClose = getEl('modalClose');
  const mBackdrop = getModalBackdrop();

  mClose?.addEventListener('click', closeModal);
  mBackdrop?.addEventListener('click', (e) => {
    if (e.target === mBackdrop) closeModal();
  });
}

function renderView(tab) {
  const container = getViewContainer();
  if (!container) return;

  try {
    switch (tab) {
      case 'dashboard': renderDashboard(container); break;
      case 'lots': renderLotsView(container); break;
      case 'rates': renderRatesView(container); break;
      case 'clients': renderClientsView(container); break;
      case 'workers': renderWorkersView(container); break;
      case 'sales': renderSalesView(container); break;
      case 'expenses': renderExpensesView(container); break;
      case 'analytics': renderAnalyticsView(container); break;
      default: renderDashboard(container);
    }
  } catch (err) {
    console.error("Error rendering view:", err);
    container.innerHTML = `
      <div class="card-box" style="border: 2px solid var(--color-danger); padding:2rem;">
        <h3 style="color:var(--color-danger); margin-bottom:0.5rem;">Rendering Error Encountered</h3>
        <p style="color:var(--text-muted); margin-bottom:1rem;">An unexpected error occurred while displaying the <strong>${tab}</strong> view: <code>${err.message}</code></p>
        <button class="btn btn-primary btn-sm" onclick="window.resetAppDatabase()">Reset Database & Fix View</button>
      </div>
    `;
  }
}

// ==========================================
// 1. DASHBOARD VIEW
// ==========================================
function renderDashboard(container) {
  const target = container || getViewContainer();
  if (!target) return;

  const stats = store.getDashboardStats();
  const inProcessLots = store.getInProcessLots();
  const currency = store.data.traderInfo.currency;

  target.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Active Harvest Lots</span>
          <div class="kpi-icon primary">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
        </div>
        <div class="kpi-value">${stats.inProcessCount} Lots In Process</div>
        <div class="kpi-subtext">
          <span class="trend-up">${stats.totalHarvestedNuts.toLocaleString()} Total Nuts Harvested</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Gross Sales Revenue</span>
          <div class="kpi-icon accent">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
        <div class="kpi-value">${currency} ${stats.totalRevenue.toLocaleString()}</div>
        <div class="kpi-subtext">
          <span>Coconut: ${currency}${stats.coconutRevenue.toLocaleString()} | Husk: ${currency}${stats.huskRevenue.toLocaleString()}</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Outflows (Client + Labour)</span>
          <div class="kpi-icon info">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
        </div>
        <div class="kpi-value">${currency} ${(stats.totalClientPayouts + stats.totalLabourCost).toLocaleString()}</div>
        <div class="kpi-subtext">
          <span>Client Bills: ${currency}${stats.totalClientPayouts.toLocaleString()} | Labour: ${currency}${stats.totalLabourCost.toLocaleString()}</span>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-header">
          <span class="kpi-title">Net Trader Profit</span>
          <div class="kpi-icon primary">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
          </div>
        </div>
        <div class="kpi-value" style="color: var(--color-primary);">${currency} ${stats.netProfit.toLocaleString()}</div>
        <div class="kpi-subtext">
          <span class="trend-up">${currency}${stats.avgProfitPer1000Nuts} net per 1,000 nuts</span>
        </div>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="card-box">
        <div class="card-box-header">
          <h3>Active Farm Harvest Lots (In Process)</h3>
          <button class="btn btn-secondary btn-sm" onclick="window.switchTab('lots')">View Pipeline</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Harvest Lot ID</th>
                <th>Farm / Client</th>
                <th>Harvest Date</th>
                <th>Gross Count</th>
                <th>Bad Nut Estimate</th>
                <th>Stage</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${inProcessLots.length === 0 ? '<tr><td colspan="7" style="text-align:center; color:var(--text-muted);">No harvest lots in process. Click "+ New Farm Harvest Lot" to start.</td></tr>' : ''}
              ${inProcessLots.map(l => {
                const client = store.getClientById(l.clientId);
                return `
                  <tr>
                    <td class="mono"><strong>${l.lotNumber}</strong></td>
                    <td>${client ? client.name : 'Unknown'}<br><small style="color:var(--text-muted);">${client ? client.location : ''}</small></td>
                    <td>${l.harvestDate}</td>
                    <td class="mono">${l.grossHarvestCount.toLocaleString()}</td>
                    <td class="mono" style="color:var(--color-danger);">${l.badNutCount || 0}</td>
                    <td><span class="badge badge-dehusking">${l.processStage || 'In Process'}</span></td>
                    <td>
                      <div style="display:flex; gap:0.4rem;">
                        <button class="btn btn-primary btn-sm" onclick="window.openGenerateClientBillModal('${l.id}')">Generate Bill</button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card-box">
        <div class="card-box-header">
          <h3>Piece-Rate Labour Calculator</h3>
        </div>
        <div class="form-group">
          <label>Harvest Nut Count</label>
          <input type="number" id="quickNutCalcInput" class="form-control mono" value="5000" step="500" />
        </div>
        <div id="quickCalcResultBox" class="calc-summary-box"></div>
      </div>
    </div>
  `;

  const nutInput = getEl('quickNutCalcInput');
  if (nutInput) {
    const updateCalc = () => {
      const val = Number(nutInput.value) || 0;
      const res = store.calculateLabourBreakdown(val);
      const rates = store.getMarketRates().labourPieceRates;
      const targetCalcBox = getEl('quickCalcResultBox');
      if (targetCalcBox) {
        targetCalcBox.innerHTML = `
          <h4>Labour Breakdown for ${val.toLocaleString()} Nuts</h4>
          <div class="calc-summary-row"><span>Cutters (@ ₹${rates.cutterRatePer1000}/1k):</span><span class="mono">${currency} ${res.cutterCost.toLocaleString()}</span></div>
          <div class="calc-summary-row"><span>Pickers (@ ₹${rates.pickerRatePer1000}/1k):</span><span class="mono">${currency} ${res.pickerCost.toLocaleString()}</span></div>
          <div class="calc-summary-row"><span>Drivers (@ ₹${rates.driverRatePer1000}/1k):</span><span class="mono">${currency} ${res.driverCost.toLocaleString()}</span></div>
          <div class="calc-summary-row"><span>Dehuskers (@ ₹${rates.dehuskerRatePer1000}/1k):</span><span class="mono">${currency} ${res.dehuskerCost.toLocaleString()}</span></div>
          <div class="calc-summary-row total"><span>Total Labour Wage:</span><span class="mono">${currency} ${res.totalLabourWage.toLocaleString()}</span></div>
        `;
      }
    };
    nutInput.addEventListener('input', updateCalc);
    updateCalc();
  }
}

// ==========================================
// 2. FARM HARVEST LOTS VIEW
// ==========================================
function renderLotsView(container) {
  const target = container || getViewContainer();
  if (!target) return;

  const inProcess = store.getInProcessLots();
  const completed = store.getCompletedLots();
  const currency = store.data.traderInfo.currency;

  target.innerHTML = `
    <div class="card-box">
      <div class="card-box-header">
        <h3>1. Active Farm Harvest Lots (In Process)</h3>
        <button class="btn btn-primary btn-sm" onclick="window.openNewLotModal()">+ New Farm Harvest Lot</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Lot ID (Farm)</th>
              <th>Farm / Client</th>
              <th>Harvest Date</th>
              <th>Gross Count</th>
              <th>Bad Grade Nuts</th>
              <th>Accepted Yield</th>
              <th>Current Stage</th>
              <th>Workers Present</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${inProcess.length === 0 ? '<tr><td colspan="9" style="text-align:center; color:var(--text-muted);">No harvest lots currently in process.</td></tr>' : ''}
            ${inProcess.map(l => {
              const client = store.getClientById(l.clientId);
              const att = store.getAttendanceForLot(l.id);
              return `
                <tr>
                  <td class="mono"><strong>${l.lotNumber}</strong></td>
                  <td>${client ? client.name : 'N/A'}<br><small style="color:var(--text-muted);">${client ? client.location : ''}</small></td>
                  <td>${l.harvestDate}</td>
                  <td class="mono">${l.grossHarvestCount.toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-danger); font-weight:700;">${l.badNutCount || 0}</td>
                  <td class="mono">${(l.grossHarvestCount - (l.badNutCount || 0)).toLocaleString()}</td>
                  <td><span class="badge badge-dehusking">${l.processStage || 'Harvesting at Farm'}</span></td>
                  <td><span class="badge badge-role">${att.length} Workers</span></td>
                  <td>
                    <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                      <button class="btn btn-secondary btn-sm" onclick="window.updateStageModal('${l.id}')">Stage</button>
                      <button class="btn btn-primary btn-sm" onclick="window.openGenerateClientBillModal('${l.id}')">Receipt Bill</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card-box">
      <div class="card-box-header">
        <h3>2. Completed & Billed Farm Harvest Lots</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Lot ID</th>
              <th>Client Owner</th>
              <th>Harvest Date</th>
              <th>Gross Count</th>
              <th>Bad Nuts</th>
              <th>Accepted Count</th>
              <th>Client Bill Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${completed.map(l => {
              const client = store.getClientById(l.clientId);
              const bill = store.getBillByLotId(l.id);
              return `
                <tr>
                  <td class="mono"><strong>${l.lotNumber}</strong></td>
                  <td>${client ? client.name : 'N/A'}</td>
                  <td>${l.harvestDate}</td>
                  <td class="mono">${l.grossHarvestCount.toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-danger);">${bill ? bill.badNutCount : l.badNutCount}</td>
                  <td class="mono">${bill ? bill.acceptedCount.toLocaleString() : (l.grossHarvestCount - l.badNutCount).toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700;">
                    ${currency} ${bill ? bill.grossAmount.toLocaleString() : '-'}
                  </td>
                  <td><span class="badge badge-completed">Billed & Completed</span></td>
                  <td>
                    <button class="btn btn-primary btn-sm" onclick="window.printClientBill('${bill ? bill.id : ''}')">Print Invoice</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.openNewLotModal = function() {
  const clients = store.getClients();
  const workers = store.getWorkers();

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = "Create New Farm Harvest Lot";

  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newLotForm">
        <div class="form-group">
          <label>Select Farm Client Owner</label>
          <select id="lotClientId" class="form-control" required>
            ${clients.map(c => `<option value="${c.id}">${c.name} - ${c.location} (Agreed Rate: ₹${c.ratePer1000Nuts}/1k nuts)</option>`).join('')}
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Harvest Date</label>
            <input type="date" id="lotDate" class="form-control" value="${new Date().toISOString().slice(0,10)}" required />
          </div>
          <div class="form-group">
            <label>Gross Harvest Nut Count</label>
            <input type="number" id="lotGrossCount" class="form-control mono" placeholder="e.g. 7500" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Bad / Damaged Nut Count (Initial Estimate)</label>
            <input type="number" id="lotBadCount" class="form-control mono" value="0" />
          </div>
          <div class="form-group">
            <label>Initial Stage</label>
            <select id="lotStage" class="form-control">
              <option value="Harvesting at Farm" selected>1. Harvesting at Farm</option>
              <option value="In Transit to Yard">2. In Transit to Yard</option>
              <option value="Yard Dehusking">3. Yard Dehusking</option>
            </select>
          </div>
        </div>

        <div class="form-group" style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-top:1rem;">
          <label style="color:var(--color-primary); font-weight:700;">Mark Worker Attendance for this Lot</label>
          <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:0.5rem;">Check workers who came for tree climbing, picking, transport, or dehusking today.</p>
          <div style="max-height:160px; overflow-y:auto;">
            ${workers.map(w => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:0.3rem 0; border-bottom:1px solid var(--border-color);">
                <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer; font-weight:normal;">
                  <input type="checkbox" name="lotWorkerAtt" value="${w.id}" style="width:16px; height:16px;" />
                  <span>${w.name} (${w.role.toUpperCase()})</span>
                </label>
                <span class="mono" style="font-size:0.75rem; color:var(--text-muted);">Rate: ₹${w.wageRatePer1000}/1k</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-top:1rem;">
          <label>Lot Remarks / Notes</label>
          <input type="text" id="lotNotes" class="form-control" placeholder="e.g. Tree climbing completed by 2 cutters" />
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Farm Harvest Lot</button>
        </div>
      </form>
    `;

    getEl('newLotForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const checkedWorkers = Array.from(document.querySelectorAll('input[name="lotWorkerAtt"]:checked')).map(cb => cb.value);

      store.addHarvestLot({
        clientId: getEl('lotClientId').value,
        harvestDate: getEl('lotDate').value,
        grossHarvestCount: Number(getEl('lotGrossCount').value),
        badNutCount: Number(getEl('lotBadCount').value) || 0,
        processStage: getEl('lotStage').value,
        notes: getEl('lotNotes').value
      }, checkedWorkers);

      closeModal();
      renderView(currentTab);
    });
  }

  openModal();
};

window.updateStageModal = function(lotId) {
  const lot = store.getLotById(lotId);
  if (!lot) return;

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();

  if (titleEl) titleEl.textContent = `Update Stage for ${lot.lotNumber}`;
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="updateStageForm">
        <div class="form-group">
          <label>Current Processing Stage</label>
          <select id="stageSelect" class="form-control">
            <option value="Harvesting at Farm" ${lot.processStage === 'Harvesting at Farm' ? 'selected' : ''}>1. Harvesting at Farm</option>
            <option value="In Transit to Yard" ${lot.processStage === 'In Transit to Yard' ? 'selected' : ''}>2. In Transit to Yard</option>
            <option value="Yard Dehusking" ${lot.processStage === 'Yard Dehusking' ? 'selected' : ''}>3. Yard Dehusking</option>
            <option value="Sorting & Grading" ${lot.processStage === 'Sorting & Grading' ? 'selected' : ''}>4. Sorting & Grading</option>
            <option value="Ready for Billing" ${lot.processStage === 'Ready for Billing' ? 'selected' : ''}>5. Ready for Billing</option>
          </select>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Update Gross Harvest Count</label>
            <input type="number" id="stageGross" class="form-control mono" value="${lot.grossHarvestCount}" />
          </div>
          <div class="form-group">
            <label>Update Bad / Damaged Nut Count</label>
            <input type="number" id="stageBad" class="form-control mono" value="${lot.badNutCount || 0}" />
          </div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Stage Update</button>
        </div>
      </form>
    `;

    getEl('updateStageForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      lot.processStage = getEl('stageSelect').value;
      lot.grossHarvestCount = Number(getEl('stageGross').value);
      lot.badNutCount = Number(getEl('stageBad').value);
      lot.acceptedNutCount = lot.grossHarvestCount - lot.badNutCount;
      store.saveData();
      closeModal();
      renderView(currentTab);
    });
  }

  openModal();
};

// ==========================================
// 3. MARKET RATES & CONFIG VIEW
// ==========================================
function renderRatesView(container) {
  const target = container || getViewContainer();
  if (!target) return;

  const rates = store.getMarketRates();
  const currency = store.data.traderInfo.currency;

  target.innerHTML = `
    <div class="card-box">
      <div class="card-box-header">
        <h3>1. Dehusked Coconut Selling Market Rates</h3>
        <span class="badge badge-completed">Live Active Rates</span>
      </div>
      <form id="coconutRatesForm">
        <div class="form-row">
          <div class="form-group">
            <label>Grade A Large Price per Nut (${currency})</label>
            <input type="number" step="0.50" id="rateGradeA" class="form-control mono" value="${rates.coconuts.gradeA}" required />
          </div>
          <div class="form-group">
            <label>Grade B Medium Price per Nut (${currency})</label>
            <input type="number" step="0.50" id="rateGradeB" class="form-control mono" value="${rates.coconuts.gradeB}" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Grade C Small Price per Nut (${currency})</label>
            <input type="number" step="0.50" id="rateGradeC" class="form-control mono" value="${rates.coconuts.gradeC}" required />
          </div>
          <div class="form-group">
            <label>Water Nut / Rejects Price per Nut (${currency})</label>
            <input type="number" step="0.50" id="rateRejects" class="form-control mono" value="${rates.coconuts.rejects}" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-sm">Save Coconut Market Rates</button>
      </form>
    </div>

    <div class="card-box">
      <div class="card-box-header">
        <h3>2. Coir Industry Husk Selling Rates</h3>
      </div>
      <form id="huskRatesForm">
        <div class="form-row">
          <div class="form-group">
            <label>Raw Husk Rate per 1,000 Husks (${currency})</label>
            <input type="number" id="rateRawHusk" class="form-control mono" value="${rates.husks.rawHuskPer1000}" required />
          </div>
          <div class="form-group">
            <label>Coir Fibre Mill Husk Rate per 1,000 Husks (${currency})</label>
            <input type="number" id="rateCoirMill" class="form-control mono" value="${rates.husks.coirMillHuskPer1000}" required />
          </div>
          <div class="form-group">
            <label>Coir Husk Rate per Ton (${currency})</label>
            <input type="number" id="rateHuskTon" class="form-control mono" value="${rates.husks.huskPerTon}" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-sm">Save Husk Selling Rates</button>
      </form>
    </div>

    <div class="card-box">
      <div class="card-box-header">
        <h3>3. Default Labour Piece-Rate Wage Structure</h3>
      </div>
      <form id="labourRatesForm">
        <div class="form-row">
          <div class="form-group">
            <label>Coconut Cutters (Climbers) Rate / 1,000 Nuts (${currency})</label>
            <input type="number" id="rateCutter" class="form-control mono" value="${rates.labourPieceRates.cutterRatePer1000}" required />
          </div>
          <div class="form-group">
            <label>Coconut Pickers (Gatherers) Rate / 1,000 Nuts (${currency})</label>
            <input type="number" id="ratePicker" class="form-control mono" value="${rates.labourPieceRates.pickerRatePer1000}" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Transport Drivers Rate / 1,000 Nuts (${currency})</label>
            <input type="number" id="rateDriver" class="form-control mono" value="${rates.labourPieceRates.driverRatePer1000}" required />
          </div>
          <div class="form-group">
            <label>Yard Dehuskers Rate / 1,000 Nuts (${currency})</label>
            <input type="number" id="rateDehusker" class="form-control mono" value="${rates.labourPieceRates.dehuskerRatePer1000}" required />
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-sm">Save Labour Piece-Rates</button>
      </form>
    </div>
  `;

  getEl('coconutRatesForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const current = store.getMarketRates();
    current.coconuts = {
      gradeA: Number(getEl('rateGradeA').value),
      gradeB: Number(getEl('rateGradeB').value),
      gradeC: Number(getEl('rateGradeC').value),
      rejects: Number(getEl('rateRejects').value)
    };
    store.updateMarketRates(current);
    alert('Coconut Selling Market Rates updated!');
  });

  getEl('huskRatesForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const current = store.getMarketRates();
    current.husks = {
      rawHuskPer1000: Number(getEl('rateRawHusk').value),
      coirMillHuskPer1000: Number(getEl('rateCoirMill').value),
      huskPerTon: Number(getEl('rateHuskTon').value)
    };
    store.updateMarketRates(current);
    alert('Husk Selling Rates updated!');
  });

  getEl('labourRatesForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const current = store.getMarketRates();
    current.labourPieceRates = {
      cutterRatePer1000: Number(getEl('rateCutter').value),
      pickerRatePer1000: Number(getEl('ratePicker').value),
      driverRatePer1000: Number(getEl('rateDriver').value),
      dehuskerRatePer1000: Number(getEl('rateDehusker').value)
    };
    store.updateMarketRates(current);
    alert('Labour Piece-Rate Wage Structure updated!');
  });
}

// ==========================================
// 4. CLIENTS & CONTRACT ADVANCE LEDGER VIEW
// ==========================================
function renderClientsView(container) {
  const target = container || getViewContainer();
  if (!target) return;

  const clients = store.getClients();
  const bills = store.getClientBills();
  const currency = store.data.traderInfo.currency;

  target.innerHTML = `
    <div class="card-box">
      <div class="card-box-header">
        <h3>Client Farm Owners & Contract Security Advances</h3>
        <button class="btn btn-primary btn-sm" onclick="window.openNewClientModal()">+ Register Client Farm</button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Client Owner</th>
              <th>Phone</th>
              <th>Farm Location</th>
              <th>Trees</th>
              <th>Contract Rate / 1k</th>
              <th>Contract Advance Paid</th>
              <th>Remaining Advance Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${clients.map(c => `
              <tr>
                <td><strong>${c.name}</strong></td>
                <td>${c.phone}</td>
                <td>${c.location}</td>
                <td class="mono">${c.treeCount} trees</td>
                <td class="mono">${currency} ${c.ratePer1000Nuts.toLocaleString()}</td>
                <td class="mono" style="color:var(--color-accent); font-weight:700;">${currency} ${(c.contractAdvance || 0).toLocaleString()}</td>
                <td class="mono" style="color:var(--color-primary); font-weight:700;">${currency} ${(c.advanceBalance || 0).toLocaleString()}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="window.openReturnClientAdvanceModal('${c.id}')">Return Advance on Exit</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card-box">
      <div class="card-box-header">
        <h3>Client Settlement Invoices</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Bill Date</th>
              <th>Client Owner</th>
              <th>Gross Nuts</th>
              <th>Bad Grade Nuts</th>
              <th>Accepted Count</th>
              <th>Gross Amount</th>
              <th>Advance Deducted</th>
              <th>Net Amount Payable</th>
              <th>Print</th>
            </tr>
          </thead>
          <tbody>
            ${bills.length === 0 ? '<tr><td colspan="10" style="text-align:center; color:var(--text-muted);">No client bills generated yet. Go to Farm Harvest Lots and click "Receipt Bill".</td></tr>' : ''}
            ${bills.map(b => {
              const client = store.getClientById(b.clientId);
              return `
                <tr>
                  <td class="mono"><strong>${b.billNumber}</strong></td>
                  <td>${b.billDate}</td>
                  <td>${client ? client.name : 'N/A'}</td>
                  <td class="mono">${b.grossCount.toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-danger); font-weight:700;">${b.badNutCount || 0}</td>
                  <td class="mono">${b.acceptedCount.toLocaleString()}</td>
                  <td class="mono">${currency} ${b.grossAmount.toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-accent);">${currency} ${(b.advanceDeduction || 0).toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700;">${currency} ${b.netPayable.toLocaleString()}</td>
                  <td>
                    <button class="btn btn-primary btn-sm" onclick="window.printClientBill('${b.id}')">Invoice</button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.openNewClientModal = function() {
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();

  if (titleEl) titleEl.textContent = "Register Client Farm Owner";
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newClientForm">
        <div class="form-group">
          <label>Client Full Name</label>
          <input type="text" id="cliName" class="form-control" placeholder="e.g. Shanmugasundaram" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="cliPhone" class="form-control" placeholder="+91 98765 00000" required />
          </div>
          <div class="form-group">
            <label>Tree Count (Approx)</label>
            <input type="number" id="cliTrees" class="form-control mono" placeholder="500" />
          </div>
        </div>

        <div class="form-group">
          <label>Farm Location / Village</label>
          <input type="text" id="cliLocation" class="form-control" placeholder="e.g. Vettaikaranpudur" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Contract Rate per 1,000 Nuts (₹)</label>
            <input type="number" id="cliRate" class="form-control mono" value="12500" required />
          </div>
          <div class="form-group">
            <label>Contract Security Advance Paid (₹)</label>
            <input type="number" id="cliAdvance" class="form-control mono" value="15000" />
          </div>
        </div>

        <div class="form-group">
          <label>Notes / Contract Terms</label>
          <input type="text" id="cliNotes" class="form-control" placeholder="e.g. Harvest cycle every 45 days" />
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Client</button>
        </div>
      </form>
    `;

    getEl('newClientForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.addClient({
        name: getEl('cliName').value,
        phone: getEl('cliPhone').value,
        location: getEl('cliLocation').value,
        treeCount: Number(getEl('cliTrees').value) || 0,
        ratePer1000Nuts: Number(getEl('cliRate').value),
        contractAdvance: Number(getEl('cliAdvance').value) || 0,
        notes: getEl('cliNotes').value
      });
      closeModal();
      renderView(currentTab);
    });
  }

  openModal();
};

window.openReturnClientAdvanceModal = function(clientId) {
  const client = store.getClientById(clientId);
  if (!client) return;

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();

  if (titleEl) titleEl.textContent = `Return Client Contract Advance: ${client.name}`;
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="returnClientAdvForm">
        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
          <p>Current Remaining Advance Balance: <strong class="mono" style="color:var(--color-accent);">₹ ${(client.advanceBalance || 0).toLocaleString()}</strong></p>
        </div>

        <div class="form-group">
          <label>Advance Amount Returned / Refunded (₹)</label>
          <input type="number" id="retCliAmount" class="form-control mono" value="${client.advanceBalance || 0}" required />
        </div>

        <div class="form-group">
          <label>Reason / Notes</label>
          <input type="text" id="retCliNotes" class="form-control" placeholder="e.g. Client contract ended, advance balance refunded" required />
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Confirm Advance Refund</button>
        </div>
      </form>
    `;

    getEl('returnClientAdvForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = Number(getEl('retCliAmount').value);
      const notes = getEl('retCliNotes').value;
      store.returnClientAdvance(clientId, amount, notes);
      closeModal();
      alert(`₹ ${amount.toLocaleString()} advance refund logged for ${client.name}`);
      renderView(currentTab);
    });
  }

  openModal();
};

// ==========================================
// 5. LABOUR PAYROLL & ADVANCES LEDGER VIEW
// ==========================================
function renderWorkersView(container) {
  const target = container || getViewContainer();
  if (!target) return;

  const workers = store.getWorkers();
  const currency = store.data.traderInfo.currency;

  const saturdayWorkers = workers.filter(w => w.role !== 'dehusker');
  const dehuskerWorkers = workers.filter(w => w.role === 'dehusker');

  target.innerHTML = `
    <div class="card-box">
      <div class="card-box-header">
        <h3>1. Weekly Saturday Payroll Settlement (Cutters, Pickers, Drivers)</h3>
        <span class="badge badge-completed">Settlement Every Saturday</span>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Worker Name</th>
              <th>Role Category</th>
              <th>Piece Rate / 1,000 Nuts</th>
              <th>Joining Advance Paid</th>
              <th>Remaining Advance Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${saturdayWorkers.map(w => `
              <tr>
                <td><strong>${w.name}</strong></td>
                <td><span class="badge badge-role">${w.role.toUpperCase()}</span></td>
                <td class="mono" style="color:var(--color-primary); font-weight:700;">${currency} ${w.wageRatePer1000.toLocaleString()}</td>
                <td class="mono" style="color:var(--color-accent);">${currency} ${(w.contractAdvance || 0).toLocaleString()}</td>
                <td class="mono" style="color:var(--color-primary); font-weight:700;">${currency} ${(w.advanceBalance || 0).toLocaleString()}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="window.openReturnWorkerAdvanceModal('${w.id}')">Return Advance on Exit</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card-box">
      <div class="card-box-header">
        <h3>2. Job-Based Yard Dehusker Settlement (Dehusking Jobs)</h3>
        <span class="badge badge-dehusking">Job-Based Settlement</span>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Dehusker Worker</th>
              <th>Role</th>
              <th>Rate / 1,000 Dehusked</th>
              <th>Joining Advance Paid</th>
              <th>Remaining Advance Balance</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${dehuskerWorkers.map(w => `
              <tr>
                <td><strong>${w.name}</strong></td>
                <td><span class="badge badge-role">${w.role.toUpperCase()}</span></td>
                <td class="mono" style="color:var(--color-primary); font-weight:700;">${currency} ${w.wageRatePer1000.toLocaleString()}</td>
                <td class="mono" style="color:var(--color-accent);">${currency} ${(w.contractAdvance || 0).toLocaleString()}</td>
                <td class="mono" style="color:var(--color-primary); font-weight:700;">${currency} ${(w.advanceBalance || 0).toLocaleString()}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="window.openReturnWorkerAdvanceModal('${w.id}')">Return Advance on Exit</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div style="margin-top:1rem;">
      <button class="btn btn-primary" onclick="window.openNewWorkerModal()">+ Register New Worker with Advance</button>
    </div>
  `;
}

window.openNewWorkerModal = function() {
  const rates = store.getMarketRates().labourPieceRates;
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();

  if (titleEl) titleEl.textContent = "Register Worker & Joining Contract Advance";
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newWorkerForm">
        <div class="form-group">
          <label>Worker Full Name</label>
          <input type="text" id="wrkName" class="form-control" placeholder="e.g. Muthusamy" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Role Category</label>
            <select id="wrkRole" class="form-control" required>
              <option value="cutter">Coconut Cutter (Weekly Saturday Pay)</option>
              <option value="picker">Coconut Picker (Weekly Saturday Pay)</option>
              <option value="driver">Transport Driver (Weekly Saturday Pay)</option>
              <option value="dehusker">Yard Dehusker (Job-Based Pay)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="wrkPhone" class="form-control" placeholder="+91 91234 56789" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Piece-Rate per 1,000 Nuts (₹)</label>
            <input type="number" id="wrkRate" class="form-control mono" value="${rates.cutterRatePer1000}" required />
          </div>
          <div class="form-group">
            <label>Joining Contract Advance Security (₹)</label>
            <input type="number" id="wrkAdvance" class="form-control mono" value="5000" />
          </div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Worker</button>
        </div>
      </form>
    `;

    getEl('newWorkerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = getEl('wrkRole').value;
      store.addWorker({
        name: getEl('wrkName').value,
        role: role,
        settlementType: role === 'dehusker' ? 'job_based' : 'weekly_saturday',
        phone: getEl('wrkPhone').value,
        wageRatePer1000: Number(getEl('wrkRate').value),
        contractAdvance: Number(getEl('wrkAdvance').value) || 0,
        status: 'active'
      });
      closeModal();
      renderView(currentTab);
    });
  }

  openModal();
};

window.openReturnWorkerAdvanceModal = function(workerId) {
  const worker = store.getWorkerById(workerId);
  if (!worker) return;

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();

  if (titleEl) titleEl.textContent = `Worker Exit: Return Advance from ${worker.name}`;
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="returnWorkerAdvForm">
        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
          <p>Worker Role: <strong>${worker.role.toUpperCase()}</strong></p>
          <p>Current Remaining Advance Balance: <strong class="mono" style="color:var(--color-primary);">₹ ${(worker.advanceBalance || 0).toLocaleString()}</strong></p>
        </div>

        <div class="form-group">
          <label>Advance Amount Returned by Worker on Exit (₹)</label>
          <input type="number" id="retWrkAmount" class="form-control mono" value="${worker.advanceBalance || 0}" required />
        </div>

        <div class="form-group">
          <label>Exit Notes / Remarks</label>
          <input type="text" id="retWrkNotes" class="form-control" placeholder="e.g. Worker leaving job, advance returned in full" required />
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Confirm Worker Advance Return</button>
        </div>
      </form>
    `;

    getEl('returnWorkerAdvForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = Number(getEl('retWrkAmount').value);
      const notes = getEl('retWrkNotes').value;
      store.returnWorkerAdvance(workerId, amount, notes);
      closeModal();
      alert(`₹ ${amount.toLocaleString()} advance return logged for ${worker.name}`);
      renderView(currentTab);
    });
  }

  openModal();
};

// ==========================================
// 6. SALES & MULTI-FARM ORDERS LEDGER VIEW
// ==========================================
function renderSalesView(container) {
  const target = container || getViewContainer();
  if (!target) return;

  const sales = store.getSales();
  const currency = store.data.traderInfo.currency;

  const coconutSales = sales.filter(s => s.type === 'coconut');
  const huskSales = sales.filter(s => s.type === 'husk');

  target.innerHTML = `
    <div style="margin-bottom:1.5rem; display:flex; gap:1rem;">
      <button class="btn btn-primary" onclick="window.openNewCoconutSaleModal()">+ Log Dehusked Coconut Sale (Multi-Farm Order)</button>
      <button class="btn btn-secondary" onclick="window.openNewHuskSaleModal()">+ Log Coir Husk Sale to Mill (Multi-Farm Order)</button>
    </div>

    <div class="card-box">
      <div class="card-box-header">
        <h3>1. Dehusked Coconut Order Deliveries</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Buyer Name</th>
              <th>Associated Harvest Lots</th>
              <th>Grade</th>
              <th>Quantity (Nuts)</th>
              <th>Unit Price / Nut</th>
              <th>Total Delivery Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${coconutSales.map(s => {
              const lotNumbers = (s.lotIds || []).map(id => store.getLotById(id)?.lotNumber || id).join(', ');
              return `
                <tr>
                  <td>${s.date}</td>
                  <td><strong>${s.buyerName}</strong></td>
                  <td class="mono"><small style="color:var(--color-primary);">${lotNumbers || 'General'}</small></td>
                  <td>${s.coconutGrade}</td>
                  <td class="mono">${s.quantity.toLocaleString()}</td>
                  <td class="mono">${currency} ${s.unitPrice.toFixed(2)}</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700;">${currency} ${s.totalRevenue.toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card-box">
      <div class="card-box-header">
        <h3>2. Coir Industry Husk Deliveries</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Coir Mill / Factory</th>
              <th>Associated Harvest Lots</th>
              <th>Husk Volume</th>
              <th>Price per 1,000 Husks</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${huskSales.map(s => {
              const lotNumbers = (s.lotIds || []).map(id => store.getLotById(id)?.lotNumber || id).join(', ');
              return `
                <tr>
                  <td>${s.date}</td>
                  <td><strong>${s.coirMillName}</strong></td>
                  <td class="mono"><small style="color:var(--color-accent);">${lotNumbers || 'General'}</small></td>
                  <td class="mono">${s.huskQuantity.toLocaleString()} husks</td>
                  <td class="mono">${currency} ${s.unitPricePer1000.toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-accent); font-weight:700;">${currency} ${s.totalRevenue.toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.openNewCoconutSaleModal = function() {
  const lots = store.getLots();
  const rates = store.getMarketRates().coconuts;
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();

  if (titleEl) titleEl.textContent = "Log Coconut Sale Delivery (Combine Multiple Farm Lots)";
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newCoconutSaleForm">
        <div class="form-group">
          <label>Select Associated Farm Harvest Lots (Multi-Select Combined Delivery)</label>
          <div style="max-height:140px; overflow-y:auto; background:var(--bg-card-hover); padding:0.75rem; border-radius:var(--radius-md);">
            ${lots.map(l => `
              <label style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem; cursor:pointer;">
                <input type="checkbox" name="saleLotCheck" value="${l.id}" style="width:16px; height:16px;" />
                <span><strong>${l.lotNumber}</strong> (${l.grossHarvestCount} nuts)</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Delivery Sale Date</label>
            <input type="date" id="saleDate" class="form-control" value="${new Date().toISOString().slice(0,10)}" required />
          </div>
          <div class="form-group">
            <label>Buyer Name / Wholesaler</label>
            <input type="text" id="saleBuyer" class="form-control" placeholder="e.g. Vignesh Traders" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Coconut Grade</label>
            <select id="saleGrade" class="form-control">
              <option value="Grade A Large">Grade A Large (Rate: ₹${rates.gradeA})</option>
              <option value="Grade B Medium">Grade B Medium (Rate: ₹${rates.gradeB})</option>
              <option value="Grade C Small">Grade C Small (Rate: ₹${rates.gradeC})</option>
              <option value="Water Nut / Rejects">Water Nut / Rejects (Rate: ₹${rates.rejects})</option>
            </select>
          </div>
          <div class="form-group">
            <label>Quantity (Nuts Sold)</label>
            <input type="number" id="saleQty" class="form-control mono" placeholder="5000" required />
          </div>
        </div>

        <div class="form-group">
          <label>Selling Price per Nut (₹)</label>
          <input type="number" step="0.50" id="salePrice" class="form-control mono" value="${rates.gradeA}" required />
        </div>

        <div class="calc-summary-box">
          <div class="calc-summary-row total">
            <span>Total Delivery Revenue:</span>
            <span id="saleTotalText" class="mono">₹0</span>
          </div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Delivery Sale</button>
        </div>
      </form>
    `;

    const qty = getEl('saleQty');
    const price = getEl('salePrice');
    const totalText = getEl('saleTotalText');

    const updateVal = () => {
      const q = Number(qty.value) || 0;
      const p = Number(price.value) || 0;
      if (totalText) totalText.textContent = `₹ ${(q * p).toLocaleString()}`;
    };
    qty?.addEventListener('input', updateVal);
    price?.addEventListener('input', updateVal);

    getEl('newCoconutSaleForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const checkedLots = Array.from(document.querySelectorAll('input[name="saleLotCheck"]:checked')).map(cb => cb.value);
      const q = Number(qty.value);
      const p = Number(price.value);

      store.addSale({
        lotIds: checkedLots,
        date: getEl('saleDate').value,
        type: 'coconut',
        buyerName: getEl('saleBuyer').value,
        coconutGrade: getEl('saleGrade').value,
        quantity: q,
        unitPrice: p,
        totalRevenue: q * p,
        paymentStatus: 'paid'
      });

      closeModal();
      renderView(currentTab);
    });
  }

  openModal();
};

window.openNewHuskSaleModal = function() {
  const lots = store.getLots();
  const rates = store.getMarketRates().husks;
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();

  if (titleEl) titleEl.textContent = "Log Coir Husk Sale (Combine Multiple Farm Lots)";
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newHuskSaleForm">
        <div class="form-group">
          <label>Select Associated Farm Harvest Lots</label>
          <div style="max-height:140px; overflow-y:auto; background:var(--bg-card-hover); padding:0.75rem; border-radius:var(--radius-md);">
            ${lots.map(l => `
              <label style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.4rem; cursor:pointer;">
                <input type="checkbox" name="huskLotCheck" value="${l.id}" style="width:16px; height:16px;" />
                <span><strong>${l.lotNumber}</strong> (${l.grossHarvestCount} husks)</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Delivery Sale Date</label>
            <input type="date" id="huskDate" class="form-control" value="${new Date().toISOString().slice(0,10)}" required />
          </div>
          <div class="form-group">
            <label>Coir Mill Factory Name</label>
            <input type="text" id="huskMill" class="form-control" placeholder="e.g. Sri Lakshmi Coir Mill" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Husk Count (Volume)</label>
            <input type="number" id="huskQty" class="form-control mono" placeholder="6000" required />
          </div>
          <div class="form-group">
            <label>Price per 1,000 Husks (₹)</label>
            <input type="number" id="huskRate1k" class="form-control mono" value="${rates.rawHuskPer1000}" required />
          </div>
        </div>

        <div class="calc-summary-box">
          <div class="calc-summary-row total">
            <span>Total Husk Sale Revenue:</span>
            <span id="huskTotalText" class="mono">₹0</span>
          </div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Husk Sale</button>
        </div>
      </form>
    `;

    const qty = getEl('huskQty');
    const rate = getEl('huskRate1k');
    const totalText = getEl('huskTotalText');

    const updateVal = () => {
      const q = Number(qty.value) || 0;
      const r = Number(rate.value) || 0;
      if (totalText) totalText.textContent = `₹ ${((q / 1000) * r).toLocaleString()}`;
    };
    qty?.addEventListener('input', updateVal);
    rate?.addEventListener('input', updateVal);

    getEl('newHuskSaleForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const checkedLots = Array.from(document.querySelectorAll('input[name="huskLotCheck"]:checked')).map(cb => cb.value);
      const q = Number(qty.value);
      const r = Number(rate.value);

      store.addSale({
        lotIds: checkedLots,
        date: getEl('huskDate').value,
        type: 'husk',
        coirMillName: getEl('huskMill').value,
        huskQuantity: q,
        unitPricePer1000: r,
        totalRevenue: (q / 1000) * r,
        paymentStatus: 'paid'
      });

      closeModal();
      renderView(currentTab);
    });
  }

  openModal();
};

// ==========================================
// 7. EXPENSES & BATA LEDGER VIEW
// ==========================================
function renderExpensesView(container) {
  const target = container || getViewContainer();
  if (!target) return;

  const expenses = store.getExpenses();
  const currency = store.data.traderInfo.currency;

  target.innerHTML = `
    <div class="card-box">
      <div class="card-box-header">
        <h3>Operational Expenses & Worker Bata Ledger</h3>
        <button class="btn btn-primary btn-sm" onclick="window.openNewExpenseModal()">+ Add Expense / Bata</button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Associated Harvest Lot</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Notes / Remarks</th>
            </tr>
          </thead>
          <tbody>
            ${expenses.map(e => {
              const lot = store.getLotById(e.lotId);
              return `
                <tr>
                  <td>${e.date}</td>
                  <td><strong>${e.category}</strong></td>
                  <td class="mono">${lot ? lot.lotNumber : 'General Overhead'}</td>
                  <td class="mono" style="color:var(--color-danger); font-weight:700;">${currency} ${e.amount.toLocaleString()}</td>
                  <td><span class="badge badge-role">${e.paymentMethod}</span></td>
                  <td><small style="color:var(--text-muted);">${e.notes || '-'}</small></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

window.openNewExpenseModal = function() {
  const lots = store.getLots();
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();

  if (titleEl) titleEl.textContent = "Log Operational Expense / Worker Bata";
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newExpenseForm">
        <div class="form-row">
          <div class="form-group">
            <label>Expense Date</label>
            <input type="date" id="expDate" class="form-control" value="${new Date().toISOString().slice(0,10)}" required />
          </div>
          <div class="form-group">
            <label>Expense Category</label>
            <select id="expCategory" class="form-control" required>
              <option value="Meals & Worker Bata" selected>Meals & Worker Tea Bata</option>
              <option value="Fuel & Transport">Fuel & Transport Diesel</option>
              <option value="Yard Rent & Maintenance">Yard Rent & Maintenance</option>
              <option value="Equipment & Tools">Equipment & Dehusker Maintenance</option>
              <option value="Miscellaneous">Miscellaneous Overhead</option>
            </select>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Associated Harvest Lot (Optional)</label>
            <select id="expLotId" class="form-control">
              <option value="">-- General Overhead --</option>
              ${lots.map(l => `<option value="${l.id}">${l.lotNumber}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Amount (₹)</label>
            <input type="number" id="expAmount" class="form-control mono" placeholder="1500" required />
          </div>
        </div>

        <div class="form-group">
          <label>Payment Method</label>
          <select id="expMethod" class="form-control">
            <option value="Cash">Cash</option>
            <option value="UPI">UPI / Google Pay</option>
          </select>
        </div>

        <div class="form-group">
          <label>Notes / Description</label>
          <input type="text" id="expNotes" class="form-control" placeholder="e.g. Daily tea bata for 4 workers" />
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Expense</button>
        </div>
      </form>
    `;

    getEl('newExpenseForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.addExpense({
        date: getEl('expDate').value,
        category: getEl('expCategory').value,
        lotId: getEl('expLotId').value,
        amount: Number(getEl('expAmount').value),
        paymentMethod: getEl('expMethod').value,
        notes: getEl('expNotes').value
      });
      closeModal();
      renderView(currentTab);
    });
  }

  openModal();
};

// ==========================================
// 8. CLIENT BILL GENERATOR & PRINT INVOICE
// ==========================================
window.openGenerateClientBillModal = function(lotId) {
  const lot = store.getLotById(lotId);
  if (!lot) return;
  const client = store.getClientById(lot.clientId);
  const currency = store.data.traderInfo.currency;

  const defaultRate = client ? client.ratePer1000Nuts : 12500;
  const defaultAdvanceDeduct = client ? Math.min(client.advanceBalance || 0, 15000) : 0;

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();

  if (titleEl) titleEl.textContent = `Generate Client Bill: ${lot.lotNumber}`;
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="generateClientBillForm">
        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
          <h4>Client: ${client ? client.name : 'Farm Owner'} (${client ? client.location : ''})</h4>
          <p style="font-size:0.85rem; color:var(--text-muted);">Harvest Date: ${lot.harvestDate} | Current Advance Balance: ₹ ${(client ? client.advanceBalance : 0).toLocaleString()}</p>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Gross Harvest Nut Count</label>
            <input type="number" id="billGrossCount" class="form-control mono" value="${lot.grossHarvestCount}" required />
          </div>
          <div class="form-group">
            <label style="color:var(--color-danger); font-weight:700;">Bad Grade / Damaged Nut Count</label>
            <input type="number" id="billBadCount" class="form-control mono" value="${lot.badNutCount || 0}" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Accepted Billable Count (Gross - Bad)</label>
            <input type="number" id="billAcceptedCount" class="form-control mono" value="${lot.grossHarvestCount - (lot.badNutCount || 0)}" readonly style="opacity:0.8;" />
          </div>
          <div class="form-group">
            <label>Agreed Rate per 1,000 Nuts (₹)</label>
            <input type="number" id="billRate" class="form-control mono" value="${defaultRate}" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Contract Advance Deduction (₹)</label>
            <input type="number" id="billAdvance" class="form-control mono" value="${defaultAdvanceDeduct}" />
          </div>
          <div class="form-group">
            <label>Transport Deductions (₹)</label>
            <input type="number" id="billTransport" class="form-control mono" value="0" />
          </div>
        </div>

        <div class="form-group">
          <label>Bill Remarks / Notes</label>
          <input type="text" id="billNotes" class="form-control" placeholder="e.g. Settlement after sorting bad grade nuts" />
        </div>

        <div class="calc-summary-box" id="clientBillPreviewBox"></div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Generate & Print Client Bill</button>
        </div>
      </form>
    `;

    const grossInp = getEl('billGrossCount');
    const badInp = getEl('billBadCount');
    const accInp = getEl('billAcceptedCount');
    const rateInp = getEl('billRate');
    const advInp = getEl('billAdvance');
    const transInp = getEl('billTransport');
    const previewBox = getEl('clientBillPreviewBox');

    const updateCalc = () => {
      const gross = Number(grossInp.value) || 0;
      const bad = Number(badInp.value) || 0;
      const acc = Math.max(0, gross - bad);
      if (accInp) accInp.value = acc;

      const rate = Number(rateInp.value) || 0;
      const adv = Number(advInp.value) || 0;
      const trans = Number(transInp.value) || 0;

      const grossAmount = (acc / 1000) * rate;
      const netPayable = grossAmount - adv - trans;

      if (previewBox) {
        previewBox.innerHTML = `
          <h4>Client Settlement Calculation</h4>
          <div class="calc-summary-row"><span>Gross Harvest Count:</span><span class="mono">${gross.toLocaleString()} nuts</span></div>
          <div class="calc-summary-row" style="color:var(--color-danger);"><span>(-) Bad Grade / Damaged Nuts:</span><span class="mono">${bad.toLocaleString()} nuts</span></div>
          <div class="calc-summary-row" style="font-weight:700;"><span>Accepted Billable Count:</span><span class="mono">${acc.toLocaleString()} nuts</span></div>
          <div class="calc-summary-row"><span>Gross Amount (@ ₹${rate}/1k):</span><span class="mono">${currency} ${grossAmount.toLocaleString()}</span></div>
          <div class="calc-summary-row"><span>(-) Advance Deducted:</span><span class="mono">${currency} ${adv.toLocaleString()}</span></div>
          <div class="calc-summary-row total" style="color:var(--color-primary); font-size:1.1rem;">
            <span>NET PAYABLE TO CLIENT:</span>
            <span class="mono">${currency} ${netPayable.toLocaleString()}</span>
          </div>
        `;
      }
    };

    [grossInp, badInp, rateInp, advInp, transInp].forEach(inp => inp?.addEventListener('input', updateCalc));
    updateCalc();

    getEl('generateClientBillForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const gross = Number(grossInp.value);
      const bad = Number(badInp.value);
      const acc = Math.max(0, gross - bad);
      const rate = Number(rateInp.value);
      const adv = Number(advInp.value);
      const trans = Number(transInp.value);
      const grossAmount = (acc / 1000) * rate;
      const netPayable = grossAmount - adv - trans;

      const bill = store.saveClientBill({
        lotId: lotId,
        clientId: lot.clientId,
        billDate: new Date().toISOString().slice(0,10),
        grossCount: gross,
        badNutCount: bad,
        acceptedCount: acc,
        ratePer1000: rate,
        grossAmount: grossAmount,
        advanceDeduction: adv,
        transportDeduction: trans,
        bonusAmount: 0,
        netPayable: netPayable,
        notes: getEl('billNotes').value,
        status: 'billed'
      });

      closeModal();
      window.printClientBill(bill.id);
      renderView(currentTab);
    });
  }

  openModal();
};

window.printClientBill = function(billId) {
  const bill = store.getClientBills().find(b => b.id === billId) || store.getClientBills()[0];
  if (!bill) return;

  const client = store.getClientById(bill.clientId);
  const lot = store.getLotById(bill.lotId);
  const currency = store.data.traderInfo.currency;

  const printArea = getEl('printContainer');
  if (!printArea) return;

  printArea.innerHTML = `
    <div style="max-width:650px; margin:0 auto; padding:25px; font-family:Arial, sans-serif; color:#000; background:#fff;">
      <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:12px; margin-bottom:20px;">
        <h2 style="margin:0;">${store.data.traderInfo.name}</h2>
        <p style="margin:4px 0;">${store.data.traderInfo.location} | Phone: ${store.data.traderInfo.phone}</p>
        <h3 style="margin-top:10px; background:#f0f0f0; padding:6px; font-size:1.1rem;">FARM SETTLEMENT INVOICE BILL</h3>
      </div>

      <div style="display:flex; justify-content:space-between; margin-bottom:20px;">
        <div>
          <p><strong>Invoice No:</strong> ${bill.billNumber}</p>
          <p><strong>Date:</strong> ${bill.billDate}</p>
          <p><strong>Harvest Lot ID:</strong> ${lot ? lot.lotNumber : '-'}</p>
        </div>
        <div style="text-align:right;">
          <p><strong>Client Owner:</strong> ${client ? client.name : 'Unknown'}</p>
          <p><strong>Farm Location:</strong> ${client ? client.location : ''}</p>
          <p><strong>Phone:</strong> ${client ? client.phone : ''}</p>
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;" border="1" cellpadding="8">
        <thead>
          <tr style="background:#f5f5f5;">
            <th>Description</th>
            <th style="text-align:right;">Quantity</th>
            <th style="text-align:right;">Amount (${currency})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Gross Harvest Nut Count</td>
            <td style="text-align:right;">${bill.grossCount.toLocaleString()} nuts</td>
            <td style="text-align:right;">-</td>
          </tr>
          <tr style="color:#d9534f;">
            <td>(-) Bad Grade / Damaged Nut Count</td>
            <td style="text-align:right;">${(bill.badNutCount || 0).toLocaleString()} nuts</td>
            <td style="text-align:right;">-</td>
          </tr>
          <tr style="font-weight:bold;">
            <td>ACCEPTED BILLABLE NUT COUNT</td>
            <td style="text-align:right;">${bill.acceptedCount.toLocaleString()} nuts</td>
            <td style="text-align:right;">-</td>
          </tr>
          <tr>
            <td>Agreed Rate per 1,000 Nuts</td>
            <td style="text-align:right;">${currency} ${bill.ratePer1000.toLocaleString()}</td>
            <td style="text-align:right;">-</td>
          </tr>
          <tr style="font-weight:bold;">
            <td>GROSS BILL AMOUNT</td>
            <td style="text-align:right;">-</td>
            <td style="text-align:right;">${currency} ${bill.grossAmount.toLocaleString()}</td>
          </tr>
          <tr>
            <td>(-) Contract Advance Deducted</td>
            <td style="text-align:right;">-</td>
            <td style="text-align:right;">${currency} ${(bill.advanceDeduction || 0).toLocaleString()}</td>
          </tr>
          <tr style="background:#e6fffa; font-weight:bold; font-size:1.1rem;">
            <td>NET AMOUNT PAYABLE TO FARM OWNER</td>
            <td style="text-align:right;">-</td>
            <td style="text-align:right;">${currency} ${bill.netPayable.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div style="margin-top:50px; display:flex; justify-content:space-between;">
        <div>
          <p>___________________________</p>
          <p>Farm Owner Signature</p>
        </div>
        <div style="text-align:right;">
          <p>___________________________</p>
          <p>Authorized Trader Signature</p>
        </div>
      </div>
    </div>
  `;

  window.print();
};

// ==========================================
// 9. P&L ANALYTICS VIEW
// ==========================================
function renderAnalyticsView(container) {
  const target = container || getViewContainer();
  if (!target) return;

  const stats = store.getDashboardStats();
  const currency = store.data.traderInfo.currency;

  target.innerHTML = `
    <div class="card-box">
      <h3>Financial Profit & Loss Statement</h3>
      <p style="font-size:0.875rem; color:var(--text-muted); margin-bottom:1.5rem;">
        Aggregated revenues vs. cost outflows across all farm harvest lots.
      </p>

      <div class="dashboard-grid">
        <div class="calc-summary-box" style="background:rgba(16, 185, 129, 0.05); border-color:var(--color-primary);">
          <h4 style="color:var(--color-primary); font-size:1rem; margin-bottom:1rem;">INFLOWS (Gross Revenues)</h4>
          <div class="calc-summary-row"><span>1. Dehusked Coconut Sales:</span><span class="mono" style="font-weight:700;">${currency} ${stats.coconutRevenue.toLocaleString()}</span></div>
          <div class="calc-summary-row"><span>2. Coir Industry Husk Sales:</span><span class="mono" style="font-weight:700; color:var(--color-accent);">${currency} ${stats.huskRevenue.toLocaleString()}</span></div>
          <hr style="border-color:var(--border-color); margin:0.75rem 0;"/>
          <div class="calc-summary-row total" style="color:var(--color-primary); font-size:1.1rem;">
            <span>TOTAL GROSS REVENUE:</span><span class="mono">${currency} ${stats.totalRevenue.toLocaleString()}</span>
          </div>
        </div>

        <div class="calc-summary-box" style="background:rgba(239, 68, 68, 0.05); border-color:var(--color-danger);">
          <h4 style="color:var(--color-danger); font-size:1rem; margin-bottom:1rem;">OUTFLOWS (Operational Costs)</h4>
          <div class="calc-summary-row"><span>1. Client Farm Settlement Bills:</span><span class="mono">${currency} ${stats.totalClientPayouts.toLocaleString()}</span></div>
          <div class="calc-summary-row"><span>2. Labour Piece-Rate Wages:</span><span class="mono">${currency} ${stats.totalLabourCost.toLocaleString()}</span></div>
          <div class="calc-summary-row"><span>3. Transport, Fuel & Expenses:</span><span class="mono">${currency} ${stats.totalExpenses.toLocaleString()}</span></div>
          <hr style="border-color:var(--border-color); margin:0.75rem 0;"/>
          <div class="calc-summary-row total" style="color:var(--color-danger); font-size:1.1rem;">
            <span>TOTAL OPERATIONAL COSTS:</span><span class="mono">${currency} ${stats.totalCost.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div class="kpi-card" style="margin-top:1.5rem; background:linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(245, 158, 11, 0.1)); border:2px solid var(--color-primary);">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:1rem; font-weight:700; color:var(--text-main);">NET TRADER PROFIT (BOTTOM LINE)</span>
        </div>
        <div class="kpi-value" style="font-size:2.5rem; color:var(--color-primary);">
          ${currency} ${stats.netProfit.toLocaleString()}
        </div>
        <p style="font-size:0.875rem; color:var(--text-muted); margin-top:0.5rem;">
          Average Net Profit per 1,000 harvested coconuts: <strong>${currency} ${stats.avgProfitPer1000Nuts}</strong>.
        </p>
      </div>
    </div>
  `;
}

// Helpers
function exportDataJSON() {
  const jsonStr = JSON.stringify(store.data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cocotrader_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function openModal() {
  const mb = getModalBackdrop();
  if (mb) mb.classList.remove('hidden');
}

function closeModal() {
  const mb = getModalBackdrop();
  if (mb) mb.classList.add('hidden');
}
