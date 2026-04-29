import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loader3D from '../components/Loader3D';
import SmartImage from '../components/SmartImage';
import { getCityBySlug } from '../api/cities';
import ScaledImage from '../components/ScaledImage';

const isVideoUrl = (url) => Boolean(url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url));

const CityView = () => {
  const { slug } = useParams();

  const [city, setCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCity = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data } = await getCityBySlug(slug);

        if (isMounted) {
          setCity(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('City not found');
          setCity(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchCity();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) return <Loader3D />;

  if (error || !city) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0b0c10',
          color: '#fff',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <h1>City not found</h1>
          <p>That city is not available at this time.</p>
        </div>
      </div>
    );
  }

  const {
    thumbnail,
    flyin_graphic,
    loop_graphic,
    support_audio_url,
    name,
  } = city;

  const loopOriginal = loop_graphic?.original;
  const loopIsVideo = isVideoUrl(loopOriginal);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        background: '#000',
        zIndex: 0,
      }}
    >
      {/* Background Image */}
      <ScaledImage
        avif={thumbnail?.avif}
        webp={thumbnail?.webp}
        fallback={thumbnail?.original}
        alt={name}
        style={{
          zIndex: 0,
        }}
      />

      {/* Flyin Graphic */}
      {flyin_graphic?.original && (
        <SmartImage
          avif={flyin_graphic?.avif}
          webp={flyin_graphic?.webp}
          fallback={flyin_graphic?.original}
          alt={`${name} flyin graphic`}
          loading="eager"
          priority={true}
          style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            maxWidth: '35%',
            maxHeight: '55%',
            objectFit: 'contain',
            zIndex: 2,
          }}
        />
      )}

      {/* Loop Graphic */}
      {loop_graphic?.original &&
        (loopIsVideo ? (
          <video
            src={loopOriginal}
            autoPlay
            loop
            muted
            playsInline
            style={{
              position: 'absolute',
              top: '2rem',
              left: '2rem',
              maxWidth: '45%',
              maxHeight: '55%',
              objectFit: 'cover',
              zIndex: 2,
            }}
          />
        ) : (
          <SmartImage
            avif={loop_graphic?.avif}
            webp={loop_graphic?.webp}
            fallback={loop_graphic?.original}
            alt={`${name} loop graphic`}
            loading="eager"
            priority={true}
            style={{
              position: 'absolute',
              top: '2rem',
              left: '2rem',
              maxWidth: '45%',
              maxHeight: '55%',
              objectFit: 'contain',
              zIndex: 2,
            }}
          />
        ))}

      {/* Audio */}
      {support_audio_url && (
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            right: '2rem',
            zIndex: 3,
            backdropFilter: 'blur(12px)',
            background: 'rgba(0,0,0,0.45)',
            padding: '1rem 1.25rem',
            borderRadius: '16px',
          }}
        >
          <audio
            src={support_audio_url}
            controls
            autoPlay
            muted
            loop
            style={{
              width: '260px',
            }}
          />
        </div>
      )}
    </div>
  );
};

export default CityView;