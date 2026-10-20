import type { Metadata } from "next";
import { RegisterSuccessRedirect } from "@/components/auth/register-success-redirect";

export const metadata: Metadata = {
  title: "Kích Hoạt Tài Khoản Thành Công",
};

export default function RegisterSuccessPage() {
  return <RegisterSuccessRedirect />;
}
