import type { MaybeRef } from '@vueuse/core'
import { get } from '@vueuse/core'

import dayjs from 'dayjs'
import timeFormat from '~/library/plugins/timeFormat'
import 'dayjs/locale/id'

export default defineNuxtPlugin((nuxtApp) => {
  // nuxtApp.$i18n.onLanguageSwitched = (_oldLocale: any, newLocale: any) => {}

  const locale = (nuxtApp.$i18n as any).localeProperties
  function duration(duration: number, short?: boolean): ComputedRef<string>
  function duration(dateFrom: Date | string | number, dateTo?: Date | string | number | boolean, short?: boolean): ComputedRef<string>
  function duration(dateFrom: Date | string | number, dateTo?: Date | string | number | boolean, short?: boolean): ComputedRef<string> {
    if (!dateTo || typeof dateTo === 'boolean') {
      return computed(() => timeFormat.detailDuration(0, dateFrom, locale.value.code, dateTo ? 2 : Number.POSITIVE_INFINITY))
    }
    return computed(() => timeFormat.detailDuration(dateFrom, dateTo, locale.value.code, short ? 2 : Number.POSITIVE_INFINITY))
  }

  return {
    provide: {
      fromNow: (date: Date | string | number) => {
        return computed(() => dayjs(date).locale(locale.value.code).fromNow())
      },
      duration,
      // moment,
      day(time: MaybeRef<Date | string | number | null | undefined>) {
        return computed(() => {
          const d = get(time)
          if (!d) return null
          const date = dayjs(new Date(d).toISOString()).locale(locale.value.code).format('dddd, DD MMMM YYYY')
          if (date === 'Invalid date') return null
          return date
        })
      },
      clock(time: MaybeRef<Date | string | number | null | undefined>) {
        return computed(() => {
          const d = get(time)
          if (!d) return null
          const date = dayjs(new Date(d).toISOString()).locale(locale.value.code).format('HH:mm:ss A')
          if (date === 'Invalid date') return null
          return date
        })
      },
      long(time: MaybeRef<Date | string | number | null | undefined>) {
        return computed(() => {
          const d = get(time)
          if (!d) return null
          const date = dayjs(new Date(d).toISOString()).locale(locale.value.code).format('LLLL')
          if (date === 'Invalid date') return null
          return date
        })
      },
      formatSR(time: MaybeRef<Date | string | number>) {
        if (!get(time)) return null
        const date = dayjs(new Date(get(time)).toISOString()).locale('en').format('h:mm A')
        if (date === 'Invalid date') return null
        return `${date}~`
      },
      toDateString(time: MaybeRef<Date | string | number>) {
        return computed(() => {
          if (!get(time)) return null
          const date = dayjs(new Date(get(time)).toISOString()).locale(locale.value.code).format('D MMM YY')
          if (date === 'Invalid date') return null
          return date
        })
      },
    },
  }
})
