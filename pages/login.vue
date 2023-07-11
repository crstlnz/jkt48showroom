<script lang="ts" setup>
import { useSettings } from '~~/store/settings'
import { useUser } from '~/store/user'

definePageMeta({ layout: 'empty' })
const { signIn, authenticated } = useUser()

if (authenticated) navigateTo('/')

const i18nHead = useLocaleHead({
  addDirAttribute: true,
  identifierAttribute: 'id',
  addSeoAttributes: true,
})

const settings = useSettings()
const { getFavicon, getTitle } = useAppConfig()
// const dataA = await getSession()
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

function login() {
  signIn('discord', { redirect: true, callbackUrl: '/' })
}

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
  constructor() {
    this.x = random(0, 100)
    this.y = random(0, 100)
    this.deep = random(0, 100)
    this.speed = random(0.005, 0.01)
    this.size = random(8, 10) - this.deep / 100 * 2
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.y -= this.speed * 2 * this.deep / 100
    ctx.fillStyle = '#6e6d6d'
    ctx.globalAlpha = this.deep / 100
    ctx.beginPath()
    const y = height.value * this.y / 100 - mouseYSmooth.value / height.value * 100 * 2 * this.deep / 100
    ctx.arc((width.value * this.x / 100) + ((mouseXSmooth.value / window.innerWidth * 100) - 50) * this.deep / 100, y, this.size, 0, 2 * Math.PI)
    ctx.fill()

    if (y < -10) {
      this.y += 105
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
      for (let i = 0; i < 80; i++) {
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
</script>

<template>
  <div class="min-h-[100vh] bg-dark-2 backdrop-blur-sm">
    <canvas
      ref="canvas" :class="{
        'opacity-100': mounted,
        'opacity-0': !mounted,
      }" class="fixed inset-0 -z-10 h-full w-full transition-[opacity] duration-1000"
    />
    <!-- <div id="login-bg" class="fixed inset-0 -z-10 brightness-75 max-sm:blur-sm" /> -->
    <div class="flex h-[20vh] items-center justify-center text-center">
      <NuxtLink to="/" class="text-3xl font-bold text-white lg:text-4xl">
        JKT48 Showroom
      </NuxtLink>
    </div>
    <div class="bg-container mx-auto w-[350px] max-w-[80vw] overflow-hidden rounded-3xl shadow-xl">
      <div class=" bg-[#5865F2] p-10">
        <img class="mx-auto w-[90%] md:w-[70%]" src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0b5493894cf60b300587_full_logo_white_RGB.svg" alt="Discord Full Logo">
      </div>
      <div class="px-5 pb-8 pt-5 text-center">
        <NuxtLink to="/" class="flex items-center gap-0.5 text-base">
          <Icon name="material-symbols:chevron-left-rounded" size="1.2em" />
          Home
        </NuxtLink>
        <div class="space-y-8">
          <div class="space-y-4">
            <div class="mx-auto text-4xl font-bold">
              Login
            </div>
            <div class="mx-auto">
              Login to your account
            </div>
          </div>
          <button class="mx-auto flex items-center justify-center gap-3 rounded-[50px] bg-[#5865F2] px-8 py-4 text-white" @click="login">
            <img class="h-5 w-5" src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg" alt="Discord Logo">
            Login with Discord
          </button>
        </div>
      </div>
    </div>
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
