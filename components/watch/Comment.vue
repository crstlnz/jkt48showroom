<script lang="ts" setup>
defineProps<{ comments: Watch.Comment[], delayedComments: Watch.Comment[], data?: Watch.WatchData | null | undefined, isLive: boolean }>()
const emit = defineEmits<{ (e: 'createComment', comment: string): void, (e: 'appendDelayedComments'): void, (e: 'setAutoAppend', value: boolean): void }>()
const pageMode = false
const dynamicScroller = ref<ComponentPublicInstance<HTMLElement> | null>(null)

const lastScroll = ref(0)

const showNewCommentButton = ref(true)

useEventListener(dynamicScroller, 'scroll', (evt) => {
  if (!evt.isTrusted) return

  const scrollPos = dynamicScroller.value?.$el?.scrollTop
  if (lastScroll.value === scrollPos) return
  if (lastScroll.value > scrollPos) {
    showNewCommentButton.value = true
  }
  else {
    emit('setAutoAppend', false)
  }
  lastScroll.value = scrollPos
})

function appendDelayedComments() {
  dynamicScroller.value?.$el?.scrollTo({ top: 0 })
  emit('appendDelayedComments')
}

const { isMobile, greaterOrEqual } = useResponsive()
const isSmall = greaterOrEqual('sm')
const navRect = useState<DOMRect | null>('navRect', () => null)
const showCommentForm = useLocalStorage('show_comment_form', true)
</script>

<template>
  <div class="flex flex-col">
    <DynamicScroller
      id="scroller"
      ref="dynamicScroller"
      class="z-0 h-0 w-full flex-1"
      :class="{ roundedscrollbar: pageMode !== null || pageMode !== false }"
      :min-item-size="82"
      :prerender="15"
      :items="comments"
      key-field="id"
      :buffer="600"
      :page-mode="pageMode"
    >
      <template #before>
        <div>
          <div
            class="-z-10 border-b-2 border-slate-100/60 bg-white/90 p-3 text-xl font-bold backdrop-blur-sm dark:border-dark-2/60 dark:bg-dark-1/90 md:p-5"
          >
            <div class="flex items-center gap-2" size="1.4rem">
              <Icon name="iconamoon:comment-dots-fill" />
              <span>
                {{ $t("comment") }}
              </span>
            </div>
          </div>
          <Transition :duration="500" name="height-shrink">
            <button v-if="showNewCommentButton && delayedComments.length" class="absolute h-[28px] w-full overflow-hidden bg-blue-500 px-3 text-center text-sm text-slate-100 md:h-[32px] md:text-base" @click="appendDelayedComments">
              {{ `${delayedComments.length} ${$t("newcomment", delayedComments.length)}` }}
            </button>
          </Transition>
        </div>
      </template>

      <template #default="{ item, index, active }">
        <DynamicScrollerItem :item="item" :active="active" :size-dependencies="[item.comment]" :data-index="index">
          <div :key="item.id" class="space-y-2 border-b-2 border-slate-100/60 p-3 dark:border-dark-2/60 md:p-4">
            <div class="flex gap-3 md:gap-3.5">
              <a :href="$fansProfileURL(item.user_id)" target="_blank" class="inline-block h-11 w-11 md:h-14 md:w-14">
                <img
                  :key="item.avatar_id"
                  class="h-full w-full rounded-lg md:bg-slate-100/90 md:p-1.5 md:hover:bg-slate-200 md:dark:bg-slate-100/5 md:hover:dark:bg-slate-300/10"
                  :src="$avatarURL(item.avatar_id)"
                  :alt="`${item.name} Avatar`"
                >
              </a>
              <div class="justify-betwee flex min-w-0 flex-1 flex-col gap-2 md:gap-3">
                <div class="truncate text-sm font-semibold text-green-500 md:text-base" :title="item.name">
                  {{ item.name }}
                </div>
                <div class="w-full text-xs text-slate-600 dark:text-slate-400 md:text-sm">
                  {{ item.comment }}
                </div>
              </div>
            </div>
          </div>
        </DynamicScrollerItem>
      </template>

      <template v-if="!comments.length" #empty>
        <div class="flex aspect-[9/8] items-center justify-center">
          <div class="flex flex-col">
            <NuxtImg class="mx-auto h-auto w-[300px] max-w-[70%] max-lg:hidden" :alt="$t('commentempty')" :src="`${$cloudinaryURL}/assets/img/web/empty-box.png`" />
            <div class="mt-3 text-center font-bold">
              {{ $t("commentempty") }}
            </div>
          </div>
        </div>
      </template>
    </DynamicScroller>

    <WatchCommentForm
      :live-id="data?.live_id"
      :is-live="isLive"
      :room-id="data?.room_id" :class="{ 'bottom-[60px]': isMobile || !isSmall, ' dark:!border-dark-2': isMobile || isSmall, 'bottom-[0px] border-slate-100/60 dark:border-dark-2/60': !isMobile || !isSmall, 'translate-y-full': (isMobile || !isSmall) && !showCommentForm }"
      :style="{ left: `${navRect?.width || 0}px`, right: 0 }"
      class="z-10 flex gap-3 border-b-2 border-t-4 bg-white/90 p-2 font-bold backdrop-blur-sm transition-transform duration-300 dark:bg-dark-1/90 max-lg:fixed md:p-3"
      @comment="(comment) => $emit('createComment', comment)"
    >
      <button v-if="isMobile || !isSmall" type="button" class="bg-container fixed bottom-full right-2 rounded-t-md border-x-2 border-t-2 px-2.5 dark:border-dark-2" @click="showCommentForm = !showCommentForm">
        <Icon name="ic:round-keyboard-arrow-down" size="1.5rem" :class="{ 'rotate-180': !showCommentForm }" class="transition-transform duration-300" />
      </button>
    </WatchCommentForm>
  </div>
</template>
