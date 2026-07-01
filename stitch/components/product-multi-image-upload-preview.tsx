"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { StatusToast } from "@/components/status-toast";

const defaultFileClass =
  "w-full rounded-xl border border-outline-variant/20 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-sm text-blue-950 dark:text-white outline-none transition focus:border-primary/35 focus:ring-2 focus:ring-primary/25 file:mr-3 file:rounded-lg file:border-0 file:bg-primary/15 dark:file:bg-indigo-500/20 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-blue-900 dark:file:text-indigo-300";

type ProductMultiImageUploadPreviewProps = {
  /** Tên field multipart gửi nhiều file (cùng một input multiple). */
  name?: string;
  /** Tên field ẩn: chỉ số ảnh chính (0-based) trong lần chọn hiện tại. */
  primaryIndexFieldName?: string;
  inputClassName?: string;
  label?: string;
  hint?: string;
  action?: (formData: FormData) => Promise<{ error?: string } | void> | void;
  acceptType?: "all" | "images" | "videos";
};

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve(video.duration);
    };
    video.onerror = () => {
      resolve(0);
    };
    video.src = URL.createObjectURL(file);
  });
}

export function ProductMultiImageUploadPreview({
  name = "productImages",
  primaryIndexFieldName = "primaryImageIndex",
  inputClassName = defaultFileClass,
  label = "Chọn ảnh",
  hint,
  action,
  acceptType = "all",
}: ProductMultiImageUploadPreviewProps) {
  const uid = useId();
  const inputId = `${uid}-multi-img`;
  const [previews, setPreviews] = useState<{ url: string; isVideo: boolean }[]>([]);
  const [primaryIdx, setPrimaryIdx] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: "success" | "error"; title: string; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      previews.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previews]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputElement = e.target;
    const list = inputElement.files;
    setErrorMsg(null);
    setToast(null);

    if (!list?.length) {
      setPreviews([]);
      setPrimaryIdx(0);
      return;
    }

    const filesArray = Array.from(list);
    const filteredFilesArray = filesArray.filter((file) => {
      const isVideo = file.type.startsWith("video/") || 
                      file.name.endsWith(".mp4") || 
                      file.name.endsWith(".mov") || 
                      file.name.endsWith(".webm") || 
                      file.name.endsWith(".avi");
      if (acceptType === "images" && isVideo) return false;
      if (acceptType === "videos" && !isVideo) return false;
      return true;
    });

    const filesWithDuration = await Promise.all(
      filteredFilesArray.map(async (file) => {
        const isVideo = file.type.startsWith("video/") || 
                        file.name.endsWith(".mp4") || 
                        file.name.endsWith(".mov") || 
                        file.name.endsWith(".webm") || 
                        file.name.endsWith(".avi");
        if (isVideo) {
          const duration = await getVideoDuration(file);
          return { file, duration, isVideo: true };
        }
        return { file, duration: 0, isVideo: false };
      })
    );

    const validFiles = filesWithDuration.filter((item) => {
      if (item.isVideo && item.duration > 60) {
        return false;
      }
      return true;
    });

    const hasTooLongVideo = validFiles.length < filteredFilesArray.length;

    // Cập nhật lại danh sách file trong input bằng DataTransfer
    try {
      const dataTransfer = new DataTransfer();
      validFiles.forEach((item) => dataTransfer.items.add(item.file));
      inputElement.files = dataTransfer.files;
    } catch (err) {
      console.warn("Trình duyệt không hỗ trợ DataTransfer:", err);
    }

    // Tạo URL xem trước cho các file hợp lệ
    const validPreviews = validFiles.map((item) => ({
      url: URL.createObjectURL(item.file),
      isVideo: item.isVideo,
    }));

    if (hasTooLongVideo) {
      setErrorMsg("Video có thời lượng từ 60 giây trở lên đã bị loại bỏ.");
    }

    setPreviews((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.url));
      return validPreviews;
    });
    setPrimaryIdx(0);
  }

  const count = previews.length;

  const renderContent = () => (
    <div className="space-y-3">
      {toast && <StatusToast tone={toast.tone} title={toast.title} message={toast.message} />}
      <div>
        <label htmlFor={inputId} className="mb-1 block text-sm font-bold text-blue-900 dark:text-white">
          {label}
        </label>
        <input
          id={inputId}
          name={name}
          type="file"
          accept={acceptType === "images" ? "image/*" : acceptType === "videos" ? "video/*" : "image/*,video/*"}
          multiple
          onChange={handleFileChange}
          className={inputClassName}
        />
        {hint ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p> : null}
        {errorMsg ? <p className="mt-1 text-xs font-semibold text-rose-600 dark:text-rose-400">{errorMsg}</p> : null}
      </div>

      {acceptType !== "videos" && (
        <input type="hidden" name={primaryIndexFieldName} value={String(primaryIdx)} readOnly />
      )}

      {count > 0 ? (
        <div className="rounded-xl border border-outline-variant/15 dark:border-slate-800 bg-surface-container-low/40 dark:bg-slate-900/40 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-blue-900/80 dark:text-slate-400">
            Xem trước ({count}) — {acceptType === "videos" ? "Danh sách video" : "chọn đúng một ảnh chính"}
          </p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {previews.map((item, i) => (
              <li key={`${item.url}-${i}`} className="relative">
                <label className={acceptType === "videos" ? "block" : "block cursor-pointer"}>
                  <span
                    className={`relative block aspect-square overflow-hidden rounded-xl border-2 bg-slate-100 dark:bg-slate-800 shadow-sm ring-1 ring-slate-200/80 dark:ring-slate-800 transition ${
                      acceptType !== "videos" && primaryIdx === i ? "border-primary dark:border-indigo-500 ring-2 ring-primary/35 dark:ring-indigo-500/35" : "border-transparent"
                    }`}
                  >
                    {item.isVideo ? (
                      <video src={item.url} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    )}
                    {acceptType !== "videos" ? (
                      <span className="absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        {primaryIdx === i ? "Ảnh chính" : (item.isVideo ? "Video" : `Ảnh ${i + 1}`)}
                      </span>
                    ) : (
                      <span className="absolute left-2 top-2 rounded-md bg-black/55 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        {`Video ${i + 1}`}
                      </span>
                    )}
                  </span>
                  {acceptType !== "videos" && (
                    <input
                      type="radio"
                      className="sr-only"
                      checked={primaryIdx === i}
                      onChange={() => setPrimaryIdx(i)}
                      aria-label={`Đặt làm ảnh chính: ảnh ${i + 1}`}
                    />
                  )}
                </label>
              </li>
            ))}
          </ul>
          {acceptType !== "videos" && (
            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Click vào ảnh để đặt làm ảnh đại diện (chỉ một ảnh chính).</p>
          )}
        </div>
      ) : null}
    </div>
  );

  if (action) {
    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (count === 0) return;
          setToast(null);
          const form = e.currentTarget;
          const formData = new FormData(form);
          startTransition(async () => {
            try {
              const res = await action(formData);
              if (res && res.error) {
                setToast({ tone: "error", title: "Tải lên thất bại", message: res.error });
              } else {
                setToast({ tone: "success", title: "Thành công", message: "Đã tải lên ảnh/video thành công." });
                setPreviews([]);
                setPrimaryIdx(0);
                form.reset();
              }
            } catch (err: any) {
              setToast({ tone: "error", title: "Tải lên thất bại", message: err.message || "Không thể tải lên." });
            }
          });
        }}
        className="mt-6 space-y-4"
      >
        {renderContent()}
        <button
          type="submit"
          disabled={count === 0 || isPending}
          className="rounded-xl border-2 border-primary/30 dark:border-indigo-500/30 bg-primary/10 dark:bg-indigo-500/10 px-5 py-2.5 text-sm font-bold text-blue-900 dark:text-indigo-400 hover:bg-primary/15 dark:hover:bg-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? "Đang tải lên..." : "Tải lên"}
        </button>
      </form>
    );
  }

  return renderContent();
}
