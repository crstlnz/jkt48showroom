<script lang="ts" setup>
// import { useFuse } from '@vueuse/integrations/useFuse'
import c from '~/app.config'
import { useSelectedUser } from '~/store/selectedUser'

const props = defineProps<{
  gifts: RecentUserGifts[]
  giftRate: number
  pageMode?: boolean
  dataId: string
  giftList: LogDetail.IDNGift[] | LogDetail.ShowroomGift[]
  hasNextPage: boolean
  type: LogType
}>()

const search = ref('')
const giftList = computed<Map<string, LogDetail.BaseGift>>(() => {
  const gifts = new Map<string, LogDetail.BaseGift>()
  if (!props.giftList) return gifts
  const g = props.giftList
  for (const gift of g) {
    gifts.set(String(gift.id), {
      id: gift.id,
      name: gift.name,
      free: gift.free,
      point: gift.point,
      img: props.type === 'showroom' ? c.giftUrl(gift?.id ?? 0) : gift.img,
    })
  }
  return gifts
})
const giftData = ref(props.gifts)

const { userClick } = useSelectedUser()
const { height } = useWindowSize()
const bufferSize = computed(() => {
  return height.value
})

const searchEl = ref()
const isEnded = ref(!(props.hasNextPage ?? true))
const pending = ref(false)
const error = ref(false)
const page = ref(1)
useInfiniteScroll(
  () => {
    if (isEnded.value) return
    if (!pending.value) getPage(page.value + 1, search.value)
  },
  { distance: 120 },
)

const lastQuery = ref('')
async function getPage(p = 1, search = '') {
  pending.value = true
  page.value = p
  await sleep(500)
  try {
    const data = await $apiFetch<IApiShowroomGift | IApiIDNGift>(`/api/recent/${props.dataId}/gifts`, { params: { page: p, s: search } })
    if (lastQuery.value !== search) return
    if (!data.gifts.length) {
      isEnded.value = true
    }
    else {
      if (data.gifts.length < data.perpage) {
        isEnded.value = true
      }
      const mappedGifts = data.gifts.map<RecentUserGifts>((i) => {
        const user = data.users.find(item => item.id === i.user_id)
        const giftMap = new Map<string, RecentGift>()
        for (const gift of i.gifts) {
          if (giftMap.has(String(gift.id))) {
            const g = giftMap.get(String(gift.id))
            if (g) g.num += gift.num
          }
          else {
            const g = giftList.value.get(String(gift.id))
            if (!g) continue
            giftMap.set(String(gift.id), {
              num: gift.num,
              id: String(g.id),
              name: g.name,
              free: g.free,
              point: g.point,
              img: g.img,
              date: gift.date,
            })
          }
        }
        if (props.type === 'showroom') {
          const userData = user as LogDetail.ShowroomUser
          return {
            name: userData?.name ?? 'User not Found!',
            id: userData?.id ?? i.user_id ?? (Math.floor(Math.random() * 500) + Math.floor(Math.random() * 10) + 1),
            avatar: c.avatarURL(userData?.avatar_id ?? 1),
            avatar_id: userData?.avatar_id ?? 1,
            total: i.total,
            gifts: Array.from(giftMap.values()).sort((a, b) => b.point - a.point),
          }
        }
        else {
          const userData = user as LogDetail.IDNUser
          return {
            name: userData?.name ?? 'User not Found!',
            id: userData?.id ?? i.user_id ?? (Math.floor(Math.random() * 500) + Math.floor(Math.random() * 10) + 1),
            avatar: userData?.avatar_url,
            total: i.total,
            gifts: Array.from(giftMap.values()).sort((a, b) => b.point - a.point),
          }
        }
      })

      giftData.value.push(...mappedGifts)
    }
    pending.value = false
  }
  catch {
    error.value = true
    pending.value = false
  }
}

const { start } = useTimeoutFn(() => {
  if (search.value != null && lastQuery.value !== search.value) {
    giftData.value = []
    lastQuery.value = search.value
    isEnded.value = false
    getPage(1, search.value)
  }
}, 500)

watch(search, () => {
  start()
})
</script>

