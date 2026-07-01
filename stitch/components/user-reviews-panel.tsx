"use client";

import { useEffect, useState } from "react";
import { getUserReviews, ReviewResponseDto } from "@/lib/review-api";
import Link from "next/link";

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
        return <div className="p-8 text-center animate-pulse text-sm text-slate-500">Đang tải đánh giá...</div>;
    }

    if (reviews.length === 0) {
        return (
            <div className="rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">rate_review</span>
                <p className="text-lg font-bold text-slate-500">Bạn chưa viết đánh giá nào.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {reviews.map(review => (
                <div key={review.id} className="rounded-[2rem] border border-slate-100 bg-white p-6 transition-all hover:border-amber-200 hover:shadow-xl hover:shadow-amber-50">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1 text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className="material-symbols-outlined text-[16px]">
                                    {i < review.rating ? "star" : "star_rate"}
                                </span>
                            ))}
                        </div>
                        <span className="text-xs font-medium text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed mb-4">{review.content}</p>
                    <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                        <Link href={`/product/${review.productId}`} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition">
                            Xem sản phẩm
                        </Link>
                        <Link href={`/my-orders/${review.orderId}`} className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition">
                            Xem đơn hàng
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
