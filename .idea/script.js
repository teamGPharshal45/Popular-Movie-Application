

let packageData = [], classData = [], methodData = [], summaryData = [];
let currentPackage = null, currentClass = null;
let currentTab = 'all';
let currentSort = { key: null, order: 'asc' };

// ================= CSV Loader =================
async function loadCSV(file) {
    const res = await fetch(file);
    const text = await res.text();
    const rows = text.split('\n').filter(r => r.trim() !== '');
    const headers = rows[0].split(',');
    return rows.slice(1).map(row => {
        const cols = row.split(',');
        let obj = {};
        headers.forEach((h, i) => obj[h.trim()] = cols[i]?.trim());
        return obj;
    });
}

// ================= Helper Functions =================
function getCoverageClass(status) {
    switch (status.toLowerCase()) {
        case 'critical': return 'critical';
        case 'poor': return 'poor';
        case 'fair': return 'fair';
        case 'good': return 'good';
        case 'excellent': return 'excellent';
        default: return '';
    }
}

function showAlert(status) {
    const alertDiv = document.getElementById('alert');
    if (status.toLowerCase() === 'critical') {
        alertDiv.innerHTML = `<div class="alert alert-critical">⚠ Critical coverage! Add unit tests immediately.</div>`;
    } else if (status.toLowerCase() === 'poor') {
        alertDiv.innerHTML = `<div class="alert alert-poor">⚠ Poor coverage! Consider adding more tests.</div>`;
    } else {
        alertDiv.innerHTML = '';
    }
}

function updateBreadcrumb() {
    const bc = document.getElementById('breadcrumb');
    let html = `<span onclick="goHome()">Home</span>`;
    if (currentPackage) html += ` > <span onclick="showPackage()">${currentPackage}</span>`;
    if (currentClass) html += ` > <span onclick="showClass()">${currentClass}</span>`;
    bc.innerHTML = html;
}

// ================= Tabs =================
function filterTab(tab) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    currentTab = tab;
    goHome();
}

// ================= Search Filter =================
function applySearchFilter(data) {
    const query = document.getElementById('searchBox').value.toLowerCase();
    if (!query) return data;
    return data.filter(row => Object.values(row).some(val => val?.toLowerCase().includes(query)));
}

// ================= Sorting =================
function sortData(data, key) {
    if (currentSort.key === key) {
        currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.key = key;
        currentSort.order = 'asc';
    }
    const order = currentSort.order === 'asc' ? 1 : -1;
    return data.sort((a, b) => {
        let x = a[key] || '', y = b[key] || '';
        if (!isNaN(x) && !isNaN(y)) return (parseFloat(x) - parseFloat(y)) * order;
        return x.localeCompare(y) * order;
    });
}

// ================= Render Summary =================
function renderSummary() {
    const summary = document.getElementById('summary');
    summary.innerHTML = '';

    const totalPackages = packageData.length;
    const totalClasses = classData.length;
    const criticalPackages = packageData.filter(p => p['Status'].toLowerCase() === 'critical').length;
    const avgCoverage = Math.round(parseFloat(summaryData[0]['Total Coverage (%)']) || 0);

    const cards = [
        { title: 'Total Packages', value: totalPackages },
        { title: 'Total Classes', value: totalClasses },
        { title: 'Critical Packages', value: criticalPackages },
        { title: 'Total Project Coverage', value: avgCoverage + '%' }
    ];

    cards.forEach(c => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `<p>${c.title}</p><h2>${c.value}</h2>`;
        summary.appendChild(div);
    });
}

// ================= Render Table =================
function renderTable(data, level) {
    const container = document.getElementById('table-container');
    container.innerHTML = '';

    // Apply Tab Filter
    if (level === 'package') {
        if (currentTab === 'top') data = data.filter(p => parseFloat(p['Instruction Coverage (%)']) >= 80);
        else if (currentTab === 'attention') data = data.filter(p => parseFloat(p['Instruction Coverage (%)']) < 40);
    }

    // Apply Search Filter
    data = applySearchFilter(data);

    if (data.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No data to display</p>';
        return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    Object.keys(data[0]).forEach(h => {
        const th = document.createElement('th');
        th.innerText = h;
        th.addEventListener('click', () => {
            data = sortData(data, h);
            renderTable(data, level);

            // Remove existing sort icons from all headers
            document.querySelectorAll('th').forEach(header => {
                header.classList.remove('sort-asc', 'sort-desc');
            });

            // Add the correct icon to the currently clicked header
            if (currentSort.order === 'asc') th.classList.add('sort-asc');
            else th.classList.add('sort-desc');
        });

        headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    data.forEach(row => {
        const tr = document.createElement('tr');

        Object.keys(row).forEach(key => {
            const td = document.createElement('td');
            let val = row[key];

            if (key.toLowerCase().includes('coverage')) {
                td.innerHTML = `<div class="progress-container">
                    <div class="progress-bar ${getCoverageClass(row['Status'])}" style="width:${val}%">${val}%</div>
                </div>`;
            } else td.innerText = val;

            tr.appendChild(td);
        });

        if (level === 'package') {
            tr.addEventListener('click', () => {
                currentPackage = row['Package'];
                currentClass = null;
                const filtered = classData.filter(c => c['Package'] === currentPackage);
                renderTable(filtered, 'class');
                updateBreadcrumb();
            });
        } else if (level === 'class') {
            tr.addEventListener('click', () => {
                currentClass = row['Class (with extension)'];
                const filtered = methodData.filter(m => m['Package'] === currentPackage && m['Class (with extension)'] === currentClass);
                renderTable(filtered, 'method');
                updateBreadcrumb();
            });
        }

        tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
}

// ================= Navigation =================
function goHome() {
    currentPackage = null; currentClass = null;
    renderTable(packageData, 'package');
    updateBreadcrumb();
}

function showPackage() {
    if (!currentPackage) return;
    const filtered = classData.filter(c => c['Package'] === currentPackage);
    renderTable(filtered, 'class');
    updateBreadcrumb();
}

function showClass() {
    if (!currentPackage || !currentClass) return;
    const filtered = methodData.filter(m => m['Package'] === currentPackage && m['Class (with extension)'] === currentClass);
    renderTable(filtered, 'method');
    updateBreadcrumb();
}

// ================= Init =================
async function init() {
    const loader = document.getElementById('loader');
    loader.style.display = 'flex'; // Show loader

    try {
        packageData = await loadCSV('package_report.csv');
        classData = await loadCSV('class_report.csv');
        methodData = await loadCSV('method_report.csv');
        summaryData = await loadCSV('summary.csv');

        renderSummary();
        renderTable(packageData, 'package');
        document.getElementById('searchBox').addEventListener('input', () => renderTable(packageData, 'package'));
    } catch (error) {
        console.error("Error loading CSVs:", error);
        document.getElementById('table-container').innerHTML = '<p style="text-align:center;color:red;">Error loading data.</p>';
    } finally {
        loader.style.display = 'none'; // Hide loader after all data loaded
    }
}

init();
