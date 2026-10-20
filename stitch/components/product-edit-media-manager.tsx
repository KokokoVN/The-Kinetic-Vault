"use client";

import React, { useState, useRef, useTransition, useMemo } from "react";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

export type ProductMediaItem = {
  id: number;
  imageUrl?: string | null;
  storagePath: string;
  sortOrder?: number;
  primaryImage?: boolean;
  mediaType?: string | null;
  displayUrl: string;
};

interface ProductEditMediaManagerProps {
  productId: number;
  mediaList: ProductMediaItem[];
  setPrimaryImageAction: (formData: FormData) => Promise<void> | void;
  deleteImageAction: (formData: FormData) => Promise<void> | void;
  onUploadComplete: () => Promise<void> | void;
}

function isVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const clean = url.split("?")[0].split("#")[0].toLowerCase();
  return (
    clean.endsWith(".mp4") ||
    clean.endsWith(".webm") ||
    clean.endsWith(".ogg") ||
    clean.endsWith(".mov") ||
    clean.endsWith(".mkv") ||
    clean.endsWith(".flv") ||
    clean.endsWith(".3gp")
  );
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

export function ProductEditMediaManager({
  productId,
  mediaList,
  setPrimaryImageAction,
  deleteImageAction,
  onUploadComplete,
}: ProductEditMediaManagerProps) {
  const [filterType, setFilterType] = useState<"all" | "images" | "videos">("all");
  const [showUploadDrawer, setShowUploadDrawer] = useState<boolean>(mediaList.length === 0);
  const [activeTab, setActiveTab] = useState<"images" | "videos">("images");

  // Lightbox preview modal state
  const [previewMedia, setPreviewMedia] = useState<ProductMediaItem | null>(null);

  // Transitions for server actions
  const [isPending, startTransition] = useTransition();
  const [actionMediaId, setActionMediaId] = useState<number | null>(null);

  // Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<
    { file: File; url: string; isVideo: boolean; name: string; size: number }[]
  >([]);
  const [primaryIdx, setPrimaryIdx] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filtered media
  const { filteredList, imageCount, videoCount } = useMemo(() => {
    let images = 0;
    let videos = 0;
    const list: ProductMediaItem[] = [];

    for (const item of mediaList) {
      const isVid = isVideoUrl(item.displayUrl) || item.mediaType === "VIDEO";
      if (isVid) videos++;
      else images++;

      if (filterType === "all") list.push(item);
      else if (filterType === "images" && !isVid) list.push(item);
      else if (filterType === "videos" && isVid) list.push(item);
    }

    return { filteredList: list, imageCount: images, videoCount: videos };
  }, [mediaList, filterType]);

  // Handle Set Primary Image
  const handleSetPrimary = (id: number) => {
    setActionMediaId(id);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("imageId", String(id));
        await setPrimaryImageAction(fd);
        toast.success("Đã đặt làm ảnh chính thành công");
      } catch (e: any) {
        toast.error(e?.message || "Không thể đặt làm ảnh chính");
      } finally {
        setActionMediaId(null);
      }
    });
  };

  // Handle Delete Media
  const handleDeleteMedia = (id: number) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa phương tiện #${id}?`)) return;
    setActionMediaId(id);
    startTransition(async () => {
      try {
        const fd = new FormData();
        fd.append("imageId", String(id));
        await deleteImageAction(fd);
        toast.success("Đã xóa phương tiện thành công");
      } catch (e: any) {
        toast.error(e?.message || "Không thể xóa phương tiện");
      } finally {
        setActionMediaId(null);
      }
    });
  };

  // Handle File Input Change
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    setErrorMsg(null);
    if (!list?.length) return;

    const files = Array.from(list);
    const valid: typeof files = [];
    const invalid: string[] = [];

    for (const file of files) {
      const isVid = file.type.startsWith("video/") || /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(file.name);
      if (activeTab === "images" && isVid) continue;
      if (activeTab === "videos" && !isVid) continue;

      if (isVid) {
        const dur = await getVideoDuration(file);
        if (dur > 60) {
          invalid.push(`"${file.name}" (${Math.round(dur)}s > 60s)`);
          continue;
        }
      }
      valid.push(file);
    }

    if (invalid.length > 0) {
      setErrorMsg(`Video vượt 60 giây đã bị bỏ qua: ${invalid.join(", ")}`);
    }

    const newItems = valid.map((f) => ({
      file: f,
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith("video/") || /\.(mp4|webm|ogg|mov|mkv|avi)$/i.test(f.name),
      name: f.name,
      size: f.size,
    }));

    setSelectedFiles((prev) => [...prev, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSelectedFile = (idx: number) => {
    setSelectedFiles((prev) => {
      const target = prev[idx];
      if (target) URL.revokeObjectURL(target.url);
      const updated = prev.filter((_, i) => i !== idx);
      if (primaryIdx >= updated.length) setPrimaryIdx(Math.max(0, updated.length - 1));
      return updated;
    });
  };

  const clearSelectedFiles = () => {
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.url));
    setSelectedFiles([]);
    setPrimaryIdx(0);
    setErrorMsg(null);
  };

  // Upload handler with compression and XHR
  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadPercent(0);
    setUploadSpeed("Đang nén ảnh...");

    let finalFiles = selectedFiles.map((s) => s.file);

    if (activeTab === "images") {
      try {
        finalFiles = await Promise.all(
          finalFiles.map(async (f) => {
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
      } catch (err) {
        console.error("Lỗi nén ảnh:", err);
      }
    }

    const totalSize = finalFiles.reduce((acc, f) => acc + f.size, 0);
    const startTime = Date.now();

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/admin/products/${productId}/upload`);

    const fd = new FormData();
    finalFiles.forEach((f) => fd.append("files", f));
    if (activeTab === "images") {
      fd.append("primaryIndex", String(primaryIdx));
    }

    xhr.upload.onprogress = (evt) => {
      if (!evt.lengthComputable) return;
      const elapsed = (Date.now() - startTime) / 1000;
      const bps = elapsed > 0 ? evt.loaded / elapsed : 0;
      setUploadPercent(Math.round((evt.loaded / evt.total) * 100));
      setUploadSpeed(formatSpeed(bps));
    };

    xhr.onload = async () => {
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        toast.success(`Tải lên ${activeTab === "images" ? "ảnh" : "video"} thành công!`);
        clearSelectedFiles();
        setShowUploadDrawer(false);
        await onUploadComplete();
      } else {
        toast.error(`Tải lên thất bại (Mã lỗi: ${xhr.status})`);
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      toast.error("Lỗi kết nối khi tải lên phương tiện");
    };

    xhr.send(fd);
  };

  return (
    <div className="space-y-6">
      {/* ── Lightbox Preview Modal ── */}
      {previewMedia && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="relative max-h-[90vh] max-w-4xl w-full overflow-hidden rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl flex flex-col items-center justify-center p-2"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex w-full items-center justify-between px-4 py-2 border-b border-white/10 text-white">
              <div className="flex items-center gap-2 text-xs font-bold">
                <span className="font-mono bg-white/10 px-2 py-0.5 rounded-md">#{previewMedia.id}</span>
                {previewMedia.primaryImage && (
                  <span className="bg-indigo-600/90 text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                    ★ Ảnh chính
                  </span>
                )}
                <span className="text-zinc-400 font-mono text-[11px] truncate max-w-xs">
                  {previewMedia.storagePath}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Đóng"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Media Content */}
            <div className="w-full flex items-center justify-center p-4 max-h-[75vh]">
              {isVideoUrl(previewMedia.displayUrl) || previewMedia.mediaType === "VIDEO" ? (
                <video
                  src={previewMedia.displayUrl}
                  controls
                  autoPlay
                  className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-lg"
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={previewMedia.displayUrl}
                  alt=""
                  className="max-h-[70vh] max-w-full rounded-2xl object-contain shadow-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Section Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-headline text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400 text-2xl">
              perm_media
            </span>
            <span>Ảnh & Video sản phẩm</span>
            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 text-xs px-2.5 py-0.5 font-black">
              {mediaList.length}
            </span>
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
            Di chuột vào ảnh để đặt ảnh chính, xem phóng to hoặc xóa.
          </p>
        </div>

        {/* Filter Pills & Toggle Upload Button */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Segmented Control */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-zinc-800/80 p-1 text-xs font-bold text-slate-600 dark:text-zinc-300 border border-slate-200/60 dark:border-white/5">
            <button
              type="button"
              onClick={() => setFilterType("all")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                filterType === "all"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs font-black"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Tất cả ({mediaList.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("images")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                filterType === "images"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs font-black"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Ảnh ({imageCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterType("videos")}
              className={`rounded-lg px-2.5 py-1 transition-all ${
                filterType === "videos"
                  ? "bg-white dark:bg-zinc-700 text-indigo-600 dark:text-white shadow-xs font-black"
                  : "hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Video ({videoCount})
            </button>
          </div>

          {/* Toggle Upload Drawer */}
          <button
            type="button"
            onClick={() => setShowUploadDrawer((prev) => !prev)}
            className={`flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all shadow-xs ${
              showUploadDrawer
                ? "bg-slate-200 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200"
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20 hover:scale-[1.02]"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">
              {showUploadDrawer ? "expand_less" : "cloud_upload"}
            </span>
            <span>{showUploadDrawer ? "Thu gọn tải lên" : "+ Tải thêm ảnh/video"}</span>
          </button>
        </div>
      </div>

      {/* ── Collapsible Compact Upload Drawer ── */}
      {showUploadDrawer && (
        <div className="rounded-2xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/20 p-4 sm:p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {/* Tab Switcher */}
          <div className="flex items-center justify-between border-b border-indigo-100/60 dark:border-indigo-900/40 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("images");
                  clearSelectedFiles();
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "images"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-indigo-50 dark:hover:bg-zinc-700"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">photo_library</span>
                <span>Tải ảnh sản phẩm</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("videos");
                  clearSelectedFiles();
                }}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "videos"
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-violet-50 dark:hover:bg-zinc-700"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">movie</span>
                <span>Tải video (&lt; 60s)</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              {activeTab === "images"
                ? "Hỗ trợ JPG, PNG, WebP — Tự động nén tối ưu dung lượng."
                : "Hỗ trợ MP4, WebM, MOV — Thời lượng tối đa 60 giây."}
            </p>
          </div>

          {/* Compact Drop / File Picker Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="group relative cursor-pointer rounded-xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/60 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white/80 dark:bg-zinc-900/60 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 p-4 transition-all flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={
                activeTab === "images"
                  ? "image/jpeg,image/png,image/webp,image/*"
                  : "video/mp4,video/webm,video/ogg,video/mov,video/*"
              }
              multiple={activeTab === "images"}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-[20px]">
                {activeTab === "images" ? "add_photo_alternate" : "video_call"}
              </span>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                Bấm vào đây hoặc kéo thả file để chọn {activeTab === "images" ? "ảnh" : "video"}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {activeTab === "images"
                  ? "Có thể chọn nhiều ảnh cùng lúc, click ảnh xem trước để đặt làm ảnh chính."
                  : "Chỉ chọn 1 video, thời lượng dưới 60 giây."}
              </p>
            </div>
          </div>

          {errorMsg && (
            <p className="flex items-center gap-1.5 text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3 py-2 rounded-xl">
              <span className="material-symbols-outlined text-[16px]">warning</span>
              {errorMsg}
            </p>
          )}

          {/* Selected File Previews Grid */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Đã chọn {selectedFiles.length} file{" "}
                  {activeTab === "images" && "(Click để chọn ảnh chính)"}:
                </span>
                <button
                  type="button"
                  onClick={clearSelectedFiles}
                  className="text-rose-600 hover:underline text-[11px] font-semibold"
                >
                  Xóa tất cả đã chọn
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
                {selectedFiles.map((item, idx) => (
                  <div
                    key={`${item.name}-${idx}`}
                    onClick={() => {
                      if (activeTab === "images") setPrimaryIdx(idx);
                    }}
                    className={`group relative aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                      activeTab === "images" && primaryIdx === idx
                        ? "border-indigo-600 ring-2 ring-indigo-500/30 shadow-md"
                        : "border-slate-200 dark:border-zinc-700 hover:border-slate-400"
                    }`}
                  >
                    {item.isVideo ? (
                      <video src={item.url} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={item.url} alt="" className="h-full w-full object-cover" />
                    )}

                    {/* Badge */}
                    <span className="absolute top-1 left-1 rounded bg-black/60 backdrop-blur-xs text-[9px] font-bold text-white px-1.5 py-0.2">
                      {activeTab === "images" ? (primaryIdx === idx ? "★ Chính" : `#${idx + 1}`) : "Video"}
                    </span>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSelectedFile(idx);
                      }}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white hover:bg-rose-700 opacity-90 hover:opacity-100 transition-opacity"
                      title="Bỏ file này"
                    >
                      <span className="material-symbols-outlined text-[12px]">close</span>
                    </button>

                    <div className="absolute bottom-0 inset-x-0 bg-black/60 p-0.5 text-center text-[9px] font-mono text-white/90 truncate">
                      {formatBytes(item.size)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Upload Action */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={handleUpload}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50 transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isUploading ? "sync" : "cloud_upload"}
                  </span>
                  <span>
                    {isUploading
                      ? `Đang tải lên... ${uploadPercent}%`
                      : `Bắt đầu tải lên (${selectedFiles.length} file)`}
                  </span>
                </button>

                {isUploading && (
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{uploadSpeed}</span>
                      <span>{uploadPercent}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-zinc-700 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-150"
                        style={{ width: `${uploadPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Compact Gallery Grid ── */}
      {filteredList.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 p-8 text-center space-y-2">
          <span className="material-symbols-outlined text-4xl text-slate-400">photo_library</span>
          <p className="text-sm font-bold text-slate-600 dark:text-zinc-400">
            {filterType === "all"
              ? "Sản phẩm chưa có ảnh hoặc video nào."
              : filterType === "images"
              ? "Không có ảnh nào."
              : "Không có video nào."}
          </p>
          <button
            type="button"
            onClick={() => setShowUploadDrawer(true)}
            className="text-xs font-bold text-indigo-600 hover:underline inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Bấm vào đây để tải lên ngay
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {filteredList.map((item) => {
            const isVid = isVideoUrl(item.displayUrl) || item.mediaType === "VIDEO";
            const isItemPending = isPending && actionMediaId === item.id;

            return (
              <div
                key={item.id}
                className={`group relative aspect-square rounded-2xl overflow-hidden border bg-slate-900 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${
                  item.primaryImage
                    ? "border-indigo-500 ring-2 ring-indigo-500/20 shadow-indigo-500/10"
                    : "border-slate-200/80 dark:border-white/10 hover:border-indigo-300 dark:hover:border-indigo-500"
                }`}
              >
                {/* Media Image or Video */}
                {isVid ? (
                  <video
                    src={item.displayUrl}
                    className="h-full w-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                    muted
                    playsInline
                  />
                ) : (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={item.displayUrl}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Permanent Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10">
                  {item.primaryImage && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-600/90 backdrop-blur-md px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shadow-xs">
                      <span className="material-symbols-outlined text-[11px]">star</span>
                      <span>Chính</span>
                    </span>
                  )}
                  {isVid && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/95">
                      <span className="material-symbols-outlined text-[11px]">play_circle</span>
                      <span>Video</span>
                    </span>
                  )}
                </div>

                {/* ID chip at bottom-left */}
                <div className="absolute bottom-2 left-2 pointer-events-none z-10">
                  <span className="rounded-md bg-black/50 backdrop-blur-xs px-1.5 py-0.5 font-mono text-[9px] font-bold text-white/90">
                    #{item.id}
                  </span>
                </div>

                {/* Loading Spinner during Action */}
                {isItemPending && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                    <span className="material-symbols-outlined animate-spin text-white text-2xl">
                      sync
                    </span>
                  </div>
                )}

                {/* Hover Glass Overlay with Actions */}
                <div className="absolute inset-0 z-20 flex flex-col justify-between p-2 bg-gradient-to-t from-black/80 via-black/30 to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* Top Right: Lightbox Preview Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setPreviewMedia(item)}
                      className="flex h-7 w-7 items-center justify-center rounded-xl bg-white/20 hover:bg-white/40 text-white backdrop-blur-md transition-all hover:scale-105 shadow-sm"
                      title="Xem phóng to"
                    >
                      <span className="material-symbols-outlined text-[16px]">fullscreen</span>
                    </button>
                  </div>

                  {/* Bottom Actions: Set Primary & Delete */}
                  <div className="flex items-center gap-1.5">
                    {!item.primaryImage && !isVid && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSetPrimary(item.id)}
                        className="flex-1 flex items-center justify-center gap-1 rounded-xl bg-indigo-600/90 hover:bg-indigo-500 py-1.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-md transition-all"
                        title="Đặt làm ảnh chính cho sản phẩm"
                      >
                        <span className="material-symbols-outlined text-[13px]">star</span>
                        <span>Chính</span>
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDeleteMedia(item.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-rose-600/90 hover:bg-rose-500 text-white shadow-xs backdrop-blur-md transition-all ml-auto"
                      title="Xóa phương tiện này"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
