/// <reference types="vite/client" />

export {}

declare module 'vue-router' {
  interface RouteMeta {
    breadcrumb?: string | ((route: import('vue-router').RouteLocationNormalizedLoaded) => string)
    parent?: {
      label: string
      path: string
    }
  }
}

declare global {
  interface ImportMetaEnv {
    readonly VITE_BASE_URL: string
  }
}
