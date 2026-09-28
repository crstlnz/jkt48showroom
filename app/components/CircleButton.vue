<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const buttonElement = ref<HTMLButtonElement>()

function focus() {
  buttonElement.value?.focus()
}

defineExpose({
  focus,
})
</script>

<template>
  <button ref="buttonElement" v-ripple v-bind="$attrs" type="button" class="flex size-8 rounded-full p-1 hover:bg-hover-2 ">
    <slot />
  </button>
</template>
