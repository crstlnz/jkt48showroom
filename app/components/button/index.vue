<template>
  <button
    v-ripple
    class="relative overflow-hidden transition-[transform] active:scale-95 disabled:pointer-events-none disabled:opacity-70"
  >
    <slot />
  </button>
</template>
