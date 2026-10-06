import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  base: '/Oregon-State/',
  title: "Oregon State CTF Writeups",
  description: "Challenge Solutions & Walkthroughs",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Solutions', link: '/solutions/2026-2027/beaver-trees' }
    ],

    sidebar: {
      '/solutions/': [
        {
          text: '2026-2027 Solutions',
          collapsed: false,
          items: [
            { text: 'beaver_trees', link: '/solutions/2026-2027/beaver-trees' }
          ]
        }
      ]
    },

    search: {
      provider: 'local'
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
