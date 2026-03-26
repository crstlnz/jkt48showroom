<script lang="ts" setup>
import { NuxtLink } from '#components'
import dayjs from 'dayjs'

const props = defineProps<{
  member: IMemberBirthDay
}>()

const { t, locale } = useI18n()

const profileLink = computed(() => props.member.url_key ? `/member/${props.member.url_key}` : undefined)

const nextBirthday = computed(() => {
  const baseBirthday = dayjs(props.member.birthdate)
  if (!baseBirthday.isValid()) return null

  const today = dayjs().startOf('day')
  const birthdayThisYear = baseBirthday.year(today.year()).startOf('day')
  return birthdayThisYear.isBefore(today) ? birthdayThisYear.add(1, 'year') : birthdayThisYear
})

const daysUntilBirthday = computed(() => {
  if (!nextBirthday.value) return null
  return nextBirthday.value.diff(dayjs().startOf('day'), 'day')
})

function getOrdinal(value: number): string {
  const remainder100 = value % 100
  if (remainder100 >= 11 && remainder100 <= 13) return `${value}th`

  switch (value % 10) {
    case 1:
      return `${value}st`
    case 2:
      return `${value}nd`
    case 3:
      return `${value}rd`
    default:
      return `${value}th`
  }
}

const nextAgeLabel = computed(() => {
  if (!nextBirthday.value) return null

  const birthYear = dayjs(props.member.birthdate).year()
  const nextAge = nextBirthday.value.year() - birthYear
  if (!Number.isFinite(nextAge) || nextAge <= 0) return null

  return locale.value === 'id'
    ? `Ulang tahun ke-${nextAge}`
    : `${getOrdinal(nextAge)} birthday`
})

const birthdayBadge = computed(() => {
  const days = daysUntilBirthday.value

  if (days === 0) {
    return {
      label: t('today'),
      pillClass: 'border-red-500/20 bg-red-500 text-white',
    }
  }

  if (days === 1) {
    return {
      label: locale.value === 'id' ? '1 hari lagi' : 'In 1 day',
      pillClass: 'border-amber-400/25 bg-amber-400/90 text-black',
    }
  }

  return {
    label: days == null
      ? t('birthday.next')
      : locale.value === 'id'
        ? `${days} hari lagi`
        : `In ${days} ${t('day', days, { locale: locale.value })}`,
    pillClass: 'border-black/8 bg-black/[0.04] text-black/75 dark:border-white/10 dark:bg-white/[0.06] dark:text-white/75',
  }
})
</script>

<template>
  <component
    :is="profileLink ? NuxtLink : 'div'"
    :to="profileLink"
    class="group flex w-full h-full rounded-xl border border-black/8 bg-container p-3 transition-colors duration-200 max-sm:bg-hover/70 dark:max-sm:bg-white/3 sm:hover:bg-hover/70 dark:border-white/8 dark:hover:bg-white/3"
  >
    <div class="flex-1 flex items-center gap-2.5 md:gap-3">
      <div class="relative shrink-0">
        <div class="overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/8">
          <Image
            class="h-18 w-18 object-cover transition-transform duration-300 group-hover:scale-105 md:h-20 md:w-20"
            :src="member.img"
            :alt="`${member.name} Profile Picture`"
            loading="lazy"
            fit="cover"
            :modifiers="{
              aspectRatio: 1,
              gravity: 'faceCenter',
            }"
            sizes="72px md:80px"
            :placeholder="[10, 10, 75, 5]"
            format="webp"
          />
        </div>
        <div class="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border border-black/8 bg-container text-[0.8rem] dark:border-white/10">
          <Icon name="twemoji:birthday-cake" size="0.75rem" />
        </div>
      </div>
      <div class="min-w-0 flex-1 space-y-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
          <div class="min-w-0 flex-1">
            <div class="truncate text-[15px] leading-tight font-bold text-black/90 dark:text-white/90 md:text-base">
              {{ member.name }}
            </div>
          </div>

          <div
            class="max-w-full shrink-0 rounded-full border px-2 py-0.75 text-xs sm:text-[10px] leading-none font-semibold whitespace-nowrap"
            :class="birthdayBadge.pillClass"
          >
            {{ birthdayBadge.label }}
          </div>
        </div>

        <div class="flex min-w-0 items-center gap-1.5 text-sm text-black/62 dark:text-white/62">
          <Icon name="lucide:calendar-days" class="shrink-0 text-sm" />
          <span class="truncate">{{ $dayjs(member.birthdate).locale(locale).format("DD MMMM YYYY") }}</span>
        </div>

        <div v-if="nextAgeLabel" class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-black/58 dark:text-white/58">
          <Icon name="lucide:gift" class="shrink-0 text-[0.85rem]" />
          <span class="truncate">{{ nextAgeLabel }}</span>
        </div>
      </div>
    </div>
  </component>
</template>
