import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebaseconfig/firebase";

function Dashboard() {
  const user = useSelector((state) => state.auth.user);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);
  const [organizerName, setOrganizerName] = useState("");
  const [showValidate, setShowValidate] = useState(false);
  const [search, setSearch] = useState("");

  // Fetch Organizer Name
  useEffect(() => {
    if (!user?.uid) return;

    const fetchOrganizerName = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          setOrganizerName(snap.data().name || snap.data().displayName || user.displayName || "");
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrganizerName();
  }, [user]);

  const handleDeleteEvent = async (eventId, eventName) => {
    if (!window.confirm(`Are you sure you want to delete "${eventName}"?`)) return;
    try {
      await deleteDoc(doc(db, "events", eventId));
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      if (selectedEvent?.id === eventId) setSelectedEvent(null);
      alert("Event deleted successfully!");
    } catch (err) {
      console.error("Error deleting event:", err);
      alert("Failed to delete event: " + err.message);
    }
  };

  // Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const ref = collection(db, "events");
        const snapshot = await getDocs(ref);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEvents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Fetch Attendees
  const fetchAttendees = async (event, validate = false) => {
    setSelectedEvent(event);
    setShowValidate(validate);
    setAttendeeLoading(true);

    try {
      const q = query(
        collection(db, "tickets"),
        where("eventId", "==", event.id)
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setAttendees(data);
    } catch (err) {
      console.error("Error fetching attendees:", err);
    } finally {
      setAttendeeLoading(false);
    }
  };

  // Validate Ticket
  const handleValidate = async (ticket) => {
    try {
      const ticketRef = doc(db, "tickets", ticket.id);
      await updateDoc(ticketRef, { status: "Used" });

      setAttendees((prev) =>
        prev.map((t) =>
          t.id === ticket.id ? { ...t, status: "Used" } : t
        )
      );
    } catch (err) {
      console.error(err);
      alert("Validation failed");
    }
  };

  const filteredAttendees = attendees.filter(
    (att) =>
      att.name?.toLowerCase().includes(search.toLowerCase()) ||
      att.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading)
    return (
      <p className="p-6 text-gray-600 text-center text-lg">
        Loading dashboard...
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Organizer Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome,{" "}
            <span className="font-semibold text-emerald-600">
              {organizerName || user?.name || user?.displayName || user?.email}
            </span>
          </p>
        </div>
        <Link
          to="/create-event"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg transition active:scale-95 flex items-center gap-2"
        >
          <span>➕</span> Create New Event
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500 font-semibold">Total Events</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{events.length}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500 font-semibold">Tickets Sold</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {events.reduce((sum, e) => sum + (e.sold || 0), 0)}
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <p className="text-sm text-gray-500 font-semibold">Sold Out Events</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">
            {events.filter((e) => e.sold >= e.totalTickets).length}
          </p>
        </div>
      </div>

      {/* Events List */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800">Your Events</h2>
        <Link
          to="/create-event"
          className="text-emerald-600 font-semibold hover:text-emerald-700 text-sm md:text-base flex items-center gap-1"
        >
          + Add another event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center shadow-lg border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-4">🎪</div>
          <h3 className="text-xl font-bold text-gray-800">No events found</h3>
          <p className="text-gray-500 mt-2 mb-6">Start by creating your first event to sell tickets!</p>
          <Link
            to="/create-event"
            className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-xl transition shadow-lg active:scale-95"
          >
            ➕ Create First Event
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-2xl transition">
              <div>
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.name} className="h-52 w-full object-cover" />
                ) : (
                  <div className="h-52 w-full bg-gray-200 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                    <button
                      onClick={() => handleDeleteEvent(event.id, event.name)}
                      className="text-red-500 hover:text-red-700 p-1.5 rounded-lg hover:bg-red-50 transition"
                      title="Delete Event"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="mt-2 text-gray-600 text-sm space-y-1">
                    <p><strong>Location:</strong> {event.location || "N/A"}</p>
                    <p><strong>Price:</strong> PKR {event.price?.toLocaleString() || "N/A"}</p>
                    <p><strong>Total Tickets:</strong> {event.totalTickets}</p>
                    <p><strong>Tickets Sold:</strong> {event.sold || 0}</p>
                    <p><strong>Start:</strong> {event.startDate}</p>
                    <p><strong>End:</strong> {event.endDate}</p>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <div className="mt-2 flex gap-2 flex-wrap">
                  <button
                    onClick={() => fetchAttendees(event, false)}
                    className="flex-1 bg-blue-600 text-white py-2 px-3 rounded-xl hover:bg-blue-700 transition text-sm font-medium"
                  >
                    Attendees
                  </button>
                  <button
                    onClick={() => fetchAttendees(event, true)}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-xl hover:bg-green-700 transition text-sm font-medium"
                  >
                    Validate
                  </button>
                  <Link
                    to={`/events/${event.id}`}
                    className="bg-gray-100 text-gray-700 py-2 px-3 rounded-xl hover:bg-gray-200 transition text-sm font-medium text-center"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Attendees Cards Section */}
      {selectedEvent && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">
            {showValidate ? "Validate Tickets" : "Attendees"} — {selectedEvent.name}
          </h2>

          {showValidate && (
            <input
              type="text"
              placeholder="Search by name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-3 rounded-xl w-full max-w-sm mb-6"
            />
          )}

          {attendeeLoading ? (
            <p>Loading attendees...</p>
          ) : filteredAttendees.length === 0 ? (
            <p className="text-gray-500">No attendees found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAttendees.map((att) => (
                <div
                  key={att.id}
                  className="bg-white p-5 rounded-2xl shadow-lg flex flex-col justify-between hover:shadow-2xl transition"
                >
                  <div>
                  
                    <p className="text-gray-500 text-sm">{att.email || "N/A"}</p>
                    <p className="mt-2 text-gray-700 text-sm">
                      <strong>Ticket ID:</strong> {att.id}
                    </p>
                    <p className={`mt-1 font-semibold ${
                      att.status === "Used" ? "text-green-600" : "text-blue-600"
                    }`}>
                      {att.status || "Booked"}
                    </p>
                  </div>

                  {showValidate && (
                    <div className="mt-4">
                      {att.status !== "Used" ? (
                        <button
                          onClick={() => handleValidate(att)}
                          className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition"
                        >
                          Validate
                        </button>
                      ) : (
                        <span className="text-green-600 font-semibold">Validated</span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Dashboard;
