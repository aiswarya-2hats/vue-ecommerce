import { ref } from 'vue'

const label = ref(null)

export function useBreadcrumbLabel() {
  function setLabel(value) {
    label.value = value
  }

  function clearLabel() {
    label.value = null
  }

  return { label, setLabel, clearLabel }
}
