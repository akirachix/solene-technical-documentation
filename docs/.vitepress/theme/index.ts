import DefaultTheme from "vitepress/theme";
import { h, onMounted } from "vue";
import "./style.css";

const shouldEnableExpandableMedia = () => {
  if (typeof window === "undefined") return false;
  const pathname = window.location.pathname;
  return (
    pathname.includes("/frontend-web") ||
    pathname.includes("/design-guidelines")
  );
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
  clone.addEventListener("click", (event) => {
    event.stopPropagation();
  });

  overlay.appendChild(clone);
  overlay.addEventListener("click", () => closeImageLightbox());
  document.body.appendChild(overlay);
};

const bindExpandableMedia = () => {
  if (!shouldEnableExpandableMedia()) return;

  document.querySelectorAll(".vp-doc img").forEach((image) => {
    const img = image as HTMLImageElement;
    if (img.dataset.expandableBound === "true") return;
    img.dataset.expandableBound = "true";
    img.classList.add("expandable-trigger");
    img.title = "Click to expand image";
    img.addEventListener("click", (event) => {
      event.stopPropagation();
      openImageLightbox(img);
    });
  });

  document
    .querySelectorAll('.vp-doc div[class*="language-"]')
    .forEach((block) => {
      if (block.dataset.expandableBound === "true") return;
      block.dataset.expandableBound = "true";
      block.classList.add("expandable-code");
      block.title = "Click to expand code block";
      block.addEventListener("click", () => {
        block.classList.toggle("is-expanded");
      });
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
