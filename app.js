/* ============================================
   TIER LIST — Application Logic
   ============================================ */

const CATEGORIES = [
    'IQ', 'PHYSIQUE', 'BÉGAYEMENT', 'HARCÈLEMENT', 'SUSCEPTIBILITÉ',
    'HUMOUR', 'GENTILLESSE', 'GÉNÉROSITÉ', 'AIGREUR', 'EGO',
    'ODEUR', 'CONFIANCE', 'RÉPARTIE', 'EMPATHIE', 'JALOUSIE',
    'CHARISME', 'HONNÊTETÉ'
];

const DEFAULT_DATA = [
    { name: 'ITACHI', ratings: { 'IQ': 5, 'PHYSIQUE': 2, 'BÉGAYEMENT': 2, 'HARCÈLEMENT': 5, 'SUSCEPTIBILITÉ': 0, 'HUMOUR': 5, 'GENTILLESSE': 3, 'GÉNÉROSITÉ': 4, 'AIGREUR': 0, 'EGO': 1, 'ODEUR': 5, 'CONFIANCE': 1, 'RÉPARTIE': 5, 'EMPATHIE': 4, 'JALOUSIE': 1, 'CHARISME': 4, 'HONNÊTETÉ': 4 } },
    { name: 'MEL', ratings: { 'IQ': 3, 'PHYSIQUE': 4, 'BÉGAYEMENT': 4, 'HARCÈLEMENT': 5, 'SUSCEPTIBILITÉ': 0, 'HUMOUR': 5, 'GENTILLESSE': 5, 'GÉNÉROSITÉ': 5, 'AIGREUR': 4, 'EGO': 1, 'ODEUR': 0, 'CONFIANCE': 3, 'RÉPARTIE': 0, 'EMPATHIE': 4, 'JALOUSIE': 2, 'CHARISME': 4, 'HONNÊTETÉ': 5 } },
    { name: 'ARTI', ratings: { 'IQ': 3, 'PHYSIQUE': 1, 'BÉGAYEMENT': 4, 'HARCÈLEMENT': 4, 'SUSCEPTIBILITÉ': 5, 'HUMOUR': 0, 'GENTILLESSE': 5, 'GÉNÉROSITÉ': 5, 'AIGREUR': 3, 'EGO': 4, 'ODEUR': 5, 'CONFIANCE': 2, 'RÉPARTIE': 5, 'EMPATHIE': 4, 'JALOUSIE': 2, 'CHARISME': 4, 'HONNÊTETÉ': 5 } },
    { name: 'MYS', ratings: { 'IQ': 3, 'PHYSIQUE': 4, 'BÉGAYEMENT': 4, 'HARCÈLEMENT': 5, 'SUSCEPTIBILITÉ': 0, 'HUMOUR': 5, 'GENTILLESSE': 5, 'GÉNÉROSITÉ': 5, 'AIGREUR': 3, 'EGO': 4, 'ODEUR': 5, 'CONFIANCE': 2, 'RÉPARTIE': 5, 'EMPATHIE': 4, 'JALOUSIE': 2, 'CHARISME': 4, 'HONNÊTETÉ': 5 } },
    { name: 'AKER', ratings: { 'IQ': 2, 'PHYSIQUE': 5, 'BÉGAYEMENT': 3, 'HARCÈLEMENT': 5, 'SUSCEPTIBILITÉ': 5, 'HUMOUR': 5, 'GENTILLESSE': 5, 'GÉNÉROSITÉ': 5, 'AIGREUR': 5, 'EGO': 5, 'ODEUR': 5, 'CONFIANCE': 5, 'RÉPARTIE': 5, 'EMPATHIE': 5, 'JALOUSIE': 5, 'CHARISME': 5, 'HONNÊTETÉ': 5 } }
];

// State
let people = [];
let currentView = 'table';
let editingIndex = -1;

