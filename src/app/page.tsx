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

type ScanHistory = {
  id: string;
  foto_url: string;
  nama_makanan: string;
  estimasi_porsi: string;
  kalori: number;
  protein_g: number;
  karbohidrat_g: number;
  lemak_g: number;
  created_at: string;
};

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

const STEPS = [
  {
    num: "01",
    title: "Upload Foto",
    desc: "Ambil atau pilih foto makanan yang ingin Anda analisa.",
  },
  {
    num: "02",
    title: "Analisa AI",
    desc: "Sistem kami memproses foto dan mengidentifikasi kandungan gizi.",
  },
  {
    num: "03",
    title: "Lihat Hasil",
    desc: "Dapatkan estimasi kalori, protein, karbohidrat, dan lemak secara instan.",
  },
];

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

      {/* Hero */}
      <section className="bg-primary text-neutral-light py-16 px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Kenali Gizi Makanan Anda
          </h2>
          <p className="text-neutral-light/80 text-base max-w-xl mx-auto mb-8">
            Upload foto makanan, dapatkan estimasi kandungan gizi secara instan
            berbasis kecerdasan buatan.
          </p>
          <a
            href="#upload"
            className="inline-block bg-neutral-light text-primary font-semibold py-3 px-8 text-sm hover:bg-neutral-mid transition-colors"
          >
            Mulai Analisa
          </a>
        </motion.div>
      </section>

      {/* How it works */}
      <section className="py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-xl font-semibold text-neutral-dark text-center mb-10">
            Cara Kerja
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="border border-neutral-mid bg-neutral-light p-6"
              >
                <span className="text-primary font-bold text-2xl">
                  {step.num}
                </span>
                <h4 className="font-semibold text-neutral-dark mt-3 mb-2">
                  {step.title}
                </h4>
                <p className="text-neutral-dark/60 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Upload */}
      <section id="upload" className="py-14 px-6 bg-neutral-mid/30">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-neutral-light border border-neutral-mid p-6"
          >
            <h3 className="text-lg font-semibold text-neutral-dark mb-4">
              Upload Foto Makanan
            </h3>

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
                    <span className="text-primary font-medium">
                      klik untuk memilih
                    </span>
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
          </motion.div>
        </div>
      </section>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="py-14 px-6"
          >
            <div className="max-w-3xl mx-auto bg-neutral-light border border-neutral-mid p-8 flex flex-col items-center gap-4">
              <div className="w-10 h-10 border-2 border-neutral-mid border-t-primary animate-spin" />
              <p className="text-neutral-dark/70 text-sm">
                AI sedang menganalisa makanan Anda...
              </p>
            </div>
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
            className="py-14 px-6"
          >
            <div className="max-w-3xl mx-auto bg-neutral-light border border-neutral-mid p-6">
              <h3 className="text-lg font-semibold text-neutral-dark mb-1">
                Hasil Analisa
              </h3>
              <p className="text-neutral-dark/60 text-sm mb-6">
                {result.nama_makanan} — {result.estimasi_porsi}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Kalori", val: result.kalori, unit: "kkal" },
                  { label: "Protein", val: result.protein_g, unit: "g" },
                  {
                    label: "Karbohidrat",
                    val: result.karbohidrat_g,
                    unit: "g",
                  },
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
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* History */}
      <section className="py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-neutral-dark mb-4">
            Riwayat Scan
          </h3>
          <div className="border border-neutral-mid bg-neutral-light p-10 text-center">
            <p className="text-neutral-dark/50 text-sm">
              Belum ada riwayat scan. Hasil analisa akan muncul di sini setelah
              Anda mengupload foto makanan.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-mid bg-neutral-light mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary flex items-center justify-center">
              <span className="text-neutral-light font-bold text-[10px]">
                F
              </span>
            </div>
            <span className="text-neutral-dark text-sm font-medium">
              Food Tracker AI
            </span>
          </div>
          <p className="text-neutral-dark/50 text-xs">
            &copy; {new Date().getFullYear()} Food Tracker AI. All rights
            reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
