"use client";

import { useState, useRef, useCallback, useEffect } from "react";
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

type DailyTargets = {
  kalori: number;
  protein_g: number;
  karbohidrat_g: number;
  lemak_g: number;
};

const DEFAULT_TARGETS: DailyTargets = {
  kalori: 2000,
  protein_g: 50,
  karbohidrat_g: 300,
  lemak_g: 65,
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

function compressImage(file: File, maxDim: number): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      let w = img.width;
      let h = img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h / w) * maxDim);
          w = maxDim;
        } else {
          w = Math.round((w / h) * maxDim);
          h = maxDim;
        }
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve(new File([blob!], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.7
      );
    };
    img.src = url;
  });
}

export default function Home() {
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<NutritionResult | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [history, setHistory] = useState<ScanHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [todayScans, setTodayScans] = useState<ScanHistory[]>([]);
  const [targets, setTargets] = useState<DailyTargets>(DEFAULT_TARGETS);
  const [showTargetEditor, setShowTargetEditor] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetchedRef = useRef(false);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith("image/")) return;
    const url = URL.createObjectURL(f);
    setPreview(url);
    setFile(f);
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

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch("/api/scans?limit=10");
      const data = await res.json();
      if (res.ok) {
        setHistory(data.scans || []);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const fetchTodayScans = useCallback(async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/scans?date=${today}&limit=100`);
      const data = await res.json();
      if (res.ok) {
        setTodayScans(data.scans || []);
      }
    } catch (err) {
      console.error("Fetch today scans error:", err);
    }
  }, []);

  const loadTargets = useCallback(() => {
    try {
      const saved = localStorage.getItem("daily_targets");
      if (saved) {
        setTargets(JSON.parse(saved));
      }
    } catch {}
  }, []);

  const saveTargets = useCallback((newTargets: DailyTargets) => {
    setTargets(newTargets);
    localStorage.setItem("daily_targets", JSON.stringify(newTargets));
  }, []);

  const analyze = useCallback(async () => {
    if (!preview || !file) return;
    setLoading(true);
    setResult(null);

    try {
      const compressed = await compressImage(file, 800);

      const formData = new FormData();
      formData.append("file", compressed);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal menganalisa foto");
      }

      setResult(data.result);
      fetchHistory();
      fetchTodayScans();
    } catch (err) {
      console.error("Analyze error:", err);
      alert("Gagal menganalisa foto. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }, [preview, file, fetchHistory]);

  const reset = useCallback(() => {
    setPreview(null);
    setFile(null);
    setResult(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchHistory();
      fetchTodayScans();
      loadTargets();
    }
  }, [fetchHistory, fetchTodayScans, loadTargets]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-primary px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Logo" className="w-8 h-8" />
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

      {/* Daily Tracker */}
      <section className="py-14 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-dark">
              Tracking Hari Ini
            </h3>
            <button
              onClick={() => setShowTargetEditor(!showTargetEditor)}
              className="text-xs text-primary hover:underline"
            >
              {showTargetEditor ? "Tutup" : "Atur Target"}
            </button>
          </div>

          {showTargetEditor && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-neutral-light border border-neutral-mid p-4 mb-4"
            >
              <p className="text-sm text-neutral-dark/70 mb-3">
                Atur target harian Anda:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { key: "kalori", label: "Kalori", unit: "kkal" },
                  { key: "protein_g", label: "Protein", unit: "g" },
                  { key: "karbohidrat_g", label: "Karbohidrat", unit: "g" },
                  { key: "lemak_g", label: "Lemak", unit: "g" },
                ].map((item) => (
                  <div key={item.key}>
                    <label className="text-xs text-neutral-dark/60 block mb-1">
                      {item.label} ({item.unit})
                    </label>
                    <input
                      type="number"
                      value={targets[item.key as keyof DailyTargets]}
                      onChange={(e) =>
                        saveTargets({
                          ...targets,
                          [item.key]: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full border border-neutral-mid bg-neutral-light px-2 py-1.5 text-sm text-neutral-dark focus:outline-none focus:border-primary"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {todayScans.length === 0 ? (
            <div className="border border-neutral-mid bg-neutral-light p-10 text-center">
              <p className="text-neutral-dark/50 text-sm">
                Belum ada scan hari ini. Upload foto makanan untuk mulai
                tracking.
              </p>
            </div>
          ) : (
            <div className="border border-neutral-mid bg-neutral-light p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  {
                    label: "Kalori",
                    key: "kalori",
                    unit: "kkal",
                    sum: todayScans.reduce((s, x) => s + x.kalori, 0),
                  },
                  {
                    label: "Protein",
                    key: "protein_g",
                    unit: "g",
                    sum: todayScans.reduce((s, x) => s + x.protein_g, 0),
                  },
                  {
                    label: "Karbohidrat",
                    key: "karbohidrat_g",
                    unit: "g",
                    sum: todayScans.reduce((s, x) => s + x.karbohidrat_g, 0),
                  },
                  {
                    label: "Lemak",
                    key: "lemak_g",
                    unit: "g",
                    sum: todayScans.reduce((s, x) => s + x.lemak_g, 0),
                  },
                ].map((item) => {
                  const target = targets[item.key as keyof DailyTargets];
                  const pct = target > 0 ? Math.min((item.sum / target) * 100, 100) : 0;
                  return (
                    <div
                      key={item.key}
                      className="bg-neutral-mid/50 border border-neutral-mid p-4 text-center"
                    >
                      <p className="text-xs text-neutral-dark/60 mb-1">
                        {item.label}
                      </p>
                      <p className="text-xl font-bold text-primary">
                        {Math.round(item.sum)}
                        <span className="text-sm font-normal text-neutral-dark/60 ml-0.5">
                          {item.unit}
                        </span>
                      </p>
                      <p className="text-xs text-neutral-dark/50 mt-1">
                        / {target} {item.unit}
                      </p>
                      <div className="h-1.5 w-full bg-neutral-mid mt-2">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-xs text-neutral-dark/50 text-center">
                {todayScans.length} makanan tercatat hari ini
              </p>
            </div>
          )}
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
          {historyLoading ? (
            <div className="border border-neutral-mid bg-neutral-light p-10 text-center">
              <div className="w-6 h-6 border-2 border-neutral-mid border-t-primary animate-spin mx-auto mb-3" />
              <p className="text-neutral-dark/50 text-sm">Memuat riwayat...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="border border-neutral-mid bg-neutral-light p-10 text-center">
              <p className="text-neutral-dark/50 text-sm">
                Belum ada riwayat scan. Hasil analisa akan muncul di sini setelah
                Anda mengupload foto makanan.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {history.map((scan) => (
                <motion.div
                  key={scan.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border border-neutral-mid bg-neutral-light overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={scan.foto_url}
                    alt={scan.nama_makanan}
                    className="w-full h-40 object-cover bg-neutral-dark/5"
                  />
                  <div className="p-4">
                    <h4 className="font-semibold text-neutral-dark text-sm">
                      {scan.nama_makanan}
                    </h4>
                    <p className="text-neutral-dark/60 text-xs mb-3">
                      {scan.estimasi_porsi}
                    </p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-xs text-neutral-dark/50">Kal</p>
                        <p className="text-sm font-bold text-primary">
                          {scan.kalori}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-dark/50">Pro</p>
                        <p className="text-sm font-bold text-primary">
                          {scan.protein_g}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-dark/50">Karb</p>
                        <p className="text-sm font-bold text-primary">
                          {scan.karbohidrat_g}g
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-dark/50">Lem</p>
                        <p className="text-sm font-bold text-primary">
                          {scan.lemak_g}g
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-mid bg-neutral-light mt-auto">
        <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Logo" className="w-6 h-6" />
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
