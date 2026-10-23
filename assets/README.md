# @ehyiah/ux-quill

JavaScript assets only of the [ehyiah/ux-quill symfony bundle](https://github.com/Ehyiah/ux-quill).

It must be installed in your application when you bundle your assets with
Webpack Encore or Symfony Reprise (Vite / Rsbuild), so the controllers declared
in `assets/controllers.json` can be resolved from `node_modules`:

```bash
npm install @ehyiah/ux-quill
```

Not needed with AssetMapper: the Symfony bundle serves its assets itself.
