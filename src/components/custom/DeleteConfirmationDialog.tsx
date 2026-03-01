import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

interface DeleteConfirmDialogProps {
  onConfirm: () => void;
  description?: string;
  title?: string;
  children?: ReactNode;
  styledDescription?: ReactNode;
}

export const DeleteConfirmDialog = ({
  onConfirm,
  description,
  styledDescription,
  title,
  children,
}: DeleteConfirmDialogProps) => {
  const { t } = useTranslation("common");

  const effectiveTitle = title || t("actions.deleteConfirm");
  const effectiveDescription = description || t("actions.irreversible");
  const cancelLabel = t("actions.cancel");
  const confirmLabel = t("actions.confirmDelete");

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-500 hover:text-red-600"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent
        onClick={(e) => e.stopPropagation()}
        className="z-[9999]"
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{effectiveTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {styledDescription || effectiveDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
