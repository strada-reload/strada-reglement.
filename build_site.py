#!/usr/bin/env python3
"""Generate static regulation pages from content.json; no third-party dependencies."""
import json
from pathlib import Path
from html import escape
ROOT=Path(__file__).resolve().parent
DATA=json.loads((ROOT/'content.json').read_text())
e=lambda value:escape(str(value),quote=True)
ICONS={
 'arrow':'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 'copy':'<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4H4v12h4"/>',
 'search':'<circle cx="10" cy="10" r="6"/><path d="m15 15 5 5"/>',
 'shield':'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zM8 12l3 3 5-6"/>',
 'target':'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v5m0 12v5M1 12h5m12 0h5"/>',
 'menu':'<path d="M4 6h16M4 12h16M4 18h16"/>'}
def icon(name):return '<svg viewBox="0 0 24 24" aria-hidden="true">'+ICONS[name]+'</svg>'
def head(title,description):
 return f'''<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#0c0a11"><title>{e(title)} · Strada Reload</title><meta name="description" content="{e(description)}"><link rel="icon" href="assets/logo.png"><link rel="stylesheet" href="style.css"><script src="app.js" defer></script></head><body><a class="skip" href="#main">Aller au contenu</a><div id="readingProgress" aria-hidden="true"></div>'''
def header(active=''):
 links=''.join(f'<a href="{key}.html"'+(' aria-current="page"' if key==active else '')+f'>{label}</a>' for key,label in [('discord','Règlement Discord'),('ig','Règlement IG')])
 return f'''<header class="site-header"><a class="brand" href="index.html" aria-label="Strada Reload, accueil"><img src="assets/logo.png" width="44" height="44" alt=""><span>STRADA<small>RELOAD</small></span></a><button class="mobile-menu" id="menuToggle" aria-label="Afficher la navigation" aria-expanded="false" aria-controls="headerNav">{icon('menu')}</button><nav id="headerNav" aria-label="Navigation principale">{links}</nav><span class="header-tag">COMMUNAUTÉ / PVP</span></header>'''
def footer():
 return f'''<footer class="site-footer"><a class="footer-brand" href="index.html">STRADA <span>RELOAD</span></a><span>Hydro &amp; Tayzord</span><span>Règlements · Version {e(DATA['version'])}</span></footer><div id="notice" role="status" aria-live="polite"></div><dialog id="copyDialog"><form method="dialog"><h2>Copier ce lien</h2><p>La copie automatique est indisponible. Sélectionne le lien ci-dessous.</p><input id="copyValue" aria-label="Lien à copier" readonly><button class="button primary">Fermer</button></form></dialog></body></html>'''
def card(key,label,description,number,symbol):
 count=sum(len(group['rules']) for group in DATA[key]['groups'])
 return f'''<a class="choice-card {key}" href="{key}.html"><div class="card-top"><span class="choice-icon">{icon(symbol)}</span><span class="card-number">{number}</span></div><small>{count} ARTICLES / {len(DATA[key]['groups'])} THÈMES</small><h2>{label}</h2><p>{description}</p><span class="card-link">Lire le règlement {icon('arrow')}</span></a>'''
index=head('Les règlements','Les règlements Discord et FiveM PvP de Strada Reload.')+header()+f'''<main id="main" class="home"><section class="home-hero"><div class="eyebrow"><span></span> STRADA RELOAD / RÈGLEMENTS</div><h1>LA MÊME VILLE.<br><em>LES MÊMES RÈGLES.</em></h1><p>Sur Discord comme en jeu, on partage le même terrain.<br>Prends quelques minutes pour connaître les règles.</p><div class="hero-meta"><span class="mini-line"></span> DEUX ESPACES. UNE COMMUNAUTÉ.</div><div class="hero-art" aria-hidden="true"><img src="assets/logo.png" alt=""><span>STRADA / RELOAD</span></div></section><section class="choices" aria-label="Choisir un règlement">'''+card('discord','Sur Discord.','Discussions, vocaux, respect des membres et demandes au staff.','01','shield')+card('ig','En jeu.','Les règles du PvP : intégrité, combat, zones protégées et fair-play.','02','target')+'''</section><section class="home-note"><span class="note-index">À SAVOIR</span><p>Strada Reload est en développement. Les règles pourront évoluer avec le serveur. En cas de doute, pose ta question au staff dans un ticket Discord.</p></section></main>'''+footer()
(ROOT/'index.html').write_text(index)
for key in ['discord','ig']:
 page=DATA[key];groups=page['groups'];count=sum(len(g['rules']) for g in groups)
 ids=[rule['id'] for group in groups for rule in group['rules']]
 assert len(ids)==len(set(ids)),f'Duplicate article id in {key}'
 sidebar=''.join(f'<a href="#{e(g["id"])}"><span>{i:02d}</span>{e(g["title"])}</a>' for i,g in enumerate(groups,1))
 articles=[];number=0
 for group_index,group in enumerate(groups,1):
  rules=[]
  for rule in group['rules']:
   number+=1
   rules.append(f'''<article class="rule" id="{e(rule['id'])}" data-rule><span class="rule-index">{number:02d}</span><div class="rule-body"><h3>{e(rule['title'])}</h3><p>{e(rule['text'])}</p></div><button class="permalink" data-copy="#{e(rule['id'])}" aria-label="Copier le lien de l’article : {e(rule['title'])}">{icon('copy')}</button></article>''')
  articles.append(f'''<section class="rule-group" id="{e(group['id'])}" data-group><div class="group-heading"><span>{group_index:02d}</span><div><h2>{e(group['title'])}</h2><p>{e(group['summary'])}</p></div></div>{''.join(rules)}</section>''')
 html=head(page['title'],page['subtitle'])+header(key)+f'''<main id="main" class="document"><section class="document-hero"><a class="back-link" href="index.html">← Tous les règlements</a><div class="eyebrow">STRADA RELOAD / {'COMMUNAUTÉ' if key=='discord' else 'FIVEM PVP'}</div><div class="title-row"><h1>{e(page['title'])}<span>.</span></h1><button class="button copy-page" data-copy="page">{icon('copy')} Copier le lien</button></div><p class="document-intro">{e(page['subtitle'])}</p><div class="document-meta"><span>{count} articles</span><span>Version {e(DATA['version'])}</span><span>Mis à jour le {e(DATA['updated'])}</span></div></section><div class="document-layout"><aside class="toc"><span class="toc-label">DANS CE RÈGLEMENT</span><nav aria-label="Sommaire">{sidebar}</nav><div class="toc-note">Une question ?<p>Ouvre un ticket sur le Discord de Strada Reload.</p></div><a class="other-rules" href="{'ig' if key=='discord' else 'discord'}.html">{'Le règlement en jeu' if key=='discord' else 'Le règlement Discord'} {icon('arrow')}</a></aside><div class="rules-content"><div class="search-tools" hidden><label class="search-box">{icon('search')}<span class="sr-only">Rechercher dans le règlement</span><input id="search" type="search" placeholder="Rechercher une règle…" autocomplete="off"><kbd>/</kbd></label><p id="searchCount" role="status" aria-live="polite">{count} articles</p></div><p id="noResults" hidden>Aucun article ne correspond à ta recherche. Essaie un autre mot.</p>{''.join(articles)}<div class="end-note"><span>LE MÊME CADRE POUR TOUS</span><p>Le staff examine les situations selon les faits, leur gravité et le contexte. Une contestation se fait dans un ticket.</p><a href="#main">Revenir en haut ↑</a></div></div></div></main>'''+footer()
 (ROOT/f'{key}.html').write_text(html)
print('Generated index.html, discord.html and ig.html.')
