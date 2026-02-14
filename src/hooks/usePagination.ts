import { useCallback, useState } from "react";

interface UsePaginationReturn {
  currentPage: number;
  itemsPerPage: number;
  totalElements: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  setTotalElements: (total: number) => void;
  setTotalPages: (pages: number) => void;
  resetPagination: () => void;
}

export const usePagination = (
  initialItemsPerPage = 20,
): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setTotalElements(0);
    setTotalPages(1);
  }, []);

  return {
    currentPage,
    itemsPerPage,
    totalElements,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
    setTotalElements,
    setTotalPages,
    resetPagination,
  };
};
