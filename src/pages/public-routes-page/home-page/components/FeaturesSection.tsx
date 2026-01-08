"use client";

import { Card, CardContent } from "@/components/ui/card.tsx";
import {
  BookOpen,
  MessageCircle,
  Contact,
  MessageSquare,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/features/store";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  gradient: string;
  link: string;
}

interface FeatureCardProps {
  feature: Feature;
  index: number;
  isEven: boolean;
  Icon: LucideIcon;
  navigate: (path: string) => void;
}

const FeaturesSection = () => {
  const navigate = useNavigate();
  const { isLogin } = useSelector((state: RootState) => state.auth);

  const features: Feature[] = [
    {
      icon: MessageCircle,
      title: "Nhật ký",
      description:
        "Chia sẻ khoảnh khắc hàng ngày, cảm xúc và suy nghĩ của bạn với bạn bè. Giống như mạng xã hội, đăng tức thì không cần duyệt.",
      image: "/images/feature-diary.jpg",
      gradient: "from-blue-500 to-cyan-500",
      link: "/diaries",
    },
    {
      icon: BookOpen,
      title: "Blog",
      description:
        "Viết và chia sẻ bài viết chuyên sâu, hướng dẫn và kiến thức. Nội dung được kiểm duyệt để đảm bảo chất lượng cao.",
      image: "/images/feature-blog.jpg",
      gradient: "from-purple-500 to-pink-500",
      link: "/blogs",
    },
    {
      icon: MessageSquare,
      title: "Chat",
      description:
        "Trò chuyện trực tiếp với bạn bè, chia sẻ tin nhắn, hình ảnh và cảm xúc. Kết nối nhanh chóng và tiện lợi mọi lúc mọi nơi.",
      image: "/images/feature-video.jpg",
      gradient: "from-green-500 to-emerald-500",
      link: "/chat/messages",
    },
    {
      icon: Contact,
      title: "Danh bạ",
      description:
        "Quản lý danh sách bạn bè, tìm kiếm người dùng mới và kết nối với những người bạn quan tâm. Xây dựng mạng lưới của bạn.",
      image: "/images/feature-contacts.jpg",
      gradient: "from-indigo-500 to-purple-500",
      link: "/chat/contacts",
    },
  ];

  const handleFeatureClick = (link: string) => {
    if (isLogin) {
      navigate(link);
    } else {
      navigate("/auth?mode=login");
    }
  };

  return (
    <section
      id="features-section"
      className="py-20 bg-gradient-to-b from-white via-purple-50/30 to-white"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
            Khám phá tính năng
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            PingMe mang đến trải nghiệm giao tiếp toàn diện với đầy đủ các tính
            năng hiện đại
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isEven = index % 2 === 0;

            return (
              <FeatureCard
                key={index}
                feature={feature}
                index={index}
                isEven={isEven}
                Icon={Icon}
                navigate={handleFeatureClick}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

const FeatureCard = ({
  feature,
  index,
  isEven,
  Icon,
  navigate,
}: FeatureCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      <Card
        onClick={() => navigate(feature.link)}
        className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group bg-white"
      >
        <CardContent className="p-0">
          <div
            className={`grid md:grid-cols-2 gap-0 ${
              !isEven ? "md:grid-flow-dense" : ""
            }`}
          >
            {/* Image Side */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className={`relative h-64 md:h-auto overflow-hidden ${
                !isEven ? "md:col-start-2" : ""
              }`}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}
              />
              <img
                src={feature.image || "/placeholder.svg"}
                alt={feature.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={isInView ? { scale: 1 } : { scale: 0 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className={`absolute top-6 left-6 w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>

            {/* Content Side */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                {feature.title}
              </h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-6 flex items-center text-purple-600 font-semibold group-hover:gap-3 gap-2 transition-all">
                Khám phá ngay
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeaturesSection;
