import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { MessageCircle, Contact, MessageSquare, Music } from "lucide-react";
import { LazyMotion, domAnimation, m, useInView } from "framer-motion";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface Feature {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
  gradient: string;
}

export default function IntroSection() {
  const { t } = useTranslation("landing");
  return (
    <div id="intro-section">
      {/* Features Section */}
      <FeaturesSection t={t} />

      {/* CTA Section */}
      <CTASection t={t} />
    </div>
  );
}

function FeaturesSection({ t }: Readonly<{ t: any }>) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const features: Feature[] = [
    {
      id: "chat",
      icon: MessageSquare,
      title: t("features.chat.title"),
      description: t("features.chat.desc"),
      image: "/images/feature-chat.webp",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      id: "contacts",
      icon: Contact,
      title: t("features.contacts.title"),
      description: t("features.contacts.desc"),
      image: "/images/feature-contacts.webp",
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      id: "reels",
      icon: MessageCircle,
      title: t("features.reels.title"),
      description: t("features.reels.desc"),
      image: "/images/feature-reels.webp",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      id: "music",
      icon: Music,
      title: t("features.music.title"),
      description: t("features.music.desc"),
      image: "/images/feature-music.webp",
      gradient: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <section className="py-20 bg-linear-to-b from-white via-purple-50/30 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <LazyMotion features={domAnimation}>
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-4"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              {t("features.title")}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {t("features.subtitle")}
            </p>
          </m.div>
        </LazyMotion>

        <div className="space-y-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isOdd = index % 2 !== 0;

            return (
              <FeatureCard
                key={feature.id}
                feature={feature}
                index={index}
                isOdd={isOdd}
                Icon={Icon}
                onNavigate={scrollToTop}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  feature,
  index,
  isOdd,
  Icon,
  onNavigate,
}: Readonly<{
  feature: Feature;
  index: number;
  isOdd: boolean;
  Icon: LucideIcon;
  onNavigate: () => void;
}>) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        <Card
          onClick={onNavigate}
          className="border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden cursor-pointer group bg-white"
        >
          <CardContent className="p-0">
            <div
              className={`grid md:grid-cols-2 gap-0 ${isOdd ? "md:grid-flow-dense" : ""}`}
            >
              <m.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`relative h-64 md:h-auto overflow-hidden ${isOdd ? "md:col-start-2" : ""}`}
              >
                <div
                  className={`absolute inset-0 bg-linear-to-br ${feature.gradient} opacity-20 group-hover:opacity-30 transition-opacity`}
                />
                <img
                  src={feature.image || "/placeholder.svg"}
                  alt={feature.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <m.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={
                    isInView
                      ? { scale: 1, opacity: 1 }
                      : { scale: 0.95, opacity: 0 }
                  }
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className={`absolute top-6 left-6 w-16 h-16 bg-linear-to-br ${feature.gradient} rounded-2xl flex items-center justify-center shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </m.div>
              </m.div>

              <div className="p-8 md:p-12 flex flex-col justify-center">
                <h3 className="text-3xl font-bold text-gray-900 mb-4 group-hover:text-purple-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </m.div>
    </LazyMotion>
  );
}

function CTASection({ t }: Readonly<{ t: any }>) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <LazyMotion features={domAnimation}>
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-r from-purple-900/95 via-purple-800/90 to-pink-900/95" />
        </div>

        <m.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center px-4 relative z-10"
        >
          <m.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            {t("cta.title")}
          </m.h2>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-xl text-purple-100 mb-8 leading-relaxed"
          >
            {t("cta.desc")}
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10"
          >
            <Button
              size="lg"
              onClick={scrollToTop}
              className="bg-white text-purple-600 hover:bg-purple-50 px-8 py-6 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all"
            >
              {t("cta.btnRegister")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={scrollToTop}
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-6 text-lg font-semibold bg-transparent"
            >
              {t("cta.btnLogin")}
            </Button>
          </m.div>
        </m.div>
      </section >
    </LazyMotion >
  );
}
