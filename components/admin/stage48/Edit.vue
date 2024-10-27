<script lang="ts" setup>
const props = defineProps<{
  stage48member: Admin.IdolMemberWithID
  jkt48members: JKT48.Member[]

}>()
const emit = defineEmits<{
  (e: 'onDismiss'): void
  (e: 'onUpdateMember', data: Admin.IdolMemberWithID): void
}>()

const stage48member = ref(props.stage48member)
const editDialog = ref()

watch(() => props.stage48member, (val) => {
  stage48member.value = val
})

onClickOutside(editDialog, () => {
  emit('onDismiss')
})

async function toggleGraduate(value: boolean) {
  await $apiFetch('/api/admin/set_graduate', {
    method: 'POST',
    query: {
      id: stage48member.value._id,
      value,
    },
    onResponse(ctx) {
      if (ctx.response.status === 200) {
        stage48member.value.info.is_graduate = value
      }
    },
  }).catch((e) => {
    console.error(e)
  })
}
</script>

<template>
  <div class="fixed inset-0 z-aboveNav bg-black/50 overscroll-contain">
    <div ref="editDialog" class=" bg-container absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xl px-2">
      <div class="roundedscrollbar my-6 max-h-[90vh] max-w-[90vw] overflow-y-auto overscroll-none px-3 md:px-5 lg:px-8">
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-6 overflow-x-auto">
            <MemberFormImage
              post-url="/api/admin/member/image"
              :is-potrait="true"
              :member-data-id="stage48member._id ?? '0'"
              form-id="image"
              class="aspect-square h-32 shrink-0 overflow-hidden rounded-full border-2 dark:border-dark-2 md:h-36 xl:h-40"
              image-class="h-full w-full object-cover"
              :src="stage48member.info.img" :alt="stage48member.name"
              @uploaded="(url) => {
                stage48member.info.img = url
              }"
            />
            <MemberFormImage
              form-id="banner"
              post-url="/api/admin/member/banner"
              :member-data-id="stage48member?._id ?? '0'"
              class="aspect-[15/5] h-32 shrink-0 overflow-hidden rounded-xl border-2 dark:border-dark-2 md:h-36 xl:h-40"
              image-class="h-full w-full object-cover bg-container-2" :src="stage48member?.info?.banner"
              @uploaded="(url) => {
                stage48member.info.banner = url
              }"
            />
          </div>
          <div class="flex flex-col">
            <div class="flex justify-between">
              <div>
                <div class="pt-2 text-2xl font-bold">
                  {{ stage48member.name }}
                </div>
                <div class="pb-2 text-base opacity-75">
                  {{ stage48member.stage48 }}
                </div>
              </div>
              <button type="button" class="" @click="toggleGraduate(stage48member.info?.is_graduate !== true)">
                <div class="flex items-center gap-1 text-xl">
                  <div class="text-base" :class="stage48member.info?.is_graduate ? 'text-red-500' : 'text-green-500'">
                    {{ stage48member.info?.is_graduate ? "Graduated" : "Active" }}
                  </div>
                  <Icon name="humbleicons:exchange-horizontal" size="1.2rem" />
                </div>
              </button>
            </div>
            <div class="mt-4">
              <MemberFormMemberData
                :member-data="stage48member"
                :jkt48members="jkt48members"
                @on-update="(data) => $emit('onUpdateMember', data)"
                @on-dismiss="$emit('onDismiss')"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
