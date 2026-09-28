# Historique des Chutes de Neige pour 1 site

Application météo mono-fichier (HTML/CSS/JS, sans backend) qui retrace, pour une ville ou une station de ski, les chutes de neige quotidiennes et ce qu'il en reste au sol une fois la fonte prise en compte, à partir des archives climatiques [Open-Meteo](https://open-meteo.com/) (ERA5 / ERA5-Land, gratuites, sans clé API).

Site : https://fef73.github.io/meteo-neige/ — accessible aussi depuis le lanceur [comparateur-meteo.fr](https://comparateur-meteo.fr/).

## Lieu

- Recherche de n'importe quelle ville ou station de ski au monde (géocodage Open-Meteo).
- **Altitude précise** (bouton **⛰ Altitude**), fortement conseillée pour la neige : chutes, températures et fonte sont recalculées pour ce point (station, sommet). La neige tient rarement à l'altitude par défaut d'une ville de vallée.
- **Population** affichée sous le nom du lieu :
  - en France : population de la **commune** et de l'**agglomération** (intercommunalité / EPCI), données INSEE via `geo.api.gouv.fr` ;
  - hors France : population de la ville (Open-Meteo / GeoNames) ;
  - chiffres exacts et sources au survol (ou au toucher sur mobile).

## Période

- 7 jours, 30 jours, 3 mois, 1 an, ou dates personnalisées depuis 1940 (début des archives ERA5).
- Les derniers jours sont consolidés avec environ 5 jours de délai.

## Graphique

- **Neige du jour** (barres, cm) : cumul de neige quotidien (`snowfall_sum`).
- **Neige au sol restante** (barres, cm), après fonte :
  - mesure ERA5-Land de hauteur de neige (`snow_depth`, dernière valeur de la journée) quand elle couvre au moins 80 % de la période ;
  - sinon estimation « degré-jour » : la neige s'accumule avec les chutes et fond de 1,4 cm par °C de température maximale au-dessus de 0 °C, chaque jour.
- Températures maximale et minimale, avec la ligne de référence 0 °C.
- **Isotherme 0 °C** (m) : mesure horaire ERA5 quand disponible, sinon estimation par le gradient standard (0,65 °C / 100 m) ; comparée à l'altitude du lieu (au-dessus de l'isotherme, les précipitations tombent en neige).
- Clic sur la légende pour masquer/afficher une courbe.

## Bulletin de la période

- En-tête avec les dates complètes de la période et son nombre de jours.
- Résumé : cumul de neige (avant fonte), nombre et part de jours neigeux, plus forte chute et sa date, neige au sol en fin de période (mesurée ou estimée), plage de températures.
- Alertes :
  - 🌨️ fortes chutes : jours avec ≥ 20 cm en une journée ;
  - ❄️ gel : jours avec une température minimale ≤ 0 °C ;
  - 🌧️ pluie : jours avec ≥ 1 mm de précipitations sans neige (le manteau neigeux a pu être lessivé) ;
  - ℹ️ aucun jour de neige : invitation à préciser l'altitude d'une station.

## Cartes

- Neige au sol restante en fin de période (et sa source).
- Isotherme 0 °C moyenne, avec le nombre de jours au-dessus / au-dessous de l'altitude du lieu.
- Journée la plus enneigée (température minimale, vent) et journée la plus froide (neige ce jour-là, vent).
- Cumul brut des chutes, jours avec neige (≥ 0,1 cm), neige moyenne par jour neigeux.
- Jauge d'intensité des chutes : de 0 cm au jour le plus enneigé, avec la moyenne par jour neigeux.

## Confort d'usage

- Interface bilingue FR/EN et unité °C/°F (préférences mémorisées) — les hauteurs de neige restent en cm et les altitudes en m.
- Lien de partage qui conserve le lieu, l'altitude et la période.
- Accès direct par URL avec coordonnées GPS, pour un raccourci ou une appli mobile :
  ```
  ?lat=45.2667&lon=6.3167&nom=La Toussuire&alt=1800
  ```
- Position GPS sans nom (appli mobile, raccourci) : la **commune, la région et le pays** sont retrouvés automatiquement par géocodage inverse (Nominatim / OpenStreetMap). Si le service ne répond pas en 4 secondes, « Position GPS » est affiché.
- Depuis le lanceur [comparateur-meteo.fr](https://comparateur-meteo.fr/), le bouton **📍 Ma position** transmet la position du téléphone et le nom choisi.
- Le fonctionnement du site est aussi résumé dans un panneau repliable juste avant le pied de page.

## Cache local et hors connexion

- **Cache des archives** : chaque jour consulté est gardé dans le téléphone (IndexedDB). Les périodes déjà vues s'affichent aussitôt, et seuls les jours manquants sont demandés à Open-Meteo.
  - Ce sont les données brutes de chaque jour qui sont gardées (chutes, températures, hauteur de neige, isotherme) : la neige restante au sol est recalculée à chaque affichage, donc toujours juste quelle que soit la période.
  - Un enregistrement par lieu (coordonnées) et par altitude.
  - Les 8 derniers jours ne sont jamais mis en cache, car ERA5 les consolide encore.
  - Le nombre de jours lus dans le cache est indiqué à côté de l'heure de mise à jour (« 💾 27 j en cache »).
- **⬇ Enregistrer / ⬆ Restaurer** (bas de page) : sauvegarde du cache dans un fichier `meteo-cache-AAAA-MM-JJ.json`, puis restauration sur le même appareil ou un autre. Un seul fichier couvre l'historique ville et l'historique neige, qui partagent la même base.
- **Vider le cache** : n'efface que les données de ce site.
- **Hors connexion** : après une première visite, la page s'ouvre sans réseau (service worker `sw.js`). Les jours en cache s'affichent, avec « 📴 hors connexion — N jour(s) récent(s) indisponible(s) ».

## Sources de données

- Archives climatiques (chutes de neige, précipitations, températures, hauteur de neige, isotherme 0 °C, vent) : `archive-api.open-meteo.com` (ERA5 / ERA5-Land)
- Géocodage : `geocoding-api.open-meteo.com`
- Population (France) : `geo.api.gouv.fr` (INSEE)
- Géocodage inverse (position GPS → commune) : `nominatim.openstreetmap.org`

## Notes techniques

- Fichier unique, aucune dépendance serveur — Chart.js chargé depuis un CDN pour le graphique.
- `sw.js` : service worker (page, Chart.js et polices gardés sur l'appareil pour l'usage hors connexion).
- Statistiques de visite anonymes et sans cookie avec GoatCounter.

## Contact

Un bug, une idée, une question ? Le lien **✉️ Contact / suggestion** en bas de chaque page ouvre un court formulaire, sans compte à créer : https://forms.gle/EMZtxMBJCUE6HJXp8

## Licence

© 2026 Fernand (fef73) — tous droits réservés. Voir le fichier [LICENSE](LICENSE). Les données météo restent soumises aux licences de leurs fournisseurs (Open-Meteo CC BY 4.0, INSEE / Etalab, OpenStreetMap ODbL).
