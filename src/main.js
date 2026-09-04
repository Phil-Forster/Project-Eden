'use strict';

const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow = null;
let splashWindow = null;
let splashFailSafe = null;
let dashboardRevealFallback = null;
let mainCreateFallback = null;
let cachedDashboard = null;
let cachedSteam = null;
let selectedSavePath = null;
let manualSaveRoot = null;
let saveWatcher = null;
let saveWatchTimer = null;

const STEAM_CACHE_TTL_MS = 60_000;
const APP_USER_MODEL_ID = 'uk.co.philforster.planetcrafterachievementtracker';
const APP_ICON = path.join(__dirname, '..', 'build', 'icon.png');


const splashReadyArg = process.argv.find((arg) => arg.startsWith('--splash-ready-file='));
const splashReadyFile = splashReadyArg ? splashReadyArg.slice('--splash-ready-file='.length).replace(/^"|"$/g, '') : null;
let splashReadySignalled = false;

function signalInstallerHandoffReady() {
  if (!splashReadyFile || splashReadySignalled) return;
  splashReadySignalled = true;
  try {
    fs.writeFileSync(splashReadyFile, 'ready', 'utf8');
  } catch {
    // Installer handoff is best-effort; application startup must never depend on it.
  }
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 900, height: 600, resizable: false, movable: true, frame: false,
    transparent: true, backgroundColor: '#091216', show: true, alwaysOnTop: true,
    skipTaskbar: true, hasShadow: false, paintWhenInitiallyHidden: false,
    webPreferences: { preload: path.join(__dirname, 'splash-preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  let mainStarted = false;
  const startMain = () => {
    if (mainStarted) return;
    mainStarted = true;
    if (mainCreateFallback) clearTimeout(mainCreateFallback);
    setImmediate(() => { createWindow(); splashFailSafe = setTimeout(revealMainWindow, 20_000); });
  };
  splashWindow.loadFile(path.join(__dirname, 'splash.html'));
  splashWindow.once('ready-to-show', signalInstallerHandoffReady);
  // Do not gate startup on ready-to-show: the splash window is visible from creation,
  // while its renderer paints and the dashboard starts loading in parallel.
  startMain();
  splashWindow.webContents.once('did-fail-load', () => {
    if (splashWindow && !splashWindow.isDestroyed()) splashWindow.setBackgroundColor('#091216');
  });
  splashWindow.on('closed', () => { splashWindow = null; });
}

function updateSplashStatus(label, progress) {
  if (!splashWindow || splashWindow.isDestroyed()) return;
  splashWindow.webContents.send('splash:status', {
    label: typeof label === 'string' ? label : '',
    progress: Number.isFinite(Number(progress)) ? Math.max(0, Math.min(100, Number(progress))) : null
  });
}

function revealMainWindow() {
  if (splashFailSafe) clearTimeout(splashFailSafe);
  if (dashboardRevealFallback) clearTimeout(dashboardRevealFallback);
  if (mainWindow && !mainWindow.isDestroyed()) { mainWindow.show(); mainWindow.focus(); }
  if (splashWindow && !splashWindow.isDestroyed()) splashWindow.close();
}

function scheduleMainReveal(delayMs = 700) {
  if (dashboardRevealFallback) clearTimeout(dashboardRevealFallback);
  dashboardRevealFallback = setTimeout(revealMainWindow, delayMs);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1460, height: 940, minWidth: 1080, minHeight: 720,
    backgroundColor: '#0a1013', icon: fs.existsSync(APP_ICON) ? APP_ICON : undefined, show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js'), contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  mainWindow.removeMenu();
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) event.preventDefault();
  });
  mainWindow.webContents.on('did-fail-load', (_event, code, description) => {
    updateSplashStatus(`Dashboard failed to load (${code}): ${description}`, 100);
    scheduleMainReveal(250);
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

async function buildDashboard({ force = false, onStatus = null } = {}) {
  const report = typeof onStatus === 'function' ? onStatus : () => {};
  if (!force && cachedDashboard && Date.now() - cachedDashboard.fetchedAt < STEAM_CACHE_TTL_MS) return cachedDashboard.data;
  report('Locating The Planet Crafter and Steam…', 18);
  const { fetchSteamAchievements } = require('./steam-reader');
  const { mergeAchievementState } = require('./achievements');
  const { discoverSaveFiles } = require('./save-reader');
  report('Reading Steam achievement state…', 46);
  const steam = !force && cachedSteam && Date.now() - cachedSteam.fetchedAt < STEAM_CACHE_TTL_MS
    ? cachedSteam.data
    : await fetchSteamAchievements();
  cachedSteam = { fetchedAt: Date.now(), data: steam };
  report('Finding optional terraformation saves…', 64);
  const saves = discoverSaveFiles({ manualRoot: manualSaveRoot, selectedPath: selectedSavePath });
  if (selectedSavePath && !saves.selected) selectedSavePath = null;
  report('Mapping achievement counters…', 78);
  const achievements = mergeAchievementState(saves.selected, steam.achievements || []);
  const data = {
    ok: true,
    appId: '1284190',
    gamePath: steam.local?.gamePath || null,
    steamId: steam.steamId || null,
    personaName: steam.account?.personaName || null,
    steam,
    saves,
    achievements
  };
  report('Preparing dashboard…', 96);
  cachedDashboard = { fetchedAt: Date.now(), data };
  return data;
}

function stopSaveWatcher() {
  if (saveWatchTimer) clearTimeout(saveWatchTimer);
  saveWatchTimer = null;
  if (saveWatcher) saveWatcher.close();
  saveWatcher = null;
}

function startSaveWatcher(roots = []) {
  stopSaveWatcher();
  const root = roots.find((candidate) => candidate && fs.existsSync(candidate));
  if (!root) return;
  try {
    saveWatcher = fs.watch(root, { recursive: false }, () => {
      if (saveWatchTimer) clearTimeout(saveWatchTimer);
      saveWatchTimer = setTimeout(async () => {
        if (!mainWindow || mainWindow.isDestroyed()) return;
        cachedDashboard = null;
        try {
          const data = await buildDashboard();
          mainWindow.webContents.send('dashboard-updated', data);
        } catch {
          // A save may be replaced atomically. The next event/manual refresh retries.
        }
      }, 700);
    });
  } catch {
    // Watching is optional; manual refresh remains available.
  }
}

ipcMain.handle('app:meta', () => ({ version: app.getVersion() }));

ipcMain.handle('dashboard:get', async () => {
  const data = await buildDashboard({ onStatus: updateSplashStatus });
  startSaveWatcher(data.saves?.roots || []);
  updateSplashStatus('Rendering dashboard…', 98);
  // The renderer explicitly signals after its first painted frame and after
  // all local background artwork has decoded. This is a fail-safe only.
  scheduleMainReveal(8000);
  return data;
});
ipcMain.handle('dashboard:refresh', async () => buildDashboard({ force: true }));
ipcMain.handle('save:select', async (_event, key) => {
  selectedSavePath = typeof key === 'string' && key.trim() ? path.resolve(key) : null;
  cachedDashboard = null;
  const data = await buildDashboard();
  startSaveWatcher(data.saves?.roots || []);
  return data;
});
ipcMain.handle('save:browse', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Choose a The Planet Crafter save folder',
    properties: ['openDirectory']
  });
  if (result.canceled || !result.filePaths?.[0]) return { canceled: true };
  manualSaveRoot = result.filePaths[0];
  const { discoverSaveFiles } = require('./save-reader');
  const discovered = discoverSaveFiles({ manualRoot: manualSaveRoot });
  if (!discovered.files.length) return { canceled: false, ok: false, error: 'No .sav files were found in that folder.' };
  selectedSavePath = discovered.files.find((item) => item.type === 'Active slot')?.path
    || discovered.files[0].path;
  cachedDashboard = null;
  const data = await buildDashboard();
  startSaveWatcher(data.saves?.roots || []);
  return { canceled: false, ok: true, data };
});
ipcMain.on('ui:ready', (event) => {
  if (!mainWindow || mainWindow.isDestroyed() || event.sender !== mainWindow.webContents) return;
  updateSplashStatus('Ready', 100);
  setTimeout(revealMainWindow, 180);
});
ipcMain.handle('folder:open-game', async () => {
  const gamePath = cachedDashboard?.data?.gamePath;
  if (gamePath && fs.existsSync(gamePath)) {
    const error = await shell.openPath(gamePath);
    return { ok: error === '', error: error || null };
  }
  return { ok: false, error: 'The Planet Crafter installation folder is not currently available.' };
});
ipcMain.handle('folder:open-save', async () => {
  const target = cachedDashboard?.data?.saves?.selected?.folder
    || cachedDashboard?.data?.saves?.roots?.[0]
    || null;
  if (target && fs.existsSync(target)) {
    const error = await shell.openPath(target);
    return { ok: error === '', error: error || null };
  }
  return { ok: false, error: 'No The Planet Crafter save folder is currently available.' };
});

const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) app.quit();
else {
  app.on('second-instance', () => {
    const window = mainWindow && !mainWindow.isDestroyed() ? mainWindow : splashWindow;
    if (window && !window.isDestroyed()) { if (window.isMinimized()) window.restore(); window.show(); window.focus(); }
  });
  app.whenReady().then(() => {
    if (process.platform === 'win32') app.setAppUserModelId(APP_USER_MODEL_ID);
    createSplashWindow();
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createSplashWindow(); });
  });
  app.on('before-quit', () => {
    stopSaveWatcher();
    if (splashFailSafe) clearTimeout(splashFailSafe);
    if (dashboardRevealFallback) clearTimeout(dashboardRevealFallback);
    if (mainCreateFallback) clearTimeout(mainCreateFallback);
  });
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
}
