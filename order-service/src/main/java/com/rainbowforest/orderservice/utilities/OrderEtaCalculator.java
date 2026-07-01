package com.rainbowforest.orderservice.utilities;

import java.text.Normalizer;
import java.time.LocalDate;
import java.util.Locale;

/**
 * Heuristic ETA calculator when we only have free-text shippingAddress.
 * Can be replaced later by structured address (province/city codes).
 */
public final class OrderEtaCalculator {

    private OrderEtaCalculator() {}

    public enum Region {
        HCMC,
        HANOI,
        CENTRAL,
        OTHER
    }

    public static Region inferRegion(String shippingAddress) {
        String raw = shippingAddress == null ? "" : shippingAddress.trim();
        if (raw.isEmpty()) {
            return Region.OTHER;
        }
        String normalized = normalize(raw);

        if (containsAny(normalized, "tp hcm", "tphcm", "ho chi minh", "hcm", "sai gon", "saigon")) {
            return Region.HCMC;
        }
        if (containsAny(normalized, "ha noi", "hanoi")) {
            return Region.HANOI;
        }
        // Central / other major hubs in VN (heuristic)
        if (containsAny(normalized, "da nang", "danang", "hue", "nha trang", "nhatrang", "khanh hoa", "can tho", "cantho")) {
            return Region.CENTRAL;
        }
        return Region.OTHER;
    }

    /**
     * Calculate estimated delivery date based on inferred region.
     *
     * @param baseDate Prefer orderedDate; if null, use today
     * @param shippingAddress free-text address
     */
    public static LocalDate calculate(LocalDate baseDate, String shippingAddress) {
        LocalDate base = baseDate != null ? baseDate : LocalDate.now();
        Region region = inferRegion(shippingAddress);
        switch (region) {
            case HCMC:
                return base.plusDays(1);
            case HANOI:
                return base.plusDays(2);
            case CENTRAL:
                return base.plusDays(3);
            case OTHER:
            default:
                return base.plusDays(4);
        }
    }

    private static String normalize(String s) {
        String n = Normalizer.normalize(s, Normalizer.Form.NFD);
        n = n.replaceAll("\\p{M}", "");
        n = n.toLowerCase(Locale.ROOT);
        n = n.replaceAll("[^a-z0-9\\s]", " ");
        n = n.replaceAll("\\s+", " ").trim();
        return n;
    }

    private static boolean containsAny(String haystack, String... needles) {
        if (haystack == null || haystack.isEmpty()) return false;
        for (String needle : needles) {
            if (needle != null && !needle.isEmpty() && haystack.contains(needle)) {
                return true;
            }
        }
        return false;
    }
}
