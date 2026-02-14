import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppSelector } from "@/features/hooks";
import AuthSection from "./components/AuthSection";
import LandingFooter from "./components/LandingFooter";
import IntroSection from "./components/IntroSection";

export default function LandingPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = params.get("mode") || "login";
  const { isLogin } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (mode !== "login" && mode !== "register") {
      navigate("/?mode=login", { replace: true });
    }
  }, [mode, navigate]);

  useEffect(() => {
    if (isLogin) {
      navigate("/app/chat", { replace: true });
    }
  }, [isLogin, navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="min-h-svh flex flex-col">
        <AuthSection mode={mode} />
      </section>

      <section id="intro" className="scroll-mt-16">
        <IntroSection />
      </section>

      <LandingFooter />
    </div>
  );
}
