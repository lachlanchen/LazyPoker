[English](../README.md) · [العربية](README.ar.md) · [Español](README.es.md) · [Français](README.fr.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [Tiếng Việt](README.vi.md) · [中文 (简体)](README.zh-Hans.md) · [中文（繁體）](README.zh-Hant.md) · [Deutsch](README.de.md) · [Русский](README.ru.md)

[![LazyingArt banner](https://github.com/lachlanchen/lachlanchen/raw/main/figs/banner.png)](https://github.com/lachlanchen/lachlanchen/blob/main/figs/banner.png)

# LazyPoker · Open Table

*Examinez les choix autorisés et leurs preuves, puis confirmez exactement une action.*

[![Lazying Art](https://img.shields.io/badge/Lazying-Art-0EA5E9?style=flat-square)](https://lazying.art) [![App screenshot](https://img.shields.io/badge/App-screenshot-173F5F?style=flat-square)](../docs/images/app.png) [![GitHub Sponsors](https://img.shields.io/badge/GitHub-Sponsors-EA4AAA?style=flat-square&logo=githubsponsors)](https://github.com/sponsors/lachlanchen)

LazyPoker est un professeur de décision local pour une main complète de Texas Hold’em en heads-up et des tables d'initiation clairement limitées de Contract Bridge et de Guandan. Le code déterministe gère les règles, le masquage des informations, le score, l'historique et la persistance.

## Soutenir les outils pédagogiques ouverts

| Donate | PayPal | Stripe |
| --- | --- | --- |
| [![Donate](https://img.shields.io/badge/Donate-LazyingArt-0EA5E9?style=for-the-badge&logo=kofi&logoColor=white)](https://chat.lazying.art/donate) | [![PayPal](https://img.shields.io/badge/PayPal-RongzhouChen-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/RongzhouChen) | [![Stripe](https://img.shields.io/badge/Stripe-Donate-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://buy.stripe.com/aFadR8gIaflgfQV6T4fw400) |

## Aperçu de l'application

[![Capture d'écran de l'application](../docs/images/app.png)](../docs/images/app.png)

La table d'apprentissage sépare clairement les choix autorisés, les aperçus sans modification d'état et les preuves exactes, calculées et rédigées.

## Qu'est-ce qui est jouable

- Texas Hold’em : une main complète en heads-up no-limit avec blinds, quatre tours de mise, all-in, fold, évaluation au showdown et règlement du pot.
- Contract Bridge : une table d'initiation de cinq plis pour travailler la fourniture à la couleur, le pique atout fixe, le gagnant du pli et la coordination du partenariat ; les enchères, le mort, les contrats et la marque en duplicate ne sont pas inclus.
- Guandan : une table d'initiation à six cartes, limitée aux cartes seules, pour travailler l'initiative, les passes et la coordination avec le partenaire ; les combinaisons, bombes, hommages, jokers de niveau et scores de promotion ne sont pas inclus.
- Tous les modes suivent la même boucle : examiner une option légale produite par le moteur de règles déterministe, prévisualiser sans modifier l'état, puis confirmer explicitement.

## Carte du référentiel

| Chemin | But |
| --- | --- |
| [`src/core/`](../src/core/) | Cartes, règles, candidats autorisés, transitions d'état, masquage des informations, évaluation et persistance déterministes. |
| [`src/i18n/catalogs.ts`](../src/i18n/catalogs.ts) | Onze catalogues complets destinés aux apprenants avec des clés stables et des espaces réservés. |
| [`src/App.tsx`](../src/App.tsx) | Le tableau multilingue partagé, l’aperçu, la confirmation, l’historique et l’interface de méthode. |
| [`docs/model-options.md`](../docs/model-options.md) | Choix facultatifs de solveur et de modèle avec leurs limites de preuve et de sécurité. |
| [`docs/smoke-test.md`](../docs/smoke-test.md) | Étapes de révision du navigateur répétables. |
| [`docs/images/app.png`](../docs/images/app.png) | Capture d'écran de l'application actuelle. |

## Démarrage rapide

Nécessite Node.js `^20.19.0` ou `>=22.12.0`, ainsi que npm.

```bash
npm ci
npm run dev
```

<http://127.0.0.1:8020/>

Ouvrez l'URL de bouclage imprimée par Vite. Le port de développement configuré est 8020 et le mode de port strict échoue si ce port est occupé.

## Autorité, confidentialité et preuves

- Les vues publiques masquent avant le rendu l'ordre des paquets, les graines, le journal des requêtes, les cartes adverses, celles du partenaire et l'analyse privée.
- Les identifiants opaques lient l'état autoritatif complet, l'acteur et l'action canonique ; tout choix périmé ou inconnu est refusé de manière sûre.
- L'aperçu est hypothétique et ne révèle jamais une future carte commune. Seule la confirmation modifie l'état.
- Les règles exactes, les échantillons calculés et la stratégie rédigée restent étiquetés séparément. L'équité du Hold'em suppose une distribution uniforme des cartes autorisées non vues ; elle ne lit pas la range adverse et n'est pas présentée comme GTO.

## Vérification

```bash
npm run lint
npm test
npm run build
npm run audit
bash -n scripts/*.sh
bash scripts/test-model-safety.sh
git diff --check
```

Les tests couvrent la donne déterministe, l'unicité des cartes, le score et la conservation des jetons, le refus des candidats périmés, le masquage des vues, les changements idempotents, les conflits de persistance, les aperçus sans changement d'état, le port fixe et la parité stricte des clés et espaces réservés dans 11 langues.

## Citation

Si vous utilisez LazyPoker dans l'enseignement ou la recherche, citez le référentiel. GitHub lit [CITATION.cff](../CITATION.cff) et affiche un panneau Citer ce référentiel.

```bibtex
@software{chen_lazy_poker_2026,
  author  = {Chen, Lachlan},
  title   = {LazyPoker: Hold'em, Contract Bridge, and Guandan Decision Teacher},
  year    = {2026},
  version = {0.1.0},
  url     = {https://github.com/lachlanchen/LazyPoker}
}
```

## Statut

Le mode Texas Hold’em propose une main heads-up complète. Bridge et Guandan restent clairement étiquetés comme des modules pédagogiques pour débutants, et non comme des implémentations compétitives complètes. Les modèles facultatifs sont désactivés par défaut.
