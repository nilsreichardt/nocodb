import type { GalleryType, GridType, KanbanType, TableType, ViewTypes } from 'nocodb-sdk'
import { notification } from 'ant-design-vue'
import type { Ref } from 'vue'
import { createEventHook, createInjectionState, provide, ref, useApi, useViews, watch } from '#imports'
import { ViewListInj } from '~/context'
import { extractSdkResponseErrorMsg } from '~/utils'

export const [useProvideSmartsheetSidebar, useSmartsheetSidebar] = createInjectionState(
  (meta: Ref<TableType>, activeView: Ref<Record<string, any> | undefined>) => {
    const { views, loadViews } = useViews(meta)

    const { api } = useApi()

    provide(ViewListInj, views)

    provide('navDrawerOpen', ref(false))

    const modalHook = createEventHook<{ isOpen: boolean; data?: { type: ViewTypes; title: string } }>()

    const deleteModalHook = createEventHook<{ isOpen: boolean; view: Record<string, any> }>()

    /** Watch current views and on change set the next active view */
    watch(
      views,
      (nextViews) => {
        if (nextViews.length) {
          activeView.value = nextViews[0]
        }
      },
      { immediate: true },
    )

    /** validate view title */
    function validate(value?: string) {
      if (!value || value.trim().length < 0) {
        return 'View name is required'
      }

      if (views.value.every((v1) => ((v1 as GridType | KanbanType | GalleryType).alias || v1.title) !== value)) {
        return 'View name should be unique'
      }

      return true
    }

    /** Rename a view */
    async function rename(view: Record<string, any>) {
      const valid = validate(view.title)

      if (valid !== true) {
        notification.error({
          message: valid,
          duration: 2,
        })
      }

      try {
        // todo typing issues, order and id do not exist on all members of ViewTypes (Kanban, Gallery, Form, Grid)
        await api.dbView.update(view.id, {
          title: view.title,
          order: view.order,
        })

        notification.success({
          message: 'View renamed successfully',
          duration: 3,
        })
      } catch (e: any) {
        notification.error({
          message: await extractSdkResponseErrorMsg(e),
          duration: 3,
        })
      }
    }

    return {
      api,
      activeView,
      views: views as Ref<Record<string, any>[]>,
      loadViews,
      modalHook,
      deleteModalHook,
      rename,
    }
  },
)
