/* ============================================
   TIER LIST — Application Logic (v3)
   Categories with polarity + Good Person %
   ============================================ */

const DEFAULT_CATEGORIES = [
    'IQ', 'PHYSIQUE', 'BÉGAYEMENT', 'HARCÈLEMENT', 'SUSCEPTIBILITÉ',
    'HUMOUR', 'GENTILLESSE', 'GÉNÉROSITÉ', 'AIGREUR', 'EGO',
    'ODEUR', 'CONFIANCE', 'RÉPARTIE', 'EMPATHIE', 'JALOUSIE',
    'CHARISME', 'HONNÊTETÉ'
];

// true = higher is better (positive), false = higher is worse (negative)
const DEFAULT_POLARITY = {
    'IQ': true, 'PHYSIQUE': true, 'BÉGAYEMENT': false, 'HARCÈLEMENT': false,
    'SUSCEPTIBILITÉ': false, 'HUMOUR': true, 'GENTILLESSE': true, 'GÉNÉROSITÉ': true,
    'AIGREUR': false, 'EGO': false, 'ODEUR': true, 'CONFIANCE': true,
    'RÉPARTIE': true, 'EMPATHIE': true, 'JALOUSIE': false, 'CHARISME': true, 'HONNÊTETÉ': true
};

const DEFAULT_DATA = [
    { name: 'ITACHI', ratings: { 'IQ': 5, 'PHYSIQUE': 2, 'BÉGAYEMENT': 2, 'HARCÈLEMENT': 5, 'SUSCEPTIBILITÉ': 0, 'HUMOUR': 5, 'GENTILLESSE': 3, 'GÉNÉROSITÉ': 4, 'AIGREUR': 0, 'EGO': 1, 'ODEUR': 5, 'CONFIANCE': 1, 'RÉPARTIE': 5, 'EMPATHIE': 4, 'JALOUSIE': 1, 'CHARISME': 4, 'HONNÊTETÉ': 4 } },
    { name: 'MEL', ratings: { 'IQ': 3, 'PHYSIQUE': 4, 'BÉGAYEMENT': 4, 'HARCÈLEMENT': 5, 'SUSCEPTIBILITÉ': 0, 'HUMOUR': 5, 'GENTILLESSE': 5, 'GÉNÉROSITÉ': 5, 'AIGREUR': 4, 'EGO': 1, 'ODEUR': 0, 'CONFIANCE': 3, 'RÉPARTIE': 0, 'EMPATHIE': 4, 'JALOUSIE': 2, 'CHARISME': 4, 'HONNÊTETÉ': 5 } },
    { name: 'ARTI', ratings: { 'IQ': 3, 'PHYSIQUE': 1, 'BÉGAYEMENT': 4, 'HARCÈLEMENT': 4, 'SUSCEPTIBILITÉ': 5, 'HUMOUR': 0, 'GENTILLESSE': 5, 'GÉNÉROSITÉ': 5, 'AIGREUR': 3, 'EGO': 4, 'ODEUR': 5, 'CONFIANCE': 2, 'RÉPARTIE': 5, 'EMPATHIE': 4, 'JALOUSIE': 2, 'CHARISME': 4, 'HONNÊTETÉ': 5 } },
    { name: 'MYS', ratings: { 'IQ': 3, 'PHYSIQUE': 4, 'BÉGAYEMENT': 4, 'HARCÈLEMENT': 5, 'SUSCEPTIBILITÉ': 0, 'HUMOUR': 5, 'GENTILLESSE': 5, 'GÉNÉROSITÉ': 5, 'AIGREUR': 3, 'EGO': 4, 'ODEUR': 5, 'CONFIANCE': 2, 'RÉPARTIE': 5, 'EMPATHIE': 4, 'JALOUSIE': 2, 'CHARISME': 4, 'HONNÊTETÉ': 5 } },
    { name: 'AKER', ratings: { 'IQ': 2, 'PHYSIQUE': 5, 'BÉGAYEMENT': 3, 'HARCÈLEMENT': 5, 'SUSCEPTIBILITÉ': 5, 'HUMOUR': 5, 'GENTILLESSE': 5, 'GÉNÉROSITÉ': 5, 'AIGREUR': 5, 'EGO': 5, 'ODEUR': 5, 'CONFIANCE': 5, 'RÉPARTIE': 5, 'EMPATHIE': 5, 'JALOUSIE': 5, 'CHARISME': 5, 'HONNÊTETÉ': 5 } }
];

// State
let categories = [];
let polarity = {};   // { categoryName: true/false }
let people = [];
let currentView = 'table';
let editingIndex = -1;

