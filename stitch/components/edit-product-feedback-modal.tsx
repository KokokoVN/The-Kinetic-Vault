"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ErrorModal, SuccessModal } from "@/components/action-result-modal";

type EditProductFeedbackModalProps = {
  error?: string;
  message?: string;
  success?: string;
};

export function EditProductFeedbackModal({ error, message, success }: EditProductFeedbackModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const openError = Boolean(error);
  const openSuccess = Boolean(success);

  const closeModal = () => {
    const qp = new URLSearchParams(searchParams.toString());
    qp.delete("error");
    qp.delete("message");
    qp.delete("success");
    const next = qp.toString();
    router.replace(next ? `${pathname}?${next}` : pathname);
  };

  let successTitle = "Thao tác thành công";
  let successMessage = "Dữ liệu đã được cập nhật.";
  if (success === "update") {
    successTitle = "Cập nhật sản phẩm thành công";
    successMessage = "Thông tin sản phẩm đã được lưu.";
  } else if (success === "add_image") {
    successTitle = "Upload ảnh thành công";
    successMessage = "Ảnh sản phẩm đã được thêm.";
  } else if (success === "delete_image") {
    successTitle = "Xóa ảnh thành công";
    successMessage = "Ảnh sản phẩm đã được xóa.";
  } else if (success === "set_primary") {
    successTitle = "Đặt ảnh chính thành công";
    successMessage = "Ảnh chính của sản phẩm đã được cập nhật.";
  } else if (success === "create") {
    successTitle = "Tạo sản phẩm thành công";
    successMessage = "Bạn có thể tiếp tục thêm ảnh, thông số và biến thể.";
  }

  let errorTitle = "Thao tác thất bại";
  let errorMessage = "Vui lòng kiểm tra API/gateway rồi thử lại.";
  if (error === "duplicate_name") {
    errorTitle = "Tên sản phẩm bị trùng";
    errorMessage = "Tên sản phẩm đã tồn tại, vui lòng nhập tên khác.";
  } else if (error === "validation") {
    errorTitle = "Dữ liệu chưa hợp lệ";
    errorMessage = message?.trim() || "Vui lòng kiểm tra lại dữ liệu đã nhập.";
  } else if (error === "add_image" || error === "delete_image" || error === "set_primary") {
    errorTitle = "Thao tác ảnh thất bại";
    errorMessage = "Không thể xử lý ảnh sản phẩm, vui lòng thử lại.";
  }

  return (
    <>
      <SuccessModal
        open={openSuccess}
        onClose={closeModal}
        title={successTitle}
        message={successMessage}
        buttons={[
          { label: "Đóng", onClick: closeModal, variant: "secondary" },
          { label: "Danh sách sản phẩm", href: "/admin/products", variant: "primary" },
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

