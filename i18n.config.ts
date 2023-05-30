export default defineI18nConfig(_nuxt => ({
  legacy: false,
  datetimeFormats: {
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
      },
    },
    id: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      long: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
      },
    },
  },
  numberFormats: {
    'en-US': {
      currency: {
        style: 'currency',
        currency: 'USD',
      },
    },
    'ja-JP': {
      currency: {
        style: 'currency',
        currency: 'JPY',
        currencyDisplay: 'symbol',
      },
    },
    'id-ID': {
      currency: {
        style: 'currency',
        currency: 'IDR',
        currencyDisplay: 'symbol',
      },
    },
  },
}))
