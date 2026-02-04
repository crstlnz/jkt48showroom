<script lang="ts" setup>
definePageMeta({ middleware: 'admin' })

const { data, pending, error } = await useApiFetch<{ jpy_rates: number, fans: Database.IShowroomFans[] }>('/api/admin/fans_list')
</script>

<template>
  <LayoutRow title="Fans List">
    <div class="space-y-3 px-4">
      <div v-if="error" class="flex flex-col items-center justify-center gap-5">
        <img
          class="mx-auto aspect-square w-72 max-w-[65%] object-contain"
          :src="`${$imgCDN}/assets/svg/web/error.svg`" sizes="320px" fit="fill"
        >
        <span>{{ $t("data.failed") }}</span>
      </div>
      <div v-else-if="pending" class="flex aspect-video items-center justify-center">
        <Icon name="svg-spinners:ring-resize" size="2.5rem" />
      </div>
      <div v-else-if="!data" class="flex aspect-video flex-col items-center justify-center gap-2">
        <Image class="mx-auto w-72 max-w-[80%]" :src="`${$imgCDN}/assets/svg/web/empty-box.svg`" />
        <span>{{ $t("data.nodata") }}</span>
      </div>
      <div v-else class="flex flex-col gap-3">
        <div v-for="fans in data.fans" :key="fans.user_id" class="bg-container flex gap-5 rounded-xl p-5">
          <div class="h-20 w-20 rounded-full">
            <img :src="$avatarURL(fans.avatar_id)" class="h-full w-full object-cover">
          </div>
          <div>
            <div class="text-lg font-bold">
              {{ fans.name }}
            </div>
            <table class="fansdata opacity-75 *:p-3">
              <tbody>
                <tr>
                  <td>
                    Total gifts
                  </td>
                  <td>
                    <Parser parse-type="gift" :value="fans.point" />
                  </td>
                </tr>
                <tr>
                  <td>
                    Last seen
                  </td>
                  <td>
                    <Parser parse-type="date" :value="Number(fans.last_seen?.slice(0, 10) ?? 0) * 1000" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <template #sidebar>
      <HomeLiveNowSide class="mt-4" />
      <HomeRecents />
    </template>
  </LayoutRow>
</template>

<style lang="scss">
.fansdata {
  td {
    padding-right: 55px;
    padding-top: 5px;
  }
}
</style>
