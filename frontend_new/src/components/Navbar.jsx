// Navbar.jsx
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Upload, ChevronDown } from 'lucide-react';

import {
  getCityById,
  getCityRooms,
  uploadCityLogo,
  deleteCityLogo,
  updateNavbarSlots,
} from '../api/cities';

const Navbar = () => {
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const isCityMapperRoute = location.pathname.startsWith('/city-mapper/');
  const isCityViewRoute = location.pathname.startsWith('/city/');
  const citySlug = isCityViewRoute ? location.pathname.split('/')[2] : null;
  const cityId = isCityMapperRoute ? location.pathname.split('/')[2] : null;

  /* ---------------- MAPPER STATES ---------------- */
  const [city, setCity] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [navbarSlots, setNavbarSlots] = useState({});
  const [localLogo, setLocalLogo] = useState(null);
  const dropdownRef = useRef(null);

  /* ---------------- FETCH CITY DATA FOR MAPPER & VIEW ---------------- */
  useEffect(() => {
    // Only fetch for mapper or view routes
    if (!isCityMapperRoute && !isCityViewRoute) return;
    if (isCityMapperRoute && !cityId) return;
    if (isCityViewRoute && !citySlug) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        let cityRes;
        
        if (isCityMapperRoute) {
          cityRes = await getCityById(cityId);
        } else if (isCityViewRoute) {
          // For city view, we need to get city by slug - create a helper or use existing
          const { getCityBySlug } = await import('../api/cities');
          cityRes = await getCityBySlug(citySlug);
        }

        setCity(cityRes.data);

        // For mapper, also fetch rooms
        if (isCityMapperRoute) {
          const roomsRes = await getCityRooms(cityId);
          setRooms(roomsRes.data);

          const savedSlots = cityRes.data.navbar_slots || {};
          const formattedSlots = {};

          Object.entries(savedSlots).forEach(([slot, roomId]) => {
            const matchedRoom = roomsRes.data.find(
              (room) => room.id === roomId
            );

            if (matchedRoom) {
              formattedSlots[slot] = {
                id: matchedRoom.id,
                name: matchedRoom.room_name,
              };
            }
          });

          setNavbarSlots(formattedSlots);
        } else if (isCityViewRoute) {
          // For city view, format slots from city data
          const savedSlots = cityRes.data.navbar_slots || {};
          const formattedSlots = {};

          // We need room names - they should be included in the city response
          // or we need to fetch rooms separately
          if (cityRes.data.rooms && Array.isArray(cityRes.data.rooms)) {
            Object.entries(savedSlots).forEach(([slot, roomId]) => {
              const matchedRoom = cityRes.data.rooms.find(
                (room) => room.id === roomId
              );

              if (matchedRoom) {
                formattedSlots[slot] = {
                  id: matchedRoom.id,
                  name: matchedRoom.room_name,
                };
              }
            });
          }

          setNavbarSlots(formattedSlots);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load city data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isCityMapperRoute, isCityViewRoute, cityId, citySlug]);

  /* ---------------- MAPPER ACTIONS ---------------- */

  const handleLogoUpload = async (file) => {
    if (!file) return;

    try {
      const res = await uploadCityLogo(cityId, file);
      setCity(res.data);
      setLocalLogo(URL.createObjectURL(file));
    } catch (err) {
      console.error(err);
      setError('Failed to upload logo');
    }
  };

  const handleLogoDelete = async () => {
    try {
      const res = await deleteCityLogo(cityId);
      setCity(res.data);
      setLocalLogo(null);
    } catch (err) {
      console.error(err);
      setError('Failed to delete logo');
    }
  };

  const handleRoomSelect = (slot, roomId, roomName) => {
    setNavbarSlots((prev) => ({
      ...prev,
      [slot]: {
        id: roomId,
        name: roomName,
      },
    }));

    setOpenDropdown(null);
  };

  const handleRemoveRoom = (slot) => {
    const updated = { ...navbarSlots };
    delete updated[slot];
    setNavbarSlots(updated);
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const slotsToSave = {};

      Object.entries(navbarSlots).forEach(([slot, value]) => {
        if (value?.id) {
          slotsToSave[slot] = value.id;
        }
      });

      const res = await updateNavbarSlots(cityId, slotsToSave);
      setCity(res.data);
      setError(null);

      alert('City mapper saved successfully!');
    } catch (err) {
      console.error(err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const assignedRoomIds = new Set(
    Object.values(navbarSlots)
      .filter((v) => v?.id)
      .map((v) => v.id)
  );

  const logoUrl = localLogo || city?.logo?.original;

  /* ---------------- CLICK OUTSIDE HANDLER ---------------- */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ---------------- EXPORT SAVE FUNCTION ---------------- */
  // Expose handleSave to window for CityMapper to call
  useEffect(() => {
    if (isCityMapperRoute) {
      window.triggerNavbarSave = handleSave;
      window.navbarSaving = saving;
      return () => {
        delete window.triggerNavbarSave;
        delete window.navbarSaving;
      };
    }
  }, [isCityMapperRoute, handleSave, saving]);

  /* ===================================================== */
  /* ====================== RETURN ======================== */
  /* ===================================================== */

  return (
    <nav className={`glass-nav ${isCityMapperRoute || isCityViewRoute ? 'glass-nav--mapper' : ''}`}>
      <div className="glass-nav__inner">

        {/* ================= NORMAL NAV ================= */}
        {!isCityMapperRoute && !isCityViewRoute && (
          <>
                <Link className="glass-nav__brand" to="/">
                <img
                    src={import.meta.env.VITE_LOGO_URL}
                    alt="STEMCity USA"
                    loading="lazy"
                />
                </Link>

                <ul
                className={`glass-nav__links ${
                    menuOpen ? 'glass-nav__links--open' : ''
                }`}
                >
                <li>
                    <Link
                    className="glass-nav__link glass-nav__link--active"
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    >
                    Home
                    </Link>
                </li>

                <li>
                    <Link
                    className="glass-nav__link"
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    >
                    Cities
                    </Link>
                </li>

                <li>
                    <Link
                    className="glass-nav__link"
                    to="/"
                    onClick={() => setMenuOpen(false)}
                    >
                    About
                    </Link>
                </li>
                </ul>

                <button
                className="glass-nav__toggle"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="Toggle navigation"
                >
                <span />
                <span />
                <span />
                </button>
          </>
        )}

        {/* ================= MAPPER NAV ================= */}
        {isCityMapperRoute && (
          <div className="mapper-container">

            {loading && <div className="mapper-loading">Loading...</div>}

            {!loading && (
              <>
                {/* LOGO UPLOAD */}
                <div className="mapper-logo-section">
                  <div className="logo-frame">

                    {logoUrl ? (
                      <>
                        <img
                          src={logoUrl}
                          alt="City Logo"
                          className="logo-preview"
                        />

                        <button
                          className="logo-remove-btn"
                          onClick={handleLogoDelete}
                          title="Remove logo"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <label className="logo-upload-label">
                        <Upload size={24} />

                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) =>
                            handleLogoUpload(e.target.files[0])
                          }
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* SLOTS */}
                <div className="mapper-slots-section" ref={dropdownRef}>
                  {[1, 2, 3, 4, 5, 6, 7].map((slot) => {
                    const selectedRoom = navbarSlots[slot];
                    const isOpen = openDropdown === slot;

                    return (
                    <div
                        className="slot-wrapper"
                        key={slot}
                        onMouseEnter={() => setOpenDropdown(slot)}
                        onMouseLeave={() => setOpenDropdown(null)}
                    >
                        <button
                            className={`slot-button ${selectedRoom ? 'slot-button--has-room' : ''}`}
                        >
                          {selectedRoom && (
                            <span
                              className="slot-remove-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveRoom(slot);
                              }}
                              title="Remove room"
                            >
                              ×
                            </span>
                          )}
                          <span className="slot-label">
                            {selectedRoom?.name ||
                              `Placeholder ${slot}`}
                          </span>

                          <ChevronDown
                            size={14}
                            className={
                              isOpen ? 'dropdown-icon-open' : ''
                            }
                          />
                        </button>

                        <div className={`room-dropdown ${isOpen ? 'room-dropdown--open' : ''}`}>
                            {rooms.length === 0 ? (
                                <div className="dropdown-empty">
                                No rooms available
                                </div>
                            ) : (
                                rooms.map((room) => (
                                <button
                                    key={room.id}
                                    className="dropdown-item"
                                    onClick={() =>
                                    handleRoomSelect(
                                        slot,
                                        room.id,
                                        room.room_name
                                    )
                                    }
                                >
                                    {room.room_name}
                                </button>
                                ))
                            )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* SAVE BUTTON — moved to CityMapper bottom right */}
                {/* Kept here for reference - now in CityMapper.jsx */}
              </>
            )}

            {/* ERROR MESSAGE */}
            {error && <div className="mapper-error-msg">{error}</div>}
          </div>
        )}

        {/* ================= CITY VIEW NAV ================= */}
        {isCityViewRoute && (
          <div className="mapper-container">

            {loading && <div className="mapper-loading">Loading...</div>}

            {!loading && (
              <>
                {/* LOGO DISPLAY (READ-ONLY) */}
                {city?.logo?.original && (
                  <div className="mapper-logo-section">
                    <div className="logo-frame">
                      <img
                        src={city.logo.original}
                        alt="City Logo"
                        className="logo-preview"
                      />
                    </div>
                  </div>
                )}

                {/* ROOM SLOTS DISPLAY (READ-ONLY) - Only show selected rooms */}
                <div className="mapper-slots-section">
                    {Object.entries(navbarSlots)
                        .filter(([slot, room]) => room?.id)
                        .sort(([slotA], [slotB]) => parseInt(slotA) - parseInt(slotB))
                        .map(([slot, room]) => {
                        const isOpen = openDropdown === slot;

                        return (
                            <div
                            className="slot-wrapper"
                            key={slot}
                            onMouseEnter={() => setOpenDropdown(slot)}
                            onMouseLeave={() => setOpenDropdown(null)}
                            >
                            <button className="slot-button slot-button--has-room slot-button--readonly">
                                <span className="slot-label">
                                {room.name}
                                </span>
                            </button>

                            <div className={`room-dropdown ${isOpen ? 'room-dropdown--open' : ''}`}>
                                {rooms.length === 0 ? (
                                <div className="dropdown-empty">
                                    No rooms available
                                </div>
                                ) : (
                                rooms.map((cityRoom) => (
                                    <div
                                    key={cityRoom.id}
                                    className="dropdown-item"
                                    >
                                    {cityRoom.room_name}
                                    </div>
                                ))
                                )}
                            </div>
                            </div>
                        );
                        })}
                    </div>
              </>
            )}

            {/* ERROR MESSAGE */}
            {error && <div className="mapper-error-msg">{error}</div>}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;