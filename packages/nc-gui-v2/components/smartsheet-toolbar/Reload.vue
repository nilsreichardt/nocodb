<script setup lang="ts">
import { ReloadViewDataHookInj } from '~/context'
import MdiReloadIcon from '~icons/mdi/reload'
const reloadTri = inject(ReloadViewDataHookInj)
</script>

<template>
  <MdiReloadIcon class="text-grey min-w-4 cursor-pointer" @click="reloadTri.trigger()" />
</template>

<style scoped></style>
