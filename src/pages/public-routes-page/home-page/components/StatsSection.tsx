import {
  Users,
  MessageCircle,
  Globe,
  Shield,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

interface Stat {
  icon: LucideIcon;
  number: string;
  label: string;
  gradient: string;
}

interface StatCardProps {
  stat: Stat;
  index: number;
}

const StatsSection = () => {
  const stats: Stat[] = [
    {
      icon: Users,
      number: "10M+",
      label: "Người dùng hoạt động",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: MessageCircle,
      number: "50M+",
      label: "Tin nhắn mỗi ngày",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: Globe,
      number: "150+",
      label: "Quốc gia",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: Shield,
      number: "99.9%",
      label: "Bảo mật & Uptime",
      gradient: "from-orange-500 to-red-500",
    },
  ];

  return (
    <section className="py-16 bg-white relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 via-transparent to-pink-50 opacity-50" />

      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <StatCard key={index} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

const StatCard = ({ stat, index }: StatCardProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const Icon = stat.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.5, delay: index * 0.1, type: "spring" }}
      className="text-center group"
    >
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${stat.gradient} rounded-2xl mb-4 shadow-lg`}
      >
        <Icon className="w-8 h-8 text-white" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ delay: index * 0.1 + 0.2 }}
        className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2"
      >
        {stat.number}
      </motion.div>
      <div className="text-gray-600 font-medium text-sm md:text-base">
        {stat.label}
      </div>
    </motion.div>
  );
};

export default StatsSection;
