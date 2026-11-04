# Installation

## Step 1: Require the bundle

```bash
composer require ehyiah/ux-quill
```

Then follow the section matching the way your application handles assets:
**AssetMapper**, **Webpack Encore**, or **Symfony Reprise** (Vite / Rsbuild).

## AssetMapper

If you are using the AssetMapper Component, you're done! The bundle exposes its
stylesheets and its Stimulus controllers to AssetMapper.

## Webpack Encore

Symfony Flex adds the bundle assets as a `file:` dependency in your `package.json`
(`file:vendor/ehyiah/ux-quill/assets`), registers its Stimulus controllers in
`assets/controllers.json` and adds the JavaScript packages required by the bundle
(its `peerDependencies`) when you run `composer require`.

Run the usual install, then rebuild:

```bash
npm install   # or yarn install
npm run dev   # or npm run watch / npm run build
```

If Flex did not update `assets/controllers.json` (for example when no `package.json`
existed yet), declare the controllers manually:

```json
{
    "controllers": {
        "@ehyiah/ux-quill": {
            "quill": { "enabled": true, "fetch": "eager" },
            "quill-maps": { "enabled": true, "fetch": "eager" }
        }
    }
}
```

## Symfony Reprise (Vite / Rsbuild)

[Symfony Reprise](https://symfony.com/bundles/reprise) is Webpack Encore's
successor for Vite and Rsbuild. The bundle supports it the same way it supports
Encore: controllers are declared in `assets/controllers.json` (Flex fills it
automatically) and resolved from `node_modules`.

Install the PHP side and the JavaScript side:

```bash
composer require symfony/reprise
npm install --save-dev @symfony/reprise
```

Flex already linked the bundle assets and added the required JavaScript packages
to your `package.json`.

Enable the Stimulus integration by pointing the plugin at your `controllers.json`:

```js
// vite.config.ts
import { defineConfig } from 'vite'
import Symfony from '@symfony/reprise/vite'

export default defineConfig({
  input: {
    app: './assets/app.js',
  },
  plugins: [
    Symfony({
      stimulus: './assets/controllers.json',
    }),
  ],
})
```

```js
// rsbuild.config.ts
import { defineConfig } from '@rsbuild/core'
import Symfony from '@symfony/reprise/rsbuild'

export default defineConfig({
  source: {
    entry: {
      app: './assets/app.js',
    },
  },
  plugins: [
    Symfony({
      stimulus: './assets/controllers.json',
    }),
  ],
})
```

::: tip
If Composer installed the bundle through a symlinked `path` repository
(`"symlink": true`, common when developing the bundle locally), Vite resolves the
real path of `vendor/ehyiah/ux-quill`, outside your project. The bundle's
dependencies (`@hotwired/stimulus`, `quill`, …) are then not found in your
`node_modules`: either set `resolve: { preserveSymlinks: true }` in `vite.config.ts`,
or install the repository with `"symlink": false`.
:::

Start the Stimulus application from your entry:

```js
// assets/app.js
import { startStimulusApp } from '@symfony/reprise/stimulus'

startStimulusApp()
```

In your layout, render the `reprise_entry_*` tags instead of the `encore_entry_*` ones:

```twig
{{ reprise_entry_link_tags('app') }}
{{ reprise_entry_script_tags('app') }}
```

::: warning
Without AssetMapper, `quill_content_styles()` has no importmap to resolve and
renders nothing: import the display stylesheets from your own entry instead, see
[Usage → Loading the required CSS](./usage.md#loading-the-required-css).
:::

Run your bundler (`npm run dev`), and rebuild for production with `npm run build`.

## Using the field

It's done, you can use the `QuillType` to build a QuillJs WYSIWYG.
You can add as many WYSIWYG fields inside the same page as any normal fields.
