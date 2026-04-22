/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { getEvents, getMyEvents, getUserEvents } from "../api/events";
import { useAuth } from "./AuthContext";

const EventsContext = createContext();

export const EventsProvider = ({ children }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { isContentCreator, isUser, isAuthenticated } = useAuth();

    const fetchEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = isContentCreator ? await getMyEvents() : isUser ? await getUserEvents() : await getEvents();
            setEvents(response.data);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const updateEventState = (eventId, newState) => {
        setEvents(prevEvents =>
            prevEvents.map(event =>
                event.id === eventId ? { ...event, event_state: newState } : event
            )
        );
    };

    const addEvent = (newEvent) => {
        setEvents(prevEvents => [newEvent, ...prevEvents]);
    };

    const updateEvent = (eventId, updatedEvent) => {
        setEvents(prevEvents =>
            prevEvents.map(event =>
                event.id === eventId ? updatedEvent : event
            )
        );
    };

    const removeEvent = (eventId) => {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId));
    };

    useEffect(() => {
        // Only fetch events if user is authenticated
        if (isAuthenticated) {
            fetchEvents();
        }
    }, [isAuthenticated, isContentCreator, isUser]);

    return (
        <EventsContext.Provider value={{
            events,
            loading,
            error,
            fetchEvents,
            updateEventState,
            addEvent,
            updateEvent,
            removeEvent
        }}>
            {children}
        </EventsContext.Provider>
    );
};

export const useEvents = () => {
    const context = useContext(EventsContext);
    if (!context) {
        throw new Error('useEvents must be used within an EventsProvider');
    }
    return context;
};