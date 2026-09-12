import type { MaybeRefOrGetter } from 'vue'

interface PageSeoOptions {
  title: MaybeRefOrGetter<string>
  description: MaybeRefOrGetter<string>
  image?: MaybeRefOrGetter<string | undefined>
}

/** Metadata shared by indexable editorial and directory pages. */
export function usePageSeo({ title, description, image }: PageSeoOptions) {
  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    twitterTitle: title,
    twitterDescription: description,
    ...(image ? { ogImage: image, twitterImage: image } : {}),
  })
}
