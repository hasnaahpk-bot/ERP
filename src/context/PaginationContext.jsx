import { createContext, useContext, useState } from "react";

const PaginationContext = createContext();

export const PaginationProvider = ({ children }) => {
  const [pages, setPages] = useState({});

  const changePage = (section, page, totalPages) => {
    setPages((prev) => {
      const safePage = Math.max(1, Math.min(page, totalPages));
      return { ...prev, [section]: safePage };
    });
  };

  const getPage = (section) => {
    return pages[section] || 1;
  };

  const paginate = (section, data, pageSize) => {
    const currentPage = getPage(section);
    const totalPages = Math.ceil(data.length / pageSize);

    const safePage = Math.max(1, Math.min(currentPage, totalPages || 1));

    const start = (safePage - 1) * pageSize;
    const sliced = data.slice(start, start + pageSize);

    return {
      currentPage: safePage,
      totalPages,
      data: sliced,
    };
  };

  return (
    <PaginationContext.Provider
      value={{ getPage, changePage, paginate }}
    >
      {children}
    </PaginationContext.Provider>
  );
};

export const usePagination = () => useContext(PaginationContext);