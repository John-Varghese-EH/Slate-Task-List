import React, { useEffect, useRef, useState } from "react";

interface ValleyBackgroundProps {
  className?: string;
}

declare global {
  interface Window {
    webpackChunk_N_E?: any[];
    __req?: (id: number) => any;
    __GE?: {
      et: () => any;
      Y: () => any;
    };
    __GE_valley?: any;
  }
}

const CHUNKS = [
  "/valley/engine/webpack-a76c04a7ba9aa4ef.js",
  "/valley/engine/fd9d1056-76aadce26f555392.js",
  "/valley/engine/123-3b7f3df3cc5866d7.js",
  "/valley/engine/450-96e2a31dde902aa5.js",
  "/valley/engine/567-6466d5cc81546a43.js",
  "/valley/engine/340-4c85e05b44fc7370.js",
  "/valley/engine/15-91b52fecfdd8e21a.js",
  "/valley/engine/780-35f43a00462f78e8.js",
  "/valley/engine/419-c9aec889e32d9e7b.js",
  "/valley/engine/131-8efcfd03f067c029.js",
  "/valley/engine/app/layout-681f1a9fe4dd4628.js",
  "/valley/engine/4b5b508e-6dceef0b9f02cb18.js",
  "/valley/engine/8-5234b317a5794281.js",
  "/valley/engine/785-3ec288b614fa287f.js",
  "/valley/engine/b536a0f1-51636bd4ac051d8f.js",
  "/valley/engine/596-40a806be0d0d2bb3.js",
  "/valley/engine/app/page-4c279de0997d388f.js",
];

export const ValleyBackground: React.FC<ValleyBackgroundProps> = ({
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const valleyInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        const s = document.createElement("script");
        s.src = src;
        s.async = false;
        s.onload = () => resolve();
        s.onerror = (e) => reject(e);
        document.body.appendChild(s);
      });
    };

    const initValley = async () => {
      try {
        for (const src of CHUNKS) {
          if (isCancelled) return;
          await loadScript(src);
        }

        if (isCancelled || !containerRef.current) return;

        if (window.webpackChunk_N_E) {
          window.webpackChunk_N_E.push([
            [90001],
            {},
            function (r: any) {
              window.__req = r;
            },
          ]);

          if (window.__req) {
            window.__req(889);
            const ValleyClass = window.__GE?.et();
            if (ValleyClass && !valleyInstanceRef.current && containerRef.current) {
              const instance = new ValleyClass(
                containerRef.current,
                () => {
                  if (!isCancelled) setIsLoaded(true);
                },
                () => {}
              );
              valleyInstanceRef.current = instance;
              window.__GE_valley = instance;
            }
          }
        }
      } catch (err) {
        console.error("Failed to initialize valley canvas:", err);
      }
    };

    initValley();

    return () => {
      isCancelled = true;
      window.__GE_valley = null;
      if (valleyInstanceRef.current) {
        try {
          valleyInstanceRef.current.destroy();
        } catch {}
        valleyInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      id="valley"
      ref={containerRef}
      aria-hidden="true"
      className={`fixed inset-0 z-0 pointer-events-none select-none transition-opacity duration-1000 ${
        isLoaded ? "opacity-100" : "opacity-0"
      } ${className}`}
    >
      <div className="js-canvas-container absolute inset-0"></div>
    </div>
  );
};
