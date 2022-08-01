import type { MaybeRef } from '@vueuse/core'
import { computed, effectScope, tryOnScopeDispose, unref, watch, watchEffect } from '#build/imports'
import { useNuxtApp } from '#app'
import { theme } from '~/utils'

export function useColors(darkMode?: MaybeRef<boolean>) {
  const scope = effectScope()

  let mode = $ref(unref(darkMode))
  const { $state } = useNuxtApp()

  if (typeof mode === 'undefined') mode = $state.darkMode.value

  scope.run(() => {
    watch($state.darkMode, (newMode) => {
      if (typeof mode === 'undefined') mode = newMode
    })

    watchEffect(() => {
      const newMode = unref(darkMode)
      if (newMode) mode = newMode
    })
  })

  tryOnScopeDispose(() => scope.stop())

  const colors = computed(() => (mode ? theme.dark : theme.light))

  return { colors, getColorByIndex: (i: number) => colors.value[i % colors.value.length] }
}
