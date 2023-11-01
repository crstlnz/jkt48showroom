<script lang="ts" setup>
import { useSettings } from '~~/store/settings'
import { useUser } from '~/store/user'

definePageMeta({ layout: false })
const settings = useSettings()
const { getTitle } = useAppConfig()
useHead({
  title: getTitle(settings.group),
})
const { user, signOut, authenticated } = useUser()

if (!authenticated) navigateTo('/')

const router = useRouter()
function cancel() {
  if (router.options.history.state.back) {
    router.back()
  }
  else {
    router.replace('/')
  }
}
</script>

<template>
  <div class="flex min-h-[100vh] items-center justify-center">
    <div class="bg-container flex w-[320px] flex-col gap-3 rounded-xl p-8">
      <img class="h-24 w-24 self-center rounded-full p-2" :src="user.img ?? ''" alt="Profile Picture">
      <div class="text-lg font-semibold">
        {{ $t('logoutfrom') }} {{ user.name }}?
      </div>
      <div class="font-thin">
        {{ $t('logoutwarn') }}
      </div>
      <div class="mt-3 flex flex-col gap-3">
        <button
          class="rounded-full bg-red-400 p-3 text-sm font-semibold text-white" @click="() => {
            settings.session = null
            signOut({ redirect: true, callbackUrl: '/' })
          }"
        >
          {{ $t('logout') }}
        </button>
        <button class="rounded-full p-3 text-sm font-semibold transition-colors duration-300 active:bg-hover" @click="cancel">
          {{ $t('cancel') }}
        </button>
      </div>
    </div>
  </div>
</template>
