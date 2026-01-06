import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./components/LoginForm.tsx";
import RegisterForm from "./components/RegisterForm.tsx";
import { useAppSelector } from "@/features/hooks";

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const mode = params.get("mode");

  const { isLogin } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (mode !== "login" && mode !== "register") {
      navigate("/auth?mode=login");
    }
  }, [mode, navigate]);

  useEffect(() => {
    if (isLogin) {
      navigate("/home", { replace: true });
    }
  }, [isLogin, navigate]);

  const isMovingToRegister = mode === "register";

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={mode}
        initial={{
          x: isMovingToRegister ? -100 : 100,
          opacity: 0,
        }}
        animate={{
          x: 0,
          opacity: 1,
        }}
        exit={{
          x: isMovingToRegister ? 100 : -100,
          opacity: 0,
        }}
        transition={{
          duration: 0.4,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        {mode === "login" ? <LoginForm /> : <RegisterForm />}
      </motion.div>
    </AnimatePresence>
  );
}
