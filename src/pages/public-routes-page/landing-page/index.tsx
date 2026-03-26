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
    <div className="min-h-screen selection:bg-purple-500/30 selection:text-purple-900" style={{ background: "oklch(0.985 0.008 292)" }}>
      {/* Hero / Auth — full-height split layout */}
      <AuthSection mode={mode} />

      {/* Scroll anchor */}
      <div id="intro" />

      {/* Features + CTA */}
      <IntroSection />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
