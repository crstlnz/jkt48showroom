<script lang="ts" setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue'
import { useMembers } from '~/store/members'
import { useNotifications } from '~/store/notifications'
import { useSettings } from '~/store/settings'
import { decodeSorterResult, encodeSorterResult, getSorterMemberId, getSorterOwnerToken, hydrateSorterResult, sanitizeSorterOwnerToken, sanitizeSorterShareName, toSortMember } from '~/utils/sorterResult'

definePageMeta({
  layout: 'sorter',
})

const { addNotif } = useNotifications()
const { t } = useI18n()
const settings = useSettings()
const route = useRoute()
const result = useSessionStorage<(ISortMember | ISortMember[])[]>('sorter-result', [])
const filterList = useSessionStorage<string[]>('sorter-filterlist', [])
const storedShareName = useLocalStorage('sorter-share-name', '')
const membersStore = useMembers()
const { members } = storeToRefs(membersStore)
const { stop, undo: u, setState, GameState } = useMemberSorter()
const legacyRouteShareName = computed(() => {
  const value = route.query.n
  if (Array.isArray(value)) return sanitizeSorterShareName(value[0] ?? '')
  return sanitizeSorterShareName(typeof value === 'string' ? value : '')
})
const savedShareName = computed(() => sanitizeSorterShareName(storedShareName.value))
const decodedShareName = ref('')
const decodedOwnerToken = ref('')
const currentOwnerToken = ref('')
const pageShareName = computed(() => decodedShareName.value || legacyRouteShareName.value || savedShareName.value)
const pageHeadingPrefix = computed(() => t('sorter.title'))
const browserTitle = computed(() => {
  return pageShareName.value
    ? t('sorter.title_with_name', { name: pageShareName.value })
    : t('sorter.title')
})
const pageHeading = computed(() => pageShareName.value || t('sorter.share_result_title'))
const legacyRouteOwnerToken = computed(() => {
  const value = route.query.o
  if (Array.isArray(value)) return sanitizeSorterOwnerToken(value[0] ?? '')
  return sanitizeSorterOwnerToken(typeof value === 'string' ? value : '')
})
const shareUrl = computed(() => {
  if (!import.meta.client) return settings.currentURL.value

  const url = new URL(window.location.href)
  const encoded = encodeSorterResult(result.value, {
    ownerToken: currentOwnerToken.value || decodedOwnerToken.value,
    shareName: savedShareName.value || decodedShareName.value,
  })

  if (encoded) {
    url.searchParams.set('r', encoded)
  }
  url.searchParams.delete('o')
  url.searchParams.delete('n')
  return url.toString()
})
const isCopied = ref(false)
const showShareNameDialog = ref(false)
const shareNameDraft = ref('')
const shareDialogMode = ref<'share' | 'edit'>('share')
let copiedTimer: ReturnType<typeof setTimeout> | null = null

const routeResultToken = computed(() => {
  const value = route.query.r
  if (Array.isArray(value)) return value[0] ?? ''
  return typeof value === 'string' ? value : ''
})
const isOwner = computed(() => {
  const ownerToken = decodedOwnerToken.value || legacyRouteOwnerToken.value
  return !!ownerToken && !!currentOwnerToken.value && ownerToken === currentOwnerToken.value
})

const memberMap = computed(() => {
  const map = new Map<string, ISortMember>()

  for (const rawMember of members.value ?? []) {
    const member = rawMember as IMember & { _id: string, jkt48_id?: string | number }
    const sortMember = toSortMember(member)
    map.set(getSorterMemberId(member), sortMember)
    map.set(member._id, sortMember)
  }

  return map
})

useHead({
  title: browserTitle,
})

