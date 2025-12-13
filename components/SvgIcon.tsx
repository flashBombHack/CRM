"use client";

import { useEffect, useState, useMemo } from "react";

interface SvgIconProps {
  src: string;
  className?: string;
  color?: string;
  width?: number;
  height?: number;
}

const svgCache = new Map<string, string>();

export default function SvgIcon({ 
  src, 
  className = "", 
  color = "currentColor",
  width = 18,
  height = 18 
}: SvgIconProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const cacheKey = `${src}:${color}`;
  const coloredSvg = useMemo(() => {
    if (!svgContent) return "";
    // Replace any stroke color with the desired color
    // Handles stroke="white", stroke='white', stroke="#15171A", stroke='#15171A', etc.
    return svgContent.replace(/stroke=["'][^"']*["']/gi, `stroke="${color}"`);
  }, [svgContent, color]);

  useEffect(() => {
    // Check cache first
    if (svgCache.has(src)) {
      setSvgContent(svgCache.get(src)!);
      setIsLoading(false);
      return;
    }

    // Fetch SVG
    fetch(src)
      .then((res) => res.text())
      .then((text) => {
        svgCache.set(src, text);
        setSvgContent(text);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading SVG:", err);
        setIsLoading(false);
      });
  }, [src]);

  if (isLoading || !coloredSvg) {
    return <div className={className} style={{ width, height }} />;
  }

  return (
    <div
      className={className}
      style={{ width, height }}
      dangerouslySetInnerHTML={{ __html: coloredSvg }}
    />
  );
}

