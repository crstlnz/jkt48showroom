<script lang="ts" setup>
import { useSettings } from '~~/store/settings'

definePageMeta({
  layout: 'empty',
  middleware: 'unauthenticated',
})

const settings = useSettings()
const { session } = storeToRefs(settings)
const i18nHead = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})

const { getFavicon, getTitle } = useAppConfig()
useHead({
  htmlAttrs: {
    lang: i18nHead.value.htmlAttrs?.lang,
    dir: i18nHead.value.htmlAttrs?.dir,
  },
  title: `Login - ${getTitle(settings.group)}`,
  meta: [
    ...(i18nHead.value.meta || []),
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    {
      hid: 'description',
      name: 'description',
      content: `${getTitle(settings.group)} Login Page`,
    },
  ],
  link: [
    ...(i18nHead.value.link || []),
    { rel: 'icon', type: 'image/x-icon', href: getFavicon(settings.group) },
  ],
})

const loading = ref(false)
const submitDisabled = computed(() => {
  return loading.value
  // return loading.value || session.value?.csrf_token == null
})
const username = useSessionStorage('username-form', () => '')
const password = ref('')
const captcha = ref('')
const usernameError = ref('')
const passwordError = ref('')
const captchaError = ref('')

const { checkAuth, signIn } = useAuth()

watch(username, () => {
  if (usernameError.value) usernameError.value = ''
})

watch(password, () => {
  if (passwordError.value) passwordError.value = ''
})

watch(captcha, () => {
  if (captchaError.value) captchaError.value = ''
})

const { t } = useI18n()
const errorData = ref()

function checkSubmit() {
  if (submitDisabled.value) return
  if (username.value === '') {
    usernameError.value = t('form.error.empty.username')
  }

  if (password.value === '') {
    passwordError.value = t('form.error.empty.password')
  }

  if (errorData.value?.captcha_url && captcha.value === '') {
    captchaError.value = t('form.error.empty.captcha')
    return
  }

  if (!password.value || !username.value) return
  signInHandler()
}

const route = useRoute()
// const { refresh } = useCSRF()
const router = useRouter()
const redirectURL = computed<string>(() => {
  try {
    const url = atob(decodeURI(route.query.r as string))
    return url || (router?.options?.history?.state?.back as string) || '/'
  }
  catch (e) {
    return (router?.options?.history?.state?.back as string) || '/'
  }
})

async function signInHandler() {
  loading.value = true
  const opts = { password: password.value, account_id: username.value } as any
  if (captcha.value !== '') opts.captcha_word = captcha.value
  // const { error, url } = (await signIn('credentials', { ...opts, redirect: false })) as any
  const body = new URLSearchParams()
  for (const key of Object.keys(opts)) {
    body.append(key, opts[key])
  }
  try {
    await signIn(body)
    session.value = null
    // refresh()
    return await navigateTo(redirectURL.value, { external: true })
  }
  catch (e: any) {
    if (e.data?.error) {
      errorData.value = e.data
    }
    else {
      try {
        document.cookie = ''
        location.reload()
      }
      catch (e) {
        console.error(e)
      }
      errorData.value = {
        error: t('loginfailedinfo'),
      }
    }
  }
  loading.value = false
}
</script>

<template>
  <div>
    <SplashScreen>
      <div class="min-h-[100vh] bg-dark-2 backdrop-blur-sm">
        <div class="flex items-center justify-center text-center">
          <NuxtLink to="/" class="my-8 text-3xl font-bold text-white md:my-14 lg:text-4xl">
            {{ getTitle(settings.group) }}
          </NuxtLink>
        </div>
        <div class="mx-auto w-[650px] max-w-[calc(100%_-_24px)] rounded-3xl bg-dark-1 px-4 py-8 text-white/75 drop-shadow-md md:px-8">
          <div class="flex items-center justify-center gap-1.5 text-center text-lg md:text-xl xl:text-2xl font-bold">
            <Icon name="solar:login-3-bold-duotone" class="text-red-500 text-4xl md:text-5xl xl:text-6xl" />
            <span>Login to Showroom</span>
          </div>
          <div />
          <div class="mt-8 flex flex-col gap-3 md:gap-4 md:mt-10">
            <div class="mb-5 relative rounded-xl ring-blue-500 focus-within:ring-2" :class="{ 'ring-1 ring-red-500': usernameError, 'cursor-not-allowed opacity-50': loading }">
              <input v-model="username" class="w-full rounded-xl bg-dark-3 px-3.5 py-2.5 outline-none focus:!border-none disabled:pointer-events-none" placeholder="Username" :disabled="loading" @keyup.enter="checkSubmit">
              <div v-if="usernameError" class="absolute top-[calc(100%_+_5px)] text-sm text-red-500">
                {{ usernameError }}
              </div>
            </div>
            <div class="mb-5 relative rounded-xl ring-blue-500 focus-within:ring-2" :class="{ 'ring-1 ring-red-500': passwordError, 'cursor-not-allowed opacity-50': loading }">
              <input v-model="password" class="w-full rounded-xl bg-dark-3 px-3.5 py-2.5 outline-none focus:!border-none disabled:pointer-events-none" placeholder="Password" type="password" :disabled="loading" @keyup.enter="checkSubmit">
              <div v-if="passwordError" class="absolute top-[calc(100%_+_5px)] text-sm text-red-500">
                {{ passwordError }}
              </div>
            </div>
            <div v-if="errorData?.captcha_url" class="flex flex-col gap-3">
              {{ $t('form.captcha') }}
              <div class="w-full">
                <img :src="errorData.captcha_url" alt="Captcha Image" class="w-full rounded-xl">
              </div>
              <div class="relative rounded-xl ring-blue-500 focus-within:ring-2 sm:mt-3" :class="{ 'ring-1 ring-red-500': captchaError, 'cursor-not-allowed opacity-50': loading }">
                <input v-model="captcha" class="w-full rounded-xl bg-dark-3 px-3.5 py-2.5 outline-none focus:!border-none disabled:pointer-events-none" placeholder="Captcha" :disabled="loading" @keyup.enter="checkSubmit">
                <div v-if="captchaError" class="absolute top-[calc(100%_+_5px)] text-sm text-red-500">
                  {{ captchaError }}
                </div>
              </div>
            </div>
            <div class="space-y-4">
              <div v-if="errorData?.error" class=" text-red-500">
                {{ errorData?.error }}
              </div>
              <ButtonText class="relative mt-4 rounded-xl bg-blue-500 p-2.5 text-xl font-bold w-full" :disabled="submitDisabled" @click="checkSubmit">
                <Icon v-if="loading" name="svg-spinners:ring-resize" size="1.8rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                <span :class="{ 'opacity-0': loading }">Login</span>
              </ButtonText>
            </div>
            <div class="text-orange-500 text-sm">
              {{ $t('logininfo') }}
            </div>
            <div class="text-center">
              <Footer class="mt-2 opacity-50" />
            </div>
          </div>
        </div>
      </div>
    </SplashScreen>
  </div>
</template>

<style lang="scss">
#login-bg {
 background-image: url("https://res.cloudinary.com/haymzm4wp/image/upload/v1680725695/assets/img/fd91131ea693096d6be5e8aa99d18f9e_xohduk.jpg");
 background-color: #cccccc;
 background-repeat: no-repeat;
 background-size: cover;
 background-attachment: fixed;
}
</style>