// DOM Elements
const tableBody = document.getElementById('tableBody');
const tierTable = document.getElementById('tierTable');
const cardsGrid = document.getElementById('cardsGrid');
const rankingContainer = document.getElementById('rankingContainer');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalRatings = document.getElementById('modalRatings');
const personName = document.getElementById('personName');
const contextMenu = document.getElementById('contextMenu');

// ============================================
// INITIALIZATION
// ============================================
function init() {
    const stored = localStorage.getItem('tierlist_data');
    people = stored ? JSON.parse(stored) : [...DEFAULT_DATA];
    
    buildTableHeader();
    renderAll();
    bindEvents();
}

function save() {
    localStorage.setItem('tierlist_data', JSON.stringify(people));
}

// ============================================
// CALCULATIONS
// ============================================
function getAvg(person) {
    const vals = Object.values(person.ratings);
    const sum = vals.reduce((a, b) => a + b, 0);
    return (sum / vals.length).toFixed(1);
}

function getRateColor(val) {
    if (val === 0) return 'rate-0';
    if (val <= 1) return 'rate-1';
    if (val <= 2) return 'rate-2';
    if (val <= 3) return 'rate-3';
    if (val <= 4) return 'rate-4';
    return 'rate-5';
}

function getAvgColor(avg) {
    const n = parseFloat(avg);
    if (n < 1.5) return 'var(--rate-1)';
    if (n < 2.5) return 'var(--rate-2)';
    if (n < 3.5) return 'var(--rate-3)';
    if (n < 4.5) return 'var(--rate-4)';
    return 'var(--rate-5)';
}

function getDotColor(val) {
    if (val <= 1) return 'dot-1';
    if (val <= 2) return 'dot-2';
    if (val <= 3) return 'dot-3';
    if (val <= 4) return 'dot-4';
    return 'dot-5';
}

// ============================================
// TABLE VIEW
// ============================================
function buildTableHeader() {
    const thead = tierTable.querySelector('thead tr');
    thead.innerHTML = '<th class="sticky-col name-col">NOM</th>';
    
    CATEGORIES.forEach(cat => {
        const th = document.createElement('th');
        th.textContent = cat;
        thead.appendChild(th);
    });
    
    const avgTh = document.createElement('th');
    avgTh.textContent = 'MOY.';
    avgTh.className = 'avg-col';
    thead.appendChild(avgTh);
}

function renderTable() {
    tableBody.innerHTML = '';
    
    people.forEach((person, idx) => {
        const tr = document.createElement('tr');
        tr.dataset.index = idx;
        
        // Name cell
        const nameTd = document.createElement('td');
        nameTd.className = 'sticky-col';
        nameTd.textContent = person.name;
        tr.appendChild(nameTd);
        
        // Rating cells
        CATEGORIES.forEach(cat => {
            const td = document.createElement('td');
            const val = person.ratings[cat] ?? 0;
            td.innerHTML = createRatingDots(val);
            tr.appendChild(td);
        });
        
        // Average cell
        const avg = getAvg(person);
        const avgTd = document.createElement('td');
        avgTd.className = 'avg-cell';
        avgTd.style.color = getAvgColor(avg);
        avgTd.textContent = avg;
        tr.appendChild(avgTd);
        
        // Context menu on right-click
        tr.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, idx);
        });
        
        // Double-click to edit
        tr.addEventListener('dblclick', () => openModal(idx));
        
        tableBody.appendChild(tr);
    });
}

function createRatingDots(val) {
    let html = '<div class="rating-display">';
    for (let i = 1; i <= 5; i++) {
        if (i <= val) {
            html += `<span class="rating-dot filled ${getDotColor(val)}"></span>`;
        } else {
            html += `<span class="rating-dot empty"></span>`;
        }
    }
    html += `<span class="rating-value ${getRateColor(val)}">${val}</span>`;
    html += '</div>';
    return html;
}

