import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { BlogReviewResponse } from "@/types/blog/blog.ts";
import { useSelector } from "react-redux";
import type { RootState } from "@/features/store";
import { HeroSection } from "./components/HeroSection";
import { SearchAndFilterSection } from "./components/SearchAndFilterSection";
import { BlogGrid } from "./components/BlogGrid";
import { Plus } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getAllApprovedBlogs,
  getCurrentUserBlogs,
} from "@/services/blog/blogApi.ts";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";
import { usePagination } from "@/hooks/use-pagination";
import Pagination from "@/components/custom/Pagination";
import { getErrorMessage } from "@/utils/errorMessageHandler";

export default function BlogPage() {
  // Auth State
  const { isLogin } = useSelector((state: RootState) => state.auth);

  // Navigation
  const navigate = useNavigate();

  // Search
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Query Url
  const [searchParams, setSearchParams] = useSearchParams();
  const mode = searchParams.get("mode");
  const [activeTab, setActiveTab] = useState<"all" | "my">(
    mode === "self" ? "my" : "all"
  );

  // Data
  const [allBlogs, setAllBlogs] = useState<BlogReviewResponse[]>([]);
  const [myBlogs, setMyBlogs] = useState<BlogReviewResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMyBlogsLoading, setIsMyBlogsLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Pagination
  const {
    currentPage,
    itemsPerPage,
    totalElements,
    totalPages,
    setCurrentPage,
    setItemsPerPage,
    setTotalElements,
    setTotalPages,
    resetPagination,
  } = usePagination(20);

  // ==========================================================
  // Fetch Data
  // ==========================================================
  useEffect(() => {
    const currentMode = searchParams.get("mode");
    if (currentMode === "self" && activeTab !== "my") {
      setActiveTab("my");
    } else if ((!currentMode || currentMode === "all") && activeTab !== "all") {
      setActiveTab("all");
    }
  }, [searchParams, activeTab]);

  const fetchBlogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const filters: string[] = [];

      if (debouncedSearchQuery.trim()) {
        filters.push(`title ~ '*${debouncedSearchQuery.trim()}*'`);
      }

      if (selectedCategory !== "all") {
        filters.push(`category = '${selectedCategory}'`);
      }

      const filter = filters.length > 0 ? filters.join(" and ") : undefined;

      const response = await getAllApprovedBlogs({
        page: currentPage,
        size: itemsPerPage,
        filter,
      });

      setAllBlogs(response.data.data.content);
      setTotalElements(response.data.data.totalElements);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải danh sách blog"));
    } finally {
      setIsLoading(false);
    }
  }, [
    debouncedSearchQuery,
    selectedCategory,
    currentPage,
    itemsPerPage,
    setTotalElements,
    setTotalPages,
  ]);

  const fetchMyBlogs = useCallback(async () => {
    setIsMyBlogsLoading(true);
    try {
      const filters: string[] = [];

      if (debouncedSearchQuery.trim()) {
        filters.push(`title ~ '*${debouncedSearchQuery.trim()}*'`);
      }

      if (selectedCategory !== "all") {
        filters.push(`category = '${selectedCategory}'`);
      }

      const filter = filters.length > 0 ? filters.join(" and ") : undefined;

      const response = await getCurrentUserBlogs({
        page: currentPage,
        size: itemsPerPage,
        filter,
      });

      setMyBlogs(response.data.data.content);
      setTotalElements(response.data.data.totalElements);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      toast.error(getErrorMessage(error, "Không thể tải bài viết của bạn"));
    } finally {
      setIsMyBlogsLoading(false);
    }
  }, [
    debouncedSearchQuery,
    selectedCategory,
    currentPage,
    itemsPerPage,
    setTotalElements,
    setTotalPages,
  ]);

  useEffect(() => {
    resetPagination();
  }, [debouncedSearchQuery, selectedCategory, activeTab, resetPagination]);

  // ==========================================================
  // Change Tab
  // ==========================================================
  const handleTabChange = (tab: "all" | "my") => {
    setActiveTab(tab);
    const newMode = tab === "my" ? "self" : "all";
    setSearchParams({ mode: newMode });
  };

  useEffect(() => {
    if (activeTab === "all") {
      fetchBlogs();
    } else if (activeTab === "my") {
      fetchMyBlogs();
    }
  }, [activeTab, currentPage, itemsPerPage, fetchBlogs, fetchMyBlogs]);

  const displayBlogs = activeTab === "all" ? allBlogs : myBlogs;
  const currentLoading = activeTab === "all" ? isLoading : isMyBlogsLoading;

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      {isLogin && (
        <div className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur-md shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between py-2 px-12">
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="lg"
                  className={`rounded-lg px-6 py-3 font-semibold transition-all ${
                    activeTab === "all"
                      ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                  onClick={() => handleTabChange("all")}
                >
                  Tất cả bài viết
                </Button>
                <Button
                  variant="ghost"
                  size="lg"
                  className={`rounded-lg px-6 py-3 font-semibold transition-all ${
                    activeTab === "my"
                      ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                  onClick={() => handleTabChange("my")}
                >
                  Bài viết của tôi
                </Button>
              </div>
              <Button
                onClick={() => navigate("/blogs/upsert")}
                className="gap-2"
                size="lg"
              >
                <Plus className="h-5 w-5" />
                Tạo Blog
              </Button>
            </div>
          </div>
        </div>
      )}

      <SearchAndFilterSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
      />

      <div className="container mx-auto px-4 py-12">
        <BlogGrid
          blogs={displayBlogs}
          showApprovalStatus={activeTab === "my"}
          loading={currentLoading}
          showEditButton={activeTab === "my"}
        />

        {!currentLoading && displayBlogs.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              itemsPerPage={itemsPerPage}
              setItemsPerPage={setItemsPerPage}
              showItemsPerPageSelect={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}
