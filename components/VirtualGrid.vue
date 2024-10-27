<script setup lang="ts">
import { useVirtualizer, useWindowVirtualizer } from '@tanstack/vue-virtual'
import { computed, onMounted, ref } from 'vue'

interface Column {
  key: string
  name: string
  width: number
}
const parentRef = ref<HTMLElement | null>(null)

const { width: parentWidth } = useElementSize(parentRef)

function generateColumns(count: number) {
  return [...Array.from({ length: count })].map((_, i) => {
    const key: string = i.toString()
    return {
      key,
      name: `Column ${i}`,
      width: parentWidth.value / 4,
    }
  })
}

function generateData(columns: Column[], count = 52) {
  return [...Array.from({ length: count })].map((_, _rowIndex) =>
    columns.reduce<string[]>((acc, _curr, colIndex) => {
      acc.push(`Column ${colIndex}`)

      return acc
    }, []),
  )
}

const columns = generateColumns(4)
const data = generateData(columns)

const parentOffsetRef = ref(0)

onMounted(() => {
  parentOffsetRef.value = parentRef.value?.offsetTop ?? 0
})

const getColumnWidth = () => parentWidth.value / 4
const rowVirtualizerOptions = computed(() => {
  return {
    count: data.length,
    estimateSize: () => getColumnWidth() * 1,
    overscan: 4,
    scrollMargin: parentOffsetRef.value,
  }
})

const rowVirtualizer = useWindowVirtualizer(rowVirtualizerOptions)

const virtualRows = computed(() => rowVirtualizer.value.getVirtualItems())

const totalSize = computed(() => rowVirtualizer.value.getTotalSize())
const columnVirtualizerOptions = computed(() => {
  return {
    horizontal: true,
    count: columns.length,
    getScrollElement: () => parentRef.value,
    estimateSize: getColumnWidth,
    overscan: 5,
  }
})

const columnVirtualizer = useVirtualizer(columnVirtualizerOptions)

const virtualColumns = computed(() => columnVirtualizer.value.getVirtualItems())

const width = computed(() => {
  return [0, getColumnWidth()]
})

function measureElement(el: Element) {
  if (!el) {
    return
  }
  rowVirtualizer.value.measureElement(el)
  return undefined
}
</script>

<template>
  <div ref="parentRef" style="overflow-y: auto; border: 1px solid #c8c8c8">
    <div
      :style="{
        height: `${totalSize}px`,
        position: 'relative',
      }"
    >
      <template v-for="virtualRow in virtualRows" :key="virtualRow.key">
        <div
          :ref="measureElement"
          :data-index="virtualRow.index"
          :style="{
            position: 'absolute',
            top: 0,
            left: 0,
            transform: `translateY(${
              virtualRow.start - rowVirtualizer.options.scrollMargin
            }px)`,
            display: 'flex',
          }"
        >
          <div :style="{ width: `${width[0]}px` }" />
          <div
            v-for="virtualColumn in virtualColumns"
            :key="virtualColumn.key as any"
            :style="{
              minHeight: virtualRow.size,
              width: `${getColumnWidth()}px`,
            }"
          >
            <div class="bg-blue-500 aspect-[5/4]">
              {{ data[virtualRow.index][virtualColumn.index] }}
            </div>
          </div>
          <div :style="{ width: `${width[1]}px` }" />
        </div>
      </template>
    </div>
  </div>
</template>
