<script lang="ts" setup>
import html2canvas from 'html2canvas-pro'
import { useNotifications } from '~/store/notifications'

definePageMeta({
  layout: 'sorter',
})

const { addNotif } = useNotifications()
const { t } = useI18n()
const result = useSessionStorage<(ISortMember | ISortMember[])[]>('sorter-result', [])
const filterList = useSessionStorage<string[]>('sorter-filterlist', [])
watch(result, (r) => {
  if (!r.length) {
    navigateTo('/sorter')
  }
}, { immediate: true })

const { stop, undo: u } = useMemberSorter()
function undo() {
  u()
  navigateTo('/sorter')
}

const isDownloading = ref(false)
const shareTarget = ref<HTMLElement | null>(null)

const rankedMembers = computed(() => {
  const ranked: { rank: number, member: ISortMember }[] = []
  for (const [index, item] of result.value.entries()) {
    if (Array.isArray(item)) {
      for (const member of item) {
        ranked.push({ rank: index + 1, member })
      }
    }
    else {
      ranked.push({ rank: index + 1, member: item })
    }
  }
  return ranked
})

async function downloadShareImage() {
  if (isDownloading.value) return
  if (!shareTarget.value) return

  isDownloading.value = true
  try {
    await nextTick()
    const canvas = await html2canvas(document.body, {
      scale: Math.min(window.devicePixelRatio || 1, 2),
      imageSmoothing: true,
      imageSmoothingQuality: 'high',
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#0f172a',
      logging: false,
    })

    const link = document.createElement('a')
    link.download = `oshi-sorter-result-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
    addNotif({ type: 'success', message: t('sorter.share_download_success'), duration: 2000 })
  }
  catch (e) {
    console.error(e)
    addNotif({ type: 'danger', message: t('sorter.share_download_failed'), duration: 2500 })
  }
  finally {
    isDownloading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto flex flex-col gap-2 md:gap-3">
    <div class="mx-auto mt-3 flex w-3xl max-w-full px-3 justify-between md:mt-6">
      <div class="text-2xl font-bold opacity-80">
        {{ $t('sorter.title') }}
      </div>
      <div class="flex gap-3">
        <Button class="rounded-xl bg-blue-500 px-3 text-white/90" @click="undo">
          {{ $t('sorter.undo') }}
        </Button>
        <Button class="rounded-xl bg-red-500 px-3 text-white/90" @click="stop">
          {{ $t('sorter.restart') }}
        </Button>
      </div>
    </div>
    <div class="mx-auto w-5xl max-w-full rounded-xl">
      <div class="mx-auto max-w-3xl px-3 md:px-2">
        <div class="flex flex-wrap gap-2 md:gap-3 pb-1.5">
          <div v-for="filter in filterList" :key="filter" class="rounded-xl bg-blue-400/25 px-2 py-1 text-xs dark:bg-blue-400/10 md:text-sm">
            {{ filter }}
          </div>
        </div>
      </div>
      <SorterResult class="mx-auto mt-2 w-5xl max-w-full md:mt-5 px-3" :result="result" />
    </div>
  </div>
</template>
