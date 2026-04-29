import React, { useEffect, useRef, useState } from 'react';
import SmartImage from './SmartImage';

/*
  ScaledImage.jsx

  Auto stretches image horizontally only.
  Keeps full image visible.
  Removes side empty spaces dynamically.

  Usage:

  <ScaledImage
    avif={thumbnail?.avif}
    webp={thumbnail?.webp}
    fallback={thumbnail?.original}
    alt={name}
  />
*/

const ScaledImage = ({
  avif = null,
  webp = null,
  fallback = null,
  alt = 'Image',
  priority = true,
  loading = 'eager',
  className = '',
  style = {},
}) => {
  const wrapperRef = useRef(null);
  const [scaleX, setScaleX] = useState(1);

  const calculateScale = () => {
    const imageUrl = avif || webp || fallback;

    if (!imageUrl || !wrapperRef.current) return;

    const img = new Image();

    img.src = imageUrl;

    img.onload = () => {
      const container = wrapperRef.current;

      if (!container) return;

      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;

      const imageWidth = img.naturalWidth;
      const imageHeight = img.naturalHeight;

      if (!containerWidth || !containerHeight || !imageWidth || !imageHeight) {
        setScaleX(1);
        return;
      }

      const imageRatio = imageWidth / imageHeight;
      const containerRatio = containerWidth / containerHeight;

      let visibleWidth = containerWidth;

      if (imageRatio <= containerRatio) {
        visibleWidth = containerHeight * imageRatio;
      }

      const neededScale = containerWidth / visibleWidth;

      setScaleX(neededScale > 1 ? neededScale : 1);
    };
  };

  useEffect(() => {
    calculateScale();

    window.addEventListener('resize', calculateScale);

    return () => {
      window.removeEventListener('resize', calculateScale);
    };
  }, [avif, webp, fallback]);

  return (
    <div
      ref={wrapperRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        ...style,
      }}
    >
      <SmartImage
        avif={avif}
        webp={webp}
        fallback={fallback}
        alt={alt}
        priority={priority}
        loading={loading}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          objectPosition: 'center center',
          display: 'block',
          transform: `scaleX(${scaleX})`,
          transformOrigin: 'center center',
        }}
      />
    </div>
  );
};

export default ScaledImage;