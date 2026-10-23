import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import ImageZoom from './components/ImageZoom.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ImageZoom', ImageZoom)
  },
} satisfies Theme