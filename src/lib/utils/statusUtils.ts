export type PayStatus =
  | "UNPAID"
  | "PAID"
  | "PARTIALLY_REFUNDED"
  | "CANCELED_UNPAID"
  | "PAYMENT_TIMEOUT"
  | "REFUND_PENDING_ADMIN_CANCEL"
  | "REFUNDED";

export const payStatusConfig: Record<
  PayStatus,
  { label: string; colorPalette: string; badgeVariant?: "solid" | "outline" }
> = {
  UNPAID: { label: "미결제", colorPalette: "orange", badgeVariant: "outline" },
  PAID: { label: "결제완료", colorPalette: "green", badgeVariant: "solid" },
  PARTIALLY_REFUNDED: {
    label: "부분환불",
    colorPalette: "purple",
    badgeVariant: "solid",
  },
  CANCELED_UNPAID: {
    label: "미결제취소",
    colorPalette: "gray",
    badgeVariant: "outline",
  },
  PAYMENT_TIMEOUT: {
    label: "결제시간초과",
    colorPalette: "red",
    badgeVariant: "outline",
  },
  REFUND_PENDING_ADMIN_CANCEL: {
    label: "환불대기(관리자취소)",
    colorPalette: "yellow",
    badgeVariant: "outline",
  },
  REFUNDED: { label: "환불완료", colorPalette: "blue", badgeVariant: "solid" },
};

export const payStatusOptions: Array<{ value: PayStatus; label: string }> = (
  Object.keys(payStatusConfig) as PayStatus[]
).map((status) => ({
  value: status,
  label: payStatusConfig[status].label,
}));

// Add an "all" option for filters
payStatusOptions.unshift({ value: "" as any, label: "전체" });

export const getPayStatusDisplay = (status: PayStatus) => {
  return (
    payStatusConfig[status] || { label: "알 수 없음", colorPalette: "gray" }
  );
};
