import { ref } from 'vue'

const productId = ref<number | string | null>(null)

export function useQuickView() {
  function open(id: number | string | null | undefined) {
    productId.value = id != null ? Number(id) || id : null
  }

  function close() {
    productId.value = null
  }

  return { productId, open, close }
}
