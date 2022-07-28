<script setup lang="ts">
import { inject } from '#imports'
import useDeleteTable from '~/composables/useDeleteTable'
import { MetaInj } from '~/context'
import MdiDeleteIcon from '~icons/mdi/delete-outline'

const meta = inject(MetaInj)

const { deleteTable } = useDeleteTable()
</script>

<template>
  <MdiDeleteIcon class="text-grey min-w-4 cursor-pointer" @click="deleteTable(meta)" />
</template>

<style scoped></style>
