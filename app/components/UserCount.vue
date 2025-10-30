<script lang="ts" setup>
import { useSocket } from '~/store/socket'

const isOpen = ref(false)
const { userCount, adminCount } = storeToRefs(useSocket())
</script>

<template>
  <div
    :class="{
      'hover:translate-y-[40%] translate-y-[60%] size-20': !isOpen,
      'translate-0 w-[150px] h-20': isOpen,
    }" class="z-aboveNav transition-all duration-300 ease-linear -translate-x-1/2 bottom-0 left-1/2 flex fixed  text-center justify-center align-middle items-center"
  >
    <div class="relative size-full group">
      <div
        :class="{
          'rounded-md size-full -translate-y-5': isOpen,
          'rounded-4xl size-12': !isOpen,
        }" class="absolute left-1/2 -translate-x-1/2 transition-all duration-300 ease-linear bg-dark-3"
      />
      <div
        :class="{
          'opacity-100 duration-500': isOpen,
          'opacity-0 duration-100': !isOpen,
        }" class="absolute left-1/2 w-[150px] h-20 flex items-center justify-center transition-all ease-linear top-1/2 -translate-x-1/2 -translate-y-[calc(50%+15px)]"
      >
        {{ userCount }} users <br>
        {{ adminCount }} admins
      </div>

      <button
        aria-label="open" :class="{
          'rotate-180 -translate-y-[calc(50%+20px)] bg-dark-1 border-color-1 rounded-full': isOpen,
          'rotate-0 border-transparent ': !isOpen,
        }" class="absolute transition-all ease-linear border duration-300 rounded-full left-1/2 -translate-x-1/2 text-xl size-12 flex items-center top-0 justify-center " @click="() => isOpen = !isOpen"
      >
        <Icon name="material-symbols:keyboard-double-arrow-up-rounded" class="" />
      </button>
    </div>
  </div>
</template>
