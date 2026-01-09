// src/features/admin/components/UpdateStatusDialog.tsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type {
  UserSummaryResponse,
  AccountStatusType,
} from "@/types/common/userSummary";
import { Loader2, ShieldAlert, ShieldCheck, Ban } from "lucide-react"; // Icon cho đẹp

interface UpdateStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserSummaryResponse | null;
  onConfirm: (userId: number, newStatus: AccountStatusType) => Promise<void>;
}

export const UpdateStatusDialog = ({
  open,
  onOpenChange,
  user,
  onConfirm,
}: UpdateStatusDialogProps) => {
  const [status, setStatus] = useState<AccountStatusType>("ACTIVE");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setStatus(user.accountStatus);
  }, [user, open]);

  const handleConfirm = async () => {
    if (!user) return;
    try {
      setLoading(true);
      await onConfirm(user.id, status);
      onOpenChange(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Cập nhật trạng thái</DialogTitle>
          <DialogDescription>
            Điều chỉnh trạng thái truy cập cho tài khoản{" "}
            <span className="font-bold text-purple-700">{user?.name}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            value={status}
            onValueChange={(val) => setStatus(val as AccountStatusType)}
            className="gap-3"
          >
            {/* Lựa chọn ACTIVE */}
            <div
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                status === "ACTIVE"
                  ? "bg-green-50 border-green-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <RadioGroupItem
                value="ACTIVE"
                id="r-active"
                className="text-green-600 border-green-600"
              />
              <Label
                htmlFor="r-active"
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <div>
                  <div className="font-medium text-green-900">
                    Hoạt động (Active)
                  </div>
                  <div className="text-xs text-green-600/80">
                    Cho phép truy cập bình thường
                  </div>
                </div>
              </Label>
            </div>

            {/* Lựa chọn SUSPENDED */}
            <div
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                status === "SUSPENDED"
                  ? "bg-orange-50 border-orange-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <RadioGroupItem
                value="SUSPENDED"
                id="r-suspended"
                className="text-orange-600 border-orange-600"
              />
              <Label
                htmlFor="r-suspended"
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4 text-orange-600" />
                <div>
                  <div className="font-medium text-orange-900">
                    Tạm khóa (Suspended)
                  </div>
                  <div className="text-xs text-orange-600/80">
                    Khóa tạm thời, chờ backend :v
                  </div>
                </div>
              </Label>
            </div>

            {/* Lựa chọn DEACTIVATED */}
            <div
              className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all ${
                status === "DEACTIVATED"
                  ? "bg-red-50 border-red-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <RadioGroupItem
                value="DEACTIVATED"
                id="r-deactivated"
                className="text-red-600 border-red-600"
              />
              <Label
                htmlFor="r-deactivated"
                className="flex-1 cursor-pointer flex items-center gap-2"
              >
                <Ban className="w-4 h-4 text-red-600" />
                <div>
                  <div className="font-medium text-red-900">
                    Vô hiệu hóa (Deactivated)
                  </div>
                  <div className="text-xs text-red-600/80">
                    Ngăn chặn mọi quyền truy cập
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || status === user?.accountStatus}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
