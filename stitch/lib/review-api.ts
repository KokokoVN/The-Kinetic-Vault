import { apiUrl } from "./api";

export interface ReviewResponseDto {
    id: number;
    userId: number;
    orderId: number;
    productId: number;
    variantId: number;
    rating: number;
    content: string;
    createdAt: string;
    updatedAt: string;
    mediaUrls?: string[];
    replies?: any[];
}

export interface ReviewRequest {
    orderId: number;
    productId: number;
    variantId: number;
    rating: number;
    content: string;
    mediaUrls?: string[];
}

export async function uploadReviewMedia(files: File[], accessToken: string): Promise<string[]> {
    if (!files.length) return [];
    if (!accessToken) {
        throw new Error("Unauthorized");
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

    const res = await fetch(apiUrl("/reviews/reviews/media/upload"), {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Upload review media thất bại");
    }
    const data = await res.json();
    return Array.isArray(data?.urls) ? data.urls : [];
}

export async function createReview(request: ReviewRequest, accessToken: string, userId: string): Promise<ReviewResponseDto> {
    if (!accessToken || !userId?.trim()) {
        throw new Error("Unauthorized");
    }

    const res = await fetch(apiUrl("/reviews/reviews"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            userId: userId.trim(),
        },
        body: JSON.stringify(request),
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(err || "Failed to create review");
    }

    return res.json();
}

export async function getProductReviews(productId: number): Promise<ReviewResponseDto[]> {
    const res = await fetch(apiUrl(`/reviews/reviews/product/${productId}`));
    if (!res.ok) {
        return [];
    }
    return res.json();
}

export async function getUserReviews(accessToken: string, userId: string): Promise<ReviewResponseDto[]> {
    if (!accessToken || !userId?.trim()) {
        throw new Error("Unauthorized");
    }

    const res = await fetch(apiUrl("/reviews/reviews/user"), {
        headers: {
            Authorization: `Bearer ${accessToken}`,
            userId: userId.trim(),
        },
    });
    if (!res.ok) {
        return [];
    }
    return res.json();
}
