import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Loader3D from '../components/Loader3D';
import ScaledImage from '../components/ScaledImage';
import { getCityById } from '../api/cities';

const isVideoUrl = (url) => Boolean(url && /\.(mp4|webm|ogg)(\?.*)?$/i.test(url));

const CityMapper = () => {
  const { cityId } = useParams();

  const [city, setCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchCity = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data } = await getCityById(cityId);

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
  }, [cityId]);

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

  const { thumbnail, name } = city;

  const handleSaveClick = () => {
    if (window.triggerNavbarSave) {
      window.triggerNavbarSave();
    }
  };

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
      
      {/* Save Button - Bottom Right */}
      <button
        onClick={handleSaveClick}
        disabled={window.navbarSaving}
        style={{
          position: 'absolute',
          bottom: '24px',
          right: '24px',
          padding: '12px 28px',
          borderRadius: '999px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          background: 'rgba(59, 130, 246, 0.9)',
          color: '#fff',
          fontSize: '0.9rem',
          fontWeight: 600,
          cursor: window.navbarSaving ? 'not-allowed' : 'pointer',
          opacity: window.navbarSaving ? 0.7 : 1,
          zIndex: 100,
          transition: 'all 0.2s ease',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
        onMouseOver={(e) => {
          if (!window.navbarSaving) {
            e.target.style.background = 'rgba(59, 130, 246, 1)';
            e.target.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseOut={(e) => {
          e.target.style.background = 'rgba(59, 130, 246, 0.9)';
          e.target.style.transform = 'translateY(0)';
        }}
      >
        {window.navbarSaving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default CityMapper;
