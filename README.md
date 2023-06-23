# QuillJs Bundle for Symfony using Symfony UX

- add to package.json in your project : 
-
      "dependencies": {
        "@ehyiah/symfony-quill-js" : "file:vendor/ehyiah/symfony-quill-js/src/assets"
      }

- next in controllers.json :
-
      "@ehyiah/symfony-quill-js": {
          "quilljs": {
              "enabled": true,
              "fetch": "eager"
          }
      }

then you can use the QuillType to build a QuillJs WYSIWYG

