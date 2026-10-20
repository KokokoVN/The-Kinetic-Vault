export type VariantTier = {
  name: string;
  value: string;
};

export type ParsedVariant = {
  id?: number;
  sku?: string | null;
  availability?: number | null;
  price?: number | null;
  fullLabel: string;
  tiers: VariantTier[];
};

export function parseLabelToTiers(label: string | null | undefined): VariantTier[] {
  if (!label || typeof label !== "string") return [];
  const trimmed = label.trim();
  if (!trimmed) return [];

  // Try split by semicolon, dot, or comma if key-value formatted with colons
  const delimiters = [";", "·", "|", ",", "/"];
  if (trimmed.includes(":")) {
    for (const delim of delimiters) {
      if (trimmed.includes(delim)) {
        const parts = trimmed.split(delim).map((p) => p.trim()).filter(Boolean);
        const tiers: VariantTier[] = [];
        let allMatched = true;
        for (const p of parts) {
          const colonIdx = p.indexOf(":");
          if (colonIdx > 0) {
            tiers.push({
              name: p.slice(0, colonIdx).trim(),
              value: p.slice(colonIdx + 1).trim(),
            });
          } else {
            allMatched = false;
          }
        }
        if (allMatched && tiers.length > 0) {
          return tiers;
        }
      }
    }

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx > 0) {
      return [
        {
          name: trimmed.slice(0, colonIdx).trim(),
          value: trimmed.slice(colonIdx + 1).trim(),
        },
      ];
    }
  }

  // If delimited by "-" or "/" without colon: e.g. "Đỏ / XL"
  const parts = trimmed.split(/[/|-]/).map((s) => s.trim()).filter(Boolean);
  if (parts.length > 1) {
    return parts.map((part, index) => {
      if (part.includes(":")) {
        const [n, ...v] = part.split(":");
        return { name: n.trim(), value: v.join(":").trim() };
      }
      return {
        name: `Tùy chọn ${index + 1}`,
        value: part,
      };
    });
  }

  return [{ name: "Phiên bản", value: trimmed }];
}

function parseTiersFromRaw(raw: unknown): VariantTier[] {
  if (!raw) return [];
  
  // If string, try JSON parse
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return parseTiersFromRaw(parsed);
      } catch {
        // Not valid JSON, fallback to label parsing
        return parseLabelToTiers(trimmed);
      }
    }
    return parseLabelToTiers(trimmed);
  }

  // If array
  if (Array.isArray(raw)) {
    const tiers: VariantTier[] = [];
    for (const item of raw) {
      if (!item) continue;
      if (typeof item === "string") {
        const sub = parseLabelToTiers(item);
        tiers.push(...sub);
        continue;
      }
      if (typeof item === "object") {
        const name = String(
          (item as any).attributeName ??
          (item as any).tierName ??
          (item as any).name ??
          (item as any).key ??
          (item as any).label ??
          ""
        ).trim();
        const value = String(
          (item as any).attributeValue ??
          (item as any).value ??
          (item as any).val ??
          ""
        ).trim();
        if (name && value) {
          tiers.push({ name, value });
        } else if (value) {
          tiers.push({ name: "Tùy chọn", value });
        } else if (name) {
          tiers.push({ name: "Tùy chọn", value: name });
        }
      }
    }
    return tiers;
  }

  // If object
  if (typeof raw === "object") {
    const tiers: VariantTier[] = [];
    for (const [k, val] of Object.entries(raw as Record<string, unknown>)) {
      const name = String(k ?? "").trim();
      const value = String(val ?? "").trim();
      if (name && value) {
        tiers.push({ name, value });
      }
    }
    return tiers;
  }

  return [];
}

