"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

type NutritionResult = {
  nama_makanan: string;
  estimasi_porsi: string;
  kalori: number;
  protein_g: number;
  karbohidrat_g: number;
  lemak_g: number;
};

type ScanHistory = NutritionResult & {
  id: string;
  foto_url: string;
  created_at: string;
};

const MOCK_RESULT: NutritionResult = {
  nama_makanan: "Nasi Goreng Spesial",
  estimasi_porsi: "1 porsi (350g)",
  kalori: 520,
  protein_g: 18,
  karbohidrat_g: 65,
  lemak_g: 22,
};

const MOCK_HISTORY: ScanHistory[] = [
  {
    id: "1",
    foto_url: "",
    nama_makanan: "Ayam Bakar",
    estimasi_porsi: "1 porsi (250g)",
    kalori: 380,
    protein_g: 32,
    karbohidrat_g: 12,
    lemak_g: 24,
    created_at: "2026-08-18T10:30:00Z",
  },
  {
    id: "2",
    foto_url: "",
    nama_makanan: "Gado-Gado",
    estimasi_porsi: "1 porsi (300g)",
    kalori: 310,
    protein_g: 14,
    karbohidrat_g: 28,
    lemak_g: 18,
    created_at: "2026-08-17T14:15:00Z",
  },
  {
    id: "3",
    foto_url: "",
    nama_makanan: "Soto Ayam",
    estimasi_porsi: "1 mangkuk (400ml)",
    kalori: 220,
    protein_g: 20,
    karbohidrat_g: 18,
    lemak_g: 10,
    created_at: "2026-08-16T08:45:00Z",
  },
];

function NutritionBar({
  label,
  value,
  unit,
  max,
}: {
  label: string;
  value: number;
  unit: string;
  max: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-neutral-dark">{label}</span>
        <span className="text-neutral-dark/70">
          {value}
          {unit}
        </span>
      </div>
      <div className="h-2 w-full bg-neutral-mid">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setResult(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragActive(false);
  }, []);

  const analyze = useCallback(() => {
    if (!preview) return;
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(MOCK_RESULT);
      setLoading(false);
    }, 2000);
  }, [preview]);

  const reset = useCallback(() => {
    setPreview(null);
    setResult(null);
    setLoading(false);
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-light flex items-center justify-center">
            <span className="text-primary font-bold text-sm">F</span>
          </div>
          <h1 className="text-neutral-light text-lg font-semibold tracking-tight">
            Food Tracker AI
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8 flex flex-col gap-8">
        {/* Upload Section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-neutral-light border border-neutral-mid p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-dark mb-4">
            Upload Foto Makanan
          </h2>

          {!preview ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed cursor-pointer p-12 text-center transition-colors ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-neutral-mid hover:border-primary/50"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="w-10 h-10 text-primary/60"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                  />
                </svg>
                <p className="text-neutral-dark/70 text-sm">
                  Seret foto ke sini atau{" "}
                  <span className="text-primary font-medium">klik untuk memilih</span>
                </p>
                <p className="text-neutral-dark/50 text-xs">
                  JPG, PNG, WEBP (maks 10MB)
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="relative border border-neutral-mid overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt="Preview makanan"
                  className="w-full max-h-80 object-contain bg-neutral-dark/5"
                />
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={analyze}
                  disabled={loading}
                  className="flex-1 bg-primary text-neutral-light py-3 px-6 font-medium text-sm hover:bg-primary-hover transition-colors disabled:opacity-50"
                >
                  {loading ? "Menganalisa..." : "Analisa"}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={reset}
                  disabled={loading}
                  className="border border-neutral-mid bg-neutral-light text-neutral-dark py-3 px-6 font-medium text-sm hover:bg-neutral-mid transition-colors disabled:opacity-50"
                >
                  Reset
                </motion.button>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </motion.section>

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-neutral-light border border-neutral-mid p-8 flex flex-col items-center gap-4"
            >
              <div className="w-10 h-10 border-2 border-neutral-mid border-t-primary animate-spin" />
              <p className="text-neutral-dark/70 text-sm">
                AI sedang menganalisa makanan Anda...
              </p>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Result */}
        <AnimatePresence>
          {result && !loading && (
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="bg-neutral-light border border-neutral-mid p-6"
            >
              <h2 className="text-lg font-semibold text-neutral-dark mb-1">
                Hasil Analisa
              </h2>
              <p className="text-neutral-dark/60 text-sm mb-6">
                {result.nama_makanan} — {result.estimasi_porsi}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Kalori", val: result.kalori, unit: "kkal" },
                  { label: "Protein", val: result.protein_g, unit: "g" },
                  { label: "Karbohidrat", val: result.karbohidrat_g, unit: "g" },
                  { label: "Lemak", val: result.lemak_g, unit: "g" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="bg-neutral-mid/50 border border-neutral-mid p-4 text-center"
                  >
                    <p className="text-xs text-neutral-dark/60 mb-1">
                      {item.label}
                    </p>
                    <p className="text-xl font-bold text-primary">
                      {item.val}
                      <span className="text-sm font-normal text-neutral-dark/60 ml-0.5">
                        {item.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <NutritionBar
                  label="Kalori"
                  value={result.kalori}
                  unit=" kkal"
                  max={800}
                />
                <NutritionBar
                  label="Protein"
                  value={result.protein_g}
                  unit=" g"
                  max={50}
                />
                <NutritionBar
                  label="Karbohidrat"
                  value={result.karbohidrat_g}
                  unit=" g"
                  max={100}
                />
                <NutritionBar
                  label="Lemak"
                  value={result.lemak_g}
                  unit=" g"
                  max={65}
                />
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* History */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-neutral-light border border-neutral-mid p-6"
        >
          <h2 className="text-lg font-semibold text-neutral-dark mb-4">
            Riwayat Scan
          </h2>
          <div className="flex flex-col gap-3">
            {MOCK_HISTORY.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border border-neutral-mid p-4 hover:bg-neutral-mid/30 transition-colors"
              >
                <div>
                  <p className="font-medium text-neutral-dark text-sm">
                    {item.nama_makanan}
                  </p>
                  <p className="text-neutral-dark/60 text-xs">
                    {item.estimasi_porsi} —{" "}
                    {new Date(item.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary text-sm">{item.kalori} kkal</p>
                  <p className="text-neutral-dark/60 text-xs">
                    P{item.protein_g}g / K{item.karbohidrat_g}g / L{item.lemak_g}g
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-mid py-4 px-6">
        <p className="text-center text-neutral-dark/50 text-xs">
          Food Tracker AI — Tugas Sekolah
        </p>
      </footer>
    </div>
  );
}
