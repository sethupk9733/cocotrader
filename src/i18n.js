/**
 * CocoTrader PRO - Internationalization (i18n) Engine
 * Full Bilingual Support: English (EN) & Tamil (தமிழ்)
 */

export const translations = {
  en: {
    brandSubtitle: "Micro SaaS Platform",
    navDashboard: "Dashboard",
    navLots: "Farm Harvest Lots",
    navRates: "Market Rates Config",
    navClients: "Clients & Advances",
    navWorkers: "Labour & Advances",
    navSales: "Sales & Deliveries",
    navExpenses: "Expenses & Bata",
    navAnalytics: "P&L Analytics",

    tabTitles: {
      dashboard: { title: "Dashboard Overview", sub: "Real-time coconut harvesting, dehusking & sales metrics" },
      lots: { title: "Farm Harvest Lots", sub: "Track harvest lots with farm-named IDs from tree climbing to yard dehusking" },
      rates: { title: "Market & Piece-Rate Config", sub: "Configure market selling rates for coconuts, coir husks & labour piece-rates" },
      clients: { title: "Clients & Advance Ledger", sub: "Manage farm owner accounts, contract advances & exit advance returns" },
      workers: { title: "Labour Payroll & Advances", sub: "Weekly Saturday payroll, job-based dehusking & worker contract advance ledger" },
      sales: { title: "Sales & Multi-Farm Orders", sub: "Deliver combined sales orders from multiple farm harvest lots to buyers" },
      expenses: { title: "Expenses & Bata Ledger", sub: "Log transport diesel, yard rent, equipment maintenance & daily worker bata" },
      analytics: { title: "Profit & Loss Analytics", sub: "Net margin per 1,000 coconuts harvested and cost breakdown" }
    },

    btnNewLot: "+ New Farm Harvest Lot",
    btnExport: "Backup Data",
    
    kpiActiveLots: "Active Harvest Lots",
    kpiGrossRevenue: "Gross Sales Revenue",
    kpiOutflows: "Outflows (Client + Labour)",
    kpiNetProfit: "Net Trader Profit",
    
    tableLotId: "Harvest Lot ID",
    tableClient: "Farm / Client Owner",
    tableHarvestDate: "Harvest Date",
    tableGrossCount: "Gross Harvest Count",
    tableBadCount: "Bad Nut Estimate",
    tableAcceptedCount: "Accepted Yield",
    tableStage: "Current Stage",
    tableActions: "Actions",

    btnGenerateBill: "Generate Bill",
    btnReceiptBill: "Receipt Bill",
    btnPrintInvoice: "Print Invoice",
    btnReturnAdvance: "Return Advance on Exit",

    calcTitle: "Piece-Rate Labour Calculator",
    calcNutsLabel: "Harvest Nut Count",
    calcCutter: "Cutters",
    calcPicker: "Pickers",
    calcDriver: "Drivers",
    calcDehusker: "Dehuskers",
    calcTotalLabour: "Total Labour Wage",

    clientHeading: "Client Farm Owners & Contract Security Advances",
    btnRegisterClient: "+ Register Client Farm",
    workerHeadingSaturday: "1. Weekly Saturday Payroll Settlement (Cutters, Pickers, Drivers)",
    workerHeadingJob: "2. Job-Based Yard Dehusker Settlement (Dehusking Jobs)",
    btnRegisterWorker: "+ Register New Worker with Advance",

    salesHeadingCoconut: "1. Dehusked Coconut Order Deliveries",
    salesHeadingHusk: "2. Coir Industry Husk Deliveries",
    btnCoconutSale: "+ Log Dehusked Coconut Sale",
    btnHuskSale: "+ Log Coir Husk Sale",

    expensesHeading: "Operational Expenses & Worker Bata Ledger",
    btnAddExpense: "+ Add Expense / Bata",

    netPayableClient: "NET PAYABLE TO FARM OWNER"
  },

  ta: {
    brandSubtitle: "தேங்காய் வியாபார மென்பொருள்",
    navDashboard: "முகப்பு (டாஷ்போர்டு)",
    navLots: "தோட்ட அறுவடை லாட்கள்",
    navRates: "சந்தை விலை & கூலி விவரம்",
    navClients: "தோட்ட உரிமையாளர்கள் & அட்வான்ஸ்",
    navWorkers: "தொழிலாளர்கள் கூலி & அட்வான்ஸ்",
    navSales: "தேங்காய் & மட்டை விற்பனை",
    navExpenses: "செலவுகள் & தொழிலாளர் பட்டா",
    navAnalytics: "லாப நஷ்ட கணக்கு",

    tabTitles: {
      dashboard: { title: "வியாபார டாஷ்போர்டு", sub: "தேங்காய் அறுவடை, மட்டை உரிப்பு மற்றும் விற்பனை நேரடி விபரம்" },
      lots: { title: "தோட்ட தேங்காய் அறுவடை லாட்கள்", sub: "தோட்ட வாரியாக மரமேறுதல் முதல் மட்டை உரிப்பு வரை கண்காணித்தல்" },
      rates: { title: "சந்தை விலை & தொழிலாளர் கூலி நிர்ணயம்", sub: "தேங்காய், நார் மட்டை சந்தை விலை மற்றும் தொழிலாளர் கூலி விவரம்" },
      clients: { title: "தோட்ட உரிமையாளர்கள் & ஒப்பந்த அட்வான்ஸ்", sub: "தோட்ட முதலாளிகள் கணக்கு மற்றும் ஒப்பந்த முன்பண பதிவேடு" },
      workers: { title: "தொழிலாளர்கள் கூலி கணக்கு", sub: "வாராந்திர சனிக்கிழமை கூலி பட்டுவாடா மற்றும் மட்டை உரிப்பவர் கூலி" },
      sales: { title: "தேங்காய் & கொப்பரை மட்டை விற்பனை", sub: "மொத்த வியாபாரிகள் மற்றும் நார் ஆலைகளுக்கு விற்பனை செய்தல்" },
      expenses: { title: "டீசல் செலவுகள் & தொழிலாளர் பட்டா", sub: "வண்டி டீசல், வாடகை மற்றும் தொழிலாளர் தினசரி சாப்பாடு பட்டா" },
      analytics: { title: "நிதி லாப நஷ்ட அறிக்கை", sub: "1,000 தேங்காய்க்கு கிடைக்கும் நிகர லாப பகுப்பாய்வு" }
    },

    btnNewLot: "+ புதிய தோட்ட அறுவடை லாட்",
    btnExport: "தரவு பேக்-அப்",

    kpiActiveLots: "நடப்பு அறுவடை லாட்கள்",
    kpiGrossRevenue: "மொத்த விற்பனை வருமானம்",
    kpiOutflows: "மொத்த செலவுகள் (தோட்டம் + கூலி)",
    kpiNetProfit: "வியாபாரியின் நிகர லாபம்",

    tableLotId: "அறுவடை லாட் எண்",
    tableClient: "தோட்ட உரிமையாளர்",
    tableHarvestDate: "அறுவடை தேதி",
    tableGrossCount: "மொத்த அறுவடை எண்ணிக்கை",
    tableBadCount: "அழுகல் / கழிவு தேங்காய்",
    tableAcceptedCount: "தேறிய நல்ல தேங்காய்",
    tableStage: "தற்போதைய நிலை",
    tableActions: "நடவடிக்கைகள்",

    btnGenerateBill: "பில் தயாரித்தல்",
    btnReceiptBill: "ரசீது பில்",
    btnPrintInvoice: "பில் பிரிண்ட் செய்ய",
    btnReturnAdvance: "அட்வான்ஸ் திருப்புதல்",

    calcTitle: "தொழிலாளர் கூலி கணக்கீட்டு பொறி",
    calcNutsLabel: "தேங்காய் எண்ணிக்கை",
    calcCutter: "மரம் ஏறுபவர் (வெட்டு)",
    calcPicker: "தேங்காய் பொறுக்குபவர்",
    calcDriver: "வண்டி டிரைவர்",
    calcDehusker: "மட்டை உரிப்பவர்",
    calcTotalLabour: "மொத்த தொழிலாளர் கூலி",

    clientHeading: "தோட்ட உரிமையாளர்கள் & ஒப்பந்த அட்வான்ஸ் கணக்கு",
    btnRegisterClient: "+ புதிய தோட்ட உரிமையாளர் பதிவு",
    workerHeadingSaturday: "1. வாராந்திர சனிக்கிழமை கூலி (வெட்டு, பொறுக்கு, டிரைவர்)",
    workerHeadingJob: "2. வேலை வாரியான கூலி (களத்து மட்டை உரிப்பவர்)",
    btnRegisterWorker: "+ புதிய தொழிலாளர் பதிவு",

    salesHeadingCoconut: "1. மட்டை உரித்த தேங்காய் விற்பனை விபரம்",
    salesHeadingHusk: "2. நார் ஆலை மட்டை விற்பனை விபரம்",
    btnCoconutSale: "+ தேங்காய் விற்பனை பதிவு",
    btnHuskSale: "+ நார் மட்டை விற்பனை பதிவு",

    expensesHeading: "டீசல் செலவுகள் & தொழிலாளர் பட்டா பதிவேடு",
    btnAddExpense: "+ செலவு / பட்டா பதிவு செய்க",

    netPayableClient: "தோட்ட உரிமையாளருக்கு வழங்க வேண்டிய நிகர தொகை"
  }
};

let currentLang = localStorage.getItem('cocotrader_lang') || 'en';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('cocotrader_lang', lang);
}

export function t(key) {
  const dict = translations[currentLang] || translations.en;
  return dict[key] || translations.en[key] || key;
}
