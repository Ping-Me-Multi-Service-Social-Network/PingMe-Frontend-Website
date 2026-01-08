import { Button } from "@/components/ui/button.tsx";
import { CheckCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background with Image */}
      <div className="absolute inset-0">
        <img
          src="/images/cta-background.jpg"
          alt="Join PingMe"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/95 via-purple-800/90 to-pink-900/95" />
      </div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto text-center px-4 relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white mb-6"
        >
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Miễn phí mãi mãi</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-4xl md:text-5xl font-bold text-white mb-6"
        >
          Sẵn sàng bắt đầu hành trình?
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-xl text-purple-100 mb-8 leading-relaxed"
        >
          Tham gia cùng hàng triệu người dùng đang sử dụng PingMe để kết nối,
          chia sẻ và khám phá những điều tuyệt vời mỗi ngày.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
        >
          <Button
            size="lg"
            onClick={() => navigate("/auth?mode=register")}
            className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
          >
            Tạo tài khoản miễn phí
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate("/auth?mode=login")}
            className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-6 text-lg font-semibold bg-transparent"
          >
            Đăng nhập ngay
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, staggerChildren: 0.1 }}
          className="flex flex-wrap items-center justify-center gap-6 text-purple-200"
        >
          {[
            "Miễn phí 100%",
            "Không quảng cáo",
            "Bảo mật tuyệt đối",
            "Hỗ trợ 24/7",
          ].map((text, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="flex items-center gap-2"
            >
              <CheckCircle className="w-5 h-5" />
              <span>{text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default CTASection;
