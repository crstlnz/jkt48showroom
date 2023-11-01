<script setup>
defineProps({
  value: Boolean,
})
</script>

<template>
  <div v-if="value" key="benar" class="text-green-500">
    True
  </div>
  <div v-else key="salah" class="text-amber-500">
    False
  </div>
</template>
