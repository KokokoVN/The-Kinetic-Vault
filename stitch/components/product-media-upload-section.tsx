"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────
type UploadState = "idle" | "uploading" | "done" | "error";

interface UploadProgress {
  percent: number;
  speed: string;
  loaded: string;
  total: string;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function formatSpeed(bps: number): string {
  if (bps > 1024 * 1024) return `${(bps / (1024 * 1024)).toFixed(1)} MB/s`;
  if (bps > 1024) return `${(bps / 1024).toFixed(0)} KB/s`;
  return `${bps.toFixed(0)} B/s`;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => resolve(video.duration);
    video.onerror = () => resolve(0);
    video.src = URL.createObjectURL(file);
  });
}

// ────────────────────────────────────────────────────────────────────────────
// UploadProgressOverlay
// ────────────────────────────────────────────────────────────────────────────
function UploadProgressOverlay({
  progress,
  label,
}: {
  progress: UploadProgress;
  label: string;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-md p-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-3xl text-indigo-600 animate-bounce">
            cloud_upload
          </span>
          <div>
            <h3 className="font-headline text-lg font-black text-slate-900">
              {label}
            </h3>
            <p className="text-xs text-slate-500">
              Vui lòng không đóng trình duyệt hoặc tải lại trang.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-bold text-slate-700">
            <span>Tiến trình</span>
            <span>{progress.percent}%</span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 transition-all duration-200"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 font-semibold border-t border-slate-100 pt-4">
          <div className="flex items-center gap-1 font-mono">
            <span className="material-symbols-outlined text-[16px]">speed</span>
            <span>{progress.speed}</span>
          </div>
          <div className="font-mono">
            {progress.loaded} / {progress.total}
          </div>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Single Upload Panel (Images or Videos)
// ────────────────────────────────────────────────────────────────────────────
interface UploadPanelProps {
  productId: number;
  accessToken: string;
  type: "images" | "videos";
  label: string;
  hint: string;
  icon: string;
  accentColor: string; // tailwind color key e.g. "indigo" | "violet"
  onUploadComplete: () => void;
}

function UploadPanel({
  productId,
  accessToken,
  type,
  label,
  hint,
  icon,
  accentColor,
  onUploadComplete,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<{ url: string; isVideo: boolean; name: string; size: number }[]>([]);
  const [primaryIdx, setPrimaryIdx] = useState(0);
  const [state, setState] = useState<UploadState>("idle");
  const [progress, setProgress] = useState<UploadProgress>({
    percent: 0,
    speed: "0 KB/s",
    loaded: "0 B",
    total: "0 B",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const acceptAttr = type === "images" ? "image/*" : "video/mp4,video/webm,video/ogg,video/mov,video/*";

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    setErrorMsg(null);
    if (!list?.length) {
      setPreviews([]);
      return;
    }

    const files = Array.from(list);
    const validFiles: typeof files = [];
    const invalidFiles: string[] = [];

    for (const file of files) {
      const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(file.name);

      if (type === "images" && isVideo) continue;
      if (type === "videos" && !isVideo) continue;

      if (isVideo) {
        const duration = await getVideoDuration(file);
        if (duration > 60) {
          invalidFiles.push(`"${file.name}" (${Math.round(duration)}s > 60s)`);
          continue;
        }
      }
      validFiles.push(file);
    }

    if (invalidFiles.length > 0) {
      setErrorMsg(`Video vượt 60 giây đã bị loại: ${invalidFiles.join(", ")}`);
    }

    // Update input files via DataTransfer
    try {
      const dt = new DataTransfer();
      validFiles.forEach((f) => dt.items.add(f));
      if (inputRef.current) inputRef.current.files = dt.files;
    } catch {}

    const newPreviews = validFiles.map((f) => ({
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith("video/") || /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(f.name),
      name: f.name,
      size: f.size,
    }));

    // Revoke old previews
    setPreviews((old) => {
      old.forEach((p) => URL.revokeObjectURL(p.url));
      return newPreviews;
    });
    setPrimaryIdx(0);
  };

  const handleUpload = async () => {
    const files = inputRef.current?.files;
    if (!files || files.length === 0) return;

    setState("uploading");
    setProgress({ percent: 0, speed: "Đang nén ảnh...", loaded: "...", total: "..." });

    const fileArray = Array.from(files);
    let finalFiles = fileArray;

    if (type === "images") {
      try {
        finalFiles = await Promise.all(
          fileArray.map(async (f) => {
            if (f.type.startsWith("image/")) {
              const compressed = await imageCompression(f, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
              });
              return new File([compressed], f.name, { type: compressed.type });
            }
            return f;
          })
        );
      } catch (e) {
        console.error("Lỗi nén ảnh", e);
      }
    }

    const totalSize = finalFiles.reduce((acc, f) => acc + f.size, 0);
    const startTime = Date.now();
    setProgress({ percent: 0, speed: "0 KB/s", loaded: "0 B", total: formatBytes(totalSize) });

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/products/${productId}/upload`);

    const fd = new FormData();
    finalFiles.forEach((f) => fd.append("files", f));
    if (type === "images") {
      fd.append("primaryIndex", String(primaryIdx));
    }

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const elapsed = (Date.now() - startTime) / 1000;
      const bps = elapsed > 0 ? evt.loaded / elapsed : 0;
      setProgress({
        percent: Math.round((evt.loaded / evt.total) * 100),
        speed: formatSpeed(bps),
        loaded: formatBytes(evt.loaded),
        total: formatBytes(evt.total),
      });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setState("done");
        toast.success(`Tải lên ${type === "images" ? "ảnh" : "video"} thành công!`);
        // Revoke previews & reset
        setPreviews((old) => {
          old.forEach((p) => URL.revokeObjectURL(p.url));
          return [];
        });
        if (inputRef.current) inputRef.current.value = "";
        setPrimaryIdx(0);
        onUploadComplete();
      } else {
        setState("error");
        setErrorMsg(`Tải lên thất bại (HTTP ${xhr.status}). Vui lòng thử lại.`);
        toast.error("Tải lên thất bại");
      }
    };

    xhr.onerror = () => {
      setState("error");
      setErrorMsg("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.");
      toast.error("Lỗi kết nối mạng");
    };

    xhr.send(fd);
  };

  const isUploading = state === "uploading";
  const hasFiles = previews.length > 0;

  const colorMap: Record<string, { border: string; bg: string; text: string; btn: string; btnHover: string; ring: string; badge: string }> = {
    indigo: {
      border: "border-indigo-100",
      bg: "bg-indigo-50",
      text: "text-indigo-700",
      btn: "bg-gradient-to-r from-indigo-600 to-blue-600 shadow-indigo-500/30",
      btnHover: "hover:brightness-110",
      ring: "ring-indigo-500/20",
      badge: "bg-indigo-600",
    },
    violet: {
      border: "border-violet-100",
      bg: "bg-violet-50",
      text: "text-violet-700",
      btn: "bg-gradient-to-r from-violet-600 to-purple-600 shadow-violet-500/30",
      btnHover: "hover:brightness-110",
      ring: "ring-violet-500/20",
      badge: "bg-violet-600",
    },
  };
  const c = colorMap[accentColor] ?? colorMap["indigo"];

  return (
    <>
      {isUploading && (
        <UploadProgressOverlay
          progress={progress}
          label={`Đang tải lên ${type === "images" ? "ảnh" : "video"}...`}
        />
      )}

      <div className={`rounded-2xl border ${c.border} ${c.bg}/30 p-6 space-y-4`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
            <span className="material-symbols-outlined text-[22px]">{icon}</span>
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{label}</p>
            <p className="text-xs text-slate-500">{hint}</p>
          </div>
        </div>

        {/* File Input */}
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600 uppercase tracking-wider">
            Chọn file
          </label>
          <input
            ref={inputRef}
            type="file"
            accept={acceptAttr}
            multiple={type === "images"}
            onChange={handleFileChange}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-sm file:font-bold file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {errorMsg && (
            <p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-rose-600">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              {errorMsg}
            </p>
          )}
        </div>

        {/* Preview Grid */}
        {hasFiles && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Xem trước ({previews.length} file)
              {type === "images" && <span className="ml-1 font-normal text-slate-400">— Click để chọn ảnh chính</span>}
            </p>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {previews.map((item, i) => (
                <li key={`${item.url}-${i}`}>
                  <label className={type === "images" ? "block cursor-pointer group" : "block"}>
                    <div
                      className={`relative aspect-square overflow-hidden rounded-xl border-2 transition-all duration-200 shadow-sm ${
                        type === "images" && primaryIdx === i
                          ? `border-indigo-500 ring-2 ring-indigo-500/30 shadow-indigo-200`
                          : "border-transparent hover:border-slate-300"
                      }`}
                    >
                      {item.isVideo ? (
                        <video
                          src={item.url}
                          className="h-full w-full object-cover"
                          muted
                          playsInline
                        />
                      ) : (
                        <img src={item.url} alt="" className="h-full w-full object-cover" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                      <span className={`absolute left-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-white ${c.badge}`}>
                        {type === "images"
                          ? primaryIdx === i
                            ? "★ Chính"
                            : `Ảnh ${i + 1}`
                          : `Video ${i + 1}`}
                      </span>
                      <span className="absolute right-2 bottom-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[9px] font-semibold text-white/90">
                        {formatBytes(item.size)}
                      </span>
                    </div>
                    {type === "images" && (
                      <input
                        type="radio"
                        className="sr-only"
                        checked={primaryIdx === i}
                        onChange={() => setPrimaryIdx(i)}
                      />
                    )}
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Upload Button */}
        <button
          type="button"
          disabled={!hasFiles || isUploading}
          onClick={handleUpload}
          className={`flex w-full items-center justify-center gap-2 rounded-xl ${c.btn} px-5 py-3 text-sm font-bold text-white shadow-xl ${c.btnHover} transition-all hover:-translate-y-0.5 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <span className="material-symbols-outlined text-[20px]">
            {isUploading ? "sync" : "cloud_upload"}
          </span>
          {isUploading
            ? `Đang tải lên... ${progress.percent}%`
            : `Tải lên ${type === "images" ? "ảnh" : "video"}`}
        </button>
      </div>
    </>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Main export: ProductMediaUploadSection
// ────────────────────────────────────────────────────────────────────────────
interface ProductMediaUploadSectionProps {
  productId: number;
  onUploadComplete: () => void;
}

export function ProductMediaUploadSection({
  productId,
  onUploadComplete,
}: ProductMediaUploadSectionProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Images panel */}
      <UploadPanel
        productId={productId}
        accessToken=""
        type="images"
        label="Tải lên ảnh sản phẩm"
        hint="JPG, PNG, WebP. Chọn nhiều file; click ảnh xem trước để đặt ảnh chính."
        icon="photo_library"
        accentColor="indigo"
        onUploadComplete={onUploadComplete}
      />

      {/* Videos panel */}
      <UploadPanel
        productId={productId}
        accessToken=""
        type="videos"
        label="Tải lên video sản phẩm"
        hint="MP4, WebM, MOV. Thời lượng bắt buộc dưới 60 giây."
        icon="movie"
        accentColor="violet"
        onUploadComplete={onUploadComplete}
      />
    </div>
  );
}
