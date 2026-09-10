import { useCallback, useEffect, useMemo, useState } from 'react';
import appConfig from '../config/appConfig';

export const usePagination = ({
  initialPage = 1,
  initialPageSize = appConfig.defaultPageSize,
} = {}) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const clampPage = useCallback(
    (next) => Math.min(Math.max(1, next), totalPages),
    [totalPages],
  );

  const goToPage = useCallback((next) => setPage(clampPage(next)), [clampPage]);

  // A filtered result or deletion can reduce the page count while the user is
  // on a later page. Keep the selected page valid for the next query.
  useEffect(() => {
    setPage((current) => clampPage(current));
  }, [clampPage]);

  const changePageSize = useCallback((size) => {
    setPageSize(size);
    setPage(1);
  }, []);

  const next = useCallback(() => {
    setPage((current) => clampPage(current + 1));
  }, [clampPage]);

  const previous = useCallback(() => {
    setPage((current) => clampPage(current - 1));
  }, [clampPage]);

  return useMemo(
    () => ({
      page,
      pageSize,
      totalItems,
      totalPages,
      setTotalItems,
      goToPage,
      changePageSize,
      next,
      previous,
      queryParams: { page: page - 1, size: pageSize },
    }),
    [page, pageSize, totalItems, totalPages, goToPage, changePageSize, next, previous],
  );
};

export default usePagination;