watch(routeResultToken, async (token) => {
  if (!token) {
    if (!result.value.length) {
      navigateTo('/sorter')
      return
    }

    setState(GameState.FINISHED)
    const owner = await getSorterOwnerToken()
    currentOwnerToken.value = owner
    navigateTo({
      path: route.path,
      query: {
        ...route.query,
        r: encodeSorterResult(result.value, {
          ownerToken: owner,
          shareName: savedShareName.value,
        }),
        o: undefined,
        n: undefined,
      },
    }, { replace: true })
    return
  }

  const decoded = decodeSorterResult(token)
  if (!decoded) {
    navigateTo('/sorter')
    return
  }

  await membersStore.tryRefresh()
  if (!members.value?.length) {
    await membersStore.load()
  }

  decodedShareName.value = decoded.shareName || legacyRouteShareName.value
  decodedOwnerToken.value = decoded.ownerToken || legacyRouteOwnerToken.value

  const hydrated = hydrateSorterResult(decoded.ranks, memberMap.value)
  if (!hydrated.length) {
    navigateTo('/sorter')
    return
  }

  result.value = hydrated
  setState(GameState.FINISHED)
}, { immediate: true })

onMounted(async () => {
  currentOwnerToken.value = await getSorterOwnerToken()
})

function undo() {
  u()
  navigateTo('/sorter')
}

function restart() {
  stop()
  filterList.value = []
  navigateTo('/sorter')
}

function onShareNameInput(event: Event) {
  shareNameDraft.value = sanitizeSorterShareName((event.target as HTMLInputElement).value)
}

async function copyShareLink() {
  if (!import.meta.client) return false

  try {
    await navigator.clipboard.writeText(shareUrl.value)
    return true
  }
  catch {
    const textarea = document.createElement('textarea')
    textarea.value = shareUrl.value
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'absolute'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.select()

    try {
      document.execCommand('copy')
      return true
    }
    catch {
      addNotif({ type: 'danger', message: t('sorter.share_copy_failed'), duration: 2200 })
      return false
    }
    finally {
      document.body.removeChild(textarea)
    }
  }
}

async function shareResult() {
  if (!isOwner.value) return

  if (!savedShareName.value) {
    openShareNameDialog('share')
    return
  }

  const copied = await copyShareLink()
  if (!copied) return

  isCopied.value = true
  if (copiedTimer) {
    clearTimeout(copiedTimer)
  }
  copiedTimer = setTimeout(() => {
    isCopied.value = false
    copiedTimer = null
  }, 1600)
}

function openShareNameDialog(mode: 'share' | 'edit') {
  if (!isOwner.value) return
  shareDialogMode.value = mode
  shareNameDraft.value = savedShareName.value
  showShareNameDialog.value = true
}

async function saveShareName() {
  if (!isOwner.value) return

  const sanitized = sanitizeSorterShareName(shareNameDraft.value)
  if (!sanitized) {
    addNotif({ type: 'danger', message: t('sorter.share_name_required'), duration: 2000 })
    return
  }

  storedShareName.value = sanitized
  shareNameDraft.value = sanitized
  showShareNameDialog.value = false

  if (routeResultToken.value) {
    await navigateTo({
      path: route.path,
      query: {
        ...route.query,
        r: encodeSorterResult(result.value, {
          ownerToken: currentOwnerToken.value || decodedOwnerToken.value || legacyRouteOwnerToken.value,
          shareName: sanitized,
        }),
        o: undefined,
        n: undefined,
      },
    }, { replace: true })
  }

  if (shareDialogMode.value === 'share') {
    await nextTick()
    await shareResult()
  }
}

