<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue";
import { withBase } from "vitepress";

const props = defineProps<{ src: string; alt?: string }>();

const url = computed(() =>
  props.src.startsWith("/") ? withBase(props.src) : props.src,
);
const open = ref(false);
const stage = ref<HTMLElement | null>(null);
const picture = ref<HTMLImageElement | null>(null);
const view = reactive({ scale: 1, x: 0, y: 0 });
const pointers = new Map<number, { x: number; y: number }>();
let pinchStart = 0;
let pinchScale = 1;
let dragged = false;

const MIN = 1;
const MAX = 8;

const transform = computed(
  () => `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
);

function reset() {
  view.scale = 1;
  view.x = 0;
  view.y = 0;
}

function zoomAt(next: number, cx: number, cy: number) {
  const scale = Math.min(MAX, Math.max(MIN, next));
  const rect = stage.value?.getBoundingClientRect();
  if (!rect) return;
  const ox = cx - rect.left - rect.width / 2;
  const oy = cy - rect.top - rect.height / 2;
  const ratio = scale / view.scale;
  view.x = ox - (ox - view.x) * ratio;
  view.y = oy - (oy - view.y) * ratio;
  view.scale = scale;
  if (scale === MIN) reset();
}

function zoomBy(factor: number) {
  const rect = stage.value?.getBoundingClientRect();
  if (!rect) return;
  zoomAt(
    view.scale * factor,
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
  );
}

function onWheel(e: WheelEvent) {
  e.preventDefault();
  zoomAt(view.scale * (e.deltaY < 0 ? 1.15 : 1 / 1.15), e.clientX, e.clientY);
}

function distance() {
  const [a, b] = [...pointers.values()];
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function onPointerDown(e: PointerEvent) {
  (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  dragged = false;
  if (pointers.size === 2) {
    pinchStart = distance();
    pinchScale = view.scale;
  }
}

function onPointerMove(e: PointerEvent) {
  const last = pointers.get(e.pointerId);
  if (!last) return;
  const dx = e.clientX - last.x;
  const dy = e.clientY - last.y;
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (Math.abs(dx) + Math.abs(dy) > 2) dragged = true;
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    zoomAt(
      pinchScale * (distance() / pinchStart),
      (a.x + b.x) / 2,
      (a.y + b.y) / 2,
    );
  } else if (view.scale > MIN) {
    view.x += dx;
    view.y += dy;
  }
}

function onPointerUp(e: PointerEvent) {
  pointers.delete(e.pointerId);
}

function onDoubleClick(e: MouseEvent) {
  if (view.scale > MIN) reset();
  else zoomAt(2.5, e.clientX, e.clientY);
}

function onBackdropClick(e: MouseEvent) {
  if (dragged) return;
  const rect = picture.value?.getBoundingClientRect();
  const inside =
    rect &&
    e.clientX >= rect.left &&
    e.clientX <= rect.right &&
    e.clientY >= rect.top &&
    e.clientY <= rect.bottom;
  if (!inside) close();
}

function onKey(e: KeyboardEvent) {
  if (e.key === "Escape") close();
  else if (e.key === "+" || e.key === "=") zoomBy(1.25);
  else if (e.key === "-") zoomBy(1 / 1.25);
  else if (e.key === "0") reset();
}

function show() {
  reset();
  open.value = true;
}

function close() {
  open.value = false;
}

watch(open, async (isOpen) => {
  document.documentElement.style.overflow = isOpen ? "hidden" : "";
  if (isOpen) {
    window.addEventListener("keydown", onKey);
    await nextTick();
    stage.value?.focus();
  } else {
    window.removeEventListener("keydown", onKey);
    pointers.clear();
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKey);
  document.documentElement.style.overflow = "";
});
</script>

<template>
  <figure class="iz-figure">
    <button
      type="button"
      class="iz-thumb"
      :aria-label="`Open ${alt ?? 'image'} full screen`"
      @click="show"
    >
      <img :src="url" :alt="alt" />
      <span class="iz-hint">Click to enlarge</span>
    </button>
  </figure>

  <Teleport to="body">
    <div
      v-if="open"
      class="iz-overlay"
      role="dialog"
      aria-modal="true"
      :aria-label="alt ?? 'Image viewer'"
    >
      <div class="iz-toolbar">
        <button type="button" aria-label="Zoom out" @click="zoomBy(1 / 1.25)">
          −
        </button>
        <span class="iz-level">{{ Math.round(view.scale * 100) }}%</span>
        <button type="button" aria-label="Zoom in" @click="zoomBy(1.25)">
          +
        </button>
        <button type="button" aria-label="Reset zoom" @click="reset">
          Fit
        </button>
        <a :href="url" target="_blank" rel="noopener">Original</a>
        <button type="button" aria-label="Close" @click="close">✕</button>
      </div>
      <div
        ref="stage"
        class="iz-stage"
        tabindex="-1"
        :class="{ 'iz-zoomed': view.scale > 1 }"
        @click="onBackdropClick"
        @wheel="onWheel"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
        @dblclick="onDoubleClick"
      >
        <img
          ref="picture"
          :src="url"
          :alt="alt"
          draggable="false"
          :style="{ transform }"
        />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.iz-figure {
  margin: 16px 0;
}

.iz-thumb {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  cursor: zoom-in;
}

.iz-thumb img {
  display: block;
  width: 100%;
  height: auto;
}

.iz-hint {
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 13px;
  opacity: 0;
  transition: opacity 0.2s;
}

.iz-thumb:hover .iz-hint,
.iz-thumb:focus-visible .iz-hint {
  opacity: 1;
}

.iz-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  background: rgba(15, 15, 15, 0.97);
}

.iz-toolbar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
}

.iz-toolbar button,
.iz-toolbar a {
  min-width: 40px;
  height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 16px;
  line-height: 38px;
  text-decoration: none;
  cursor: pointer;
}

.iz-toolbar button:hover,
.iz-toolbar a:hover {
  background: rgba(255, 255, 255, 0.18);
}

.iz-level {
  min-width: 56px;
  color: #fff;
  font-size: 14px;
  text-align: center;
}

.iz-stage {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  outline: none;
  touch-action: none;
  cursor: zoom-out;
}

.iz-stage.iz-zoomed {
  cursor: grab;
}

.iz-stage.iz-zoomed:active {
  cursor: grabbing;
}

.iz-stage img {
  max-width: 96vw;
  max-height: calc(100vh - 80px);
  transform-origin: center center;
  user-select: none;
  cursor: inherit;
}
</style>
