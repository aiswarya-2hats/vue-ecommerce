import { ref } from 'vue'

const productId = ref(null) // product id to be displayed in the quick view.(productId is declared outside the function, so every component that calls useQuickView() shares the same value.)

export function useQuickView() {
  function open(id) {
    productId.value = id != null ? Number(id) || id : null
  }

  function close() {
    productId.value = null
  }

  return { productId, open, close }
}
