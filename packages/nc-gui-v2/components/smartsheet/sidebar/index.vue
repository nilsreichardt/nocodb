<script setup lang="ts">
import type { FormType, GalleryType, GridType, KanbanType } from 'nocodb-sdk'
import { ViewTypes } from 'nocodb-sdk'
import MenuTop from './MenuTop.vue'
import MenuBottom from './MenuBottom.vue'
import { useSmartsheetSidebar } from './useSmartsheetSidebar'
import { inject, ref } from '#imports'

/** Sidebar visible */
const drawerOpen = inject('navDrawerOpen', ref(false))

/** View type to create from modal */
let viewCreateType = $ref<ViewTypes>()

/** View title to create from modal (when duplicating) */
let viewCreateTitle = $ref('')

/** is view creation modal open */
let modalOpen = $ref(false)

const { views, activeView, modalHook } = useSmartsheetSidebar()!

modalHook.on((event) => {
  if (event.isOpen && event.data) {
    modalOpen = true
    viewCreateType = event.data.type
    viewCreateTitle = event.data.title
  } else {
    viewCreateType = ViewTypes.GRID
    viewCreateTitle = ''
    modalOpen = false
  }
})

function onCreated(view: GridType | FormType | KanbanType | GalleryType) {
  views.value.push(view)
  activeView.value = view
  modalHook.trigger({ isOpen: false })
}
</script>

<template>
  <a-layout-sider theme="light" class="shadow" :width="drawerOpen ? 0 : 250">
    <div class="flex flex-col h-full">
      <MenuTop />
      <MenuBottom />
    </div>

    <dlg-view-create v-if="views" v-model="modalOpen" :title="viewCreateTitle" :type="viewCreateType" @created="onCreated" />
  </a-layout-sider>
</template>

<style scoped>
:deep(.ant-menu-title-content) {
  @apply w-full;
}
</style>
