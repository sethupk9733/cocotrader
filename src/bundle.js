/**
 * CocoTrader PRO - Single Bundle script
 * Simplified Farm History, Detailed Make Bill Form & Team Nut Sharing Engine
 */

// ==========================================
// 1. STATE & DATA STORE
// ==========================================
const STORAGE_KEY = 'cocotrader_pro_db_v4';

const defaultSeedData = {
  traderInfo: {
    name: "GreenField Coconut Traders",
    traderName: "Sethu (Trader Manager)",
    phone: "+91 98765 43210",
    location: "Pollachi / Coimbatore Belt",
    currency: "₹"
  },
  marketRates: {
    coconuts: {
      gradeA: 25.00,
      gradeB: 21.00,
      gradeC: 16.00,
      rejects: 8.00
    },
    husks: {
      rawHuskPer1000: 2200,
      coirMillHuskPer1000: 2600,
      huskPerTon: 3500
    },
    labourPieceRates: {
      cutterRatePer1000: 2500,
      pickerRatePer1000: 1000,
      driverRatePer1000: 800,
      dehuskerRatePer1000: 1800
    }
  },
  clients: [],
  workers: [],
  harvestLots: [],
  attendanceLogs: [],
  clientBills: [],
  sales: [],
  expenses: []
};

class DataStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return {
            traderInfo: { ...defaultSeedData.traderInfo, ...(parsed.traderInfo || {}) },
            marketRates: {
              coconuts: { ...defaultSeedData.marketRates.coconuts, ...(parsed.marketRates?.coconuts || {}) },
              husks: { ...defaultSeedData.marketRates.husks, ...(parsed.marketRates?.husks || {}) },
              labourPieceRates: { ...defaultSeedData.marketRates.labourPieceRates, ...(parsed.marketRates?.labourPieceRates || {}) }
            },
            clients: parsed.clients || [],
            workers: parsed.workers || [],
            harvestLots: parsed.harvestLots || [],
            attendanceLogs: parsed.attendanceLogs || [],
            clientBills: parsed.clientBills || [],
            sales: parsed.sales || [],
            expenses: parsed.expenses || []
          };
        }
      }
    } catch (e) {
      console.error("Error loading LocalStorage", e);
    }
    this.saveData(defaultSeedData);
    return defaultSeedData;
  }

  saveData(newData) {
    this.data = newData || this.data;
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
      }
    } catch (e) {
      console.error("Failed to save to LocalStorage", e);
    }
  }

  resetToDefault() {
    this.saveData(defaultSeedData);
    return this.data;
  }

  getMarketRates() {
    const m = (this.data && this.data.marketRates) || {};
    const d = defaultSeedData.marketRates;
    return {
      coconuts: {
        gradeA: (m.coconuts && m.coconuts.gradeA !== undefined) ? Number(m.coconuts.gradeA) : d.coconuts.gradeA,
        gradeB: (m.coconuts && m.coconuts.gradeB !== undefined) ? Number(m.coconuts.gradeB) : d.coconuts.gradeB,
        gradeC: (m.coconuts && m.coconuts.gradeC !== undefined) ? Number(m.coconuts.gradeC) : d.coconuts.gradeC,
        rejects: (m.coconuts && m.coconuts.rejects !== undefined) ? Number(m.coconuts.rejects) : d.coconuts.rejects
      },
      husks: {
        rawHuskPer1000: (m.husks && m.husks.rawHuskPer1000 !== undefined) ? Number(m.husks.rawHuskPer1000) : d.husks.rawHuskPer1000,
        coirMillHuskPer1000: (m.husks && m.husks.coirMillHuskPer1000 !== undefined) ? Number(m.husks.coirMillHuskPer1000) : d.husks.coirMillHuskPer1000,
        huskPerTon: (m.husks && m.husks.huskPerTon !== undefined) ? Number(m.husks.huskPerTon) : d.husks.huskPerTon
      },
      labourPieceRates: {
        cutterRatePer1000: (m.labourPieceRates && m.labourPieceRates.cutterRatePer1000 !== undefined) ? Number(m.labourPieceRates.cutterRatePer1000) : d.labourPieceRates.cutterRatePer1000,
        pickerRatePer1000: (m.labourPieceRates && m.labourPieceRates.pickerRatePer1000 !== undefined) ? Number(m.labourPieceRates.pickerRatePer1000) : d.labourPieceRates.pickerRatePer1000,
        driverRatePer1000: (m.labourPieceRates && m.labourPieceRates.driverRatePer1000 !== undefined) ? Number(m.labourPieceRates.driverRatePer1000) : d.labourPieceRates.driverRatePer1000,
        dehuskerRatePer1000: (m.labourPieceRates && m.labourPieceRates.dehuskerRatePer1000 !== undefined) ? Number(m.labourPieceRates.dehuskerRatePer1000) : d.labourPieceRates.dehuskerRatePer1000
      }
    };
  }

  updateMarketRates(newRates) {
    this.data.marketRates = newRates;
    this.saveData();
  }

  getClients() { return this.data.clients || defaultSeedData.clients; }
  getClientById(id) { return this.getClients().find(c => c.id === id); }
  
  addClient(client) {
    client.id = "cli_" + Date.now();
    client.contractAdvance = Number(client.contractAdvance || 0);
    client.advanceBalance = client.contractAdvance;
    client.quickCashBalance = 0;
    client.quickCashHistory = [];
    client.advanceHistory = [];
    if (client.contractAdvance > 0) {
      client.advanceHistory.push({
        id: "adv_" + Date.now(),
        date: new Date().toISOString().slice(0,10),
        type: "advance_given",
        amount: client.contractAdvance,
        notes: "Joining / Contract security advance paid"
      });
    }
    this.data.clients.push(client);
    this.saveData();
    return client;
  }

  giveClientQuickCash(clientId, amount, notes) {
    const client = this.getClientById(clientId);
    if (!client) return;
    amount = Number(amount || 0);
    client.quickCashBalance = (client.quickCashBalance || 0) + amount;
    if (!client.quickCashHistory) client.quickCashHistory = [];
    client.quickCashHistory.push({
      id: "qcash_c_" + Date.now(),
      date: new Date().toISOString().slice(0,10),
      amount: amount,
      notes: notes || "Mid-cycle quick cash advance given to farm owner",
      status: "unpaid"
    });
    this.saveData();
  }

  giveWorkerQuickCash(workerId, amount, notes) {
    const worker = this.getWorkerById(workerId);
    if (!worker) return;
    amount = Number(amount || 0);
    worker.quickCashBalance = (worker.quickCashBalance || 0) + amount;
    if (!worker.quickCashHistory) worker.quickCashHistory = [];
    worker.quickCashHistory.push({
      id: "qcash_w_" + Date.now(),
      date: new Date().toISOString().slice(0,10),
      amount: amount,
      notes: notes || "Pre-payday quick cash advance given to worker",
      status: "unpaid"
    });
    this.saveData();
  }

  processWorkerPayroll(payout) {
    const worker = this.getWorkerById(payout.workerId);
    if (!worker) return;
    if (!worker.payrollHistory) worker.payrollHistory = [];

    payout.id = "pay_" + Date.now();
    payout.date = payout.date || new Date().toISOString().slice(0,10);
    worker.payrollHistory.unshift(payout);

    if (payout.quickCashDeducted > 0) {
      worker.quickCashBalance = Math.max(0, (worker.quickCashBalance || 0) - payout.quickCashDeducted);
      if (worker.quickCashHistory) {
        let remainingToDeduct = payout.quickCashDeducted;
        worker.quickCashHistory.forEach(qc => {
          if (qc.status === 'unpaid' && remainingToDeduct > 0) {
            if (qc.amount <= remainingToDeduct) {
              remainingToDeduct -= qc.amount;
              qc.status = 'adjusted';
            } else {
              qc.amount -= remainingToDeduct;
              remainingToDeduct = 0;
            }
          }
        });
      }
    }

    this.saveData();
    return payout;
  }

  getClientFullProfile(clientId) {
    const client = this.getClientById(clientId);
    if (!client) return null;
    const lots = (this.data.harvestLots || []).filter(l => l.clientId === clientId);
    const bills = (this.data.clientBills || []).filter(b => b.clientId === clientId);

    const totalNutsHarvested = lots.reduce((sum, l) => sum + Number(l.grossHarvestCount || 0), 0);
    const totalBadNuts = lots.reduce((sum, l) => sum + Number(l.badNutCount || 0), 0);
    const totalAcceptedNuts = totalNutsHarvested - totalBadNuts;
    const totalBilledAmount = bills.reduce((sum, b) => sum + Number(b.grossAmount || 0), 0);

    return {
      client,
      lots,
      bills,
      totalNutsHarvested,
      totalBadNuts,
      totalAcceptedNuts,
      totalBilledAmount
    };
  }

  getWorkerFullProfile(workerId) {
    const worker = this.getWorkerById(workerId);
    if (!worker) return null;
    const attendance = (this.data.attendanceLogs || []).filter(a => a.workerId === workerId);
    const lotIdsWorked = [...new Set(attendance.map(a => a.lotId))];
    const lotsWorked = lotIdsWorked.map(id => this.getLotById(id)).filter(Boolean);

    const totalLotsWorked = lotsWorked.length;
    const totalNutsHandled = attendance.reduce((sum, a) => {
      if (a.allocatedNutCount !== undefined) return sum + Number(a.allocatedNutCount);
      const lot = this.getLotById(a.lotId);
      return sum + Number(lot ? lot.grossHarvestCount : 0);
    }, 0);

    const thousandUnits = totalNutsHandled / 1000;
    const rate = worker.wageRatePer1000 || 2500;
    const estimatedTotalWageEarned = thousandUnits * rate;

    return {
      worker,
      attendance,
      lotsWorked,
      totalLotsWorked,
      totalNutsHandled,
      estimatedTotalWageEarned
    };
  }

  getWorkers() { return this.data.workers || defaultSeedData.workers; }
  getWorkerById(id) { return this.getWorkers().find(w => w.id === id); }

  addWorker(worker) {
    worker.id = "wrk_" + Date.now();
    worker.contractAdvance = Number(worker.contractAdvance || 0);
    worker.advanceBalance = worker.contractAdvance;
    worker.quickCashBalance = 0;
    worker.quickCashHistory = [];
    worker.payrollHistory = [];
    worker.advanceHistory = [];
    if (worker.contractAdvance > 0) {
      worker.advanceHistory.push({
        id: "adv_w_" + Date.now(),
        date: new Date().toISOString().slice(0,10),
        type: "advance_given",
        amount: worker.contractAdvance,
        notes: "Joining contract advance paid to worker"
      });
    }
    this.data.workers.push(worker);
    this.saveData();
    return worker;
  }

  getLots() { return this.data.harvestLots || defaultSeedData.harvestLots; }
  getInProcessLots() { return this.getLots().filter(l => l && l.status === 'in_process'); }
  getCompletedLots() { return this.getLots().filter(l => l && l.status === 'completed'); }
  getLotById(id) { return this.getLots().find(l => l.id === id); }

  addHarvestLot(lot, attendingWorkerIds = []) {
    lot.id = "lot_" + Date.now();
    const client = this.getClientById(lot.clientId);
    const farmName = client ? client.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') : 'FARM';
    const seq = Math.floor(100 + Math.random() * 900);
    lot.lotNumber = `${farmName}-LOT-${seq}`;
    lot.status = "in_process";
    lot.badNutCount = Number(lot.badNutCount || 0);
    lot.acceptedNutCount = lot.grossHarvestCount - lot.badNutCount;

    if (!this.data.harvestLots) this.data.harvestLots = [];
    this.data.harvestLots.unshift(lot);

    if (attendingWorkerIds && attendingWorkerIds.length > 0) {
      const roleCounts = {};
      attendingWorkerIds.forEach(wId => {
        const wrk = this.getWorkerById(wId);
        const role = wrk ? wrk.role : 'general';
        roleCounts[role] = (roleCounts[role] || 0) + 1;
      });

      this.saveAttendance(lot.id, attendingWorkerIds.map(wId => {
        const wrk = this.getWorkerById(wId);
        const role = wrk ? wrk.role : 'general';
        const sameRoleCount = roleCounts[role] || 1;
        const sharePerWorkerInRole = Math.round(lot.grossHarvestCount / sameRoleCount);
        return {
          workerId: wId,
          role: role,
          status: 'present',
          date: lot.harvestDate,
          allocatedNutCount: sharePerWorkerInRole
        };
      }));
    }

    this.saveData();
    return lot;
  }

  updateLotStage(id, stage, status = 'in_process') {
    const idx = (this.data.harvestLots || []).findIndex(l => l.id === id);
    if (idx !== -1) {
      this.data.harvestLots[idx].processStage = stage;
      this.data.harvestLots[idx].status = status;
      this.saveData();
    }
  }

  getAttendanceForLot(lotId) {
    return (this.data.attendanceLogs || []).filter(a => a.lotId === lotId);
  }

  saveAttendance(lotId, attendanceArray) {
    if (!this.data.attendanceLogs) this.data.attendanceLogs = [];
    this.data.attendanceLogs = this.data.attendanceLogs.filter(a => a.lotId !== lotId);
    attendanceArray.forEach(item => {
      item.id = "att_" + Date.now() + "_" + Math.random().toString(36).substr(2, 4);
      item.lotId = lotId;
      this.data.attendanceLogs.push(item);
    });
    this.saveData();
  }

  getClientBills() { return this.data.clientBills || defaultSeedData.clientBills; }
  getBillByLotId(lotId) {
    return this.getClientBills().find(b => b.lotId === lotId);
  }

  saveClientBill(bill) {
    if (!this.data.clientBills) this.data.clientBills = [];
    bill.id = "bill_" + Date.now();
    bill.billNumber = "INV-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900);
    this.data.clientBills.unshift(bill);

    if (bill.quickCashDeduction > 0) {
      const client = this.getClientById(bill.clientId);
      if (client) {
        client.quickCashBalance = Math.max(0, (client.quickCashBalance || 0) - bill.quickCashDeduction);
        if (client.quickCashHistory) {
          let remaining = bill.quickCashDeduction;
          client.quickCashHistory.forEach(qc => {
            if (qc.status === 'unpaid' && remaining > 0) {
              if (qc.amount <= remaining) {
                remaining -= qc.amount;
                qc.status = 'adjusted';
              } else {
                qc.amount -= remaining;
                remaining = 0;
              }
            }
          });
        }
      }
    }

    this.updateLotStage(bill.lotId, "Billed & Settled", "completed");
    this.saveData();
    return bill;
  }

  getSales() { return this.data.sales || defaultSeedData.sales; }
  addSale(sale) {
    sale.id = "sal_" + Date.now();
    this.data.sales.unshift(sale);
    this.saveData();
    return sale;
  }

  getExpenses() { return this.data.expenses || defaultSeedData.expenses; }
  addExpense(expense) {
    expense.id = "exp_" + Date.now();
    this.data.expenses.unshift(expense);
    this.saveData();
    return expense;
  }

  calculateLabourBreakdown(nutCount) {
    const rates = this.getMarketRates().labourPieceRates;
    const thousandUnits = nutCount / 1000;

    const cutterCost = thousandUnits * rates.cutterRatePer1000;
    const pickerCost = thousandUnits * rates.pickerRatePer1000;
    const driverCost = thousandUnits * rates.driverRatePer1000;
    const dehuskerCost = thousandUnits * rates.dehuskerRatePer1000;

    const totalLabourWage = cutterCost + pickerCost + driverCost + dehuskerCost;

    return {
      cutterCost,
      pickerCost,
      driverCost,
      dehuskerCost,
      totalLabourWage,
      ratePerNut: totalLabourWage / (nutCount || 1)
    };
  }

  getDashboardStats() {
    const totalLots = this.getLots().length;
    const inProcessCount = this.getInProcessLots().length;
    const totalHarvestedNuts = this.getLots().reduce((sum, l) => sum + Number(l.grossHarvestCount || 0), 0);

    const coconutRevenue = this.getSales().filter(s => s.type === 'coconut').reduce((sum, s) => sum + Number(s.totalRevenue || 0), 0);
    const huskRevenue = this.getSales().filter(s => s.type === 'husk').reduce((sum, s) => sum + Number(s.totalRevenue || 0), 0);
    const totalRevenue = coconutRevenue + huskRevenue;

    const totalClientPayouts = this.getLots().reduce((sum, l) => {
      const bill = this.getBillByLotId(l.id);
      if (bill) return sum + Number(bill.netPayable !== undefined ? bill.netPayable : bill.grossAmount);
      const cli = this.getClientById(l.clientId);
      const rate = cli ? (cli.ratePer1000Nuts || 12500) : 12500;
      return sum + ((l.grossHarvestCount / 1000) * rate);
    }, 0);

    let totalLabourCost = 0;
    const workers = this.getWorkers();
    workers.forEach(w => {
      if (w.payrollHistory && w.payrollHistory.length > 0) {
        totalLabourCost += w.payrollHistory.reduce((s, p) => s + Number(p.netPaid !== undefined ? p.netPaid : p.grossWage || 0), 0);
      }
    });

    if (totalLabourCost === 0) {
      totalLabourCost = this.getLots().reduce((sum, l) => {
        return sum + this.calculateLabourBreakdown(l.grossHarvestCount).totalLabourWage;
      }, 0);
    }

    const totalExpenses = this.getExpenses().reduce((sum, e) => sum + Number(e.amount || 0), 0);
    const totalCost = totalClientPayouts + totalLabourCost + totalExpenses;
    const netProfit = totalRevenue - totalCost;

    return {
      totalLots,
      inProcessCount,
      totalHarvestedNuts,
      coconutRevenue,
      huskRevenue,
      totalRevenue,
      totalClientPayouts,
      totalLabourCost,
      totalExpenses,
      totalCost,
      netProfit,
      avgProfitPer1000Nuts: totalHarvestedNuts > 0 ? (netProfit / (totalHarvestedNuts / 1000)).toFixed(2) : 0
    };
  }
}

const store = new DataStore();

// ==========================================
// 2. BILINGUAL TRANSLATIONS
// ==========================================
const translations = {
  en: {
    brandSubtitle: "Coconut Trading Platform",
    navDashboard: "🌴 1. Harvest Lots",
    navClients: "👨‍🌾 2. Farm Owners",
    navWorkers: "👷 3. Labour & Wages",
    navSales: "💰 4. Sales & Cash",
    navRates: "⚙️ Rates Config",

    tabTitles: {
      dashboard: { title: "🌴 Farm Harvest Lots (அறுவடை)", sub: "Track harvest lots from tree climbing to yard dehusking & make client bills" },
      clients: { title: "👨‍🌾 Client Farm Owners (தோட்ட முதலாளி)", sub: "Manage farm owner accounts, contract advances & issue quick cash" },
      workers: { title: "👷 Labour Payroll & Wages (ஆள் கூலி)", sub: "Weekly Saturday payroll, job-based dehusking & issue quick cash" },
      sales: { title: "💰 Sales & Operational Cash (விற்பனை)", sub: "Record coconut/husk sales deliveries to buyers & track diesel expenses" },
      finance: { title: "🏛️ Finance & Accounting Ledger (நிதி ஏடு)", sub: "Complete double-entry accounting ledger tracking all income inflows, client bill payouts, labour wages & expenses" },
      rates: { title: "⚙️ Market Selling Rates & Wage Config", sub: "Set coconut prices, coir husk rates & labour piece-rate structure" }
    },
    btnNewLot: "+ New Harvest",
    btnExport: "Backup Data"
  },
  ta: {
    brandSubtitle: "தேங்காய் வியாபார மென்பொருள்",
    navDashboard: "🌴 1. தேங்காய் அறுவடை",
    navClients: "👨‍🌾 2. தோட்ட முதலாளி",
    navWorkers: "👷 3. தொழிலாளர் கூலி",
    navSales: "💰 4. விற்பனை & செலவு",
    navRates: "⚙️ விலை நிர்ணயம்",

    tabTitles: {
      dashboard: { title: "🌴 தோட்ட தேங்காய் அறுவடை", sub: "தோட்ட அறுவடை, கழிவு தேங்காய் கணக்கு மற்றும் பில் தயாரித்தல்" },
      clients: { title: "👨‍🌾 தோட்ட உரிமையாளர்கள் கணக்கு", sub: "தோட்ட முதலாளிகள் அட்வான்ஸ் மற்றும் முன்பண விவரம்" },
      workers: { title: "👷 தொழிலாளர்கள் கூலி கணக்கு", sub: "வாராந்திர கூலி பட்டுவாடா மற்றும் மட்டை உரிப்பவர் கூலி" },
      sales: { title: "💰 தேங்காய் விற்பனை & செலவுகள்", sub: "வியாபாரிகளுக்கு விற்பனை மற்றும் வண்டி டீசல் செலவுகள்" },
      finance: { title: "🏛️ நிதி & கணக்கு வரவு செலவு ஏடு", sub: "அனைத்து விற்பனை வரவு, தோட்ட முதலாளி பட்டுவாடா, ஆள் கூலி மற்றும் தொழில் செலவுகள் அடங்கிய கணக்கு ஏடு" },
      rates: { title: "⚙️ சந்தை விலை & கூலி நிர்ணயம்", sub: "தேங்காய், மட்டை சந்தை விலை மற்றும் கூலி விவரம்" }
    },
    btnNewLot: "+ புதிய அறுவடை",
    btnExport: "தரவு பேக்-அப்"
  }
};

let currentLang = (typeof localStorage !== 'undefined' && localStorage.getItem('cocotrader_lang')) || 'en';

function getLang() { return currentLang; }
function setLang(lang) {
  currentLang = lang;
  if (typeof localStorage !== 'undefined') localStorage.setItem('cocotrader_lang', lang);
}
function t(key) {
  const dict = translations[currentLang] || translations.en;
  return dict[key] || translations.en[key] || key;
}

const getEl = (id) => document.getElementById(id);
const getViewContainer = () => getEl('contentView');
const getModalBackdrop = () => getEl('modalBackdrop');
const getModalTitle = () => getEl('modalTitle');
const getModalBody = () => getEl('modalBody');
const getTabTitle = () => getEl('currentTabTitle');
const getTabSubtitle = () => getEl('currentTabSubtitle');

let currentTab = 'dashboard';

// Attach all Window exports
window.store = store;
window.switchTab = switchTab;
window.toggleLanguage = toggleLanguage;
window.toggleTheme = toggleTheme;
window.openNewLotModal = openNewLotModal;
window.updateStageModal = updateStageModal;
window.openNewClientModal = openNewClientModal;
window.openGiveClientQuickCashModal = openGiveClientQuickCashModal;
window.openClientProfileModal = openClientProfileModal;
window.openEditClientModal = openEditClientModal;
window.openNewWorkerModal = openNewWorkerModal;
window.openGiveWorkerQuickCashModal = openGiveWorkerQuickCashModal;
window.openWorkerProfileModal = openWorkerProfileModal;
window.openEditWorkerModal = openEditWorkerModal;
window.renderWagesView = renderWagesView;
window.renderStockView = renderStockView;
window.openLotDetailsModal = openLotDetailsModal;
window.openLotLaboursModal = openLotLaboursModal;
window.openPayrollReviewModal = openPayrollReviewModal;
window.printWorkerPayslip = printWorkerPayslip;

