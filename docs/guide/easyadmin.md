# EasyAdmin Integration

Integration will depend on how you handle assets in your project, AssetMapper, Webpack Encore or Symfony Reprise.

1. Optional first step

**If you already have an entrypoint JavaScript file that you want to re-use in admin then skip this step. And directly go to the AssetMapper, Webpack or Reprise integration.**

Otherwise: create a quill-admin.js inside the assets directory

```javascript
// start the Stimulus application
import './bootstrap';
```

2. See [AssetMapper](#when-using-assetmapper), [Webpack](#when-using-webpack) or [Reprise](#when-using-symfony-reprise-vite--rsbuild)

The built-in `QuillAdminField` detects your toolchain and registers the `quill-admin`
entry accordingly (Symfony Reprise wins over AssetMapper and Webpack Encore).
Reprise support requires EasyAdmin >= 5.3.

## When using AssetMapper

Create a new entry in importmap.php
(the key must be quill-admin as it is the name used in the built-in QuillAdminField, **but you can specify whatever you want as the actual JavaScript file in path**)

```php
'quill-admin' => [
    'path' => './assets/quill-admin.js',
    'entrypoint' => true,
],
```

and it should be done. but read below

WARNING => at the moment there seems to have an issue with easyadmin with the ->addAssetMapperEntries() function
as I can not get it work as it should be.

a quick fix is to add in your **crudControllers**

```php
public function configureAssets(Assets $assets): Assets
{
    $assets->addAssetMapperEntry('quill-admin');

    return parent::configureAssets($assets);
}
```

OR

in your **Dashboard** controller

```php
public function configureAssets(): Assets
{
    $assets = Assets::new();
    $assets->addAssetMapperEntry('quill-admin');

    return $assets;
}
```

## When using webpack

- Create in webpack.config a new entry
(the entry name must be quill-admin as it is the name used in the built-in QuillAdminField, **but you can specify whatever you want as the actual JavaScript file in path**)

```javascript
.addEntry('quill-admin', './assets/quill-admin.js')
```

remember to recompile assets (yarn build/watch or npm equivalent).

## When using Symfony Reprise (Vite / Rsbuild)

- Create a `quill-admin` entry in your Vite or Rsbuild config
(the entry name must be quill-admin as it is the name used in the built-in QuillAdminField, **but you can specify whatever you want as the actual JavaScript file in path**)

```js
// vite.config.ts
import { defineConfig } from 'vite'
import Symfony from '@symfony/reprise/vite'

export default defineConfig({
  input: {
    app: './assets/app.js',
    'quill-admin': './assets/quill-admin.js',
  },
  plugins: [
    Symfony({
      stimulus: './assets/controllers.json',
    }),
  ],
})
```

- If you do not rely on the built-in field detection, register the entry yourself on a
Crud controller or on the dashboard:

```php
public function configureAssets(Assets $assets): Assets
{
    $assets->addRepriseEntry('quill-admin');

    return parent::configureAssets($assets);
}
```

Then rebuild your assets (`vite build`).

## EasyAdmin Field usage

Then you can use the QuillAdminField like this:

```php
QuillAdminField::new('quill')
```

Or add custom options like you would do with the normal type

```php
QuillAdminField::new('quill')
    ->setFormTypeOptions([
        'quill_options' =>
            QuillGroup::build(
                new BoldField(),
                new ItalicField(),
                new HeaderField(HeaderField::HEADER_OPTION_1),
                new HeaderField(HeaderField::HEADER_OPTION_2),
            )
    ])
```
