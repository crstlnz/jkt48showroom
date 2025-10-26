<script lang="ts" setup>
import type { BannerWithId } from '~/types/common'
import { useSortable } from '@vueuse/integrations/useSortable'

const props = defineProps<{ banners: BannerWithId[] }>()

const emit = defineEmits<{ (e: 'remove', idx: number): void, (e: 'updatepos', oldIndex: number, newIndex: number): void, (e: 'update', idx: number, banner: BannerWithId): void }>()

const el = useTemplateRef<HTMLElement>('el')

useSortable(el, props.banners, {
  animation: 250,
  onUpdate: (e: any) => {
    emit('updatepos', e.oldIndex, e.newIndex)
  },
})
</script>

<template>
  <ul ref="el" class="space-y-3">
    <TransitionGroup name="list">
      <li
        v-for="(banner, idx) in banners"
        :id="banner.id"
        :key="banner.id"
        class="relative"
      >
        <AdminBannerCard :banner="banner" @update="(b) => $emit('update', idx, b)" @remove="$emit('remove', idx)" />
      </li>
    </TransitionGroup>
  </ul>
</template>
