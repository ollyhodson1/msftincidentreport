# MSFT Safety Learning Report

A GitHub Pages-ready simulation safety reporting app for **Mary Seacole Foundation Trust**.

This is a fictional training tool. It is not Datix and it is not connected to any live NHS reporting system.

## Deploy to GitHub Pages

Upload this folder to a GitHub repository, then go to:

Settings → Pages → Build and deployment → Deploy from a branch

Use:

- Branch: `main`
- Folder: `/docs`

The app runs from `docs/index.html`.

## Important build note

This version does **not** rely on React, Babel, npm, unpkg, jsdelivr or any other external CDN. It is plain HTML/CSS/JavaScript so it will run directly on GitHub Pages without a build step.

## Files

```text
MSFT_Incident_Report_Working_NoCDN/
├─ README.md
└─ docs/
   ├─ index.html
   ├─ app.js
   ├─ styles.css
   ├─ VERIFY_BUILD.json
   └─ .nojekyll
```

## Simulation guidance

Do not enter real patient identifiable information, real NHS numbers, real incident details or confidential placement information. Use fictional details from the scenario only.
