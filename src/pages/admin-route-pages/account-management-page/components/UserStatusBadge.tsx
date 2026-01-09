// src/features/admin/components/UserStatusBadge.tsx
import { Badge } from "@/components/ui/badge";
import type { AccountStatusType } from "@/types/common/userSummary";

export const UserStatusBadge = ({ status }: { status: AccountStatusType }) => {
  const config = {
    ACTIVE: {
      label: "Hoạt động",
      className:
        "bg-green-100 text-green-700 hover:bg-green-200 border-green-200",
    },
    SUSPENDED: {
      label: "Tạm khóa",
      className:
        "bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200",
    },
    DEACTIVATED: {
      label: "Vô hiệu hóa",
      className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200",
    },
  };

  const current = config[status] || { label: status, className: "bg-gray-100" };

  return (
    <Badge variant="outline" className={`${current.className} font-normal`}>
      {current.label}
    </Badge>
  );
};
