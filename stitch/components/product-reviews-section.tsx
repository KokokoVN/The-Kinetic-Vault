"use client";

import { useEffect, useMemo, useState } from "react";
import { getProductReviews, ReviewResponseDto } from "@/lib/review-api";
import { apiUrl } from "@/lib/api";

export function ProductReviewsSection({ productId }: { productId: number }) {
    const [reviews, setReviews] = useState<ReviewResponseDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedStarFilter, setSelectedStarFilter] = useState<number | null>(null);
    const [activeMediaModal, setActiveMediaModal] = useState<{ url: string; isVideo: boolean } | null>(null);

    useEffect(() => {
        getProductReviews(productId).then(data => {
            setReviews(data);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, [productId]);

    const averageRating = useMemo(() => {
        if (!reviews.length) return 0;
        return reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    }, [reviews]);

    const ratingBuckets = useMemo(() => {
        return [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: reviews.filter((review) => review.rating === star).length,
        }));
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        if (selectedStarFilter === null) return reviews;
        return reviews.filter(r => r.rating === selectedStarFilter);
    }, [reviews, selectedStarFilter]);

    function formatReviewDate(value: string): string {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });
    }

    if (loading) {
        return (
            <div className="rounded-[2.5rem] border border-slate-200/80 dark:border-white/[0.08] bg-white/60 dark:bg-slate-900/60 p-8 backdrop-blur-xl animate-pulse">
                <div className="h-7 w-48 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="mt-4 h-4 w-72 rounded-full bg-slate-100 dark:bg-slate-850" />
                <div className="mt-8 grid gap-6 md:grid-cols-3">
                    <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
                    <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800/60 md:col-span-2" />
                </div>
            </div>
        );
    }

    return (
        <section id="section-reviews" className="relative scroll-mt-24 overflow-hidden rounded-[2.5rem] border border-slate-200/80 dark:border-white/[0.08] bg-white/80 dark:bg-[#0c1017]/80 p-6 md:p-8 lg:p-10 shadow-2xl backdrop-blur-2xl transition-all">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -left-24 -bottom-24 h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />

            {/* Header */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-6 pb-8 border-b border-slate-200/80 dark:border-white/[0.06]">
                <div>
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                        <span className="material-symbols-outlined text-[15px]">verified</span>
                        <span>Đánh giá từ khách hàng</span>
                    </div>
                    <h3 className="mt-2.5 font-headline text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        Trải nghiệm thực tế
                    </h3>
                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Tổng hợp nhận xét khách quan từ người mua đã xác thực đơn hàng.
                    </p>
                </div>

                {/* Average rating luxury pill */}
                <div className="flex items-center gap-4 rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent px-6 py-4 backdrop-blur-xl shadow-lg shadow-amber-500/5">
                    <div className="text-center">
                        <div className="font-headline text-4xl font-black text-amber-500 dark:text-amber-400 tracking-tight">
                            {reviews.length > 0 ? averageRating.toFixed(1) : "—"}
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map(star => (
                                <span key={star} className="material-symbols-outlined text-[16px]">
                                    {reviews.length > 0 && star <= Math.round(averageRating) ? "star" : "star_outline"}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="h-10 w-[1px] bg-amber-500/20" />
                    <div>
                        <div className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Xếp hạng</div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{reviews.length} đánh giá</div>
                    </div>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="relative z-10 my-10 flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/30 p-12 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner">
                        <span className="material-symbols-outlined text-3xl">rate_review</span>
                    </div>
                    <h4 className="mt-4 font-headline text-lg font-bold text-slate-800 dark:text-white">Chưa có đánh giá nào</h4>
                    <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                        Hãy là người đầu tiên trải nghiệm và chia sẻ cảm nhận về sản phẩm này!
                    </p>
                </div>
            ) : (
                <div className="relative z-10 mt-8 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
                    {/* Left stats bar */}
                    <div className="space-y-6">
                        <div className="rounded-3xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/70 dark:bg-[#111722]/80 p-5 backdrop-blur-xl">
                            <h4 className="text-xs font-black uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Phân bố số sao</h4>
                            
                            <div className="mt-5 space-y-2.5">
                                {ratingBuckets.map((bucket) => {
                                    const pct = reviews.length > 0 ? (bucket.count / reviews.length) * 100 : 0;
                                    const isSelected = selectedStarFilter === bucket.star;
                                    return (
                                        <button
                                            key={bucket.star}
                                            type="button"
                                            onClick={() => setSelectedStarFilter(isSelected ? null : bucket.star)}
                                            className={`group w-full grid grid-cols-[56px_minmax(0,1fr)_36px] items-center gap-3 rounded-xl px-2.5 py-1.5 transition-all ${
                                                isSelected 
                                                    ? "bg-amber-500/15 ring-1 ring-amber-500/40" 
                                                    : "hover:bg-slate-200/50 dark:hover:bg-white/5"
                                            }`}
                                        >
                                            <div className="flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                <span>{bucket.star}</span>
                                                <span className="material-symbols-outlined text-[15px] text-amber-500">star</span>
                                            </div>
                                            <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800/80">
                                                <div 
                                                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-500" 
                                                    style={{ width: `${pct}%` }} 
                                                />
                                            </div>
                                            <span className="text-right text-xs font-semibold text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200">
                                                {bucket.count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Filter reset button */}
                            {selectedStarFilter !== null && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedStarFilter(null)}
                                    className="mt-4 w-full rounded-xl border border-slate-300 dark:border-white/10 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                                >
                                    Bỏ lọc ({selectedStarFilter} sao)
                                </button>
                            )}
                        </div>

                        {/* Customer trust card */}
                        <div className="rounded-3xl border border-indigo-500/15 bg-indigo-500/5 p-5">
                            <div className="flex items-center gap-2.5 text-indigo-600 dark:text-indigo-400">
                                <span className="material-symbols-outlined text-xl">shield</span>
                                <span className="text-xs font-black uppercase tracking-wider">Đảm bảo minh bạch</span>
                            </div>
                            <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                                100% đánh giá đến từ khách hàng đã mua và nhận hàng thành công qua hệ thống.
                            </p>
                        </div>
                    </div>

                    {/* Right reviews list */}
                    <div className="space-y-4">
                        {/* Quick filter pills */}
                        <div className="flex flex-wrap items-center gap-2 pb-2">
                            <button
                                type="button"
                                onClick={() => setSelectedStarFilter(null)}
                                className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                                    selectedStarFilter === null
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-md"
                                        : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                                }`}
                            >
                                Tất cả ({reviews.length})
                            </button>
                            {[5, 4, 3, 2, 1].map(s => {
                                const cnt = reviews.filter(r => r.rating === s).length;
                                if (cnt === 0) return null;
                                return (
                                    <button
                                        key={s}
                                        type="button"
                                        onClick={() => setSelectedStarFilter(selectedStarFilter === s ? null : s)}
                                        className={`inline-flex items-center gap-1 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                                            selectedStarFilter === s
                                                ? "bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20"
                                                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10"
                                        }`}
                                    >
                                        <span>{s} sao</span>
                                        <span className="opacity-70">({cnt})</span>
                                    </button>
                                );
                            })}
                        </div>

                        {filteredReviews.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-white/10 p-8 text-center text-sm text-slate-400">
                                Không tìm thấy đánh giá nào tương ứng với bộ lọc.
                            </div>
                        ) : (
                            <div className="space-y-4 max-h-[750px] overflow-y-auto pr-2" style={{ scrollbarWidth: "thin" }}>
                                {filteredReviews.map((review) => (
                                    <article 
                                        key={review.id}
                                        className="group rounded-3xl border border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 dark:bg-[#101622]/60 p-5 md:p-6 backdrop-blur-xl transition-all duration-200 hover:border-slate-300 dark:hover:border-white/15 hover:shadow-lg"
                                    >
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-black text-sm uppercase">
                                                    {review.userName ? review.userName.trim().charAt(0) : `U${review.userId}`}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                                                            {review.userName?.trim() ? review.userName : `Khách hàng #${review.userId}`}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                                                            <span className="material-symbols-outlined text-[12px]">check_circle</span>
                                                            Đã mua hàng
                                                        </span>
                                                    </div>
                                                    <div className="mt-1 flex items-center gap-1.5">
                                                        <div className="flex items-center text-amber-500">
                                                            {Array.from({ length: 5 }).map((_, i) => (
                                                                <span key={i} className="material-symbols-outlined text-[15px]">
                                                                    {i < review.rating ? "star" : "star_outline"}
                                                                </span>
                                                            ))}
                                                        </div>
                                                        <span className="text-xs font-semibold text-slate-400">·</span>
                                                        <span className="text-xs text-slate-400 dark:text-slate-500">
                                                            {formatReviewDate(review.createdAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Metadata chips */}
                                            <div className="flex flex-wrap gap-1.5 text-[11px]">
                                                {review.orderId ? (
                                                    <span className="rounded-lg bg-slate-200/60 dark:bg-white/5 px-2.5 py-1 font-mono font-medium text-slate-600 dark:text-slate-400">
                                                        Đơn #{review.orderId}
                                                    </span>
                                                ) : null}
                                                {review.variantLabel ? (
                                                    <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 font-medium text-indigo-600 dark:text-indigo-400">
                                                        Phân loại: {review.variantLabel}
                                                    </span>
                                                ) : review.variantId ? (
                                                    <span className="rounded-lg bg-indigo-500/10 px-2.5 py-1 font-mono font-medium text-indigo-600 dark:text-indigo-400">
                                                        SKU #{review.variantId}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>

                                        {/* Review text content */}
                                        <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                                            {review.content?.trim() ? review.content : <span className="italic text-slate-400">Khách hàng không để lại nhận xét bằng lời.</span>}
                                        </p>

                                        {/* Attached media */}
                                        {review.mediaUrls && review.mediaUrls.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-2.5">
                                                {review.mediaUrls.map((mediaUrl, idx) => {
                                                    const cleanPath = mediaUrl.startsWith("/api/") ? mediaUrl.substring(4) : mediaUrl;
                                                    const resolvedMediaUrl = cleanPath.startsWith("http") ? cleanPath : apiUrl(cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`);
                                                    const isVideo = !!resolvedMediaUrl.match(/\.(mp4|webm|mov|avi|mkv|3gp|flv)($|\?)/i);
                                                    return (
                                                        <button
                                                            key={`${review.id}-${idx}`}
                                                            type="button"
                                                            onClick={() => setActiveMediaModal({ url: resolvedMediaUrl, isVideo })}
                                                            className="group/media relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 shadow-sm transition-all hover:scale-105 hover:shadow-md"
                                                        >
                                                            {isVideo ? (
                                                                <>
                                                                    <video src={resolvedMediaUrl} className="h-full w-full object-cover" />
                                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover/media:bg-black/20 transition-all">
                                                                        <span className="material-symbols-outlined text-white text-xl drop-shadow">play_arrow</span>
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={resolvedMediaUrl} alt="Review attachment" className="h-full w-full object-cover" />
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Merchant replies */}
                                        {review.replies && review.replies.length > 0 && (
                                            <div className="mt-4 space-y-2.5 rounded-2xl border-l-2 border-indigo-500 bg-indigo-500/5 p-3.5 dark:bg-indigo-500/[0.03]">
                                                {review.replies.map((reply: any) => (
                                                    <div key={reply.id} className="text-xs">
                                                        <div className="flex items-center justify-between font-bold text-indigo-600 dark:text-indigo-400">
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="material-symbols-outlined text-[14px]">support_agent</span>
                                                                Phản hồi từ cửa hàng
                                                            </span>
                                                            <span className="font-normal text-slate-400">
                                                                {reply.createdAt ? formatReviewDate(reply.createdAt) : ""}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed">
                                                            {reply.content}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Media Lightbox Modal */}
            {activeMediaModal && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn"
                    onClick={() => setActiveMediaModal(null)}
                >
                    <div className="relative max-h-[85vh] max-w-[85vw] overflow-hidden rounded-3xl border border-white/20 bg-slate-950 p-2 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button
                            type="button"
                            onClick={() => setActiveMediaModal(null)}
                            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur hover:bg-black"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                        {activeMediaModal.isVideo ? (
                            <video src={activeMediaModal.url} controls autoPlay className="max-h-[80vh] max-w-full rounded-2xl" />
                        ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={activeMediaModal.url} alt="Review attachment enlarged" className="max-h-[80vh] max-w-full rounded-2xl object-contain" />
                        )}
                    </div>
                </div>
            )}
        </section>
    );
}
