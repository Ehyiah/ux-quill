# Installation

## Step 1: Require Bundle

```bash
composer require ehyiah/ux-quill
```

If you are using the AssetMapper Component, you're done!

## Step 2: Install JavaScript Dependencies (with webpack encore)

If you are using Webpack Encore (not needed with AssetMapper):

```bash
yarn install --force
yarn watch
```

OR

```bash
npm install --force
npm run watch
```

It's done, you can use the `QuillType` to build a QuillJs WYSIWYG.
You can add as many WYSIWYG fields inside the same page as any normal fields.
