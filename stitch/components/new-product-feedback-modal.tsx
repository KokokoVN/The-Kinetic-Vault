"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ErrorModal, SuccessModal } from "@/components/action-result-modal";

type NewProductFeedbackModalProps = {
  error?: string;
  message?: string;
  success?: string;
};

export function NewProductFeedbackModal({ error, message, success }: NewProductFeedbackModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openError = Boolean(error);
  const openSuccess = success === "create";

  const closeModal = () => {
    const qp = new URLSearchParams(searchParams.toString());
    qp.delete("error");
    qp.delete("message");
    qp.delete("success");
    const next = qp.toString();
    router.replace(next ? `${pathname}?${next}` : pathname);
  };

  let errorTitle = "Tạo sản phẩm thất bại";
  let errorMessage = "Vui lòng kiểm tra API/gateway rồi thử lại.";

  if (error === "duplicate_name") {
    errorTitle = "Tên sản phẩm bị trùng";
    errorMessage = "Tên sản phẩm đã tồn tại, vui lòng nhập tên khác.";
  } else if (error === "validation") {
    errorTitle = "Dữ liệu chưa hợp lệ";
    errorMessage = message?.trim() || "Vui lòng kiểm tra lại thông tin sản phẩm.";
  }

  return (
    <>
      <SuccessModal
        open={openSuccess}
        onClose={closeModal}
        title="Tạo sản phẩm thành công"
        message="Sản phẩm đã được tạo. Bạn có thể tiếp tục chỉnh sửa thông tin chi tiết."
        buttons={[
          { label: "Đóng", onClick: closeModal, variant: "secondary" },
          { label: "Xem danh sách sản phẩm", href: "/admin/products", variant: "primary" },
        ]}
      />

      <ErrorModal
        open={openError}
        onClose={closeModal}
        title={errorTitle}
        message={errorMessage}
        buttons={[
          { label: "Thử lại", onClick: closeModal, variant: "primary" },
          { label: "Đóng", onClick: closeModal, variant: "secondary" },
        ]}
      />
    </>
  );
}