export function parseVariantTiers(v: any): ParsedVariant {
  if (!v) {
    return {
      fullLabel: "",
      tiers: [],
    };
  }

  const id = typeof v.id === "number" ? v.id : v.id ? Number(v.id) || undefined : undefined;
  const sku = v.sku ?? null;
  const rawAvailability = v.availability ?? v.stock ?? v.quantity;
  const availability = rawAvailability != null && rawAvailability !== "" ? Number(rawAvailability) : null;
  const rawPrice = v.price != null && v.price !== "" ? Number(v.price) : null;
  const price = Number.isFinite(rawPrice) ? rawPrice : null;

  const collectedTiers: VariantTier[] = [];
  const seenTierNames = new Set<string>();

  const addTier = (name: string, value: string) => {
    const n = name.trim();
    const val = value.trim();
    if (!n || !val) return;
    const lowerKey = n.toLowerCase();
    if (!seenTierNames.has(lowerKey)) {
      seenTierNames.add(lowerKey);
      collectedTiers.push({ name: n, value: val });
    }
  };

  // 1. Try attributesJson
  if (v.attributesJson) {
    const fromJson = parseTiersFromRaw(v.attributesJson);
    for (const t of fromJson) addTier(t.name, t.value);
  }

  // 2. Try variantAttributes, attributes, attrs
  const rawAttrs = v.variantAttributes || v.attributes || v.attrs;
  if (rawAttrs) {
    const fromAttrs = parseTiersFromRaw(rawAttrs);
    for (const t of fromAttrs) addTier(t.name, t.value);
  }

  // 3. Try color & size columns
  const rawColor = String(v.color ?? "").trim();
  const rawSize = String(v.size ?? "").trim();

  if (rawColor && !seenTierNames.has("màu sắc") && !seenTierNames.has("mau sac") && !seenTierNames.has("color")) {
    addTier("Màu sắc", rawColor);
  }

  if (rawSize) {
    const sizeLower = "kích cỡ";
    const hasSizeTier = seenTierNames.has("kích cỡ") || seenTierNames.has("kich co") || seenTierNames.has("size") || seenTierNames.has("dung lượng");
    if (!hasSizeTier) {
      const parts = rawSize.split(/\s+[-•/]\s+/).map((p) => p.trim()).filter(Boolean);
      if (parts.length > 1) {
        parts.forEach((part, idx) => {
          const tierName = idx === 0 ? "Kích cỡ / Dung lượng" : idx === 1 ? "Phiên bản / Chất liệu" : `Tầng ${idx + 2}`;
          addTier(tierName, part);
        });
      } else {
        addTier("Kích cỡ", rawSize);
      }
    }
  }

  // 4. Try variantName, name, label, title
  const rawLabel = String(v.variantName ?? v.name ?? v.label ?? v.title ?? "").trim();
  if (collectedTiers.length === 0 && rawLabel) {
    const fromLabel = parseLabelToTiers(rawLabel);
    for (const t of fromLabel) addTier(t.name, t.value);
  }

  // 5. Ultimate fallback if still no tiers
  if (collectedTiers.length === 0) {
    if (rawLabel) {
      addTier("Phiên bản", rawLabel);
    } else if (sku) {
      addTier("Phiên bản", `SKU: ${sku}`);
    } else if (id) {
      addTier("Phiên bản", `Biến thể #${id}`);
    }
  }

  const fullLabel = rawLabel || collectedTiers.map((t) => `${t.name}: ${t.value}`).join(" · ");

  return {
    id,
    sku,
    availability,
    price,
    fullLabel: fullLabel || "Biến thể mặc định",
    tiers: collectedTiers,
  };
}

export type ExtractedTier = {
  id: string;
  name: string;
  values: string[];
};

export function extractTiersFromVariants(variants: any[]): ExtractedTier[] {
  if (!variants || !Array.isArray(variants) || variants.length === 0) return [];

  const allParsed = variants.map((v) => parseVariantTiers(v));
  const maxTiersCount = Math.max(...allParsed.map((p) => p.tiers.length), 0);
  if (maxTiersCount === 0) return [];

  const result: ExtractedTier[] = [];

  for (let idx = 0; idx < maxTiersCount; idx++) {
    const tierNamesCount = new Map<string, number>();
    const tierValuesSet = new Set<string>();

    for (const p of allParsed) {
      const t = p.tiers[idx];
      if (t) {
        if (t.name && t.name.trim()) {
          tierNamesCount.set(t.name.trim(), (tierNamesCount.get(t.name.trim()) || 0) + 1);
        }
        if (t.value && t.value.trim()) {
          tierValuesSet.add(t.value.trim());
        }
      }
    }

    let bestName = idx === 0 ? "Màu sắc" : idx === 1 ? "Kích cỡ" : `Tầng ${idx + 1}`;
    let maxCount = 0;
    for (const [name, count] of tierNamesCount.entries()) {
      if (count > maxCount) {
        maxCount = count;
        bestName = name;
      }
    }

    result.push({
      id: `tier_${idx + 1}`,
      name: bestName,
      values: Array.from(tierValuesSet),
    });
  }

  return result;
}

export function getSwatchColor(nameOrHex: string | null | undefined): string | null {
  if (!nameOrHex) return null;
  const val = nameOrHex.trim().toLowerCase();

  // If it's already a valid hex
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(val)) {
    return val;
  }

  const COLOR_MAP: Record<string, string> = {
    "đen": "#000000",
    "black": "#000000",
    "trắng": "#ffffff",
    "white": "#ffffff",
    "đỏ": "#ef4444",
    "red": "#ef4444",
    "xanh dương": "#3b82f6",
    "blue": "#3b82f6",
    "xanh lam": "#2563eb",
    "xanh lá": "#22c55e",
    "green": "#22c55e",
    "vàng": "#eab308",
    "yellow": "#eab308",
    "cam": "#f97316",
    "orange": "#f97316",
    "tím": "#a855f7",
    "purple": "#a855f7",
    "hồng": "#ec4899",
    "pink": "#ec4899",
    "xám": "#64748b",
    "gray": "#64748b",
    "grey": "#64748b",
    "nâu": "#78350f",
    "brown": "#78350f",
    "bạc": "#cbd5e1",
    "silver": "#cbd5e1",
    "vàng đồng": "#d97706",
    "gold": "#eab308",
    "titan": "#94a3b8",
    "titanium": "#94a3b8",
    "midnight": "#0f172a",
    "starlight": "#f8fafc",
    "navy": "#1e3a8a",
    "be": "#f5f5dc",
    "beige": "#f5f5dc",
    "than": "#334155",
    "charcoal": "#334155",
  };

  return COLOR_MAP[val] || null;
}