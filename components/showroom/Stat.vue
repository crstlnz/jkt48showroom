<template>
  <div class="flex flex-col rounded-xl bg-container p-4 text-center shadow-sm ">
    <div class="flex items-center justify-center gap-1 font-thin opacity-75 dark:opacity-50">
      <slot name="title" />
    </div>
    <div class="mt-3 flex-1 text-xl font-bold opacity-90">
      <slot name="value" />
    </div>
  </div>
</template>
