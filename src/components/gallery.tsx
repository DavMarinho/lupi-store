/**
 * Galeria da página do produto: foto grande e miniaturas (frente/costas).
 */
"use client";

import { useState } from "react";

/** Mostra a foto selecionada e, se houver mais de uma, as miniaturas para alternar. */
export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [i, setI] = useState(0);
  return (
    <div>
      <div className="bg-[#f1efea] aspect-square md:aspect-[4/5]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i]} alt={`${alt} — foto ${i + 1}`} className="w-full h-full object-contain p-6 md:p-10 mix-blend-multiply" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 px-5 md:px-0 mt-2">
          {images.map((src, k) => (
            <button key={src} onClick={() => setI(k)} aria-label={`Ver foto ${k + 1}`}
              className={`w-20 h-20 bg-[#f1efea] border transition ${k === i ? "border-ink" : "border-transparent opacity-70 hover:opacity-100"}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-contain p-1.5 mix-blend-multiply" />
            </button>
          ))}
          <span className="self-center font-sans text-xs text-muted ml-2">{i === 0 ? "Frente" : "Costas"}</span>
        </div>
      )}
    </div>
  );
}
