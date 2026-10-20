import { NextRequest } from "next/server";
import { serveUploadImage } from "@/lib/serve-upload-file";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params;
  return serveUploadImage("product-images", filename);
}
