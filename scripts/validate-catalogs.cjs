#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const CLAUDE_PATH = path.join(ROOT, '.claude-plugin', 'marketplace.json');
const CODEX_PATH = path.join(ROOT, '.agents', 'plugins', 'marketplace.json');
const MARKETPLACE_ID = 'beneficial-ai-foundation';
const DISPLAY_NAME = 'Beneficial AI Foundation';

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    fail(`${path.relative(ROOT, file)} is not valid JSON: ${error.message}`);
  }
}

function pluginMap(catalog, label) {
  assert(Array.isArray(catalog.plugins), `${label}.plugins must be an array`);
  assert(catalog.plugins.length > 0, `${label}.plugins must not be empty`);

  const entries = new Map();
  for (const plugin of catalog.plugins) {
    assert(plugin && typeof plugin === 'object', `${label} contains a non-object plugin entry`);
    assert(typeof plugin.name === 'string' && plugin.name.length > 0,
      `${label} contains a plugin without a name`);
    assert(!entries.has(plugin.name), `${label} contains duplicate plugin ${plugin.name}`);
    entries.set(plugin.name, plugin);
  }
  return entries;
}

function validateSource(source, label) {
  assert(source && typeof source === 'object' && !Array.isArray(source),
    `${label}.source must be an object`);
  assert(source.source === 'git-subdir', `${label}.source.source must be git-subdir`);
  assert(/^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git$/.test(source.url),
    `${label}.source.url must be an HTTPS GitHub .git URL`);
  assert(typeof source.path === 'string' && source.path.startsWith('./'),
    `${label}.source.path must be a ./-relative subdirectory`);
  assert(!source.path.split('/').includes('..') && path.posix.normalize(source.path) !== '.',
    `${label}.source.path must not escape or resolve to the repository root`);
  assert(/^v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(source.ref),
    `${label}.source.ref must be a semantic release tag`);
  assert(/^[0-9a-f]{40}$/.test(source.sha),
    `${label}.source.sha must be a lowercase 40-character commit SHA`);
}

const claude = readJson(CLAUDE_PATH);
const codex = readJson(CODEX_PATH);

assert(claude.name === MARKETPLACE_ID, `Claude marketplace name must be ${MARKETPLACE_ID}`);
assert(claude.owner?.name === DISPLAY_NAME, `Claude owner name must be ${DISPLAY_NAME}`);
assert(codex.name === MARKETPLACE_ID, `Codex marketplace name must be ${MARKETPLACE_ID}`);
assert(codex.interface?.displayName === DISPLAY_NAME,
  `Codex display name must be ${DISPLAY_NAME}`);

const claudePlugins = pluginMap(claude, 'Claude marketplace');
const codexPlugins = pluginMap(codex, 'Codex marketplace');
const claudeNames = [...claudePlugins.keys()].sort();
const codexNames = [...codexPlugins.keys()].sort();

assert(JSON.stringify(claudeNames) === JSON.stringify(codexNames),
  'Claude and Codex marketplaces must contain identical plugin sets');

for (const name of claudeNames) {
  const claudePlugin = claudePlugins.get(name);
  const codexPlugin = codexPlugins.get(name);

  validateSource(claudePlugin.source, `Claude plugin ${name}`);
  validateSource(codexPlugin.source, `Codex plugin ${name}`);
  assert(JSON.stringify(claudePlugin.source) === JSON.stringify(codexPlugin.source),
    `${name} must have an identical source pin in both marketplaces`);
  assert(codexPlugin.policy?.installation === 'AVAILABLE',
    `Codex plugin ${name} must have policy.installation AVAILABLE`);
  assert(codexPlugin.policy?.authentication === 'ON_INSTALL',
    `Codex plugin ${name} must have policy.authentication ON_INSTALL`);
  assert(typeof codexPlugin.category === 'string' && codexPlugin.category.trim().length > 0,
    `Codex plugin ${name} must have a nonempty category`);
}

console.log(`Validated ${claudeNames.length} plugin(s) across Claude and Codex catalogs: ${claudeNames.join(', ')}`);
