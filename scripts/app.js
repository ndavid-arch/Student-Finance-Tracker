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
    };

function getStoredTheme() {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === THEME_DARK ? THEME_DARK : THEME_LIGHT;
}

function updateThemeToggle(theme) {
    if (!elements.themeToggle) {
        return;
    }

    const isDark = theme === THEME_DARK;
    elements.themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light mode" : "Switch to dark mode"
    );
    elements.themeToggle.innerHTML = isDark
        ? "<span aria-hidden=\"true\">☀️</span>"
        : "<span aria-hidden=\"true\">🌙</span>";
}

function applyTheme(theme) {
    document.body.classList.toggle("theme-dark", theme === THEME_DARK);
    updateThemeToggle(theme);
}

function initTheme() {
    const theme = getStoredTheme();
    applyTheme(theme);
}


function formatCurrency(value) {
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2
    });
}

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function escapeRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlightMatch(text, query) {
    const safeText = escapeHtml(text);
    if (!query) {
        return safeText;
    }

    const escapedQuery = escapeRegExp(query);
    const regex = new RegExp(escapedQuery, "gi");
    return safeText.replace(regex, (match) => `<mark class="highlight">${match}</mark>`);
}

function computeSummary(transactions) {
    return transactions.reduce(
        (summary, transaction) => {
            if (transaction.type === "income") {
                summary.income += transaction.amount;
            } else {
                summary.expense += transaction.amount;
            }
            summary.balance = summary.income - summary.expense;
            return summary;
        },
        { income: 0, expense: 0, balance: 0 }
    );
}

function renderSummary() {
    console.log("🔍 RENDER SUMMARY CALLED");
    console.log("Transactions count:", state.transactions.length);
    console.log("First transaction:", state.transactions[0]);
    
    const summary = computeSummary(state.transactions);
    const totalFlow = summary.income + summary.expense;
    const incomeShare = totalFlow ? (summary.income / totalFlow) * 100 : 0;
    const expenseShare = totalFlow ? (summary.expense / totalFlow) * 100 : 0;

    console.log("Summary calculated:", { summary, totalFlow, incomeShare, expenseShare });
    console.log("Elements object:", elements);

    // Render balance amount
    if (elements.balanceAmount) {
        const balanceText = formatCurrency(summary.balance);
        elements.balanceAmount.textContent = balanceText;
        console.log("✓ Balance updated to:", balanceText);
    } else {
        console.error("❌ balanceAmount element not found!");
    }
    
    // Render income amount
    if (elements.incomeAmount) {
        const incomeText = formatCurrency(summary.income);
        elements.incomeAmount.textContent = incomeText;
        console.log("✓ Income updated to:", incomeText);
    } else {
        console.error("❌ incomeAmount element not found!");
    }
    
    // Render expenses amount
    if (elements.expensesAmount) {
        const expensesText = formatCurrency(summary.expense);
        elements.expensesAmount.textContent = expensesText;
        console.log("✓ Expenses updated to:", expensesText);
    } else {
        console.error("❌ expensesAmount element not found!");
    }

    // Render transaction metadata
    if (elements.balanceMeta) {
        const count = state.transactions.length;
        const metaText = `Transactions: ${count}`;
        elements.balanceMeta.textContent = metaText;
        console.log("✓ Balance meta updated to:", metaText);
    } else {
        console.error("❌ balanceMeta element not found!");
    }