"use client";

import { useEffect, useState } from "react";
import { getUserReviews, ReviewResponseDto } from "@/lib/review-api";
import Link from "next/link";

import { apiUrl } from "@/lib/api";

export function UserReviewsPanel({ accessToken, userId }: { accessToken: string; userId: string }) {
    const [reviews, setReviews] = useState<ReviewResponseDto[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        getUserReviews(accessToken, userId).then(data => {
            if (mounted) {
                setReviews(data);
                setLoading(false);
            }
        }).catch(() => {
            if (mounted) setLoading(false);
        });
        return () => { mounted = false; };
    }, [accessToken, userId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12">
                <span className="material-symbols-outlined animate-spin text-4xl text-amber-400 mb-3">sync</span>
                <p className="text-xs font-bold text-zinc-400">Đang tải danh sách đánh giá...</p>
            </div>
        );
    }

    if (reviews.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-zinc-800 bg-zinc-900/50 py-16 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 mb-4">
                    <span className="material-symbols-outlined text-4xl">rate_review</span>
                </div>
                <h3 className="text-lg font-black text-white">Bạn chưa viết đánh giá nào</h3>
                <p className="mt-1 text-xs text-zinc-400">Đánh giá sản phẩm đã mua để giúp đỡ cộng đồng người dùng nhé!</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 sm:grid-cols-2">
            {reviews.map(review => (
                <div key={review.id} className="group relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-zinc-900/90 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1 text-amber-400">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <span key={i} className="material-symbols-outlined text-lg">
                                        {i < review.rating ? "star" : "star_rate"}
                                    </span>
                                ))}
                            </div>
                            <span className="text-[11px] font-bold text-zinc-400">
                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>

                        {review.variantLabel ? (
                            <div className="mb-2.5">
                                <span className="inline-block rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-medium text-amber-300">
                                    Phân loại: {review.variantLabel}
                                </span>
                            </div>
                        ) : null}

                        <p className="text-sm text-zinc-200 leading-relaxed mb-4 font-normal">
                            {review.content?.trim() ? review.content : <span className="italic text-zinc-500">Không có nhận xét văn bản.</span>}
                        </p>

                        {/* Media thumbnails */}
                        {review.mediaUrls && review.mediaUrls.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4">
                                {review.mediaUrls.map((url, i) => {
                                    const cleanPath = url.startsWith("/api/") ? url.substring(4) : url;
                                    const resolved = cleanPath.startsWith("http") ? cleanPath : apiUrl(cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`);
                                    const isVideo = !!resolved.match(/\.(mp4|webm|mov|avi)($|\?)/i);
                                    return (
                                        <div key={i} className="h-12 w-12 rounded-xl overflow-hidden border border-white/10 bg-black/40 relative">
                                            {isVideo ? (
                                                <div className="h-full w-full flex items-center justify-center bg-zinc-800 text-white">
                                                    <span className="material-symbols-outlined text-xs">play_arrow</span>
                                                </div>
                                            ) : (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={resolved} alt="Review attachment" className="h-full w-full object-cover" />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Merchant Reply if any */}
                        {review.replies && review.replies.length > 0 && (
                            <div className="mb-4 rounded-xl border-l-2 border-indigo-400 bg-indigo-500/10 p-3 text-xs text-zinc-300">
                                <p className="font-bold text-indigo-400 mb-1 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[14px]">support_agent</span>
                                    Phản hồi từ cửa hàng
                                </p>
                                <p className="leading-relaxed">{review.replies[0].content}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4 text-xs font-bold">
                        <Link href={`/product/${review.productId}`} className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition">
                            <span className="material-symbols-outlined text-sm">open_in_new</span>
                            <span>Xem sản phẩm</span>
                        </Link>
                        <Link href={`/my-orders/${review.orderId}`} className="inline-flex items-center gap-1.5 text-zinc-400 hover:text-white transition">
                            <span className="material-symbols-outlined text-sm">receipt_long</span>
                            <span>Xem đơn hàng</span>
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}

