import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { useRoute } from 'vitepress'
import { nextTick, onMounted, watch } from 'vue'
import { enhanceCodeBlocks, enhanceImages } from './zoom'
import './style.css'
import './zoom.css'

export default {
  extends: DefaultTheme,
  setup() {
    const route = useRoute()
    const enhance = () =>
      nextTick(() => {
        enhanceCodeBlocks()
        enhanceImages()
      })
    onMounted(enhance)
    watch(() => route.path, enhance)
  },
} satisfies Theme
