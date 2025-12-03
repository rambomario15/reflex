import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";
import AimTrainer from "./pages/AimTrainer";
import Navbar from "./pages/Navbar";
import HomePage from "./pages/HomePage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ReactionTime from "./pages/ReactionTime";
import TargetFollowing from "./pages/TargetFollowing";

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/aim-trainer" element={<AimTrainer />} />
        <Route path="/reaction-time" element={<ReactionTime />} />
        <Route path="/target-following" element={<TargetFollowing />} />
      </Routes>
    </Router>
  );
}
