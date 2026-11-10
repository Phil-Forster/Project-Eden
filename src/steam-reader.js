'use strict';

const { ACHIEVEMENTS, normalizeName, SIMPLE_TARGETS } = require('./achievements');
const { discoverSteamAccount, readLocalPlaytime, readLocalSteamAchievements } = require('./steam-local-reader');
const { version: APP_VERSION } = require('../package.json');

const APP_ID = '1284190';
const GLOBAL_URL = `https://steamcommunity.com/stats/${APP_ID}/achievements/?l=english`;
const STEAM_HTTP_TIMEOUT_MS = 8_000;

function decodeHtml(value = '') {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

function stripHtml(value = '') {
  return decodeHtml(value.replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeIconUrl(value = '') {
  const decoded = decodeHtml(value.trim());
  if (!decoded) return null;
  if (decoded.startsWith('//')) return `https:${decoded}`;
  if (/^https?:\/\//i.test(decoded)) return decoded.replace(/^http:/i, 'https:');
  return null;
}

function extractIcon(block) {
  const matches = [...block.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)];
  const candidates = matches.map((match) => normalizeIconUrl(match[1])).filter(Boolean);
  return candidates.find((url) => url.includes(`/images/apps/${APP_ID}/`))
    || candidates.find((url) => url.includes('/steamcommunity/public/images/apps/'))
    || null;
}

function extractProgress(block) {
  const candidates = [];
  const progressRegex = /<[^>]+class=["'][^"']*(?:achieveProgress|progress)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/gi;
  let match;
  while ((match = progressRegex.exec(block))) candidates.push(stripHtml(match[1]));

  for (const text of candidates) {
    const ratio = text.match(/([\d,]+)\s*\/\s*([\d,]+)/);
    if (ratio) {
      return {
        current: Number(ratio[1].replace(/,/g, '')),
        target: Number(ratio[2].replace(/,/g, '')),
        text
      };
    }
    const percent = text.match(/([\d.]+)\s*%/);
    if (percent) return { percent: Number(percent[1]), text };
  }
  return null;
}

function achievementBlocks(html) {
  const startRegex = /<div\b[^>]*class=["'][^"']*\bachieveRow\b[^"']*["'][^>]*>/gi;
  const starts = [];
  let match;
  while ((match = startRegex.exec(html))) starts.push(match.index);
  return starts.map((start, index) => html.slice(start, starts[index + 1] ?? html.length));
}

function extractAchievementRows(html, { playerPage = true } = {}) {
  const rows = [];

  for (const block of achievementBlocks(html)) {
    const nameMatch = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
    if (!nameMatch) continue;

    const descriptionMatch = block.match(/<h5[^>]*>([\s\S]*?)<\/h5>/i);
    const unlockMatch = block.match(/class=["'][^"']*achieveUnlockTime[^"']*["'][^>]*>([\s\S]*?)<\/div>/i);
    const classMatch = block.match(/^<div\b[^>]*class=["']([^"']*)["']/i);
    const rowClasses = classMatch?.[1] || '';
    const name = stripHtml(nameMatch[1]);
    if (!name) continue;

    let unlocked = null;
    if (playerPage) {
      const explicitLocked = /\bdisabled\b|\blocked\b/i.test(rowClasses);
      if (unlockMatch && !explicitLocked) unlocked = true;
      else if (explicitLocked) unlocked = false;
      // Deliberately do not assume that any other row shape means locked.
      // Steam page markup changes are not allowed to create false states.
    }

    rows.push({
      name,
      normalizedName: normalizeName(name),
      description: descriptionMatch ? stripHtml(descriptionMatch[1]) : '',
      iconUrl: extractIcon(block),
      unlocked,
      unlockedAt: unlockMatch ? stripHtml(unlockMatch[1]) : null,
      progress: playerPage ? extractProgress(block) : null,
      stateSource: playerPage ? 'steam-community' : 'steam-global'
    });
  }

  return rows;
}

function staticMetadata() {
  return ACHIEVEMENTS.map((item) => ({
    name: item.name,
    normalizedName: normalizeName(item.name),
    description: item.description,
    iconUrl: null,
    unlocked: null,
    unlockedAt: null,
    progress: null,
    stateSource: null
  }));
}


// Project Eden only accepts achievement-specific stat links parsed from Steam's own schema.
// No cross-game/name-guess fallback is permitted.

function statNumericValue(stat) {
  if (!stat) return null;
  if (Number.isFinite(Number(stat.intValue))) return Number(stat.intValue);
  if (Number.isFinite(Number(stat.floatValue))) return Number(stat.floatValue);
  return null;
}

function achievementTarget(name, row) {
  const max = Number(row?.progressMax);
  if (Number.isFinite(max) && max > 1) return max;
  const target = Number(SIMPLE_TARGETS?.[name]?.target);
  return Number.isFinite(target) && target > 0 ? target : null;
}

function chooseSteamStat(name, row, allStats = []) {
  const target = achievementTarget(name, row);
  const locked = row?.unlocked === false;
  const schemaStats = Array.isArray(row?.schemaStats) ? row.schemaStats : [];

  const usable = (candidate) => {
    const value = statNumericValue(candidate);
    if (!Number.isFinite(value) || value < 0) return false;
    if (locked && Number.isFinite(target) && value > target) return false;
    return true;
  };

  // Only accept an exact achievement -> stat relationship parsed from Steam's
  // own schema. If Steam does not expose one unambiguous counter, report no
  // numeric progress rather than guessing from names or neighbouring stats.
  const structural = (allStats || []).filter((candidate) => schemaStats.includes(candidate.name) && usable(candidate));
  if (structural.length === 1) return { ...structural[0], match: 'schema-structure' };
  return null;
}

function steamProgressFor(name, row, allStats = []) {
  const target = achievementTarget(name, row);
  if (!Number.isFinite(target) || target <= 1) return null;

  // Once Steam has awarded an achievement, the achievement-specific count is
  // complete at its threshold. A larger current/lifetime stat is not useful.
  if (row?.unlocked === true) {
    return {
      current: target,
      target,
      text: `${target} / ${target}`,
      source: 'steam-progress-limit',
      statName: null,
      confidence: 'authoritative-complete'
    };
  }

  if (row?.unlocked !== false) return null;
  const stat = chooseSteamStat(name, row, allStats);
  if (!stat) return null;
  const current = statNumericValue(stat);
  if (!Number.isFinite(current)) return null;

  return {
    current: Math.max(0, Math.min(current, target)),
    target,
    text: `${Math.max(0, Math.min(current, target))} / ${target}`,
    source: 'steam-local-stat',
    statName: stat.name,
    statType: stat.type,
    match: stat.match,
    confidence: 'steam-local'
  };
}

function mergeRows(metadataRows, playerRows, playerSource = null, localStats = []) {
  const metaByName = new Map(metadataRows.map((item) => [normalizeName(item.name), item]));
  const playerByName = new Map(playerRows.map((item) => [normalizeName(item.name), item]));

  return ACHIEVEMENTS.map((definition) => {
    const key = normalizeName(definition.name);
    const meta = metaByName.get(key) || {};
    const player = playerByName.get(key) || {};
    return {
      name: definition.name,
      normalizedName: key,
      apiName: player.apiName || null,
      description: player.description || meta.description || definition.description,
      iconUrl: player.iconUrl || meta.iconUrl || null,
      unlocked: typeof player.unlocked === 'boolean' ? player.unlocked : null,
      unlockedAt: player.unlockedAt || null,
      progress: player.progress || steamProgressFor(definition.name, player, localStats),
      progressMin: Number.isFinite(Number(player.progressMin)) ? Number(player.progressMin) : null,
      progressMax: Number.isFinite(Number(player.progressMax)) ? Number(player.progressMax) : null,
      nearbyStats: Array.isArray(player.nearbyStats) ? player.nearbyStats : [],
      schemaStats: Array.isArray(player.schemaStats) ? player.schemaStats : [],
      stateSource: typeof player.unlocked === 'boolean' ? (player.stateSource || playerSource) : null
    };
  });
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STEAM_HTTP_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': `The Planet Crafter-Achievement-Tracker/${APP_VERSION}`,
        'Accept-Language': 'en-GB,en;q=0.9'
      },
      redirect: 'follow',
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`Steam returned HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error('Steam request timed out.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchGlobalMetadata() {
  try {
    const html = await fetchText(GLOBAL_URL);
    const rows = extractAchievementRows(html, { playerPage: false });
    const defaults = staticMetadata();
    const merged = mergeRows(rows.length ? rows : defaults, []);
    return { ok: true, source: 'steam-global', url: GLOBAL_URL, achievements: merged, count: rows.length };
  } catch (error) {
    return { ok: false, source: 'static-metadata', error: error.message, achievements: staticMetadata(), count: 0 };
  }
}

async function fetchCommunityPlayerRows(steamId) {
  if (!/^\d{10,20}$/.test(String(steamId || ''))) {
    return { ok: false, error: 'No logged-in Steam account ID was available for Community fallback.', rows: [], count: 0 };
  }
  const urls = [
    `https://steamcommunity.com/profiles/${steamId}/stats/${APP_ID}/achievements/?l=english`,
    `https://steamcommunity.com/profiles/${steamId}/stats/${APP_ID}/?tab=achievements&l=english`
  ];

  let lastError = null;
  for (const url of urls) {
    try {
      const html = await fetchText(url);
      const rows = extractAchievementRows(html, { playerPage: true });
      const resolved = rows.filter((item) => typeof item.unlocked === 'boolean');
      if (resolved.length > 0) return { ok: true, url, rows, count: resolved.length };

      if (/This profile is private|profile is private|game details are private/i.test(html)) {
        return { ok: false, error: 'Steam profile or Game details privacy prevents the Community achievement page being read.', rows: [], count: 0 };
      }
      lastError = 'Steam Community page did not expose reliable locked/unlocked rows.';
    } catch (error) {
      lastError = error.message;
    }
  }

  return { ok: false, error: lastError || 'Steam Community achievement state could not be read.', rows: [], count: 0 };
}

async function fetchSteamAchievements() {
  const metadataPromise = fetchGlobalMetadata();
  const account = discoverSteamAccount();
  const playtime = readLocalPlaytime(account);

  // Local Steamworks state is the primary authority. This reads the
  // logged-in Steam client's UserStats for App 1284190 via the game's own
  // steam_api64.dll. It is independent of Community profile privacy.
  const local = readLocalSteamAchievements(account.steamId || '');
  const metadata = await metadataPromise;
  const steamId = local.actualSteamId || account.steamId || null;

  let playerRows = [];
  let source = 'none';
  let sourceDetail = null;
  let fallbackError = null;

  if (local.ok && Array.isArray(local.rows) && local.rows.length > 0) {
    playerRows = local.rows.map((row) => ({ ...row, stateSource: 'steam-local-api' }));
    source = 'steam-local-api';
    sourceDetail = local.gamePath || null;
  } else {
    const community = await fetchCommunityPlayerRows(steamId);
    if (community.ok) {
      playerRows = community.rows;
      source = 'steam-community';
      sourceDetail = community.url || null;
    }
    fallbackError = community.error || null;
  }

  const achievements = mergeRows(metadata.achievements, playerRows, source, local.stats || []);
  const stateCount = achievements.filter((item) => typeof item.unlocked === 'boolean').length;
  const iconCount = achievements.filter((item) => item.iconUrl).length;

  const errors = [];
  if (!local.ok && local.error) {
    const location = [
      local.gamePath ? `Game: ${local.gamePath}` : null,
      local.dllPath ? `DLL: ${local.dllPath}` : null
    ].filter(Boolean).join(' · ');
    errors.push(`Local Steam API: ${local.error}${location ? ` (${location})` : ''}`);
  }
  if (stateCount !== ACHIEVEMENTS.length && fallbackError) errors.push(`Community fallback: ${fallbackError}`);
  if (stateCount !== ACHIEVEMENTS.length) errors.push(`Resolved ${stateCount} of ${ACHIEVEMENTS.length} Steam achievement states.`);

  return {
    ok: stateCount === ACHIEVEMENTS.length,
    source,
    sourceDetail,
    steamId,
    account,
    playtime,
    local,
    statsCount: Number(local?.discoveredStatCount || local?.stats?.length || 0),
    statsSchema: local?.schemaPath || null,
    metadataOk: metadata.ok,
    metadataCount: metadata.count,
    iconCount,
    achievements,
    count: stateCount,
    error: errors.length ? errors.join(' ') : null
  };
}

module.exports = {
  APP_ID,
  GLOBAL_URL,
  fetchSteamAchievements,
  extractAchievementRows,
  mergeRows
};
