import { useState, useEffect } from "react";

export function VariantPickerModal({
  isOpen,
  onClose,
  onSelect,
  variants,
  currentValue
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (variantId: number | undefined) => void;
  variants: any[];
  currentValue?: number;
}) {
  const [query, setQuery] = useState("");

  // Block body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = variants.filter(v => 
    (v.color && v.color.toLowerCase().includes(query.toLowerCase())) || 
    (v.size && v.size.toLowerCase().includes(query.toLowerCase())) ||
    String(v.id).includes(query)
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm animate-in fade-in">
      <div 
        className="absolute inset-0" 
        onClick={onClose}
      />
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="font-headline text-lg font-bold text-slate-800">Chọn Biến Thể</h3>
          <button 
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="bg-slate-50 p-4">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              autoFocus
              type="text"
              placeholder="Nhập màu sắc, kích thước để tìm kiếm..."
              className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-4 text-sm font-semibold text-slate-700 shadow-sm outline-none ring-2 ring-transparent transition-all focus:ring-blue-500"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          <div className="grid gap-2">
            {/* The "Apply to all" option */}
            <button
              type="button"
              onClick={() => {
                onSelect(undefined);
                onClose();
              }}
              className={`flex items-center gap-4 rounded-2xl p-4 text-left transition-all ${!currentValue ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-slate-50'}`}
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${!currentValue ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-400'}`}>
                <span className="material-symbols-outlined">done_all</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className={`truncate text-sm font-bold ${!currentValue ? 'text-blue-900' : 'text-slate-800'}`}>Áp dụng toàn bộ</h4>
                <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                  Không áp dụng mức giới hạn cho biến thể cụ thể
                </p>
              </div>
              {!currentValue && (
                <span className="material-symbols-outlined text-blue-600 animate-in zoom-in">check_circle</span>
              )}
            </button>

            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <span className="material-symbols-outlined mb-2 text-4xl opacity-50">search_off</span>
                <p className="text-sm font-medium">Không tìm thấy biến thể phù hợp.</p>
              </div>
            ) : (
              <>
                {filtered.map(v => {
                  const isSelected = currentValue === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => {
                        onSelect(v.id);
                        onClose();
                      }}
                      className={`flex items-center gap-4 rounded-2xl p-4 text-left transition-all ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${isSelected ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 text-slate-400'}`}>
                        <span className="material-symbols-outlined">category</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`truncate text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                          Màu: {v.color || "N/A"} - Size: {v.size || "N/A"}
                        </h4>
                        <p className="mt-1 flex items-center gap-3 truncate text-xs font-semibold text-slate-500">
                          <span>ID: #{v.id}</span>
                          <span className="flex items-center gap-1 text-emerald-600">
                            <span className="material-symbols-outlined text-[14px]">inventory_2</span>
                            Tồn kho: {v.availability || 0}
                          </span>
                        </p>
                      </div>
                      {isSelected && (
                        <span className="material-symbols-outlined text-blue-600 animate-in zoom-in">check_circle</span>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
