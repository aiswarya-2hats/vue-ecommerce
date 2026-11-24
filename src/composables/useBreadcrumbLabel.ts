import { ref } from 'vue'

const label = ref<string | null>(null)

export function useBreadcrumbLabel() {
  function setLabel(value: string | null) {
    label.value = value
  }

  function clearLabel() {
    label.value = null
  }

  return { label, setLabel, clearLabel }
}
