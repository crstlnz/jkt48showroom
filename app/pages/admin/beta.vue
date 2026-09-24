<script lang="ts" setup>
import { useNotifications } from '~/store/notifications'

interface BypassKey {
  _id: string
  expiresAt: string
  deviceCount: number
  maxDevices?: number
  note?: string
  createdAt: string
}

interface BetaDevice {
  _id: string
  fingerprint: string
  note?: string
  lastSeenAt?: string
  createdAt: string
  bypassKey?: {
    note?: string
    expiresAt: string
  } | null
}

const { data: keys, pending, refresh } = await useApiFetch<BypassKey[]>('/api/admin/beta', { server: false })
const { data: devices, pending: devicesPending, refresh: refreshDevices } = await useApiFetch<BetaDevice[]>('/api/admin/beta_device', { server: false })
const { addNotif } = useNotifications()
const activeTab = ref<'token' | 'device'>('token')
const note = ref('')
const expiresAt = ref(toDateTimeLocal(new Date(Date.now() + 24 * 60 * 60 * 1000)))
const maxDevices = ref<number | '' | undefined>()
const generatedLink = ref('')
const creating = ref(false)
const refreshing = ref(false)

function toDateTimeLocal(value: Date) {
  const offset = value.getTimezoneOffset()
  return new Date(value.getTime() - offset * 60 * 1000).toISOString().slice(0, 16)
}

async function createKey() {
  try {
    creating.value = true
    const result = await $apiFetch<{ key: string }>('/api/admin/beta', {
      method: 'POST',
      body: {
        expiresAt: new Date(expiresAt.value).toISOString(),
        note: note.value,
        maxDevices: maxDevices.value === '' ? undefined : maxDevices.value,
      },
    })
    generatedLink.value = `${window.location.origin}/multi#betakey=${encodeURIComponent(result.key)}`
    note.value = ''
    maxDevices.value = undefined
    await refresh()
    addNotif({ type: 'success', message: 'Token berhasil dibuat.' })
  }
  catch {
    addNotif({ type: 'danger', message: 'Gagal membuat token.' })
  }
  finally {
    creating.value = false
  }
}

async function revokeKey(key: BypassKey) {
  try {
    await $apiFetch(`/api/admin/beta/${key._id}`, { method: 'DELETE' })
    await refresh()
    addNotif({ type: 'success', message: 'Token dicabut.' })
  }
  catch {
    addNotif({ type: 'danger', message: 'Gagal mencabut token.' })
  }
}

async function copyKey() {
  await navigator.clipboard.writeText(generatedLink.value)
  addNotif({ type: 'success', message: 'Link disalin.' })
}

async function refreshData() {
  try {
    refreshing.value = true
    await Promise.all([refresh(), refreshDevices()])
  }
  catch {
    addNotif({ type: 'danger', message: 'Gagal memuat ulang data beta.' })
  }
  finally {
    refreshing.value = false
  }
}

async function revokeDevice(device: BetaDevice) {
  try {
    await $apiFetch(`/api/admin/beta_device/${encodeURIComponent(device.fingerprint)}`, { method: 'DELETE' })
    await refreshDevices()
    addNotif({ type: 'success', message: 'Device dicabut.' })
  }
  catch {
    addNotif({ type: 'danger', message: 'Gagal mencabut device.' })
  }
}

definePageMeta({ middleware: 'admin' })
</script>

