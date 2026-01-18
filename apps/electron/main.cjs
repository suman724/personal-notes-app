const { app, BrowserWindow, ipcMain, dialog, Tray, Menu, globalShortcut, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const APP_NAME = 'Personal Notes';
const APP_ID = 'com.personalnotes.app';
const ASSET_DIR = () =>
  app.isPackaged ? path.join(app.getAppPath(), 'assets') : path.join(__dirname, 'assets');
const CONFIG_PATH = () => path.join(app.getPath('userData'), 'settings.json');
const NOTE_FILE_PREFIX = 'note-';

let mainWindow;
let quickWindow;
let tray;
let notesFolder = null;

app.setName(APP_NAME);
app.setAppUserModelId(APP_ID);

function readSettings() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH(), 'utf8');
    const data = JSON.parse(raw);
    if (data && typeof data.notesFolder === 'string') {
      notesFolder = data.notesFolder;
    }
  } catch {
    notesFolder = null;
  }
}

function writeSettings() {
  try {
    fs.mkdirSync(path.dirname(CONFIG_PATH()), { recursive: true });
    fs.writeFileSync(CONFIG_PATH(), JSON.stringify({ notesFolder }, null, 2));
  } catch {
    return;
  }
}

function getRendererLocation(mode) {
  const devUrl = process.env.ELECTRON_RENDERER_URL;
  if (devUrl) {
    const suffix = mode ? `?mode=${mode}` : '';
    return { type: 'url', value: `${devUrl}${suffix}` };
  }

  const filePath = path.join(app.getAppPath(), 'renderer', 'index.html');
  return { type: 'file', value: filePath, query: mode ? { mode } : undefined };
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 960,
    minHeight: 640,
    backgroundColor: '#f4efe8',
    title: APP_NAME,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const target = getRendererLocation();
  if (target.type === 'url') {
    mainWindow.loadURL(target.value);
  } else {
    mainWindow.loadFile(target.value, { query: target.query });
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createQuickWindow() {
  quickWindow = new BrowserWindow({
    width: 420,
    height: 520,
    resizable: false,
    fullscreenable: false,
    maximizable: false,
    minimizable: false,
    alwaysOnTop: true,
    title: `${APP_NAME} Quick Note`,
    backgroundColor: '#f4efe8',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const target = getRendererLocation('quick');
  if (target.type === 'url') {
    quickWindow.loadURL(target.value);
  } else {
    quickWindow.loadFile(target.value, { query: target.query });
  }

  quickWindow.on('blur', () => {
    if (quickWindow) {
      quickWindow.hide();
    }
  });

  quickWindow.on('closed', () => {
    quickWindow = null;
  });
}

function showQuickCapture() {
  if (!quickWindow) {
    createQuickWindow();
  } else {
    quickWindow.show();
    quickWindow.focus();
  }
}

function showMainWindow() {
  if (!mainWindow) {
    createMainWindow();
  } else {
    mainWindow.show();
    mainWindow.focus();
  }
}

function createTray() {
  const icon = createAppIcon().resize({ width: 18, height: 18 });
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true);
  }

  tray = new Tray(icon);
  tray.setToolTip(APP_NAME);
  tray.on('click', showQuickCapture);

  const menu = Menu.buildFromTemplate([
    { label: 'Quick note', click: showQuickCapture },
    { label: 'Show app', click: showMainWindow },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
}

function createAppIcon() {
  const iconPath = path.join(ASSET_DIR(), 'icon.png');
  if (fs.existsSync(iconPath)) {
    return nativeImage.createFromPath(iconPath);
  }

  const fallback = `
    <svg width="256" height="256" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
      <rect width="256" height="256" rx="56" fill="#2a2724"/>
      <rect x="60" y="64" width="136" height="16" rx="8" fill="#f4efe8"/>
      <rect x="60" y="104" width="136" height="16" rx="8" fill="#f4efe8"/>
      <rect x="60" y="144" width="96" height="16" rx="8" fill="#f4efe8"/>
    </svg>
  `;

  return nativeImage.createFromDataURL(`data:image/svg+xml;utf8,${encodeURIComponent(fallback)}`);
}

function sanitizeId(value) {
  return value.replace(/[^a-zA-Z0-9-_]/g, '');
}

function getNoteFilename(id) {
  return `${NOTE_FILE_PREFIX}${sanitizeId(id)}.md`;
}

function parseFrontMatter(raw) {
  const normalized = raw.replace(/\r\n/g, '\n');
  if (!normalized.startsWith('---\n')) {
    return { meta: {}, content: raw };
  }

  const endIndex = normalized.indexOf('\n---', 4);
  if (endIndex === -1) {
    return { meta: {}, content: raw };
  }

  const metaBlock = normalized.slice(4, endIndex).trim();
  const content = normalized.slice(endIndex + 4).replace(/^\n/, '');
  const meta = {};

  metaBlock.split('\n').forEach((line) => {
    const index = line.indexOf(':');
    if (index === -1) {
      return;
    }
    const key = line.slice(0, index).trim();
    const value = line.slice(index + 1).trim();
    if (key) {
      meta[key] = value;
    }
  });

  return { meta, content };
}

function serializeNote(note) {
  const title = String(note.title || '').replace(/\n/g, ' ').trim();
  const tags = Array.isArray(note.tags) ? note.tags.join(', ') : '';

  return [
    '---',
    `title: ${title}`,
    `tags: ${tags}`,
    `createdAt: ${note.createdAt}`,
    `updatedAt: ${note.updatedAt}`,
    '---',
    '',
    note.content || '',
  ].join('\n');
}

async function loadNotesFromDisk() {
  if (!notesFolder) {
    return [];
  }

  try {
    const entries = await fs.promises.readdir(notesFolder);
    const files = entries.filter(
      (entry) => entry.startsWith(NOTE_FILE_PREFIX) && entry.endsWith('.md'),
    );

    const notes = await Promise.all(
      files.map(async (file) => {
        const filePath = path.join(notesFolder, file);
        const raw = await fs.promises.readFile(filePath, 'utf8');
        const { meta, content } = parseFrontMatter(raw);
        const id = file.replace(NOTE_FILE_PREFIX, '').replace(/\.md$/, '');
        const stats = await fs.promises.stat(filePath);

        const createdAt = Number.parseInt(meta.createdAt, 10) || stats.birthtimeMs || Date.now();
        const updatedAt = Number.parseInt(meta.updatedAt, 10) || stats.mtimeMs || Date.now();
        const tags = meta.tags ? meta.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [];

        return {
          id,
          title: meta.title || '',
          content: content || '',
          tags,
          createdAt,
          updatedAt,
        };
      }),
    );

    return notes;
  } catch {
    return [];
  }
}

async function saveNotesToDisk(notes) {
  if (!notesFolder) {
    return;
  }

  await fs.promises.mkdir(notesFolder, { recursive: true });

  const entries = await fs.promises.readdir(notesFolder);
  const existing = new Set(
    entries.filter((entry) => entry.startsWith(NOTE_FILE_PREFIX) && entry.endsWith('.md')),
  );
  const keep = new Set();

  await Promise.all(
    notes.map(async (note) => {
      const filename = getNoteFilename(note.id);
      keep.add(filename);
      const filePath = path.join(notesFolder, filename);
      await fs.promises.writeFile(filePath, serializeNote(note), 'utf8');
    }),
  );

  await Promise.all(
    [...existing]
      .filter((file) => !keep.has(file))
      .map((file) => fs.promises.unlink(path.join(notesFolder, file))),
  );
}

app.whenReady().then(() => {
  if (process.platform === 'darwin' && app.dock) {
    app.dock.setIcon(createAppIcon());
  }

  readSettings();
  createMainWindow();
  createTray();

  globalShortcut.register('CommandOrControl+Shift+N', showQuickCapture);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('notes:get-folder', () => notesFolder);
ipcMain.handle('notes:select-folder', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openDirectory', 'createDirectory'],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  notesFolder = result.filePaths[0];
  writeSettings();
  return notesFolder;
});

ipcMain.handle('notes:load', () => loadNotesFromDisk());
ipcMain.handle('notes:save', (_event, notes) => saveNotesToDisk(notes));
