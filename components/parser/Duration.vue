<script lang="ts" setup>
const props = withDefaults(defineProps<{
  parseType: ParseType
  value: string
  year?: boolean
  month?: boolean
  day?: boolean
  hour?: boolean
  minute?: boolean
  second?: boolean
}>(), {
  year: false,
  month: false,
  day: true,
  hour: true,
  minute: true,
  second: true,
})

const { t, locale } = useI18n()
const dayjs = useDayjs()
const date = computed(() => {
  try {
    const l = locale.value
    const ms = Number.parseInt(props.value)
    if (Number.isNaN(ms)) throw new Error('Not a number!')
    const duration = dayjs.duration(ms)
    const str = []
    const year = duration.years()
    const month = duration.months()
    const day = duration.days()
    const hour = duration.hours()
    const minute = duration.minutes()
    const second = duration.seconds()
    if (year && props.year) str.push(`${year || ''} ${t('year', year, { locale: l })}`)
    if (month && props.month) str.push(`${month || ''} ${t('month', month, { locale: l })}`)
    if (day && props.day) str.push(`${day || ''} ${t('day', day, { locale: l })}`)
    if (hour && props.hour) str.push(`${hour || ''} ${t('hour', hour, { locale: l })}`)
    if (minute && props.minute) str.push(`${minute || ''} ${t('minute', minute, { locale: l })}`)
    if (second && props.second) str.push(`${second || ''} ${t('second', second, { locale: l })}`)
    if (!str.length && !props.second) {
      str.push(`${second || '0'} ${t('second', second, { locale: l })}`)
    }
    return str.join(' ')
  }
  catch (e) {
    return 'Parse duration error!'
  }
})
</script>

<template>
  <div> {{ date }} </div>
</template>
