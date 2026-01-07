import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  totalElements: number;
  itemsPerPage: number;
  setItemsPerPage: (itemsPerPage: number) => void;
  showItemsPerPageSelect?: boolean;
}

const Pagination = ({
  currentPage,
  itemsPerPage,
  setCurrentPage,
  setItemsPerPage,
  totalPages,
  totalElements,
  showItemsPerPageSelect = true,
}: PaginationProps) => {
  const pagination = () => {
    if (totalPages <= 1) return [1];

    const center: (number | string)[] = [
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
    ],
      filteredCenter = center.filter(
        (p) => (p as number) > 1 && (p as number) < totalPages
      ),
      includeThreeLeft = currentPage === 5,
      includeThreeRight = currentPage === totalPages - 4,
      includeLeftDots = currentPage > 5,
      includeRightDots = currentPage < totalPages - 4;

    if (includeThreeLeft) filteredCenter.unshift(2);
    if (includeThreeRight) filteredCenter.push(totalPages - 1);

    if (includeLeftDots) filteredCenter.unshift("...");
    if (includeRightDots) filteredCenter.push("...");

    return [1, ...filteredCenter, totalPages];
  };

  const pages = pagination();

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-900/40 backdrop-blur-sm border-t border-gray-700/50">
      <div className="flex items-center text-sm text-gray-300">
        Hiển thị{" "}
        <span className="font-medium text-purple-400 mx-1">
          {(currentPage - 1) * itemsPerPage + 1}
        </span>{" "}
        đến{" "}
        <span className="font-medium text-purple-400 mx-1">
          {Math.min(currentPage * itemsPerPage, totalElements)}
        </span>{" "}
        trong tổng số{" "}
        <span className="font-medium text-purple-400 mx-1">{totalElements}</span>{" "}
        kết quả
      </div>

      <div className="flex items-center gap-4">
        {showItemsPerPageSelect && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Hiển thị:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20 h-8 bg-gray-800/60 border-gray-700 text-gray-200 focus:border-purple-500 focus:ring-purple-500/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 px-3 bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-purple-600/20 hover:border-purple-600 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800/60 disabled:hover:border-gray-700 transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Trước
          </Button>

          {pages.map((page, index) =>
            typeof page === "string" && page === "..." ? (
              <span key={index} className="px-2 text-gray-500">
                ...
              </span>
            ) : (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => {
                  if ((page as number) === currentPage) return;
                  setCurrentPage(page as number);
                }}
                className={`h-8 w-8 p-0 transition-all duration-200 ${page === currentPage
                    ? "bg-purple-600 border-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-900/30"
                    : "bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-purple-600/20 hover:border-purple-600 hover:text-purple-300"
                  }`}
              >
                {page}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 px-3 bg-gray-800/60 border-gray-700 text-gray-300 hover:bg-purple-600/20 hover:border-purple-600 hover:text-purple-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-gray-800/60 disabled:hover:border-gray-700 transition-all duration-200"
          >
            Sau
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Pagination);
