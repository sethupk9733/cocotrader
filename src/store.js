/**
 * CocoTrader PRO - State & Data Store
 * Handles Farm Harvest Lots, Multi-Farm Sales, Payroll Schedules, and Advance Return Ledgers
 */

const STORAGE_KEY = 'cocotrader_pro_db_v3';

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
  clients: [
    {
      id: "cli_1",
      name: "Ramasamy Gounder",
      phone: "+91 94431 12345",
      location: "Anaimalai Farm (Sector A)",
      treeCount: 450,
      ratePer1000Nuts: 12500,
      contractAdvance: 15000,
      advanceBalance: 15000,
      advanceHistory: [
        { id: "adv_c1", date: "2026-08-01", type: "advance_given", amount: 15000, notes: "Contract advance paid upon harvest agreement" }
      ],
      notes: "High yield tall palms, harvested every 45 days."
    },
    {
      id: "cli_2",
      name: "Lakshmi Farm Estate",
      phone: "+91 98422 67890",
      location: "Kinathukadavu Rd",
      treeCount: 600,
      ratePer1000Nuts: 13000,
      contractAdvance: 20000,
      advanceBalance: 20000,
      advanceHistory: [
        { id: "adv_c2", date: "2026-08-05", type: "advance_given", amount: 20000, notes: "Season contract advance" }
      ],
      notes: "Hybrid dwarf trees, easy climbing."
    }
  ],
  workers: [
    {
      id: "wrk_1",
      name: "Kaliappan",
      role: "cutter",
      settlementType: "weekly_saturday",
      wageRatePer1000: 2500,
      phone: "+91 91234 00001",
      status: "active",
      contractAdvance: 5000,
      advanceBalance: 5000,
      advanceHistory: [
        { id: "adv_w1", date: "2026-08-01", type: "advance_given", amount: 5000, notes: "Joining contract advance" }
      ]
    },
    {
      id: "wrk_2",
      name: "Velusamy",
      role: "cutter",
      settlementType: "weekly_saturday",
      wageRatePer1000: 2500,
      phone: "+91 91234 00002",
      status: "active",
      contractAdvance: 5000,
      advanceBalance: 5000,
      advanceHistory: [
        { id: "adv_w2", date: "2026-08-01", type: "advance_given", amount: 5000, notes: "Joining contract advance" }
      ]
    },
    {
      id: "wrk_3",
      name: "Mariammal",
      role: "picker",
      settlementType: "weekly_saturday",
      wageRatePer1000: 1000,
      phone: "+91 91234 00003",
      status: "active",
      contractAdvance: 3000,
      advanceBalance: 3000,
      advanceHistory: [
        { id: "adv_w3", date: "2026-08-02", type: "advance_given", amount: 3000, notes: "Joining advance" }
      ]
    },
    {
      id: "wrk_5",
      name: "Senthil (Pickup Truck)",
      role: "driver",
      settlementType: "weekly_saturday",
      wageRatePer1000: 800,
      phone: "+91 91234 00005",
      status: "active",
      contractAdvance: 4000,
      advanceBalance: 4000,
      advanceHistory: [
        { id: "adv_w5", date: "2026-08-03", type: "advance_given", amount: 4000, notes: "Vehicle & transport joining advance" }
      ]
    },
    {
      id: "wrk_6",
      name: "Arumugam",
      role: "dehusker",
      settlementType: "job_based",
      wageRatePer1000: 1800,
      phone: "+91 91234 00006",
      status: "active",
      contractAdvance: 4000,
      advanceBalance: 4000,
      advanceHistory: [
        { id: "adv_w6", date: "2026-08-04", type: "advance_given", amount: 4000, notes: "Yard dehusker joining advance" }
      ]
    }
  ],
  harvestLots: [
    {
      id: "lot_102",
      lotNumber: "LAKSHMI-LOT-102",
      clientId: "cli_2",
      harvestDate: "2026-08-19",
      grossHarvestCount: 8500,
      badNutCount: 150,
      acceptedNutCount: 8350,
      status: "in_process",
      processStage: "Yard Dehusking",
      notes: "Fresh harvest undergoing yard dehusking."
    },
    {
      id: "lot_101",
      lotNumber: "ANAIMALAI-LOT-101",
      clientId: "cli_1",
      harvestDate: "2026-08-10",
      grossHarvestCount: 6500,
      badNutCount: 80,
      acceptedNutCount: 6420,
      status: "completed",
      processStage: "Billed & Settled",
      notes: "Harvested and fully billed."
    }
  ],
  attendanceLogs: [
    { id: "att_1", lotId: "lot_102", date: "2026-08-19", workerId: "wrk_1", role: "cutter", status: "present" },
    { id: "att_2", lotId: "lot_102", date: "2026-08-19", workerId: "wrk_2", role: "cutter", status: "present" },
    { id: "att_3", lotId: "lot_102", date: "2026-08-19", workerId: "wrk_3", role: "picker", status: "present" },
    { id: "att_5", lotId: "lot_102", date: "2026-08-19", workerId: "wrk_5", role: "driver", status: "present" },
    { id: "att_6", lotId: "lot_102", date: "2026-08-19", workerId: "wrk_6", role: "dehusker", status: "present" }
  ],
  clientBills: [
    {
      id: "bill_101",
      lotId: "lot_101",
      clientId: "cli_1",
      billNumber: "INV-2026-001",
      billDate: "2026-08-12",
      grossCount: 6500,
      badNutCount: 80,
      acceptedCount: 6420,
      ratePer1000: 12500,
      grossAmount: 80250,
      advanceDeduction: 15000,
      transportDeduction: 0,
      bonusAmount: 0,
      netPayable: 65250,
      notes: "Settled in full via UPI",
      status: "billed"
    }
  ],
  sales: [
    {
      id: "sal_1",
      lotIds: ["lot_101"], // Supports multi-farm harvest lots
      date: "2026-08-12",
      type: "coconut",
      buyerName: "Sri Vignesh Coconut Wholesalers",
      coconutGrade: "Grade A Large",
      quantity: 5000,
      unitPrice: 25.00,
      totalRevenue: 125000,
      paymentStatus: "paid"
    },
    {
      id: "sal_2",
      lotIds: ["lot_101"],
      date: "2026-08-13",
      type: "husk",
      coirMillName: "Sri Lakshmi Coir Fibres & Products",
      huskQuantity: 6420,
      unitPricePer1000: 2600,
      totalRevenue: 16692,
      paymentStatus: "paid"
    }
  ],
  expenses: [
    {
      id: "exp_1",
      lotId: "lot_101",
      date: "2026-08-10",
      category: "Fuel & Transport",
      amount: 2200,
      paymentMethod: "UPI",
      notes: "Diesel for transport trips"
    },
    {
      id: "exp_2",
      lotId: "lot_101",
      date: "2026-08-11",
      category: "Meals & Worker Bata",
      amount: 1500,
      paymentMethod: "Cash",
      notes: "Worker tea & food bata"
    }
  ]
};

class DataStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
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
          clients: parsed.clients && parsed.clients.length ? parsed.clients : defaultSeedData.clients,
          workers: parsed.workers && parsed.workers.length ? parsed.workers : defaultSeedData.workers,
          harvestLots: parsed.harvestLots && parsed.harvestLots.length ? parsed.harvestLots : (parsed.harvestBatches || defaultSeedData.harvestLots),
          attendanceLogs: parsed.attendanceLogs || defaultSeedData.attendanceLogs,
          clientBills: parsed.clientBills || defaultSeedData.clientBills,
          sales: parsed.sales || defaultSeedData.sales,
          expenses: parsed.expenses || defaultSeedData.expenses
        };
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.error("Failed to save to LocalStorage", e);
    }
  }

  resetToDefault() {
    this.saveData(defaultSeedData);
    return this.data;
  }

  // --- MARKET RATES ---
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

  // --- CLIENT & ADVANCE LEDGER ---
  getClients() { return this.data.clients; }
  getClientById(id) { return this.data.clients.find(c => c.id === id); }
  
  addClient(client) {
    client.id = "cli_" + Date.now();
    client.contractAdvance = Number(client.contractAdvance || 0);
    client.advanceBalance = client.contractAdvance;
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

  // --- QUICK CASH & ADVANCE LEDGER ---
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

  // --- WORKER PAYROLL SETTLEMENT ENGINE ---
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

  // --- 360 DEGREE PROFILE DATA GATHERERS ---
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
    const totalNutsHandled = lotsWorked.reduce((sum, l) => sum + Number(l.grossHarvestCount || 0), 0);
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

  // --- WORKER & ADVANCE LEDGER ---
  getWorkers() { return this.data.workers; }
  getWorkerById(id) { return this.data.workers.find(w => w.id === id); }

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

  returnWorkerAdvance(workerId, amount, notes) {
    const worker = this.getWorkerById(workerId);
    if (!worker) return;
    worker.advanceBalance = Math.max(0, (worker.advanceBalance || 0) - amount);
    if (!worker.advanceHistory) worker.advanceHistory = [];
    worker.advanceHistory.push({
      id: "adv_wret_" + Date.now(),
      date: new Date().toISOString().slice(0,10),
      type: "advance_returned",
      amount: amount,
      notes: notes || "Advance returned by worker upon leaving/exit"
    });
    this.saveData();
  }

  // --- HARVEST LOTS CRUD & ID GENERATOR ---
  getLots() { return this.data.harvestLots || []; }
  getInProcessLots() {
    return (this.data.harvestLots || []).filter(l => l.status === 'in_process');
  }
  getCompletedLots() {
    return (this.data.harvestLots || []).filter(l => l.status === 'completed');
  }
  getLotById(id) { return (this.data.harvestLots || []).find(l => l.id === id); }

  addHarvestLot(lot, attendingWorkerIds = []) {
    lot.id = "lot_" + Date.now();
    const client = this.getClientById(lot.clientId);
    const farmName = client ? client.name.split(' ')[0].toUpperCase().replace(/[^A-Z]/g, '') : 'FARM';
    const seq = Math.floor(100 + Math.random() * 900);
    lot.lotNumber = `${farmName}-LOT-${seq}`;
    lot.status = "in_process";
    lot.processStage = "Harvesting at Farm";
    lot.badNutCount = Number(lot.badNutCount || 0);
    lot.acceptedNutCount = lot.grossHarvestCount - lot.badNutCount;

    if (!this.data.harvestLots) this.data.harvestLots = [];
    this.data.harvestLots.unshift(lot);

    // Save attendance if workers checked during creation
    if (attendingWorkerIds && attendingWorkerIds.length > 0) {
      this.saveAttendance(lot.id, attendingWorkerIds.map(wId => ({
        workerId: wId,
        role: this.getWorkerById(wId)?.role || 'general',
        status: 'present',
        date: lot.harvestDate
      })));
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

  // --- ATTENDANCE CRUD ---
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

  // --- CLIENT BILLING CRUD ---
  getClientBills() { return this.data.clientBills || []; }
  getBillByLotId(lotId) {
    return (this.data.clientBills || []).find(b => b.lotId === lotId);
  }

  saveClientBill(bill) {
    if (!this.data.clientBills) this.data.clientBills = [];
    bill.id = "bill_" + Date.now();
    bill.billNumber = "INV-" + new Date().getFullYear() + "-" + Math.floor(100 + Math.random() * 900);
    this.data.clientBills.unshift(bill);

    // Deduct advance from client advance balance if advance deduction used
    if (bill.advanceDeduction > 0) {
      const client = this.getClientById(bill.clientId);
      if (client) {
        client.advanceBalance = Math.max(0, (client.advanceBalance || 0) - bill.advanceDeduction);
        if (!client.advanceHistory) client.advanceHistory = [];
        client.advanceHistory.push({
          id: "adv_ded_" + Date.now(),
          date: bill.billDate,
          type: "settlement_deduction",
          amount: bill.advanceDeduction,
          notes: `Deducted against Bill ${bill.billNumber}`
        });
      }
    }

    this.updateLotStage(bill.lotId, "Billed & Settled", "completed");
    this.saveData();
    return bill;
  }

  // --- SALES & EXPENSE CRUD ---
  getSales() { return this.data.sales || []; }
  addSale(sale) {
    sale.id = "sal_" + Date.now();
    this.data.sales.unshift(sale);
    this.saveData();
    return sale;
  }

  getExpenses() { return this.data.expenses || []; }
  addExpense(expense) {
    expense.id = "exp_" + Date.now();
    this.data.expenses.unshift(expense);
    this.saveData();
    return expense;
  }

  // --- CALCULATIONS ENGINE ---
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
    const totalLots = (this.data.harvestLots || []).length;
    const inProcessCount = this.getInProcessLots().length;
    const totalHarvestedNuts = (this.data.harvestLots || []).reduce((sum, l) => sum + Number(l.grossHarvestCount || 0), 0);

    const coconutRevenue = (this.data.sales || []).filter(s => s.type === 'coconut').reduce((sum, s) => sum + Number(s.totalRevenue || 0), 0);
    const huskRevenue = (this.data.sales || []).filter(s => s.type === 'husk').reduce((sum, s) => sum + Number(s.totalRevenue || 0), 0);
    const totalRevenue = coconutRevenue + huskRevenue;

    const totalClientPayouts = (this.data.harvestLots || []).reduce((sum, l) => {
      const bill = this.getBillByLotId(l.id);
      if (bill) return sum + bill.grossAmount;
      const cli = this.getClientById(l.clientId);
      const rate = cli ? cli.ratePer1000Nuts : 12500;
      return sum + ((l.grossHarvestCount / 1000) * rate);
    }, 0);

    const totalLabourCost = (this.data.harvestLots || []).reduce((sum, l) => {
      return sum + this.calculateLabourBreakdown(l.grossHarvestCount).totalLabourWage;
    }, 0);

    const totalExpenses = (this.data.expenses || []).reduce((sum, e) => sum + Number(e.amount || 0), 0);
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

export const store = new DataStore();

if (typeof window !== 'undefined') {
  window.store = store;
  window.resetAppDatabase = () => {
    try {
      localStorage.clear();
    } catch(e) {}
    location.reload();
  };
}
