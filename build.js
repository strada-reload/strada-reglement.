'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = __dirname;
const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const copyIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/></svg>';
function render(template, values) {
  return template.replace(/\{\{([A-Z_]+)\}\}/g, (_, key) => {
    if (!Object.hasOwn(values, key)) throw new Error(`Variable de modèle absente : ${key}`);
    return values[key];
  });
}
function validate(data) {
  if (typeof data.version !== 'string' || typeof data.updated !== 'string') throw new Error('version et updated doivent être des textes.');
  for (const key of ['discord', 'ig']) {
    const page = data[key];
    if (!page || typeof page.title !== 'string' || typeof page.subtitle !== 'string' || !Array.isArray(page.groups)) throw new Error(`Page invalide : ${key}`);
    const ids = new Set(['main','readingProgress','menuToggle','headerNav','notice','copyDialog','copyValue','search','searchCount','noResults']);
    for (const group of page.groups) {
      if (typeof group.title !== 'string' || typeof group.summary !== 'string' || !Array.isArray(group.rules)) throw new Error(`Groupe invalide : ${key}`);
      for (const entry of [group, ...group.rules]) {
        if (typeof entry.id !== 'string' || !/^[a-z][a-z0-9-]*$/.test(entry.id) || ids.has(entry.id)) throw new Error(`Identifiant invalide ou en double : ${entry.id}`);
        ids.add(entry.id);
      }
      for (const rule of group.rules) if (typeof rule.title !== 'string' || typeof rule.text !== 'string') throw new Error(`Article invalide : ${rule.id}`);
    }
  }
}
function build() {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'content.json'), 'utf8'));
  validate(data);
  const shared = { VERSION:escape(data.version), UPDATED:escape(data.updated) };
  const outputs = new Map();
  for (const key of ['discord', 'ig']) {
    const page = data[key];
    const count = page.groups.reduce((sum, group) => sum + group.rules.length, 0);
    shared[`${key.toUpperCase()}_COUNT`] = String(count);
    shared[`${key.toUpperCase()}_GROUPS`] = String(page.groups.length);
    const toc = page.groups.map((group, index) => `<a href="#${escape(group.id)}"><span>${String(index+1).padStart(2,'0')}</span>${escape(group.title)}</a>`).join('');
    let number = 0;
    const groups = page.groups.map((group, index) => {
      const rules = group.rules.map(rule => {
        number++;
        return `<article class="rule" id="${escape(rule.id)}" data-rule><span class="rule-index">${String(number).padStart(2,'0')}</span><div class="rule-body"><h3>${escape(rule.title)}</h3><p>${escape(rule.text)}</p></div><button class="permalink" data-copy="#${escape(rule.id)}" aria-label="Copier le lien de l’article : ${escape(rule.title)}">${copyIcon}</button></article>`;
      }).join('');
      return `<section class="rule-group" id="${escape(group.id)}" data-group><div class="group-heading"><span>${String(index+1).padStart(2,'0')}</span><div><h2>${escape(group.title)}</h2><p>${escape(group.summary)}</p></div></div>${rules}</section>`;
    }).join('');
    const template = fs.readFileSync(path.join(ROOT, 'templates', `${key}.html`), 'utf8');
    outputs.set(`${key}.html`, render(template, {...shared, TITLE:escape(page.title), SUBTITLE:escape(page.subtitle), COUNT:String(count), TOC:toc, GROUPS:groups}));
  }
  outputs.set('index.html', render(fs.readFileSync(path.join(ROOT, 'templates', 'index.html'), 'utf8'), shared));
  for (const [name, html] of outputs) fs.writeFileSync(path.join(ROOT, name), html);
  console.log('Pages générées : index.html, discord.html et ig.html.');
}
if (require.main === module) build();
module.exports = { build, validate, render };