function openWorkerContributionsModal(workerId, startDate, endDate) {
  const worker = store.getWorkerById(workerId);
  if (!worker) return;

  const logs = (store.data.attendanceLogs || []).filter(a => {
    const d = a.date || store.getLotById(a.lotId)?.harvestDate || '';
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return a.workerId === workerId;
  });

  const lotContributions = logs.map(a => {
    const lot = store.getLotById(a.lotId);
    const client = lot ? store.getClientById(lot.clientId) : null;
    const farmName = client ? client.name : 'Farm';
    const grossNuts = lot ? Number(lot.grossHarvestCount || 0) : 0;
    
    const attendanceForLot = store.getAttendanceForLot(a.lotId);
    const sameRoleAtts = attendanceForLot.filter(att => {
      const wrk = store.getWorkerById(att.workerId);
      const r = att.role || (wrk ? wrk.role : '');
      return r === worker.role;
    });

    const sameRoleCount = sameRoleAtts.length || 1;
    const workerShare = getWorkerNutShareForLot(workerId, a.lotId, worker.role);

    return {
      lotNumber: lot ? lot.lotNumber : a.lotId,
      farmName: farmName,
      date: a.date || (lot ? lot.harvestDate : ''),
      grossNuts: grossNuts,
      sameRoleCount: sameRoleCount,
      workerShare: workerShare
    };
  });

  const totalNuts = lotContributions.reduce((sum, c) => sum + c.workerShare, 0);

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `🌾 Farm Nut Count Contributions & Equal Split Breakdown`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <h4 style="margin:0; font-size:1.15rem; font-weight:700;">👷 ${worker.name} <span class="badge badge-role">${worker.role.toUpperCase()}</span></h4>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.2rem;">${worker.phone} | Range: ${startDate || 'All'} to ${endDate || 'All'}</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.8rem; color:var(--text-muted);">Total Allocated Nut Share</div>
            <div class="mono" style="font-size:1.6rem; font-weight:800; color:var(--color-primary);">${totalNuts.toLocaleString()} nuts</div>
          </div>
        </div>
      </div>

      <div style="font-size:0.9rem; font-weight:700; color:var(--color-primary); margin-bottom:0.75rem;">
        📍 Harvest Lots Worked (${lotContributions.length} Lots in Selected Week):
      </div>

      ${lotContributions.length === 0 ? '<div style="font-size:0.9rem; color:var(--text-muted); padding:1rem; text-align:center;">No farm harvest lots logged for this worker in the selected date range.</div>' : ''}

      <div style="display:flex; flex-direction:column; gap:0.6rem; max-height:350px; overflow-y:auto; padding-right:0.3rem;">
        ${lotContributions.map(c => `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.9rem; padding:0.6rem 0.8rem; background:var(--bg-card); border-radius:var(--radius-sm); border:1px solid var(--border-color);">
            <div>
              <span>📍 <strong>${c.farmName}</strong> (${c.lotNumber}) - <small style="color:var(--text-muted);">${c.date}</small></span><br>
              <small style="color:var(--text-muted);">Farm Total: <strong>${c.grossNuts.toLocaleString()} nuts</strong> | Shared by <strong>${c.sameRoleCount} ${worker.role.toUpperCase()}(s)</strong> (${c.grossNuts.toLocaleString()} ÷ ${c.sameRoleCount})</small>
            </div>
            <div style="text-align:right;">
              <div style="font-size:0.75rem; color:var(--text-muted);">Worker Share</div>
              <span class="mono" style="font-weight:800; font-size:1.1rem; color:var(--color-primary);">${c.workerShare.toLocaleString()} nuts</span>
            </div>
          </div>
        `).join('')}
      </div>

      <div style="margin-top:1.5rem; display:flex; justify-content:flex-end;">
        <button class="btn btn-secondary" onclick="window.closeModal()">Close</button>
      </div>
    `;
  }
  openModal();
}

window.openWorkerContributionsModal = openWorkerContributionsModal;

function getNextHarvestCycleInfo(clientId) {
  const client = store.getClientById(clientId);
  const cycleDays = client?.harvestCycleDays || 45;
  const lots = (store.data.harvestLots || []).filter(l => l.clientId === clientId);

  let lastHarvestDate = null;
  let hasPreviousHarvest = false;
  if (lots && lots.length > 0) {
    const sorted = [...lots].sort((a, b) => new Date(b.harvestDate) - new Date(a.harvestDate));
    if (sorted[0] && sorted[0].harvestDate) {
      lastHarvestDate = new Date(sorted[0].harvestDate);
      hasPreviousHarvest = true;
    }
  }

  const baseDate = lastHarvestDate && !isNaN(lastHarvestDate.getTime()) ? lastHarvestDate : new Date();
  const nextDate = new Date(baseDate);
  nextDate.setDate(baseDate.getDate() + cycleDays);

  const today = new Date();
  today.setHours(0,0,0,0);
  nextDate.setHours(0,0,0,0);

  const diffTime = nextDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const dateFormatted = nextDate.toISOString().slice(0,10);
  const lastHarvestStr = hasPreviousHarvest ? baseDate.toISOString().slice(0,10) : 'Not Yet Harvested';

  let statusBadge = '';
  if (diffDays < 0) {
    statusBadge = `<span class="badge badge-danger" style="font-weight:700; background:#ef4444; color:#fff;">🔴 Overdue by ${Math.abs(diffDays)} days (${dateFormatted})</span>`;
  } else if (diffDays === 0) {
    statusBadge = `<span class="badge badge-warning" style="font-weight:800; background:#f59e0b; color:#fff;">⚡ Harvest Due Today (${dateFormatted})</span>`;
  } else if (diffDays <= 7) {
    statusBadge = `<span class="badge badge-warning" style="font-weight:700; background:#f59e0b; color:#fff;">⚠️ Due in ${diffDays} days (${dateFormatted})</span>`;
  } else {
    statusBadge = `<span class="badge badge-completed" style="font-weight:700; font-size:0.8rem;">🗓️ Next Due: ${dateFormatted} (in ${diffDays} days)</span>`;
  }

  return {
    cycleDays,
    lastHarvestDate: lastHarvestStr,
    nextHarvestDate: dateFormatted,
    daysRemaining: diffDays,
    statusBadge
  };
}

window.getNextHarvestCycleInfo = getNextHarvestCycleInfo;
window.openSettleClientPendingBalanceModal = openSettleClientPendingBalanceModal;
window.openSettleWorkerPendingBalanceModal = openSettleWorkerPendingBalanceModal;
window.openNewCoconutSaleModal = openNewCoconutSaleModal;
window.openNewHuskSaleModal = openNewHuskSaleModal;
window.openNewExpenseModal = openNewExpenseModal;
window.openGenerateClientBillModal = openGenerateClientBillModal;
window.printClientBill = printClientBill;
window.exportDataJSON = exportDataJSON;
window.openModal = openModal;
window.closeModal = closeModal;
window.resetAppDatabase = () => {
  try { if (typeof localStorage !== 'undefined') localStorage.clear(); } catch(e) {}
  location.reload();
};

function toggleTheme() {
  const isDark = document.body.classList.contains('dark-theme');
  if (isDark) {
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');
    if (typeof localStorage !== 'undefined') localStorage.setItem('cocotrader_theme', 'light');
  } else {
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');
    if (typeof localStorage !== 'undefined') localStorage.setItem('cocotrader_theme', 'dark');
  }
}

function toggleLanguage() {
  const newLang = getLang() === 'en' ? 'ta' : 'en';
  setLang(newLang);
  updateUILanguage();
  switchTab(currentTab);
}

function updateUILanguage() {
  const lang = getLang();
  const langBtnText = getEl('langBtnText');
  if (langBtnText) {
    langBtnText.textContent = lang === 'en' ? '🌐 தமிழ் (Tamil)' : '🌐 English (EN)';
  }

  const navMap = {
    dashboard: t('navDashboard'),
    clients: t('navClients'),
    workers: t('navWorkers'),
    sales: t('navSales'),
    rates: t('navRates')
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

function initApp() {
  closeModal();
  const savedTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('cocotrader_theme')) || 'light';
  document.body.classList.remove('light-theme', 'dark-theme');
  document.body.classList.add(savedTheme + '-theme');
  setupGlobalEvents();
  updateUILanguage();
  renderView(currentTab);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
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
  getEl('langToggleBtn')?.addEventListener('click', () => toggleLanguage());
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
      case 'dashboard':
      case 'lots': renderDashboard(container); break;
      case 'clients': renderClientsView(container); break;
      case 'workers': renderWorkersView(container); break;
      case 'wages': renderWagesView(container); break;
      case 'stock': renderStockView(container); break;
      case 'sales': renderSalesView(container); break;
      case 'finance': renderFinanceView(container); break;
      case 'rates': renderRatesView(container); break;
      default: renderDashboard(container);
    }
  } catch (err) {
    console.error("Error rendering view:", err);
    container.innerHTML = `
      <div class="card-box" style="border: 2px solid var(--color-danger); padding:2rem;">
        <h3 style="color:var(--color-danger); margin-bottom:0.5rem;">Rendering Error Encountered</h3>
        <p style="color:var(--text-muted); margin-bottom:1rem;">An unexpected error occurred while displaying the view: <code>${err.message}</code></p>
        <button class="btn btn-primary btn-sm" onclick="window.resetAppDatabase()">Reset Database & Fix View</button>
      </div>
    `;
  }
}

// VIEW RENDERERS
function renderDashboard(container) {
  const target = container || getViewContainer();
  if (!target) return;

  const stats = store.getDashboardStats();
  const inProcessLots = store.getInProcessLots();
  const completedLots = store.getCompletedLots();
  const currency = store.data.traderInfo.currency;

  target.innerHTML = `
    <!-- Top Action Launcher Buttons -->
    <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1.5rem;">
      <button class="btn btn-primary" style="font-size:1.05rem; padding:0.75rem 1.25rem; font-weight:700;" onclick="window.openNewLotModal()">
        🌴 ${getLang() === 'ta' ? '+ புதிய தோட்ட அறுவடை' : '+ New Farm Harvest Lot'}
      </button>
      <button class="btn btn-secondary" style="font-size:1.05rem; padding:0.75rem 1.25rem; font-weight:700; border-color:var(--color-accent); color:var(--color-accent);" onclick="window.openGiveClientQuickCashModal(store.getClients()[0]?.id || '')">
        💵 ${getLang() === 'ta' ? '+ முன்பணம் கொடுக்க (Quick Cash)' : '+ Give Quick Cash'}
      </button>
      <button class="btn btn-secondary" style="font-size:1.05rem; padding:0.75rem 1.25rem; font-weight:700;" onclick="window.openNewCoconutSaleModal()">
        💰 ${getLang() === 'ta' ? '+ தேங்காய் விற்பனை செய்ய' : '+ Log Coconut Sale'}
      </button>
    </div>

    <!-- 4 Big Metric Summary Cards -->
    <div class="kpi-grid" style="margin-bottom:1.5rem;">
      <div class="kpi-card" style="padding:1.25rem;">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:1rem; font-weight:700;">🥥 ${getLang() === 'ta' ? 'மொத்த தேங்காய்' : 'Total Harvested'}</span>
        </div>
        <div class="kpi-value" style="font-size:2rem;">${stats.totalHarvestedNuts.toLocaleString()} nuts</div>
        <div class="kpi-subtext"><span class="trend-up">${stats.inProcessCount} Lots In Process</span></div>
      </div>

      <div class="kpi-card" style="padding:1.25rem;">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:1rem; font-weight:700;">💵 ${getLang() === 'ta' ? 'விற்பனை வருமானம்' : 'Gross Sales Revenue'}</span>
        </div>
        <div class="kpi-value" style="font-size:2rem; color:var(--color-accent);">${currency} ${stats.totalRevenue.toLocaleString()}</div>
        <div class="kpi-subtext"><span>Coconuts + Coir Husks</span></div>
      </div>

      <div class="kpi-card" style="padding:1.25rem;">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:1rem; font-weight:700;">👷 ${getLang() === 'ta' ? 'ஆள் கூலி & செலவு' : 'Outflows (Client + Labour)'}</span>
        </div>
        <div class="kpi-value" style="font-size:2rem; color:var(--color-danger);">${currency} ${(stats.totalClientPayouts + stats.totalLabourCost).toLocaleString()}</div>
        <div class="kpi-subtext"><span>Client Payments + Labour Wages</span></div>
      </div>

      <div class="kpi-card" style="padding:1.25rem; background:linear-gradient(135deg, rgba(5,150,105,0.1), rgba(217,119,6,0.1)); border:2px solid var(--color-primary);">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:1rem; font-weight:700; color:var(--color-primary);">📈 ${getLang() === 'ta' ? 'நிகர லாபம்' : 'Net Trader Profit'}</span>
        </div>
        <div class="kpi-value" style="font-size:2.2rem; color:var(--color-primary);">${currency} ${stats.netProfit.toLocaleString()}</div>
        <div class="kpi-subtext"><span class="trend-up">${currency}${stats.avgProfitPer1000Nuts} per 1,000 nuts</span></div>
      </div>
    </div>

    <!-- Active Farm Harvest Lots Table -->
    <div class="card-box" style="margin-bottom:1.5rem;">
      <div class="card-box-header">
        <h3 style="font-size:1.2rem;">🌴 1. ${getLang() === 'ta' ? 'நடப்பு தோட்ட தேங்காய் அறுவடை (அறுவடையில்)' : 'Active Farm Harvest Lots (In Process)'}</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Lot ID</th>
              <th>Farm / Client Owner</th>
              <th>Harvest Date</th>
              <th>Gross Harvest Count</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${inProcessLots.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:var(--text-muted); padding:1.5rem;">No active farm harvest lots in process. Click "+ New Harvest" to begin.</td></tr>' : ''}
            ${inProcessLots.map(l => {
              const client = store.getClientById(l.clientId);
              return `
                <tr style="cursor:pointer;" onclick="if(event.target.tagName !== 'BUTTON') window.openLotDetailsModal('${l.id}')">
                  <td class="mono" style="font-size:1.1rem;"><strong>${l.lotNumber}</strong></td>
                  <td><strong style="font-size:1.05rem;">${client ? client.name : 'Unknown'}</strong><br><small style="color:var(--text-muted);">${client ? client.location : ''}</small></td>
                  <td>${l.harvestDate}</td>
                  <td class="mono" style="font-weight:700; font-size:1.15rem; color:var(--color-primary);">${l.grossHarvestCount.toLocaleString()} nuts</td>
                  <td>
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                      <button class="btn btn-secondary btn-sm" style="font-weight:700;" onclick="event.stopPropagation(); window.openLotDetailsModal('${l.id}')">👁️ View Lot Details</button>
                      <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:var(--color-primary); color:var(--color-primary);" onclick="event.stopPropagation(); window.openEditLotNutSplitModal('${l.id}')">✏️ Edit Nut Split</button>
                      <button class="btn btn-primary btn-sm" style="font-weight:700;" onclick="event.stopPropagation(); window.openGenerateClientBillModal('${l.id}')">🧾 Make Bill</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Completed Harvest Lots -->
    <div class="card-box">
      <div class="card-box-header">
        <h3 style="font-size:1.2rem;">✅ 2. ${getLang() === 'ta' ? 'முடிவடைந்த & பில் செய்யப்பட்ட அறுவடை லாட்கள்' : 'Completed & Billed Farm Harvest Lots'}</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Lot ID</th>
              <th>Client Owner</th>
              <th>Harvest Date</th>
              <th>Gross Count</th>
              <th>Rate / Piece</th>
              <th>Bill Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${completedLots.map(l => {
              const client = store.getClientById(l.clientId);
              const bill = store.getBillByLotId(l.id);
              const rateStr = bill ? `₹ ${(bill.ratePerPiece !== undefined ? bill.ratePerPiece : (bill.ratePer1000 ? bill.ratePer1000 / 1000 : 12.50)).toFixed(2)} / nut` : '-';

              return `
                <tr style="cursor:pointer;" onclick="if(event.target.tagName !== 'BUTTON') window.openLotDetailsModal('${l.id}')">
                  <td class="mono"><strong>${l.lotNumber}</strong></td>
                  <td>${client ? client.name : 'N/A'}</td>
                  <td>${l.harvestDate}</td>
                  <td class="mono" style="font-weight:700;">${l.grossHarvestCount.toLocaleString()} nuts</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700;">${rateStr}</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700;">${currency} ${bill ? bill.grossAmount.toLocaleString() : '-'}</td>
                  <td>
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                      <button class="btn btn-secondary btn-sm" onclick="window.openLotDetailsModal('${l.id}')">👁️ View Details</button>
                      <button class="btn btn-primary btn-sm" onclick="window.printClientBill('${bill ? bill.id : ''}')">Print Invoice</button>
                    </div>
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

function renderClientsView(container) {
  const target = container || getViewContainer();
  if (!target) return;
  const clients = store.getClients();
  const currency = store.data.traderInfo.currency;

  target.innerHTML = `
    <div class="card-box">
      <div class="card-box-header">
        <h3 style="font-size:1.2rem;">👨‍🌾 ${getLang() === 'ta' ? 'தோட்ட உரிமையாளர்கள் & முன்பண பதிவேடு' : 'Client Farm Owners & Advance Ledger'}</h3>
        <button class="btn btn-primary btn-sm" onclick="window.openNewClientModal()">${getLang() === 'ta' ? '+ புதிய தோட்ட உரிமையாளர்' : '+ Register Client Farm'}</button>
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Client Farm Owner</th>
              <th>Phone / Location</th>
              <th>Harvest Schedule (Last & Next Due)</th>
              <th>Pending Bill Balance</th>
              <th>Bank Account & UPI</th>
              <th>Contract Security Advance</th>
              <th>Unpaid Quick Cash</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${clients.map(c => {
              const cycle = getNextHarvestCycleInfo(c.id);
              const clientBills = store.getClientBills().filter(b => b.clientId === c.id);
              const pendingBillBal = clientBills.reduce((sum, b) => sum + Number(b.pendingBalance || 0), 0);

              return `
                <tr>
                  <td><strong style="font-size:1.1rem;">${c.name}</strong></td>
                  <td>${c.phone}${c.altPhone ? '<br><small style="color:var(--text-muted);">Alt: ' + c.altPhone + '</small>' : ''}<br><small style="color:var(--text-muted);">${c.location}</small></td>
                  <td class="mono">${c.treeCount} trees${c.areaSizeAcres ? '<br><small style="color:var(--color-primary); font-weight:700;">' + c.areaSizeAcres + '</small>' : ''}</td>
                  <td>
                    <div style="font-size:0.85rem; font-weight:700; color:var(--text-muted); margin-bottom:0.25rem;">
                      🌴 Last Harvest: <strong class="mono" style="color:var(--color-primary); font-weight:800;">${cycle.lastHarvestDate}</strong>
                    </div>
                    <div>
                      ${cycle.statusBadge}
                    </div>
                  </td>
                  <td class="mono" style="font-size:1.05rem;">
                    ${pendingBillBal > 0 ? `
                      <span style="color:#f59e0b; font-weight:800;">₹ ${pendingBillBal.toLocaleString()}</span>
                      <br><button class="btn btn-secondary btn-sm" style="margin-top:0.2rem; font-weight:700; border-color:var(--color-accent); color:var(--color-accent); padding:0.15rem 0.45rem; font-size:0.75rem;" onclick="window.openSettleClientPendingBalanceModal('${c.id}')">💵 Pay Balance</button>
                    ` : '<span style="color:var(--color-completed); font-weight:700;">₹ 0</span>'}
                  </td>
                  <td><small style="font-weight:700;">${c.bankInfo?.accountNumber ? c.bankInfo.bankName + ' A/C: ' + c.bankInfo.accountNumber : (c.bankDetails || 'Direct Settlement')}</small>${c.bankInfo?.upiId || c.upiId ? '<br><small style="color:var(--color-accent); font-weight:700;">UPI: ' + (c.bankInfo?.upiId || c.upiId) + '</small>' : ''}</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700; font-size:1.05rem;">${currency} ${(c.contractAdvance || 0).toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-accent); font-weight:700; font-size:1.05rem;">${currency} ${(c.quickCashBalance || 0).toLocaleString()}</td>
                  <td>
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                      <button class="btn btn-secondary btn-sm" style="border-color:var(--color-accent); color:var(--color-accent); font-weight:700;" onclick="window.openGiveClientQuickCashModal('${c.id}')">💵 + Give Cash</button>
                      <button class="btn btn-primary btn-sm" style="font-weight:700;" onclick="window.openClientProfileModal('${c.id}')">📋 Full History</button>
                    </div>
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

function renderWorkersView(container) {
  const target = container || getViewContainer();
  if (!target) return;
  const workers = store.getWorkers();
  const currency = store.data.traderInfo.currency;

  const saturdayWorkers = workers.filter(w => w.role !== 'dehusker');
  const dehuskerWorkers = workers.filter(w => w.role === 'dehusker');

  target.innerHTML = `
    <div class="card-box" style="margin-bottom:1.5rem;">
      <div class="card-box-header">
        <h3 style="font-size:1.2rem;">👷 1. ${getLang() === 'ta' ? 'வாராந்திர சனிக்கிழமை கூலி பட்டுவாடா' : 'Weekly Saturday Payroll (Cutters, Pickers, Drivers)'}</h3>
        <button class="btn btn-primary btn-sm" onclick="window.openNewWorkerModal()">${getLang() === 'ta' ? '+ புதிய தொழிலாளர்' : '+ Register Worker'}</button>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Worker Name</th>
              <th>Role</th>
              <th>Pending Wage Balance</th>
              <th>Bank Account & UPI</th>
              <th>Contract Security Advance</th>
              <th>Unpaid Quick Cash</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${saturdayWorkers.map(w => {
              const paidRecord = (w.payrollHistory && w.payrollHistory.length > 0) ? w.payrollHistory[0] : null;
              const pendingWageBal = (w.payrollHistory || []).reduce((sum, p) => sum + Number(p.pendingBalance || 0), 0);

              return `
                <tr>
                  <td>
                    <strong style="font-size:1.1rem;">${w.name}</strong><br>
                    <small style="color:var(--text-muted);">${w.phone}</small>
                    ${paidRecord ? (paidRecord.pendingBalance > 0 ? '<br><span class="badge badge-transit" style="font-size:0.75rem; background:#f59e0b; color:#fff;">⚠️ Partial Paid</span>' : '<br><span class="badge badge-completed" style="font-size:0.75rem; padding:0.15rem 0.4rem;">✅ Paid (₹ ' + paidRecord.netPaid.toLocaleString() + ')</span>') : ''}
                  </td>
                  <td><span class="badge badge-role">${w.role.toUpperCase()}</span></td>
                  <td class="mono" style="font-size:1.05rem;">
                    ${pendingWageBal > 0 ? `
                      <span style="color:#f59e0b; font-weight:800;">₹ ${pendingWageBal.toLocaleString()}</span>
                      <br><button class="btn btn-secondary btn-sm" style="margin-top:0.2rem; font-weight:700; border-color:var(--color-accent); color:var(--color-accent); padding:0.15rem 0.45rem; font-size:0.75rem;" onclick="window.openSettleWorkerPendingBalanceModal('${w.id}')">💵 Pay Balance</button>
                    ` : '<span style="color:var(--color-completed); font-weight:700;">₹ 0</span>'}
                  </td>
                  <td><small style="font-weight:700;">${w.bankInfo?.accountNumber ? w.bankInfo.bankName + ' A/C: ' + w.bankInfo.accountNumber : 'Cash Settlement'}</small>${w.bankInfo?.upiId ? '<br><small style="color:var(--color-accent); font-weight:700;">UPI: ' + w.bankInfo.upiId + '</small>' : ''}</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700;">${currency} ${(w.contractAdvance || 0).toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-accent); font-weight:700;">${currency} ${(w.quickCashBalance || 0).toLocaleString()}</td>
                  <td>
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                      ${paidRecord ? `
                        <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:var(--color-primary); color:var(--color-primary);" onclick="window.printWorkerPayslip('${w.id}', '${paidRecord.id}')">📄 Show Payslip</button>
                      ` : `
                        <button class="btn btn-primary btn-sm" style="font-weight:700; background:var(--color-primary);" onclick="window.openPayrollReviewModal('${w.id}')">💚 Pay Wages</button>
                      `}
                      <button class="btn btn-secondary btn-sm" style="border-color:var(--color-accent); color:var(--color-accent); font-weight:700;" onclick="window.openGiveWorkerQuickCashModal('${w.id}')">💵 + Give Cash</button>
                      <button class="btn btn-secondary btn-sm" onclick="window.openWorkerProfileModal('${w.id}')">📋 Full History</button>
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
        <h3 style="font-size:1.2rem;">🌴 2. ${getLang() === 'ta' ? 'வேலை வாரியான கூலி (மட்டை உரிப்பவர்)' : 'Job-Based Yard Dehusker Settlement'}</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Dehusker Worker</th>
              <th>Role</th>
              <th>Pending Wage Balance</th>
              <th>Bank Account & UPI</th>
              <th>Contract Security Advance</th>
              <th>Unpaid Quick Cash</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${dehuskerWorkers.map(w => {
              const paidRecord = (w.payrollHistory && w.payrollHistory.length > 0) ? w.payrollHistory[0] : null;
              const pendingWageBal = (w.payrollHistory || []).reduce((sum, p) => sum + Number(p.pendingBalance || 0), 0);

              return `
                <tr>
                  <td>
                    <strong style="font-size:1.1rem;">${w.name}</strong><br>
                    <small style="color:var(--text-muted);">${w.phone}</small>
                    ${paidRecord ? (paidRecord.pendingBalance > 0 ? '<br><span class="badge badge-transit" style="font-size:0.75rem; background:#f59e0b; color:#fff;">⚠️ Partial Paid</span>' : '<br><span class="badge badge-completed" style="font-size:0.75rem; padding:0.15rem 0.4rem;">✅ Paid (₹ ' + paidRecord.netPaid.toLocaleString() + ')</span>') : ''}
                  </td>
                  <td><span class="badge badge-role">${w.role.toUpperCase()}</span></td>
                  <td class="mono" style="font-size:1.05rem;">
                    ${pendingWageBal > 0 ? `
                      <span style="color:#f59e0b; font-weight:800;">₹ ${pendingWageBal.toLocaleString()}</span>
                      <br><button class="btn btn-secondary btn-sm" style="margin-top:0.2rem; font-weight:700; border-color:var(--color-accent); color:var(--color-accent); padding:0.15rem 0.45rem; font-size:0.75rem;" onclick="window.openSettleWorkerPendingBalanceModal('${w.id}')">💵 Pay Balance</button>
                    ` : '<span style="color:var(--color-completed); font-weight:700;">₹ 0</span>'}
                  </td>
                  <td><small style="font-weight:700;">${w.bankInfo?.accountNumber ? w.bankInfo.bankName + ' A/C: ' + w.bankInfo.accountNumber : 'Cash Settlement'}</small>${w.bankInfo?.upiId ? '<br><small style="color:var(--color-accent); font-weight:700;">UPI: ' + w.bankInfo.upiId + '</small>' : ''}</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700;">${currency} ${(w.contractAdvance || 0).toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-accent); font-weight:700;">${currency} ${(w.quickCashBalance || 0).toLocaleString()}</td>
                  <td>
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
                      ${paidRecord ? `
                        <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:var(--color-primary); color:var(--color-primary);" onclick="window.printWorkerPayslip('${w.id}', '${paidRecord.id}')">📄 Show Payslip</button>
                      ` : `
                        <button class="btn btn-primary btn-sm" style="font-weight:700; background:var(--color-primary);" onclick="window.openPayrollReviewModal('${w.id}')">💚 Pay Job Wages</button>
                      `}
                      <button class="btn btn-secondary btn-sm" style="border-color:var(--color-accent); color:var(--color-accent); font-weight:700;" onclick="window.openGiveWorkerQuickCashModal('${w.id}')">💵 + Give Cash</button>
                      <button class="btn btn-secondary btn-sm" onclick="window.openWorkerProfileModal('${w.id}')">📋 Full History</button>
                    </div>
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

function renderWagesView(container) {
  const target = container || getViewContainer();
  if (!target) return;
  const workers = store.getWorkers();
  const currency = store.data.traderInfo.currency;

  if (!window.wagesFilter) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunDate = new Date(today);
    sunDate.setDate(today.getDate() - dayOfWeek);
    const satDate = new Date(sunDate);
    satDate.setDate(sunDate.getDate() + 6);

    window.wagesFilter = {
      startDate: sunDate.toISOString().slice(0,10),
      endDate: satDate.toISOString().slice(0,10),
      workerId: '',
      role: ''
    };
  }

  const { startDate, endDate, workerId, role } = window.wagesFilter;

  const logs = (store.data.attendanceLogs || []).filter(a => {
    const d = a.date || store.getLotById(a.lotId)?.harvestDate || '';
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    if (workerId && a.workerId !== workerId) return false;
    if (role && a.role !== role) return false;
    return true;
  });

  const workerCardsHtml = workers.filter(w => !role || w.role === role).filter(w => !workerId || w.id === workerId).map(w => {
    const wLogs = logs.filter(a => a.workerId === w.id);
    const totalNuts = wLogs.reduce((sum, a) => {
      return sum + getWorkerNutShareForLot(w.id, a.lotId, w.role);
    }, 0);

    const lotContributions = wLogs.map(a => {
      const lot = store.getLotById(a.lotId);
      const client = lot ? store.getClientById(lot.clientId) : null;
      const farmName = client ? client.name : 'Farm';
      const grossNuts = lot ? Number(lot.grossHarvestCount || 0) : 0;
      
      const attendanceForLot = store.getAttendanceForLot(a.lotId);
      const sameRoleAtts = attendanceForLot.filter(att => {
        const wrk = store.getWorkerById(att.workerId);
        const r = att.role || (wrk ? wrk.role : '');
        return r === w.role;
      });

      const sameRoleCount = sameRoleAtts.length || 1;
      const workerShare = getWorkerNutShareForLot(w.id, a.lotId, w.role);

      return {
        lotNumber: lot ? lot.lotNumber : a.lotId,
        farmName: farmName,
        date: a.date || (lot ? lot.harvestDate : ''),
        grossNuts: grossNuts,
        sameRoleCount: sameRoleCount,
        workerShare: workerShare
      };
    });

    const qcBalance = w.quickCashBalance || 0;
    const paidRecord = (w.payrollHistory && w.payrollHistory.length > 0) ? w.payrollHistory[0] : null;
    const pendingBal = paidRecord ? (paidRecord.pendingBalance || 0) : 0;
    const amountPaid = paidRecord ? (paidRecord.amountPaid !== undefined ? paidRecord.amountPaid : paidRecord.netPaid) : 0;

    return `
      <div class="card-box" style="padding:1.25rem; margin-bottom:1rem; border-left:4px solid ${pendingBal > 0 ? '#f59e0b' : (paidRecord ? 'var(--color-primary)' : 'var(--color-accent)')};">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem;">
          <div style="cursor:pointer;" onclick="window.openWorkerContributionsModal('${w.id}', '${startDate}', '${endDate}')">
            <h4 style="margin:0; font-size:1.15rem; font-weight:700;">
              👷 ${w.name} <span class="badge badge-role">${w.role.toUpperCase()}</span>
              ${paidRecord ? (pendingBal > 0 ? '<span class="badge badge-transit" style="margin-left:0.5rem; background:#f59e0b; color:#fff; font-size:0.8rem; padding:0.25rem 0.6rem;">⚠️ Partial Paid (Paid: ₹ ' + amountPaid.toLocaleString() + ' | Bal: ₹ ' + pendingBal.toLocaleString() + ')</span>' : '<span class="badge badge-completed" style="margin-left:0.5rem; font-size:0.8rem; padding:0.25rem 0.6rem;">✅ Paid (₹ ' + paidRecord.netPaid.toLocaleString() + ')</span>') : ''}
            </h4>
            <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.2rem;">${w.phone} | ${w.settlementType === 'job_based' ? 'Job Settlement' : 'Weekly Saturday Pay'}</p>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.85rem; color:var(--text-muted);">Total Weekly Nut Count (${startDate} to ${endDate})</div>
            <div class="mono" style="font-size:1.6rem; font-weight:800; color:var(--color-primary);">${totalNuts.toLocaleString()} nuts</div>
            <div style="font-size:0.85rem; color:var(--color-accent); font-weight:700;">Unpaid Quick Cash: ₹ ${qcBalance.toLocaleString()}</div>
          </div>
        </div>

        <div style="margin-top:0.85rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; background:var(--bg-card-hover); padding:0.6rem 0.85rem; border-radius:var(--radius-md); cursor:pointer;" onclick="window.openWorkerContributionsModal('${w.id}', '${startDate}', '${endDate}')">
          <div style="font-size:0.85rem; font-weight:700; color:var(--color-primary);">
            🌾 Farm Nut Contributions: <strong>${lotContributions.length} Harvest Lots Worked</strong> (${totalNuts.toLocaleString()} nuts)
          </div>
          <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:var(--color-primary); color:var(--color-primary); padding:0.25rem 0.75rem; font-size:0.8rem;" onclick="event.stopPropagation(); window.openWorkerContributionsModal('${w.id}', '${startDate}', '${endDate}')">
            🔍 View Farm Lot Breakdown Pop-up
          </button>
        </div>

        <div style="margin-top:1rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="window.openGiveWorkerQuickCashModal('${w.id}')">💵 + Give Cash</button>
          ${pendingBal > 0 ? `
            <button class="btn btn-secondary btn-sm" style="font-weight:700; padding:0.5rem 1rem; border-color:var(--color-accent); color:var(--color-accent);" onclick="window.openSettleWorkerPendingBalanceModal('${w.id}', '${paidRecord.id}')">💵 Pay Balance</button>
          ` : ''}
          ${paidRecord ? `
            <button class="btn btn-secondary btn-sm" style="font-weight:700; padding:0.5rem 1rem; border-color:var(--color-primary); color:var(--color-primary);" onclick="window.printWorkerPayslip('${w.id}', '${paidRecord.id}')">📄 Show Payslip PDF</button>
          ` : `
            <button class="btn btn-primary btn-sm" style="font-weight:700; padding:0.5rem 1rem;" onclick="window.openPayrollReviewModal('${w.id}')">💚 Pay Wages</button>
          `}
        </div>
      </div>
    `;
  }).join('');

  const isFilterActive = !!(workerId || role);
  const showPanel = window.showWagesFilterPanel || false;

  target.innerHTML = `
    <div class="card-box" style="margin-bottom:1.5rem; padding:1.25rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:1rem;">
        <div>
          <h3 style="margin:0; font-size:1.2rem;">💚 4. ${getLang() === 'ta' ? 'வாராந்திர தொழிலாளர் கூலி பட்டுவாடா' : 'Weekly Labour Wages & Payroll'}</h3>
          <p style="margin:0.2rem 0 0 0; font-size:0.85rem; color:var(--text-muted);">Sunday to Saturday Week Period: <strong>${startDate}</strong> to <strong>${endDate}</strong></p>
        </div>
        <div style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" id="btnPrevWeek">◀ Prev Week</button>
          <button class="btn btn-secondary btn-sm" id="btnCurrentWeek">This Week</button>
          <button class="btn btn-secondary btn-sm" id="btnNextWeek">Next Week ▶</button>
          <button class="btn btn-secondary btn-sm" id="btnToggleWagesFilter" style="font-weight:700; ${isFilterActive ? 'border-color:var(--color-primary); color:var(--color-primary); background:rgba(5, 150, 105, 0.1);' : ''}">
            🔍 Filter ${isFilterActive ? '●' : ''}
          </button>
        </div>
      </div>

      <div id="wagesFilterPanel" style="display:${showPanel ? 'block' : 'none'}; margin-top:1rem; padding-top:1rem; border-top:1px solid var(--border-color);">
        <div style="font-weight:700; margin-bottom:0.75rem; font-size:0.95rem; color:var(--color-primary);">🔍 Filter Harvest Logs & Wages</div>
        <div class="form-row" style="margin-bottom:0;">
          <div class="form-group" style="margin-bottom:0.5rem;">
            <label>Filter by Worker Name</label>
            <select id="wagesFilterWorker" class="form-control">
              <option value="">-- All Workers --</option>
              ${workers.map(w => `<option value="${w.id}" ${w.id === workerId ? 'selected' : ''}>${w.name} (${w.role.toUpperCase()})</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0.5rem;">
            <label>Filter by Role</label>
            <select id="wagesFilterRole" class="form-control">
              <option value="">-- All Roles --</option>
              <option value="cutter" ${role === 'cutter' ? 'selected' : ''}>Cutter</option>
              <option value="picker" ${role === 'picker' ? 'selected' : ''}>Picker</option>
              <option value="driver" ${role === 'driver' ? 'selected' : ''}>Driver</option>
              <option value="dehusker" ${role === 'dehusker' ? 'selected' : ''}>Dehusker</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0.5rem;">
            <label>Start Date</label>
            <input type="date" id="wagesFilterStart" class="form-control" value="${startDate}" />
          </div>
          <div class="form-group" style="margin-bottom:0.5rem;">
            <label>End Date</label>
            <input type="date" id="wagesFilterEnd" class="form-control" value="${endDate}" />
          </div>
        </div>
      </div>
    </div>

    <div style="margin-bottom:1.5rem;">
      <h3 style="font-size:1.1rem; margin-bottom:1rem; color:var(--color-primary);">👨‍🌾 Worker Weekly Nut Contributions & Farm Breakdown</h3>
      ${workerCardsHtml || '<div style="color:var(--text-muted);">No worker logs match the filter criteria.</div>'}
    </div>

    <div class="card-box">
      <div class="card-box-header">
        <h3 style="font-size:1.15rem;">📋 Filtered Farm Harvest Logs</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Harvest Date</th>
              <th>Lot ID</th>
              <th>Farm Owner / Client</th>
              <th>Gross Count</th>
              <th>Net Accepted</th>
              <th>Labours Count</th>
              <th>Edit Nut Split</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${(() => {
              const filteredLotIds = [...new Set(logs.map(a => a.lotId))];
              const filteredLots = filteredLotIds.map(id => store.getLotById(id)).filter(Boolean);
              if (filteredLots.length === 0) return '<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:1.5rem;">No harvest lot entries match current filters.</td></tr>';
              return filteredLots.map(l => {
                const client = store.getClientById(l.clientId);
                const attLogs = store.getAttendanceForLot(l.id);
                const accepted = l.grossHarvestCount - (l.badNutCount || 0);
                return `
                  <tr style="cursor:pointer;" onclick="if(!event.target.closest('button')) window.openLotLaboursModal('${l.id}')">
                    <td>${l.harvestDate}</td>
                    <td class="mono" style="font-size:1.05rem;"><strong>${l.lotNumber}</strong></td>
                    <td><strong>${client ? client.name : 'Unknown'}</strong><br><small style="color:var(--text-muted);">${client ? client.location : ''}</small></td>
                    <td class="mono">${l.grossHarvestCount.toLocaleString()} nuts</td>
                    <td class="mono" style="color:var(--color-primary); font-weight:700;">${accepted.toLocaleString()} nuts</td>
                    <td><span class="badge badge-role">${attLogs.length} Labours Present</span></td>
                    <td>
                      <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:var(--color-primary); color:var(--color-primary);" onclick="event.stopPropagation(); window.openEditLotNutSplitModal('${l.id}')">
                        ✏️ Edit Nut Split
                      </button>
                    </td>
                    <td>
                      <button class="btn btn-primary btn-sm" style="font-weight:700;" onclick="event.stopPropagation(); window.openLotLaboursModal('${l.id}')">👁️ View Labour Details</button>
                    </td>
                  </tr>
                `;
              }).join('');
            })()}
          </tbody>
        </table>
      </div>
    </div>
  `;

  getEl('btnToggleWagesFilter')?.addEventListener('click', () => {
    window.showWagesFilterPanel = !window.showWagesFilterPanel;
    const panel = getEl('wagesFilterPanel');
    if (panel) {
      panel.style.display = window.showWagesFilterPanel ? 'block' : 'none';
    }
  });

  getEl('wagesFilterWorker')?.addEventListener('change', (e) => {
    window.wagesFilter.workerId = e.target.value;
    renderWagesView(container);
  });

  getEl('wagesFilterRole')?.addEventListener('change', (e) => {
    window.wagesFilter.role = e.target.value;
    renderWagesView(container);
  });

  getEl('wagesFilterStart')?.addEventListener('change', (e) => {
    window.wagesFilter.startDate = e.target.value;
    renderWagesView(container);
  });

  getEl('wagesFilterEnd')?.addEventListener('change', (e) => {
    window.wagesFilter.endDate = e.target.value;
    renderWagesView(container);
  });

  getEl('btnPrevWeek')?.addEventListener('click', () => {
    const currSun = new Date(window.wagesFilter.startDate);
    currSun.setDate(currSun.getDate() - 7);
    const currSat = new Date(currSun);
    currSat.setDate(currSun.getDate() + 6);
    window.wagesFilter.startDate = currSun.toISOString().slice(0,10);
    window.wagesFilter.endDate = currSat.toISOString().slice(0,10);
    renderWagesView(container);
  });

  getEl('btnNextWeek')?.addEventListener('click', () => {
    const currSun = new Date(window.wagesFilter.startDate);
    currSun.setDate(currSun.getDate() + 7);
    const currSat = new Date(currSun);
    currSat.setDate(currSun.getDate() + 6);
    window.wagesFilter.startDate = currSun.toISOString().slice(0,10);
    window.wagesFilter.endDate = currSat.toISOString().slice(0,10);
    renderWagesView(container);
  });

  getEl('btnCurrentWeek')?.addEventListener('click', () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const sunDate = new Date(today);
    sunDate.setDate(today.getDate() - dayOfWeek);
    const satDate = new Date(sunDate);
    satDate.setDate(sunDate.getDate() + 6);
    window.wagesFilter.startDate = sunDate.toISOString().slice(0,10);
    window.wagesFilter.endDate = satDate.toISOString().slice(0,10);
    renderWagesView(container);
  });
}

function renderStockView(container) {
  const target = container || getViewContainer();
  if (!target) return;

  const currency = store.data.traderInfo.currency;
  const lots = store.getLots();
  const sales = store.getSales();

  // 1. Total Harvested Coconut Stock (Inflow)
  const totalGrossHarvested = lots.reduce((sum, l) => sum + Number(l.grossHarvestCount || 0), 0);
  const totalBadNuts = lots.reduce((sum, l) => sum + Number(l.badNutCount || 0), 0);
  const totalAcceptedHarvestedNuts = totalGrossHarvested - totalBadNuts;

  // 2. Coconut Sales Outflow
  const coconutSales = sales.filter(s => s.type === 'coconut');
  const totalCoconutsSold = coconutSales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);

  // 3. Available Coconut Stock
  const availableCoconutStock = Math.max(0, totalAcceptedHarvestedNuts - totalCoconutsSold);

  // 4. Total Coir Husks Generated (Inflow: Every harvested accepted nut generates 1 coir husk)
  const totalHusksGenerated = totalAcceptedHarvestedNuts;

  // 5. Coir Husk Sales Outflow
  const huskSales = sales.filter(s => s.type === 'husk');
  const totalHusksSold = huskSales.reduce((sum, s) => sum + Number(s.huskQuantity || 0), 0);

  // 6. Available Coir Husk Stock
  const availableHuskStock = Math.max(0, totalHusksGenerated - totalHusksSold);

  target.innerHTML = `
    <!-- Live Stock Inventory Overview Cards -->
    <div class="kpi-grid" style="margin-bottom:1.5rem;">
      <div class="kpi-card" style="padding:1.25rem; border:2px solid var(--color-primary);">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:1rem; font-weight:700; color:var(--color-primary);">🥥 ${getLang() === 'ta' ? 'இருப்பில் உள்ள தேங்காய் (Available Coconuts)' : 'Available Dehusked Coconut Stock'}</span>
        </div>
        <div class="kpi-value" style="font-size:2.2rem; color:var(--color-primary);">${availableCoconutStock.toLocaleString()} nuts</div>
        <div class="kpi-subtext"><span style="color:var(--text-muted);">Harvested Inflow: +${totalAcceptedHarvestedNuts.toLocaleString()} | Sales Outflow: -${totalCoconutsSold.toLocaleString()}</span></div>
      </div>

      <div class="kpi-card" style="padding:1.25rem; border:2px solid var(--color-accent);">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:1rem; font-weight:700; color:var(--color-accent);">🌾 ${getLang() === 'ta' ? 'இருப்பில் உள்ள நார் மட்டை (Available Coir Husks)' : 'Available Coir Husk Stock'}</span>
        </div>
        <div class="kpi-value" style="font-size:2.2rem; color:var(--color-accent);">${availableHuskStock.toLocaleString()} husks</div>
        <div class="kpi-subtext"><span style="color:var(--text-muted);">Generated Inflow: +${totalHusksGenerated.toLocaleString()} | Sales Outflow: -${totalHusksSold.toLocaleString()}</span></div>
      </div>
    </div>

    <!-- Stock Flow Summary Ledger -->
    <div class="card-box" style="margin-bottom:1.5rem;">
      <div class="card-box-header">
        <h3 style="font-size:1.2rem;">📦 1. ${getLang() === 'ta' ? 'சரக்கு கணக்கு விவரம் (Live Stock Inflow & Sales Outflow)' : 'Live Commodity Stock & Pipeline Balance'}</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Commodity Item</th>
              <th>Harvested / Produced Inflow</th>
              <th>Sales Outflow</th>
              <th>Remaining Available Stock</th>
              <th>Inventory Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong style="font-size:1.1rem; color:var(--color-primary);">🥥 Dehusked Coconuts (தேங்காய்)</strong></td>
              <td class="mono" style="font-weight:700;">+ ${totalAcceptedHarvestedNuts.toLocaleString()} nuts</td>
              <td class="mono" style="color:var(--color-danger); font-weight:700;">- ${totalCoconutsSold.toLocaleString()} nuts</td>
              <td class="mono" style="color:var(--color-primary); font-weight:800; font-size:1.2rem;">${availableCoconutStock.toLocaleString()} nuts</td>
              <td>
                ${availableCoconutStock > 1000 ? '<span class="badge badge-completed">✅ Available in Yard</span>' : (availableCoconutStock > 0 ? '<span class="badge badge-warning">⚠️ Low Stock</span>' : '<span class="badge badge-danger">🔴 Out of Stock</span>')}
              </td>
            </tr>
            <tr>
              <td><strong style="font-size:1.1rem; color:var(--color-accent);">🌾 Raw Coir Husks (நார் மட்டை)</strong></td>
              <td class="mono" style="font-weight:700;">+ ${totalHusksGenerated.toLocaleString()} husks</td>
              <td class="mono" style="color:var(--color-danger); font-weight:700;">- ${totalHusksSold.toLocaleString()} husks</td>
              <td class="mono" style="color:var(--color-accent); font-weight:800; font-size:1.2rem;">${availableHuskStock.toLocaleString()} husks</td>
              <td>
                ${availableHuskStock > 1000 ? '<span class="badge badge-completed">✅ Available in Yard</span>' : (availableHuskStock > 0 ? '<span class="badge badge-warning">⚠️ Low Stock</span>' : '<span class="badge badge-danger">🔴 Out of Stock</span>')}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Active Farm Lots in Pipeline -->
    <div class="card-box">
      <div class="card-box-header">
        <h3 style="font-size:1.2rem;">🌴 2. ${getLang() === 'ta' ? 'அறுவடை லாட்கள் விவரம்' : 'Harvest Lots Stock Pipeline'}</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Lot ID</th>
              <th>Client Owner</th>
              <th>Harvest Date</th>
              <th>Gross Count</th>
              <th>Bad / Rejects</th>
              <th>Net Accepted Nuts</th>
              <th>Lot Stage / Status</th>
            </tr>
          </thead>
          <tbody>
            ${lots.length === 0 ? '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:1.5rem;">No harvest lots in pipeline.</td></tr>' : ''}
            ${lots.map(l => {
              const client = store.getClientById(l.clientId);
              const accepted = l.grossHarvestCount - (l.badNutCount || 0);
              return `
                <tr>
                  <td class="mono"><strong>${l.lotNumber}</strong></td>
                  <td><strong>${client ? client.name : 'Unknown'}</strong></td>
                  <td>${l.harvestDate}</td>
                  <td class="mono">${l.grossHarvestCount.toLocaleString()} nuts</td>
                  <td class="mono" style="color:var(--color-danger);">${(l.badNutCount || 0).toLocaleString()} nuts</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700;">${accepted.toLocaleString()} nuts</td>
                  <td><span class="badge ${l.status === 'completed' ? 'badge-completed' : 'badge-transit'}">${l.status === 'completed' ? 'Billed / Yard Stock' : 'In Yard Dehusking'}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSalesView(container) {
  const target = container || getViewContainer();
  if (!target) return;
  const sales = store.getSales();
  const expenses = store.getExpenses();
  const lots = store.getLots();
  const currency = store.data.traderInfo.currency;

  const coconutSales = sales.filter(s => s.type === 'coconut');
  const huskSales = sales.filter(s => s.type === 'husk');

  // Live Stock Calculation
  const totalGrossHarvested = lots.reduce((sum, l) => sum + Number(l.grossHarvestCount || 0), 0);
  const totalBadNuts = lots.reduce((sum, l) => sum + Number(l.badNutCount || 0), 0);
  const totalAcceptedHarvestedNuts = totalGrossHarvested - totalBadNuts;

  const totalCoconutsSold = coconutSales.reduce((sum, s) => sum + Number(s.quantity || 0), 0);
  const availableCoconutStock = Math.max(0, totalAcceptedHarvestedNuts - totalCoconutsSold);

  const totalHusksGenerated = totalAcceptedHarvestedNuts;
  const totalHusksSold = huskSales.reduce((sum, s) => sum + Number(s.huskQuantity || 0), 0);
  const availableHuskStock = Math.max(0, totalHusksGenerated - totalHusksSold);

  target.innerHTML = `
    <!-- Live Available Stock Overview Cards in Sales & Cash View -->
    <div class="kpi-grid" style="margin-bottom:1.5rem;">
      <div class="kpi-card" style="padding:1.1rem; border:2px solid var(--color-primary); background:rgba(5, 150, 105, 0.05);">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:0.95rem; font-weight:700; color:var(--color-primary);">🥥 ${getLang() === 'ta' ? 'இருப்பில் உள்ள தேங்காய் (Available Coconuts)' : 'Available Dehusked Coconut Stock'}</span>
        </div>
        <div class="kpi-value" style="font-size:2rem; color:var(--color-primary);">${availableCoconutStock.toLocaleString()} nuts</div>
        <div class="kpi-subtext"><span>Total Harvested: ${totalAcceptedHarvestedNuts.toLocaleString()} | Sold: ${totalCoconutsSold.toLocaleString()}</span></div>
      </div>

      <div class="kpi-card" style="padding:1.1rem; border:2px solid var(--color-accent); background:rgba(217, 119, 6, 0.05);">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:0.95rem; font-weight:700; color:var(--color-accent);">🌾 ${getLang() === 'ta' ? 'இருப்பில் உள்ள நார் மட்டை (Available Husks)' : 'Available Coir Husk Stock'}</span>
        </div>
        <div class="kpi-value" style="font-size:2rem; color:var(--color-accent);">${availableHuskStock.toLocaleString()} husks</div>
        <div class="kpi-subtext"><span>Total Generated: ${totalHusksGenerated.toLocaleString()} | Sold: ${totalHusksSold.toLocaleString()}</span></div>
      </div>
    </div>

    <div style="margin-bottom:1.5rem; display:flex; gap:1rem; flex-wrap:wrap;">
      <button class="btn btn-primary" style="font-size:1.05rem; padding:0.75rem 1.25rem; font-weight:700;" onclick="window.openNewCoconutSaleModal()">
        🥥 ${getLang() === 'ta' ? '+ தேங்காய் விற்பனை பதிவு' : '+ Log Coconut Sale'}
      </button>
      <button class="btn btn-secondary" style="font-size:1.05rem; padding:0.75rem 1.25rem; font-weight:700;" onclick="window.openNewHuskSaleModal()">
        🌾 ${getLang() === 'ta' ? '+ நார் மட்டை விற்பனை பதிவு' : '+ Log Coir Husk Sale'}
      </button>
      <button class="btn btn-secondary" style="font-size:1.05rem; padding:0.75rem 1.25rem; font-weight:700; border-color:var(--color-danger); color:var(--color-danger);" onclick="window.openNewExpenseModal()">
        ⛽ ${getLang() === 'ta' ? '+ டீசல் / செலவு பதிவு' : '+ Log Expense / Bata'}
      </button>
    </div>

    <div class="card-box" style="margin-bottom:1.5rem;">
      <div class="card-box-header">
        <h3 style="font-size:1.2rem;">🥥 1. ${getLang() === 'ta' ? 'தேங்காய் மொத்த விற்பனை' : 'Dehusked Coconut Order Deliveries'}</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Buyer / Customer</th>
              <th>Coconut Tail Type</th>
              <th>Nut Count & Weight</th>
              <th>Billing Rate</th>
              <th>Avg Weight / Nut</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${coconutSales.length === 0 ? '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:1.5rem;">No coconut sales recorded yet. Click "+ Log Coconut Sale" to add one.</td></tr>' : ''}
            ${coconutSales.map(s => {
              const typeBadge = s.coconutType === 'without_tail' ?
                '<span class="badge badge-warning" style="font-size:0.8rem;">Copra (Without Tail)</span>' :
                '<span class="badge badge-completed" style="font-size:0.8rem;">Public (With Tail)</span>';

              let qtyDisplay = `<strong>${s.quantity.toLocaleString()} nuts</strong>`;
              let unitDisplay = `₹ ${s.unitPrice.toFixed(2)} / nut`;
              let avgDisplay = '-';

              if (s.billingBasis === 'per_ton') {
                const tons = s.weightVal || (s.weightKg ? s.weightKg / 1000 : 0);
                qtyDisplay = `<strong>${s.quantity.toLocaleString()} nuts</strong><br><small style="color:var(--text-muted);">${tons} Tons (${(s.weightKg || tons * 1000).toLocaleString()} Kg)</small>`;
                unitDisplay = `₹ ${s.unitPrice.toLocaleString()} / Ton`;
                if (s.avgKgPerNut) {
                  const g = Math.round(s.avgKgPerNut * 1000);
                  avgDisplay = `<span class="badge badge-completed" style="font-size:0.75rem;">${s.avgKgPerNut.toFixed(3)} Kg (${g}g)</span>`;
                }
              } else if (s.billingBasis === 'per_kg') {
                const kg = s.weightKg || s.weightVal || 0;
                qtyDisplay = `<strong>${s.quantity.toLocaleString()} nuts</strong><br><small style="color:var(--text-muted);">${kg.toLocaleString()} Kg</small>`;
                unitDisplay = `₹ ${s.unitPrice.toFixed(2)} / Kg`;
                if (s.avgKgPerNut) {
                  const g = Math.round(s.avgKgPerNut * 1000);
                  avgDisplay = `<span class="badge badge-completed" style="font-size:0.75rem;">${s.avgKgPerNut.toFixed(3)} Kg (${g}g)</span>`;
                }
              }

              return `
                <tr>
                  <td>${s.date}</td>
                  <td><strong style="font-size:1.05rem;">${s.buyerName}</strong></td>
                  <td>${typeBadge}</td>
                  <td class="mono">${qtyDisplay}</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700;">${unitDisplay}</td>
                  <td>${avgDisplay}</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700; font-size:1.1rem;">${currency} ${s.totalRevenue.toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- 2. Coir Husk Sales Table -->
    <div class="card-box" style="margin-bottom:1.5rem;">
      <div class="card-box-header">
        <h3 style="font-size:1.2rem;">🌾 2. ${getLang() === 'ta' ? 'நார் மட்டை ஆலை விற்பனை' : 'Coir Husk Mill Deliveries'}</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Coir Mill Name</th>
              <th>Husk Classification</th>
              <th>Husk Quantity</th>
              <th>Rate / 1,000 Husks</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            ${huskSales.length === 0 ? '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:1.5rem;">No coir husk sales recorded yet. Click "+ Log Coir Husk Sale" to add one.</td></tr>' : ''}
            ${huskSales.map(s => {
              const huskBadge = s.huskCategory === 'black_husk' ?
                '<span class="badge badge-danger" style="font-size:0.75rem;">Black / Dry Husk</span>' :
                '<span class="badge badge-completed" style="font-size:0.75rem;">Green Husk</span>';

              return `
                <tr>
                  <td>${s.date}</td>
                  <td><strong style="font-size:1.05rem;">${s.coirMillName}</strong></td>
                  <td>${huskBadge}</td>
                  <td class="mono">${(s.huskQuantity || 0).toLocaleString()} husks</td>
                  <td class="mono">${currency} ${(s.unitPricePer1000 || 0).toLocaleString()} / 1k</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700; font-size:1.1rem;">${currency} ${(s.totalRevenue || 0).toLocaleString()}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <div class="card-box">
      <div class="card-box-header">
        <h3 style="font-size:1.2rem;">🚚 3. ${getLang() === 'ta' ? 'டீசல் செலவுகள் & தொழிலாளர் பட்டா' : 'Operational Expenses & Worker Bata Ledger'}</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Notes</th>
            </tr>
          </thead>
            ${expenses.map(e => `
              <tr>
                <td>${e.date}</td>
                <td><strong>${e.category}</strong></td>
                <td class="mono" style="color:var(--color-danger); font-weight:700; font-size:1.1rem;">${currency} ${e.amount.toLocaleString()}</td>
                <td><span class="badge badge-role">${e.paymentMethod}</span></td>
                <td><small style="color:var(--text-muted);">${e.notes || '-'}</small></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getAccountingLedgerItems(startDate, endDate, typeFilter, methodFilter) {
  const items = [];

  // 1. Sales Income (Coconut & Husk Sales)
  const sales = store.getSales();
  sales.forEach(s => {
    const isHusk = s.type === 'husk';
    items.push({
      id: s.id,
      date: s.date,
      type: 'income_sale',
      typeLabel: isHusk ? '🌾 Husk Sale' : '🥥 Coconut Sale',
      typeBadge: 'badge-completed',
      partyName: isHusk ? (s.coirMillName || 'Coir Mill') : (s.buyerName || 'Wholesale Buyer'),
      particulars: isHusk ? ('Coir Husk Sale (' + (s.huskQuantity || 0).toLocaleString() + ' husks @ ₹' + s.unitPricePer1000 + '/1k)') : ((s.coconutGrade || 'Coconuts') + ' (' + (s.quantity || 0).toLocaleString() + ' nuts @ ₹' + s.unitPrice + ')'),
      credit: s.totalRevenue || 0,
      debit: 0,
      method: s.paymentMethod || 'UPI'
    });
  });

  // 2. Client Farm Settlement Bills Payouts
  const lots = store.getLots();
  lots.forEach(l => {
    const bill = store.getBillByLotId(l.id);
    const client = store.getClientById(l.clientId);
    if (bill) {
      const history = bill.paymentHistory && bill.paymentHistory.length > 0 ? bill.paymentHistory : [
        { id: 'bill_pmt_' + bill.id, date: bill.billDate, amount: bill.amountPaid !== undefined ? bill.amountPaid : bill.netPayable, method: bill.paymentMethod || 'UPI', notes: 'Bill settlement' }
      ];

      history.forEach(pmt => {
        items.push({
          id: pmt.id || ('pmt_' + Math.random()),
          date: pmt.date || bill.billDate,
          type: 'client_payout',
          typeLabel: '👨‍🌾 Client Bill Payment',
          typeBadge: 'badge-transit',
          partyName: client ? client.name : 'Farm Owner',
          particulars: `Farm Settlement Bill (${bill.billNumber}) ${pmt.notes ? '- ' + pmt.notes : ''}`,
          credit: 0,
          debit: pmt.amount || bill.netPayable || 0,
          method: pmt.method || bill.paymentMethod || 'UPI'
        });
      });
    } else {
      const rate = client ? (client.ratePer1000Nuts || 12500) : 12500;
      const estimatedCost = (l.grossHarvestCount / 1000) * rate;
      items.push({
        id: 'unbilled_' + l.id,
        date: l.harvestDate,
        type: 'client_payout',
        typeLabel: '👨‍🌾 Unbilled Farm Lot',
        typeBadge: 'badge-warning',
        partyName: client ? client.name : 'Farm Owner',
        particulars: `Estimated Client Payable (${l.lotNumber} - ${l.grossHarvestCount.toLocaleString()} nuts)`,
        credit: 0,
        debit: estimatedCost,
        method: 'Pending Bill'
      });
    }
  });

  // 3. Labour Wage Payouts
  const workers = store.getWorkers();
  let hasWorkerPayroll = false;
  workers.forEach(w => {
    if (w.payrollHistory && w.payrollHistory.length > 0) {
      hasWorkerPayroll = true;
      w.payrollHistory.forEach(payout => {
        const history = payout.paymentHistory && payout.paymentHistory.length > 0 ? payout.paymentHistory : [
          { id: 'w_pmt_' + payout.id, date: payout.date, amount: payout.amountPaid !== undefined ? payout.amountPaid : payout.netPaid, method: 'Cash', notes: 'Wage payout' }
        ];

        history.forEach(pmt => {
          items.push({
            id: pmt.id || ('wpmt_' + Math.random()),
            date: pmt.date || payout.date,
            type: 'labour_wage',
            typeLabel: '👷 Labour Wage Payout',
            typeBadge: 'badge-role',
            partyName: `${w.name} (${w.role.toUpperCase()})`,
            particulars: `Weekly Wage Payout (${payout.period || 'Saturday'}) ${pmt.notes ? '- ' + pmt.notes : ''}`,
            credit: 0,
            debit: pmt.amount || 0,
            method: pmt.method || 'Cash'
          });
        });
      });
    }
  });

  if (!hasWorkerPayroll) {
    lots.forEach(l => {
      const lBreakdown = store.calculateLabourBreakdown(l.grossHarvestCount);
      items.push({
        id: 'labour_est_' + l.id,
        date: l.harvestDate,
        type: 'labour_wage',
        typeLabel: '👷 Estimated Labour Wage',
        typeBadge: 'badge-role',
        partyName: 'Harvest Labour Team',
        particulars: `Labour Wages for ${l.lotNumber} (${l.grossHarvestCount.toLocaleString()} nuts)`,
        credit: 0,
        debit: lBreakdown.totalLabourWage,
        method: 'Piece-Rate'
      });
    });
  }

  // 4. Operational Overhead Expenses
  const expenses = store.getExpenses();
  expenses.forEach(e => {
    items.push({
      id: e.id,
      date: e.date,
      type: 'expense',
      typeLabel: '🚚 Operational Expense',
      typeBadge: 'badge-danger',
      partyName: e.category || 'Field Overhead',
      particulars: `${e.category} ${e.notes ? ' (' + e.notes + ')' : ''}`,
      credit: 0,
      debit: e.amount || 0,
      method: e.paymentMethod || 'Cash'
    });
  });

  // 5. Quick Cash Advances Given to Farmers
  store.getClients().forEach(c => {
    (c.quickCashHistory || []).forEach(q => {
      items.push({
        id: q.id,
        date: q.date,
        type: 'quick_cash_client',
        typeLabel: '💵 Farmer Quick Cash',
        typeBadge: 'badge-warning',
        partyName: c.name,
        particulars: `Quick Cash Advance given ${q.notes ? ' (' + q.notes + ')' : ''}`,
        credit: 0,
        debit: q.amount || 0,
        method: 'Cash'
      });
    });
  });

  // 6. Quick Cash Advances Given to Workers
  store.getWorkers().forEach(w => {
    (w.quickCashHistory || []).forEach(q => {
      items.push({
        id: q.id,
        date: q.date,
        type: 'quick_cash_worker',
        typeLabel: '💵 Worker Quick Cash',
        typeBadge: 'badge-warning',
        partyName: `${w.name} (${w.role.toUpperCase()})`,
        particulars: `Quick Cash Advance given ${q.notes ? ' (' + q.notes + ')' : ''}`,
        credit: 0,
        debit: q.amount || 0,
        method: 'Cash'
      });
    });
  });

  // Apply filters
  let filtered = items;
  if (startDate) filtered = filtered.filter(i => i.date >= startDate);
  if (endDate) filtered = filtered.filter(i => i.date <= endDate);
  if (typeFilter && typeFilter !== 'all') {
    if (typeFilter === 'income') filtered = filtered.filter(i => i.credit > 0);
    else if (typeFilter === 'outflow') filtered = filtered.filter(i => i.debit > 0);
    else filtered = filtered.filter(i => i.type === typeFilter);
  }
  if (methodFilter && methodFilter !== 'all') {
    filtered = filtered.filter(i => i.method === methodFilter);
  }

  // Sort descending by date
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  return filtered;
}

function renderFinanceView(container) {
  const target = container || getViewContainer();
  if (!target) return;
  const currency = store.data.traderInfo.currency;

  if (!window.financeFilter) {
    window.financeFilter = {
      startDate: '',
      endDate: '',
      typeFilter: 'all',
      methodFilter: 'all'
    };
  }

  const { startDate, endDate, typeFilter, methodFilter } = window.financeFilter;
  const ledgerItems = getAccountingLedgerItems(startDate, endDate, typeFilter, methodFilter);

  // Totals calculation
  const totalInflow = ledgerItems.reduce((sum, i) => sum + i.credit, 0);
  const totalOutflow = ledgerItems.reduce((sum, i) => sum + i.debit, 0);
  const netBalance = totalInflow - totalOutflow;

  const clientPayoutTotal = ledgerItems.filter(i => i.type === 'client_payout').reduce((sum, i) => sum + i.debit, 0);
  const labourWageTotal = ledgerItems.filter(i => i.type === 'labour_wage').reduce((sum, i) => sum + i.debit, 0);
  const expenseTotal = ledgerItems.filter(i => i.type === 'expense').reduce((sum, i) => sum + i.debit, 0);
  const quickCashTotal = ledgerItems.filter(i => i.type.startsWith('quick_cash')).reduce((sum, i) => sum + i.debit, 0);

  const isFilterActive = !!(startDate || endDate || (typeFilter && typeFilter !== 'all') || (methodFilter && methodFilter !== 'all'));
  const showPanel = window.showFinanceFilterPanel || false;

  target.innerHTML = `
    <!-- Top 4 Financial Accounting KPI Cards -->
    <div class="kpi-grid" style="margin-bottom:1.5rem;">
      <div class="kpi-card" style="padding:1.25rem;">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:1rem; font-weight:700;">🟢 ${getLang() === 'ta' ? 'மொத்த வருவாய் (Inflow)' : 'Total Revenue (Inflow)'}</span>
        </div>
        <div class="kpi-value" style="font-size:1.8rem; color:var(--color-primary);">${currency} ${totalInflow.toLocaleString()}</div>
        <div class="kpi-subtext"><span>Coconuts + Husk Sales Revenue</span></div>
      </div>

      <div class="kpi-card" style="padding:1.25rem;">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:1rem; font-weight:700;">🔴 ${getLang() === 'ta' ? 'மொத்த செலவினங்கள் (Outflow)' : 'Total Outflows Paid'}</span>
        </div>
        <div class="kpi-value" style="font-size:1.8rem; color:var(--color-danger);">${currency} ${totalOutflow.toLocaleString()}</div>
        <div class="kpi-subtext"><span>Client Bills + Wages + Expenses</span></div>
      </div>

      <div class="kpi-card" style="padding:1.25rem;">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:1rem; font-weight:700;">💵 ${getLang() === 'ta' ? 'வழங்கப்பட்ட முன்பணம்' : 'Quick Cash Advances'}</span>
        </div>
        <div class="kpi-value" style="font-size:1.8rem; color:var(--color-accent);">${currency} ${quickCashTotal.toLocaleString()}</div>
        <div class="kpi-subtext"><span>Farmers + Workers Quick Cash</span></div>
      </div>

      <div class="kpi-card" style="padding:1.25rem; background:linear-gradient(135deg, rgba(5,150,105,0.12), rgba(37,99,235,0.12)); border:2px solid var(--color-primary);">
        <div class="kpi-header">
          <span class="kpi-title" style="font-size:1rem; font-weight:700; color:var(--color-primary);">📈 ${getLang() === 'ta' ? 'நிகர வரவு செலவு இருப்பு' : 'Net Trader Profit / Cash Flow'}</span>
        </div>
        <div class="kpi-value" style="font-size:2rem; color:${netBalance >= 0 ? 'var(--color-primary)' : 'var(--color-danger)'};">${currency} ${netBalance.toLocaleString()}</div>
        <div class="kpi-subtext"><span>Net Inflow - Net Outflow Balance</span></div>
      </div>
    </div>

    <!-- Category Breakdown Summary Bar -->
    <div class="card-box" style="margin-bottom:1.5rem; padding:1rem;">
      <div style="font-size:0.9rem; font-weight:700; color:var(--color-primary); margin-bottom:0.6rem;">📊 Outflow Categories Summary Breakdown:</div>
      <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:1rem; font-size:0.85rem;">
        <div>🌾 Client Settlements: <strong class="mono" style="color:var(--color-primary);">₹ ${clientPayoutTotal.toLocaleString()}</strong></div>
        <div>👷 Labour Wages: <strong class="mono" style="color:var(--color-primary);">₹ ${labourWageTotal.toLocaleString()}</strong></div>
        <div>🚚 Operational Expenses: <strong class="mono" style="color:var(--color-danger);">₹ ${expenseTotal.toLocaleString()}</strong></div>
        <div>💵 Quick Cash Disbursed: <strong class="mono" style="color:var(--color-accent);">₹ ${quickCashTotal.toLocaleString()}</strong></div>
      </div>
    </div>

    <!-- Master Accounting General Ledger Section -->
    <div class="card-box">
      <div class="card-box-header" style="flex-wrap:wrap; gap:0.75rem;">
        <h3 style="font-size:1.2rem;">🏛️ ${getLang() === 'ta' ? 'அனைத்து கணக்கு வரவு செலவு ஏடு (General Ledger)' : 'General Accounting Ledger Book'} (${ledgerItems.length} Transactions)</h3>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button class="btn btn-secondary btn-sm" id="btnToggleFinanceFilter" style="font-weight:700; ${isFilterActive ? 'border-color:var(--color-primary); color:var(--color-primary); background:rgba(5, 150, 105, 0.1);' : ''}">
            🔍 ${getLang() === 'ta' ? 'வடிகட்டி' : 'Filter Ledger'} ${isFilterActive ? '●' : ''}
          </button>
          <button class="btn btn-secondary btn-sm" style="font-weight:700;" onclick="window.exportLedgerCSV()">📥 Export Ledger CSV</button>
        </div>
      </div>

      <!-- Collapsible Ledger Filter Bar -->
      <div id="financeFilterPanel" style="display:${showPanel ? 'block' : 'none'}; background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; border:1px solid var(--border-color);">
        <div class="form-row" style="margin-bottom:0.5rem;">
          <div class="form-group" style="margin-bottom:0.3rem;">
            <label style="font-weight:700; font-size:0.85rem;">Transaction Category</label>
            <select id="finTypeFilter" class="form-control">
              <option value="all" ${typeFilter === 'all' ? 'selected' : ''}>-- All Transactions --</option>
              <option value="income" ${typeFilter === 'income' ? 'selected' : ''}>🟢 Revenue Inflows Only</option>
              <option value="outflow" ${typeFilter === 'outflow' ? 'selected' : ''}>🔴 Outflows / Expenses Only</option>
              <option value="income_sale" ${typeFilter === 'income_sale' ? 'selected' : ''}>🥥 Sales Income</option>
              <option value="client_payout" ${typeFilter === 'client_payout' ? 'selected' : ''}>👨‍🌾 Client Bill Payouts</option>
              <option value="labour_wage" ${typeFilter === 'labour_wage' ? 'selected' : ''}>👷 Labour Wage Payouts</option>
              <option value="expense" ${typeFilter === 'expense' ? 'selected' : ''}>🚚 Operational Overhead</option>
              <option value="quick_cash_client" ${typeFilter === 'quick_cash_client' ? 'selected' : ''}>💵 Farmer Quick Cash</option>
              <option value="quick_cash_worker" ${typeFilter === 'quick_cash_worker' ? 'selected' : ''}>💵 Worker Quick Cash</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0.3rem;">
            <label style="font-weight:700; font-size:0.85rem;">Payment Method</label>
            <select id="finMethodFilter" class="form-control">
              <option value="all" ${methodFilter === 'all' ? 'selected' : ''}>-- All Payment Modes --</option>
              <option value="Cash" ${methodFilter === 'Cash' ? 'selected' : ''}>Cash</option>
              <option value="UPI" ${methodFilter === 'UPI' ? 'selected' : ''}>UPI</option>
              <option value="Bank Transfer" ${methodFilter === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
              <option value="Pay Later" ${methodFilter === 'Pay Later' ? 'selected' : ''}>Pay Later / Pending</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:0.3rem;">
            <label style="font-weight:700; font-size:0.85rem;">From Date</label>
            <input type="date" id="finStartFilter" class="form-control" value="${startDate}" />
          </div>
          <div class="form-group" style="margin-bottom:0.3rem;">
            <label style="font-weight:700; font-size:0.85rem;">To Date</label>
            <input type="date" id="finEndFilter" class="form-control" value="${endDate}" />
          </div>
        </div>
        ${isFilterActive ? `
          <div style="display:flex; justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm" style="color:var(--color-danger); border-color:var(--color-danger);" onclick="window.clearFinanceFilters()">Reset Filters</button>
          </div>
        ` : ''}
      </div>

      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction Type</th>
              <th>Party / Account Name</th>
              <th>Particulars / Description</th>
              <th style="text-align:right;">Debit / Outflow (${currency})</th>
              <th style="text-align:right;">Credit / Inflow (${currency})</th>
              <th>Payment Mode</th>
            </tr>
          </thead>
          <tbody>
            ${ledgerItems.length === 0 ? '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:2rem;">No accounting transactions logged yet.</td></tr>' : ''}
            ${ledgerItems.map(item => `
              <tr>
                <td style="white-space:nowrap;">${item.date}</td>
                <td><span class="badge ${item.typeBadge}" style="font-size:0.75rem;">${item.typeLabel}</span></td>
                <td><strong style="font-size:1.05rem;">${item.partyName}</strong></td>
                <td><small style="color:var(--text-muted);">${item.particulars}</small></td>
                <td class="mono" style="text-align:right; font-weight:700; ${item.debit > 0 ? 'color:var(--color-danger);' : ''}">
                  ${item.debit > 0 ? currency + ' ' + item.debit.toLocaleString() : '-'}
                </td>
                <td class="mono" style="text-align:right; font-weight:700; ${item.credit > 0 ? 'color:var(--color-primary); font-size:1.05rem;' : ''}">
                  ${item.credit > 0 ? currency + ' ' + item.credit.toLocaleString() : '-'}
                </td>
                <td><span class="badge badge-role" style="font-size:0.75rem;">${item.method}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  getEl('btnToggleFinanceFilter')?.addEventListener('click', () => {
    window.showFinanceFilterPanel = !window.showFinanceFilterPanel;
    renderFinanceView(container);
  });

  getEl('finTypeFilter')?.addEventListener('change', (e) => {
    window.financeFilter.typeFilter = e.target.value;
    renderFinanceView(container);
  });

  getEl('finMethodFilter')?.addEventListener('change', (e) => {
    window.financeFilter.methodFilter = e.target.value;
    renderFinanceView(container);
  });

  getEl('finStartFilter')?.addEventListener('change', (e) => {
    window.financeFilter.startDate = e.target.value;
    renderFinanceView(container);
  });

  getEl('finEndFilter')?.addEventListener('change', (e) => {
    window.financeFilter.endDate = e.target.value;
    renderFinanceView(container);
  });
}

window.clearFinanceFilters = function() {
  window.financeFilter = { startDate: '', endDate: '', typeFilter: 'all', methodFilter: 'all' };
  renderFinanceView();
};

function exportLedgerCSV() {
  const { startDate, endDate, typeFilter, methodFilter } = window.financeFilter || {};
  const items = getAccountingLedgerItems(startDate, endDate, typeFilter, methodFilter);

  if (items.length === 0) {
    alert("No accounting entries to export.");
    return;
  }

  let csv = "Date,Transaction Type,Party Name,Particulars,Debit (Outflow Rs),Credit (Inflow Rs),Payment Method\n";
  items.forEach(i => {
    const party = `"${(i.partyName || '').replace(/"/g, '""')}"`;
    const part = `"${(i.particulars || '').replace(/"/g, '""')}"`;
    csv += `${i.date},"${i.typeLabel}",${party},${part},${i.debit},${i.credit},"${i.method}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `cocotrader_finance_ledger_${new Date().toISOString().slice(0,10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

window.renderFinanceView = renderFinanceView;
window.exportLedgerCSV = exportLedgerCSV;

function renderRatesView(container) {
  const target = container || getViewContainer();
  if (!target) return;
  const rates = store.getMarketRates();
  const currency = store.data.traderInfo.currency;

  target.innerHTML = `
    <div class="card-box" style="margin-bottom:1.5rem;">
      <div class="card-box-header">
        <h3>1. ${getLang() === 'ta' ? 'தேங்காய் விற்பனை சந்தை விலை' : 'Dehusked Coconut Selling Market Rates'}</h3>
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
        <h3>2. ${getLang() === 'ta' ? 'தொழிலாளர் கூலி விவரம்' : 'Default Labour Piece-Rate Wage Structure'}</h3>
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

// QUICK CASH & PROFILE MODALS
function openGiveClientQuickCashModal(clientId) {
  const client = store.getClientById(clientId) || store.getClients()[0];
  if (!client) return;
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `💵 Issue Quick Cash: ${client.name}`;
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="giveClientQuickCashForm">
        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
          <p>Current Unpaid Quick Cash: <strong class="mono" style="color:var(--color-accent); font-size:1.1rem;">₹ ${(client.quickCashBalance || 0).toLocaleString()}</strong></p>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Quick cash given will automatically deduct on the next settlement bill.</p>
        </div>
        <div class="form-group">
          <label>Quick Cash Amount (₹)</label>
          <input type="number" id="qcashAmount" class="form-control mono" placeholder="2000" required />
        </div>
        <div class="form-group">
          <label>Notes / Purpose</label>
          <input type="text" id="qcashNotes" class="form-control" placeholder="e.g. Mid-cycle cash for fertilizer purchase" required />
        </div>
        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Issue Quick Cash</button>
        </div>
      </form>
    `;
    getEl('giveClientQuickCashForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const amt = Number(getEl('qcashAmount').value);
      const notes = getEl('qcashNotes').value;
      store.giveClientQuickCash(client.id, amt, notes);
      closeModal();
      alert(`₹ ${amt.toLocaleString()} Quick Cash issued to ${client.name}!`);
      renderView(currentTab);
    });
  }
  openModal();
}

function openGiveWorkerQuickCashModal(workerId) {
  const worker = store.getWorkerById(workerId) || store.getWorkers()[0];
  if (!worker) return;
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `💵 Issue Quick Cash: ${worker.name}`;
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="giveWorkerQuickCashForm">
        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
          <p>Current Unpaid Quick Cash: <strong class="mono" style="color:var(--color-accent); font-size:1.1rem;">₹ ${(worker.quickCashBalance || 0).toLocaleString()}</strong></p>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">Quick cash will be automatically pre-filled for deduction on Saturday / Job payday.</p>
        </div>
        <div class="form-group">
          <label>Quick Cash Amount (₹)</label>
          <input type="number" id="qcashWorkerAmount" class="form-control mono" placeholder="1000" required />
        </div>
        <div class="form-group">
          <label>Notes / Reason</label>
          <input type="text" id="qcashWorkerNotes" class="form-control" placeholder="e.g. Pre-payday emergency cash" required />
        </div>
        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Issue Quick Cash</button>
        </div>
      </form>
    `;
    getEl('giveWorkerQuickCashForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const amt = Number(getEl('qcashWorkerAmount').value);
      const notes = getEl('qcashWorkerNotes').value;
      store.giveWorkerQuickCash(worker.id, amt, notes);
      closeModal();
      alert(`₹ ${amt.toLocaleString()} Quick Cash issued to ${worker.name}!`);
      renderView(currentTab);
    });
  }
  openModal();
}

function getWorkerNutShareForLot(workerId, lotId, targetRole) {
  const lot = store.getLotById(lotId);
  if (!lot) return 0;
  
  const attendanceForLot = store.getAttendanceForLot(lotId);
  const myAtt = attendanceForLot.find(a => a.workerId === workerId);
  if (myAtt && myAtt.allocatedNutCount !== undefined && myAtt.allocatedNutCount !== null) {
    return Number(myAtt.allocatedNutCount);
  }

  const worker = store.getWorkerById(workerId);
  const effectiveRole = targetRole || (worker ? worker.role : '');

  const sameRoleAtts = attendanceForLot.filter(a => {
    const w = store.getWorkerById(a.workerId);
    const r = a.role || (w ? w.role : '');
    return r === effectiveRole;
  });

  const sameRoleCount = sameRoleAtts.length || 1;
  const grossNuts = Number(lot.grossHarvestCount || 0);

  return Math.round(grossNuts / sameRoleCount);
}

function openPayrollReviewModal(workerId) {
  const worker = store.getWorkerById(workerId);
  if (!worker) return;

  const attendance = (store.data.attendanceLogs || []).filter(a => a.workerId === workerId);
  const lotIds = [...new Set(attendance.map(a => a.lotId))];
  const lots = lotIds.map(id => store.getLotById(id)).filter(Boolean);

  const defaultNutsHandled = attendance.reduce((sum, a) => {
    return sum + getWorkerNutShareForLot(workerId, a.lotId, worker.role);
  }, 0);

  const currentQuickCashBalance = worker.quickCashBalance || 0;

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `Review Payroll & Nut Sharing: ${worker.name} (${worker.role.toUpperCase()})`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="payrollReviewForm">
        <!-- Highlighted Quick Cash Balance Header -->
        <div style="background:var(--bg-card-hover); border:2px solid var(--color-accent); padding:0.85rem 1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <span style="font-weight:700; color:var(--color-accent); font-size:1.05rem;">💵 Unpaid Quick Cash Balance</span>
            <p style="margin:0; font-size:0.85rem; color:var(--text-muted);">Mid-cycle advance given to ${worker.name}</p>
          </div>
          <div class="mono" style="font-size:1.5rem; font-weight:800; color:var(--color-accent);">
            ₹ ${currentQuickCashBalance.toLocaleString()}
          </div>
        </div>

        <div class="form-group" style="margin-bottom:1.25rem;">
          <label style="color:var(--color-primary); font-weight:700;">Number of Nuts Picked / Handled by ${worker.name}</label>
          <input type="number" id="payNutCount" class="form-control mono" value="${defaultNutsHandled}" style="font-size:1.15rem; font-weight:700;" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label style="color:var(--color-primary); font-weight:700;">Gross Piece-Rate Wage (₹) [EDITABLE]</label>
            <input type="number" id="payGrossWage" class="form-control mono" value="0" required />
          </div>
          <div class="form-group">
            <label style="color:var(--color-accent); font-weight:700;">Quick Cash Adjustment (₹) [EDITABLE]</label>
            <input type="number" id="payQuickCashDeduct" class="form-control mono" value="${currentQuickCashBalance}" max="${currentQuickCashBalance}" />
            <small style="color:var(--text-muted);">Available Quick Cash: ₹ ${currentQuickCashBalance.toLocaleString()}</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Allowances / Bonus (₹)</label>
            <input type="number" id="payAllowance" class="form-control mono" value="0" />
          </div>
          <div class="form-group">
            <label>Other Deductions (₹)</label>
            <input type="number" id="payDeductions" class="form-control mono" value="0" />
          </div>
        </div>

        <div style="background:var(--bg-card-hover); padding:0.85rem 1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.25rem;">
          <h4 style="margin:0 0 0.5rem 0; color:var(--color-primary); font-size:1.05rem;">💳 Wage Payout Mode & Partial Pay Options</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Payout Option</label>
              <select id="payPmtType" class="form-control" style="font-weight:700;">
                <option value="full" selected>Full Wage Payout (உடனே முழு கூலியும் வழங்குதல்)</option>
                <option value="partial">Partial Payout (பகுதி கூலி பட்டுவாடா & பாக்கி)</option>
              </select>
            </div>
            <div class="form-group">
              <label style="color:var(--color-primary); font-weight:700;">Amount Paid Now to Worker (₹)</label>
              <input type="number" id="payAmountPaidNow" class="form-control mono" style="font-size:1.1rem; font-weight:700;" value="0" />
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>Payslip Remarks / Notes</label>
          <input type="text" id="payNotes" class="form-control" value="${worker.settlementType === 'job_based' ? 'Job dehusking settlement payout' : 'Weekly Saturday payroll settlement'}" />
        </div>

        <div class="calc-summary-box" id="payrollPreviewBox"></div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight:700;">Confirm & Pay Wages</button>
        </div>
      </form>
    `;

    const nutInp = getEl('payNutCount');
    const grossInp = getEl('payGrossWage');
    const qcInp = getEl('payQuickCashDeduct');
    const allowInp = getEl('payAllowance');
    const dedInp = getEl('payDeductions');
    const payPmtTypeSel = getEl('payPmtType');
    const payPaidNowInp = getEl('payAmountPaidNow');
    const previewBox = getEl('payrollPreviewBox');
    const equalShareBtn = getEl('btnEqualShare');

    const updateCalculatedWage = () => {
      const nuts = Number(nutInp.value) || 0;
      const rate = worker.wageRatePer1000 || 2500;
      const calculatedWage = Math.round((nuts / 1000) * rate);
      grossInp.value = calculatedWage;
      updateCalc();
    };

    const updateCalc = () => {
      const g = Number(grossInp.value) || 0;
      const qc = Number(qcInp.value) || 0;
      const al = Number(allowInp.value) || 0;
      const d = Number(dedInp.value) || 0;
      const net = (g + al) - (qc + d);

      const isPartial = payPmtTypeSel && payPmtTypeSel.value === 'partial';
      let amountPaidNow = net;
      let pendingBal = 0;

      if (isPartial) {
        amountPaidNow = Math.min(net, Number(payPaidNowInp.value) || 0);
        pendingBal = Math.max(0, net - amountPaidNow);
      } else {
        if (payPaidNowInp) payPaidNowInp.value = net;
        amountPaidNow = net;
        pendingBal = 0;
      }

      if (previewBox) {
        previewBox.innerHTML = `
          <h4>Net Pay Summary for ${worker.name}</h4>
          <div class="calc-summary-row"><span>Allocated Nut Count:</span><span class="mono">${Number(nutInp.value || 0).toLocaleString()} nuts</span></div>
          <div class="calc-summary-row"><span>Gross Earnings:</span><span class="mono">₹ ${g.toLocaleString()}</span></div>
          <div class="calc-summary-row" style="color:var(--color-accent);"><span>(-) Quick Cash Deducted:</span><span class="mono">₹ ${qc.toLocaleString()}</span></div>
          <div class="calc-summary-row"><span>(+) Allowances:</span><span class="mono">₹ ${al.toLocaleString()}</span></div>
          <div class="calc-summary-row"><span>(-) Deductions:</span><span class="mono">₹ ${d.toLocaleString()}</span></div>
          <div class="calc-summary-row total" style="color:var(--color-primary); font-size:1.1rem;">
            <span>TOTAL NET SALARY:</span>
            <span class="mono">₹ ${net.toLocaleString()}</span>
          </div>
          <div class="calc-summary-row" style="font-weight:700; color:var(--color-primary);">
            <span>AMOUNT PAID NOW:</span>
            <span class="mono">₹ ${amountPaidNow.toLocaleString()}</span>
          </div>
          ${pendingBal > 0 ? `
            <div class="calc-summary-row" style="font-weight:800; color:var(--color-accent); font-size:1.15rem; background:rgba(245, 158, 11, 0.15); padding:0.4rem; border-radius:4px; margin-top:0.3rem;">
              <span>PENDING WAGE BALANCE:</span>
              <span class="mono">₹ ${pendingBal.toLocaleString()}</span>
            </div>
          ` : ''}
        `;
      }
    };

    nutInp?.addEventListener('input', updateCalculatedWage);
    [grossInp, qcInp, allowInp, dedInp, payPaidNowInp].forEach(inp => inp?.addEventListener('input', updateCalc));
    payPmtTypeSel?.addEventListener('change', () => {
      if (payPmtTypeSel.value === 'full') {
        const g = Number(grossInp.value) || 0;
        const qc = Number(qcInp.value) || 0;
        const al = Number(allowInp.value) || 0;
        const d = Number(dedInp.value) || 0;
        const net = (g + al) - (qc + d);
        if (payPaidNowInp) payPaidNowInp.value = net;
      }
      updateCalc();
    });
    updateCalculatedWage();

    equalShareBtn?.addEventListener('click', () => {
      const currentNuts = Number(nutInp.value) || 0;
      const halfNuts = Math.round(currentNuts / 2);
      nutInp.value = halfNuts;
      updateCalculatedWage();
      alert(`Nut count split in half (${halfNuts.toLocaleString()} nuts) for team worker share!`);
    });

    getEl('payrollReviewForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const nuts = Number(nutInp.value);
      const g = Number(grossInp.value);
      const qc = Number(qcInp.value);
      const al = Number(allowInp.value);
      const d = Number(dedInp.value);
      const net = (g + al) - (qc + d);

      const isPartial = payPmtTypeSel && payPmtTypeSel.value === 'partial';
      const amountPaidNow = isPartial ? Math.min(net, Number(payPaidNowInp.value) || 0) : net;
      const pendingBal = Math.max(0, net - amountPaidNow);

      store.processWorkerPayroll({
        workerId: workerId,
        allocatedNutCount: nuts,
        date: new Date().toISOString().slice(0,10),
        period: worker.settlementType === 'job_based' ? 'Job Settlement' : 'Weekly Saturday Pay',
        grossWage: g,
        quickCashDeducted: qc,
        allowances: al,
        deductions: d,
        netPaid: net,
        amountPaid: amountPaidNow,
        pendingBalance: pendingBal,
        paymentStatus: pendingBal === 0 ? 'paid' : 'partial',
        paymentHistory: [
          { id: "wpmt_" + Date.now(), date: new Date().toISOString().slice(0,10), amount: amountPaidNow, notes: 'Initial wage payout' }
        ],
        lotIds: lotIds,
        notes: getEl('payNotes').value
      });

      closeModal();
      alert(`Payroll Settlement Saved for ${worker.name}! Net Paid: ₹ ${net.toLocaleString()}`);
      renderView(currentTab);
    });
  }
  openModal();
}

function openClientProfileModal(clientId) {
  const profile = store.getClientFullProfile(clientId);
  if (!profile) return;
  const { client, lots, bills } = profile;
  const currency = store.data.traderInfo.currency;
  const cycle = getNextHarvestCycleInfo(clientId);

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `📋 Farm Settlement Bills History: ${client.name}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; align-items:center;">
          <div>
            <h4 style="margin:0;">${client.name}</h4>
            <p style="font-size:0.85rem; color:var(--text-muted);">${client.phone} ${client.altPhone ? '| Alt: ' + client.altPhone : ''} | ${client.location}</p>
            <p style="font-size:0.85rem; color:var(--color-primary); font-weight:700;">Acreage: ${client.areaSizeAcres || 'N/A'} | Trees: ${client.treeCount || 0}</p>
          </div>
          <div style="text-align:right;">
            <p>Contract Security Advance: <strong class="mono" style="color:var(--color-primary);">₹ ${(client.contractAdvance || 0).toLocaleString()}</strong></p>
            <p>Unpaid Quick Cash: <strong class="mono" style="color:var(--color-accent);">₹ ${(client.quickCashBalance || 0).toLocaleString()}</strong></p>
            <button class="btn btn-secondary btn-sm" style="margin-top:0.4rem; font-weight:700;" onclick="window.openEditClientModal('${client.id}')">✏️ Edit Client Profile</button>
          </div>
        </div>

        <div style="margin-top:0.75rem; padding-top:0.6rem; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
          <div>
            <strong style="color:var(--color-primary); font-size:0.9rem;">🗓️ Next Expected Harvest Cycle (45-Day Cycle):</strong>
            <span style="margin-left:0.5rem;">${cycle.statusBadge}</span>
          </div>
          <small style="color:var(--text-muted);">Last Harvest Date: ${cycle.lastHarvestDate}</small>
        </div>

        ${client.bankInfo || client.upiId || client.bankDetails ? `
          <div style="margin-top:0.75rem; padding-top:0.5rem; border-top:1px solid var(--border-color); font-size:0.85rem;">
            <strong>Bank / Payment Info:</strong> ${client.bankInfo?.accountNumber ? client.bankInfo.bankName + ' (A/C: ' + client.bankInfo.accountNumber + ' | IFSC: ' + client.bankInfo.ifsc + ')' : (client.bankDetails || 'N/A')}
            ${client.bankInfo?.upiId || client.upiId ? ' | <strong style="color:var(--color-accent);">UPI: ' + (client.bankInfo?.upiId || client.upiId) + '</strong>' : ''}
          </div>
        ` : ''}
      </div>

      <h4 style="margin-bottom:0.75rem; font-size:1.1rem; color:var(--color-primary);">📜 Generated Settlement Bills (${bills.length})</h4>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Bill Date</th>
              <th>Accepted Count</th>
              <th>Rate / Piece</th>
              <th>Gross Amount</th>
              <th>Net Amount Paid</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${bills.length === 0 ? '<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:1.5rem;">No settlement bills generated yet.</td></tr>' : ''}
            ${bills.map(b => {
              const pendingBal = b.pendingBalance || 0;
              const amountPaid = b.amountPaid !== undefined ? b.amountPaid : b.netPayable;
              return `
                <tr>
                  <td class="mono" style="font-size:1.05rem;">
                    <strong>${b.billNumber}</strong>
                    ${pendingBal > 0 ? '<br><span class="badge badge-transit" style="font-size:0.75rem; background:#f59e0b; color:#fff;">⚠️ Partial (Bal: ₹ ' + pendingBal.toLocaleString() + ')</span>' : ''}
                  </td>
                  <td>${b.billDate}</td>
                  <td class="mono">${b.acceptedCount.toLocaleString()} nuts</td>
                  <td class="mono" style="font-weight:700; color:var(--color-primary);">₹ ${(b.ratePerPiece !== undefined ? b.ratePerPiece : (b.ratePer1000 ? b.ratePer1000 / 1000 : 12.50)).toFixed(2)} / nut</td>
                  <td class="mono">₹ ${b.grossAmount.toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700; font-size:1.05rem;">
                    ₹ ${amountPaid.toLocaleString()}
                    ${pendingBal > 0 ? '<br><small style="color:var(--color-accent); font-weight:bold;">Total: ₹ ' + b.netPayable.toLocaleString() + '</small>' : ''}
                  </td>
                  <td>
                    <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                      ${pendingBal > 0 ? `
                        <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:var(--color-accent); color:var(--color-accent);" onclick="window.openSettleClientPendingBalanceModal('${client.id}', '${b.id}')">💵 Pay Balance</button>
                      ` : ''}
                      <button class="btn btn-primary btn-sm" style="font-weight:700;" onclick="window.printClientBill('${b.id}')">📄 View Bill</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  openModal();
}

function openWorkerProfileModal(workerId) {
  const profile = store.getWorkerFullProfile(workerId);
  if (!profile) return;
  const { worker, attendance, lotsWorked, totalLotsWorked, totalNutsHandled } = profile;
  const currency = store.data.traderInfo.currency;

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `📋 Worker History & Payslips: ${worker.name}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; align-items:center;">
          <div>
            <h4 style="margin:0;">${worker.name} (${worker.role.toUpperCase()})</h4>
            <p style="font-size:0.85rem; color:var(--text-muted);">${worker.phone} | ${worker.settlementType === 'job_based' ? 'Job-Based Settlement' : 'Weekly Saturday Pay'}</p>
          </div>
          <div style="text-align:right;">
            <p>Contract Security Advance: <strong class="mono" style="color:var(--color-primary);">₹ ${(worker.contractAdvance || 0).toLocaleString()}</strong></p>
            <p>Unpaid Quick Cash: <strong class="mono" style="color:var(--color-accent);">₹ ${(worker.quickCashBalance || 0).toLocaleString()}</strong></p>
            <button class="btn btn-secondary btn-sm" style="margin-top:0.4rem; font-weight:700;" onclick="window.openEditWorkerModal('${worker.id}')">✏️ Edit Worker Profile</button>
          </div>
        </div>
        ${worker.bankInfo ? `
          <div style="margin-top:0.75rem; padding-top:0.5rem; border-top:1px solid var(--border-color); font-size:0.85rem;">
            <strong>Bank / Payment Info:</strong> ${worker.bankInfo?.accountNumber ? worker.bankInfo.bankName + ' (A/C: ' + worker.bankInfo.accountNumber + ' | IFSC: ' + worker.bankInfo.ifsc + ')' : 'Direct Cash'}
            ${worker.bankInfo?.upiId ? ' | <strong style="color:var(--color-accent);">UPI: ' + worker.bankInfo.upiId + '</strong>' : ''}
          </div>
        ` : ''}
      </div>

      <h4 style="margin-top:1rem; margin-bottom:0.5rem;">1. Quick Cash Ledger (${(worker.quickCashHistory || []).length})</h4>
      <div class="table-responsive" style="max-height:140px; overflow-y:auto; margin-bottom:1rem;">
        <table class="data-table">
          <thead>
            <tr><th>Date</th><th>Amount</th><th>Notes</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${(worker.quickCashHistory || []).length === 0 ? '<tr><td colspan="4" style="text-align:center; color:var(--text-muted);">No quick cash issued.</td></tr>' : ''}
            ${(worker.quickCashHistory || []).map(q => `
              <tr>
                <td>${q.date}</td>
                <td class="mono" style="color:var(--color-accent); font-weight:700;">₹ ${q.amount.toLocaleString()}</td>
                <td><small>${q.notes}</small></td>
                <td><span class="badge ${q.status === 'adjusted' ? 'badge-completed' : 'badge-transit'}">${q.status.toUpperCase()}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <h4 style="margin-top:1rem; margin-bottom:0.5rem;">2. Payslip & Payroll Settlement History (${(worker.payrollHistory || []).length})</h4>
      <div class="table-responsive" style="max-height:160px; overflow-y:auto;">
        <table class="data-table">
          <thead>
            <tr><th>Date</th><th>Period</th><th>Nuts Handled</th><th>Gross Wage</th><th>Net Paid / Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            ${(worker.payrollHistory || []).length === 0 ? '<tr><td colspan="6" style="text-align:center; color:var(--text-muted);">No payroll settlements processed yet.</td></tr>' : ''}
            ${(worker.payrollHistory || []).map(p => {
              const pendingBal = p.pendingBalance || 0;
              const amountPaid = p.amountPaid !== undefined ? p.amountPaid : p.netPaid;
              return `
                <tr>
                  <td>${p.date}</td>
                  <td><small>${p.period}</small></td>
                  <td class="mono">${(p.allocatedNutCount || 0).toLocaleString()} nuts</td>
                  <td class="mono">₹ ${p.grossWage.toLocaleString()}</td>
                  <td class="mono" style="color:var(--color-primary); font-weight:700;">
                    ₹ ${amountPaid.toLocaleString()}
                    ${pendingBal > 0 ? '<br><span class="badge badge-transit" style="font-size:0.75rem; background:#f59e0b; color:#fff;">⚠️ Partial (Bal: ₹ ' + pendingBal.toLocaleString() + ')</span>' : ''}
                  </td>
                  <td>
                    <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                      ${pendingBal > 0 ? `
                        <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:var(--color-accent); color:var(--color-accent);" onclick="window.openSettleWorkerPendingBalanceModal('${worker.id}', '${p.id}')">💵 Pay Balance</button>
                      ` : ''}
                      <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:var(--color-primary); color:var(--color-primary);" onclick="window.printWorkerPayslip('${worker.id}', '${p.id}')">📄 Payslip</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  openModal();
}



function openEditLotNutSplitModal(lotId) {
  const lot = store.getLotById(lotId);
  if (!lot) return;
  const client = store.getClientById(lot.clientId);
  let attLogs = store.getAttendanceForLot(lotId);
  const grossNuts = Number(lot.grossHarvestCount || 0);

  if (!attLogs || attLogs.length === 0) {
    const workers = store.getWorkers();
    if (!workers || workers.length === 0) {
      alert("No workers registered in system. Please add workers first.");
      return;
    }
    attLogs = workers.map(w => {
      const sameRoleCount = workers.filter(wr => wr.role === w.role).length || 1;
      return {
        workerId: w.id,
        role: w.role,
        status: 'present',
        date: lot.harvestDate,
        allocatedNutCount: Math.round(grossNuts / sameRoleCount)
      };
    });
    store.saveAttendance(lot.id, attLogs);
  }

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `✏️ Edit Labour Nut Count Split: ${lot.lotNumber}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="editLotNutSplitForm">
        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); border-left:4px solid var(--color-primary); margin-bottom:1.25rem;">
          <h4 style="margin:0; font-size:1.05rem;">📍 Farm Owner: ${client ? client.name : 'Unknown'} (${client ? client.location : ''})</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">
            Harvest Date: <strong>${lot.harvestDate}</strong> | Total Gross Harvest Count: <strong style="color:var(--color-primary); font-size:1.1rem;" class="mono">${grossNuts.toLocaleString()} nuts</strong>
          </p>
          <div style="font-size:0.825rem; color:var(--text-muted); margin-top:0.25rem;">
            💡 Customize manual nut count split per worker (e.g. 70-30 split: 7,000 nuts & 3,000 nuts for 2 Cutters).
          </div>
        </div>

        <div style="font-weight:700; color:var(--color-primary); margin-bottom:0.75rem; font-size:1.05rem;">
          👷 Labour Workers Present & Custom Nut Share Entry:
        </div>

        <div style="display:flex; flex-direction:column; gap:0.85rem; max-height:350px; overflow-y:auto; padding-right:0.3rem;">
          ${attLogs.map(a => {
            const w = store.getWorkerById(a.workerId);
            const role = (a.role || (w ? w.role : 'general')).toLowerCase();
            const currentNuts = getWorkerNutShareForLot(a.workerId, lotId, role);
            const pct = grossNuts > 0 ? ((currentNuts / grossNuts) * 100).toFixed(1) : '0';

            return `
              <div style="background:var(--bg-card); border:1px solid var(--border-color); padding:0.85rem 1rem; border-radius:var(--radius-md);">
                <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.5rem;">
                  <div>
                    <strong style="font-size:1.05rem;">${w ? w.name : 'Worker'}</strong>
                    <span class="badge badge-role" style="margin-left:0.5rem;">${role.toUpperCase()}</span>
                  </div>
                  <div style="font-size:0.85rem; font-weight:700; color:var(--text-muted);">
                    Current Share: <span id="pct_${a.workerId}" class="mono" style="color:var(--color-primary);">${pct}% (${currentNuts.toLocaleString()} nuts)</span>
                  </div>
                </div>

                <div class="form-row" style="margin-bottom:0; align-items:center;">
                  <div class="form-group" style="margin-bottom:0;">
                    <label style="font-weight:600;">Custom Nut Count for ${w ? w.name : 'Worker'}</label>
                    <input type="number" id="splitNut_${a.workerId}" data-worker-id="${a.workerId}" data-role="${role}" class="form-control mono split-nut-input" style="font-weight:700; font-size:1.05rem;" value="${currentNuts}" step="10" required />
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div id="splitSummaryBox" class="calc-summary-box" style="margin-top:1.25rem;"></div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight:700;">Save Custom Split</button>
        </div>
      </form>
    `;

    const inputs = document.querySelectorAll('.split-nut-input');
    const updateSplitSummary = () => {
      const roleTotals = {};
      inputs.forEach(inp => {
        const r = inp.getAttribute('data-role');
        const val = Number(inp.value) || 0;
        roleTotals[r] = (roleTotals[r] || 0) + val;

        const wId = inp.getAttribute('data-worker-id');
        const pctEl = getEl(`pct_${wId}`);
        if (pctEl) {
          const pct = grossNuts > 0 ? ((val / grossNuts) * 100).toFixed(1) : '0';
          pctEl.textContent = `${pct}% (${val.toLocaleString()} nuts)`;
        }
      });

      const summaryBox = getEl('splitSummaryBox');
      if (summaryBox) {
        summaryBox.innerHTML = `
          <h4 style="margin:0 0 0.5rem 0; font-size:0.95rem; color:var(--color-primary);">📊 Live Role Nut Split Summary (Gross: ${grossNuts.toLocaleString()} nuts):</h4>
          ${Object.keys(roleTotals).map(r => {
            const tot = roleTotals[r];
            const diff = tot - grossNuts;
            const isMatch = Math.abs(diff) < 2;
            const color = isMatch ? 'var(--color-primary)' : 'var(--color-accent)';
            return `
              <div class="calc-summary-row" style="font-weight:700;">
                <span>${r.toUpperCase()} Total Allocated:</span>
                <span class="mono" style="color:${color};">${tot.toLocaleString()} / ${grossNuts.toLocaleString()} nuts ${isMatch ? '✅ (100%)' : `(${tot > grossNuts ? '+' : ''}${diff.toLocaleString()} nuts)`}</span>
              </div>
            `;
          }).join('')}
        `;
      }
    };

    inputs.forEach(inp => inp.addEventListener('input', updateSplitSummary));
    updateSplitSummary();

    getEl('editLotNutSplitForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      inputs.forEach(inp => {
        const wId = inp.getAttribute('data-worker-id');
        const val = Number(inp.value) || 0;
        const att = attLogs.find(a => a.workerId === wId);
        if (att) {
          att.allocatedNutCount = val;
        }
      });

      store.saveAttendance(lot.id, attLogs);
      closeModal();
      renderView(currentTab);
      alert(`Custom labour nut share split saved for ${lot.lotNumber}!`);
    });
  }
  openModal();
}

function openLotLaboursModal(lotId) {
  const lot = store.getLotById(lotId);
  if (!lot) return;
  const client = store.getClientById(lot.clientId);
  const attLogs = store.getAttendanceForLot(lotId);

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `👷 Labour Details for Harvest Lot: ${lot.lotNumber}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
        <div>
          <h4 style="margin:0;">Farm Owner: ${client ? client.name : 'Unknown'} (${client ? client.location : ''})</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.25rem;">
            Harvest Date: <strong>${lot.harvestDate}</strong> | Gross Count: <strong>${lot.grossHarvestCount.toLocaleString()} nuts</strong> | Accepted: <strong style="color:var(--color-primary);">${(lot.grossHarvestCount - (lot.badNutCount || 0)).toLocaleString()} nuts</strong>
          </p>
        </div>
        <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:var(--color-primary); color:var(--color-primary);" onclick="window.openEditLotNutSplitModal('${lot.id}')">
          ✏️ Edit Custom Nut Split
        </button>
      </div>

      <h4 style="margin-bottom:0.75rem; color:var(--color-primary); font-size:1.1rem;">👷 Labours Present & Work Contributions (${attLogs.length})</h4>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Labour Name</th>
              <th>Role</th>
              <th>Phone</th>
              <th>Allocated Nut Count</th>
              <th>Unpaid Quick Cash</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${attLogs.length === 0 ? '<tr><td colspan="6" style="text-align:center; color:var(--text-muted); padding:1.5rem;">No labours registered for this lot.</td></tr>' : ''}
            ${attLogs.map(a => {
              const w = store.getWorkerById(a.workerId);
              const nuts = getWorkerNutShareForLot(a.workerId, lotId, a.role || (w ? w.role : ''));
              const paidRecord = (w && w.payrollHistory && w.payrollHistory.length > 0) ? w.payrollHistory[0] : null;

              return `
                <tr>
                  <td>
                    <strong style="font-size:1.05rem;">${w ? w.name : 'Worker'}</strong>
                    ${paidRecord ? '<br><span class="badge badge-completed" style="font-size:0.75rem; padding:0.15rem 0.4rem;">✅ Paid (₹ ' + paidRecord.netPaid.toLocaleString() + ')</span>' : ''}
                  </td>
                  <td><span class="badge badge-role">${(a.role || (w ? w.role : '')).toUpperCase()}</span></td>
                  <td>${w ? w.phone : '-'}</td>
                  <td class="mono" style="font-weight:700; color:var(--color-primary); font-size:1.05rem;">${nuts.toLocaleString()} nuts</td>
                  <td class="mono" style="color:var(--color-accent); font-weight:700;">₹ ${(w ? w.quickCashBalance || 0 : 0).toLocaleString()}</td>
                  <td>
                    ${paidRecord ? `
                      <button class="btn btn-secondary btn-sm" style="font-weight:700; border-color:var(--color-primary); color:var(--color-primary);" onclick="window.printWorkerPayslip('${a.workerId}', '${paidRecord.id}')">📄 Show Payslip</button>
                    ` : `
                      <button class="btn btn-primary btn-sm" style="font-weight:700;" onclick="window.openPayrollReviewModal('${a.workerId}')">💚 Pay Wages</button>
                    `}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }
  openModal();
}

function openLotDetailsModal(lotId) {
  const lot = store.getLotById(lotId);
  if (!lot) return;
  const client = store.getClientById(lot.clientId);
  const bill = store.getBillByLotId(lot.id);
  const attLogs = store.getAttendanceForLot(lot.id);
  const currency = store.data.traderInfo.currency;

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `🌴 Farm Harvest Lot Details: ${lot.lotNumber}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="background:var(--bg-card-hover); padding:1.25rem; border-radius:var(--radius-md); margin-bottom:1.25rem;">
        <div style="display:flex; justify-content:space-between; flex-wrap:wrap; gap:0.5rem; align-items:center;">
          <div>
            <h3 style="margin:0;">${lot.lotNumber}</h3>
            <p style="font-size:0.95rem; margin-top:0.25rem;"><strong>Farm Owner:</strong> ${client ? client.name : 'Unknown'} (${client ? client.location : ''})</p>
            <p style="font-size:0.85rem; color:var(--text-muted);">Harvest Date: <strong>${lot.harvestDate}</strong></p>
          </div>
          <div>
            <span class="badge ${lot.status === 'completed' ? 'badge-completed' : 'badge-transit'}" style="font-size:0.95rem; padding:0.4rem 0.8rem;">${lot.status === 'completed' ? '✅ Billed & Settled' : '🌴 Active Harvest Lot'}</span>
          </div>
        </div>
      </div>

      <div class="kpi-grid" style="margin-bottom:1.25rem;">
        <div class="kpi-card" style="padding:1rem;">
          <div class="kpi-title">Gross Harvest Count</div>
          <div class="kpi-value" style="font-size:1.5rem;">${lot.grossHarvestCount.toLocaleString()} nuts</div>
        </div>
        <div class="kpi-card" style="padding:1rem;">
          <div class="kpi-title" style="color:var(--color-danger);">Bad / Rejection Nuts</div>
          <div class="kpi-value" style="font-size:1.5rem; color:var(--color-danger);">${lot.badNutCount || 0} nuts</div>
        </div>
        <div class="kpi-card" style="padding:1rem; border:2px solid var(--color-primary);">
          <div class="kpi-title" style="color:var(--color-primary);">Net Accepted Billable Nuts</div>
          <div class="kpi-value" style="font-size:1.5rem; color:var(--color-primary);">${(lot.grossHarvestCount - (lot.badNutCount || 0)).toLocaleString()} nuts</div>
        </div>
      </div>

      <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem;">
        <h4 style="margin-top:0; color:var(--color-primary); font-size:1.05rem;">👷 Workers Present for Farm (${attLogs.length})</h4>
        ${attLogs.length === 0 ? '<p style="color:var(--text-muted); font-size:0.85rem;">No workers logged for this lot.</p>' : ''}
        <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
          ${attLogs.map(a => {
            const w = store.getWorkerById(a.workerId);
            const name = w ? w.name : 'Worker';
            const role = (a.role || (w ? w.role : '')).toUpperCase();
            const count = a.allocatedNutCount !== undefined ? ` (${Number(a.allocatedNutCount).toLocaleString()} nuts)` : '';
            return `<span class="badge badge-role" style="font-size:0.85rem; padding:0.35rem 0.6rem;">👷 ${name} [${role}]${count}</span>`;
          }).join('')}
        </div>
      </div>

      <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-bottom:1.25rem;">
        <h4 style="margin-top:0; color:var(--color-primary); font-size:1.05rem;">🧾 Client Settlement Invoice Bill Status</h4>
        ${bill ? `
          <p style="margin:0; font-size:0.95rem;">Invoice No: <strong>${bill.billNumber}</strong> | Bill Date: <strong>${bill.billDate}</strong></p>
          <p style="margin:0.25rem 0 0 0; font-size:1.1rem; color:var(--color-primary); font-weight:700;">Net Payable: ${currency} ${bill.netPayable.toLocaleString()} (Rate: ${currency} ${(bill.ratePerPiece || bill.ratePer1000 / 1000).toFixed(2)}/nut)</p>
        ` : `<p style="color:var(--color-accent); font-weight:700; margin:0;">Not Billed Yet. Click "Make Bill" to generate farm invoice.</p>`}
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.5rem; flex-wrap:wrap;">
        <button type="button" class="btn btn-secondary" style="font-weight:700; border-color:var(--color-primary); color:var(--color-primary);" onclick="window.openEditLotNutSplitModal('${lot.id}')">✏️ Edit Custom Nut Split</button>
        ${bill ? `
          <button type="button" class="btn btn-primary" onclick="window.printClientBill('${bill.id}')">Print Invoice Bill</button>
        ` : `
          <button type="button" class="btn btn-primary" style="font-weight:700;" onclick="window.openGenerateClientBillModal('${lot.id}')">🧾 Make Client Bill</button>
        `}
      </div>
    `;
  }
  openModal();
}

function openEditClientModal(clientId) {
  const client = store.getClientById(clientId);
  if (!client) return;

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `✏️ Edit Client Profile: ${client.name}`;
  
  const b = client.bankInfo || {};
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="editClientForm">
        <div class="form-group">
          <label>Farm Owner Full Name</label>
          <input type="text" id="editCliName" class="form-control" value="${client.name}" required />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Primary Phone Number</label>
            <input type="tel" id="editCliPhone" class="form-control" value="${client.phone}" required />
          </div>
          <div class="form-group">
            <label>Additional / Alt Phone Number</label>
            <input type="tel" id="editCliAltPhone" class="form-control" value="${client.altPhone || ''}" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Farm Area Size / Acreage</label>
            <input type="text" id="editCliAreaSize" class="form-control" value="${client.areaSizeAcres || ''}" placeholder="e.g. 5 Acres" />
          </div>
          <div class="form-group">
            <label>Total Palm Tree Count</label>
            <input type="number" id="editCliTrees" class="form-control mono" value="${client.treeCount || 0}" />
          </div>
        </div>

        <div class="form-group">
          <label>Farm Location & Address</label>
          <input type="text" id="editCliLocation" class="form-control" value="${client.location}" required />
        </div>

        <div class="form-group">
          <label>Contract Security Advance (₹)</label>
          <input type="number" id="editCliAdvance" class="form-control mono" value="${client.contractAdvance || 0}" />
        </div>

        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.25rem;">
          <h4 style="color:var(--color-primary); margin-bottom:0.75rem; font-size:1.05rem;">🏦 Edit Bank Account & Payment Details</h4>
          
          <div class="form-group" style="margin-bottom:0.75rem;">
            <label>Account Holder Name</label>
            <input type="text" id="editCliBankAccHolder" class="form-control" value="${b.accountHolder || client.name}" />
          </div>

          <div class="form-row" style="margin-bottom:0.75rem;">
            <div class="form-group">
              <label>Bank Name</label>
              <input type="text" id="editCliBankName" class="form-control" value="${b.bankName || ''}" placeholder="e.g. State Bank of India" />
            </div>
            <div class="form-group">
              <label>Branch Name</label>
              <input type="text" id="editCliBranch" class="form-control" value="${b.branch || ''}" placeholder="e.g. Pollachi Main" />
            </div>
          </div>

          <div class="form-row" style="margin-bottom:0.75rem;">
            <div class="form-group">
              <label>Account Number</label>
              <input type="text" id="editCliAccNumber" class="form-control mono" value="${b.accountNumber || ''}" />
            </div>
            <div class="form-group">
              <label>IFSC Code</label>
              <input type="text" id="editCliIfsc" class="form-control mono" value="${b.ifsc || ''}" style="text-transform:uppercase;" />
            </div>
          </div>

          <div class="form-group">
            <label>UPI ID / PhonePe / GPay Number</label>
            <input type="text" id="editCliUpiId" class="form-control" value="${b.upiId || client.upiId || ''}" />
          </div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight:700;">Update Client Profile</button>
        </div>
      </form>
    `;

    getEl('editClientForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      client.name = getEl('editCliName').value;
      client.phone = getEl('editCliPhone').value;
      client.altPhone = getEl('editCliAltPhone').value;
      client.areaSizeAcres = getEl('editCliAreaSize').value;
      client.treeCount = Number(getEl('editCliTrees').value) || 0;
      client.location = getEl('editCliLocation').value;
      client.contractAdvance = Number(getEl('editCliAdvance').value) || 0;
      client.bankInfo = {
        accountHolder: getEl('editCliBankAccHolder').value,
        bankName: getEl('editCliBankName').value,
        branch: getEl('editCliBranch').value,
        accountNumber: getEl('editCliAccNumber').value,
        ifsc: getEl('editCliIfsc').value,
        upiId: getEl('editCliUpiId').value
      };
      store.saveData();
      closeModal();
      alert(`Client profile updated for ${client.name}!`);
      renderView(currentTab);
    });
  }
  openModal();
}

function openEditWorkerModal(workerId) {
  const worker = store.getWorkerById(workerId);
  if (!worker) return;

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `✏️ Edit Worker Profile: ${worker.name}`;

  const b = worker.bankInfo || {};
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="editWorkerForm">
        <div class="form-group">
          <label>Worker Full Name</label>
          <input type="text" id="editWrkName" class="form-control" value="${worker.name}" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Role</label>
            <select id="editWrkRole" class="form-control" required>
              <option value="cutter" ${worker.role === 'cutter' ? 'selected' : ''}>Cutter (Weekly Sat Pay)</option>
              <option value="picker" ${worker.role === 'picker' ? 'selected' : ''}>Picker (Weekly Sat Pay)</option>
              <option value="driver" ${worker.role === 'driver' ? 'selected' : ''}>Driver (Weekly Sat Pay)</option>
              <option value="dehusker" ${worker.role === 'dehusker' ? 'selected' : ''}>Dehusker (Job-Based Pay)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="editWrkPhone" class="form-control" value="${worker.phone}" required />
          </div>
        </div>

        <div class="form-group">
          <label>Contract Security Advance Baseline (₹)</label>
          <input type="number" id="editWrkAdvance" class="form-control mono" value="${worker.contractAdvance || 0}" />
        </div>

        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.25rem;">
          <h4 style="color:var(--color-primary); margin-bottom:0.75rem; font-size:1.05rem;">🏦 Edit Bank Account & UPI Details</h4>
          
          <div class="form-group" style="margin-bottom:0.75rem;">
            <label>Account Holder Name</label>
            <input type="text" id="editWrkBankAccHolder" class="form-control" value="${b.accountHolder || worker.name}" />
          </div>

          <div class="form-row" style="margin-bottom:0.75rem;">
            <div class="form-group">
              <label>Bank Name</label>
              <input type="text" id="editWrkBankName" class="form-control" value="${b.bankName || ''}" placeholder="e.g. Indian Overseas Bank" />
            </div>
            <div class="form-group">
              <label>Branch Name</label>
              <input type="text" id="editWrkBranch" class="form-control" value="${b.branch || ''}" placeholder="e.g. Pollachi Town" />
            </div>
          </div>

          <div class="form-row" style="margin-bottom:0.75rem;">
            <div class="form-group">
              <label>Account Number</label>
              <input type="text" id="editWrkAccNumber" class="form-control mono" value="${b.accountNumber || ''}" />
            </div>
            <div class="form-group">
              <label>IFSC Code</label>
              <input type="text" id="editWrkIfsc" class="form-control mono" value="${b.ifsc || ''}" style="text-transform:uppercase;" />
            </div>
          </div>

          <div class="form-group">
            <label>UPI ID / GPay / PhonePe Number</label>
            <input type="text" id="editWrkUpiId" class="form-control" value="${b.upiId || ''}" />
          </div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight:700;">Update Worker Profile</button>
        </div>
      </form>
    `;

    getEl('editWorkerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = getEl('editWrkRole').value;
      worker.name = getEl('editWrkName').value;
      worker.role = role;
      worker.settlementType = role === 'dehusker' ? 'job_based' : 'weekly_saturday';
      worker.phone = getEl('editWrkPhone').value;
      worker.contractAdvance = Number(getEl('editWrkAdvance').value) || 0;
      worker.bankInfo = {
        accountHolder: getEl('editWrkBankAccHolder').value,
        bankName: getEl('editWrkBankName').value,
        branch: getEl('editWrkBranch').value,
        accountNumber: getEl('editWrkAccNumber').value,
        ifsc: getEl('editWrkIfsc').value,
        upiId: getEl('editWrkUpiId').value
      };
      store.saveData();
      closeModal();
      alert(`Worker profile updated for ${worker.name}!`);
      renderView(currentTab);
    });
  }
  openModal();
}

// OTHER MODALS
function openNewLotModal() {
  const clients = store.getClients();
  const workers = store.getWorkers();
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = getLang() === 'ta' ? "புதிய அறுவடை லாட் உருவாக்குதல்" : "Create New Farm Harvest Lot";

  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newLotForm">
        <div class="form-group">
          <label>Select Farm Client Owner</label>
          <select id="lotClientId" class="form-control" required>
            ${clients.map(c => `<option value="${c.id}">${c.name} - ${c.location} (Rate: ₹${c.ratePer1000Nuts}/1k)</option>`).join('')}
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
        <div class="form-group">
          <label>Bad / Damaged Nut Count</label>
          <input type="number" id="lotBadCount" class="form-control mono" value="0" />
        </div>
        <div class="form-group" style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); margin-top:1rem;">
          <label style="color:var(--color-primary); font-weight:700;">Mark Worker Attendance for this Lot</label>
          <div style="max-height:140px; overflow-y:auto;">
            ${workers.map(w => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:0.3rem 0; border-bottom:1px solid var(--border-color);">
                <label style="display:flex; align-items:center; gap:0.5rem; cursor:pointer;">
                  <input type="checkbox" name="lotWorkerAtt" value="${w.id}" style="width:16px; height:16px;" />
                  <span>${w.name} (${w.role.toUpperCase()})</span>
                </label>
              </div>
            `).join('')}
          </div>
        </div>
        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Lot</button>
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
        notes: ''
      }, checkedWorkers);
      closeModal();
      renderView(currentTab);
    });
  }
  openModal();
}

function updateStageModal(lotId) {
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
            <label>Update Gross Count</label>
            <input type="number" id="stageGross" class="form-control mono" value="${lot.grossHarvestCount}" />
          </div>
          <div class="form-group">
            <label>Update Bad Nut Count</label>
            <input type="number" id="stageBad" class="form-control mono" value="${lot.badNutCount || 0}" />
          </div>
        </div>
        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary">Save Stage</button>
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
}

function openNewClientModal() {
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = getLang() === 'ta' ? "தோட்ட உரிமையாளர் பதிவு" : "Register Client Farm Owner";
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newClientForm">
        <div class="form-group">
          <label>Farm Owner Full Name</label>
          <input type="text" id="cliName" class="form-control" placeholder="e.g. Ramasamy Gounder" required />
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Primary Phone Number</label>
            <input type="tel" id="cliPhone" class="form-control" placeholder="+91 98765 43210" required />
          </div>
          <div class="form-group">
            <label>Additional / Alt Phone Number</label>
            <input type="tel" id="cliAltPhone" class="form-control" placeholder="+91 94431 00000" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Farm Area Size / Acreage</label>
            <input type="text" id="cliAreaSize" class="form-control" placeholder="e.g. 5 Acres" required />
          </div>
          <div class="form-group">
            <label>Total Palm Tree Count</label>
            <input type="number" id="cliTrees" class="form-control mono" value="450" required />
          </div>
        </div>

        <div class="form-group">
          <label>Farm Location & Address</label>
          <input type="text" id="cliLocation" class="form-control" placeholder="e.g. Anaimalai Farm (Sector A)" required />
        </div>

        <div class="form-group">
          <label>Contract Security Advance (₹)</label>
          <input type="number" id="cliAdvance" class="form-control mono" value="15000" />
        </div>

        <!-- Detailed Bank Account Collection Section -->
        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.25rem;">
          <h4 style="color:var(--color-primary); margin-bottom:0.75rem; font-size:1.05rem;">🏦 Client Bank Account & Payment Details</h4>
          
          <div class="form-group" style="margin-bottom:0.75rem;">
            <label>Account Holder Name (as in Bank)</label>
            <input type="text" id="cliBankAccHolder" class="form-control" placeholder="e.g. Ramasamy G" />
          </div>

          <div class="form-row" style="margin-bottom:0.75rem;">
            <div class="form-group">
              <label>Bank Name</label>
              <input type="text" id="cliBankName" class="form-control" placeholder="e.g. State Bank of India (SBI)" />
            </div>
            <div class="form-group">
              <label>Branch Name</label>
              <input type="text" id="cliBranch" class="form-control" placeholder="e.g. Pollachi Main Branch" />
            </div>
          </div>

          <div class="form-row" style="margin-bottom:0.75rem;">
            <div class="form-group">
              <label>Account Number</label>
              <input type="text" id="cliAccNumber" class="form-control mono" placeholder="e.g. 30123456789" />
            </div>
            <div class="form-group">
              <label>IFSC Code</label>
              <input type="text" id="cliIfsc" class="form-control mono" placeholder="e.g. SBIN0001234" style="text-transform:uppercase;" />
            </div>
          </div>

          <div class="form-group">
            <label>UPI ID / PhonePe / GPay Number</label>
            <input type="text" id="cliUpiId" class="form-control" placeholder="e.g. 9876543210@upi or 9876543210" />
          </div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight:700;">Save Client Farm Owner</button>
        </div>
      </form>
    `;

    getEl('newClientForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      store.addClient({
        name: getEl('cliName').value,
        phone: getEl('cliPhone').value,
        altPhone: getEl('cliAltPhone').value,
        areaSizeAcres: getEl('cliAreaSize').value,
        treeCount: Number(getEl('cliTrees').value) || 0,
        location: getEl('cliLocation').value,
        contractAdvance: Number(getEl('cliAdvance').value) || 0,
        bankInfo: {
          accountHolder: getEl('cliBankAccHolder').value,
          bankName: getEl('cliBankName').value,
          branch: getEl('cliBranch').value,
          accountNumber: getEl('cliAccNumber').value,
          ifsc: getEl('cliIfsc').value,
          upiId: getEl('cliUpiId').value
        }
      });
      closeModal();
      renderView(currentTab);
    });
  }
  openModal();
}

function openNewWorkerModal() {
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = getLang() === 'ta' ? "புதிய தொழிலாளர் பதிவு" : "Register Worker & Contract Security Advance";
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newWorkerForm">
        <div class="form-group">
          <label>Worker Full Name</label>
          <input type="text" id="wrkName" class="form-control" placeholder="e.g. Kaliappan" required />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Role</label>
            <select id="wrkRole" class="form-control" required>
              <option value="cutter">Cutter (Weekly Sat Pay)</option>
              <option value="picker">Picker (Weekly Sat Pay)</option>
              <option value="driver">Driver (Weekly Sat Pay)</option>
              <option value="dehusker">Dehusker (Job-Based Pay)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Phone Number</label>
            <input type="tel" id="wrkPhone" class="form-control" placeholder="+91 91234 00001" required />
          </div>
        </div>

        <div class="form-group">
          <label>Contract Security Advance Baseline (₹)</label>
          <input type="number" id="wrkAdvance" class="form-control mono" value="5000" />
        </div>

        <!-- Detailed Bank Account Collection Section -->
        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1.25rem;">
          <h4 style="color:var(--color-primary); margin-bottom:0.75rem; font-size:1.05rem;">🏦 Worker Bank Account & UPI Details</h4>
          
          <div class="form-group" style="margin-bottom:0.75rem;">
            <label>Account Holder Name (as in Bank)</label>
            <input type="text" id="wrkBankAccHolder" class="form-control" placeholder="e.g. Kaliappan M" />
          </div>

          <div class="form-row" style="margin-bottom:0.75rem;">
            <div class="form-group">
              <label>Bank Name</label>
              <input type="text" id="wrkBankName" class="form-control" placeholder="e.g. Indian Overseas Bank (IOB)" />
            </div>
            <div class="form-group">
              <label>Branch Name</label>
              <input type="text" id="wrkBranch" class="form-control" placeholder="e.g. Pollachi Town Branch" />
            </div>
          </div>

          <div class="form-row" style="margin-bottom:0.75rem;">
            <div class="form-group">
              <label>Account Number</label>
              <input type="text" id="wrkAccNumber" class="form-control mono" placeholder="e.g. 20123456789" />
            </div>
            <div class="form-group">
              <label>IFSC Code</label>
              <input type="text" id="wrkIfsc" class="form-control mono" placeholder="e.g. IOBA0001234" style="text-transform:uppercase;" />
            </div>
          </div>

          <div class="form-group">
            <label>UPI ID / GPay / PhonePe Number</label>
            <input type="text" id="wrkUpiId" class="form-control" placeholder="e.g. 9123400001@upi or 9123400001" />
          </div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight:700;">Save Worker</button>
        </div>
      </form>
    `;

    getEl('newWorkerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const role = getEl('wrkRole').value;
      const defaultPieceRates = store.getMarketRates().labourPieceRates;
      let defaultRate = 2500;
      if (role === 'picker') defaultRate = defaultPieceRates.pickerRatePer1000;
      else if (role === 'driver') defaultRate = defaultPieceRates.driverRatePer1000;
      else if (role === 'dehusker') defaultRate = defaultPieceRates.dehuskerRatePer1000;
      else defaultRate = defaultPieceRates.cutterRatePer1000;

      store.addWorker({
        name: getEl('wrkName').value,
        role: role,
        settlementType: role === 'dehusker' ? 'job_based' : 'weekly_saturday',
        phone: getEl('wrkPhone').value,
        wageRatePer1000: defaultRate,
        contractAdvance: Number(getEl('wrkAdvance').value) || 0,
        status: 'active',
        bankInfo: {
          accountHolder: getEl('wrkBankAccHolder').value,
          bankName: getEl('wrkBankName').value,
          branch: getEl('wrkBranch').value,
          accountNumber: getEl('wrkAccNumber').value,
          ifsc: getEl('wrkIfsc').value,
          upiId: getEl('wrkUpiId').value
        }
      });
      closeModal();
      renderView(currentTab);
    });
  }
  openModal();
}

function openNewCoconutSaleModal() {
  const lots = store.getLots();
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = getLang() === 'ta' ? "தேங்காய் விற்பனை பதிவு" : "Log Coconut Sale Delivery";
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newCoconutSaleForm">
        <div class="form-row">
          <div class="form-group">
            <label style="font-weight:700; color:var(--color-primary);">Coconut Tail Type (தேங்காய் வகை)</label>
            <select id="saleCoconutType" class="form-control" style="font-weight:700;">
              <option value="with_tail" selected>🥥 Coconut with Tail / Kudumi (குடுமி தேங்காய் - Public)</option>
              <option value="without_tail">🥥 Coconut without Tail (மட்டை உரித்த தேங்காய் - Copra)</option>
            </select>
          </div>
          <div class="form-group">
            <label style="font-weight:700; color:var(--color-primary);">Billing Basis (கட்டண முறை)</label>
            <select id="saleBillingBasis" class="form-control" style="font-weight:700;">
              <option value="per_ton" selected>Billed by Weight in Tons (டன்னில் எடை படி)</option>
              <option value="per_kg">Billed by Weight in Kg (கிலோவில் எடை படி)</option>
              <option value="per_nut">Billed per Nut / Piece (எண்ணிக்கை படி)</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Associated Harvest Lots</label>
          <div style="max-height:80px; overflow-y:auto; background:var(--bg-card-hover); padding:0.5rem; border-radius:4px;">
            ${lots.map(l => `
              <label style="display:flex; gap:0.5rem; margin-bottom:0.3rem;">
                <input type="checkbox" name="saleLotCheck" value="${l.id}" />
                <span>${l.lotNumber} (${l.grossHarvestCount} nuts)</span>
              </label>
            `).join('')}
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="saleDate" class="form-control" value="${new Date().toISOString().slice(0,10)}" required />
          </div>
          <div class="form-group">
            <label>Buyer / Customer Name</label>
            <input type="text" id="saleBuyer" class="form-control" placeholder="e.g. Vignesh Wholesalers / Public Customer" required />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label style="font-weight:700; color:var(--color-primary);">Total Nut Count (தேங்காய் எண்ணிக்கை)</label>
            <input type="number" id="saleNutCount" class="form-control mono" value="5000" placeholder="e.g. 5000 nuts" required />
          </div>
          <div class="form-group" id="grpWeightVal">
            <label id="lblWeightVal" style="font-weight:700; color:var(--color-primary);">Total Weight (in Tons)</label>
            <input type="number" step="0.001" id="saleWeightVal" class="form-control mono" value="2.5" placeholder="e.g. 2.50" />
          </div>
        </div>

        <div class="form-group">
          <label id="lblUnitPrice" style="font-weight:700; color:var(--color-primary);">Current Market Price Rate (₹ / Ton)</label>
          <input type="number" step="0.01" id="saleWeightPrice" class="form-control mono" value="32000" placeholder="e.g. 32000 per Ton" required />
        </div>

        <div id="avgWeightInfoBox" style="font-size:0.88rem; color:var(--color-primary); margin-bottom:1rem; padding:0.65rem 0.85rem; background:rgba(5,150,105,0.08); border-left:4px solid var(--color-primary); border-radius:4px;">
          <div id="txtAvgWeight">⚖️ Average Weight: 0.500 Kg (500g / nut)</div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight:700;">Save Delivery Sale</button>
        </div>
      </form>
    `;

    const basisSel = getEl('saleBillingBasis');
    const grpWeight = getEl('grpWeightVal');
    const lblWeight = getEl('lblWeightVal');
    const lblPrice = getEl('lblUnitPrice');
    const inpWeight = getEl('saleWeightVal');
    const inpNutCount = getEl('saleNutCount');
    const inpPrice = getEl('saleWeightPrice');
    const txtAvgWeight = getEl('txtAvgWeight');

    const updateCalculationsDisplay = () => {
      const b = basisSel ? basisSel.value : 'per_ton';
      const nuts = Number(inpNutCount ? inpNutCount.value : 0) || 0;
      const wVal = Number(inpWeight ? inpWeight.value : 0) || 0;
      const rate = Number(inpPrice ? inpPrice.value : 0) || 0;

      if (b === 'per_nut') {
        const totalRev = nuts * rate;
        if (txtAvgWeight) {
          txtAvgWeight.innerHTML = `
            <div style="margin-bottom:0.2rem;">🥥 <strong>Total Nut Count:</strong> ${nuts.toLocaleString()} nuts</div>
            <div>💰 <strong>Calculated Total Revenue:</strong> ₹ ${totalRev.toLocaleString()} (at ₹ ${rate.toFixed(2)} / nut)</div>
          `;
        }
        return;
      }

      if (nuts <= 0 || wVal <= 0) return;

      const weightInKg = b === 'per_ton' ? (wVal * 1000) : wVal;
      const avgKgPerNut = weightInKg / nuts;
      const avgGramsPerNut = Math.round(avgKgPerNut * 1000);
      const totalRev = wVal * rate;
      const effPricePerNut = nuts > 0 ? (totalRev / nuts) : 0;

      if (txtAvgWeight) {
        txtAvgWeight.innerHTML = `
          <div style="margin-bottom:0.2rem;">⚖️ <strong>Average Weight:</strong> ${avgKgPerNut.toFixed(3)} Kg (${avgGramsPerNut}g / nut)</div>
          <div style="margin-bottom:0.2rem;">💰 <strong>Calculated Total Revenue:</strong> ₹ ${totalRev.toLocaleString()} (${b === 'per_ton' ? '₹ ' + rate.toLocaleString() + ' / Ton' : '₹ ' + rate + ' / Kg'})</div>
          <div>🏷️ <strong>Effective Rate per Nut:</strong> ₹ ${effPricePerNut.toFixed(2)} / nut</div>
        `;
      }
    };

    basisSel?.addEventListener('change', () => {
      const val = basisSel.value;
      if (val === 'per_ton') {
        if (grpWeight) grpWeight.style.display = 'block';
        if (lblWeight) lblWeight.textContent = 'Total Weight (in Tons)';
        if (lblPrice) lblPrice.textContent = 'Current Market Price Rate (₹ / Ton)';
        if (inpPrice) inpPrice.value = '32000';
      } else if (val === 'per_kg') {
        if (grpWeight) grpWeight.style.display = 'block';
        if (lblWeight) lblWeight.textContent = 'Total Weight (in Kg)';
        if (lblPrice) lblPrice.textContent = 'Current Market Price Rate (₹ / Kg)';
        if (inpPrice) inpPrice.value = '32';
      } else {
        if (grpWeight) grpWeight.style.display = 'none';
        if (lblPrice) lblPrice.textContent = 'Price per Nut (₹ / nut)';
        if (inpPrice) inpPrice.value = '25';
      }
      updateCalculationsDisplay();
    });

    inpNutCount?.addEventListener('input', updateCalculationsDisplay);
    inpWeight?.addEventListener('input', updateCalculationsDisplay);
    inpPrice?.addEventListener('input', updateCalculationsDisplay);

    updateCalculationsDisplay();

    getEl('newCoconutSaleForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const nuts = Number(getEl('saleNutCount').value);
      const cType = getEl('saleCoconutType').value;
      const bBasis = getEl('saleBillingBasis').value;
      const cTypeLabel = cType === 'with_tail' ? 'Coconut with Tail (Public)' : 'Coconut without Tail (Copra)';
      const unitP = Number(getEl('saleWeightPrice').value);

      let totalRev = 0;
      let wVal = null;
      let wKg = null;
      let avgKg = null;

      if (bBasis === 'per_ton') {
        wVal = Number(getEl('saleWeightVal').value);
        totalRev = wVal * unitP;
        wKg = wVal * 1000;
        avgKg = nuts > 0 ? (wKg / nuts) : 0;
      } else if (bBasis === 'per_kg') {
        wVal = Number(getEl('saleWeightVal').value);
        totalRev = wVal * unitP;
        wKg = wVal;
        avgKg = nuts > 0 ? (wKg / nuts) : 0;
      } else {
        totalRev = nuts * unitP;
      }

      store.addSale({
        lotIds: Array.from(document.querySelectorAll('input[name="saleLotCheck"]:checked')).map(cb => cb.value),
        date: getEl('saleDate').value,
        type: 'coconut',
        buyerName: getEl('saleBuyer').value,
        coconutType: cType,
        coconutTypeLabel: cTypeLabel,
        billingBasis: bBasis,
        quantity: nuts,
        weightVal: wVal,
        weightKg: wKg,
        avgKgPerNut: avgKg,
        unitPrice: unitP,
        totalRevenue: totalRev,
        paymentStatus: 'paid'
      });
      closeModal();
      renderView(currentTab);
    });
  }
  openModal();
}

function openNewHuskSaleModal() {
  const lots = store.getLots();
  const rates = store.getMarketRates().husks;
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = getLang() === 'ta' ? "நார் மட்டை விற்பனை பதிவு" : "Log Coir Husk Sale";
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newHuskSaleForm">
        <div class="form-group">
          <label style="font-weight:700; color:var(--color-accent);">Coir Husk Classification (மட்டை வகை)</label>
          <select id="huskCategory" class="form-control" style="font-weight:700;">
            <option value="green_husk" selected>🟢 Green Husk (பச்சை மட்டை)</option>
            <option value="black_husk">⚫ Black / Dry Husk (காய்ந்த மட்டை / கருப்பு மட்டை)</option>
          </select>
        </div>

        <div class="form-group">
          <label>Associated Harvest Lots</label>
          <div style="max-height:100px; overflow-y:auto; background:var(--bg-card-hover); padding:0.5rem; border-radius:4px;">
            ${lots.map(l => `
              <label style="display:flex; gap:0.5rem; margin-bottom:0.3rem;">
                <input type="checkbox" name="huskLotCheck" value="${l.id}" />
                <span>${l.lotNumber}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="huskDate" class="form-control" value="${new Date().toISOString().slice(0,10)}" required />
          </div>
          <div class="form-group">
            <label>Coir Mill Name</label>
            <input type="text" id="huskMill" class="form-control" placeholder="e.g. Sri Lakshmi Coir Fibres" required />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Husk Count</label>
            <input type="number" id="huskQty" class="form-control mono" value="6000" required />
          </div>
          <div class="form-group">
            <label>Price per 1,000 Husks (₹)</label>
            <input type="number" id="huskRate1k" class="form-control mono" value="${rates.rawHuskPer1000}" required />
          </div>
        </div>
        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight:700;">Save Husk Sale</button>
        </div>
      </form>
    `;
    getEl('newHuskSaleForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = Number(getEl('huskQty').value);
      const r = Number(getEl('huskRate1k').value);
      const hCat = getEl('huskCategory').value;
      const hLabel = hCat === 'green_husk' ? 'Green Husk (பச்சை)' : 'Black / Dry Husk (காய்ந்த)';

      store.addSale({
        lotIds: Array.from(document.querySelectorAll('input[name="huskLotCheck"]:checked')).map(cb => cb.value),
        date: getEl('huskDate').value,
        type: 'husk',
        huskCategory: hCat,
        huskTypeLabel: hLabel,
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
}

function openNewExpenseModal() {
  const lots = store.getLots();
  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = getLang() === 'ta' ? "செலவு / பட்டா பதிவு" : "Log Expense / Worker Bata";
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="newExpenseForm">
        <div class="form-row">
          <div class="form-group">
            <label>Date</label>
            <input type="date" id="expDate" class="form-control" value="${new Date().toISOString().slice(0,10)}" required />
          </div>
          <div class="form-group">
            <label>Category</label>
            <select id="expCategory" class="form-control" required>
              <option value="Weighbridge & Tare Scale Charges">⚖️ Weighbridge / Tare Scale Charges (எடை மேடை)</option>
              <option value="Fuel & Transport Freight">🚚 Transport & Vehicle Freight / Diesel (வண்டி வாடகை)</option>
              <option value="Meals & Worker Bata">☕ Meals & Worker Tea Bata (சாப்பாடு / டீ பட்டா)</option>
              <option value="Loading & Unloading Charges">📦 Loading & Unloading Charges (ஏற்றி இறக்கும் கூலி)</option>
              <option value="Yard Rent & Storage Maintenance">🏡 Yard Rent & Storage Maintenance (களம் வாடகை)</option>
              <option value="Equipment & Knife Maintenance">🛠️ Equipment & Knife Maintenance (கருவிகள் பழுது)</option>
              <option value="Market Taxes & Toll Charges">📑 Market Taxes, Cess & Toll (வரிகள் / டோல்)</option>
              <option value="Miscellaneous Overhead">📌 Miscellaneous Field Overhead (இதர செலவுகள்)</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Associated Lot</label>
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
            <option value="UPI">UPI</option>
          </select>
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
        notes: ''
      });
      closeModal();
      renderView(currentTab);
    });
  }
  openModal();
}

function openGenerateClientBillModal(lotId) {
  const lot = store.getLotById(lotId);
  if (!lot) return;
  const client = store.getClientById(lot.clientId);
  const currency = store.data.traderInfo.currency;
  
  let defaultRate = 12.50;
  if (client) {
    if (client.ratePerPiece !== undefined) defaultRate = client.ratePerPiece;
    else if (client.ratePer1000Nuts !== undefined) defaultRate = client.ratePer1000Nuts > 100 ? client.ratePer1000Nuts / 1000 : client.ratePer1000Nuts;
  }
  
  const currentQuickCash = client ? (client.quickCashBalance || 0) : 0;
  const initialGoodCount = Math.max(0, lot.grossHarvestCount - (lot.badNutCount || 0));
  const initialBadCount = lot.badNutCount || 0;

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `Make Client Settlement Bill: ${lot.lotNumber}`;
  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="generateClientBillForm">
        <div style="background:var(--bg-card-hover); padding:0.75rem 1rem; border-radius:var(--radius-md); margin-bottom:1rem;">
          <h4 style="margin:0;">Farm Owner: ${client ? client.name : 'Unknown'} (${client ? client.location : ''})</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin-top:0.2rem;">Gross Lot Harvest: <strong>${lot.grossHarvestCount.toLocaleString()} nuts</strong> | Contract Advance: ₹ ${(client ? client.contractAdvance : 0).toLocaleString()}</p>
        </div>

        <!-- 3-Tier Coconut Pricing & Count Form Section -->
        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1rem;">
          <h4 style="color:var(--color-primary); margin:0 0 0.75rem 0; font-size:1.05rem;">🥥 Multi-Grade Coconut Pricing & Count Breakdown</h4>
          
          <!-- 1. Good / Grade A Coconuts -->
          <div class="form-row" style="margin-bottom:0.75rem;">
            <div class="form-group">
              <label style="color:var(--color-primary); font-weight:700;">1. Good Coconuts Count (நல்ல தேங்காய்)</label>
              <input type="number" id="billGoodCount" class="form-control mono" value="${initialGoodCount}" style="font-weight:700;" required />
            </div>
            <div class="form-group">
              <label style="color:var(--color-primary); font-weight:700;">Rate / Piece (₹)</label>
              <input type="number" step="0.25" id="billGoodRate" class="form-control mono" value="${defaultRate}" style="font-weight:700;" required />
            </div>
          </div>

          <!-- 2. Small / Sipai Coconuts -->
          <div class="form-row" style="margin-bottom:0.75rem;">
            <div class="form-group">
              <label style="color:var(--color-accent); font-weight:700;">2. Small Coconuts Count (சின்ன தேங்காய் / சிப்பாய்)</label>
              <input type="number" id="billSmallCount" class="form-control mono" value="0" />
            </div>
            <div class="form-group">
              <label style="color:var(--color-accent); font-weight:700;">Small Rate / Piece (₹)</label>
              <input type="number" step="0.25" id="billSmallRate" class="form-control mono" value="${(defaultRate * 0.6).toFixed(2)}" />
            </div>
          </div>

          <!-- 3. Bad / Damaged Coconuts -->
          <div class="form-row">
            <div class="form-group">
              <label style="color:var(--color-danger); font-weight:700;">3. Bad / Damaged Nuts Count (அழுகல் / சேதம்)</label>
              <input type="number" id="billBadCount" class="form-control mono" value="${initialBadCount}" />
            </div>
            <div class="form-group">
              <label style="color:var(--color-danger); font-weight:700;">Bad Rate / Piece (₹)</label>
              <input type="number" step="0.25" id="billBadRate" class="form-control mono" value="0.00" />
            </div>
          </div>
        </div>

        <!-- Deductions Section -->
        <div class="form-row">
          <div class="form-group">
            <label style="color:var(--color-accent); font-weight:700;">Unpaid Quick Cash Deduction (₹)</label>
            <input type="number" id="billQuickCash" class="form-control mono" value="${currentQuickCash}" max="${currentQuickCash}" />
            <small style="color:var(--text-muted);">Available Quick Cash: ₹ ${currentQuickCash.toLocaleString()}</small>
          </div>
          <div class="form-group">
            <label style="color:var(--color-danger); font-weight:700;">Transport / Loading Deduction (₹)</label>
            <input type="number" id="billTransport" class="form-control mono" value="0" placeholder="e.g. 1200" />
          </div>
        </div>

        <!-- Payment Settlement & Partial Pay Options -->
        <div style="background:var(--bg-card-hover); padding:0.85rem 1rem; border-radius:var(--radius-md); border:1px solid var(--border-color); margin-bottom:1rem;">
          <h4 style="margin:0 0 0.5rem 0; color:var(--color-primary); font-size:1.05rem;">💳 Payment Settlement & Partial Pay Options</h4>
          <div class="form-row">
            <div class="form-group">
              <label>Payment Option</label>
              <select id="billPmtType" class="form-control" style="font-weight:700;">
                <option value="full" selected>Full Payment (உடனே முழு தொகையும் பட்டுவாடா)</option>
                <option value="partial">Partial Payment (பகுதி தொகை பட்டுவாடா & பாக்கி)</option>
                <option value="pay_later">Pay Later (பின்னீடு பட்டுவாடா & முழு பாக்கி)</option>
              </select>
            </div>
            <div class="form-group">
              <label style="color:var(--color-primary); font-weight:700;">Amount Paid Now (₹)</label>
              <input type="number" id="billAmountPaidNow" class="form-control mono" style="font-size:1.1rem; font-weight:700;" value="0" />
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Payment Method</label>
            <select id="billPayMethod" class="form-control">
              <option value="UPI" selected>UPI Payment</option>
              <option value="Cash">Cash Handout</option>
              <option value="Bank Transfer">Bank RTGS / NEFT</option>
              <option value="Pay Later">Pay Later (கடன் / பாக்கி)</option>
            </select>
          </div>
          <div class="form-group">
            <label>Settlement Notes</label>
            <input type="text" id="billNotes" class="form-control" value="Settled harvest bill" />
          </div>
        </div>

        <div class="calc-summary-box" id="billCalcPreviewBox"></div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight:700;">Generate & Print Bill Invoice</button>
        </div>
      </form>
    `;

    const goodQtyInp = getEl('billGoodCount');
    const goodRateInp = getEl('billGoodRate');
    const smallQtyInp = getEl('billSmallCount');
    const smallRateInp = getEl('billSmallRate');
    const badQtyInp = getEl('billBadCount');
    const badRateInp = getEl('billBadRate');
    const qcInp = getEl('billQuickCash');
    const transInp = getEl('billTransport');
    const pmtTypeSel = getEl('billPmtType');
    const paidNowInp = getEl('billAmountPaidNow');
    const previewBox = getEl('billCalcPreviewBox');

    const updateBillCalc = () => {
      const goodQty = Number(goodQtyInp.value) || 0;
      const goodRate = Number(goodRateInp.value) || 0;
      const smallQty = Number(smallQtyInp.value) || 0;
      const smallRate = Number(smallRateInp.value) || 0;
      const badQty = Number(badQtyInp.value) || 0;
      const badRate = Number(badRateInp.value) || 0;

      const qc = Number(qcInp.value) || 0;
      const trans = Number(transInp.value) || 0;

      const goodAmt = goodQty * goodRate;
      const smallAmt = smallQty * smallRate;
      const badAmt = badQty * badRate;

      const totalQty = goodQty + smallQty + badQty;
      const grossBillAmt = goodAmt + smallAmt + badAmt;
      const net = grossBillAmt - (qc + trans);

      const isPartial = pmtTypeSel && pmtTypeSel.value === 'partial';
      const isPayLater = pmtTypeSel && pmtTypeSel.value === 'pay_later';
      let amountPaidNow = net;
      let pendingBal = 0;

      if (isPayLater) {
        amountPaidNow = 0;
        if (paidNowInp) paidNowInp.value = 0;
        pendingBal = net;
        const payMethodSel = getEl('billPayMethod');
        if (payMethodSel) payMethodSel.value = 'Pay Later';
      } else if (isPartial) {
        amountPaidNow = Math.min(net, Number(paidNowInp.value) || 0);
        pendingBal = Math.max(0, net - amountPaidNow);
      } else {
        if (paidNowInp) paidNowInp.value = net;
        amountPaidNow = net;
        pendingBal = 0;
      }

      if (previewBox) {
        previewBox.innerHTML = `
          <h4>Settlement Bill Preview for ${client ? client.name : 'Client'}</h4>
          <div class="calc-summary-row"><span>1. Good Coconuts (${goodQty.toLocaleString()} @ ₹${goodRate.toFixed(2)}):</span><span class="mono">₹ ${goodAmt.toLocaleString()}</span></div>
          ${smallQty > 0 ? `<div class="calc-summary-row"><span>2. Small Coconuts (${smallQty.toLocaleString()} @ ₹${smallRate.toFixed(2)}):</span><span class="mono">₹ ${smallAmt.toLocaleString()}</span></div>` : ''}
          ${badQty > 0 ? `<div class="calc-summary-row"><span>3. Bad/Damaged Nuts (${badQty.toLocaleString()} @ ₹${badRate.toFixed(2)}):</span><span class="mono">₹ ${badAmt.toLocaleString()}</span></div>` : ''}
          <div class="calc-summary-row" style="font-weight:700;"><span>Gross Harvest Value (${totalQty.toLocaleString()} nuts):</span><span class="mono">₹ ${grossBillAmt.toLocaleString()}</span></div>
          <div class="calc-summary-row" style="color:var(--color-accent);"><span>(-) Quick Cash Deducted:</span><span class="mono">₹ ${qc.toLocaleString()}</span></div>
          <div class="calc-summary-row" style="color:var(--color-danger);"><span>(-) Transport/Loading:</span><span class="mono">₹ ${trans.toLocaleString()}</span></div>
          <div class="calc-summary-row total" style="color:var(--color-primary); font-size:1.1rem;">
            <span>TOTAL NET INVOICE VALUE:</span>
            <span class="mono">₹ ${net.toLocaleString()}</span>
          </div>
          <div class="calc-summary-row" style="font-weight:700; color:var(--color-primary);">
            <span>AMOUNT PAID NOW:</span>
            <span class="mono">₹ ${amountPaidNow.toLocaleString()}</span>
          </div>
          ${pendingBal > 0 ? `
            <div class="calc-summary-row" style="font-weight:800; color:var(--color-accent); font-size:1.15rem; background:rgba(245, 158, 11, 0.15); padding:0.4rem; border-radius:4px; margin-top:0.3rem;">
              <span>PENDING UNSETTLED BALANCE:</span>
              <span class="mono">₹ ${pendingBal.toLocaleString()}</span>
            </div>
          ` : ''}
        `;
      }
    };

    [goodQtyInp, goodRateInp, smallQtyInp, smallRateInp, badQtyInp, badRateInp, qcInp, transInp, paidNowInp].forEach(inp => inp?.addEventListener('input', updateBillCalc));
    pmtTypeSel?.addEventListener('change', () => {
      if (pmtTypeSel.value === 'full') {
        const goodQty = Number(goodQtyInp.value) || 0;
        const goodRate = Number(goodRateInp.value) || 0;
        const smallQty = Number(smallQtyInp.value) || 0;
        const smallRate = Number(smallRateInp.value) || 0;
        const badQty = Number(badQtyInp.value) || 0;
        const badRate = Number(badRateInp.value) || 0;
        const qc = Number(qcInp.value) || 0;
        const trans = Number(transInp.value) || 0;
        const net = (goodQty * goodRate + smallQty * smallRate + badQty * badRate) - (qc + trans);
        if (paidNowInp) paidNowInp.value = net;
      } else if (pmtTypeSel.value === 'pay_later') {
        if (paidNowInp) paidNowInp.value = 0;
      }
      updateBillCalc();
    });
    updateBillCalc();

    getEl('generateClientBillForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const goodQty = Number(goodQtyInp.value) || 0;
      const goodRate = Number(goodRateInp.value) || 0;
      const smallQty = Number(smallQtyInp.value) || 0;
      const smallRate = Number(smallRateInp.value) || 0;
      const badQty = Number(badQtyInp.value) || 0;
      const badRate = Number(badRateInp.value) || 0;

      const qc = Number(qcInp.value) || 0;
      const trans = Number(transInp.value) || 0;

      const goodAmt = goodQty * goodRate;
      const smallAmt = smallQty * smallRate;
      const badAmt = badQty * badRate;

      const totalQty = goodQty + smallQty + badQty;
      const grossBillAmt = goodAmt + smallAmt + badAmt;
      const net = grossBillAmt - (qc + trans);

      const isPartial = pmtTypeSel && pmtTypeSel.value === 'partial';
      const isPayLater = pmtTypeSel && pmtTypeSel.value === 'pay_later';
      const amountPaidNow = isPayLater ? 0 : (isPartial ? Math.min(net, Number(paidNowInp.value) || 0) : net);
      const pendingBal = isPayLater ? net : Math.max(0, net - amountPaidNow);
      const payMethod = isPayLater ? 'Pay Later' : getEl('billPayMethod').value;

      const bill = store.saveClientBill({
        lotId: lotId,
        clientId: lot.clientId,
        billDate: new Date().toISOString().slice(0,10),
        goodCount: goodQty,
        goodRate: goodRate,
        goodAmount: goodAmt,
        smallCount: smallQty,
        smallRate: smallRate,
        smallAmount: smallAmt,
        badNutCount: badQty,
        badRate: badRate,
        badAmount: badAmt,
        grossCount: totalQty,
        acceptedCount: goodQty + smallQty,
        ratePerPiece: goodRate,
        ratePer1000: goodRate * 1000,
        grossAmount: grossBillAmt,
        quickCashDeduction: qc,
        advanceDeduction: 0,
        transportDeduction: trans,
        bonusAmount: 0,
        netPayable: net,
        amountPaid: amountPaidNow,
        pendingBalance: pendingBal,
        paymentStatus: pendingBal === 0 ? 'paid' : (isPayLater ? 'unpaid' : 'partial'),
        paymentHistory: amountPaidNow > 0 ? [
          { id: "pmt_" + Date.now(), date: new Date().toISOString().slice(0,10), amount: amountPaidNow, method: payMethod, notes: 'Initial bill settlement' }
        ] : [],
        paymentMethod: payMethod,
        notes: getEl('billNotes').value,
        status: 'billed'
      });

      closeModal();
      renderView(currentTab);
      openBillReviewModal(bill.id);
    });
  }
  openModal();
}

function openSettleClientPendingBalanceModal(clientId, billId) {
  const client = store.getClientById(clientId);
  if (!client) return;
  const bills = store.getClientBills().filter(b => b.clientId === clientId && ((b.pendingBalance || 0) > 0 || b.id === billId));
  const targetBill = bills.find(b => b.id === billId) || bills[0];

  if (!targetBill || !((targetBill.pendingBalance || 0) > 0)) {
    alert("No pending balance found for this client bill.");
    return;
  }

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `💵 Pay Pending Bill Balance: ${client.name}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="settleClientBalanceForm">
        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); border-left:4px solid var(--color-accent); margin-bottom:1.25rem;">
          <h4 style="margin:0; font-size:1.1rem;">Farm Owner: ${client.name}</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin:0.25rem 0 0 0;">
            Invoice #: <strong>${targetBill.billNumber}</strong> | Bill Net Value: <strong>₹ ${targetBill.netPayable.toLocaleString()}</strong><br>
            Amount Paid So Far: <strong style="color:var(--color-primary);">₹ ${(targetBill.amountPaid || targetBill.netPayable).toLocaleString()}</strong>
          </p>
          <div style="margin-top:0.5rem; font-size:1.2rem; font-weight:800; color:var(--color-accent);">
            Current Pending Balance: ₹ ${(targetBill.pendingBalance || 0).toLocaleString()}
          </div>
        </div>

        <div class="form-group">
          <label style="color:var(--color-primary); font-weight:700;">Balance Amount Paid Now (₹)</label>
          <input type="number" id="balPayAmount" class="form-control mono" style="font-size:1.2rem; font-weight:700;" value="${targetBill.pendingBalance}" max="${targetBill.pendingBalance}" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Payment Method</label>
            <select id="balPayMethod" class="form-control" required>
              <option value="UPI" selected>UPI Payment</option>
              <option value="Cash">Cash Handout</option>
              <option value="Bank Transfer">Bank RTGS / NEFT</option>
            </select>
          </div>
          <div class="form-group">
            <label>Payment Remarks / Notes</label>
            <input type="text" id="balPayNotes" class="form-control" value="Early balance bill payment" />
          </div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight:700;">Confirm Balance Payment</button>
        </div>
      </form>
    `;

    getEl('settleClientBalanceForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const payAmt = Number(getEl('balPayAmount').value) || 0;
      if (payAmt <= 0) return;

      targetBill.pendingBalance = Math.max(0, (targetBill.pendingBalance || 0) - payAmt);
      targetBill.amountPaid = (targetBill.amountPaid || 0) + payAmt;
      if (targetBill.pendingBalance === 0) {
        targetBill.paymentStatus = 'paid';
      } else {
        targetBill.paymentStatus = 'partial';
      }

      if (!targetBill.paymentHistory) targetBill.paymentHistory = [];
      targetBill.paymentHistory.push({
        id: "pmt_" + Date.now(),
        date: new Date().toISOString().slice(0,10),
        amount: payAmt,
        method: getEl('balPayMethod').value,
        notes: getEl('balPayNotes').value
      });

      store.saveData();
      closeModal();
      renderView(currentTab);
      alert(`Early balance payment of ₹ ${payAmt.toLocaleString()} recorded successfully for ${client.name}!`);
    });
  }
  openModal();
}

function openSettleWorkerPendingBalanceModal(workerId, payoutId) {
  const worker = store.getWorkerById(workerId);
  if (!worker) return;

  const history = worker.payrollHistory || [];
  const payout = history.find(p => p.id === payoutId) || history.find(p => (p.pendingBalance || 0) > 0);

  if (!payout || !((payout.pendingBalance || 0) > 0)) {
    alert("No pending wage balance found for this worker.");
    return;
  }

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `💵 Pay Pending Wage Balance: ${worker.name}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <form id="settleWorkerBalanceForm">
        <div style="background:var(--bg-card-hover); padding:1rem; border-radius:var(--radius-md); border-left:4px solid var(--color-accent); margin-bottom:1.25rem;">
          <h4 style="margin:0; font-size:1.1rem;">Labour Worker: ${worker.name} (${worker.role.toUpperCase()})</h4>
          <p style="font-size:0.85rem; color:var(--text-muted); margin:0.25rem 0 0 0;">
            Payout Period: <strong>${payout.period}</strong> | Total Net Wage: <strong>₹ ${payout.netPaid.toLocaleString()}</strong><br>
            Amount Paid So Far: <strong style="color:var(--color-primary);">₹ ${(payout.amountPaid || payout.netPaid).toLocaleString()}</strong>
          </p>
          <div style="margin-top:0.5rem; font-size:1.2rem; font-weight:800; color:var(--color-accent);">
            Current Pending Wage Balance: ₹ ${(payout.pendingBalance || 0).toLocaleString()}
          </div>
        </div>

        <div class="form-group">
          <label style="color:var(--color-primary); font-weight:700;">Wage Balance Amount Paid Now (₹)</label>
          <input type="number" id="wBalPayAmount" class="form-control mono" style="font-size:1.2rem; font-weight:700;" value="${payout.pendingBalance}" max="${payout.pendingBalance}" required />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Payment Method</label>
            <select id="wBalPayMethod" class="form-control" required>
              <option value="Cash" selected>Cash Handout</option>
              <option value="UPI">UPI Transfer</option>
            </select>
          </div>
          <div class="form-group">
            <label>Payment Remarks / Notes</label>
            <input type="text" id="wBalPayNotes" class="form-control" value="Early balance wage settlement" />
          </div>
        </div>

        <div style="margin-top:1.5rem; display:flex; justify-content:flex-end; gap:0.5rem;">
          <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Cancel</button>
          <button type="submit" class="btn btn-primary" style="font-weight:700;">Confirm Wage Payment</button>
        </div>
      </form>
    `;

    getEl('settleWorkerBalanceForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const payAmt = Number(getEl('wBalPayAmount').value) || 0;
      if (payAmt <= 0) return;

      payout.pendingBalance = Math.max(0, (payout.pendingBalance || 0) - payAmt);
      payout.amountPaid = (payout.amountPaid || 0) + payAmt;
      if (payout.pendingBalance === 0) {
        payout.paymentStatus = 'paid';
      } else {
        payout.paymentStatus = 'partial';
      }

      if (!payout.paymentHistory) payout.paymentHistory = [];
      payout.paymentHistory.push({
        id: "wpmt_" + Date.now(),
        date: new Date().toISOString().slice(0,10),
        amount: payAmt,
        method: getEl('wBalPayMethod').value,
        notes: getEl('wBalPayNotes').value
      });

      store.saveData();
      closeModal();
      renderView(currentTab);
      alert(`Early pending wage balance payment of ₹ ${payAmt.toLocaleString()} recorded successfully for ${worker.name}!`);
    });
  }
  openModal();
}

function printWorkerPayslip(workerId, payoutId) {
  const worker = store.getWorkerById(workerId);
  if (!worker) return;

  const history = worker.payrollHistory || [];
  const payout = history.find(p => p.id === payoutId) || history[0];
  if (!payout) {
    alert("No payslip record found for this worker.");
    return;
  }

  const printArea = getEl('printContainer');
  if (!printArea) return;

  const grossWage = payout.grossWage || 0;
  const qcDeducted = payout.quickCashDeducted || 0;
  const allowances = payout.allowances || 0;
  const deductions = payout.deductions || 0;
  const netPaid = payout.netPaid || 0;
  const nutsHandled = payout.allocatedNutCount || 0;

  const attendanceForWorker = (store.data.attendanceLogs || []).filter(a => a.workerId === workerId);
  const lotLogs = (payout.lotIds && payout.lotIds.length > 0)
    ? attendanceForWorker.filter(a => payout.lotIds.includes(a.lotId))
    : attendanceForWorker;

  const lotContributions = lotLogs.map(a => {
    const lot = store.getLotById(a.lotId);
    const client = lot ? store.getClientById(lot.clientId) : null;
    const farmName = client ? client.name : 'Farm';
    const grossNuts = lot ? Number(lot.grossHarvestCount || 0) : 0;
    
    const attendanceForLot = store.getAttendanceForLot(a.lotId);
    const sameRoleAtts = attendanceForLot.filter(att => {
      const wrk = store.getWorkerById(att.workerId);
      const r = att.role || (wrk ? wrk.role : '');
      return r === worker.role;
    });

    const sameRoleCount = sameRoleAtts.length || 1;
    const workerShare = getWorkerNutShareForLot(workerId, a.lotId, worker.role);

    return {
      lotNumber: lot ? lot.lotNumber : a.lotId,
      farmName: farmName,
      date: a.date || (lot ? lot.harvestDate : ''),
      grossNuts: grossNuts,
      sameRoleCount: sameRoleCount,
      workerShare: workerShare
    };
  });

  printArea.innerHTML = `
    <div style="max-width:650px; margin:0 auto; padding:25px; font-family:Arial, sans-serif; color:#000; background:#fff;">
      <div style="text-align:center; border-bottom:2px solid #000; padding-bottom:12px; margin-bottom:20px;">
        <h2 style="margin:0; text-transform:uppercase;">${store.data.traderInfo.name}</h2>
        <p style="margin:4px 0;">${store.data.traderInfo.location} | Phone: ${store.data.traderInfo.phone}</p>
        <h3 style="margin-top:10px; background:#e2e8f0; padding:6px; font-size:1.1rem; text-transform:uppercase; letter-spacing:0.5px;">LABOUR WORKER PAYSLIP & WAGE SETTLEMENT RECEIPT</h3>
      </div>

      <div style="display:flex; justify-content:space-between; margin-bottom:20px; font-size:0.95rem;">
        <div>
          <p style="margin:3px 0;"><strong>Payslip Receipt No:</strong> ${payout.id}</p>
          <p style="margin:3px 0;"><strong>Settlement Date:</strong> ${payout.date}</p>
          <p style="margin:3px 0;"><strong>Payment Period:</strong> ${payout.period}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:3px 0;"><strong>Labour Worker:</strong> ${worker.name}</p>
          <p style="margin:3px 0;"><strong>Designation / Role:</strong> ${worker.role.toUpperCase()}</p>
          <p style="margin:3px 0;"><strong>Phone:</strong> ${worker.phone}</p>
        </div>
      </div>

      <!-- Farm Nut Count Contribution & Split Breakdown -->
      <div style="margin-bottom:20px; border:1px solid #cbd5e1; border-radius:4px; padding:10px; background:#f8fafc;">
        <h4 style="margin:0 0 8px 0; font-size:0.95rem; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:4px;">
          🌾 Farm Nut Count Contributions & Equal Split Details (${lotContributions.length} Lots Worked):
        </h4>
        <table style="width:100%; border-collapse:collapse; font-size:0.85rem;" border="1" cellpadding="6">
          <thead>
            <tr style="background:#e2e8f0; text-align:left;">
              <th>Farm / Lot Details</th>
              <th>Farm Harvest Total</th>
              <th>Same-Role Split</th>
              <th style="text-align:right;">Worker Share</th>
            </tr>
          </thead>
          <tbody>
            ${lotContributions.length === 0 ? '<tr><td colspan="4" style="text-align:center; color:#64748b;">No individual harvest lot breakdown logged.</td></tr>' : ''}
            ${lotContributions.map(c => `
              <tr>
                <td>📍 <strong>${c.farmName}</strong><br><small style="color:#64748b;">(${c.lotNumber} | ${c.date})</small></td>
                <td><strong>${c.grossNuts.toLocaleString()} nuts</strong></td>
                <td>${c.grossNuts.toLocaleString()} ÷ ${c.sameRoleCount} ${worker.role.toUpperCase()}(s)</td>
                <td style="text-align:right; font-weight:bold; color:#059669;">${c.workerShare.toLocaleString()} nuts</td>
              </tr>
            `).join('')}
            ${lotContributions.length > 0 ? `
              <tr style="background:#f1f5f9; font-weight:bold;">
                <td colspan="3" style="text-align:right;">TOTAL ACCUMULATED WEEKLY NUT SHARE:</td>
                <td style="text-align:right; color:#059669; font-size:0.95rem;">${nutsHandled.toLocaleString()} nuts</td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;" border="1" cellpadding="8">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="text-align:left;">Item Description</th>
            <th style="text-align:right;">Details / Rate</th>
            <th style="text-align:right;">Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Piece-Rate Nut Share Handled</strong></td>
            <td style="text-align:right;">${nutsHandled.toLocaleString()} nuts</td>
            <td style="text-align:right; font-weight:bold;">₹ ${grossWage.toLocaleString()}</td>
          </tr>
          <tr>
            <td>(+) Allowances & Performance Bonus</td>
            <td style="text-align:right;">Bonus / Meal Bata</td>
            <td style="text-align:right;">+ ₹ ${allowances.toLocaleString()}</td>
          </tr>
          <tr style="color:#c53030;">
            <td>(-) Quick Cash Advance Deducted</td>
            <td style="text-align:right;">Mid-cycle Cash Deducted</td>
            <td style="text-align:right;">- ₹ ${qcDeducted.toLocaleString()}</td>
          </tr>
          <tr style="color:#c53030;">
            <td>(-) Other Deductions / Penalties</td>
            <td style="text-align:right;">Other Deductions</td>
            <td style="text-align:right;">- ₹ ${deductions.toLocaleString()}</td>
          </tr>
          <tr style="background:#f1f5f9; font-size:1.1rem; font-weight:bold;">
            <td colspan="2" style="text-align:right;">NET SALARY PAID TO WORKER:</td>
            <td style="text-align:right; color:#059669;">₹ ${netPaid.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      ${worker.bankInfo ? `
        <div style="background:#f8fafc; padding:10px; border:1px solid #cbd5e1; margin-bottom:20px; font-size:0.85rem;">
          <strong>Worker Payment Account Details:</strong> ${worker.bankInfo.bankName ? worker.bankInfo.bankName + ' A/C: ' + worker.bankInfo.accountNumber + ' | IFSC: ' + worker.bankInfo.ifsc : 'Direct Cash Settlement'}
          ${worker.bankInfo.upiId ? ' | UPI: ' + worker.bankInfo.upiId : ''}
        </div>
      ` : ''}

      ${payout.notes ? `
        <div style="margin-bottom:20px; font-size:0.9rem;">
          <strong>Remarks / Notes:</strong> ${payout.notes}
        </div>
      ` : ''}

      <div style="margin-top:50px; display:flex; justify-content:space-between; text-align:center;">
        <div>
          <p style="border-top:1px dashed #000; padding-top:5px; width:180px;">Worker Signature / Thumb</p>
        </div>
        <div>
          <p style="border-top:1px dashed #000; padding-top:5px; width:180px;">Trader Authorized Signature</p>
        </div>
      </div>
    </div>
  `;

  window.print();
}

function openBillReviewModal(billId) {
  const bill = store.getClientBills().find(b => b.id === billId) || store.getClientBills()[0];
  if (!bill) {
    alert("Invoice bill not found.");
    return;
  }

  const client = store.getClientById(bill.clientId);
  const lot = store.getLotById(bill.lotId);
  const currency = store.data.traderInfo.currency;

  const goodQty = bill.goodCount !== undefined ? bill.goodCount : bill.acceptedCount;
  const goodRate = bill.goodRate !== undefined ? bill.goodRate : (bill.ratePerPiece || 12.50);
  const goodAmt = bill.goodAmount !== undefined ? bill.goodAmount : (goodQty * goodRate);

  const smallQty = bill.smallCount || 0;
  const smallRate = bill.smallRate || 0;
  const smallAmt = bill.smallAmount || 0;

  const badQty = bill.badNutCount || 0;
  const badRate = bill.badRate || 0;
  const badAmt = bill.badAmount || 0;

  const titleEl = getModalTitle();
  const bodyEl = getModalBody();
  if (titleEl) titleEl.textContent = `🧾 Settlement Invoice Generated: ${bill.billNumber}`;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div style="background:var(--bg-card-hover); padding:1rem 1.25rem; border-radius:var(--radius-md); border-left:4px solid var(--color-primary); margin-bottom:1.25rem; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem;">
        <div>
          <h3 style="margin:0; font-size:1.15rem;">Invoice No: <span class="mono">${bill.billNumber}</span></h3>
          <p style="font-size:0.9rem; margin-top:0.25rem; color:var(--text-muted);">
            Farm Owner: <strong>${client ? client.name : 'Unknown'}</strong> (${client ? client.location : ''})<br>
            Harvest Lot: <strong>${lot ? lot.lotNumber : '-'}</strong> | Date: <strong>${bill.billDate}</strong>
          </p>
        </div>
        <div style="text-align:right;">
          <span class="badge ${bill.paymentStatus === 'paid' ? 'badge-completed' : 'badge-transit'}" style="font-size:0.95rem; padding:0.4rem 0.8rem;">
            ${bill.paymentStatus === 'paid' ? '✅ BILLED & PAID IN FULL' : `⚠️ PARTIAL (Bal: ₹ ${(bill.pendingBalance || 0).toLocaleString()})`}
          </span>
        </div>
      </div>

      <div class="card-box" style="margin-bottom:1.25rem; padding:0.75rem;">
        <h4 style="margin:0 0 0.75rem 0; color:var(--color-primary); font-size:1.05rem;">🥥 Invoice Item Breakdown</h4>
        <div class="table-responsive">
          <table class="data-table" style="font-size:0.95rem;">
            <thead>
              <tr>
                <th>Item Particulars</th>
                <th>Quantity</th>
                <th>Rate / Piece</th>
                <th>Subtotal Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Good / Grade A Coconuts</strong></td>
                <td class="mono">${goodQty.toLocaleString()} nuts</td>
                <td class="mono">₹ ${goodRate.toFixed(2)}</td>
                <td class="mono" style="font-weight:700;">₹ ${goodAmt.toLocaleString()}</td>
              </tr>
              ${smallQty > 0 ? `
                <tr>
                  <td><strong>Small / Sipai Coconuts</strong></td>
                  <td class="mono">${smallQty.toLocaleString()} nuts</td>
                  <td class="mono">₹ ${smallRate.toFixed(2)}</td>
                  <td class="mono" style="font-weight:700;">₹ ${smallAmt.toLocaleString()}</td>
                </tr>
              ` : ''}
              ${badQty > 0 ? `
                <tr>
                  <td><strong>Bad / Damaged Nuts</strong></td>
                  <td class="mono">${badQty.toLocaleString()} nuts</td>
                  <td class="mono">₹ ${badRate.toFixed(2)}</td>
                  <td class="mono" style="font-weight:700;">₹ ${badAmt.toLocaleString()}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>
        </div>
      </div>

      <div class="calc-summary-box" style="margin-bottom:1.5rem;">
        <div class="calc-summary-row" style="font-weight:700;">
          <span>Gross Harvest Value (${bill.grossCount.toLocaleString()} nuts):</span>
          <span class="mono">₹ ${bill.grossAmount.toLocaleString()}</span>
        </div>
        ${(bill.quickCashDeduction || 0) > 0 ? `
          <div class="calc-summary-row" style="color:var(--color-accent);">
            <span>(-) Quick Cash Advance Deducted:</span>
            <span class="mono">₹ ${bill.quickCashDeduction.toLocaleString()}</span>
          </div>
        ` : ''}
        ${(bill.transportDeduction || 0) > 0 ? `
          <div class="calc-summary-row" style="color:var(--color-danger);">
            <span>(-) Transport / Loading Deducted:</span>
            <span class="mono">₹ ${bill.transportDeduction.toLocaleString()}</span>
          </div>
        ` : ''}
        <div class="calc-summary-row total" style="color:var(--color-primary); font-size:1.15rem;">
          <span>NET PAYABLE INVOICE AMOUNT:</span>
          <span class="mono">₹ ${bill.netPayable.toLocaleString()}</span>
        </div>
        <div class="calc-summary-row" style="font-weight:700; color:var(--color-primary);">
          <span>Amount Paid Now (${bill.paymentMethod || 'Cash'}):</span>
          <span class="mono">₹ ${(bill.amountPaid !== undefined ? bill.amountPaid : bill.netPayable).toLocaleString()}</span>
        </div>
        ${(bill.pendingBalance || 0) > 0 ? `
          <div class="calc-summary-row" style="font-weight:800; color:var(--color-accent); font-size:1.1rem; background:rgba(245, 158, 11, 0.15); padding:0.4rem; border-radius:4px; margin-top:0.3rem;">
            <span>REMAINING UNPAID BALANCE:</span>
            <span class="mono">₹ ${bill.pendingBalance.toLocaleString()}</span>
          </div>
        ` : ''}
      </div>

      <div style="display:flex; justify-content:flex-end; gap:0.5rem; flex-wrap:wrap;">
        <button type="button" class="btn btn-secondary" onclick="window.closeModal()">Close</button>
        <button type="button" class="btn btn-primary" style="font-weight:700;" onclick="window.printClientBill('${bill.id}')">🖨️ Print Invoice Bill</button>
      </div>
    `;
  }
  openModal();
}

function printClientBill(billId) {
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
        </div>
      </div>

      <table style="width:100%; border-collapse:collapse; margin-bottom:20px;" border="1" cellpadding="8">
        <thead>
          <tr style="background:#f8fafc;">
            <th style="text-align:left;">Coconut Grade / Category</th>
            <th style="text-align:right;">Quantity</th>
            <th style="text-align:right;">Rate / Piece</th>
            <th style="text-align:right;">Amount (${currency})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>1. Good Coconuts (நல்ல தேங்காய்)</strong></td>
            <td style="text-align:right;">${(bill.goodCount !== undefined ? bill.goodCount : bill.acceptedCount).toLocaleString()} nuts</td>
            <td style="text-align:right;">₹ ${(bill.goodRate !== undefined ? bill.goodRate : bill.ratePerPiece).toFixed(2)}</td>
            <td style="text-align:right; font-weight:bold;">${currency} ${(bill.goodAmount !== undefined ? bill.goodAmount : (bill.acceptedCount * bill.ratePerPiece)).toLocaleString()}</td>
          </tr>
          ${(bill.smallCount || 0) > 0 ? `
            <tr>
              <td>2. Small Coconuts (சின்ன தேங்காய் / சிப்பாய்)</td>
              <td style="text-align:right;">${bill.smallCount.toLocaleString()} nuts</td>
              <td style="text-align:right;">₹ ${(bill.smallRate || 0).toFixed(2)}</td>
              <td style="text-align:right;">${currency} ${(bill.smallAmount || 0).toLocaleString()}</td>
            </tr>
          ` : ''}
          ${(bill.badNutCount || 0) > 0 ? `
            <tr style="color:#c53030;">
              <td>3. Bad / Damaged Nuts (அழுகல் / சேதம்)</td>
              <td style="text-align:right;">${bill.badNutCount.toLocaleString()} nuts</td>
              <td style="text-align:right;">₹ ${(bill.badRate || 0).toFixed(2)}</td>
              <td style="text-align:right;">${currency} ${(bill.badAmount || 0).toLocaleString()}</td>
            </tr>
          ` : ''}
          <tr style="background:#f1f5f9; font-weight:bold;">
            <td colspan="3" style="text-align:right;">GROSS HARVEST VALUE:</td>
            <td style="text-align:right;">${currency} ${bill.grossAmount.toLocaleString()}</td>
          </tr>
          ${(bill.quickCashDeduction || 0) > 0 ? `
            <tr style="color:#c53030;">
              <td colspan="3" style="text-align:right;">(-) Quick Cash Advance Adjusted:</td>
              <td style="text-align:right;">- ${currency} ${bill.quickCashDeduction.toLocaleString()}</td>
            </tr>
          ` : ''}
          ${(bill.transportDeduction || 0) > 0 ? `
            <tr style="color:#c53030;">
              <td colspan="3" style="text-align:right;">(-) Transport / Freight Deductions:</td>
              <td style="text-align:right;">- ${currency} ${bill.transportDeduction.toLocaleString()}</td>
            </tr>
          ` : ''}
          <tr style="background:#e6fffa; font-weight:bold; font-size:1.1rem;">
            <td colspan="3" style="text-align:right;">TOTAL NET INVOICE VALUE:</td>
            <td style="text-align:right; color:#059669;">${currency} ${bill.netPayable.toLocaleString()}</td>
          </tr>
          <tr style="font-weight:bold;">
            <td colspan="3" style="text-align:right;">AMOUNT PAID SO FAR:</td>
            <td style="text-align:right; color:#2563eb;">${currency} ${(bill.amountPaid !== undefined ? bill.amountPaid : bill.netPayable).toLocaleString()}</td>
          </tr>
          ${(bill.pendingBalance || 0) > 0 ? `
            <tr style="background:#fef3c7; font-weight:bold; color:#d97706;">
              <td colspan="3" style="text-align:right;">REMAINING UNSETTLED BALANCE:</td>
              <td style="text-align:right;">${currency} ${bill.pendingBalance.toLocaleString()}</td>
            </tr>
          ` : ''}
        </tbody>
      </table>
    </div>
  `;

  window.print();
}

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

// Global Window Object Function Exports
window.openModal = openModal;
window.closeModal = closeModal;
window.openNewLotModal = openNewLotModal;
window.openNewClientModal = openNewClientModal;
window.openNewWorkerModal = openNewWorkerModal;
window.openNewCoconutSaleModal = openNewCoconutSaleModal;
window.openNewHuskSaleModal = openNewHuskSaleModal;
window.openNewExpenseModal = openNewExpenseModal;
window.openMakeBillModal = openGenerateClientBillModal;
window.openGenerateClientBillModal = openGenerateClientBillModal;
window.openBillReviewModal = openBillReviewModal;
window.openLotDetailsModal = openLotDetailsModal;
window.openLotLaboursModal = openLotLaboursModal;
window.openEditLotNutSplitModal = openEditLotNutSplitModal;
window.openGiveClientQuickCashModal = openGiveClientQuickCashModal;
window.openGiveWorkerQuickCashModal = openGiveWorkerQuickCashModal;
window.openWorkerPayrollModal = openWorkerPayrollModal;
window.openSettlePendingBalanceModal = openSettlePendingBalanceModal;
window.openSettleWorkerPendingBalanceModal = openSettleWorkerPendingBalanceModal;
window.printWorkerPayslip = printWorkerPayslip;
window.printClientBill = printClientBill;
window.exportLedgerCSV = exportLedgerCSV;
window.exportDataJSON = exportDataJSON;
window.resetAppDatabase = resetAppDatabase;
window.clearFinanceFilters = clearFinanceFilters;
window.toggleTheme = toggleTheme;
window.toggleLanguage = toggleLanguage;
window.switchTab = switchTab;
