<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useBreadcrumbLabel } from '../composables/useBreadcrumbLabel'
import '../assets/breadcrumb.css'

const route = useRoute()
const { label: dynamicLabel } = useBreadcrumbLabel()

const crumbs = computed(() => {
  const items = [{ label: 'Home', path: '/' }]

  if (route.meta.parent) {
    items.push(route.meta.parent)
  }

  if (route.path === '/') return items

  const fromMeta =
    typeof route.meta.breadcrumb === 'function'
      ? route.meta.breadcrumb(route)
      : route.meta.breadcrumb

  const label = dynamicLabel.value || fromMeta
  if (label) {
    items.push({ label, path: route.path })
  }

  return items
})
</script>

<!-- components/Breadcrumbs.vue -->
<template>
  <nav aria-label="breadcrumb" class="breadcrumb">
    <ol class="breadcrumb-list">
      <li v-for="(crumb, index) in crumbs" :key="index" class="breadcrumb-item">
        <!-- If it's the last item, disable the link since the user is already there -->
        <span v-if="index === crumbs.length - 1" class="active">
          {{ crumb.label }}
        </span>
        <router-link v-else :to="crumb.path">
          {{ crumb.label }}
        </router-link>

        <!-- Add a separator between items -->
        <span v-if="index < crumbs.length - 1" class="separator"> / </span>
      </li>
    </ol>
  </nav>
</template>
