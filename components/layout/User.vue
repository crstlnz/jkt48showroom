<script lang="ts" setup>
import { useUser } from '~/store/user'
import { LazyImage } from '#components'

defineProps<{
  compact?: boolean
}>()

const { user, status } = useUser()
</script>

<template>
  <NuxtLink v-if="status === 'unauthenticated' || status === 'loading'" to="/login" aria-label="Login" class="my-3 flex items-center gap-3 rounded-full hover:bg-hover" :class="{ 'p-3': !compact, 'mb-5': compact }">
    <div class="h-10 w-10">
      <Icon name="ic:baseline-person" size="1.5em" class="h-full w-full rounded-full bg-slate-400 p-2 text-white dark:bg-dark-1 dark:text-slate-500/50" />
    </div>
    <div v-if="!compact" class="mr-3 flex flex-col">
      <div class="text-base font-semibold">
        Login
      </div>
      <div class="font-light">
        Login with Discord
      </div>
    </div>
  </NuxtLink>
  <ToolTip v-else class="w-full rounded-full" :offset="0">
    <template #tooltip>
      <div class="relative min-w-[250px] py-3">
        <div class="flex flex-col text-sm [&>*]:hover:bg-hover [&>*]:p-3">
          <NuxtLink to="/logout" class="inline-block text-left">
            Logout {{ user.name }}
          </NuxtLink>
        </div>
      </div>
    </template>
    <div class="my-5 flex items-center gap-3 rounded-full p-3 hover:bg-hover">
      <LazyImage v-if="user.img" alt="User profile picture" class="h-12 w-12 overflow-hidden rounded-full bg-slate-400 p-2 text-white dark:bg-dark-1 dark:text-slate-500/50" :src="user.img" />
      <Icon v-else name="ic:baseline-person" size="1.5em" class="h-10 w-10 rounded-full bg-slate-400 p-2 text-white dark:bg-dark-1 dark:text-slate-500/50" />
      <div v-if="!compact" class="mr-3 flex flex-1 flex-col items-start">
        <div class="text-base font-semibold">
          {{ user.name }}
        </div>
        <div class="text-left font-light">
          #{{ user.discriminator }}
        </div>
      </div>
    </div>
  </ToolTip>
</template>
