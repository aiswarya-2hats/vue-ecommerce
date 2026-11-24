<script setup lang="ts">
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{
    images?: string[]
    image?: string
    alt?: string
    wishlisted?: boolean
  }>(),
  {
    images: () => [],
    image: '',
    alt: '',
    wishlisted: false,
  },
)

defineEmits<{
  'toggle-wish': []
}>()

// Local thumb click override; cleared whenever parent image/list changes
const pickedImage = ref<string | null>(null)
const zooming = ref(false)
const zoomOrigin = ref('50% 50%')
const lightboxOpen = ref(false)
const closeBtnRef = ref<HTMLButtonElement | null>(null)
let lockedScrollY = 0

const galleryImages = computed(() => {
  if (props.images.length) return props.images
  if (props.image) return [props.image]
  return []
})

const activeImage = computed(
  () => pickedImage.value || props.image || galleryImages.value[0] || '',
)

const activeIndex = computed(() => {
  const i = galleryImages.value.indexOf(activeImage.value)
  return i >= 0 ? i : 0
})

const canNavigate = computed(() => galleryImages.value.length > 1)

watch(
  () => [props.image, props.images] as const,
  () => {
    pickedImage.value = null
  },
)

function selectImage(src: string) {
  if (src) pickedImage.value = src
}

function lockBackgroundScroll() {
  lockedScrollY = window.scrollY
  document.documentElement.style.overflow = 'hidden'
  document.body.style.overflow = 'hidden'
  document.body.style.position = 'fixed'
  document.body.style.top = `-${lockedScrollY}px`
  document.body.style.left = '0'
  document.body.style.right = '0'
  document.body.style.width = '100%'
}

function unlockBackgroundScroll() {
  document.documentElement.style.overflow = ''
  document.body.style.position = ''
  document.body.style.top = ''
  document.body.style.left = ''
  document.body.style.right = ''
  document.body.style.width = ''
  // Keep overflow locked if Quick View is still open
  const quickViewOpen = Boolean(document.querySelector('.quickview'))
  document.body.style.overflow = quickViewOpen ? 'hidden' : ''
  window.scrollTo(0, lockedScrollY)
}

async function openLightbox() {
  if (!activeImage.value) return
  zooming.value = false
  lightboxOpen.value = true
  lockBackgroundScroll()
  await nextTick()
  closeBtnRef.value?.focus()
}

function closeLightbox() {
  lightboxOpen.value = false
  unlockBackgroundScroll()
}

function showPrev() {
  if (!canNavigate.value) return
  const next = (activeIndex.value - 1 + galleryImages.value.length) % galleryImages.value.length
  pickedImage.value = galleryImages.value[next]
}

function showNext() {
  if (!canNavigate.value) return
  const next = (activeIndex.value + 1) % galleryImages.value.length
  pickedImage.value = galleryImages.value[next]
}

function onKeydown(event: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (event.key === 'Escape') closeLightbox()
  else if (event.key === 'ArrowLeft') showPrev()
  else if (event.key === 'ArrowRight') showNext()
}

watch(lightboxOpen, (open) => {
  if (open) window.addEventListener('keydown', onKeydown)
  else window.removeEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (lightboxOpen.value) unlockBackgroundScroll()
})

function onZoomMove(event: MouseEvent) {
  const target = event.target as HTMLElement | null
  if (lightboxOpen.value || target?.closest('.detail__wish')) {
    zooming.value = false
    return
  }

  const el = event.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100
  zoomOrigin.value = `${x}% ${y}%`
  zooming.value = true
}

function onZoomLeave() {
  zooming.value = false
  zoomOrigin.value = '50% 50%'
}
</script>

<template>
  <div class="detail__gallery">
    <div
      class="detail__main-image"
      :class="{ 'detail__main-image--zoom': zooming && Boolean(activeImage) }"
      :role="activeImage ? 'button' : undefined"
      :tabindex="activeImage ? 0 : undefined"
      :aria-label="activeImage ? `View ${alt || 'product'} full screen` : undefined"
      @click="activeImage ? openLightbox() : undefined"
      @keydown.enter.prevent="activeImage ? openLightbox() : undefined"
      @keydown.space.prevent="activeImage ? openLightbox() : undefined"
      @mousemove="activeImage ? onZoomMove($event) : undefined"
      @mouseleave="onZoomLeave"
    >
      <img
        v-if="activeImage"
        :src="activeImage"
        :alt="alt"
        :style="{ transformOrigin: zoomOrigin }"
      />
      <button
        type="button"
        class="detail__wish"
        :class="{ 'detail__wish--active': wishlisted }"
        :aria-label="wishlisted ? 'Remove from wishlist' : 'Add to wishlist'"
        :aria-pressed="wishlisted"
        @click.stop="$emit('toggle-wish')"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"
          />
        </svg>
      </button>
    </div>

    <div v-if="galleryImages.length > 1" class="detail__thumbs">
      <button
        v-for="(src, index) in galleryImages"
        :key="`${src}-${index}`"
        type="button"
        class="detail__thumb"
        :class="{ 'detail__thumb--active': src === activeImage }"
        :aria-label="`View image ${index + 1}`"
        @click="selectImage(src)"
      >
        <img :src="src" :alt="`${alt} thumbnail ${index + 1}`" />
      </button>
    </div>
  </div>

  <Teleport to="body">
    <Transition name="lightbox">
      <div
        v-if="lightboxOpen"
        class="lightbox"
        role="dialog"
        aria-modal="true"
        :aria-label="alt || 'Product image'"
        @click.self="closeLightbox"
      >
        <button
          ref="closeBtnRef"
          type="button"
          class="lightbox__close"
          aria-label="Close full screen"
          @click="closeLightbox"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          >
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>

        <p v-if="canNavigate" class="lightbox__count" aria-live="polite">
          {{ activeIndex + 1 }} / {{ galleryImages.length }}
        </p>

        <div class="lightbox__stage">
          <button
            v-if="canNavigate"
            type="button"
            class="lightbox__nav lightbox__nav--prev"
            aria-label="Previous image"
            @click="showPrev"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>

          <img :src="activeImage" :alt="alt" class="lightbox__img" />

          <button
            v-if="canNavigate"
            type="button"
            class="lightbox__nav lightbox__nav--next"
            aria-label="Next image"
            @click="showNext"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>

        <div v-if="canNavigate" class="lightbox__thumbs" role="tablist" aria-label="Images">
          <button
            v-for="(src, index) in galleryImages"
            :key="`lightbox-${src}-${index}`"
            type="button"
            class="lightbox__thumb"
            :class="{ 'lightbox__thumb--active': src === activeImage }"
            role="tab"
            :aria-selected="src === activeImage"
            :aria-label="`Image ${index + 1}`"
            @click="selectImage(src)"
          >
            <img :src="src" :alt="`${alt} ${index + 1}`" />
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
