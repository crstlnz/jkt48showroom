<script lang="ts" setup>
import { RecycleScroller } from 'vue-virtual-scroller'

const props = defineProps<{
  idnData: IDNLivesDetail
}>()
const emit = defineEmits<{ (e: 'createComment', comment: string): void, (e: 'appendDelayedComments'): void, (e: 'setAutoAppend', value: boolean): void }>()
const { comments, delayedComments, onComment, setAutoAppend, autoAppend } = useIDNComment(props.idnData.chat_room_id ?? '')
const dynamicScroller = ref<any | null>(null)

const lastScroll = ref(0)

onComment((comment) => {
  console.log(comment.user.name, ':', comment.chat.message)
  nextTick(() => {
    dynamicScroller.value?.scrollToItem(comments.value.length - 1)
  })
})

onMounted(() => {
  nextTick(() => {
    dynamicScroller.value?.scrollToItem(comments.value.length - 1)
  })
})

const showNewCommentButton = ref(true)

useEventListener(dynamicScroller, 'scroll', (evt) => {
  if (!evt.isTrusted) return

  const scrollPos = dynamicScroller.value?.$el?.scrollTop
  if (lastScroll.value === scrollPos) return
  if (lastScroll.value < scrollPos) {
    showNewCommentButton.value = true
  }
  else {
    setAutoAppend(false)
  }
  lastScroll.value = scrollPos
})

const { isMobile, greaterOrEqual } = useResponsive()
const isSmall = greaterOrEqual('sm')
const navRect = useState<DOMRect | null>('navRect', () => null)
const showCommentForm = useLocalStorage('show_comment_form', true)

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

const height = computed(() => {
  return 64
})
</script>

<template>
  <div class="flex flex-col relative">
    <Transition :duration="500" name="height-shrink">
      <button
        v-if="showNewCommentButton && delayedComments.length"
        class="flex gap-1 z-10 items-center absolute h-[38px] left-1/2 -translate-x-1/2 rounded-xl bottom-5 drop-shadow-md overflow-hidden bg-blue-500 px-4 text-center text-sm text-slate-100  md:text-base"
        @click="() => setAutoAppend(true)"
      >
        {{
          `${delayedComments.length} ${$t(
            'newcomment',
            delayedComments.length,
          )}`
        }}
        <Icon name="material-symbols:fitbit-arrow-downward-rounded" class="size-6" />
      </button>
    </Transition>
    <div class="flex-1 flex-col absolute inset-0 overflow-y-auto roundedscrollbar">
      <DynamicScroller
        ref="dynamicScroller"
        class="z-0 size-full hiddenscrollbar flex flex-col relative overflow-y-auto pb-5"
        :prerender="15"
        :items="comments"
        :min-item-size="62"
        key-field="id"
        :buffer="600"
      >
        <template #default="{ item, index, active }">
          <DynamicScrollerItem
            :item="item"
            :active="active"
            :size-dependencies="[item.comment]"
            :data-index="index"
          >
            <div :key="item.id" class="py-1.5 mx-5">
              <div class="flex gap-1">
                <div class="justify-between flex min-w-0 flex-1 flex-col">
                  <div class="truncate text-lg font-bold text-green-500" :title="item.name" :style="{ color: item.user?.color_code }">
                    {{ item.user?.name }}
                  </div>
                  <div class="w-full text-base text-white">
                    {{ item.chat?.message }}
                  </div>
                </div>
              </div>
            </div>
          </DynamicScrollerItem>
        </template>
      </DynamicScroller>
    </div>

    <!-- <div v-if="pinnedMessage" class="bg-black/60 p-2 rounded-md flex gap-2 mx-3 items-center">
      <img :src="pinnedMessage.user?.avatar || pinnedMessage?.user?.avatar_url || $errorPicture" class="w-8 h-8 rounded-full">
      <div>
        <div class="text-sm flex gap-2 font-semibold items-center">
          <span>{{ pinnedMessage.user?.name }}</span>
          <span class="text-orange-500 text-xs">Chat dipin</span>
        </div>
        <div class="text-xs">
          {{ pinnedMessage.pinned_message }}
        </div>
      </div>
    </div>
    -->

    <!-- <WatchCommentForm
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
    </WatchCommentForm> -->
  </div>
</template>

<style lang="scss">
.gradient-shadow {
  background-image: linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.35), rgba(0,0,0,0.4), rgba(0,0,0,0.45), rgba(0,0,0,0.55));
}

.gradient-top{
  mask-image: -webkit-linear-gradient(top,rgba(0,0,0,0),rgba(0,0,0,1), rgba(0,0,0,1),rgba(0,0,0,1),rgba(0,0,0,1), rgba(0,0,0,1), rgba(0,0,0,1),rgba(0,0,0,1),rgba(0,0,0,1));
  -webkit-mask-image: -webkit-linear-gradient(top,rgba(0,0,0,0),rgba(0,0,0,1), rgba(0,0,0,1),rgba(0,0,0,1),rgba(0,0,0,1), rgba(0,0,0,1), rgba(0,0,0,1),rgba(0,0,0,1),rgba(0,0,0,1));
}

@keyframes slide-left {
  from {transform: translateX(0);}
  to {transform: translateX(-50%);}
}

@keyframes slide-right {
  from {transform: translateX(0);}
  to {transform: translateX(50%);}
}
</style>