// ============================================
// CARDS VIEW
// ============================================
function renderCards() {
    cardsGrid.innerHTML = '';
    
    people.forEach((person, idx) => {
        const avg = getAvg(person);
        const card = document.createElement('div');
        card.className = 'person-card';
        card.style.animationDelay = `${idx * 0.06}s`;
        
        let statsHtml = '';
        CATEGORIES.forEach(cat => {
            const val = person.ratings[cat] ?? 0;
            const pct = (val / 5) * 100;
            const color = getAvgColor(val);
            statsHtml += `
                <div class="card-stat">
                    <span class="card-stat-label">${cat}</span>
                    <div class="card-stat-bar">
                        <div class="mini-bar">
                            <div class="mini-bar-fill" style="width:${pct}%;background:${color}"></div>
                        </div>
                        <span class="card-stat-value ${getRateColor(val)}">${val}</span>
                    </div>
                </div>`;
        });
        
        card.innerHTML = `
            <div class="card-header">
                <span class="card-name">${person.name}</span>
                <div class="card-avg">
                    <span class="card-avg-value" style="color:${getAvgColor(avg)}">${avg}</span>
                    <span class="card-avg-label">moyenne</span>
                </div>
            </div>
            <div class="card-body">${statsHtml}</div>
            <div class="card-actions">
                <button class="card-action-btn" onclick="openModal(${idx})">Modifier</button>
                <button class="card-action-btn danger" onclick="deletePerson(${idx})">Supprimer</button>
            </div>`;
        
        cardsGrid.appendChild(card);
    });
}

// ============================================
// RANKING VIEW
// ============================================
function renderRanking() {
    rankingContainer.innerHTML = '';
    
    const sorted = people
        .map((p, i) => ({ ...p, originalIdx: i, avg: parseFloat(getAvg(p)) }))
        .sort((a, b) => b.avg - a.avg);
    
    const maxAvg = sorted.length > 0 ? sorted[0].avg : 5;
    
    sorted.forEach((person, rank) => {
        const row = document.createElement('div');
        row.className = 'ranking-row';
        row.style.animationDelay = `${rank * 0.08}s`;
        
        let posClass = '';
        if (rank === 0) posClass = 'gold';
        else if (rank === 1) posClass = 'silver';
        else if (rank === 2) posClass = 'bronze';
        
        const barPct = (person.avg / 5) * 100;
        
        row.innerHTML = `
            <div class="ranking-position ${posClass}">#${rank + 1}</div>
            <div class="ranking-info">
                <div class="ranking-name">${person.name}</div>
            </div>
            <div class="ranking-bar-container">
                <div class="ranking-bar">
                    <div class="ranking-bar-fill" style="width:${barPct}%"></div>
                </div>
            </div>
            <div class="ranking-score" style="color:${getAvgColor(person.avg.toFixed(1))}">${person.avg.toFixed(1)}</div>`;
        
        row.addEventListener('dblclick', () => openModal(person.originalIdx));
        row.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, person.originalIdx);
        });
        
        rankingContainer.appendChild(row);
    });
}

// ============================================
// MODAL
// ============================================
function openModal(index = -1) {
    editingIndex = index;
    hideContextMenu();
    
    modalTitle.textContent = index === -1 ? 'Ajouter une personne' : 'Modifier — ' + people[index].name;
    personName.value = index === -1 ? '' : people[index].name;
    
    // Build rating inputs
    modalRatings.innerHTML = '';
    CATEGORIES.forEach(cat => {
        const currentVal = index === -1 ? 0 : (people[index].ratings[cat] ?? 0);
        const group = document.createElement('div');
        group.className = 'rating-input-group';
        
        let starsHtml = '<div class="star-rating">';
        for (let i = 5; i >= 1; i--) {
            const id = `star_${cat.replace(/[^a-zA-Z]/g, '')}_${i}`;
            starsHtml += `<input type="radio" name="rate_${cat}" id="${id}" value="${i}" ${currentVal === i ? 'checked' : ''}>`;
            starsHtml += `<label for="${id}" title="${i}"></label>`;
        }
        starsHtml += '</div>';
        
        group.innerHTML = `
            <span class="rating-input-label">${cat}</span>
            ${starsHtml}`;
        
        modalRatings.appendChild(group);
    });
    
    modalOverlay.classList.remove('hidden');
    personName.focus();
}

