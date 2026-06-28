import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  title: "Symfony UX Quill",
  description: "Quill JS wysiwyg text editor for Symfony",
  base: '/ux-quill/',
  lastUpdated: true,
  vite: {
    resolve: {
      dedupe: ['quill'],
      alias: {
        '@wllama/wllama': path.resolve(__dirname, '../node_modules/@wllama/wllama/esm/index.js'),
      },
    },
  },
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
          { text: 'Playground', link: '/guide/playground' },
          {
            text: 'Configuration',
            collapsed: false,
            items: [
              { text: 'Quill Options', link: '/guide/configuration/quill-options' },
              { text: 'Extra Options', link: '/guide/configuration/extra-options' },
              { text: 'Image Upload', link: '/guide/configuration/image-upload' }
            ]
          },
          {
            text: 'Fields',
            collapsed: false,
            items: [
              { text: 'Concept', link: '/guide/fields/index' },
              { text: 'Code Block', link: '/guide/fields/code-block' },
              { text: 'Colors & Fonts', link: '/guide/fields/colors-fonts' },
              { text: 'Divider', link: '/guide/fields/divider' },
              { text: 'Emoji', link: '/guide/fields/emoji' },
              { text: 'Headers', link: '/guide/fields/headers' },
              { text: 'Image', link: '/guide/fields/image' },
              { text: 'Image Gallery', link: '/guide/fields/image-gallery' },
              { text: 'Link', link: '/guide/fields/link' },
              { text: 'Lists & Alignment', link: '/guide/fields/lists-alignment' },
              { text: 'Media', link: '/guide/fields/media' },
              { text: 'Page Break', link: '/guide/fields/pagebreak' },
              { text: 'Table', link: '/guide/fields/table' },
              { text: 'Text Formatting', link: '/guide/fields/text-formatting' },
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
                  { text: 'History', link: '/guide/modules/history' },
                  { text: 'HtmlEdit', link: '/guide/modules/html-edit' },
                  { text: 'Markdown', link: '/guide/modules/markdown' },
                  { text: 'Mention', link: '/guide/modules/mention' },
                  { text: 'NodeMover', link: '/guide/modules/node-mover' },
                  { text: 'Inline Toolbar', link: '/guide/modules/inline-toolbar' },
                  { text: 'Slash Module', link: '/guide/modules/slash-module' },
                  { text: 'Paste Sanitizer', link: '/guide/modules/paste-sanitizer' },
                  { text: 'Placeholder', link: '/guide/modules/placeholder' },
                  { text: 'ReadTime', link: '/guide/modules/read-time' },
                  { text: 'SmartLinks', link: '/guide/modules/smart-links' },
                  { text: 'Grid Borders', link: '/guide/modules/grid-borders' },
                  { text: 'Speech To Text', link: '/guide/modules/stt' },
                  { text: 'AI Assistant', link: '/guide/modules/ai-assistant' },
                  { text: 'Other Modules', link: '/guide/modules/others' }
                ]
              },
              {
                text: 'Field-dependent',
                collapsed: true,
                items: [
                  { text: 'Emoji', link: '/guide/modules/emoji' },
                  { text: 'Image Selection', link: '/guide/modules/image-selection' },
                  { text: 'Image Gallery', link: '/guide/modules/image-gallery' },
                  { text: 'Link Attributes', link: '/guide/modules/link-attributes' },
                  { text: 'PageBreak', link: '/guide/modules/pagebreak' },
                  { text: 'Resize', link: '/guide/modules/resize' },
                  { text: 'Syntax (Highlight)', link: '/guide/modules/syntax' },
                  { text: 'Table', link: '/guide/modules/table' },
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
