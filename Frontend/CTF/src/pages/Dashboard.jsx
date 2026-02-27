import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { challengesAPI, profileAPI } from '../api/client';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Fetch challenges and user profile
    Promise.all([
      challengesAPI.getAll(),
      profileAPI.get(parsedUser.userID),
    ])
      .then(([challanges, profile]) => {
        setChallenges(challanges);
        if (profile && profile.length > 0) {
          setUser(profile[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load data: ' + err.message);
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSolveChallenge = async (challengeID) => {
    try {
      const result = await challengesAPI.solve(user.userID, challengeID);
      if (result.success) {
        alert('Challenge solved!');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (err) {
      alert('Error solving challenge: ' + err.message);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="user-info">
          <span>{user.username}</span>
          <span className="score">Score: {user.score || 0}</span>
          <button onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {error && <div className="error-message">{error}</div>}

        <section className="user-profile">
          <h2>Welcome, {user.username}!</h2>
          <p>Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
        </section>

        <section className="challenges-section">
          <h2>Challenges</h2>
          {loading ? (
            <p className="loading">Loading challenges...</p>
          ) : challenges.length === 0 ? (
            <p>No challenges available</p>
          ) : (
            <div className="challenges-grid">
              {challenges.map((challenge) => (
                <div key={challenge.challengeID} className="challenge-card">
                  <div className="challenge-header">
                    <h3>{challenge.title}</h3>
                    <span className={`difficulty diff-${challenge.difficulty}`}>
                      {'★'.repeat(challenge.difficulty)}
                    </span>
                  </div>
                  <p className="description">{challenge.description}</p>
                  <div className="challenge-footer">
                    <span className="points">{challenge.points} pts</span>
                    <button
                      onClick={() => handleSolveChallenge(challenge.challengeID)}
                      className="solve-button"
                    >
                      Mark Solved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
