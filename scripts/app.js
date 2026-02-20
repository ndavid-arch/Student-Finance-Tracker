const state = {
    transactions: [],
    filters: {
        search: "",
        type: "All",
        date: "",
        category: "All",
        minAmount: "",
        card: "All"
    },
    breakdownType: "income",  // "income" or "expense" for the pie chart
    timeRange: {
        cashflow: "1 year",
        breakdown: "1 year"
    }
};

const THEME_STORAGE_KEY = "theme";
const THEME_DARK = "dark";
const THEME_LIGHT = "light";

let elements = {};

function initElements() {
    console.log("\n🔧 INITIALIZING DOM ELEMENTS");
    
    elements = {
        navLinks: document.querySelectorAll(".nav-link"),
        sections: document.querySelectorAll(".main-content section"),
        searchInput: document.getElementById("searchInput"),
        filterBar: document.querySelector(".filter-bar"),
        filterToggle: document.getElementById("filterAllBtn"),
        typeFilter: document.getElementById("typeFilter"),
        dateFilter: document.getElementById("dateFilter"),
        categoryFilter: document.getElementById("categoryFilter"),
        amountFilter: document.getElementById("amountFilter"),
        cardFilter: document.getElementById("cardFilter"),
        transactionsBody: document.getElementById("transactionsTableBody"),
        balanceAmount: document.getElementById("balance-amount"),
        balanceMeta: document.getElementById("balance-meta"),
        incomeAmount: document.getElementById("income-amount"),
        expensesAmount: document.getElementById("expenses-amount"),
        transactionForm: document.getElementById("transactionForm"),
        exportButton: document.getElementById("export"),
        exportIcons: document.querySelectorAll(".export-icon-btn"),
        themeToggle: document.getElementById("themeToggle"),
        mobileMenuButton: document.getElementById("mobileMenuBtn"),
        sidebar: document.querySelector(".sidebar"),
        startupOverlay: document.getElementById("startupOverlay"),
        loadDemoButton: document.getElementById("loadDemoBtn"),
        startFreshButton: document.getElementById("startFreshBtn"),
        cashflowRangeSelect: document.querySelector(".cashflow-card .time-select"),
        breakdownRangeSelect: document.querySelector(".breakdown-card .time-select")
    };

    console.log("DOM Elements Status:");
    console.log("  balance-amount:", elements.balanceAmount ? "✅" : "❌", elements.balanceAmount);
    console.log("  balance-meta:", elements.balanceMeta ? "✅" : "❌", elements.balanceMeta);
    console.log("  income-amount:", elements.incomeAmount ? "✅" : "❌", elements.incomeAmount);
    console.log("  expenses-amount:", elements.expensesAmount ? "✅" : "❌", elements.expensesAmount);
    console.log("  transactionsTableBody:", elements.transactionsBody ? "✅" : "❌", elements.transactionsBody);
    console.log("  transactionForm:", elements.transactionForm ? "✅" : "❌", elements.transactionForm);
    console.log("✅ DOM Elements initialized\n");
}

const regexRules = {
    name: /^[a-z0-9][a-z0-9\s&.'-]{2,}$/i,
    category: /^[a-z0-9][a-z0-9\s&.'-]{2,}$/i,
    card: /^(MOMO|CARD|CASH)$/i,
    amount: /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/,
    description: /^[a-z0-9][a-z0-9\s.,'!-]{2,}$/i