import type { WritableComputedRef } from '@vue/reactivity'
import { navigateTo, useProject, useRoute, useState } from '#imports'

export enum TabType {
  TABLE = 'table',
  VIEW = 'view',
  AUTH = 'auth',
}

export interface TabItem {
  type: TabType
  title: string
  id?: string
}

function getPredicate(key: Partial<TabItem>) {
  return (tab: TabItem) =>
    (!('id' in key) || tab.id === key.id) &&
    (!('title' in key) || tab.title === key.id) &&
    (!('type' in key) || tab.type === key.id)
}

export function useTabs() {
  const tabs = useState<TabItem[]>('tabs', () => [])

  const route = useRoute()

  const { tables } = useProject()

  const activeTabIndex: WritableComputedRef<number> = computed({
    get() {
      if ((route.name as string)?.startsWith('nc-projectId-index-index-type-title-viewTitle') && tables.value?.length) {
        const tab: Partial<TabItem> = { type: route.params.type as TabType, title: route.params.title as string }

        const id = tables.value?.find((t) => t.title === tab.title)?.id

        tab.id = id as string

        let index = tabs.value.findIndex((t) => t.id === tab.id)

        if (index === -1) {
          tabs.value.push(tab as TabItem)
          index = tabs.value.length - 1
        }

        return index
      } else if ((route.name as string)?.startsWith('nc-projectId-index-index-auth')) {
        return tabs.value.findIndex((t) => t.type === 'auth')
      }

      return -1
    },
    set(index: number) {
      if (index === -1) {
        navigateTo(`/nc/${route.params.projectId}`)
      } else {
        const tab = tabs.value[index]

        if (!tab) return

        switch (tab.type) {
          case TabType.TABLE:
            return navigateTo(`/nc/${route.params.projectId}/table/${tab?.title}`)
          case TabType.VIEW:
            return navigateTo(`/nc/${route.params.projectId}/view/${tab?.title}`)
          case TabType.AUTH:
            return navigateTo(`/nc/${route.params.projectId}/auth`)
        }
      }
    },
  })

  const activeTab = computed(() => tabs.value?.[activeTabIndex.value])

  const addTab = (tabMeta: TabItem) => {
    const tabIndex = tabs.value.findIndex((tab) => tab.id === tabMeta.id)
    // if tab already found make it active
    if (tabIndex > -1) {
      activeTabIndex.value = tabIndex
    }
    // if tab not found add it
    else {
      tabs.value = [...(tabs.value || []), tabMeta]
      activeTabIndex.value = tabs.value.length - 1
    }
  }

  const clearTabs = () => {
    tabs.value = []
  }

  const closeTab = async (key: number | Partial<TabItem>) => {
    const index = typeof key === 'number' ? key : tabs.value.findIndex(getPredicate(key))
    if (activeTabIndex.value === index) {
      let newTabIndex = index - 1
      if (newTabIndex < 0 && tabs.value?.length > 1) newTabIndex = index + 1
      if (newTabIndex === -1) {
        await navigateTo(`/nc/${route.params.projectId}`)
      } else {
        await navigateTo(`/nc/${route.params.projectId}/table/${tabs.value?.[newTabIndex]?.title}`)
      }
    }
    tabs.value.splice(index, 1)
  }

  const updateTab = (key: number | Partial<TabItem>, newTabItemProps: Partial<TabItem>) => {
    const tab = typeof key === 'number' ? tabs.value[key] : tabs.value.find(getPredicate(key))
    if (tab) {
      Object.assign(tab, newTabItemProps)
    }
  }

  return { tabs, addTab, activeTabIndex, activeTab, clearTabs, closeTab, updateTab }
}
