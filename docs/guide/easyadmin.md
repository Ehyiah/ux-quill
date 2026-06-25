# EasyAdmin Integration

Integration will depend on how you handle assets in your project, AssetMapper or Webpack.

1. Optional first step

**If you already have an entrypoint JavaScript file that you want to re-use in admin then skip this step. And directly go to the AssetMapper or Webpack integration.**

Otherwise: create a quill-admin.js inside the assets directory

```javascript
// start the Stimulus application
import './bootstrap';
```

2. See [AssetMapper](#When-using-AssetMapper) or [Webpack](#When-using-webpack)

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
