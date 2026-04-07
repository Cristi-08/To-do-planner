// ===== DARK/LIGHT MODE =====
function toggleTheme() {
    const html = document.documentElement;
    const btn = document.getElementById('theme-toggle');
    if (html.getAttribute('data-theme') === 'light') {
        html.setAttribute('data-theme', 'dark');
        btn.textContent = '☀️ Light';
    } else {
        html.setAttribute('data-theme', 'light');
        btn.textContent = '🌙 Dark';
    }
    localStorage.setItem('theme', html.getAttribute('data-theme'));
}

// ===== SAVE TASKS TO LOCALSTORAGE =====
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ===== STATISTICS =====
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    document.getElementById('total-tasks').textContent = total;
    document.getElementById('completed-tasks').textContent = completed;
    document.getElementById('pending-tasks').textContent = total - completed;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = pct + '% completate';
}

// ===== RENDER TASKS =====
function renderTasks(filter = 'all') {
    const list = document.getElementById('task-list');
    let filtered = filter === 'all' ? [...tasks] : tasks.filter(t => t.category === filter);

    const sortEl = document.getElementById('sort-tasks');
    const sort = sortEl ? sortEl.value : 'created';
    const prioRank = { urgent: 0, normal: 1, relaxed: 2 };
    if (sort === 'deadline') {
        filtered.sort((a, b) => (a.deadline || '9999-12-31').localeCompare(b.deadline || '9999-12-31'));
    } else if (sort === 'priority') {
        filtered.sort((a, b) => prioRank[a.priority] - prioRank[b.priority]);
    } else {
        filtered.sort((a, b) => a.id - b.id);
    }

    const today = new Date().toISOString().split('T')[0];
    const urgencyLabel = (t) => {
        if (!t.deadline) return '';
        if (t.deadline < today) return '🔥 Expirat';
        const diff = Math.ceil((new Date(t.deadline) - new Date(today)) / 86400000);
        if (diff === 0) return '🔥 Astăzi';
        if (diff === 1) return '⏰ Mâine';
        if (diff <= 3) return `⚡ ${diff} zile`;
        return `🕒 ${diff} zile`;
    };

    if (filtered.length === 0) {
        list.innerHTML = '<p class="no-tasks">Nu ai taskuri momentan.</p>';
        return;
    }

    const priorityLabels = { urgent: '🔴 Urgent', normal: '🟡 Normal', relaxed: '🟢 Relaxed' };
    const categoryLabels = { school: '🎓 Școală', personal: '👤 Personal', project: '💼 Proiect' };

    list.innerHTML = filtered.map(t => {
        const overdue = t.deadline && t.deadline < today && !t.completed;
        return `
        <div class="task-item ${t.completed ? 'completed' : ''} ${overdue ? 'overdue' : ''}" data-priority="${t.priority}" data-id="${t.id}">
            <div class="task-info">
                <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask(${t.id})" />
                <span class="task-text">${overdue ? '⚠️ ' : ''}${t.text}</span>
            </div>
            <div class="task-meta">
                ${t.deadline ? `<span class="task-badge deadline">📅 ${t.deadline}</span>` : ''}
                ${t.deadline && !t.completed ? `<span class="task-badge urgency u-${t.deadline < today ? 'over' : ''}">${urgencyLabel(t)}</span>` : ''}
                <span class="task-badge category">${categoryLabels[t.category]}</span>
                <span class="task-badge priority">${priorityLabels[t.priority]}</span>
                <button class="edit-btn" onclick="editTask(${t.id})">✏️</button>
                <button class="delete-btn" onclick="deleteTask(${t.id})">🗑️</button>
            </div>
        </div>
    `;
    }).join('');

    requestAnimationFrame(() => {
        list.querySelectorAll('.task-item').forEach(el => el.classList.add('show'));
    });
}

// ===== QUICK DEADLINE =====
function toggleDeadlinePanel() {
    document.getElementById('deadline-panel').classList.toggle('open');
}

function quickDateFor(type) {
    if (type === 'none') return '';
    const d = new Date();
    if (type === 'today') return d.toISOString().split('T')[0];
    if (type === 'week') {
        const day = d.getDay() || 7;
        d.setDate(d.getDate() + (7 - day));
    } else if (type === 'month') {
        d.setMonth(d.getMonth() + 1, 0);
    }
    return d.toISOString().split('T')[0];
}

