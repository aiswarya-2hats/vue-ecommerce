import { ref, computed, watch, toValue, type MaybeRefOrGetter, type Ref } from 'vue'
import { useCart } from './useCart'
import type { ProductVariant, VariantOptions } from '../types/product'

export interface UseProductVariantsOptions {
  variants?: MaybeRefOrGetter<ProductVariant[] | null | undefined>
  productId?: MaybeRefOrGetter<number | string | null | undefined>
  basePrice?: MaybeRefOrGetter<number | string | null | undefined>
  baseStock?: MaybeRefOrGetter<number | string | null | undefined>
  baseImage?: MaybeRefOrGetter<string | null | undefined>
  qty?: Ref<number> | null
  preferredVariantId?: MaybeRefOrGetter<string | number | null | undefined> | null
}

export function useProductVariants({
  variants: variantsSource,
  productId,
  basePrice = 0,
  baseStock = 0,
  baseImage = '',
  qty = null,
  preferredVariantId = null,
}: UseProductVariantsOptions = {}) {
  const { getQty } = useCart()
  const selectedOptions = ref<VariantOptions>({})

  const variants = computed(() => toValue(variantsSource) || [])

  const hasVariants = computed(() => variants.value.length > 0)

  const optionKeys = computed(() => {
    const first = variants.value[0]
    return first ? Object.keys(first.options) : []
  })

  const selectedVariant = computed(() => {
    if (!hasVariants.value) return null
    return (
      variants.value.find((v) =>
        optionKeys.value.every((k) => v.options[k] === selectedOptions.value[k]),
      ) || null
    )
  })

  const displayPrice = computed(() =>
    selectedVariant.value ? Number(selectedVariant.value.price) : Number(toValue(basePrice)) || 0,
  )

  const displayStock = computed(() =>
    selectedVariant.value ? Number(selectedVariant.value.stock) : Number(toValue(baseStock)) || 0,
  )

  const displayImage = computed(() => selectedVariant.value?.image || toValue(baseImage) || '')

  const stockLeft = computed(() => {
    const id = toValue(productId)
    if (!id) return 0
    return Math.max(0, displayStock.value - getQty(id, selectedVariant.value?.id ?? null))
  })

  const canAdd = computed(() => {
    const amount = qty ? Number(toValue(qty)) || 1 : 1
    return stockLeft.value > 0 && amount <= stockLeft.value
  })

  function syncOptionsFromVariant(variant: ProductVariant | null) {
    selectedOptions.value = variant ? { ...variant.options } : {}
  }

  function selectVariantById(id: string | number | null | undefined) {
    const match = id ? variants.value.find((v) => String(v.id) === String(id)) : null
    syncOptionsFromVariant(match || variants.value[0] || null)
    if (qty) qty.value = 1
  }

  function resetToFirst() {
    selectVariantById(toValue(preferredVariantId))
  }

  function optionValues(key: string) {
    return [...new Set(variants.value.map((v) => v.options[key]).filter(Boolean))]
  }

  /** Hex from variant data for this option value; empty string = show as text */
  function swatchFor(key: string, value: string) {
    const match = variants.value.find(
      (v) => v.options[key] === value && Boolean(v.swatches?.[key]),
    )
    return match?.swatches?.[key] || ''
  }

  function selectOption(key: string, value: string) {
    const next = { ...selectedOptions.value, [key]: value }
    const exact = variants.value.find((v) =>
      optionKeys.value.every((k) => v.options[k] === next[k]),
    )
    if (exact) {
      selectedOptions.value = { ...exact.options }
    } else {
      const fallback = variants.value.find((v) => v.options[key] === value)
      if (fallback) selectedOptions.value = { ...fallback.options }
    }
    if (qty) qty.value = 1
  }

  resetToFirst()

  watch(
    () => variants.value.map((v) => v.id).join('|'),
    () => {
      resetToFirst()
    },
  )

  if (preferredVariantId != null) {
    watch(
      () => toValue(preferredVariantId),
      (id, prev) => {
        if (id === prev) return
        selectVariantById(id)
      },
    )
  }

  return {
    selectedOptions,
    hasVariants,
    optionKeys,
    selectedVariant,
    displayPrice,
    displayStock,
    displayImage,
    stockLeft,
    canAdd,
    optionValues,
    swatchFor,
    selectOption,
    selectVariantById,
    resetToFirst,
    syncOptionsFromVariant,
  }
}
