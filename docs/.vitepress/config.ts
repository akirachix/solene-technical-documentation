import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/solene-technical-documentation/',
  title: 'Canopy',
  description: 'Technical documentation for Canopy',
  cleanUrls: true,
  lastUpdated: true,
  appearance: false,
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: '/solene-technical-documentation/canopy-favicon.png',
      },
    ],
  ],
  themeConfig: {
    siteTitle: false,
    logo: '/canopy-icon.png',
    nav: [
      { text: 'Overview', link: '/overview' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Backend', link: '/backend' },
      { text: 'Frontend', link: '/frontend-web' },
      { text: 'Security', link: '/security' },
      { text: 'Deployment', link: '/deployment' },
      { text: 'Design', link: '/design-guidelines' },
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Overview', link: '/overview' },
        ],
      },
      {
        text: 'Client Applications',
        items: [
          { text: 'Architecture', link: '/architecture' },
          { text: 'Backend / API', link: '/backend' },
          { text: 'Mobile App', link: '/frontend-mobile' },
          { text: 'Web App', link: '/frontend-web' },
        ],
      },
      {
        text: 'Operations',
        items: [
          { text: 'Security', link: '/security' },
          { text: 'AI Module', link: '/ai' },
          { text: 'Deployment', link: '/deployment' },
        ],
      },
      {
        text: 'Design',
        items: [{ text: 'Design & Guidelines', link: '/design-guidelines' }],
      },
      {
        text: 'Guides',
        items: [
          { text: 'Developer Guide', link: '/developer-guide' },
          { text: 'Documentation Guide', link: '/docs-guide' },
        ],
      },
    ],
    search: { provider: 'local' },
    outline: { level: [2, 3] },
  },
})
