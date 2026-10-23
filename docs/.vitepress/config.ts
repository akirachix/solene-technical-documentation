import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Canopy",
  description: "Technical documentation for Canopy",
  cleanUrls: true,
  lastUpdated: true,
  appearance: false,
  head: [["link", { rel: "icon", href: "/canopy-favicon.png" }]],
  themeConfig: {
    siteTitle: false,
    logo: "/canopy-icon.png",
    nav: [
      { text: "Overview", link: "/overview" },
      { text: "Architecture", link: "/architecture" },
      { text: "Backend", link: "/backend" },
      { text: "Frontend", link: "/frontend-web" },
      { text: "Security", link: "/security" },
      { text: "Design System", link: "/design-guidelines" },
      { text: "Deployment", link: "/deployment" },
    ],
    sidebar: [
      {
        text: "Getting Started",
        items: [
          { text: "Home", link: "/" },
          { text: "Overview", link: "/overview" },
        ],
      },
      {
        text: "Client Applications",
        items: [
          { text: "Architecture", link: "/architecture" },
          { text: "Backend / API", link: "/backend" },
          { text: "Mobile App", link: "/frontend-mobile" },
          { text: "Web App", link: "/frontend-web" },
        ],
      },
      {
        text: "Operations",
        items: [
          { text: "Security", link: "/security" },
          { text: "AI Module", link: "/ai" },
          { text: "Deployment", link: "/deployment" },
        ],
      },
      {
        text: "Guides",
        items: [
          { text: "Developer Guide", link: "/developer-guide" },
          { text: "Design", link: "/design-guidelines" },
        ],
      },
    ],
    search: { provider: "local" },
    outline: { level: [2, 3] },
  },
});
