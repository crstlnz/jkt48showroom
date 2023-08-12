<script lang="ts" setup>
import { useMembers } from '~~/store/members'

const golonganDarah = ['A', 'B', 'AB', 'O']
const memberState = useMembers()
const { members, pending, error } = storeToRefs(memberState)
interface TipeDarah {
  tipe: string
  list: IMember[]
}
const dataDarah = computed(() => {
  const dataMember = members.value.filter(i => i.is_graduate !== true)
  const data: TipeDarah[] = []
  for (const golongan of golonganDarah) {
    data.push({
      tipe: golongan,
      list: dataMember.filter((i) => {
        if (i.bloodType) {
          return i.bloodType.replaceAll('+', '').replaceAll('-', '') === golongan
        }
        return false
      }),
    })
  }
  return data
})
</script>

<template>
  <LayoutRow title="Golongan Darah">
    <div class="bg-bloodtype relative space-y-5 overflow-hidden p-4 pb-20">
      <NuxtLink to="https://twitter.com/crstlnz" target="_blank" class="absolute bottom-3 right-3">
        @crstlnz
      </NuxtLink>
      <img src="https://res.cloudinary.com/haymzm4wp/image/upload/v1691762252/assets/img/bloodillus_e4oqog.png" class="absolute -top-5 left-0 z-[5] w-60 md:-top-10 md:left-10 md:w-72" alt="">
      <div class="bg-circle" />
      <div class="z-10 flex flex-col items-end gap-3 text-right text-3xl font-extrabold">
        <span class="z-10">
          GOLONGAN DARAH
        </span>
        <div class="mask-jkt48 h-12 w-32 bg-white" />
      </div>
      <div class="relative z-10 ml-[35%] w-[55%] place-self-end pb-2 pt-10 text-lg">
        Berikut daftar golongan darah member JKT48 saat ini. Informasi terkait diakses dari web official JKT48
      </div>
      <div class="flex flex-col gap-10">
        <div v-for="dataList in dataDarah" :key="dataList.tipe" class="relative flex">
          <div class="z-10 flex-[25%] self-center text-center text-5xl font-extrabold md:flex-[23%] ">
            {{ dataList.tipe }}
          </div>
          <div class="relative flex flex-[75%] flex-wrap gap-2.5 md:flex-[77%]">
            <div class="absolute -bottom-4 left-0 w-[96%] border-b-4 border-white/25" />
            <img v-for="member in dataList.list" :key="member.room_id" :src="$fixCloudinary(member.img_alt || member.img)" :alt="member.name" class="z-10 h-[70px] w-[70px] rounded-full">
          </div>
        </div>
      </div>
    </div>
    <template #sidebar>
      <HomeContainer class="xl:mt-4" :title="$t('page.title.recent')" icon-class="bg-blue-500" more="/recent" more-label="More recents data" :more-text="$t('more')">
        <HomeRecents />
      </HomeContainer>
    </template>
  </LayoutRow>
</template>

<style>
.bg-bloodtype{
    background: radial-gradient(circle at 10% 10%, rgb(119, 0, 0) 0%, rgb(221, 49, 49) 90%);
}

.mask-jkt48{
  -webkit-mask-image: url(https://res.cloudinary.com/haymzm4wp/image/upload/v1691761221/assets/img/jkt48textlogo_p0hagz.png);
  mask-image: url(https://res.cloudinary.com/haymzm4wp/image/upload/v1691761221/assets/img/jkt48textlogo_p0hagz.png);
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  mask-size: contain;
}

.bg-circle {
  background: rgb(73,0,0);
  background: linear-gradient(180deg, rgb(151, 27, 27) 0%, rgba(255, 78, 78, 0.671) 150%);
  @apply w-[500rem] aspect-square rounded-full absolute left-1/2 -translate-x-1/2 top-[calc(155px_-_500rem)] -z-0
}
</style>
