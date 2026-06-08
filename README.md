# MSFT Safety Learning Report

A GitHub Pages-ready React simulation reporting form for the fictional **Mary Seacole Foundation Trust**.

This build is designed to visually match the existing MSFT Mail simulation app. It uses the same rose/pink colour palette, heavy black borders, rounded panels and simulated desktop/taskbar style.

The live site files are inside the `/docs` folder so it can be published using GitHub Pages without any build step.

## How to upload to GitHub

1. Create a new GitHub repository.
2. Upload the full contents of this folder, including the `docs` folder.
3. In GitHub, go to **Settings > Pages**.
4. Under **Build and deployment**, set:
   - Source: **Deploy from a branch**
   - Branch: **main**
   - Folder: **/docs**
5. Save.
6. Open the GitHub Pages URL once GitHub finishes publishing.

## What is included

- `/docs/index.html` - the live page for GitHub Pages
- `/docs/styles.css` - MSFT-style app styling
- `/docs/app.jsx` - React form logic
- `/docs/.nojekyll` - prevents GitHub Pages from processing the folder with Jekyll

## Simulation notes

This is a training/simulation tool only. It includes a visible simulation banner and optional fields for scenario name, station/part, learner/group and facilitator notes.

It saves drafts in the browser only using localStorage and exports JSON files locally. For a real reporting system, connect the submit action to a secure backend/database and apply appropriate information governance, data protection, access control and retention arrangements.
