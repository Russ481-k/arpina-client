import React from "react";
import { getPayStatusDisplay } from "@/lib/utils/statusUtils";
import type { EnrollmentPaymentLifecycleStatus } from "@/types/statusTypes";
import { Tag } from "@chakra-ui/react";

interface CommonPayStatusBadgeProps {
  status?: EnrollmentPaymentLifecycleStatus | null;
}

export const CommonPayStatusBadge: React.FC<CommonPayStatusBadgeProps> = ({
  status,
}) => {
  if (!status) {
    return (
      <Tag.Root size="sm" colorPalette="gray" variant="outline">
        <Tag.Label>알 수 없음</Tag.Label>
      </Tag.Root>
    );
  }

  const displayConfig = getPayStatusDisplay(status);

  return (
    <Tag.Root
      size="sm"
      colorPalette={displayConfig.colorPalette}
      variant={displayConfig.badgeVariant || "solid"}
    >
      <Tag.Label>{displayConfig.label}</Tag.Label>
    </Tag.Root>
  );
};
