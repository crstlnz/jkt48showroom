<template>
  <ToolTip v-ripple class="bg-container shrink-0 rounded-full" :offset="5">
    <template #tooltip>
      <div class="relative min-w-[250px] py-3">
        <div class="flex flex-col text-sm *:hover:bg-hover *:p-3">
          <NuxtLink to="/logout" class="inline-block text-left">
            Logout
          </NuxtLink>
        </div>
      </div>
    </template>
    <div class="flex aspect-square items-center gap-3 rounded-full p-3">
      <Icon name="ic:sharp-settings" size="1.25rem" />
    </div>
  </ToolTip>
</template>
