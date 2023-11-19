<script lang="ts" setup>
import { useUser } from '~/store/user'

defineProps<{
  compact?: boolean
}>()

const { user, status } = useUser()
</script>

<template>
  <NuxtLink v-if="status === 'unauthenticated' || status === 'loading'" to="/login" aria-label="Login" class="my-3 flex items-center gap-3 rounded-full hover:bg-hover" :class="{ 'p-3': !compact, 'mb-5': compact }">
    <div class="h-10 w-10">
      <Icon name="ic:baseline-person" size="1.5em" class="h-full w-full rounded-full bg-slate-400 p-2 text-white dark:bg-dark-3 dark:text-slate-500/50" />
    </div>
    <div v-if="!compact" class="mr-3 flex flex-col">
      <div class="text-base font-semibold">
        Login
      </div>
      <div class="font-light">
        Login with Showroom
      </div>
    </div>
  </NuxtLink>
  <div v-else class="my-5">
    <ToolTip class="w-full rounded-full" :offset="5">
      <template #tooltip>
        <div class="relative min-w-[250px] py-3">
          <div class="flex flex-col text-sm [&>*]:p-3">
            <NuxtLink to="/history" class="inline-block text-left hover:bg-white/5">
              History
            </NuxtLink>
            <NuxtLink to="/logout" class="inline-block text-left hover:bg-white/5">
              Logout {{ user.name }}
            </NuxtLink>
          </div>
        </div>
      </template>
      <div class="flex items-center gap-3 rounded-full p-3 hover:bg-hover">
        <NuxtImg
          v-if="user.img"
          class="h-12 w-12 overflow-hidden rounded-full bg-slate-400 text-white dark:bg-dark-1 dark:text-slate-500/50"
          :src="user.img"
          alt="User profile picture"
          fit="fill"
          :modifiers="{
            aspectRatio: 1,
            gravity: 'faceCenter',
          }"
          width="48px"
          :placeholder="[4, 4, 75, 5]"
          format="webp"
        />
        <Icon v-else name="ic:baseline-person" size="1.5em" class="h-10 w-10 rounded-full bg-slate-400 p-2 text-white dark:bg-dark-1 dark:text-slate-500/50" />
        <div v-if="!compact" class="mr-3 flex flex-1 flex-col items-start">
          <div class="text-base font-semibold">
            {{ user.name }}
          </div>
          <div v-if="user.account_id" class="text-left font-light">
            {{ user.account_id }}
          </div>
          <!-- <div v-else class="text-left font-light">
            #{{ user. }}
          </div> -->
        </div>
      </div>
    </ToolTip>
  </div>
</template>
