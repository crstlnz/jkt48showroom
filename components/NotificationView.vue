<script lang="ts" setup>
import { useNotifications } from '~~/store/notifications'

const notifData = useNotifications()
const { currentNotif: notif } = storeToRefs(notifData)
</script>

<template>
  <div>
    <Transition name="notif" mode="out-in">
      <div v-if="notif" :key="notif.id" class="w-full">
        <NotifBase
          v-if="notif.type ==='success'"
          color="bg-green-500"
          icon="ic:round-check"
          :title="notif?.title ?? $t('notif.title.success')"
          :message="notif?.message"
        />

        <NotifBase
          v-else-if="notif.type ==='danger'"
          color="bg-red-500"
          icon="mdi:close-thick"
          :title="notif?.title ?? $t('notif.title.danger')"
          :message="notif?.message ?? 'wew'"
        />

        <NotifBase
          v-else-if="notif.type ==='warn'"
          color="bg-yellow-500"
          icon="mdi:exclamation-thick"
          :title="notif?.title ?? $t('notif.title.warn')"
          :message="notif?.message ?? 'wew'"
        />

        <NotifBase
          v-else
          color="bg-blue-500"
          icon="bi:info-lg"
          :title="notif?.title ?? $t('notif.title.info')"
          :message="notif?.message"
        />
      </div>
    </Transition>
  </div>
</template>
