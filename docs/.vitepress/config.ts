import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Symfony UX Quill",
  description: "Quill JS wysiwyg text editor for Symfony",
  base: '/ux-quill/',
  lastUpdated: true,
  themeConfig: {
    search: {
      provider: 'local'
    },
    editLink: {
      pattern: 'https://github.com/Ehyiah/ux-quill/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/installation' },
      { text: 'GitHub', link: 'https://github.com/Ehyiah/ux-quill' }
    ],

    sidebar: [
      {
        text: 'Guide',
        collapsed: false,
        items: [
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Usage', link: '/guide/usage' },
          {
            text: 'Configuration',
            collapsed: false,
            items: [
              { text: 'Quill Options (Fields)', link: '/guide/configuration/quill-options' },
              { text: 'Extra Options', link: '/guide/configuration/extra-options' },
              { text: 'Image Upload', link: '/guide/configuration/image-upload' }
            ]
          },
          {
            text: 'Modules',
            collapsed: false,
            items: [
              { text: 'Concept', link: '/guide/modules/index' },
              {
                text: 'Independent',
                collapsed: true,
                items: [
                  { text: 'Autosave', link: '/guide/modules/autosave' },
                  { text: 'Counter', link: '/guide/modules/counter' },
                  { text: 'FullScreen', link: '/guide/modules/fullscreen' },
                  { text: 'Image Gallery', link: '/guide/modules/image-gallery' },
                  { text: 'HtmlEdit', link: '/guide/modules/html-edit' },
                  { text: 'Markdown', link: '/guide/modules/markdown' },
                  { text: 'Mention', link: '/guide/modules/mention' },
                  { text: 'NodeMover', link: '/guide/modules/node-mover' },
                  { text: 'Paste Sanitizer', link: '/guide/modules/paste-sanitizer' },
                  { text: 'ReadTime', link: '/guide/modules/read-time' },
                  { text: 'SmartLinks', link: '/guide/modules/smart-links' },
                  { text: 'Speech To Text', link: '/guide/modules/stt' },
                  { text: 'Other Modules', link: '/guide/modules/others' }
                ]
              },
              {
                text: 'Field-dependent',
                collapsed: true,
                items: [
                  { text: 'Divider', link: '/guide/modules/divider' },
                  { text: 'Emoji', link: 'https://github.com/contentco/quill-emoji' },
                  { text: 'Image Selection', link: '/guide/modules/image-selection' },
                  { text: 'Link Attributes', link: '/guide/modules/link-attributes' },
                  { text: 'PageBreak', link: '/guide/modules/pagebreak' },
                  { text: 'Syntax (Highlight)', link: 'https://quilljs.com/docs/modules/syntax/' },
                  { text: 'Table', link: 'https://github.com/attoae/quill-table-better' }
                ]
              },
            ]
          },
          { text: 'Advanced',
            collapsed: false,
            items: [
              { text: 'Index', link: '/guide/advanced/index' },
              { text: 'Custom Fields', link: '/guide/advanced/custom-fields' },
              { text: 'Extend Controller', link: '/guide/advanced/extend-stimulus-controller' },
              { text: 'Events', link: '/guide/advanced/events' },
            ]
          },
          { text: 'EasyAdmin Integration', link: '/guide/easyadmin' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Ehyiah/ux-quill' }
    ]
  }
})
