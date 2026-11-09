# Strada Reload — Règlements

Site public des règlements Discord et FiveM PvP de Strada Reload. Ce dépôt ne contient que le site statique, ses textes, son logo et ses polices.

## Activation gratuite

Ouvrir https://github.com/dreamwars12/strada-reglement./settings/pages puis choisir :

- Source : **Deploy from a branch**
- Branch : **main**
- Folder : **/(root)**

Cliquer **Save** et attendre la fin du déploiement GitHub Pages.

Une fois le site déployé :

- Accueil : https://dreamwars12.github.io/strada-reglement./
- Règlement Discord : https://dreamwars12.github.io/strada-reglement./discord.html
- Règlement IG : https://dreamwars12.github.io/strada-reglement./ig.html

## Modifier les textes

Modifier `content.json`, puis lancer `python3 build_site.py` et envoyer les fichiers HTML générés dans le dépôt. Les règles proposées sont une base à adapter au fonctionnement du serveur. Le site est statique : aucun identifiant ni secret ne doit être ajouté aux fichiers publics.

## Vérification locale

`python3 -m http.server 8090 --bind 127.0.0.1`

Polices Open Sans incluses avec leurs notices et licence dans `assets/`.