// DOM
const tableBody = document.getElementById('tableBody');
const tierTable = document.getElementById('tierTable');
const cardsGrid = document.getElementById('cardsGrid');
const rankingContainer = document.getElementById('rankingContainer');
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const modalRatings = document.getElementById('modalRatings');
const personName = document.getElementById('personName');
const contextMenu = document.getElementById('contextMenu');
const catModalOverlay = document.getElementById('catModalOverlay');
const catList = document.getElementById('catList');
const newCatInput = document.getElementById('newCatInput');

// ============================================
// INIT
// ============================================
function init() {
    const storedCats = localStorage.getItem('tierlist_categories');
    const storedPol = localStorage.getItem('tierlist_polarity');
    const storedPeople = localStorage.getItem('tierlist_data');
    categories = storedCats ? JSON.parse(storedCats) : [...DEFAULT_CATEGORIES];
    polarity = storedPol ? JSON.parse(storedPol) : { ...DEFAULT_POLARITY };
    people = storedPeople ? JSON.parse(storedPeople) : [...DEFAULT_DATA];

    // Ensure all categories have a polarity entry
    categories.forEach(cat => {
        if (polarity[cat] === undefined) polarity[cat] = true;
    });

    buildTableHeader();
    renderAll();
    bindEvents();
}

function save() {
    localStorage.setItem('tierlist_data', JSON.stringify(people));
    localStorage.setItem('tierlist_categories', JSON.stringify(categories));
    localStorage.setItem('tierlist_polarity', JSON.stringify(polarity));
}

// ============================================
// CALCULATIONS
// ============================================
function getAvg(person) {
    if (categories.length === 0) return '0.0';
    const sum = categories.reduce((acc, cat) => acc + (person.ratings[cat] ?? 0), 0);
    return (sum / categories.length).toFixed(1);
}

