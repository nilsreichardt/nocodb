import type { FormType, GalleryType, GridType, KanbanType, TableType } from 'nocodb-sdk'
import type { WatchOptions } from '@vue/runtime-core'
import type { Ref } from 'vue'
import { unref, useNuxtApp, watch } from '#imports'

export default function (meta: Ref<TableType | undefined>, watchOptions: WatchOptions = {}) {
  let views = $ref<(GridType | FormType | KanbanType | GalleryType)[]>([])
  const { $api } = useNuxtApp()

  const loadViews = async () => {
    const _meta = unref(meta)

    if (_meta && _meta.id) {
      const response = (await $api.dbView.list(_meta.id)).list as any[]
      if (response) {
        views = response.sort((a, b) => a.order - b.order)
      }
    }
  }

  watch(meta, loadViews, {
    immediate: true,
    ...watchOptions,
  })

  return { views: $$(views), loadViews }
}
