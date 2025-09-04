// src/components/ImageWithFallback.jsx
import React, { useState, useEffect } from "react";
import placeholderImage from "../assets/default/image_placeholder.png";

const ImageWithFallback = ({ src, alt, className, style, fallbackSrc }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [isErrored, setIsErrored] = useState(false);

  // Update image source when `src` prop changes
  useEffect(() => {
    setImgSrc(src || fallbackSrc || placeholderImage);
    setIsErrored(false);
  }, [src, fallbackSrc]);

  return (
    <img  // ← Fixed: use <img>, not <ImageWithFallback>
      src={imgSrc}
      alt={alt}
      className={className}
      style={style}
      onError={(e) => {
        const fallback = fallbackSrc || placeholderImage;
        if (imgSrc !== fallback) {
          setImgSrc(fallback);
        } else {
          e.target.onerror = null; // Prevent infinite loop
        }
        setIsErrored(true);
      }}
    />
  );
};

export default ImageWithFallback;