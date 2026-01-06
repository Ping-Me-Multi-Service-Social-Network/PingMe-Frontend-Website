import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button.tsx";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { getBlogDetailsById } from "@/services/blog/blogApi.ts";
import type { BlogDetailsResponse } from "@/types/blog/blog.ts";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { toast } from "sonner";
import LoadingSpinner from "@/components/custom/LoadingSpinner.tsx";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb.tsx";
import BlogDetails from "./components/BlogDetails.tsx";
import BlogComments from "./components/BlogComments.tsx";

export default function BlogDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchBlogDetails = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const response = await getBlogDetailsById(Number(id));
        setBlog(response.data.data);
      } catch (error) {
        toast.error(getErrorMessage(error, "Không thể tải chi tiết blog"));
        navigate("/blogs");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogDetails();
  }, [id, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner className="h-12 w-12 text-primary" />
      </div>
    );
  }

  if (!blog) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 py-6">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/blogs")}
              className="text-white hover:bg-white/20 hover:text-white"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link
                    to="/blogs"
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="text-white/60" />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-white font-bold line-clamp-1">
                  {blog.title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <BlogDetails blog={blog} />
        <BlogComments blogId={blog.id} />
      </div>

      {/* Floating Scroll-to-Top Button */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white z-50"
          size="icon"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}
