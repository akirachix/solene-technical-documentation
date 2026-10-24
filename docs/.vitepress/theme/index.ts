import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import ImageZoom from './components/ImageZoom.vue'
import { useRoute } from 'vitepress'
import { nextTick, onMounted, watch } from 'vue'
import { enhanceCodeBlocks, enhanceImages } from './zoom'
import './style.css'
import './zoom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ImageZoom', ImageZoom)
  },
} satisfies Theme
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
import DefaultTheme from "vitepress/theme";
import { h, onMounted } from "vue";
import "./style.css";

const shouldEnableExpandableMedia = () => {
  if (typeof window === "undefined") return false;
  return true;
};

const closeImageLightbox = () => {
  document
    .querySelectorAll(".doc-image-lightbox")
    .forEach((overlay) => overlay.remove());
};

const openImageLightbox = (image: HTMLImageElement) => {
  closeImageLightbox();

  const overlay = document.createElement("div");
  overlay.className = "doc-image-lightbox";

  const clone = image.cloneNode(true) as HTMLImageElement;
  clone.style.border = "none";
  clone.style.boxShadow = "none";
  clone.style.cursor = "default";
  clone.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  overlay.appendChild(clone);
  overlay.addEventListener("click", () => closeImageLightbox());
  document.body.appendChild(overlay);
};

const bindExpandableMedia = () => {
  if (!shouldEnableExpandableMedia()) return;

  document.querySelectorAll("img").forEach((image) => {
    const img = image as HTMLImageElement;
    const isInsideDoc = img.closest(".vp-doc") !== null;
    if (!isInsideDoc) return;
    if (img.dataset.expandableBound === "true") return;

    img.dataset.expandableBound = "true";
    img.classList.add("expandable-trigger");
    img.title = "Click to expand image";
    img.style.cursor = "zoom-in";
    img.onclick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      openImageLightbox(img);
    };
  });

  document
    .querySelectorAll('.vp-doc div[class*="language-"]')
    .forEach((block) => {
      if (block.dataset.expandableBound === "true") return;
      block.dataset.expandableBound = "true";
      block.classList.add("expandable-code");
      block.title = "Click to expand code block";
      block.onclick = () => {
        block.classList.toggle("is-expanded");
      };
    });
};

export default {
  ...DefaultTheme,
  setup() {
    onMounted(() => {
      bindExpandableMedia();

      const observer = new MutationObserver(() => bindExpandableMedia());
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });

      window.addEventListener("hashchange", bindExpandableMedia);
      window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeImageLightbox();
      });
    });
  },
  render() {
    return h(DefaultTheme.Layout);
  },
};
