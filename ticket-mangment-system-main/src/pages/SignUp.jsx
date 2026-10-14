import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { signUpUser } from "../redux/reducers/authSlice";
import { useNavigate, Link } from "react-router-dom";

function SignUp() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isOrganizer, setIsOrganizer] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      await dispatch(
        signUpUser({
          email,
          password,
          name: fullName,
          role: isOrganizer ? "organizer" : "attendee",
        })
      ).unwrap();

      alert(`Account created successfully as ${isOrganizer ? "Organizer" : "Attendee"}!`);
      navigate(isOrganizer ? "/dashboard" : "/login", { replace: true });
    } catch (err) {
      alert("Signup failed: " + err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">

        {/* LEFT PANEL */}
        <div className="hidden md:flex w-1/2 bg-gray-900 text-white flex-col justify-center px-10 py-12">
          <h1 className="text-4xl font-bold leading-tight">
            Join
            <span className="block text-emerald-400">Event Platform</span>
          </h1>

          <p className="mt-6 text-gray-300 text-sm leading-relaxed max-w-sm">
            {isOrganizer
              ? "Create your organizer account to host events, manage tickets, track attendance, and scan tickets in real-time."
              : "Create your account to attend events, book tickets, and stay connected with amazing experiences."}
          </p>

          <div className="mt-10 space-y-3 text-sm text-gray-300">
            <p className="flex items-center gap-2">
              <span className="text-emerald-400">✔</span> Quick & secure setup
            </p>
            <p className="flex items-center gap-2">
              <span className="text-emerald-400">✔</span> {isOrganizer ? "Publish & manage events" : "Explore top events"}
            </p>
            <p className="flex items-center gap-2">
              <span className="text-emerald-400">✔</span> {isOrganizer ? "Real-time ticket validation" : "Instant digital QR tickets"}
            </p>
          </div>
        </div>

        {/* RIGHT FORM */}
        <div className="w-full md:w-1/2 px-8 py-10 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isOrganizer ? "Register as an Event Organizer" : "Register as an Attendee"}
          </p>

          {/* Role Selection Tabs */}
          <div className="mt-5 grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setIsOrganizer(false)}
              className={`py-3 px-4 rounded-xl text-sm font-semibold transition flex flex-col items-center gap-1 ${
                !isOrganizer
                  ? "bg-white text-emerald-700 shadow-md border-2 border-emerald-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">👤</span>
              Attendee
            </button>
            <button
              type="button"
              onClick={() => setIsOrganizer(true)}
              className={`py-3 px-4 rounded-xl text-sm font-semibold transition flex flex-col items-center gap-1 ${
                isOrganizer
                  ? "bg-white text-emerald-700 shadow-md border-2 border-emerald-500"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <span className="text-lg">🎪</span>
              Organizer
            </button>
          </div>

          {isOrganizer && (
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <span>👑</span>
              <span><strong>Organizer Mode:</strong> You will be able to create events and add them directly to Firebase.</span>
            </div>
          )}

          {error && (
            <p className="text-red-600 text-sm mt-4">{error}</p>
          )}

          <form onSubmit={handleSignUp} className="mt-6 space-y-4">

            <div>
              <label className="text-xs font-semibold text-gray-500">
                FULL NAME
              </label>
              <input
                type="text"
                placeholder={isOrganizer ? "Organizer Name / Company" : "John Doe"}
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500">
                EMAIL
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500">
                PASSWORD
              </label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500">
                CONFIRM PASSWORD
              </label>
              <input
                type="password"
                placeholder="Re-enter password"
                className="mt-2 w-full border border-gray-300 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold
                         hover:bg-emerald-700 transition active:scale-95 shadow-lg
                         disabled:bg-gray-400 disabled:cursor-not-allowed mt-4"
            >
              {loading
                ? "Creating Account..."
                : isOrganizer
                ? "Create Organizer Account"
                : "Create Attendee Account"}
            </button>
          </form>

          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-emerald-600 font-semibold hover:underline"
            >
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
