<script lang="ts" setup>
import { useSettings } from '~~/store/settings'
import { useUser } from '~/store/user'

// import sessionSerializer from '~~/library/serializer/showroomSession'

definePageMeta({
  middleware: ['auth', 'showroom-session'],
  layout: 'empty',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
})

const settings = useSettings()
const { session } = storeToRefs(settings)
// const session = useSessionStorage<{ csrf_token: string; cookie: string } | null>('showroom_session', null, {
//   serializer: sessionSerializer,
// })
const { signIn } = useUser()
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

const canvas = ref<HTMLCanvasElement | null>()

const { x: mouseX, y: mouseY } = useMouse()

const mouseYPlus = ref(0)
const mouseXSmooth = ref(0)
const mouseYSmooth = ref(0)
const lastY = ref <number | null>(null)
watch(mouseY, (y) => {
  if (lastY.value !== null) {
    mouseYPlus.value += Math.max(0, lastY.value - y)
  }
  else {
    mouseYPlus.value = 0
  }
  lastY.value = y
})

const width = ref(0)
const height = ref(0)

function lerp(a: number, b: number, t: number): number {
  return a * (1 - t) + b * t
}

class Bubble {
  x: number
  y: number
  deep: number
  speed: number
  size: number
  color: string
  constructor() {
    this.x = random(0, 100)
    this.y = random(0, 100)
    this.deep = random(0, 100)
    this.speed = random(0.005, 0.01)
    this.size = random(180, 600) - this.deep / 100 * 2
    this.color = this.generateRandomColor()
  }

  generateRandomColor(): string {
    const colors: string[] = ['#3b82f6', '#22c55e', '#ef4444', '#14b8a6', '#a855f7', '#ec4899', '#f97316', '#eab308']
    const randomIndex: number = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.y -= this.speed * 2 * this.deep / 100
    ctx.fillStyle = this.color
    ctx.globalAlpha = (this.deep / 300)
    ctx.beginPath()
    const y = height.value * this.y / 100 - mouseYSmooth.value / height.value * 100 * 2 * this.deep / 100
    ctx.arc((width.value * this.x / 100) + ((mouseXSmooth.value / window.innerWidth * 100) - 50) * this.deep / 100, y, this.size, 0, 2 * Math.PI)
    ctx.fill()

    if (y < -this.size) {
      this.y += 100 + (this.size / height.value * 100) * 2
    }
  }
}

function random(min: number, max: number): number {
  return Math.random() * (max - min) + min
}

const w = ref<Window | null>()

useEventListener(w, 'resize', () => {
  if (canvas.value) {
    width.value = window.innerWidth * 2
    height.value = window.innerHeight * 2
    canvas.value.width = width.value
    canvas.value.height = height.value
  }
})

const mounted = ref(false)
onMounted(() => {
  mounted.value = true
  mouseXSmooth.value = mouseX.value
  mouseYSmooth.value = mouseYPlus.value
  w.value = window
  if (canvas.value) {
    width.value = window.innerWidth * 2
    height.value = window.innerHeight * 2
    const ctx = canvas.value.getContext('2d')
    if (ctx) {
      canvas.value.width = width.value
      canvas.value.height = height.value

      const bubbles: Bubble[] = []
      for (let i = 0; i < 10; i++) {
        bubbles.push(new Bubble())
      }

      function draw(ctx: CanvasRenderingContext2D) {
        mouseXSmooth.value = lerp(mouseXSmooth.value, mouseX.value, 0.05)
        mouseYSmooth.value = lerp(mouseYSmooth.value, mouseYPlus.value, 0.05)
        ctx.clearRect(0, 0, width.value, height.value)
        for (const bubble of bubbles) {
          bubble.draw(ctx)
        }
        requestAnimationFrame(() => draw(ctx))
      }

      draw(ctx)
    }
  }
})

const loading = ref(false)
const submitDisabled = computed(() => {
  return loading.value || session.value?.csrf_token == null
})
const username = ref('')
const password = ref('')
const captcha = ref('')
const usernameError = ref('')
const passwordError = ref('')
const captchaError = ref('')

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

