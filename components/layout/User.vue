<script lang="ts" setup>
const { user, status } = useAuth()
const hiddenUsername = useCookie('_h_usrnme', {
  default: () => true,
  maxAge: 3600 * 24 * 30,
  path: '/',
})

function toggleUsername(e: Event) {
  e.stopPropagation()
  hiddenUsername.value = !hiddenUsername.value
}
</script>

<template>
  <div>
    <div v-if="status === 'loading'" key="loading">
      <div class="my-3 flex items-center gap-3 rounded-full hover:bg-hover 2xl:p-2">
        <div class="animate-pulse h-10 w-10 2xl:w-12 2xl:h-12  rounded-full pulse-color" />
        <div class="animate-pulse mr-3 flex flex-1 flex-col max-2xl:hidden">
          <div class="text-base font-semibold pulse-color rounded-md w-[45%] h-4 my-1" />
          <div class="text-base font-semibold pulse-color rounded-md w-full h-4 my-1" />
        </div>
      </div>
    </div>
    <div v-else-if="status === 'unauthenticated'" key="unauthenticated">
      <NuxtLink to="/login" aria-label="Login" class="my-3 flex items-center gap-3 rounded-full hover:bg-hover 2xl:p-2">
        <div class="h-10 w-10 2xl:w-12 2xl:h-12 ">
          <Icon name="ic:baseline-person" size="1.5em" class="h-full w-full rounded-full bg-slate-400 p-2 text-white dark:bg-dark-3 dark:text-slate-500/50" />
        </div>
        <div class="mr-3 flex flex-col max-2xl:hidden">
          <div class="text-base font-semibold">
            Login
          </div>
          <div class="font-light">
            Login with Showroom
          </div>
        </div>
      </NuxtLink>
    </div>
    <div v-else key="authenticated">
      <ToolTip class="w-full rounded-full" :offset="5">
        <template #tooltip>
          <div class="relative min-w-[250px] py-3">
            <div class="flex flex-col text-sm *:p-3">
              <NuxtLink to="/history" class="inline-block text-left hover:bg-white/5">
                History
              </NuxtLink>
              <NuxtLink to="/logout" class="inline-block text-left hover:bg-white/5">
                Logout {{ user?.name }}
              </NuxtLink>
            </div>
          </div>
        </template>
        <div class="flex items-center gap-3 rounded-full hover:bg-hover 2xl:p-2 my-3">
          <img
            v-if="user?.image"
            class="h-10 w-10 2xl:w-12 2xl:h-12 overflow-hidden rounded-full bg-slate-400 text-white dark:bg-dark-1 dark:text-slate-500/50"
            :src="user?.image"
            alt="User profile picture"
          >
          <Icon v-else name="ic:baseline-person" size="1.5em" class="h-10 w-10 rounded-full bg-slate-400 p-2 text-white dark:bg-dark-1 dark:text-slate-500/50" />
          <div class="mr-3 flex flex-1 flex-col items-start max-2xl:hidden">
            <div class="text-base font-semibold leading-5">
              {{ user?.name }}
            </div>
            <div v-if="user?.account_id" class="text-left font-light leading-5 text-sm">
              <div v-if="!hiddenUsername" @click="toggleUsername">
                {{ user?.account_id }}
              </div>
              <div v-else class="flex items-center gap-1 align-middle" @click="toggleUsername">
                <span>********</span><Icon name="formkit:hidden" />
              </div>
            </div>
          </div>
        </div>
      </ToolTip>
    </div>
  </div>
</template>
