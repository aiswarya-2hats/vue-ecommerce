import { ref, computed, watch, toValue } from 'vue'
import { useCart } from './useCart'

export function useProductVariants({
  variants: variantsSource,
  productId,
  basePrice = 0,
  baseStock = 0,
  baseImage = '',
  qty = null,
} = {}) {
  const { getQty } = useCart()
  const selectedOptions = ref({}) // the selected options

  const variants = computed(() => toValue(variantsSource) || []) // get the variants

  const hasVariants = computed(() => variants.value.length > 0) // check if there are any variants

  const optionKeys = computed(() => {
    // get the keys of the options
    const first = variants.value[0] // get the first variant
    return first ? Object.keys(first.options) : [] // get the keys of the options
  })

  const selectedVariant = computed(() => {
    // find the variant that matches the selected options
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
    return Math.max(0, displayStock.value - getQty(id, selectedVariant.value?.id))
  })

  const canAdd = computed(() => {
    const amount = qty ? Number(toValue(qty)) || 1 : 1
    return stockLeft.value > 0 && amount <= stockLeft.value
  })

  function syncOptionsFromVariant(variant) {
    selectedOptions.value = variant ? { ...variant.options } : {}
  }

  function resetToFirst() {
    syncOptionsFromVariant(variants.value[0] ?? null)
    if (qty) qty.value = 1
  }

  function optionValues(key) {
    return [...new Set(variants.value.map((v) => v.options[key]).filter(Boolean))]
  }

  function selectOption(key, value) {
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

  watch(variants, () => {
    resetToFirst()
  })

  return {
    // return the computed properties and functions to parent component
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
    selectOption,
    resetToFirst,
    syncOptionsFromVariant,
  }
}
