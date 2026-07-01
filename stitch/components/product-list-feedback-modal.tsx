"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ErrorModal, SuccessModal } from "@/components/action-result-modal";

type ProductListFeedbackModalProps = {
  error?: string;
  success?: string;
};

export function ProductListFeedbackModal({ error, success }: ProductListFeedbackModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openDeleteSuccess = success === "delete";
  const openDeleteError = error === "delete";

  const closeModal = () => {
    const qp = new URLSearchParams(searchParams.toString());
    qp.delete("error");
    qp.delete("success");
    const next = qp.toString();
    router.replace(next ? `${pathname}?${next}` : pathname);
  };

  return (
    <>
      <SuccessModal
        open={openDeleteSuccess}
        onClose={closeModal}
        title="Xóa sản phẩm thành công"
        message="Sản phẩm đã được xóa khỏi danh sách."
        buttons={[
          { label: "Đóng", onClick: closeModal, variant: "secondary" },
          { label: "OK", onClick: closeModal, variant: "primary" },
        ]}
      />
      <ErrorModal
        open={openDeleteError}
        onClose={closeModal}
        title="Xóa sản phẩm thất bại"
        message="Không thể xóa sản phẩm. Vui lòng thử lại."
        buttons={[
          { label: "Thử lại", onClick: closeModal, variant: "primary" },
          { label: "Đóng", onClick: closeModal, variant: "secondary" },
        ]}
      />
    </>
  );
}

