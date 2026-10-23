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

Install the JavaScript package:

```bash
npm install @ehyiah/ux-quill
```

The stylesheets auto-imported by the bundle's Stimulus controller
(`quill/dist/quill.snow.css`, `quill-table-better/dist/quill-table-better.css`,
`quill2-emoji/dist/style.css`, `highlight.js/styles/atom-one-dark.css`,
`katex/dist/katex.min.css`…) are resolved from your project root, so install
their packages too if they are not already (required with pnpm, recommended with npm):

```bash
npm install quill quill-table-better quill2-emoji highlight.js katex
```

Declare the bundle controllers in `assets/controllers.json`:

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

Then rebuild your assets (`npm run dev`, `npm run watch` or `npm run build`).

## Symfony Reprise (Vite / Rsbuild)

[Symfony Reprise](https://symfony.com/bundles/reprise) is Webpack Encore's
successor for Vite and Rsbuild. The bundle supports it the same way it supports
Encore: controllers are declared in `assets/controllers.json` and resolved from
`node_modules`.

Install the PHP side and the JavaScript side:

```bash
composer require symfony/reprise
npm install --save-dev @symfony/reprise
npm install @ehyiah/ux-quill quill quill-table-better quill2-emoji highlight.js katex
```

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

Start the Stimulus application from your entry, and declare the bundle
controllers in `assets/controllers.json` (same block as in the Encore section above):

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
