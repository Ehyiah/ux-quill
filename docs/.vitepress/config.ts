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
              { text: 'Quill Options', link: '/guide/configuration/quill-options' },
              { text: 'Extra Options', link: '/guide/configuration/extra-options' },
              { text: 'Image Upload', link: '/guide/configuration/image-upload' }
            ]
          },
          {
            text: 'Modules',
            collapsed: true,
            items: [
              { text: 'Concept', link: '/guide/modules/index' },
              { text: 'ReadTimeModule', link: '/guide/modules/read-time' },
              { text: 'STTModule', link: '/guide/modules/stt' },
              { text: 'FullScreenModule', link: '/guide/modules/fullscreen' },
              { text: 'Gallery', link: '/guide/modules/gallery' },
              { text: 'Other Modules', link: '/guide/modules/others' }
            ]
          },
          { text: 'Advanced',
            collapsed: false,
            items: [
              { text: 'Index', link: '/guide/advanced/index' },
              { text: 'Extend Controller', link: '/guide/advanced/extend-stimulus-controller' },
              { text: 'Events', link: '/guide/advanced/events' },
            ]
          },
          { text: 'EasyAdmin', link: '/guide/easyadmin' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Ehyiah/ux-quill' }
    ]
  }
})
