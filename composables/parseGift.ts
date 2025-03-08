interface ParseOptions {
  rate?: number
  showOriginal?: boolean
}

export default function (number: number, _opts: ParseOptions) {
  const opts = {
    showOriginal: false,
    ..._opts,
  }

  const { n, numberFormats } = useI18n()
  console.log(numberFormats.value)
  if (!opts.rate) return `${n(number)}G`

  if (opts.showOriginal) {
    return `${n(number)}G (± ${n(number * opts.rate, 'currency', 'id')})`
  }
  return `± ${n(number * opts.rate, 'currency', 'id')}`
}