function submit() {
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

async function signInHandler() {
  loading.value = true
  const opts = { password: password.value, username: username.value, sr_csrf: session.value?.csrf_token, cookie: session.value?.cookie } as any
  if (captcha.value !== '') opts.captcha_word = captcha.value
  const { error, url } = (await signIn('credentials', { ...opts, redirect: false })) as any
  if (error) {
    loading.value = false
    console.log(error)
    try {
      errorData.value = JSON.parse(error)
    }
    catch (e) {
      console.log(e)
    }
  }
  else {
    session.value = null
    return await navigateTo(url, { external: true })
  }
}
</script>

<template>
  <div>
    <SplashScreen>
      <div class="min-h-[100vh] bg-dark-2 backdrop-blur-sm">
        <!-- <canvas
      ref="canvas" :class="{
        'opacity-100': mounted,
        'opacity-0': !mounted,
      }" class="fixed inset-0 -z-10 h-full w-full opacity-60 blur-3xl transition-[opacity] duration-1000"
    /> -->
        <div class="flex items-center justify-center text-center">
          <NuxtLink to="/" class="my-8 text-3xl font-bold text-white md:my-14 lg:text-4xl">
            {{ getTitle(settings.group) }}
          </NuxtLink>
        </div>
        <div class="mx-auto w-[650px] max-w-[100%] rounded-3xl bg-dark-1 px-5 py-8 text-white/75 drop-shadow-md md:px-8">
          <div class="flex items-center justify-center gap-1.5 text-center text-2xl font-bold">
            <Icon name="solar:login-3-bold-duotone" class="text-red-500" size="2.5rem" />
            <span>Login to Showroom</span>
          </div>
          <div />
          <div class="mt-8 flex flex-col gap-8 md:mt-10">
            <div class="relative rounded-xl bg-dark-3 px-3.5 py-2.5" :class="{ 'ring-1 ring-red-500': usernameError, 'cursor-not-allowed opacity-50': loading }">
              <input v-model="username" class="w-full bg-transparent outline-none disabled:pointer-events-none" placeholder="Username" :disabled="loading" @keyup.enter="submit">
              <div v-if="usernameError" class="absolute top-[calc(100%_+_5px)] text-sm text-red-500">
                {{ usernameError }}
              </div>
            </div>
            <div class="relative rounded-xl bg-dark-3 px-3.5 py-2.5" :class="{ 'ring-1 ring-red-500': passwordError, 'cursor-not-allowed opacity-50': loading }">
              <input v-model="password" class="w-full bg-transparent outline-none disabled:pointer-events-none" placeholder="Password" type="password" :disabled="loading" @keyup.enter="submit">
              <div v-if="passwordError" class="absolute top-[calc(100%_+_5px)] text-sm text-red-500">
                {{ passwordError }}
              </div>
            </div>
            <div v-if="errorData?.captcha_url" class="flex flex-col gap-3">
              {{ $t('form.captcha') }}
              <div class="w-full">
                <img :src="errorData.captcha_url" alt="Captcha Image" class="w-full rounded-xl">
              </div>
              <div class="relative rounded-xl bg-dark-3 px-3.5 py-2.5 sm:mt-3" :class="{ 'ring-1 ring-red-500': captchaError, 'cursor-not-allowed opacity-50': loading }">
                <input v-model="captcha" class="w-full bg-transparent outline-none disabled:pointer-events-none" placeholder="Captcha" :disabled="loading" @keyup.enter="submit">
                <div v-if="captchaError" class="absolute top-[calc(100%_+_5px)] text-sm text-red-500">
                  {{ captchaError }}
                </div>
              </div>
            </div>
            <div v-if="errorData?.error" class="mt-3 text-red-500">
              {{ errorData?.error }}
            </div>
            <ClientOnly>
              <template #fallback>
                <ButtonText class="relative mt-5 rounded-xl bg-blue-500 p-2.5 text-xl font-bold" :disabled="true">
                  <span :class="{ 'opacity-0': loading }">Login</span>
                </ButtonText>
              </template>
              <ButtonText class="relative mt-5 rounded-xl bg-blue-500 p-2.5 text-xl font-bold" :disabled="submitDisabled" @click="submit">
                <Icon v-if="loading" name="svg-spinners:ring-resize" size="1.8rem" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
                <span :class="{ 'opacity-0': loading }">Login</span>
              </ButtonText>
            </ClientOnly>
            <NuxtLink to="https://twitter.com/crstlnz" target="_blank" class="mt-4 opacity-50">
              @crstlnz
            </NuxtLink>
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
