<script setup lang="ts">
import { Error } from '#components'

const props = defineProps({
  error: {
    type: Object,
    default() {
      return {}
    },
  },
})

const config = useAppConfig()

const url = computed(() => {
  // eslint-disable-next-line eqeqeq
  return props.error.statusCode == 404 ? '/' : props.error.url
})

interface ErrorMessage {
  message: string
  key: string
  img: string
  alt: string
}
function getError(code: number): ErrorMessage {
  const msg: ErrorMessage = {
    message: 'An error occurred!',
    alt: 'An error occurred!',
    img: `${config.cloudinaryURL}/assets/svg/web/error.svg`,
    key: 'error.unknown',
  }

  switch (code) {
    case 404:
      msg.message = 'Page not found!'
      msg.key = 'error.pagenotfound'
      msg.alt = '404 Not Found!'
      msg.img = `${config.cloudinaryURL}/assets/svg/web/404.svg`
      break
    case 503:
      msg.message = 'Service temporarily unavailable, Try again later!'
      msg.alt = '503 Service Unavailable!'
      msg.key = 'error.unavailable'
      break
  }

  return msg
}

const errorMessage = computed<ErrorMessage>(() => {
  return getError(Number(props.error.statusCode))
})
</script>

<template>
  <NuxtLayout>
    <Error :message="$t(errorMessage.key)" :alt="$t(errorMessage.key)" :img-src="errorMessage.img" :url="url" />
  </NuxtLayout>
</template>
