import React, { useRef, useState, useEffect, useCallback } from "react";
import { LiquidGlassSurface } from "./LiquidGlassSurface";
import { LensProfile, appleCardLens } from "./presets";
import "./glass.css";

export interface LiquidGlassPaneProps extends React.HTMLAttributes<HTMLDivElement> {
  borderRadius?: number;
  displacement?: number;
  lens?: LensProfile;
  tintColor?: string;
  tintOpacity?: number;
  blur?: number;
  saturate?: number;
  className?: string;
  children?: React.ReactNode;
}

export const LiquidGlassPane: React.FC<LiquidGlassPaneProps> = ({
  borderRadius = 24,
  displacement = 30,
  lens = appleCardLens,
  tintColor = "rgba(15, 23, 42, 0.28)",
  tintOpacity = 1,
  blur = 6,
  saturate = 1.8,
  className = "",
  children,
  style,
  onPointerMove,
  onPointerEnter,
  onPointerLeave,
  ...rest
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const targetPointer = useRef({ x: 0, y: 0 });
  const animFrame = useRef<number | null>(null);

  // measure container bounds with resize observer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setSize({
        width: Math.round(rect.width),
        height: Math.round(rect.height),
      });
    };
    updateSize();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(updateSize);
      observer.observe(el);
      return () => observer.disconnect();
    }
  }, []);

  // animate pointer coordinates with spring lerp
  useEffect(() => {
    let active = true;
    const lerpSpeed = 0.12;

    const tick = () => {
      if (!active) return;
      setPointer((prev) => {
        const dx = targetPointer.current.x - prev.x;
        const dy = targetPointer.current.y - prev.y;
        if (Math.abs(dx) < 0.001 && Math.abs(dy) < 0.001) {
          return prev;
        }
        return {
          x: prev.x + dx * lerpSpeed,
          y: prev.y + dy * lerpSpeed,
        };
      });
      animFrame.current = requestAnimationFrame(tick);
    };

    animFrame.current = requestAnimationFrame(tick);
    return () => {
      active = false;
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, []);

  const handlePointerEnter = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsHovered(true);
      if (onPointerEnter) onPointerEnter(e);
    },
    [onPointerEnter],
  );

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      setIsHovered(false);
      targetPointer.current = { x: 0, y: 0 };
      if (onPointerLeave) onPointerLeave(e);
    },
    [onPointerLeave],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = containerRef.current;
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
          const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
          targetPointer.current = {
            x: Math.max(-1, Math.min(1, normX)),
            y: Math.max(-1, Math.min(1, normY)),
          };
        }
      }
      if (onPointerMove) onPointerMove(e);
    },
    [onPointerMove],
  );

  return (
    <div
      ref={containerRef}
      className={`liquid-glass-pane ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
        ...style,
      }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      {...rest}
    >
      {/* optical refraction and specular surface substrate */}
      {size.width > 0 && size.height > 0 && (
        <LiquidGlassSurface
          width={size.width}
          height={size.height}
          borderRadius={borderRadius}
          displacement={displacement}
          lens={lens}
          pointerX={pointer.x}
          pointerY={pointer.y}
          isHovered={isHovered}
          tintColor={tintColor}
          tintOpacity={tintOpacity}
          blur={blur}
          saturate={saturate}
        />
      )}

      {/* high contrast vibrant content layer */}
      <div className="liquid-glass-content">{children}</div>
    </div>
  );
};
