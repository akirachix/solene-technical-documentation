const PREVIEW_LINES = 12;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3;
const STEP = 0.25;
const MIN_IMAGE_WIDTH = 160;

const ICON_FULLSCREEN =
  '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';

function button(
  className: string,
  label: string,
  html: string,
): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = className;
  el.title = label;
  el.setAttribute("aria-label", label);
  el.innerHTML = html;
  return el;
}

function languageOf(block: HTMLElement): string {
  const match = block.className.match(/language-([\w-]+)/);
  return match ? match[1] : "code";
}

export function enhanceCodeBlocks(): void {
  document
    .querySelectorAll<HTMLElement>('.vp-doc div[class*="language-"]')
    .forEach((block) => {
      if (block.dataset.zoomReady) return;
      const pre = block.querySelector("pre");
      if (!pre) return;
      block.dataset.zoomReady = "true";

      const open = button(
        "code-zoom-open",
        "Open full screen",
        ICON_FULLSCREEN,
      );
      open.addEventListener("click", () => openCode(block));
      block.appendChild(open);

      const lines = pre.querySelectorAll(".line").length;
      if (lines <= PREVIEW_LINES) return;

      block.classList.add("code-collapsible", "is-collapsed");
      const toggle = button("code-toggle", "Show all lines", "");
      const label = () =>
        block.classList.contains("is-collapsed")
          ? `Show all ${lines} lines`
          : "Show less";
      toggle.textContent = label();
      toggle.addEventListener("click", () => {
        block.classList.toggle("is-collapsed");
        toggle.textContent = label();
        if (block.classList.contains("is-collapsed")) {
          block.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
      });
      block.appendChild(toggle);
    });
}

export function enhanceImages(): void {
  document.querySelectorAll<HTMLImageElement>(".vp-doc img").forEach((img) => {
    if (img.dataset.zoomReady || img.closest("a")) return;
    img.dataset.zoomReady = "true";
    img.classList.add("zoomable");
    img.addEventListener("click", () => {
      if (img.getBoundingClientRect().width < MIN_IMAGE_WIDTH) return;
      openImage(img);
    });
  });
}

function openCode(block: HTMLElement): void {
  const pre = block.querySelector("pre");
  if (!pre) return;
  const lang = languageOf(block);

  const doc = document.createElement("div");
  doc.className = "vp-doc";
  const wrapper = document.createElement("div");
  wrapper.className = `language-${lang} zoom-code`;
  wrapper.appendChild(pre.cloneNode(true));
  doc.appendChild(wrapper);

  const text = (pre.querySelector("code") ?? pre).textContent ?? "";
  openModal(
    lang.toUpperCase(),
    doc,
    (zoom, modal) => modal.style.setProperty("--zoom", String(zoom)),
    text,
  );
}

function openImage(img: HTMLImageElement): void {
  const copy = document.createElement("img");
  copy.src = img.currentSrc || img.src;
  copy.alt = img.alt;
  copy.className = "zoom-image";

  let fit = 0;
  openModal(img.alt || "Image", copy, (zoom, modal) => {
    const stage = modal.querySelector<HTMLElement>(".zoom-stage");
    if (!stage) return;
    if (!fit) {
      const natural = img.naturalWidth || img.width;
      const ratio = (img.naturalHeight || img.height) / natural;
      const room = Math.min(
        stage.clientWidth - 48,
        (stage.clientHeight - 48) / ratio,
      );
      fit = Math.max(Math.min(natural, room), 50);
    }
    copy.style.width = `${Math.round(fit * zoom)}px`;
  });
}

function openModal(
  title: string,
  content: HTMLElement,
  apply: (zoom: number, modal: HTMLElement) => void,
  copyText?: string,
): void {
  let zoom = 1;
  const previousFocus = document.activeElement as HTMLElement | null;
  const previousOverflow = document.body.style.overflow;

  const modal = document.createElement("div");
  modal.className = "zoom-modal";
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.setAttribute("aria-label", title);

  const bar = document.createElement("div");
  bar.className = "zoom-bar";
  const name = document.createElement("span");
  name.className = "zoom-title";
  name.textContent = title;
  const actions = document.createElement("div");
  actions.className = "zoom-actions";

  const out = button("zoom-btn", "Zoom out", "−");
  const level = document.createElement("span");
  level.className = "zoom-level";
  const inn = button("zoom-btn", "Zoom in", "+");
  const reset = button("zoom-btn zoom-text", "Reset zoom", "Reset");
  const close = button("zoom-btn zoom-close", "Close", "✕");
  actions.append(out, level, inn, reset);

  if (copyText !== undefined) {
    const copy = button("zoom-btn zoom-text", "Copy code", "Copy");
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(copyText);
        copy.textContent = "Copied";
      } catch {
        copy.textContent = "Copy failed";
      }
      window.setTimeout(() => (copy.textContent = "Copy"), 1500);
    });
    actions.append(copy);
  }
  actions.append(close);
  bar.append(name, actions);

  const stage = document.createElement("div");
  stage.className = "zoom-stage";
  stage.appendChild(content);
  modal.append(bar, stage);

  const set = (next: number) => {
    zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(next * 100) / 100));
    level.textContent = `${Math.round(zoom * 100)}%`;
    out.disabled = zoom <= MIN_ZOOM;
    inn.disabled = zoom >= MAX_ZOOM;
    apply(zoom, modal);
  };

  const shut = () => {
    document.removeEventListener("keydown", onKey);
    modal.remove();
    document.body.style.overflow = previousOverflow;
    previousFocus?.focus();
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") shut();
    else if (event.key === "+" || event.key === "=") set(zoom + STEP);
    else if (event.key === "-") set(zoom - STEP);
    else if (event.key === "0") set(1);
  };

  out.addEventListener("click", () => set(zoom - STEP));
  inn.addEventListener("click", () => set(zoom + STEP));
  reset.addEventListener("click", () => set(1));
  close.addEventListener("click", shut);
  stage.addEventListener("click", (event) => {
    if (event.target === stage) shut();
  });
  stage.addEventListener(
    "wheel",
    (event) => {
      if (!event.ctrlKey && !event.metaKey) return;
      event.preventDefault();
      set(zoom + (event.deltaY < 0 ? STEP : -STEP));
    },
    { passive: false },
  );
  document.addEventListener("keydown", onKey);

  document.body.style.overflow = "hidden";
  document.body.appendChild(modal);
  set(1);
  close.focus();
}
