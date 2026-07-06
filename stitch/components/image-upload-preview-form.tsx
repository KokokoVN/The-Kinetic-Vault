"use client";

import { useEffect, useMemo, useState } from "react";

type ImageUploadPreviewFormProps = {
  productId: string;
  action: (formData: FormData) => void | Promise<void>;
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

export function ImageUploadPreviewForm({ productId, action }: ImageUploadPreviewFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const previews = useMemo(
    () =>
      files.map((file) => ({
        name: file.name,
        url: URL.createObjectURL(file),
      })),
    [files],
  );

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url));
    };
  }, [previews]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputElement = e.target;
    const list = inputElement.files;
    setErrorMsg(null);

    if (!list?.length) {
      setFiles([]);
      setPrimaryIndex(0);
      return;
    }

    const filesArray = Array.from(list);
    const filesWithDuration = await Promise.all(
      filesArray.map(async (file) => {
        if (file.type.startsWith("video/")) {
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

    const hasTooLongVideo = validFiles.length < filesArray.length;

    try {
      const dataTransfer = new DataTransfer();
      validFiles.forEach((item) => dataTransfer.items.add(item.file));
      inputElement.files = dataTransfer.files;
    } catch (err) {
      console.warn("Trình duyệt không hỗ trợ DataTransfer:", err);
    }

    if (hasTooLongVideo) {
      setErrorMsg("Video có thời lượng từ 60 giây trở lên đã bị loại bỏ.");
    }

    setFiles(validFiles.map((item) => item.file));
    setPrimaryIndex(0);
  }

  return (
    <form action={action} className="grid gap-4 rounded-2xl border border-outline-variant/10 bg-surface-container-low dark:bg-slate-800 p-5">
      <input type="hidden" name="_productId" value={productId} />
      <input type="hidden" name="primaryIndex" value={String(primaryIndex)} />
      <label className="block text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant">
        Tải ảnh/video từ máy (có preview)
      </label>
      <input
        name="files"
        type="file"
        multiple
        accept="image/*,video/*"
        className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest dark:bg-slate-900 px-3 py-2 text-sm"
        onChange={handleFileChange}
      />
      {errorMsg ? <p className="text-xs font-semibold text-rose-600">{errorMsg}</p> : null}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.map((p, idx) => {
            const isVideo = files[idx]?.type.startsWith("video/");
            return (
              <label
                key={`${p.name}-${idx}`}
                className={[
                  "cursor-pointer overflow-hidden rounded-xl border bg-surface-container-lowest dark:bg-slate-900 transition-all",
                  idx === primaryIndex ? "border-secondary ring-2 ring-secondary/20" : "border-outline-variant/20",
                ].join(" ")}
              >
                <div className="relative aspect-square">
                  {isVideo ? (
                    <video src={p.url} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                  )}
                  {idx === primaryIndex && (
                    <span className="absolute left-2 top-2 rounded-full bg-secondary px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-white">
                      ẢNH CHÍNH
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 p-2">
                  <input
                    type="radio"
                    name="_primaryChoice"
                    checked={idx === primaryIndex}
                    onChange={() => setPrimaryIndex(idx)}
                    className="h-4 w-4 accent-secondary"
                  />
                  <span className="truncate text-xs text-on-surface-variant">{p.name}</span>
                </div>
              </label>
            );
          })}
        </div>
      )}

      <button
        type="submit"
        disabled={files.length === 0}
        className="rounded-xl bg-gradient-to-r from-secondary to-primary px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:brightness-110 disabled:opacity-60"
      >
        Upload ảnh/video
      </button>
    </form>
  );
}
