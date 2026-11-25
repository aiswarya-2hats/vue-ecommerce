<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProduct, getVariantsForProduct } from '../services/productService'
import { useCart } from '../composables/useCart'
import { useWishlist } from '../composables/useWishlist'
import { useQuickView } from '../composables/useQuickView'
import { useProductVariants } from '../composables/useProductVariants'
import { useBreadcrumbLabel } from '../composables/useBreadcrumbLabel'
import ProductGallery from './ProductGallery.vue'
import ProductBuyBox from './ProductBuyBox.vue'
import ProductTabs from './ProductTabs.vue'
import CategorySlider from './CategorySlider.vue'
import RequestError from './RequestError.vue'
import { primaryProductImage } from '../utils/productImage'
import type { Product, ProductVariant } from '../types/product'
import '../assets/productdetail.css'

const props = withDefaults(
  defineProps<{
    productId: number | string
    showBack?: boolean
    syncVariantToRoute?: boolean
    showRelated?: boolean
    showTabs?: boolean
  }>(),
  {
    showBack: false,
    syncVariantToRoute: false,
    showRelated: true,
    showTabs: true,
  },
)

const route = useRoute()
const router = useRouter()
const { add: addToCart } = useCart()
const { isWishlisted, toggle: toggleWishlist } = useWishlist()
const { close: closeQuickView } = useQuickView()
const { setLabel: setBreadcrumbLabel, clearLabel: clearBreadcrumbLabel } = useBreadcrumbLabel()

const product = ref<Product | null>(null)
const variants = ref<ProductVariant[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const canRetry = ref(false)
const qty = ref(1)

const {
  selectedOptions,
  hasVariants,
  optionKeys,
  selectedVariant,
  displayPrice,
  stockLeft,
  canAdd,
  optionValues,
  swatchFor,
  selectOption,
  resetToFirst,
} = useProductVariants({
  variants,
  productId: () => product.value?.id,
  basePrice: () => product.value?.price,
  baseStock: () => product.value?.stock,
  baseImage: () => primaryProductImage(product.value),
  qty,
  preferredVariantId: () => {
    if (!props.syncVariantToRoute) return null
    const v = route.query.variant
    return Array.isArray(v) ? v[0] : v
  },
})

const wishlisted = computed(() =>
  Boolean(product.value && isWishlisted(product.value.id, selectedVariant.value?.id ?? null)),
)

const hasDiscount = computed(() => Math.round(Number(product.value?.discountPercentage)) >= 1)

const originalPrice = computed(() => {
  if (!product.value) return 0
  const pct = Number(product.value.discountPercentage)
  if (pct <= 0) return displayPrice.value
  return displayPrice.value / (1 - pct / 100)
})

const filledStars = computed(() => {
  const count = Math.round(Number(product.value?.rating)) || 0
  const filled = Math.min(5, Math.max(0, count))
  return '★'.repeat(filled) + '☆'.repeat(5 - filled)
})

// Product gallery images (used when the selected variant has no own image)
const productImages = computed(() => {
  if (!product.value) return []
  const list = product.value.images?.length
    ? product.value.images
    : [product.value.thumbnail].filter(Boolean)
  return [...new Set(list.filter(Boolean))]
})

// Variant with image → only that image. Otherwise → product images.
const images = computed(() => {
  const variantImage = selectedVariant.value?.image
  return variantImage ? [variantImage] : productImages.value
})

const galleryImage = computed(() => images.value[0] || '')

async function loadProduct(id: number | string) {
  loading.value = true
  error.value = null
  canRetry.value = false
  product.value = null
  variants.value = []
  qty.value = 1
  if (props.syncVariantToRoute) clearBreadcrumbLabel()

  try {
    const data = await getProduct(id)
    if (!data) {
      error.value = 'Product not found.'
      return
    }
    product.value = data
    if (props.syncVariantToRoute) setBreadcrumbLabel(data.title)
    variants.value = getVariantsForProduct(id)
    resetToFirst()
  } catch (err) {
    error.value = 'We couldn’t load this product. Check your connection and try again.'
    canRetry.value = true
    console.error(err)
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (props.syncVariantToRoute) clearBreadcrumbLabel()
})

function retryLoad() {
  if (props.productId) loadProduct(props.productId)
}

watch(
  () => props.productId,
  (newVal, oldVal) => {
    if (!newVal || newVal === oldVal) return
    loadProduct(newVal)
  },
  { immediate: true },
)

function onSelectOption(key: string, value: string) {
  selectOption(key, value)
  if (!props.syncVariantToRoute) return

  const variantId = selectedVariant.value?.id
  const query = { ...route.query }
  if (variantId) query.variant = String(variantId)
  else delete query.variant
  router.replace({ query })
}

function decreaseQty() {
  if (qty.value > 1) qty.value -= 1
}

function increaseQty() {
  if (qty.value < stockLeft.value) qty.value += 1
}

function onAddToCart() {
  if (!canAdd.value || !product.value) return
  addToCart(product.value.id, qty.value, selectedVariant.value)
}

function onToggleWish() {
  if (!product.value) return
  toggleWishlist(product.value.id, selectedVariant.value)
}

function onBuyNow() {
  if (!product.value) return
  closeQuickView()
  router.push(`/products/${product.value.id}`)
}
</script>

<template>
  <section class="detail-page">
    <div
      v-if="loading"
      class="detail detail--skeleton"
      aria-busy="true"
      aria-label="Loading product"
    >
      <div class="detail__gallery">
        <div class="detail__main-image skeleton-block"></div>
        <div class="detail__thumbs">
          <div v-for="n in 4" :key="n" class="detail__thumb skeleton-block"></div>
        </div>
      </div>
      <div class="detail__info">
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line skeleton-line--title"></div>
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line"></div>
        <div class="skeleton-line skeleton-line--short"></div>
        <div class="skeleton-actions">
          <div class="skeleton-block skeleton-block--btn"></div>
          <div class="skeleton-block skeleton-block--btn"></div>
        </div>
      </div>
    </div>
    <RequestError v-else-if="error" :message="error" :retryable="canRetry" @retry="retryLoad" />

    <template v-else-if="product">
      <div class="container">
        <article class="detail">
          <ProductGallery
            :images="images"
            :alt="product.title"
            :image="galleryImage"
            :wishlisted="wishlisted"
            @toggle-wish="onToggleWish"
          />

          <ProductBuyBox
            :product="product"
            :display-price="displayPrice"
            :original-price="originalPrice"
            :has-discount="hasDiscount"
            :filled-stars="filledStars"
            :stock-left="stockLeft"
            :has-variants="hasVariants"
            :option-keys="optionKeys"
            :selected-options="selectedOptions"
            :option-values="optionValues"
            :swatch-for="swatchFor"
            :selected-variant="selectedVariant"
            :qty="qty"
            :can-add="canAdd"
            @select="onSelectOption"
            @decrease-qty="decreaseQty"
            @increase-qty="increaseQty"
            @add-to-cart="onAddToCart"
            @buy-now="onBuyNow"
          />
        </article>
      </div>

      <div class="container">
        <ProductTabs
          v-if="showTabs"
          :description="product.description"
          :reviews="product.reviews || []"
        />
      </div>
      <div class="container">
        <CategorySlider
          v-if="showRelated && product.category"
          :category="product.category"
          title="Related products"
          :limit="8"
          :exclude-id="product.id"
        />
      </div>
    </template>
  </section>
</template>
