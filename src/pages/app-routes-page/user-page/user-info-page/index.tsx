import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
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
import { CalendarIcon, Loader2, User, MapPin } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils.ts";
import { toast } from "sonner";
import type { ChangeProfileRequest } from "@/types/authentication";
import { getErrorMessage } from "@/utils/errorMessageHandler.ts";
import {
  getCurrentUserInfoApi,
  updateCurrentUserProfileApi,
} from "@/services/authentication";
import { useAppDispatch, useAppSelector } from "@/features/hooks.ts";
import { getCurrentUserSession } from "@/features/slices/authThunk.ts";

const UserInfoPage = () => {
  const { userSession, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  // Status State
  const [isFetchLoading, setIsFetchLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ChangeProfileRequest>({
    name: "",
    gender: "MALE",
    address: "",
  });
  const [dob, setDob] = useState<Date | undefined>(undefined);

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
    } catch (err) {
      toast.error(getErrorMessage(err, "Không thể lấy thông tin người dùng"));
    } finally {
      setIsFetchLoading(false);
    }
  }, []);

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

      toast.success("Cập nhật thông tin thành công!");

      fetchUserDetails();
      dispatch(getCurrentUserSession());
    } catch (error) {
      toast.error(getErrorMessage(error, "Cập nhật thất bại"));
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading || isFetchLoading)
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-2 text-purple-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-lg font-medium">Đang tải thông tin...</span>
        </div>
      </div>
    );

  return (
    <Card className="shadow-2xl backdrop-blur-sm w-full rounded-none mx-auto flex-1">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
          <User className="w-5 h-5 mr-2 text-purple-600" />
          Thông tin cá nhân
        </CardTitle>
        <CardDescription className="text-gray-600">
          Cập nhật thông tin cá nhân của bạn
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Email</Label>
              <Input
                value={userSession.email ?? ""}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label
                htmlFor="name"
                className="text-sm font-medium text-gray-700"
              >
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Nhập họ và tên"
                  className="pl-10 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                  required
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Giới tính <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.gender}
                onValueChange={(value) => handleInputChange("gender", value)}
              >
                <SelectTrigger className="border-gray-200 focus:border-purple-300 focus:ring-purple-200">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Nam</SelectItem>
                  <SelectItem value="FEMALE">Nữ</SelectItem>
                  <SelectItem value="OTHER">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date of Birth */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                Ngày sinh
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-200 focus:border-purple-300 focus:ring-purple-200",
                      !dob && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dob
                      ? format(dob, "dd/MM/yyyy", { locale: vi })
                      : "Chọn ngày sinh"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
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
            </div>

            {/* Address */}
            <div className="space-y-2 md:col-span-2">
              <Label
                htmlFor="address"
                className="text-sm font-medium text-gray-700"
              >
                Địa chỉ
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Nhập địa chỉ"
                  className="pl-10 border-gray-200 focus:border-purple-300 focus:ring-purple-200"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 font-medium"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang cập nhật...
                </>
              ) : (
                "Cập nhật thông tin"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserInfoPage;
