<script lang="ts" setup>
const props = defineProps<{ src: string }>()
const canvasElement = ref<HTMLCanvasElement>()
onMounted(async () => {
  if (canvasElement.value) {
    const data = await getDominantColorClient(props.src, canvasElement.value).catch(()=>null)
    const color = data ? convertRGBtoHex(...flattenAndSoftenColor(...data)) : 'rgba(207,217,222,255)'
    const ctx = canvasElement.value.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvasElement.value.width, canvasElement.value.height)
      ctx.fillStyle = color
      ctx.fillRect(0, 0, canvasElement.value.width, canvasElement.value.height)
    }
  }
})
</script>

<template>
  <canvas ref="canvasElement" class="pointer-events-none" />
</template>
