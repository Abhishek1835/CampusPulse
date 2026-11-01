import React from 'react';

export const OrbBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10 select-none">
      {/* Organic Blob 1: Sage / Moss Green (Top Left) */}
      <div
        className="absolute -top-[12%] -left-[10%] w-[58vw] h-[58vw] max-w-[700px] max-h-[700px] rounded-full bg-[#5F7F5B]/25 dark:bg-[#9DBB8F]/18 blur-[130px] motion-safe:animate-organic-drift-1"
      />

      {/* Organic Blob 2: Warm Peach-Clay / Terracotta (Bottom Right) */}
      <div
        className="absolute -bottom-[15%] -right-[8%] w-[60vw] h-[60vw] max-w-[750px] max-h-[750px] rounded-full bg-[#C9895A]/22 dark:bg-[#D9A074]/15 blur-[140px] motion-safe:animate-organic-drift-2"
        style={{ animationDelay: '4s' }}
      />

      {/* Organic Blob 3: Warm Honey Gold (Center Right) */}
      <div
        className="absolute top-[28%] right-[8%] w-[45vw] h-[45vw] max-w-[550px] max-h-[550px] rounded-full bg-[#D8B168]/20 dark:bg-[#E5C27E]/12 blur-[130px] motion-safe:animate-organic-drift-3"
        style={{ animationDelay: '8s' }}
      />

      {/* Organic Blob 4: Soft Sage / Sand (Center Left) */}
      <div
        className="absolute bottom-[22%] left-[4%] w-[42vw] h-[42vw] max-w-[500px] max-h-[500px] rounded-full bg-[#DCE6D2]/60 dark:bg-[#2F3D2C]/40 blur-[120px] motion-safe:animate-organic-drift-1"
        style={{ animationDelay: '12s' }}
      />

      {/* Paper-grain noise texture overlay (3.5% opacity for tactile paper warmth) */}
      <div
        className="absolute inset-0 opacity-[0.035] dark:opacity-[0.045] pointer-events-none mix-blend-multiply dark:mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />

      {/* Faint botanical line contour aesthetics */}
      <div className="absolute inset-0 opacity-[0.04] dark:opacity-[0.03] bg-[radial-gradient(#2F3A2C_1px,transparent_1px)] dark:bg-[radial-gradient(#EFE9DA_1px,transparent_1px)] [background-size:28px_28px]" />
    </div>
  );
};
