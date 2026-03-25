import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { Calendar } from "@/components/ui/calendar.tsx";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover.tsx";
import {
  CalendarIcon,
  Loader2,
  User,
  MapPin,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";
import type { ChangeProfileRequest } from "@/types/authentication";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import { } from "@/services/authentication";
import { useAppDispatch, useAppSelector } from "@/features/hooks.ts";
import { getCurrentUserSession } from "@/features/auth/authThunk.ts";
import {
  getCurrentUserInfoApi,
  updateCurrentUserProfileApi,
} from "@/services/user/currentUserProfileApi.ts";
import type { AccountStatusType } from "@/types/common/userSummary";

import { useNavigate } from "react-router-dom";
import { sendOtpToEmailApi } from "@/services/authentication/authOtpApi";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

const UserInfoPage = () => {
  const { t } = useTranslation("profile");
  const { userSession, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  // Status State
  const [isFetchLoading, setIsFetchLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ChangeProfileRequest>({
    name: "",
    gender: "MALE",
    address: "",
  });
  const [dob, setDob] = useState<Date | undefined>(undefined);
  // Thêm state lưu accountStatus
  const [accountStatus, setAccountStatus] = useState<AccountStatusType | null>(
    null,
  );

  const fetchUserDetails = useCallback(async () => {
    setIsFetchLoading(true);
    try {
      const res = await getCurrentUserInfoApi();
      const data = res.data.data;

      setFormData({
        name: data.name || "",
        gender: data.gender || "MALE",
        address: data.address || "",
      });
      setDob(data.dob ? new Date(data.dob) : undefined);
      setAccountStatus(data.accountStatus || null);
    } catch (err) {
      toast.error(getErrorMessage(err, t("userInfo.fetchError")));
    } finally {
      setIsFetchLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      await updateCurrentUserProfileApi({
        ...formData,
        dob: dob?.toLocaleDateString("en-CA"),
      });

      toast.success(t("common.updateSuccess"));

      fetchUserDetails();
      dispatch(getCurrentUserSession());
    } catch (error) {
      toast.error(getErrorMessage(error, t("common.updateFail")));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleActivate = async () => {
    if (!userSession?.email) return;
    setIsSendingOtp(true);
    try {
      await sendOtpToEmailApi({
        email: userSession.email,
        authOtpType: "ACCOUNT_ACTIVATION",
      });

      toast.success(t("userInfo.activateSuccess"));

      // Chuyển hướng, truyền đúng type để bên kia bắt
      navigate("/auth/verify-otp", {
        state: {
          email: userSession.email,
          type: "ACCOUNT_ACTIVATION", // Truyền type qua state
        },
      });
    } catch (error) {
      toast.error(getErrorMessage(error, t("userInfo.activateFail")));
    } finally {
      setIsSendingOtp(false);
    }
  };

  if (isLoading || isFetchLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }} 
          className="flex items-center space-x-3 text-primary bg-primary/5 px-6 py-4 rounded-full border border-primary/10"
        >
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold tracking-wide">{t("common.loading")}</span>
        </motion.div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 350, damping: 25 } }
  };

  return (
    <motion.div 
      className="p-8"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center">
          <div className="p-2 bg-primary/10 rounded-lg mr-3">
            <User className="w-5 h-5 text-primary" />
          </div>
          {t("userInfo.title")}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-lg">
          {t("userInfo.subtitle")}
        </p>
      </div>

      <AnimatePresence>
        {/* NÚT KÍCH HOẠT (Chỉ hiện khi NON_ACTIVATED) */}
        {accountStatus === "NON_ACTIVATED" && (
          <motion.div 
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 24 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4 rounded-xl shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-semibold">
                  <AlertTriangle className="w-5 h-5" />
                  <span>{t("userInfo.activateRequired")}</span>
                </div>
                <p className="text-xs text-amber-600/80 dark:text-amber-500/80 ml-7">
                  {t("userInfo.activateSubtitle", "Kích hoạt để trải nghiệm trọn vẹn")}
                </p>
              </div>
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700 text-white shadow-md w-full sm:w-auto ml-7 sm:ml-0"
                onClick={handleActivate}
                disabled={isSendingOtp}
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("userInfo.activateSending")}
                  </>
                ) : (
                  t("userInfo.activateBtn")
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          id="profile-info-fields" 
          className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-7"
        >
          {/* Email (Read-only) */}
          <motion.div variants={itemVariants} id="profile-email-field" className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/80">{t("userInfo.fields.email")}</Label>
            <Input
              value={userSession?.email ?? ""}
              disabled
              className="bg-muted border-transparent text-muted-foreground cursor-not-allowed opacity-70"
            />
          </motion.div>

          {/* Name */}
          <motion.div variants={itemVariants} id="profile-name-field" className="space-y-2 group">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors">
              {t("userInfo.fields.fullName")} <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder={t("userInfo.fields.fullNamePlaceholder")}
                className="pl-9 border-border focus:border-primary focus:ring-primary shadow-sm bg-background transition-all"
                required
              />
            </div>
          </motion.div>

          {/* Gender */}
          <motion.div variants={itemVariants} id="profile-gender-field" className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/80">
              {t("userInfo.fields.gender")} <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
            >
              <SelectTrigger className="border-border focus:border-primary focus:ring-primary shadow-sm bg-background">
                <SelectValue placeholder={t("userInfo.fields.genderPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MALE">{t("userInfo.fields.genderMale")}</SelectItem>
                <SelectItem value="FEMALE">{t("userInfo.fields.genderFemale")}</SelectItem>
                <SelectItem value="OTHER">{t("userInfo.fields.genderOther")}</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>

          {/* Date of Birth */}
          <motion.div variants={itemVariants} id="profile-dob-field" className="space-y-2">
            <Label className="text-sm font-semibold text-foreground/80">
              {t("userInfo.fields.dob")}
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-border focus:border-primary shadow-sm bg-background hover:bg-muted/50 transition-colors",
                    !dob && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dob
                    ? format(dob, "dd/MM/yyyy", { locale: vi })
                    : t("userInfo.fields.dobPlaceholder")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 border-border" align="start">
                <Calendar
                  mode="single"
                  selected={dob}
                  onSelect={setDob}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  locale={vi}
                  captionLayout="dropdown"
                />
              </PopoverContent>
            </Popover>
          </motion.div>

          {/* Address */}
          <motion.div variants={itemVariants} id="profile-address-field" className="space-y-2 md:col-span-2 group">
            <Label
              htmlFor="address"
              className="text-sm font-semibold text-foreground/80 group-focus-within:text-primary transition-colors"
            >
              {t("userInfo.fields.address")}
            </Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder={t("userInfo.fields.addressPlaceholder")}
                className="pl-9 border-border focus:border-primary focus:ring-primary shadow-sm bg-background transition-all"
              />
            </div>
          </motion.div>
        </motion.div>

        {/* Submit Button */}
        <motion.div 
          id="profile-info-submit" 
          className="pt-6 border-t border-border mt-8 flex justify-end"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            type="submit"
            disabled={isUpdating}
            className="w-full sm:w-auto min-w-[160px] shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-semibold rounded-full px-8 h-11"
          >
            {isUpdating ? (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex items-center gap-2"
              >
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("common.updating")}
              </motion.div>
            ) : (
              t("userInfo.updateBtn")
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default UserInfoPage;
