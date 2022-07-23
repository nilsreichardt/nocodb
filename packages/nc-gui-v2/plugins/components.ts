import { Menu as AMenu } from 'ant-design-vue'

export default defineNuxtPlugin((nuxtApp) => {
  // load ant-menu globally to resolve within draggable library
  nuxtApp.vueApp.component('AMenu', AMenu)
})
