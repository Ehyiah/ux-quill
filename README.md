# QuillJs Bundle for Symfony using Symfony UX

- add to package.json in your project : 
-
      "dependencies": {
        "@ehyiah/ux-quill" : "file:vendor/ehyiah/ux-quill/src/assets"
      }

- next in controllers.json :
-
      "controllers": {
          "@ehyiah/ux-quill": {
              "quill": {
                  "enabled": true,
                  "fetch": "eager"
              }
          }
      }
then you can use the QuillType to build a QuillJs WYSIWYG

