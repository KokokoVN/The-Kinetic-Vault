import crypto from "crypto";

export function getRequiredEnv(name: string): string {
  const v = (process.env[name] ?? "").trim();
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

export function hmacSha256Hex(secret: string, data: string): string {
  return crypto.createHmac("sha256", secret).update(Buffer.from(data, "utf-8")).digest("hex");
}

export function sortObjDataByKey<T extends Record<string, unknown>>(obj: T): T {
  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      (acc as Record<string, unknown>)[key] = obj[key];
      return acc;
    }, {} as T);
}

export function convertObjToQueryStr(object: Record<string, unknown>): string {
  return Object.keys(object)
    .filter((key) => object[key] !== undefined)
    .map((key) => {
      let value = object[key];
      if (value && Array.isArray(value)) {
        value = JSON.stringify(value.map((val) => (typeof val === "object" && val != null ? sortObjDataByKey(val as Record<string, unknown>) : val)));
      }
      if ([null, undefined, "undefined", "null"].includes(value as any)) {
        value = "";
      }
      return `${key}=${String(value)}`;
    })
    .join("&");
}

