"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createReview, uploadReviewMedia } from "@/lib/review-api";

interface WriteReviewButtonProps {
    orderId: number;
    productId: number;
    variantId?: number | null;
    productName: string;
    accessToken: string;
    userId: string;
}

export function WriteReviewButton({ orderId, productId, variantId, productName, accessToken, userId }: WriteReviewButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [rating, setRating] = useState(5);
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [files, setFiles] = useState<File[]>([]);
    const router = useRouter();

    const previews = useMemo(
        () => files.map((file) => ({ file, url: URL.createObjectURL(file), isVideo: file.type.startsWith("video/") })),
        [files],
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    function resetForm() {
        setRating(5);
        setContent("");
        setFiles([]);
        setError("");
    }

    function closeModal() {
        if (loading) return;
        setIsOpen(false);
        resetForm();
    }

    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !loading) {
                closeModal();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isOpen, loading]);

    useEffect(() => {
        if (!mounted || !isOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [isOpen, mounted]);

    useEffect(() => {
        return () => {
            previews.forEach((preview) => URL.revokeObjectURL(preview.url));
        };
    }, [previews]);

    async function handleFilesChange(event: React.ChangeEvent<HTMLInputElement>) {
        const nextFiles = Array.from(event.target.files ?? []);
        setError("");
        if (!nextFiles.length) {
            setFiles([]);
            return;
        }

        const accepted = nextFiles.filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/"));
        if (accepted.length !== nextFiles.length) {
            setError("Chỉ hỗ trợ ảnh hoặc video.");
        }
        setFiles(accepted.slice(0, 8));
    }

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setLoading(true);
        setError("");

        try {
            const mediaUrls = await uploadReviewMedia(files, accessToken);
            await createReview(
                {
                    orderId,
                    productId,
                    variantId: variantId ?? 0,
                    rating,
                    content,
                    mediaUrls,
                },
                accessToken,
                userId,
            );
            setIsOpen(false);
            resetForm();
            router.refresh();
        } catch (err: any) {
            setError(err.message || "Failed to submit review");
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="mt-2 rounded-xl bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20"
            >
                Đánh giá sản phẩm
            </button>
        );
    }

    if (!mounted) {
        return null;
    }

    return createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xl sm:p-6 overflow-y-auto">
            <div className="relative w-full max-w-5xl rounded-[2.5rem] border border-white/40 bg-white/80 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] backdrop-blur-3xl dark:border-slate-700/50 dark:bg-slate-900/80 my-auto overflow-hidden flex flex-col max-h-[90vh]">
                <div className="shrink-0 flex items-start justify-between gap-4 border-b border-white/50 bg-white/50 px-6 py-6 backdrop-blur-md dark:border-slate-800/50 dark:bg-slate-900/50 sm:px-10">
                    <div>
                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-indigo-500">Đánh giá đơn hàng #{orderId}</p>
                        <h3 className="mt-2 text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100">Đánh giá sản phẩm</h3>
                        <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">{productName}</p>
                    </div>
                    <button
                        type="button"
                        onClick={closeModal}
                        className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/60 text-slate-500 shadow-sm transition hover:bg-white hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto p-6 sm:p-10"
                >
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                    <div className="space-y-8">
                        {error ? (
                            <div className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700 backdrop-blur-sm">
                                {error}
                            </div>
                        ) : null}

                        <section className="rounded-[2rem] border border-white/50 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">Nội dung đánh giá</label>
                            <textarea
                                value={content}
                                onChange={(event) => setContent(event.target.value)}
                                required
                                rows={10}
                                className="mt-3 block w-full rounded-[1.25rem] border border-white/60 bg-white/60 px-5 py-4 text-sm text-slate-900 shadow-inner outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-600 dark:bg-slate-900/50 dark:text-white"
                                placeholder="Chia sẻ trải nghiệm thực tế về sản phẩm, chất lượng, đóng gói, màu sắc, độ hoàn thiện..."
                            />
                        </section>

                        <section className="rounded-[2rem] border border-white/50 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Ảnh / video thực tế</h4>
                                    <p className="mt-1 text-xs text-slate-500">Tối đa 8 file, hỗ trợ ảnh và video.</p>
                                </div>
                                <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 dark:border-indigo-500/30 dark:bg-indigo-500/20 dark:text-indigo-300 dark:hover:bg-indigo-500/30">
                                    <span className="material-symbols-outlined text-[18px]">upload_file</span>
                                    Chọn file
                                    <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFilesChange} />
                                </label>
                            </div>

                            {previews.length > 0 ? (
                                <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                                    {previews.map((preview, index) => (
                                        <div key={`${preview.file.name}-${index}`} className="overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/80 shadow-sm dark:border-slate-700/50 dark:bg-slate-800">
                                            <div className="aspect-square bg-slate-100 dark:bg-slate-900">
                                                {preview.isVideo ? (
                                                    <video src={preview.url} controls className="h-full w-full object-cover" />
                                                ) : (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={preview.url} alt={preview.file.name} className="h-full w-full object-cover" />
                                                )}
                                            </div>
                                            <div className="border-t border-white/50 px-3 py-2 dark:border-slate-700">
                                                <p className="truncate text-xs font-semibold text-slate-700 dark:text-slate-300">{preview.file.name}</p>
                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    {preview.isVideo ? "Video" : "Ảnh"} · {(preview.file.size / 1024 / 1024).toFixed(1)} MB
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mt-5 flex min-h-[160px] flex-col items-center justify-center rounded-[1.5rem] border-2 border-dashed border-slate-300/50 bg-white/30 text-center dark:border-slate-700/50 dark:bg-slate-800/30">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">imagesmode</span>
                                    <p className="mt-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Chưa chọn ảnh hoặc video nào</p>
                                </div>
                            )}
                        </section>
                    </div>

                    <aside className="space-y-6 lg:sticky lg:top-0 lg:self-start">
                        <section className="rounded-[2rem] border border-white/50 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Điểm đánh giá</h4>
                            <div className="mt-4 flex flex-wrap gap-2">
                                {[5, 4, 3, 2, 1].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition ${
                                            rating === star
                                                ? "border-amber-300 bg-amber-50 text-amber-700 shadow-inner dark:bg-amber-900/30 dark:border-amber-500/50 dark:text-amber-400"
                                                : "border-white/60 bg-white/60 text-slate-600 hover:bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-700"
                                        }`}
                                    >
                                        <span>{star}</span>
                                        <span className="material-symbols-outlined text-[18px]">star</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-[2rem] border border-white/50 bg-white/50 p-6 shadow-sm backdrop-blur-sm dark:border-slate-700/50 dark:bg-slate-800/50">
                            <h4 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Tóm tắt</h4>
                            <dl className="mt-4 space-y-3 text-sm">
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-slate-500 dark:text-slate-400">Sản phẩm</dt>
                                    <dd className="max-w-[180px] truncate text-right font-semibold text-slate-800 dark:text-slate-200">{productName}</dd>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-slate-500 dark:text-slate-400">Điểm</dt>
                                    <dd className="font-black text-amber-500">{rating}/5</dd>
                                </div>
                                <div className="flex items-center justify-between gap-3">
                                    <dt className="text-slate-500 dark:text-slate-400">Đính kèm</dt>
                                    <dd className="font-semibold text-slate-800 dark:text-slate-200">{files.length} file</dd>
                                </div>
                            </dl>

                            <button
                                type="submit"
                                disabled={loading || !content.trim()}
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-[1.25rem] bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:scale-[1.02] disabled:pointer-events-none disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                                        Đang xử lý...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-[18px]">send</span>
                                        Gửi đánh giá
                                    </>
                                )}
                            </button>
                        </section>
                    </aside>
                    </div>
                </form>
            </div>
        </div>,
        document.body,
    );
}