<template>
  <LayoutRow title="Beta">
    <div class="space-y-4 px-3 md:px-4 pb-5">
      <div class="flex items-center justify-between gap-3">
        <div class="bg-container inline-flex rounded-xl p-1 text-sm">
          <button type="button" class="rounded-lg px-3 py-1.5" :class="activeTab === 'token' ? 'bg-blue-500 text-white' : 'hover:bg-container-2'" @click="activeTab = 'token'">
            Token
          </button>
          <button type="button" class="rounded-lg px-3 py-1.5" :class="activeTab === 'device' ? 'bg-blue-500 text-white' : 'hover:bg-container-2'" @click="activeTab = 'device'">
            Device
          </button>
        </div>
        <button type="button" :disabled="refreshing" class="bg-container rounded-xl px-3 py-2 text-sm hover:bg-hover disabled:opacity-50 flex items-center gap-0.5" @click="refreshData">
          <Icon :name="refreshing ? 'svg-spinners:ring-resize' : 'solar:refresh-bold'" class="mr-1" />
          Refresh
        </button>
      </div>

      <template v-if="activeTab === 'token'">
        <form class="bg-container space-y-4 rounded-xl p-4" @submit.prevent="createKey">
          <div class="flex items-center gap-2 text-lg font-bold">
            <Icon name="solar:key-minimalistic-square-3-bold" />
            Buat token baru
          </div>
          <label class="block text-sm">
            Catatan
            <input v-model="note" maxlength="200" placeholder="Contoh: Laptop Ella" class="bg-container-2 mt-1 w-full rounded-lg px-3 py-2 outline-none">
          </label>
          <label class="block text-sm">
            Token dapat digunakan sampai
            <input v-model="expiresAt" type="datetime-local" required class="bg-container-2 mt-1 w-full rounded-lg px-3 py-2 outline-none">
          </label>
          <label class="block text-sm">
            Batas device <span class="opacity-70">(opsional)</span>
            <input v-model.number="maxDevices" type="number" min="1" step="1" placeholder="Tanpa batas" class="bg-container-2 mt-1 w-full rounded-lg px-3 py-2 outline-none">
          </label>
          <p class="text-xs opacity-70">
            Device yang terdaftar tetap aktif sampai dicabut, meski token sudah kedaluwarsa.
          </p>
          <button type="submit" :disabled="creating" class="rounded-xl bg-blue-500 px-4 py-2 text-sm text-white disabled:opacity-50">
            {{ creating ? 'Membuat...' : 'Buat key' }}
          </button>
        </form>

        <div v-if="generatedLink" class="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-4">
          <div class="text-sm font-bold">
            Salin link ini sekarang — key hanya ditampilkan sekali.
          </div>
          <div class="mt-2 flex items-center gap-2">
            <code class="bg-container flex-1 overflow-x-auto rounded-lg px-3 py-2 text-sm">{{ generatedLink }}</code>
            <button type="button" class="rounded-lg bg-container px-3 py-2" title="Copy link" @click="copyKey">
              <Icon name="solar:copy-bold" />
            </button>
          </div>
        </div>

        <div v-if="pending" class="py-8 text-center">
          <Icon name="svg-spinners:ring-resize" size="1.5rem" />
        </div>
        <div v-else-if="!keys?.length" class="bg-container rounded-xl p-4 text-center text-sm opacity-70">
          Belum ada token.
        </div>
        <div v-else class="space-y-3">
          <div v-for="key in keys" :key="key._id" class="bg-container flex flex-wrap items-center gap-3 rounded-xl p-4">
            <div class="min-w-0 flex-1">
              <div class="truncate font-medium">
                {{ key.note || 'Tanpa catatan' }}
              </div>
              <div class="mt-1 text-xs opacity-70">
                Expire: {{ new Date(key.expiresAt).toLocaleString() }}
              </div>
              <div class="mt-1 text-xs text-green-500">
                {{ key.deviceCount }}{{ key.maxDevices ? ` / ${key.maxDevices}` : '' }} device terhubung
              </div>
            </div>
            <span class="rounded-full px-2 py-1 text-xs" :class="new Date(key.expiresAt) < new Date() ? 'bg-red-500/15 text-red-500' : 'bg-blue-500/15 text-blue-500'">
              {{ new Date(key.expiresAt) < new Date() ? 'Expired' : 'Aktif' }}
            </span>
            <button type="button" class="rounded-lg p-2 text-red-500" title="Cabut key" @click="revokeKey(key)">
              <Icon name="solar:trash-bin-trash-bold" />
            </button>
          </div>
        </div>
      </template>

      <template v-else>
        <div v-if="devicesPending" class="py-8 text-center">
          <Icon name="svg-spinners:ring-resize" size="1.5rem" />
        </div>
        <div v-else-if="!devices?.length" class="bg-container rounded-xl p-4 text-center text-sm opacity-70">
          Belum ada device.
        </div>
        <div v-else class="space-y-3">
          <div v-for="device in devices" :key="device._id" class="bg-container flex items-start gap-3 rounded-xl p-4">
            <div class="min-w-0 flex-1">
              <div class="truncate font-mono text-sm">
                {{ device.fingerprint }}
              </div>
              <div class="mt-2 grid gap-1 text-xs opacity-70">
                <div>Catatan: {{ device.note || '-' }}</div>
                <div>Token: {{ device.bypassKey?.note || '-' }}</div>
                <div v-if="device.lastSeenAt">
                  Terakhir aktif: {{ new Date(device.lastSeenAt).toLocaleString() }}
                </div>
              </div>
            </div>
            <button type="button" class="rounded-lg p-2 text-red-500" title="Revoke device" @click="revokeDevice(device)">
              <Icon name="solar:trash-bin-trash-bold" />
            </button>
          </div>
        </div>
      </template>
    </div>
  </LayoutRow>
</template>
