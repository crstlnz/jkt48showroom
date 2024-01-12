<script lang="ts" setup>
import { useNotifications } from '~/store/notifications'

const scriptUrl = 'https://script.google.com/macros/s/AKfycbx3IuuVJO4qvvWzq72hko6TGFOl4qMRgiqtIHTAIJvR6NBb4ew0jObAcIyrKAreWs_F/exec'

const { addNotif } = useNotifications()
const feedbackForm = ref<HTMLFormElement>()
const loading = ref(false)
const success = ref()
const error = ref()
useEventListener(feedbackForm, 'submit', async (e) => {
  e.preventDefault()
  loading.value = true
  success.value = null
  error.value = null
  try {
    const data = new FormData(feedbackForm.value)
    await $fetch(scriptUrl, {
      method: 'POST',
      body: data,
      mode: 'no-cors',
    })
    success.value = 'Suksess mengirim form!'
    addNotif({
      title: 'Sukses',
      type: 'success',
      message: 'Berhasil mengirim form!',
    })
    feedbackForm.value?.reset()
  }
  catch (e) {
    error.value = 'Gagal mengirim form!'
    addNotif({
      title: 'Error',
      type: 'danger',
      message: 'Gagal mengirim form!',
    })
  }
  loading.value = false
})
</script>

<template>
  <LayoutSingleRow :title="$t('menu.report_bugs')">
    <div class="p-4 md:p-6">
      <form
        id="feedback"
        ref="feedbackForm"
        method="POST"
        class="flex flex-col gap-4"
        :action="scriptUrl"
      >
        <div class="flex gap-3">
          <label class="w-[100px] md:w-[150px]" for="Email">Email</label>
          <input name="Email" type="email" placeholder="Tidak wajib" class="bg-white/10 rounded-md px-3 py-2 outline-none flex-1">
        </div>
        <div class="flex gap-3">
          <label class="w-[100px] md:w-[150px]" for="Name">Nama</label>
          <input name="Name" type="text" placeholder="Name" required class="bg-white/10 rounded-md px-3 py-2 outline-none flex-1">
        </div>
        <div class="flex gap-3">
          <label class="w-[100px] md:w-[150px]" for="Detail">Isi</label>
          <textarea name="Detail" type="text" placeholder="Isi laporan bug atau saran" required form="feedback" class="bg-white/10 rounded-md px-3 py-2 outline-none flex-1" />
        </div>
        <div class="h-6 leading-6">
          <div v-if="success" class="text-green-500 text-sm">
            {{ success }}
          </div>
          <div v-if="error" class="text-red-500 text-sm">
            {{ error }}
          </div>
        </div>
        <button type="submit" class="bg-blue-500 rounded-full px-3 py-2 disabled:opacity-65 disabled:cursor-not-allowed h-11 flex items-center justify-center" :disabled="loading">
          <Icon v-if="loading" name="svg-spinners:ring-resize" class="h-6 w-6" />
          <div v-else>
            Kirim
          </div>
        </button>
      </form>

      <div class="text-center mb-10 mt-14">
        atau bisa langsung DM ke <NuxtLink to="https://twitter.com/crstlnz" class="text-red-500">
          @crstlnz
        </NuxtLink>
      </div>
    </div>
    <!-- <template #sidebar>
      <HomeRecents class="mt-3 md:mt-4" />
    </template> -->
  </LayoutSingleRow>
</template>
