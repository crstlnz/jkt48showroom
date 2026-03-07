export function useShowroomCompetitionDetail<T>() {
  // Keep a single shared Nuxt async-data source for competition detail across app.
  return useApiFetch<T>('/api/showroom_competition_detail', {
    key: 'competition-detail-v1',
    useApiKey: true,
    server: false,
    dedupe: 'defer',
  })
}
