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
    const expenseData = labels.map((m) => months[m].expense);

    // Destroy existing chart if it exists
    if (cashflowChart instanceof Chart) {
        cashflowChart.destroy();
    }

    const ctx = cashflowCanvas.getContext("2d");
    cashflowChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Income",
                    data: incomeData,
                    borderColor: "#2f855a",
                    backgroundColor: "rgba(47, 133, 90, 0.1)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "#2f855a",
                    pointBorderColor: "#f0f4f8",
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: "Expense",
                    data: expenseData,
                    borderColor: "#f56565",
                    backgroundColor: "rgba(245, 101, 101, 0.1)",
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: "#f56565",
                    pointBorderColor: "#f0f4f8",
                    pointRadius: 6,
                    pointHoverRadius: 8
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    labels: {
                        color: "#718096",
                        font: { size: 12 }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: "#718096" },
                    grid: { color: "rgba(113, 128, 150, 0.1)" }
                },
                x: {
                    ticks: { color: "#718096" },
                    grid: { color: "rgba(113, 128, 150, 0.1)" }
                }
            }
        }
    });

    console.log("✓ Cashflow monthly line chart rendered");
}

function renderExpensesCategoryChart() {
    const expensesCategoryCanvas = document.getElementById("expensesCategoryChart");
    if (!expensesCategoryCanvas) {
        console.error("❌ expensesCategoryChart canvas not found!");
        return;
    }

    const rangeLabel = state.timeRange.breakdown;
    const { filtered } = getTransactionsInRange(rangeLabel);
    const breakdown = getCategoryBreakdown(state.breakdownType, filtered);
    const categories = Object.keys(breakdown);
    const amounts = categories.map(c => breakdown[c].amount);

    // Color palette for pie chart
    const colors = [
        "#7fd3a1",
        "#2f855a",
        "#f56565",
        "#ed8936",
        "#ecc94b",
        "#38a169",
        "#4299e1",
        "#9f7aea",
        "#ed64a6"
    ];

    // Destroy existing chart if it exists
    if (expensesCategoryChart instanceof Chart) {
        expensesCategoryChart.destroy();
    }

    const typeLabel = state.breakdownType === "income" ? "Income" : "Expense";
    const ctx = expensesCategoryCanvas.getContext("2d");
    expensesCategoryChart = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: categories,
            datasets: [
                {
                    data: amounts,
                    backgroundColor: colors.slice(0, categories.length),
                    borderColor: "#f0f4f8",
                    borderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: "right",
                    labels: {
                        color: "#718096",
                        font: { size: 12 },
                        padding: 15
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const value = formatCurrency(context.parsed);
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });

    console.log(`✓ ${typeLabel} category breakdown chart rendered`);
}

function getFilteredTransactions() {
    return state.transactions.filter((transaction) => {
        const matchesSearch = transaction.name.toLowerCase().includes(state.filters.search);
        const matchesType = state.filters.type === "All" || transaction.type === state.filters.type;
        const matchesDate = !state.filters.date || transaction.date === state.filters.date;
        const matchesCategory = state.filters.category === "All" || transaction.category === state.filters.category;
        const matchesAmount = !state.filters.minAmount || transaction.amount >= Number(state.filters.minAmount);
        const matchesCard = state.filters.card === "All" || transaction.card === state.filters.card;

        return matchesSearch && matchesType && matchesDate && matchesCategory && matchesAmount && matchesCard;
    });
}

function renderTransactions() {
    if (!elements.transactionsBody) {
        console.error("transactionsBody element not found");
        return;
    }

    const filtered = getFilteredTransactions();
    console.log("Filtered transactions:", filtered);
    
    elements.transactionsBody.innerHTML = "";

    if (!filtered.length) {
        const emptyRow = document.createElement("tr");
        const emptyCell = document.createElement("td");
        emptyCell.colSpan = 5;
        emptyCell.textContent = "No transactions found";
        emptyCell.style.textAlign = "center";
        emptyCell.style.color = "#718096";
        emptyRow.appendChild(emptyCell);
        elements.transactionsBody.appendChild(emptyRow);
        return;
    }

    filtered.forEach((transaction) => {
        const row = document.createElement("tr");
        const amountClass = transaction.type === "income" ? "amount-income" : "amount-expense";
        const amountSign = transaction.type === "income" ? "+" : "-";

        row.innerHTML = `
            <td>${highlightMatch(transaction.name, state.filters.search)}</td>
            <td>${escapeHtml(transaction.card)}</td>
            <td>${escapeHtml(transaction.date)} ${escapeHtml(transaction.time)}</td>
            <td class="${amountClass}">${amountSign}${formatCurrency(transaction.amount)}</td>
            <td>${escapeHtml(transaction.description || "-")}</td>
        `;

        elements.transactionsBody.appendChild(row);
    });
}

function updateFilters() {
    state.filters.search = (elements.searchInput.value || "").trim().toLowerCase();
    state.filters.type = elements.typeFilter.value || "All";
    state.filters.date = elements.dateFilter.value || "";
    state.filters.category = elements.categoryFilter.value || "All";
    state.filters.minAmount = elements.amountFilter.value || "";
    state.filters.card = elements.cardFilter.value || "All";

    renderTransactions();
    renderCashflowChart();
    renderExpensesCategoryChart();
}

function showSection(sectionId) {
    elements.sections.forEach((section) => {
        section.classList.add("hidden");
    });

    const activeSection = document.querySelector(sectionId);
    if (activeSection) {
        activeSection.classList.remove("hidden");
    }

    elements.navLinks.forEach((link) => {
        link.classList.remove("active");
        if (link.getAttribute("href") === sectionId) {
            link.classList.add("active");
        }
    });
}

function setInitialSection() {
    const hash = window.location.hash || "#transactions";
    if (document.querySelector(hash)) {
        showSection(hash);
    } else {
        showSection("#transactions");
    }
}

function validateField(input, rule, message) {
    if (!input) {
        console.error("Input element is null:", input);
        return false;
    }
    
    const value = input.value.trim();
    const errorElement = document.querySelector(`[data-error-for="${input.id}"]`);

    if (!value) {
        if (errorElement) {
            errorElement.textContent = "This field is required";
        }
        return false;
    }

    if (rule && !rule.test(value)) {
        if (errorElement) {
            errorElement.textContent = message;
        }
        return false;
    }

    if (errorElement) {
        errorElement.textContent = "";
    }
    return true;
}

function validateForm() {
    if (!elements.transactionForm) {
        console.error("Transaction form not found");
        return false;
    }

    const nameValid = validateField(
        elements.transactionForm.transactionName,
        regexRules.name,
        "Use 3+ letters or numbers"
    );
    const typeValid = validateField(elements.transactionForm.transactionType);
    const dateValid = validateField(elements.transactionForm.transactionDate);
    const timeValid = validateField(elements.transactionForm.transactionTime);
    const categoryValid = validateField(
        elements.transactionForm.transactionCategory,
        regexRules.category,
        "Use 3+ letters or numbers"
    );
    const amountValid = validateField(
        elements.transactionForm.transactionAmount,
        regexRules.amount,
        "Enter a valid amount (e.g., 120.50)"
    );
    const cardValid = validateField(
        elements.transactionForm.transactionCard,
        regexRules.card,
        "Use 2+ letters or numbers"
    );

    const descriptionInput = elements.transactionForm.transactionDescription;
    const descriptionValue = descriptionInput ? descriptionInput.value.trim() : "";
    const descriptionError = document.querySelector("[data-error-for=\"transactionDescription\"]");
    if (descriptionValue && !regexRules.description.test(descriptionValue)) {
        if (descriptionError) {
            descriptionError.textContent = "Use 3+ characters without special symbols";
        }
        return false;
    }
    if (descriptionError) {
        descriptionError.textContent = "";
    }

    return nameValid && typeValid && dateValid && timeValid && categoryValid && amountValid && cardValid;
}

function addTransaction(form) {
    const amountValue = Number(form.transactionAmount.value.trim());
    const newTransaction = {
        id: Date.now(),
        name: form.transactionName.value.trim(),
        type: form.transactionType.value,
        date: form.transactionDate.value,
        time: form.transactionTime.value,
        category: form.transactionCategory.value.trim(),
        amount: Number.isNaN(amountValue) ? 0 : amountValue,
        card: form.transactionCard.value.trim(),
        description: form.transactionDescription.value.trim()
    };

    state.transactions.unshift(newTransaction);
    saveTransactions();
    renderSummary();
    populateFilterOptions();
    renderTransactions();
}

function handleFormSubmit(event) {
    event.preventDefault();
    if (!validateForm()) {
        return;
    }

    addTransaction(event.target);
    event.target.reset();
}

function exportTransactions(format) {
    if (!state.transactions.length) {
        return;
    }

    const timestamp = new Date().toISOString().slice(0, 10);
    if (format === "json") {
        const json = JSON.stringify(state.transactions, null, 2);
        triggerDownload(`transactions-${timestamp}.json`, "application/json", json);
        return;
    }

    const headers = ["Name", "Type", "Date", "Time", "Category", "Amount", "Card", "Description"];
    const rows = state.transactions.map((transaction) => [
        transaction.name,
        transaction.type,
        transaction.date,
        transaction.time,
        transaction.category,
        transaction.amount,
        transaction.card,
        transaction.description
    ]);

    const csvContent = [headers, ...rows]
        .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    triggerDownload(`transactions-${timestamp}.csv`, "text/csv", csvContent);
}

function triggerDownload(filename, contentType, data) {
    const blob = new Blob([data], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function initEventListeners() {
    console.log("Initializing event listeners...");
    
    if (elements.navLinks && elements.navLinks.length > 0) {
        elements.navLinks.forEach((link) => {
            link.addEventListener("click", (event) => {
                event.preventDefault();
                showSection(link.getAttribute("href"));
                if (elements.sidebar && elements.sidebar.classList.contains("mobile-open")) {
                    elements.sidebar.classList.remove("mobile-open");
                }
                if (elements.mobileMenuButton) {
                    elements.mobileMenuButton.setAttribute("aria-expanded", "false");
                }
            });
        });
    }

    if (elements.searchInput) {
        elements.searchInput.addEventListener("input", updateFilters);
    }
    
    if (elements.typeFilter) {
        elements.typeFilter.addEventListener("change", updateFilters);
    }
    
    if (elements.dateFilter) {
        elements.dateFilter.addEventListener("change", updateFilters);
    }
    
    if (elements.categoryFilter) {
        elements.categoryFilter.addEventListener("change", updateFilters);
    }
    
    if (elements.amountFilter) {
        elements.amountFilter.addEventListener("input", updateFilters);
    }
    
    if (elements.cardFilter) {
        elements.cardFilter.addEventListener("change", updateFilters);
    }

    if (elements.filterToggle && elements.filterBar) {
        elements.filterToggle.addEventListener("click", () => {
            elements.filterBar.classList.toggle("is-hidden");
        });
    }

    if (elements.transactionForm) {
        elements.transactionForm.addEventListener("submit", handleFormSubmit);
        elements.transactionForm.addEventListener("reset", () => {
            document.querySelectorAll(".error-text").forEach((error) => {
                error.textContent = "";
            });
        });
    }

    if (elements.exportButton) {
        elements.exportButton.addEventListener("click", () => exportTransactions("csv"));
    }

    if (elements.exportIcons && elements.exportIcons.length > 0) {
        elements.exportIcons.forEach((button) => {
            button.addEventListener("click", () => {
                const action = button.getAttribute("data-action");
                if (action === "export-csv") {
                    exportTransactions("csv");
                } else if (action === "export-json") {
                    exportTransactions("json");
                } else if (action === "import-json") {
                    triggerImport();
                }
            });
        });
    }

    if (elements.mobileMenuButton && elements.sidebar) {
        elements.mobileMenuButton.addEventListener("click", () => {
            const isOpen = elements.sidebar.classList.toggle("mobile-open");
            elements.mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    if (elements.themeToggle) {
        elements.themeToggle.addEventListener("click", () => {
            const currentTheme = document.body.classList.contains("theme-dark")
                ? THEME_DARK
                : THEME_LIGHT;
            const nextTheme = currentTheme === THEME_DARK ? THEME_LIGHT : THEME_DARK;
            localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
            applyTheme(nextTheme);
        });
    }

    if (elements.cashflowRangeSelect) {
        elements.cashflowRangeSelect.addEventListener("change", () => {
            state.timeRange.cashflow = elements.cashflowRangeSelect.value;
            renderCashflowChart();
        });
    }

    if (elements.breakdownRangeSelect) {
        elements.breakdownRangeSelect.addEventListener("change", () => {
            state.timeRange.breakdown = elements.breakdownRangeSelect.value;
            renderExpensesCategoryChart();
        });
    }

    window.addEventListener("hashchange", () => {
        setInitialSection();
    });

    // Add file input for importing JSON
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".json";
    fileInput.id = "jsonImport";
    fileInput.style.display = "none";
    document.body.appendChild(fileInput);

    fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (Array.isArray(imported)) {
                        state.transactions = imported;
                        saveTransactions();
                        renderSummary();
                        populateFilterOptions();
                        renderTransactions();
                        alert("Transactions imported successfully!");
                    }
                } catch (err) {
                    alert("Error importing file: Invalid JSON");
                }
            };
            reader.readAsText(file);
        }
    });

    // Add breakdown tab listeners
    const breakdownTabs = document.querySelectorAll("[data-breakdown]");
    if (breakdownTabs && breakdownTabs.length > 0) {
        breakdownTabs.forEach((tab) => {
            tab.addEventListener("click", () => {
                const breakdownType = tab.getAttribute("data-breakdown");
                state.breakdownType = breakdownType;
                
                // Update active tab styling
                breakdownTabs.forEach((t) => t.classList.remove("active"));
                tab.classList.add("active");
                
                // Re-render the chart
                renderExpensesCategoryChart();
                console.log("Breakdown type changed to:", breakdownType);
            });
        });
    }

    console.log("Event listeners initialized");
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(state.transactions));
}