onBeforeUnmount(() => {
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>

<template>
  <div class="container mx-auto flex flex-col gap-2 md:gap-3">
    <div class="mx-auto mt-3 flex w-3xl max-w-full px-3 justify-between md:mt-6 gap-2">
      <div class="min-w-0 flex items-start gap-2">
        <div class="min-w-0">
          <div class="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] opacity-45 leading-4">
            {{ pageHeadingPrefix }}
          </div>
          <div class="text-2xl font-bold opacity-80 leading-7 wrap-break-word">
            {{ pageHeading }}
          </div>
        </div>
        <div class="h-7 mt-5 flex items-center">
          <button
            v-if="isOwner"
            type="button"
            class="flex size-6 shrink-0 items-center justify-center rounded-full bg-container border border-color-2 transition hover:bg-hover"
            :aria-label="$t('sorter.share_name_edit_title')"
            @click="openShareNameDialog('edit')"
          >
            <Icon name="ph:pencil-simple-bold" class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div class="flex gap-1 md:gap-3 mt-5 h-7 items-center">
        <Button
          v-if="isOwner"
          class="rounded-xl flex items-center bg-emerald-500 px-2 h-7 text-white/90 transition-colors duration-250 text-sm md:px-3"
          :class="isCopied ? 'bg-emerald-600 shadow-md' : 'bg-emerald-500'"
          :aria-label="$t('sorter.share')"
          @click="shareResult"
        >
          <span class="flex h-5 items-center justify-center gap-1.5">
            <Icon
              :name="isCopied ? 'ph:check-bold' : 'ph:copy-bold'"
              class="h-4 w-4 transition-transform duration-200"
              :class="isCopied ? 'scale-110' : ''"
            />
            <span class="hidden sm:inline">{{ $t('sorter.share') }}</span>
          </span>
        </Button>
        <Button
          class="rounded-xl flex items-center bg-blue-500 px-2 h-7 text-white/90 text-sm md:px-3"
          :aria-label="$t('sorter.undo')"
          @click="undo"
        >
          <span class="flex h-5 items-center justify-center gap-1.5">
            <Icon name="ph:arrow-counter-clockwise-bold" class="h-4 w-4" />
            <span class="hidden sm:inline">{{ $t('sorter.undo') }}</span>
          </span>
        </Button>
        <Button
          class="rounded-xl flex items-center bg-red-500 px-2 h-7 text-white/90 text-sm md:px-3"
          :aria-label="$t('sorter.restart')"
          @click="restart"
        >
          <span class="flex h-5 items-center justify-center gap-1.5">
            <Icon name="ph:arrow-clockwise-bold" class="h-4 w-4" />
            <span class="hidden sm:inline">{{ $t('sorter.restart') }}</span>
          </span>
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
    <TransitionRoot appear :show="showShareNameDialog" as="template">
      <Dialog as="div" class="relative z-notification" @close="showShareNameDialog = false">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0"
          enter-to="opacity-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100"
          leave-to="opacity-0"
        >
          <div class="fixed inset-0 bg-black/40" />
        </TransitionChild>

        <div class="fixed inset-0 overflow-y-auto w-screen">
          <div class="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-100 ease-out"
              enter-from="opacity-0 scale-75"
              enter-to="opacity-100 scale-100"
              leave="duration-100 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-75"
            >
              <DialogPanel class="bg-container w-full max-w-sm transform overflow-hidden rounded-2xl border border-color-2 p-4 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" class="text-lg font-bold">
                  {{ savedShareName ? $t('sorter.share_name_edit_title') : $t('sorter.share_name_title') }}
                </DialogTitle>
                <input
                  :value="shareNameDraft"
                  type="text"
                  inputmode="text"
                  maxlength="40"
                  :placeholder="$t('sorter.share_name_placeholder')"
                  class="mt-4 bg-container-2 w-full rounded-xl border border-color-2 px-3 py-2.5 outline-none ring-0 transition focus:border-blue-500"
                  @input="onShareNameInput"
                >
                <div class="mt-4 flex gap-2">
                  <button
                    type="button"
                    class="flex-1 rounded-xl bg-hover px-3 py-2 text-sm font-semibold"
                    @click="showShareNameDialog = false"
                  >
                    {{ $t('sorter.share_cancel') }}
                  </button>
                  <button
                    type="button"
                    class="flex-1 rounded-xl bg-blue-500 px-3 py-2 text-sm font-semibold text-white"
                    @click="saveShareName"
                  >
                    {{ shareDialogMode === 'share' ? $t('sorter.share_save_and_share') : $t('sorter.share_save') }}
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>
