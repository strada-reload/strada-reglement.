# Strada Reload — Site des règlements Node.js

Site noir et violet des règlements Discord et FiveM PvP. Le serveur HTTP et la génération des pages fonctionnent en Node.js, sans dépendance externe. Python n’est plus nécessaire. Les pages statiques restent compatibles avec GitHub Pages.

## Installer sur KataBump

1. Créer un serveur de type **NodeJs**, avec Node.js 20 ou plus récent.
2. Importer puis extraire `strada-reglement-nodejs.zip` dans le gestionnaire de fichiers.
3. Vérifier que **index.js**, **package.json**, les trois fichiers HTML et le dossier **assets** sont directement à la racine du serveur, pas dans un sous-dossier.
4. Dans les paramètres de démarrage, choisir **index.js** comme fichier principal. Si le panneau demande une commande : **npm start**, ou **node index.js**.
5. Le site écoute sur **0.0.0.0** et le port de **PORT**, puis **SERVER_PORT**, sinon **3000**. Utiliser le port réellement attribué dans le panneau de l’hébergeur ; si le port n’est pas injecté automatiquement, définir **PORT** avec cette valeur.
6. Démarrer le serveur. La console affiche `Strada Reload — site démarré sur 0.0.0.0:PORT`.
7. Ouvrir l’adresse publique ou le domaine associé à ce port dans le panneau. La capacité à recevoir du HTTP et l’attribution d’une adresse/d’un domaine dépendent de l’offre KataBump. Le processus Node.js lancé ne garantit pas à lui seul que le site est accessible depuis Internet.

Aucune commande `pip` n’est nécessaire. Aucun paquet npm n’est nécessaire. Si le panneau lance automatiquement `npm install`, il n’installera aucune dépendance applicative.

Le formulaire gratuit montré par l’utilisateur annonce un renouvellement manuel tous les 4 jours. Penser à le renouveler selon les indications du panneau et conserver une copie des fichiers.

## Liens à mettre dans les salons

Une fois l’adresse publique obtenue :

- Salon règlement Discord : `ADRESSE_DU_SITE/discord.html`
- Salon règlement IG : `ADRESSE_DU_SITE/ig.html`

Les chemins courts `/discord` et `/ig` fonctionnent également sur le serveur Node.js.

## Modifier les règles

1. Modifier `content.json` : textes, version et date de mise à jour.
2. Lancer **npm run build** ou **node build.js**.
3. Le générateur met à jour **index.html**, **discord.html** et **ig.html**.

Le générateur valide les identifiants d’articles et échappe les textes. Les modèles de présentation se trouvent dans `templates/`. Les règles proposées sont une base à adapter au fonctionnement du serveur.

## Développement et validation

```sh
npm run build
npm test
npm start
```

Node.js 20+ suffit. Les tests HTTP vérifient les pages, les ressources, les alias, les méthodes HTTP, les en-têtes, la cache et l’absence d’exposition des fichiers serveur. Les recherches, le sommaire et la copie des liens sont gérés côté navigateur. Sur une adresse HTTP non sécurisée, la copie automatique peut être refusée : un champ sélectionnable présente alors le lien.

Le serveur ne sert que les pages, le CSS/JS du navigateur et les ressources publiques de `assets/`. Aucun jeton, mot de passe ou fichier `.env` ne doit être ajouté au dépôt public. Les polices sont accompagnées de leurs notices et de leur licence dans `assets/`.

## GitHub Pages

Les fichiers HTML à la racine restent utilisables avec Pages (**main → /(root)**). Sur Pages, utiliser les URLs finissant par `.html` ; les alias courts sont propres au serveur Node.js. Si le compte GitHub ou le nom du dépôt change, reprendre l’URL indiquée par GitHub dans Settings → Pages.
