import { motion as Motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SmartImage from '../components/SmartImage';

const spanClassMap = {
  featured: 'bento-card--featured',
  wide: 'bento-card--wide',
  tall: 'bento-card--tall',
  standard: 'bento-card--standard',
};

const spanWidthMap = {
  featured: 1000,
  wide: 850,
  tall: 700,
  standard: 650,
};

const hoverSpring = {
  type: 'spring',
  stiffness: 260,
  damping: 24,
};

const cardVariants = {
  rest: {
    scale: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
  },
  hover: {
    scale: 1.018,
    y: -6,
    rotateX: -1.2,
    rotateY: 1.2,
    transition: hoverSpring,
  },
};

const imageVariants = {
  rest: {
    scale: 1,
  },
  hover: {
    scale: 1.1,
    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const overlayVariants = {
  rest: {
    opacity: 0.35,
  },
  hover: {
    opacity: 0.18,
    transition: { duration: 0.45 },
  },
};

const contentVariants = {
  rest: {
    y: 0,
    opacity: 1,
  },
  hover: {
    y: -8,
    opacity: 1,
    transition: {
      duration: 0.45,
      ease: 'easeOut',
    },
  },
};

const Card = ({
  title,
  description,
  image,
  span = 'standard',
  path,
}) => {
  const navigate = useNavigate();

  const spanClass = spanClassMap[span] || spanClassMap.standard;

  const width = spanWidthMap[span] || 800;

  const height =
    span === 'featured'
      ? 650
      : span === 'wide'
      ? 500
      : span === 'tall'
      ? 900
      : 450;

  return (
    <Motion.div
      className={`bento-card ${spanClass}`}
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileTap={{ scale: 0.99 }}
      variants={cardVariants}
      onClick={() => navigate(path)}
      style={{
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        borderRadius: '24px',
        transformStyle: 'preserve-3d',
        perspective: '1200px',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Background Image */}
      <Motion.div
        variants={imageVariants}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          willChange: 'transform',
        }}
      >
        <SmartImage
          avif={image?.avif}
          webp={image?.webp}
          fallback={image?.original}
          alt={title}
          width={width}
          height={height}
          className="bento-card__image"
          loading="lazy"
          priority={false}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            filter: 'brightness(0.94) saturate(1.05)',
            transform: 'translateZ(0)',
          }}
        />
      </Motion.div>

      {/* Gradient Overlay */}
      <Motion.div
        variants={overlayVariants}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          background:
            'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.25) 45%, rgba(0,0,0,0.05) 100%)',
        }}
      />

      {/* Glow Layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          background:
            'radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 35%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content */}
      <Motion.div
        variants={contentVariants}
        style={{
          position: 'relative',
          zIndex: 4,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '1.35rem',
        }}
      >
        <h3
          className="bento-card__title"
          style={{
            color: '#fff',
            fontSize: '1.35rem',
            fontWeight: 700,
            marginBottom: description ? '0.45rem' : 0,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
          }}
        >
          {title}
        </h3>

        {description && (
          <p
            className="bento-card__description"
            style={{
              color: 'rgba(255,255,255,0.82)',
              fontSize: '0.95rem',
              lineHeight: 1.45,
              margin: 0,
              maxWidth: '90%',
            }}
          >
            {description}
          </p>
        )}
      </Motion.div>
    </Motion.div>
  );
};

export default Card;