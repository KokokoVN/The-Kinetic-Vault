"use client";

import { useEffect } from "react";
import { revalidateMyOrdersAfterPayment } from "./actions";

export function PostSuccessRefresh({ orderId }: { orderId: number }) {
  useEffect(() => {
    if (orderId > 0) {
      void revalidateMyOrdersAfterPayment(orderId);
    }
  }, [orderId]);
  return null;
}
