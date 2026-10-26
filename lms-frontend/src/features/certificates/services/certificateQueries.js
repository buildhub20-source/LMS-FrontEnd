import certificateService from './certificateService';
export const certificateListOptions = (userId) => ({
  queryKey: ['certificates', 'list', userId],
  queryFn: () => certificateService.list({ page: 0, size: 200 }),
  retry: false,
  retryOnMount: false,
  staleTime: 30_000,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
});
export const certificateItems = (page) => (Array.isArray(page) ? page : (page?.content ?? []));
