"use client";

import { useEffect, useState } from "react";
import { getProductReviews, ReviewResponseDto } from "@/lib/review-api";
import { apiUrl } from "@/lib/api";

export function ProductReviewsSection({ productId }: { productId: number }) {
    const [reviews, setReviews] = useState<ReviewResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProductReviews(productId).then(data => {
            setReviews(data);
            setLoading(false);
        }).catch(() => {
            setLoading(false);
        });
    }, [productId]);

    if (loading) {
        return <div className="mt-8 animate-pulse text-sm text-slate-500 dark:text-slate-400">Đang tải đánh giá...</div>;
    }

    const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    const ratingBuckets = [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: reviews.filter((review) => review.rating === star).length,
    }));

    function formatReviewDate(value: string): string {
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleString("vi-VN");
    }

    return (
        <section id="section-reviews" className="scroll-mt-24 rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-6 mb-8">
                <div>
                    <h3 className="font-headline text-2xl font-black text-slate-800 dark:text-white flex items-center gap-3">
                        <span className="material-symbols-outlined text-indigo-500 dark:text-indigo-400 text-3xl">rate_review</span>
                        Đánh giá sản phẩm
                    </h3>
                    <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">Phản hồi thực tế từ khách hàng đã mua sản phẩm này.</p>
                </div>
                <div className="rounded-[1.5rem] border border-amber-200 dark:border-amber-900/40 bg-amber-50/80 dark:bg-amber-950/20 px-5 py-4 shadow-sm">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-700 dark:text-amber-450">Điểm trung bình</p>
                    <div className="mt-2 flex items-end gap-3">
                        <span className="font-headline text-3xl font-black text-amber-600 dark:text-amber-400">{reviews.length > 0 ? averageRating.toFixed(1) : "—"}</span>
                        <span className="pb-1 text-sm font-semibold text-slate-500 dark:text-slate-400">/ 5 · {reviews.length} đánh giá</span>
                    </div>
                </div>
            </div>

            {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-950/20">
                    <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-650 mb-2">reviews</span>
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500">Chưa có đánh giá nào cho sản phẩm này</p>
                </div>
            ) : (
                <div className="grid gap-8 xl:grid-cols-[280px_minmax(0,1fr)]">
                    <div className="rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-5 shadow-sm">
                        <h4 className="text-sm font-black uppercase tracking-[0.18em] text-slate-550 dark:text-slate-400">Phân bố sao</h4>
                        <div className="mt-5 space-y-3">
                            {ratingBuckets.map((bucket) => {
                                const pct = reviews.length > 0 ? (bucket.count / reviews.length) * 100 : 0;
                                return (
                                    <div key={bucket.star} className="grid grid-cols-[52px_minmax(0,1fr)_40px] items-center gap-3">
                                        <div className="flex items-center gap-1 text-sm font-bold text-slate-700 dark:text-slate-300">
                                            <span>{bucket.star}</span>
                                            <span className="material-symbols-outlined text-[16px] text-amber-500">star</span>
                                        </div>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="text-right text-xs font-semibold text-slate-500 dark:text-slate-400">{bucket.count}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-5 max-h-[700px] overflow-y-auto pr-3" style={{ scrollbarWidth: 'thin', scrollbarColor: '#cbd5e1 transparent' }}>
                        {reviews.map(review => (
                            <article key={review.id} className="rounded-[1.5rem] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60 p-6 shadow-sm transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/50">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <div className="flex items-center gap-2 text-amber-500">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <span key={i} className="material-symbols-outlined text-[18px]">
                                                    {i < review.rating ? "star" : "star_rate"}
                                                </span>
                                            ))}
                                            <span className="ml-1 text-sm font-bold text-slate-700 dark:text-slate-350">{review.rating}/5</span>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2 text-xs">
                                            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 font-bold text-slate-700 dark:text-slate-300">User #{review.userId}</span>
                                            <span className="rounded-full bg-blue-50 dark:bg-blue-950/30 px-3 py-1 font-bold text-blue-700 dark:text-blue-400">Đơn #{review.orderId}</span>
                                            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/30 px-3 py-1 font-bold text-indigo-700 dark:text-indigo-400">Biến thể #{review.variantId}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                                        {formatReviewDate(review.createdAt)}
                                    </span>
                                </div>

                                <p className="mt-4 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{review.content?.trim() ? review.content : "Không có nội dung."}</p>

                                {review.mediaUrls && review.mediaUrls.length > 0 ? (
                                    <div className="mt-4 flex flex-wrap gap-3">
                                        {review.mediaUrls.map((mediaUrl, index) => {
                                            const cleanPath = mediaUrl.startsWith("/api/") ? mediaUrl.substring(4) : mediaUrl;
                                            const resolvedMediaUrl = cleanPath.startsWith("http") ? cleanPath : apiUrl(cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`);
                                            const isVideo = !!resolvedMediaUrl.match(/\.(mp4|webm|mov|avi|mkv|3gp|flv)($|\?)/i);
                                            return (
                                            <a
                                                key={`${review.id}-${index}`}
                                                href={resolvedMediaUrl}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="group block h-20 w-20 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm relative"
                                                title={isVideo ? "Xem video đánh giá" : "Xem ảnh đánh giá"}
                                            >
                                                {isVideo ? (
                                                    <>
                                                        <video src={resolvedMediaUrl} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                                                            <span className="material-symbols-outlined text-white text-2xl drop-shadow-md">play_circle</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={resolvedMediaUrl} alt="" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                                                )}
                                            </a>
                                            );
                                        })}
                                    </div>
                                ) : null}

                                {review.replies && review.replies.length > 0 ? (
                                    <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-4">
                                        {review.replies.map((reply: any) => (
                                            <div key={reply.id} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-slate-550 dark:text-slate-400">Phản hồi #{reply.userId}</span>
                                                    <span className="text-xs text-slate-400 dark:text-slate-500">{reply.createdAt ? formatReviewDate(reply.createdAt) : "—"}</span>
                                                </div>
                                                <p className="mt-2 text-sm text-slate-700 dark:text-slate-350">{reply.content ?? "—"}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </article>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
