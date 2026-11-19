import React, { useId, useMemo } from "react";
import type { LensProfile } from "./presets";
import { supportsBackdropRefraction } from "./backdrop";
import "./glass.css";

export interface LiquidGlassSurfaceProps {
  width: number;
  height: number;
  borderRadius?: number;
  displacement?: number;
  lens?: LensProfile;
  pointerX?: number;
  pointerY?: number;
  isHovered?: boolean;
  tintColor?: string;
  tintOpacity?: number;
  blur?: number;
  saturate?: number;
}

export const LiquidGlassSurface: React.FC<LiquidGlassSurfaceProps> = ({
  displacement = 30,
  pointerX = 0,
  pointerY = 0,
  isHovered = false,
  tintColor = "rgba(15, 23, 42, 0.28)",
  tintOpacity = 1,
  blur = 6,
  saturate = 1.8,
}) => {
  const rawId = useId();
  const filterId = useMemo(() => "glass-" + rawId.replace(/[^a-zA-Z0-9_-]/g, ""), [rawId]);
  const hasBackdropSupport = typeof window !== "undefined" ? supportsBackdropRefraction() : false;

  // compute dynamic caustic sweep
  const causticGradient = useMemo(() => {
    const posX = 50 + pointerX * 35;
    const posY = 50 + pointerY * 35;
    const alphaCore = isHovered ? 0.18 : 0.09;
    const alphaHalo = isHovered ? 0.05 : 0.02;
    return `radial-gradient(450px circle at ${posX}% ${posY}%, rgba(255, 255, 255, ${alphaCore}) 0%, rgba(255, 255, 255, ${alphaHalo}) 45%, transparent 75%)`;
  }, [pointerX, pointerY, isHovered]);

  const backdropStyle = useMemo(() => {
    const filterValue = hasBackdropSupport
      ? `url(#${filterId}) blur(${blur}px) saturate(${saturate})`
      : `blur(${blur + 6}px) saturate(${saturate})`;
    return {
      WebkitBackdropFilter: filterValue,
      backdropFilter: filterValue,
      backgroundColor: tintColor,
      opacity: tintOpacity,
    };
  }, [hasBackdropSupport, filterId, blur, saturate, tintColor, tintOpacity]);

  return (
    <div className="liquid-glass-surface">
      {/* optical fluid refraction filter */}
      <svg
        className="liquid-glass-defs"
        aria-hidden="true"
      >
        <defs>
          <filter
            id={filterId}
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.012"
              numOctaves="3"
              result="fluidNoise"
            />
            {/* chromatic dispersion red pass */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="fluidNoise"
              scale={displacement * 0.88}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacedR"
            />
            <feColorMatrix
              in="displacedR"
              type="matrix"
              values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="redOnly"
            />
            {/* chromatic dispersion green pass */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="fluidNoise"
              scale={displacement}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacedG"
            />
            <feColorMatrix
              in="displacedG"
              type="matrix"
              values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0"
              result="greenOnly"
            />
            {/* chromatic dispersion blue pass */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="fluidNoise"
              scale={displacement * 1.12}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displacedB"
            />
            <feColorMatrix
              in="displacedB"
              type="matrix"
              values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
              result="blueOnly"
            />
            {/* recombine chromatic channels */}
            <feComposite
              in="redOnly"
              in2="greenOnly"
              operator="arithmetic"
              k2="1"
              k3="1"
              result="rg"
            />
            <feComposite
              in="rg"
              in2="blueOnly"
              operator="arithmetic"
              k2="1"
              k3="1"
              result="bent"
            />
          </filter>
        </defs>
      </svg>

      {/* backdrop refraction substrate */}
      <div className="liquid-glass-backdrop" style={backdropStyle} />

      {/* interactive caustic sweep */}
      <div
        className="liquid-glass-caustic"
        style={{ backgroundImage: causticGradient }}
      />

      {/* specular rim hairlines and ambient glow */}
      <div
        className="liquid-glass-rim"
        style={{
          boxShadow: [
            "inset 0 1.5px 1.5px 0 rgba(255, 255, 255, 0.55)",
            "inset 0 0 18px 0 rgba(255, 255, 255, 0.08)",
            "0 18px 45px -12px rgba(0, 0, 0, 0.35)",
          ].join(", "),
        }}
      />
    </div>
  );
};