function syncQuickButtons() {
    const v = document.getElementById('task-deadline').value;
    const map = { none: quickDateFor('none'), today: quickDateFor('today'), week: quickDateFor('week'), month: quickDateFor('month') };
    const types = ['none', 'today', 'week', 'month'];
    document.querySelectorAll('.quick-deadlines button').forEach((b, i) => {
        b.classList.toggle('active', map[types[i]] === v);
    });
}

function onDeadlineChange() {
    const v = document.getElementById('task-deadline').value;
    document.getElementById('deadline-display').textContent = v || 'fără';
    syncQuickButtons();
}

function setQuickDeadline(type) {
    const input = document.getElementById('task-deadline');
    input.value = quickDateFor(type);
    document.getElementById('deadline-display').textContent = input.value || 'fără';
    syncQuickButtons();
}

// ===== CLEAR COMPLETED =====
function clearCompleted() {
    const completed = tasks.filter(t => t.completed);
    if (completed.length === 0) return;
    if (!confirm(`Ștergi ${completed.length} task(uri) completate?`)) return;
    document.querySelectorAll('.task-item.completed').forEach(el => el.classList.add('removing'));
    setTimeout(() => {
        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks(document.getElementById('filter-category').value);
        updateStats();
    }, 350);
}

// ===== EDIT TASK =====
function editTask(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const newText = prompt('Editează taskul:', task.text);
    if (newText === null || newText.trim() === '') return;
    task.text = newText.trim();
    saveTasks();
    renderTasks(document.getElementById('filter-category').value);
}

// ===== DELETE TASK =====
function deleteTask(id) {
    if (!confirm('Ești sigur că vrei să ștergi acest task?')) return;
    const el = document.querySelector(`.task-item[data-id="${id}"]`);
    if (el) el.classList.add('removing');
    setTimeout(() => {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderTasks(document.getElementById('filter-category').value);
        updateStats();
    }, 350);
}

// ===== INIT =====
window.onload = function () {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    document.getElementById('theme-toggle').textContent = savedTheme === 'dark' ? '☀️ Light' : '🌙 Dark';
    updateStats();
    renderTasks();
    fetchQuote();

    document.getElementById('task-input').addEventListener('keydown', function (e) {
        if (e.key === 'Enter') addTask();
    });
}

// ===== FETCH QUOTE =====
async function fetchQuote() {
    try {
        const response = await fetch('https://api.api-ninjas.com/v1/quotes', {
            headers: { 'X-Api-Key': 'cWVShiG81EBKoTg8zxXli1bKdMileuhfBWKuV4Z6' }
        });
        const data = await response.json();
        document.getElementById('quote-text').textContent = data[0].quote;
        document.getElementById('quote-author').textContent = '— ' + data[0].author;
    } catch (error) {
        document.getElementById('quote-text').textContent = 'Stay focused and keep going!';
        document.getElementById('quote-author').textContent = '— To-Do Planner';
    }
}

// ===== ADD TASK =====
function addTask() {
    const input = document.getElementById('task-input');
    const category = document.getElementById('task-category').value;
    const priority = document.getElementById('task-priority').value;
    const deadline = document.getElementById('task-deadline').value;
    if (input.value.trim() === '') return;
    const task = {
        id: Date.now(),
        text: input.value.trim(),
        category,
        priority,
        deadline,
        completed: false
    };
    tasks.push(task);
    saveTasks();
    input.value = '';
    document.getElementById('task-deadline').value = '';
    document.querySelectorAll('.quick-deadlines button').forEach(b => b.classList.remove('active'));
    document.getElementById('deadline-display').textContent = 'fără';
    document.getElementById('deadline-panel').classList.remove('open');
    renderTasks(document.getElementById('filter-category').value);
    updateStats();
}

// ===== MARK TASK AS COMPLETED =====
function toggleTask(id) {
    tasks = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    saveTasks();
    renderTasks(document.getElementById('filter-category').value);
    updateStats();
}

// ===== FILTER TASKS =====
function filterTasks() {
    const filter = document.getElementById('filter-category').value;
    renderTasks(filter);
}