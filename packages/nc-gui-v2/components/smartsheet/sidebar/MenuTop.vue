<script lang="ts" setup>
import type { FormType, GridType, KanbanType } from 'nocodb-sdk'
import type { SortableEvent } from 'sortablejs'
import type { Menu as AntMenu } from 'ant-design-vue'
import Sortable from 'sortablejs'
import RenameableMenuItem from './RenameableMenuItem.vue'
import { useSmartsheetSidebar } from './useSmartsheetSidebar'
import { onMounted, ref, watch } from '#imports'

const { api, views, loadViews, activeView, deleteModalHook } = useSmartsheetSidebar()!

/** Selected view(s) for menu */
const selected = ref<string[]>([])

/** dragging renamable view items */
let dragging = $ref(false)

let deleteModalVisible = $ref(false)

/** view to delete for modal */
let toDelete = $ref<Record<string, any> | undefined>()

const menuRef = ref<typeof AntMenu>()

/** Watch currently active view, so we can mark it in the menu */
watch(activeView, (nextActiveView) => {
  const _nextActiveView = nextActiveView as GridType | FormType | KanbanType

  if (_nextActiveView && _nextActiveView.id) {
    selected.value = [_nextActiveView.id]
  }
})

function onSortStart(evt: SortableEvent) {
  evt.stopImmediatePropagation()
  evt.preventDefault()
  dragging = true
}

async function onSortEnd(evt: SortableEvent) {
  dragging = false
  if (views.value.length < 2) return

  const { newIndex = 0, oldIndex = 0 } = evt

  if (newIndex === oldIndex) return

  const children = evt.to.children

  const previousEl = children[newIndex - 1]
  const nextEl = children[newIndex + 1]

  const currentItem = views.value.find((v) => v.id === evt.item.id)!
  const previousItem = previousEl ? views.value.find((v) => v.id === previousEl.id) : {}
  const nextItem = nextEl ? views.value.find((v) => v.id === nextEl.id) : {}

  let nextOrder: number

  // set new order value based on the new order of the items
  if (views.value.length - 1 === newIndex) {
    nextOrder = parseFloat(previousItem?.order) + 1
  } else if (newIndex === 0) {
    nextOrder = parseFloat(nextItem?.order) / 2
  } else {
    nextOrder = (parseFloat(previousItem?.order) + parseFloat(nextItem?.order)) / 2
  }

  const _nextOrder = !isNaN(Number(nextOrder)) ? nextOrder.toString() : oldIndex.toString()

  currentItem.order = _nextOrder

  await api.dbView.update(currentItem.id, { order: _nextOrder })
}

let sortable: Sortable

// todo: replace with vuedraggable
const initSortable = (el: HTMLElement) => {
  if (sortable) sortable.destroy()

  sortable = new Sortable(el, {
    handle: '.nc-drag-icon',
    ghostClass: 'ghost',
    onStart: onSortStart,
    onEnd: onSortEnd,
  })
}

onMounted(() => menuRef.value && initSortable(menuRef.value.$el))

deleteModalHook.on((event) => {
  if (event.isOpen && event.view) {
    deleteModalVisible = true
    toDelete = event.view
  } else {
    toDelete = undefined
    deleteModalVisible = false
  }
})

/** View was deleted, trigger reload */
async function onDeleted() {
  await loadViews()
  toDelete = undefined
  deleteModalVisible = false
}
</script>

<template>
  <h3 class="nc-headline pt-3 px-3 text-xs font-semibold">{{ $t('objects.views') }}</h3>

  <a-menu
    ref="menuRef"
    :class="{ dragging }"
    class="flex-1 max-h-[50vh] md:max-h-[200px] lg:max-h-[400px] xl:max-h-[600px] overflow-y-scroll scrollbar-thin-primary"
    :selected-keys="selected"
  >
    <RenameableMenuItem v-for="view of views" :id="view.id" :key="view.id" :view="view" />
  </a-menu>

  <dlg-view-delete v-model="deleteModalVisible" :view="toDelete" @deleted="onDeleted" />
</template>

<style>
.ghost,
.ghost > * {
  @apply !pointer-events-none;
}

.dragging .nc-icon {
  @apply !hidden;
}

.dragging .nc-view-icon {
  @apply !block;
}
</style>
