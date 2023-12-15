<script lang="ts" setup>
import { useNotifications } from '~~/store/notifications'

const notifData = useNotifications()
const { deleteNotif, showNotif } = notifData
const { currentNotif: notifs } = storeToRefs(notifData)
const containerNotif = ref<any>()
function beforeLeave(el: Element) {
  if (containerNotif.value) {
    const s = el as HTMLElement
    const parentRect = containerNotif.value.$el.getBoundingClientRect()
    const rect = el.getBoundingClientRect()
    s.style.right = '0px'
    s.style.top = `${rect.top - parentRect.top}px`
    s.style.width = `${rect.width}px`
  }
}

const { isMobile } = useDevice()
</script>

<template>
  <Teleport to="body">
    <div class="pointer-events-none fixed inset-0 z-notification my-3 mx-5" :class="{ 'mb-[60px]': isMobile }">
      <TransitionGroup
        ref="containerNotif"
        tag="div"
        class="relative flex h-full w-full flex-col items-end justify-end gap-3 p-4 sm:items-start"
        name="list"
        @before-leave="beforeLeave"
        @after-leave="showNotif()"
      >
        <div v-for="notif in notifs" :key="notif.id" class="z-10 mx-auto md:mr-0 max-md:w-full md:min-w-[350px] md:max-w-[450px] lg:min-w-[350px] lg:max-w-[600px]">
          <NotifBase
            v-if="notif.type === 'success'"
            color="bg-green-500"
            icon="ic:round-check"
            :default-title="notif?.title ?? $t('notif.title.success')"
            :notif="notif"
            @close="deleteNotif(notif.id)"
          />

          <NotifBase
            v-else-if="notif.type === 'danger'"
            color="bg-red-500"
            icon="mdi:close-thick"
            :default-title="notif?.title ?? $t('notif.title.danger')"
            :notif="notif"
            @close="deleteNotif(notif.id)"
          />

          <NotifBase
            v-else-if="notif.type === 'warn'"
            color="bg-yellow-500"
            icon="mdi:exclamation-thick"
            :default-title="notif?.title ?? $t('notif.title.warn')"
            :notif="notif"
            @close="deleteNotif(notif.id)"
          />

          <NotifBase
            v-else
            color="bg-blue-500"
            icon="bi:info-lg"
            :default-title="notif?.title ?? $t('notif.title.info')"
            :notif="notif"
            @close="deleteNotif(notif.id)"
          />
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>
