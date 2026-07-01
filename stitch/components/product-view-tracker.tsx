"use client";

import { useEffect, useRef } from "react";
import { incrementProductView } from "@/lib/api";

export function ProductViewTracker({ productId }: { productId: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (!tracked.current && productId) {
      tracked.current = true;
      incrementProductView(Number(productId)).catch(() => {});
    }
  }, [productId]);

  return null;
}
