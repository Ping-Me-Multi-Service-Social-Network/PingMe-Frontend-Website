import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslation } from "react-i18next";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive"; // Để chỉnh màu nút (đỏ hay thường)
  isLoading?: boolean;
}

export const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmLabel,
  cancelLabel,
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) => {
  const { t } = useTranslation("common");

  const effectiveConfirmLabel = confirmLabel || t("actions.confirm");
  const effectiveCancelLabel = cancelLabel || t("actions.cancel");
  const processingLabel = t("actions.processing");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            {effectiveCancelLabel}
          </AlertDialogCancel>
          {/* Nếu là destructive thì nút màu đỏ, không thì màu tím/đen mặc định */}
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault(); // Chặn đóng dialog ngay lập tức để xử lý async
              onConfirm();
            }}
            className={
              variant === "destructive" ? "bg-red-600 hover:bg-red-700" : ""
            }
            disabled={isLoading}
          >
            {isLoading ? processingLabel : effectiveConfirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
