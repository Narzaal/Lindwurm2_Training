# Pull Lab — Entraînement M12S

Simulateur d’entraînement aux mécaniques de The Lindwurm (M12S phase 2).

Sources importées depuis [Pull Lab sur Sites](https://clone-zone-m12s.narzaal.chatgpt.site), commit source `e6e44baecc4b66e16875768ae206c5053c13ce90`.

## Structure

- `dist/` : application statique complète, JavaScript, CSS et images. Ce dossier contient les sources exécutées par le navigateur ; aucune compilation n’est nécessaire.
- `tests/` : tests Node.js des mécaniques et de l’interface.
- `TIMING.md` : documentation des mécaniques et des timings.
- `.openai/hosting.json` : configuration du projet Sites d’origine.

## Lancer en local

Depuis la racine du dépôt, avec Python 3 :

```sh
python3 -m http.server 8000 --directory dist
```

Ouvrir <http://localhost:8000> dans un navigateur.

## Vérifier les tests

Avec une version récente de Node.js :

```sh
node --test tests/*.cjs
```

À l’import, sous Node.js 24, 13 fichiers de test passent et 11 échouent avec `ReferenceError: trainerReset is not defined` : leur environnement de test ne charge pas le module d’entraînement. Les sources et les tests d’origine sont conservés sans modification.

## Hébergement

Servir le contenu de `dist/` avec un hébergeur statique. Cet import publie les sources dans le dépôt ; il n’active pas GitHub Pages.

Projet de fan non affilié à Square Enix. FINAL FANTASY XIV © SQUARE ENIX.
