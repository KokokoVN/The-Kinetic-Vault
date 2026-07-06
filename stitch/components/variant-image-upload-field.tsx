"use client";

import { useEffect, useState } from "react";

type VariantImageUploadFieldProps = {
  name?: string;
  initialSrc?: string;
  className?: string;
};

export function VariantImageUploadField({
  name = "variantImageFile",
  initialSrc = "",
  className = "",
}: VariantImageUploadFieldProps) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const showSrc = previewUrl || initialSrc;
  const showName = previewUrl ? fileName : "";

  return (
    <div className="space-y-2">
      <input
        name={name}
        type="file"
        accept="image/*"
        className={className}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0];
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          if (file) {
            setPreviewUrl(URL.createObjectURL(file));
            setFileName(file.name);
          } else {
            setPreviewUrl("");
            setFileName("");
          }
        }}
      />
      <div className="flex items-center gap-2">
        {showSrc ? (
          <img
            src={showSrc}
            alt={showName || "variant-preview"}
            className="h-12 w-12 rounded-lg object-cover ring-1 ring-outline-variant/15"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-container dark:bg-slate-800-high text-on-surface-variant">
            <span className="material-symbols-outlined">image</span>
          </div>
        )}
        {previewUrl ? (
          <p className="text-[11px] text-on-surface-variant">
            Đang xem trước: <span className="font-medium">{fileName}</span>
          </p>
        ) : (
          <p className="text-[11px] text-on-surface-variant">
            {initialSrc ? "Đang có ảnh. Chọn file mới để thay." : "Chưa có ảnh. Chọn file để thêm."}
          </p>
        )}
      </div>
    </div>
  );
}