// Good Person % — takes polarity into account
// Positive cat: score counts as-is (5/5 = 100%)
// Negative cat: score is inverted (5/5 = 0%, 0/5 = 100%)
function getGoodPersonPct(person) {
    if (categories.length === 0) return 0;
    let totalScore = 0;
    categories.forEach(cat => {
        const raw = person.ratings[cat] ?? 0;
        const isPositive = polarity[cat] !== false;
        totalScore += isPositive ? raw : (5 - raw);
    });
    const maxPossible = categories.length * 5;
    return maxPossible === 0 ? 0 : Math.round((totalScore / maxPossible) * 100);
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

function getPctColor(pct) {
    if (pct < 30) return 'var(--rate-1)';
    if (pct < 50) return 'var(--rate-2)';
    if (pct < 65) return 'var(--rate-3)';
    if (pct < 80) return 'var(--rate-4)';
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
    categories.forEach(cat => {
        const th = document.createElement('th');
        const isPos = polarity[cat] !== false;
        th.innerHTML = `<span class="th-polarity ${isPos ? 'pos' : 'neg'}">${isPos ? '▲' : '▼'}</span> ${cat}`;
        th.title = isPos ? 'Positif — plus = mieux' : 'Négatif — plus = pire';
        thead.appendChild(th);
    });
    const avgTh = document.createElement('th');
    avgTh.textContent = 'MOY.';
    avgTh.className = 'avg-col';
    thead.appendChild(avgTh);

    const pctTh = document.createElement('th');
    pctTh.textContent = '% BONNE PERSONNE';
    pctTh.className = 'pct-col';
    thead.appendChild(pctTh);
}

function renderTable() {
    tableBody.innerHTML = '';
    people.forEach((person, idx) => {
        const tr = document.createElement('tr');
        tr.dataset.index = idx;

        const nameTd = document.createElement('td');
        nameTd.className = 'sticky-col';
        nameTd.textContent = person.name;
        tr.appendChild(nameTd);

        categories.forEach(cat => {
            const td = document.createElement('td');
            const val = person.ratings[cat] ?? 0;
            td.innerHTML = createRatingDots(val);
            tr.appendChild(td);
        });

        const avg = getAvg(person);
        const avgTd = document.createElement('td');
        avgTd.className = 'avg-cell';
        avgTd.style.color = getAvgColor(avg);
        avgTd.textContent = avg;
        tr.appendChild(avgTd);

        // Good person %
        const pct = getGoodPersonPct(person);
        const pctTd = document.createElement('td');
        pctTd.className = 'pct-cell';
        pctTd.innerHTML = `<div class="pct-badge" style="--pct-color:${getPctColor(pct)}"><span class="pct-value">${pct}%</span><div class="pct-bar"><div class="pct-bar-fill" style="width:${pct}%;background:${getPctColor(pct)}"></div></div></div>`;
        tr.appendChild(pctTd);

        tr.addEventListener('contextmenu', (e) => { e.preventDefault(); showContextMenu(e, idx); });
        tr.addEventListener('dblclick', () => openModal(idx));
        tableBody.appendChild(tr);
    });
}

function createRatingDots(val) {
    let html = '<div class="rating-display">';
    for (let i = 1; i <= 5; i++) {
        html += i <= val
            ? `<span class="rating-dot filled ${getDotColor(val)}"></span>`
            : `<span class="rating-dot empty"></span>`;
    }
    html += `<span class="rating-value ${getRateColor(val)}">${val}</span></div>`;
    return html;
}

// ============================================
// CARDS VIEW
// ============================================
function renderCards() {
    cardsGrid.innerHTML = '';
    people.forEach((person, idx) => {
        const avg = getAvg(person);
        const pct = getGoodPersonPct(person);
        const card = document.createElement('div');
        card.className = 'person-card';
        card.style.animationDelay = `${idx * 0.06}s`;

        let statsHtml = '';
        categories.forEach(cat => {
            const val = person.ratings[cat] ?? 0;
            const pctVal = (val / 5) * 100;
            const color = getAvgColor(val);
            const isPos = polarity[cat] !== false;
            statsHtml += `
                <div class="card-stat">
                    <span class="card-stat-label"><span class="polarity-dot ${isPos ? 'pos' : 'neg'}">${isPos ? '▲' : '▼'}</span>${cat}</span>
                    <div class="card-stat-bar">
                        <div class="mini-bar"><div class="mini-bar-fill" style="width:${pctVal}%;background:${color}"></div></div>
                        <span class="card-stat-value ${getRateColor(val)}">${val}</span>
                    </div>
                </div>`;
        });

        card.innerHTML = `
            <div class="card-header">
                <span class="card-name">${person.name}</span>
                <div class="card-avg-group">
                    <div class="card-avg">
                        <span class="card-avg-value" style="color:${getAvgColor(avg)}">${avg}</span>
                        <span class="card-avg-label">moyenne</span>
                    </div>
                    <div class="card-pct">
                        <span class="card-pct-value" style="color:${getPctColor(pct)}">${pct}%</span>
                        <span class="card-avg-label">bonne personne</span>
                    </div>
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
        .map((p, i) => ({ ...p, originalIdx: i, avg: parseFloat(getAvg(p)), pct: getGoodPersonPct(p) }))
        .sort((a, b) => b.pct - a.pct);  // Sort by good person %

    sorted.forEach((person, rank) => {
        const row = document.createElement('div');
        row.className = 'ranking-row';
        row.style.animationDelay = `${rank * 0.08}s`;
        let posClass = rank === 0 ? 'gold' : rank === 1 ? 'silver' : rank === 2 ? 'bronze' : '';

        row.innerHTML = `
            <div class="ranking-position ${posClass}">#${rank + 1}</div>
            <div class="ranking-info"><div class="ranking-name">${person.name}</div></div>
            <div class="ranking-bar-container">
                <div class="ranking-bar"><div class="ranking-bar-fill" style="width:${person.pct}%"></div></div>
            </div>
            <div class="ranking-score" style="color:${getPctColor(person.pct)}">${person.pct}%</div>`;

        row.addEventListener('dblclick', () => openModal(person.originalIdx));
        row.addEventListener('contextmenu', (e) => { e.preventDefault(); showContextMenu(e, person.originalIdx); });
        rankingContainer.appendChild(row);
    });
}

// ============================================
// PERSON MODAL
// ============================================
function openModal(index = -1) {
    editingIndex = index;
    hideContextMenu();
    modalTitle.textContent = index === -1 ? 'Ajouter une personne' : 'Modifier — ' + people[index].name;
    personName.value = index === -1 ? '' : people[index].name;

    modalRatings.innerHTML = '';
    categories.forEach(cat => {
        const currentVal = index === -1 ? 0 : (people[index].ratings[cat] ?? 0);
        const isPos = polarity[cat] !== false;
        const group = document.createElement('div');
        group.className = 'rating-input-group';
        const safeId = cat.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '');

        let starsHtml = '<div class="star-rating">';
        for (let i = 5; i >= 1; i--) {
            const id = `star_${safeId}_${i}`;
            starsHtml += `<input type="radio" name="rate_${safeId}" id="${id}" value="${i}" ${currentVal === i ? 'checked' : ''}>`;
            starsHtml += `<label for="${id}" title="${i}"></label>`;
        }
        const zeroId = `star_${safeId}_0`;
        starsHtml += `<input type="radio" name="rate_${safeId}" id="${zeroId}" value="0" ${currentVal === 0 ? 'checked' : ''} class="sr-only">`;
        starsHtml += '</div>';

        group.innerHTML = `<span class="rating-input-label"><span class="polarity-dot ${isPos ? 'pos' : 'neg'}">${isPos ? '▲' : '▼'}</span>${cat}</span>${starsHtml}`;
        group.dataset.category = cat;
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
    categories.forEach(cat => {
        const safeId = cat.replace(/[^a-zA-ZÀ-ÿ0-9]/g, '');
        const checked = document.querySelector(`input[name="rate_${safeId}"]:checked`);
        ratings[cat] = checked ? parseInt(checked.value) : 0;
    });

    if (editingIndex === -1) {
        people.push({ name, ratings });
    } else {
        people[editingIndex] = { name, ratings };
    }

    save();
    buildTableHeader();
    renderAll();
    closeModal();
}

// ============================================
// CATEGORY MODAL
// ============================================
function openCatModal() {
    renderCatList();
    catModalOverlay.classList.remove('hidden');
    newCatInput.value = '';
    newCatInput.focus();
}

function closeCatModal() {
    catModalOverlay.classList.add('hidden');
}

function renderCatList() {
    catList.innerHTML = '';
    categories.forEach((cat, idx) => {
        const isPos = polarity[cat] !== false;
        const item = document.createElement('div');
        item.className = 'cat-item';
        item.innerHTML = `
            <span class="cat-item-name">${cat}</span>
            <div class="cat-item-controls">
                <button class="polarity-toggle ${isPos ? 'positive' : 'negative'}" data-cat="${cat}" title="${isPos ? 'Positif (+ = mieux)' : 'Négatif (+ = pire)'}">
                    <span class="polarity-icon">${isPos ? '👍' : '👎'}</span>
                    <span class="polarity-text">${isPos ? '+ = Bien' : '+ = Mal'}</span>
                </button>
                <button class="cat-item-delete" title="Supprimer" data-idx="${idx}">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                </button>
            </div>`;
        
        item.querySelector('.polarity-toggle').addEventListener('click', () => togglePolarity(cat));
        item.querySelector('.cat-item-delete').addEventListener('click', () => removeCategory(idx));
        catList.appendChild(item);
    });
}

function togglePolarity(cat) {
    polarity[cat] = !polarity[cat];
    save();
    renderCatList();
    buildTableHeader();
    renderAll();
}

function addCategory() {
    const name = newCatInput.value.trim().toUpperCase();
    if (!name) return;
    if (categories.includes(name)) {
        newCatInput.style.borderColor = 'var(--rate-1)';
        return;
    }
    categories.push(name);
    polarity[name] = true; // default: positive
    people.forEach(p => { p.ratings[name] = 0; });
    save();
    renderCatList();
    newCatInput.value = '';
    newCatInput.style.borderColor = '';
    newCatInput.focus();
    buildTableHeader();
    renderAll();
}

function removeCategory(idx) {
    const cat = categories[idx];
    categories.splice(idx, 1);
    delete polarity[cat];
    people.forEach(p => { delete p.ratings[cat]; });
    save();
    renderCatList();
    buildTableHeader();
    renderAll();
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
    document.querySelectorAll('.view-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
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
    let csv = 'NOM,' + categories.join(',') + ',MOYENNE,% BONNE PERSONNE\n';
    people.forEach(p => {
        const vals = categories.map(c => p.ratings[c] ?? 0);
        csv += `${p.name},${vals.join(',')},${getAvg(p)},${getGoodPersonPct(p)}%\n`;
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
// EVENTS
// ============================================
function bindEvents() {
    document.querySelectorAll('.view-btn').forEach(btn => btn.addEventListener('click', () => switchView(btn.dataset.view)));
    document.getElementById('btnAddPerson').addEventListener('click', () => openModal(-1));
    document.getElementById('btnAddCategory').addEventListener('click', openCatModal);
    document.getElementById('btnExport').addEventListener('click', exportData);

    document.getElementById('modalClose').addEventListener('click', closeModal);
    document.getElementById('btnCancel').addEventListener('click', closeModal);
    document.getElementById('btnSave').addEventListener('click', saveModal);
    modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) closeModal(); });

    document.getElementById('catModalClose').addEventListener('click', closeCatModal);
    document.getElementById('btnCatDone').addEventListener('click', closeCatModal);
    document.getElementById('btnAddCat').addEventListener('click', addCategory);
    catModalOverlay.addEventListener('click', (e) => { if (e.target === catModalOverlay) closeCatModal(); });
    newCatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') addCategory(); });
    newCatInput.addEventListener('focus', () => { newCatInput.style.borderColor = ''; });

    document.getElementById('ctxEdit').addEventListener('click', () => openModal(contextTarget));
    document.getElementById('ctxDelete').addEventListener('click', () => deletePerson(contextTarget));
    document.addEventListener('click', hideContextMenu);

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') { closeModal(); closeCatModal(); hideContextMenu(); }
    });

    personName.addEventListener('focus', () => { personName.style.borderColor = ''; });
}

init();
