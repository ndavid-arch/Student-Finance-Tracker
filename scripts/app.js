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
   
    // Debug display - show all stats in console as a summary table
    console.log("═══════════════════════════════════════");
    console.log("📊 STATS SUMMARY");  
    console.log("═══════════════════════════════════════");
    console.table({
        "Total Income": formatCurrency(summary.income),
        "Total Expense": formatCurrency(summary.expense),
        "Balance": formatCurrency(summary.balance),
        "Income %": `${incomeShare.toFixed(1)}%`,
        "Expense %": `${expenseShare.toFixed(1)}%`,
        "Transaction Count": state.transactions.length
    });
    console.log("═══════════════════════════════════════\n");
    
    console.log("✓ RENDER SUMMARY COMPLETE\n");
}

function showDebugConsole() {
    const debugConsole = document.getElementById("debugConsole");
    const debugOutput = document.getElementById("debugOutput");
    
    if (!debugConsole || !debugOutput) {
        console.log("Debug console elements not found");
        return;
    }
    
    const summary = computeSummary(state.transactions);
    const totalFlow = summary.income + summary.expense;
    const incomeShare = totalFlow ? (summary.income / totalFlow) * 100 : 0;
    const expenseShare = totalFlow ? (summary.expense / totalFlow) * 100 : 0;
    
    const html = `
        <div><span style="color: #f0f4f8;">Transactions Loaded:</span> <span style="color: #7fd3a1;">${state.transactions.length}</span></div>
        <div><span style="color: #f0f4f8;">Total Income:</span> <span style="color: #2f855a;">${formatCurrency(summary.income)}</span></div>
        <div><span style="color: #f0f4f8;">Total Expense:</span> <span style="color: #f56565;">${formatCurrency(summary.expense)}</span></div>
        <div><span style="color: #f0f4f8;">Balance:</span> <span style="color: #7fd3a1;">${formatCurrency(summary.balance)}</span></div>
        <div><span style="color: #f0f4f8;">Income Share:</span> <span style="color: #2f855a;">${incomeShare.toFixed(1)}%</span></div>
        <div><span style="color: #f0f4f8;">Expense Share:</span> <span style="color: #f56565;">${expenseShare.toFixed(1)}%</span></div>
        <div style="margin-top: 10px; color: #cbd5e0; font-size: 11px;">✓ Stats calculated successfully</div>
    `;
    
    debugOutput.innerHTML = html;
    debugConsole.style.display = "block";
}

function getCategoryBreakdown(type, transactions) {
    const filtered = (transactions || []).filter((t) => t.type === type);
    const breakdown = {};

    filtered.forEach((transaction) => {
        if (!breakdown[transaction.category]) {
            breakdown[transaction.category] = { amount: 0, count: 0 };
        }
        breakdown[transaction.category].amount += transaction.amount;
        breakdown[transaction.category].count += 1;
    });

    return breakdown;
}

function getMonthsFromRange(label) {
    const normalized = (label || "").toLowerCase().trim();
    if (normalized === "6 months") {
        return 6;
    }
    if (normalized === "3 months") {
        return 3;
    }
    return 12;
}

function getLatestTransactionDate() {
    if (!state.transactions.length) {
        return new Date();
    }

    const latest = state.transactions.reduce((maxDate, transaction) => {
        const current = new Date(transaction.date);
        return current > maxDate ? current : maxDate;
    }, new Date(state.transactions[0].date));

    return Number.isNaN(latest.getTime()) ? new Date() : latest;
}

function buildRecentMonthLabels(endDate, monthsCount) {
    const labels = [];
    const base = new Date(endDate.getFullYear(), endDate.getMonth(), 1);

    for (let offset = monthsCount - 1; offset >= 0; offset -= 1) {
        const date = new Date(base.getFullYear(), base.getMonth() - offset, 1);
        const month = String(date.getMonth() + 1).padStart(2, "0");
        labels.push(`${date.getFullYear()}-${month}`);
    }

    return labels;
}

function getTransactionsInRange(rangeLabel) {
    const monthsCount = getMonthsFromRange(rangeLabel);
    const endDate = getLatestTransactionDate();
    const monthLabels = buildRecentMonthLabels(endDate, monthsCount);
    const allowed = new Set(monthLabels);

    const filtered = state.transactions.filter((transaction) => {
        const monthKey = transaction.date.substring(0, 7);
        return allowed.has(monthKey);
    });

    return { filtered, monthLabels };
}

function populateFilterOptions() {
    console.log("Populating filter options...");
    
    const categories = new Set();
    const cards = new Set();
    const types = new Set();

    state.transactions.forEach((transaction) => {
        categories.add(transaction.category);
        cards.add(transaction.card);
        types.add(transaction.type);
    });

    console.log("Categories:", Array.from(categories));
    console.log("Cards:", Array.from(cards));
    console.log("Types:", Array.from(types));

    if (elements.typeFilter) {
        updateSelectOptions(
            elements.typeFilter,
            ["All", ...Array.from(types)],
            (value) => (value === "All" ? value : value.charAt(0).toUpperCase() + value.slice(1))
        );
    }
    
    if (elements.categoryFilter) {
        updateSelectOptions(elements.categoryFilter, ["All", ...Array.from(categories)]);
    }
    
    if (elements.cardFilter) {
        updateSelectOptions(elements.cardFilter, ["All", ...Array.from(cards)]);
    }
}

function updateSelectOptions(select, options, formatter) {
    if (!select) {
        console.error("Select element is null:", select);
        return;
    }
    
    const currentValue = select.value;
    select.innerHTML = "";
    options.forEach((optionValue) => {
        const option = document.createElement("option");
        option.textContent = formatter ? formatter(optionValue) : optionValue;
        option.value = optionValue;
        select.appendChild(option);
    });

    if (options.includes(currentValue)) {
        select.value = currentValue;
    }
}

// Global variables to store chart instances
let cashflowChart = null;
let expensesCategoryChart = null;

function renderCashflowChart() {
    const cashflowCanvas = document.getElementById("cashflowChart");
    if (!cashflowCanvas) {
        console.error("❌ cashflowChart canvas not found!");
        return;
    }

    const rangeLabel = state.timeRange.cashflow;
    const { filtered, monthLabels } = getTransactionsInRange(rangeLabel);

    // Group by month within the selected range
    const months = {};
    monthLabels.forEach((label) => {
        months[label] = { income: 0, expense: 0 };
    });

    filtered.forEach((transaction) => {
        const monthKey = transaction.date.substring(0, 7);
        if (!months[monthKey]) {
            months[monthKey] = { income: 0, expense: 0 };
        }
        if (transaction.type === "income") {
            months[monthKey].income += transaction.amount;
        } else {
            months[monthKey].expense += transaction.amount;
        }
    });

    const labels = monthLabels;
    const incomeData = labels.map((m) => months[m].income);
