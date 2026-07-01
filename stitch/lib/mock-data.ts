export type Product = {
  id: string;
  name: string;
  subtitle: string;
  category: string;
  sku: string;
  price: string;
  stock: number;
  status: "Còn hàng" | "Sắp hết hàng" | "Hết hàng";
  heroImage: string;
  thumbnails: string[];
  description: string;
};

export const products: Product[] = [
  {
    id: "kv-watch-series-4",
    name: "Kinetic Watch Series 4",
    subtitle: "Phiên bản đen nhám",
    category: "Thiết bị đeo",
    sku: "KV-WTCH-44-BLK",
    price: "$349.00",
    stock: 1240,
    status: "Còn hàng",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCyEaH-redRL0DSUWagr83b4DAx9DAx1pRTKab6MlnMX-241M1hFosHSHWhECVP5kawbGBXIVtXLOnvp_dR5a-LM_tsBfyqIu3FdiLRswbXvuecuDF8JmS3OMEiqd6Nl9-8ZPDNCvkY1Ki6rImxhaR2_u6KEUIaOJZY-4rBjgc_WDhmWTbFSOychgLeNh-kDhBhdHawYTppJDsFpH2zMqQt2npH6qRIAi0aWYeWB6xIl3YRDsqwK_WUy5JDa_LtVBp_f2OlfYhANR_N",
    thumbnails: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCR_DyD1QnAV9WngrY5GO3VcsWMK03zF8ZojAqr26BxU1mQ05QnfJKMLUl6oKuOLecyVJEWbF_bzxEycaAShuBTWmOr1-jdLRwt47lWUM1yLPlNP5OPcaXhMsjmkymwNGq9oxMDHxxJwoxruANsArPgDURGZy5RMgv_Dcxa92wCWgqeu7GOC_lE0nC8e7RLFDQCVVk-l8X_q0mFS-hLtnWBfwOFGKWqMECtfxazY5O9RRCOrN9roJD0IgaWv_SLkUvesrs0jrZI1N_W",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuClq2TZdoQplz-TTccbjUZR3dGiDBMrv9q74RqQMujhfmJkaVkHYYOLhErVorSPRzqAxh9ntJ0pgbYDgBd8tq6ot5szEbVwqSfzQnBTR3fOuJmOPbOYTbvP6RLlaqrvAsILcx4fahBO7eNDgn8DRnT9vPQodchtdhHmMUxVLWTOZQ8syTqXyNNHCuignXO1XQsxKOlBtOsFHKhs5BaFWnRlmZywfYX79dZFFNU-rYoXDlv0yVqQXpeUOVWyj0VNav_0dd3E_jyRJNHh",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDfTtuz3eccESQAs5RqXR-AyPjHTOh0y0imm4yO43P6MF09fQDnyaVc72QpO_At0K9xUrE_L6SV6qESSv9ilVJv3hJU2qLFOne09W6aDejcDW2s_WOExrM_hOqXN6lx1-ACIfpVSWcWT6hoD7tHKHegjE3TeVbVGyidt44TOxxkc347vHA2ANkjMzEfOMuP8laYhVGCTf7pKvSVYe4ndQWx6Nu4oyCUcCF-Mrd4PHspuq5V_KUG2YG4zfGxpaC-vSNvjWMe5zlv2d24",
    ],
    description:
      "Bộ xử lý hiệu năng cao dành cho hạ tầng doanh nghiệp, tối ưu cho bảo mật dữ liệu và vận hành liên tục.",
  },
  {
    id: "vault-audio-pro",
    name: "Vault Audio Pro",
    subtitle: "Chống ồn chủ động",
    category: "Âm thanh",
    sku: "KV-AUD-V1-NVY",
    price: "$299.50",
    stock: 18,
    status: "Sắp hết hàng",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuARD1pLRnVkwVZNAPbqITJB52drHHZmwDeCu7s7DIiGRrMkxLbOcoY215YMe3ZHPiyq2QFUdEa0hZw9ghOpMSUg-7_xWjILbPHPgwC5VaiMVGOBzQxLyL2-I4KEcgzvTFb5mR4E0zhPuM1UmS0-uHoVphjZQCK0Vi0uCC3EX7nVSj-pWEsqUBbEttGy7ntaO_S_ZuYDu2iJubvnv7oAkYIWv0XVC_VcnRu2IbThrowso3eqn2npT6HB__McYdfip9AKfZZz_Hg9uIpY",
    thumbnails: [],
    description:
      "Tai nghe cao cấp với chống ồn chủ động và âm trường rộng, phù hợp không gian làm việc cường độ cao.",
  },
  {
    id: "executive-briefcase",
    name: "Executive Briefcase",
    subtitle: "Da nguyên tấm",
    category: "Phụ kiện",
    sku: "KV-ACC-LTHR-01",
    price: "$550.00",
    stock: 86,
    status: "Còn hàng",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAFYpcKcQoBHel6ivqf78DXWzPfp8v1Rjdg9XzjsSYLdPH_5UUxXLFHcpPOZ-GYQcCMUkiy67BZYxhkutQrtdTr-CE1wyq45MRQQSI64Aktz1o6u8ReZY6QJdMxBtzCVf18Hv58UTI2im-wAwC7oI1qtP-q19QZEHEVmTJ_v6lsTBne3KSj9fu-a6MyUxI1MgTUcDYkRAgiAduHH_lB3RU7adNb3TgT1uljJE3aNdVFjxu5qrPtx2OUVxzmoJ8PXRLxfJIHS3QPZdJR",
    thumbnails: [],
    description:
      "Cặp doanh nhân bằng da cao cấp, hoàn thiện thủ công và phù hợp cho các bộ kit lưu trữ di động.",
  },
  {
    id: "optic-view-360",
    name: "Optic View 360",
    subtitle: "Cảm biến nâng cao",
    category: "Nhiếp ảnh",
    sku: "KV-CAM-OPT-360",
    price: "$1,200.00",
    stock: 0,
    status: "Hết hàng",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBr04tl9a8tErvMsEJIcMWgEwiKIQY2U8Xs7nsSAzxk_rn-koXOxt2cARZsq1dNSKZ4BR4k1d0ZJCkRv-Bh8Otm7REuOpZiF_5aUN4uHKXfkBxIt9g9jRBB5KuprpDtLdiKgU2bdq6V2qY71K8JUcB0K5fwT95n6KTeVAtoHrrIrEBSclR7l8wD35McF91qoRWAlvbMxLTXkTREtjzvh78xfXOJas6FruJQITNtPSZu2hXMVtLnjWfQtDvNt8opFtz17haAHb8xffrH",
    thumbnails: [],
    description:
      "Thiết bị quang học độ phân giải cao dành cho hệ thống giám sát và dựng hình kỹ thuật.",
  },
];

export const transactions = [
  { id: "#KV-8921", customer: "James Chen", product: "Neural Core v2", status: "Đang xử lý", amount: "$1,299.00" },
  { id: "#KV-8920", customer: "Sarah Miller", product: "Titan Frame XL", status: "Đã giao", amount: "$4,500.00" },
  { id: "#KV-8919", customer: "Robert Frost", product: "Liquid Cooling Kit", status: "Đã giao", amount: "$249.50" },
];

export function getProductById(id: string) {
  return products.find((product) => product.id === id) ?? products[0];
}
