<script lang="ts" setup>
import { vOnClickOutside } from '@vueuse/components'
import { useNotifications } from '~/store/notifications'

const props = defineProps<{
  member: Admin.MissingJKT48ID
  jkt48members: Admin.JKT48MemberId[]
}>()

const emit = defineEmits<{
  (e: 'dismiss'): void
  (e: 'updateMember', id: string): void
}>()

const { addNotif } = useNotifications()
const pending = ref(false)

const member = ref(props.member)
const jkt48ids = ref([])

async function submit() {
  const form = new FormData()
  pending.value = true
  form.append('_id', member.value._id)
  for (const data of jkt48ids.value) {
    form.append('jkt48id[]', data)
  }

  try {
    await $apiFetch('/api/admin/member/jkt48id', {
      method: 'POST',
      body: form,
    })
    emit('dismiss')
    emit('updateMember', member.value._id)
    addNotif({
      message: `Success add ${member.value.name}!`,
      type: 'success',
    })
  }
  catch (e) {
    console.log(e)
    addNotif({
      message: 'Error!',
      type: 'danger',
    })
  }
  pending.value = false
}
const { escape } = useMagicKeys()
watch(escape, (v) => {
  if (v) { emit('dismiss') }
})
</script>

<template>
  <div class="fixed inset-0 z-aboveNav bg-black/50 overscroll-contain flex justify-center items-center">
    <div v-on-click-outside="() => $emit('dismiss')" class="mx-3 md:mx-4 p-3 flex-wrap md:p-4 rounded-xl flex gap-3 md:gap-3 items-center justify-center bg-container max-w-[90%] md:max-w-[60%]">
      <NuxtImg
        :key="member._id"
        sizes="120px"
        :placeholder="[45, 10, 55, 70]"
        :modifiers="{
          aspectRatio: 1,
          gravity: 'faceCenter',
        }"
        fit="fill"
        format="webp"
        :alt="member.name"
        class="object-cover rounded-full w-32 h-32"
        :src="member.img"
      />
      <div class="flex-1 flex flex-col gap-2">
        <div class="text-xl font-semibold">
          {{ member.name }}
        </div>
        <FormSelectMultiple v-model="jkt48ids" :auto-focus="true" form-id="jkt48id" :data="jkt48members.map(i => ({ title: i.name, value: i.id }))" class="flex-1" input-class="bg-container-2 rounded-md flex-1" />
        <div class="flex justify-end mt-2">
          <button type="button" class="relative bg-blue-500 px-2 py-1 rounded-md disabled:opacity-40 disabled:bg-blue-400" :disabled="!jkt48ids?.length || pending" @click="submit">
            <div :class="{ 'opacity-0': pending }">
              Submit
            </div>
            <Icon :class="{ 'opacity-0': !pending, 'opacity-100': pending }" size="1.4rem" name="svg-spinners:ring-resize" class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
