import { supabaseClient } from '../lib/supabase.js';
import lucide from 'lucide';
import Sortable from 'sortablejs';

// --- SHORTCUTS MANAGEMENT ---
export async function fetchShortcuts() {
  const { data, error } = await supabaseClient
    .from('shortcuts')
    .select('*')
    .order('order', { ascending: true });

  const defaultApps = [
    { id: 'default-1', name: 'Intent Logger', url: 'intent_logger.html' },
    { id: 'default-2', name: 'Habit Tracker', url: 'habit_tracker.html' },
    { id: 'default-3', name: 'Split', url: 'split.html' }
  ];

  if (error || !data || data.length === 0) {
    console.warn('Using default shortcuts due to error or empty data:', error);
    renderShortcuts(defaultApps);
    if (error) {
      document.getElementById('syncStatus').innerText = 'Sync Error (Defaults Loaded)';
    } else {
      document.getElementById('syncStatus').innerText = 'Cloud Synced';
    }
  } else {
    renderShortcuts(data);
    document.getElementById('syncStatus').innerText = 'Cloud Synced';
  }
}

export async function saveShortcut() {
  const id = document.getElementById('editId').value;
  const name = document.getElementById('nameInput').value.trim();
  const url = document.getElementById('urlInput').value.trim();
  if (!name || !url) return;

  const entry = { name, url, order: Math.floor(Date.now() / 1000) };

  if (id && id !== "null") {
    await supabaseClient.from('shortcuts').update(entry).eq('id', id);
  } else {
    await supabaseClient.from('shortcuts').insert([entry]);
  }

  toggleModal();
  fetchShortcuts();
}

export async function deleteShortcut(id, e) {
  e.preventDefault();
  e.stopPropagation();
  if (!confirm("Remove from Launchpad?")) return;
  await supabaseClient.from('shortcuts').delete().eq('id', id);
  fetchShortcuts();
}

export function openApp(url) {
  window.open(url, '_blank');
}

export function toggleModal(mode = 'add', id = null, name = '', url = '') {
  const modal = document.getElementById('modal');
  modal.classList.toggle('hidden');
  if (modal.classList.contains('hidden')) return;

  document.getElementById('modalTitle').innerText = mode === 'edit' ? 'Edit App' : 'Add App';
  document.getElementById('editId').value = id;
  document.getElementById('nameInput').value = name;
  document.getElementById('urlInput').value = url;
  document.getElementById('nameInput').focus();
}

function getAppIcon(url, name) {
  const appLogos = {
    'intent_logger.html': { emoji: '📝' },
    'habit_tracker.html': { emoji: '✅' },
    'split.html': { emoji: '💰' }
  };

  const appConfig = appLogos[url];
  if (appConfig) {
    return `<div class="text-4xl mb-2">${appConfig.emoji}</div>`;
  }

  return `<i data-lucide="${url.includes('http') ? 'globe' : 'layout'}" class="w-6 h-6"></i>`;
}

function getAppColors(url) {
  const appLogos = {
    'intent_logger.html': {
      color: 'bg-blue-100 dark:bg-blue-900/30',
      textColor: 'text-blue-600 dark:text-blue-400',
      hoverBg: 'group-hover:bg-blue-50 dark:group-hover:bg-blue-900/50'
    },
    'habit_tracker.html': {
      color: 'bg-emerald-100 dark:bg-emerald-900/30',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      hoverBg: 'group-hover:bg-emerald-50 dark:group-hover:bg-emerald-900/50'
    },
    'split.html': {
      color: 'bg-amber-100 dark:bg-amber-900/30',
      textColor: 'text-amber-600 dark:text-amber-400',
      hoverBg: 'group-hover:bg-amber-50 dark:group-hover:bg-amber-900/50'
    }
  };

  return appLogos[url] || {
    color: 'bg-slate-100 dark:bg-slate-800',
    textColor: 'text-slate-600 dark:text-slate-400',
    hoverBg: 'group-hover:bg-slate-50 dark:group-hover:bg-slate-700'
  };
}

function renderShortcuts(list) {
  const container = document.getElementById('launcherGrid');
  container.innerHTML = list.map(item => {
    const colors = getAppColors(item.url);
    return `
      <div class="glass-card p-8 rounded-[2.5rem] flex flex-col items-center text-center group relative cursor-pointer"
           data-id="${item.id}" onclick="window.launcher.openApp('${item.url}')">
        <div class="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
          <button onclick="event.stopPropagation(); window.launcher.toggleModal('edit', '${item.id}', '${item.name}', '${item.url}')" class="text-slate-300 hover:text-blue-500">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
          <button onclick="window.launcher.deleteShortcut('${item.id}', event)" class="text-slate-300 hover:text-red-400">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </div>
        <div class="icon-box mb-6 ${colors.color} ${colors.textColor} ${colors.hoverBg} transition-all group-hover:scale-110 flex items-center justify-center">
          ${getAppIcon(item.url, item.name)}
        </div>
        <span class="text-sm font-semibold tracking-tight text-slate-700 dark:text-slate-300 group-hover:dark:text-white transition-colors">${item.name}</span>
      </div>
    `;
  }).join('');
  lucide.createIcons();
}