function closeModal() {
    modalOverlay.classList.add('hidden');
    editingIndex = -1;
}

function saveModal() {
    const name = personName.value.trim().toUpperCase();
    if (!name) {
        personName.style.borderColor = 'var(--rate-1)';
        personName.focus();
        return;
    }
    
    const ratings = {};
    CATEGORIES.forEach(cat => {
        const checked = document.querySelector(`input[name="rate_${cat}"]:checked`);
        ratings[cat] = checked ? parseInt(checked.value) : 0;
    });
    
    if (editingIndex === -1) {
        people.push({ name, ratings });
    } else {
        people[editingIndex] = { name, ratings };
    }
    
    save();
    renderAll();
    closeModal();
}

// ============================================
// CONTEXT MENU
// ============================================
let contextTarget = -1;

function showContextMenu(e, idx) {
    contextTarget = idx;
    contextMenu.classList.remove('hidden');
    
    const x = Math.min(e.clientX, window.innerWidth - 160);
    const y = Math.min(e.clientY, window.innerHeight - 100);
    contextMenu.style.left = x + 'px';
    contextMenu.style.top = y + 'px';
}

function hideContextMenu() {
    contextMenu.classList.add('hidden');
    contextTarget = -1;
}

function deletePerson(idx) {
    if (confirm(`Supprimer ${people[idx].name} ?`)) {
        people.splice(idx, 1);
        save();
        renderAll();
    }
    hideContextMenu();
}

// ============================================
// VIEW SWITCHING
// ============================================
function switchView(view) {
    currentView = view;
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    document.getElementById('tableView').classList.toggle('hidden', view !== 'table');
    document.getElementById('cardsView').classList.toggle('hidden', view !== 'cards');
    document.getElementById('rankingView').classList.toggle('hidden', view !== 'ranking');
    
    renderAll();
}

function renderAll() {
    if (currentView === 'table') renderTable();
    else if (currentView === 'cards') renderCards();
    else if (currentView === 'ranking') renderRanking();
}

// ============================================
// EXPORT
// ============================================
function exportData() {
    let csv = 'NOM,' + CATEGORIES.join(',') + ',MOYENNE\n';
    people.forEach(p => {
        const vals = CATEGORIES.map(c => p.ratings[c] ?? 0);
        csv += `${p.name},${vals.join(',')},${getAvg(p)}\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tierlist_export.csv';
    a.click();
    URL.revokeObjectURL(url);
}

// ============================================
// EVENT BINDINGS
// ============================================
function bindEvents() {
    // View buttons
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
    
    // Add person
    document.getElementById('btnAddPerson').addEventListener('click', () => openModal(-1));
    
    // Export
    document.getElementById('btnExport').addEventListener('click', exportData);
    
    // Modal
    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('btnCancel').addEventListener('click', closeModal);
    document.getElementById('btnSave').addEventListener('click', saveModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
    
    // Context menu
    document.getElementById('ctxEdit').addEventListener('click', () => {
        openModal(contextTarget);
    });
    document.getElementById('ctxDelete').addEventListener('click', () => {
        deletePerson(contextTarget);
    });
    document.addEventListener('click', hideContextMenu);
    
    // Keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            hideContextMenu();
        }
        if (e.key === 'Enter' && !modalOverlay.classList.contains('hidden')) {
            saveModal();
        }
    });
    
    // Reset input style on focus
    personName.addEventListener('focus', () => {
        personName.style.borderColor = '';
    });
}

// Start
init();
