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

const hoverSpring = { type: 'spring', stiffness: 300, damping: 25 };
const inViewSpring = { type: 'spring', stiffness: 100, damping: 20 };

const Card = ({ title, description, image, span = 'standard', path }) => {
  const spanClass = spanClassMap[span] || spanClassMap.standard;
  const navigate = useNavigate();
  const width = spanWidthMap[span] || 800;
  const height =
    span === 'featured' ? 650 :
    span === 'wide' ? 500 :
    span === 'tall' ? 900 :
    450;

  return (
    <Motion.div
      className={`bento-card ${spanClass}`}
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, margin: '0px 0px -50px 0px' }}
      whileHover={{ scale: 1.02, boxShadow: '0 8px 40px rgba(0,0,0,0.12)' }}
      transition={{ hover: hoverSpring, default: inViewSpring }}
      onClick={() => navigate(path)}
      style={{ willChange: 'transform, opacity' }}
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
      />
      <div className="bento-card__overlay" />
      <div className="bento-card__content">
        <h3 className="bento-card__title">{title}</h3>
        {description && (
          <p className="bento-card__description">{description}</p>
        )}
      </div>
    </Motion.div>
  );
};

export default Card;
