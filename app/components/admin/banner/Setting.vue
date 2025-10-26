<script lang="ts" setup>
import type { Banner, BannerWithId } from '~/types/common'
import { useNotifications } from '~/store/notifications'

type GroupType = 'jkt48' | 'hinatazaka46'

interface GroupBanner {
  group: string
  banners: BannerWithId[]
}

const { data, refresh } = await useApiFetch<Record<string, Banner[]>>('/api/banner')

const mappedData = computed(() => {
  const wew = {} as Record<GroupType, GroupBanner>
  for (const key of Object.keys(data.value)) {
    wew[key as GroupType] = {
      group: key,
      banners: data.value[key]?.map(i => ({ ...i, id: 'w' })) ?? [],
    }
  }
  return wew
})
// Only two groups: jkt48 and hinatazaka46
const defaultData = ref<Record<GroupType, GroupBanner>>({
  jkt48: { group: 'jkt48', banners: [] },
  hinatazaka46: { group: 'hinatazaka46', banners: [] },
})

function createDefault(apiData: Record<string, Banner[]>): Record<GroupType, GroupBanner> {
  const data = { ...defaultData.value }
  data.hinatazaka46.banners = toRaw(apiData.hinatazaka46?.map(i => ({ ...i, id: i.url + i.title })) ?? data.hinatazaka46.banners)
  data.jkt48.banners = toRaw(apiData.jkt48?.map(i => ({ ...i, id: i.url + i.title })) ?? data.jkt48.banners)
  return toRaw(data)
}
const groupBanners = ref<Record<GroupType, GroupBanner>>(getDefault())

watch(data, (d) => {
  if (d) {
    const def = getDefault()
    for (const key of Object.keys(d)) {
      console.log('WAe', groupBanners.value[key as GroupType]?.banners)
      console.log('awe', def[key as GroupType].banners)
      for (const banner of def[key as GroupType].banners) {
        const id = groupBanners.value[key as GroupType]?.banners?.find(i => i.img === banner.img && i.title === banner.title && i.url === banner.url)?.id
        if (id) banner.id = id
      }
    }
    groupBanners.value = { ...def }
  }
})

function getDefault() {
  const r = data.value ? Object.keys(data.value).length === 0 ? toRaw(defaultData.value) : createDefault(data.value) : toRaw(defaultData.value)
  return { ...JSON.parse(JSON.stringify(toRaw(r))) } as Record<GroupType, GroupBanner>
}

// New banner form state for each group
const newBanners = ref<Record<GroupType, Banner>>({
  jkt48: { title: '', img: '', url: '' },
  hinatazaka46: { title: '', img: '', url: '' },
})

// Methods
function addBanner(group: GroupType) {
  const newBanner = newBanners.value[group]
  if (newBanner.title && newBanner.img && newBanner.url) {
    groupBanners.value[group].banners.push({ ...newBanner, id: Date.now().toString() })
    newBanner.title = ''
    newBanner.img = ''
    newBanner.url = ''
  }

  groupBanners.value = { ...groupBanners.value }
}

function removeBanner(group: GroupType, index: number) {
  groupBanners.value[group].banners.splice(index, 1)
  groupBanners.value = { ...groupBanners.value }
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true
  if (typeof a !== 'object' || typeof b !== 'object' || a == null || b == null) return false
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)
  if (keysA.length !== keysB.length) return false
  for (const key of keysA) {
    if (!keysB.includes(key)) return false
    if (!deepEqual(a[key], b[key])) return false
  }
  return true
}

const hasChanges = computed(() => {
  Object.values(groupBanners).forEach(g => g.banners?.length) // for let vue know to watch groupBanners
  if (data.value == null || Object.keys(data.value).length === 0) {
    return !deepEqual(toRaw(defaultData.value), toRaw(groupBanners.value))
  }
  return !deepEqual(toRaw(mappedData.value), toRaw(groupBanners.value))
})

function revert() {
  groupBanners.value = getDefault()
}
const notif = useNotifications()

async function update() {
  try {
    await $apiFetch('/api/admin/update_banner', {
      method: 'POST',
      body: JSON.stringify(Object.values(groupBanners.value)),
    })
    notif.addNotif({
      type: 'success',
      message: 'Berhasil mengupdate data!',
    })
    refresh()
  }
  catch (e) {
    console.error(e)
    notif.addNotif({
      type: 'danger',
      message: 'Gagal mengupdate data!',
    })
  }
}

function updateBannerPos(group: GroupType, oldIndex: number, newIndex: number) {
  if (oldIndex === newIndex) return

  const banners = groupBanners.value[group].banners.slice()
  const moved = banners[oldIndex]
  if (moved === undefined) return

  banners.splice(oldIndex, 1)
  banners.splice(newIndex, 0, moved)
  groupBanners.value[group] = {
    ...groupBanners.value[group],
    banners,
  }
  groupBanners.value = { ...groupBanners.value }
}

function updateBanner(group: GroupType, idx: number, banner: BannerWithId) {
  const banners = groupBanners.value[group as GroupType].banners.slice()
  if (idx < 0 || idx >= banners.length) return
  banners[idx] = { ...banner }
  groupBanners.value[group as GroupType] = {
    ...groupBanners.value[group as GroupType],
    banners,
  }
  groupBanners.value = { ...groupBanners.value }
}
</script>

<template>
  <div>
    <div class="flex justify-between">
      <div class="flex items-center gap-2 text-xl mb-5">
        <Icon name="material-symbols:planner-banner-ad-pt" class="text-blue-400" size="1.8rem" />
        <span>Banner Settings</span>
      </div>
      <div class="flex gap-3">
        <button :disabled="!hasChanges" class="self-center bg-blue-500 hover:bg-blue-500/75 disabled:opacity-25 px-4 py-2 rounded-md" @click="update">
          Update
        </button>
        <button :disabled="!hasChanges" class="self-center bg-red-500 hover:bg-red-500/75 disabled:opacity-25 px-4 py-2 rounded-md" @click="revert">
          Revert
        </button>
      </div>
    </div>
    <div
      v-for="group in ['jkt48', 'hinatazaka46']"
      :key="group"
      class="group-block space-y-4"
    >
      <h2 class="text-xl font-semibold" style="text-transform: uppercase;">
        {{ group }}
      </h2>
      <AdminBannerSortable v-if="groupBanners[group as GroupType].banners.length !== 0" :banners="groupBanners[group as GroupType].banners" @update="(idx, b) => updateBanner(group as GroupType, idx, b)" @updatepos="(oi, ni) => updateBannerPos(group as GroupType, oi, ni)" @remove="(idx) => removeBanner(group as GroupType, idx)" />
      <ul v-else class="space-y-4">
        <li class="pb-4 pt-2">
          <em>No banners added.</em>
        </li>
      </ul>
      <div class="flex gap-3">
        <input
          v-model="newBanners[group as GroupType].title"
          type="text"
          class="flex-1 p-3 rounded-md border border-gray-500"
          placeholder="Title"
        >
        <input
          v-model="newBanners[group as GroupType].img"
          type="text"
          class="flex-1 p-3 rounded-md border border-gray-500"
          placeholder="Image URL"
        >
        <input
          v-model="newBanners[group as GroupType].url"
          type="text"
          class="flex-1 p-3 rounded-md border border-gray-500"
          placeholder="Destination URL"
        >
        <button class="bg-blue-500 rounded-md px-4 py-3 hover:bg-blue-500/75 text-gray-200" @click="addBanner(group as GroupType)">
          Add Banner
        </button>
      </div>
      <hr v-if="group === 'jkt48'" style="margin:32px 0;">
    </div>
  </div>
</template>