<template>
  <DynamicScroller
    :class="{ 'border dark:border-none rounded-xl border-color-1 roundedscrollbar h-full w-full': pageMode !== null || pageMode !== false }"
    :min-item-size="164"
    :items="giftData"
    key-field="id"
    :buffer="bufferSize"
    :page-mode="pageMode"
    class="z-0"
  >
    <template #before>
      <div
        class="-z-10 rounded-t-xl border-b border-color-1 bg-white/90 p-3 font-bold backdrop-blur-xs dark:bg-dark-1/90 md:p-4"
      >
        <div class="flex items-center">
          <div class="flex-1 text-lg xl:text-xl">
            {{ $t("fansgift") }}
          </div>
          <div class="pointer-events-none inset-x-0 mx-3 max-sm:absolute">
            <div class="pointer-events-auto float-right flex items-center rounded-2xl bg-slate-100 p-1.5 text-sm ring-blue-500 focus-within:ring-2 dark:bg-dark-2 max-sm:focus-within:w-full max-sm:focus-within:pl-3" :class="{ 'pl-3 max-sm:w-full': search.length !== 0 }">
              <input id="search_shortcut" ref="searchEl" v-model="search" class="flex-1 truncate bg-transparent outline-hidden focus-visible:outline-hidden! max-sm:w-0 sm:ml-3" placeholder="Search...">
              <button v-if="search.length === 0" aria-label="Search" class="group flex h-7 w-7 items-center justify-center rounded-xl p-1 sm:hover:bg-blue-500" @click="searchEl?.focus()">
                <Icon name="uil:search" class="h-full w-full text-slate-800  dark:text-white/50 dark:group-hover:text-white" />
              </button>
              <button v-else aria-label="Close" class="group flex h-7 w-7 items-center justify-center rounded-xl p-1 sm:hover:bg-blue-500" @click="search = ''">
                <Icon name="ic:round-close" class="h-full w-full text-neutral-400/80 group-hover:text-black/80 dark:text-slate-100 dark:group-hover:text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #default="{ item, index, active }">
      <DynamicScrollerItem :key="item.id" :item="item" :active="active" :size-dependencies="[item.gifts]" :data-index="index">
        <div class="space-y-2 border-b border-color-1 p-3 md:p-4">
          <button type="button" class="truncate text-base xl:text-lg font-bold" :title="item.name" @click="(e) => userClick(e, item.id, type)">
            {{ item.name }}
          </button>
          <div class="flex gap-2.5 md:gap-3.5 items-start">
            <button type="button" class="user-btn" :aria-label="`${item.name} profile`" @click="(e) => userClick(e, item.id, type)">
              <img
                :key="item.id"
                class="h-[70px] w-[70px] rounded-lg bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-100/5 dark:hover:bg-slate-300/10 lg:h-20 lg:w-20"
                :src="item.type === 'showroom' ? $giftUrl(item.avatar_id) : (item.avatar || $defaultIDNProfilePicture)"
                :alt="`${item.name} Avatar`"
              >
            </button>
            <div class="min-w-0 flex-1">
              <div :key="item.id" class="flex flex-wrap gap-2 pb-2 md:gap-2.5">
                <div v-for="gift in item.gifts" :key="item.id + gift.id" v-tooltip="$currency(gift.point)" class="relative">
                  <div :class="{ 'max-h-[45px] max-w-[45px]': type === 'showroom', 'max-h-[54px] max-w-[54px]': type === 'idn' }">
                    <img :key="`${item.id}${gift.id}`" :src="gift.img" alt="Gift" class="aspect-square">
                    <div
                      v-if="gift.num > 1"
                      :class="getNumColor(gift.num)"
                      class="text-stroke absolute -bottom-2.5 right-0 rounded-full text-right text-sm font-extrabold leading-6"
                    >
                      x{{ gift.num >= 1000 ? `${(gift.num / 1000).toFixed(0)}k` : gift.num }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="text-right text-base font-semibold">
            <ParserGift :rate="giftRate" :show-original="true" :value="item.total" />
          </div>
        </div>
      </DynamicScrollerItem>
    </template>

    <template #after>
      <div v-if="!isEnded" class="flex items-center justify-center p-10 md:p-14">
        <Icon name="svg-spinners:ring-resize" size="2.7rem" />
      </div>
    </template>

    <template v-if="!giftData.length && !pending" #empty>
      <div class="flex aspect-14/8 items-center justify-center px-6 pt-6 pb-8 ">
        <div class="flex flex-col">
          <NuxtImg class="mx-auto h-auto w-[300px] max-w-[80%]" :alt="$t('giftempty')" :src="`${$cloudinaryURL}/assets/img/web/empty-box.png`" />
          <div class="mt-3 text-center font-bold">
            {{ search != null && search !== '' ? `${$t("noresult")} "${search}"` : $t("giftempty") }}
          </div>
        </div>
      </div>
    </template>
  </DynamicScroller>
</template>