export function initSortable() {
  Sortable.create(document.getElementById('launcherGrid'), {
    animation: 200,
    onEnd: async function () {
      const cards = document.querySelectorAll('[data-id]');
      for (let i = 0; i < cards.length; i++) {
        const id = cards[i].getAttribute('data-id');
        await supabaseClient.from('shortcuts').update({ order: i }).eq('id', id);
      }
    }
  });
}

export function toggleTheme() {
  if (document.documentElement.classList.contains('dark')) {
    document.documentElement.classList.remove('dark');
    localStorage.theme = 'light';
  } else {
    document.documentElement.classList.add('dark');
    localStorage.theme = 'dark';
  }
}

// --- DEV NOTES FUNCTIONS ---
export function toggleDevNotes() {
  document.getElementById('devNotesPanel').classList.toggle('open');
}

export function openDevNoteModal() {
  document.getElementById('devNotesModal').classList.add('open');
  document.getElementById('noteInput').focus();
  lucide.createIcons();
}

export function closeDevNoteModal() {
  document.getElementById('devNotesModal').classList.remove('open');
  document.getElementById('noteInput').value = '';
}

export async function saveDevNote() {
  const text = document.getElementById('noteInput').value.trim();
  const type = document.getElementById('noteType').value;
  if (!text) return;

  const page = window.location.pathname.split('/').pop() || 'index.html';
  const entry = {
    text,
    type,
    page,
    timestamp: new Date().toISOString()
  };

  await supabaseClient.from('dev_notes').insert([entry]);
  closeDevNoteModal();
  fetchDevNotes();
}

export async function fetchDevNotes() {
  const { data, error } = await supabaseClient
    .from('dev_notes')
    .select('*')
    .order('timestamp', { ascending: false });

  if (!error && data) {
    renderDevNotes(data);
  }
}

function renderDevNotes(notes) {
  const container = document.getElementById('devNotesContainer');
  const typeEmoji = { bug: '🐛', feature: '✨', note: '📝' };

  container.innerHTML = notes.map(note => `
    <div class="dev-note-item">
      <div class="flex justify-between items-start mb-1">
        <span class="text-xs font-semibold text-amber-600 dark:text-amber-500">${typeEmoji[note.type]} ${note.type.toUpperCase()}</span>
        <button onclick="window.launcher.deleteDevNote('${note.id}')" class="text-gray-300 hover:text-red-500 text-xs">
          <i data-lucide="trash-2" class="w-3 h-3"></i>
        </button>
      </div>
      <p class="text-sm text-gray-700 dark:text-gray-300 mb-1 dev-note-content">${escapeHtml(note.text)}</p>
      <div class="flex gap-2 text-xs text-gray-400">
        <span>${note.page}</span>
        <span>•</span>
        <span>${new Date(note.timestamp).toLocaleString()}</span>
      </div>
    </div>
  `).join('');
  lucide.createIcons();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export async function deleteDevNote(id) {
  await supabaseClient.from('dev_notes').delete().eq('id', id);
  fetchDevNotes();
}

export async function copyAllNotes() {
  const { data, error } = await supabaseClient
    .from('dev_notes')
    .select('*')
    .order('timestamp', { ascending: false });

  if (error || !data || data.length === 0) {
    alert('No notes to copy');
    return;
  }

  const typeEmoji = { bug: '🐛', feature: '✨', note: '📝' };
  const formatted = data.map(note => {
    const date = new Date(note.timestamp).toLocaleString();
    return `${typeEmoji[note.type]} **${note.type.toUpperCase()}** [${note.page}] - ${date}\n${note.text}\n`;
  }).join('\n---\n\n');

  const fullText = `# Dev Notes (${data.length} total)\n\n${formatted}`;

  try {
    await navigator.clipboard.writeText(fullText);
    alert(`Copied ${data.length} notes to clipboard! Paste them in your message to Claude.`);
  } catch (err) {
    console.error('Failed to copy:', err);
    alert('Failed to copy. Please try again.');
  }
}

// Initialize
export function init() {
  fetchShortcuts();
  initSortable();

  // Show dev notes button only on localhost
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (isLocalhost) {
    document.getElementById('devNotesBtn').style.display = 'flex';
    fetchDevNotes();
  }

  // Expose functions to window for onclick handlers
  window.launcher = {
    openApp,
    toggleModal,
    deleteShortcut,
    toggleTheme,
    toggleDevNotes,
    openDevNoteModal,
    closeDevNoteModal,
    saveDevNote,
    deleteDevNote,
    copyAllNotes
  };
}
