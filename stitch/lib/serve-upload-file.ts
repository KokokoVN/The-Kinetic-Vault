import fs from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";

const MIME_MAP: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

/**
 * Trả về ảnh tĩnh từ thư mục uploads của dự án một cách an toàn và cực nhanh.
 * Hỗ trợ các subfolder: "product-images", "categories", "brand-logos", "banner-images", "avatars".
 */
export function serveUploadImage(subfolder: string, rawFilename: string): NextResponse {
  try {
    const filename = path.basename(decodeURIComponent(rawFilename || ""));
    if (!filename || filename.includes("..") || filename.startsWith(".")) {
      return new NextResponse("Invalid filename", { status: 400 });
    }

    // Kiểm tra các vị trí thư mục uploads có thể có
    const possiblePaths = [
      path.resolve(process.cwd(), "..", "uploads", subfolder, filename),
      path.resolve(process.cwd(), "uploads", subfolder, filename),
      path.resolve("E:/e-commerce-microservices-master/e-commerce-microservices-master/uploads", subfolder, filename),
    ];

    let targetPath: string | null = null;
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        targetPath = p;
        break;
      }
    }

    if (!targetPath) {
      // Trả về SVG Cyber Placeholder sang trọng thay vì 404 để không bao giờ bị vỡ hình trên UI
      const svgFallback = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0b0f19"/>
            <stop offset="50%" stop-color="#111827"/>
            <stop offset="100%" stop-color="#060810"/>
          </linearGradient>
          <linearGradient id="glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#6366f1"/>
            <stop offset="100%" stop-color="#06b6d4"/>
          </linearGradient>
        </defs>
        <rect width="600" height="600" fill="url(#bg)"/>
        <circle cx="300" cy="270" r="110" fill="#6366f1" fill-opacity="0.08" stroke="url(#glow)" stroke-width="2" stroke-dasharray="8 6"/>
        <g transform="translate(252, 222)" fill="url(#glow)">
          <path d="M48 4L6 14v16c0 26.5 17.8 51.3 42 58 24.2-6.7 42-31.5 42-58V14L48 4zm0 18a12 12 0 1 1 0 24 12 12 0 0 1 0-24zm0 54c-12 0-22.5-6-29-15.2 2-7.5 13.5-12.8 29-12.8s27 5.3 29 12.8c-6.5 9.2-17 15.2-29 15.2z"/>
        </g>
        <text x="300" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="800" letter-spacing="3" fill="#e2e8f0" text-anchor="middle">THE KINETIC VAULT</text>
        <text x="300" y="448" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" letter-spacing="4" fill="#6366f1" text-anchor="middle">CYBER PRODUCT MEDIA</text>
      </svg>`;

      return new NextResponse(svgFallback, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Cache-Control": "public, max-age=3600",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";
    const fileBuffer = fs.readFileSync(targetPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, stale-while-revalidate=86400",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    console.error("[serveUploadImage error]", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