async function loadSeedTransactions() {
    try {
        const response = await fetch("./test/seed.json", { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`Seed data request failed: ${response.status}`);
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
            throw new Error("Seed data is not an array");
        }

        return data;
    } catch (error) {
        console.error("Failed to load seed data:", error);
        alert("Could not load demo data from seed.json. Starting with an empty list.");
        return [];
    }
}

function requestStartupChoice() {
    if (!elements.startupOverlay || !elements.loadDemoButton || !elements.startFreshButton) {
        return Promise.resolve("fresh");
    }

    elements.startupOverlay.classList.add("is-visible");

    return new Promise((resolve) => {
        const cleanup = () => {
            elements.startupOverlay.classList.remove("is-visible");
        };

        const handleDemo = () => {
            cleanup();
            resolve("demo");
        };

        const handleFresh = () => {
            cleanup();
            resolve("fresh");
        };

        elements.loadDemoButton.addEventListener("click", handleDemo, { once: true });
        elements.startFreshButton.addEventListener("click", handleFresh, { once: true });
    });
}

function triggerImport() {
    const fileInput = document.getElementById("jsonImport");
    if (fileInput) {
        fileInput.click();
    }
}

async function init() {
    console.log("\n🚀 INITIALIZATION STARTED\n");

    initTheme();
    
    const choice = await requestStartupChoice();

    if (choice === "demo") {
        state.transactions = await loadSeedTransactions();
        console.log("✓ Using seed data (", state.transactions.length, "transactions)");
    } else {
        state.transactions = [];
        console.log("✓ Starting with no data");
    }

    saveTransactions();

    console.log("Total transactions loaded:", state.transactions.length);
    console.log("Sample transaction:", state.transactions[0]);

    console.log("\n📊 Calling renderSummary()...");
    renderSummary();
    
    console.log("\n🔍 Calling populateFilterOptions()...");
    populateFilterOptions();
    
    console.log("\n📋 Calling renderTransactions()...");
    renderTransactions();
    
    console.log("\n📊 Rendering charts...");
    renderCashflowChart();
    renderExpensesCategoryChart();
    
    console.log("\n🎨 Calling setInitialSection()...");
    setInitialSection();
    
    console.log("\n👂 Calling initEventListeners()...");
    initEventListeners();
    
    console.log("\n✅ INITIALIZATION COMPLETE\n");
    
    // Show debug console so user can verify stats are calculated
    setTimeout(() => showDebugConsole(), 500);
}

// Initialize when DOM is ready
console.log("\n📜 SCRIPT LOADED");
console.log("document.readyState:", document.readyState);

if (document.readyState === "loading") {
    console.log("⏳ DOM still loading, waiting for DOMContentLoaded...");
    document.addEventListener("DOMContentLoaded", () => {
        console.log("✅ DOMContentLoaded event FIRED");
        console.log("Calling initElements()...");
        initElements();
        console.log("initElements() complete, now calling init()...");
        init();
    });
} else {
    // DOM is already loaded
    console.log("✅ DOM ALREADY LOADED");
    console.log("Calling initElements()...");
    initElements();
    console.log("initElements() complete, now calling init()...");
    init();
}
