# MSFT Safety Learning Report

A GitHub Pages-ready simulation safety reporting form for the fictional Mary Seacole Foundation Trust.

This build is intentionally closer to the first safety report form design: a full reporting form with a hero header, reference box, cards, review summary, draft saving, print and JSON export.

The only visual elements brought across from the MSFT Mail simulation are the MSFT red/pink colour palette and the square MSFT logo treatment.

## GitHub Pages setup

Upload this folder to GitHub, then go to:

Settings → Pages → Build and deployment → Deploy from a branch

Choose:

- Branch: `main`
- Folder: `/docs`

The app will run from `docs/index.html`.

## Notes

- No React, no CDN, no npm and no build step.
- The full app is contained in `docs/index.html`, so it should still display even if JavaScript is blocked.
- Drafts save only to the local browser using localStorage.
- This is a simulation/training tool and not connected to a real incident reporting system.
