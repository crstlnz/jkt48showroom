interface ParseOptions {
  rate?: number
  showOriginal?: boolean
}

export default function (number: number, _opts: ParseOptions) {
  const opts = {
    showOriginal: false,
    ..._opts,
  }

  const { n } = useI18n()

  if (!opts.rate) return `${n(number)}G`

  if (opts.showOriginal) {
    return `${n(number)}G (± ${n(number * opts.rate)})`
  }
  return `± ${n(number * opts.rate)}`
}
