# doma_na_telezhnoj

Link [https://antonovav.github.io/doma_na_telezhnoj](https://antonovav.github.io/doma_na_telezhnoj/)

Folder `/docs` published with github pages
 
## Requirements

[Node.js](https://nodejs.org) is required to install dependencies and run scripts via `npm`.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install project dependencies |
| `npm run watch` | Build project and open web server running project, watching for changes |
| `npm run dev` | Builds project and open web server, but do not watch for changes |
| `npm run build` | Builds code bundle to `docs` folder with production settings (minification, no source maps, etc..) and copy assets from dist|
| `copy-assets` | Copy assets to `docs/assets` folder from `dist/assets` |

## Configuring Rollup

* Edit the file `rollup.config.dev.js` to edit the development build.
* Edit the file `rollup.config.dist.js` to edit the distribution build.


Project based on https://github.com/photonstorm/phaser3-typescript-project-template
