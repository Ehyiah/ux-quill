import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Symfony UX Quill",
  description: "Quill JS wysiwyg text editor for Symfony",
  themeConfig: {
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
          { text: 'Basic Usage', link: '/guide/usage' },
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
            collapsed: false,
            items: [
              { text: 'PHP Configurable', link: '/guide/modules/index' },
              { text: 'ReadTimeModule', link: '/guide/modules/read-time' },
              { text: 'STTModule', link: '/guide/modules/stt' },
              { text: 'Other Modules', link: '/guide/modules/others' }
            ]
          },
          { text: 'Advanced', link: '/guide/advanced' },
        ]
      },
      { text: 'EasyAdmin', link: '/guide/easyadmin' }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Ehyiah/ux-quill' }
    ]
  }
})
