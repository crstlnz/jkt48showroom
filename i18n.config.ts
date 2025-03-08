export default defineI18nConfig(() => ({
  legacy: false,
  datetimeFormats: {
    en: {
      short: {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
      birthdate: {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
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
      birthdate: {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      },
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
    ja: {},
  },
  numberFormats: {
    en: {
      currency: {
        style: 'currency',
        currency: 'IDR',
        currencyDisplay: 'symbol',
      },
    },
    ja: {
      currency: {
        style: 'currency',
        currency: 'JPY',
        currencyDisplay: 'symbol',
      },
    },
    id: {
      currency: {
        style: 'currency',
        currency: 'IDR',
        currencyDisplay: 'symbol',
      },
    },
  },
}))
