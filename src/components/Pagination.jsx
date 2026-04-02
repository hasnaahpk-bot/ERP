import { usePagination } from "../context/PaginationContext";

const Pagination = ({ section, totalPages }) => {
  const { getPage, changePage } = usePagination();
  const currentPage = getPage(section);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-8 pb-4">
      
      {/* Prev */}
      <button
        onClick={() => changePage(section, currentPage - 1, totalPages)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 transition"
      >
        ← Prev
      </button>

      {/* Pages */}
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => changePage(section, page, totalPages)}
          className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
            page === currentPage
              ? "bg-blue-600 text-white shadow"
              : "border hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      ))}

      {/* Next */}
      <button
        onClick={() => changePage(section, currentPage + 1, totalPages)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 transition"
      >
        Next →
      </button>
    </div>
  );
};

export default Pagination;