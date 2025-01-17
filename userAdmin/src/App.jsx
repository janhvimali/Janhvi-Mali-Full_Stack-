import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('https://backend-kappa-umber.vercel.app:3000');

function UserView() {
  const [score, setScore] = useState({
    runs: 0,
    wickets: 0,
    currentOver: 0,
    currentBall: 0,
    overs: [],
  });

  useEffect(() => {
    fetch('https://backend-kappa-umber.vercel.app:3000/score')
      .then((res) => res.json())
      .then((data) => setScore(data));

    socket.on('update', (data) => {
      setScore(data);
    });

    return () => socket.off('update');
  }, []);

  return (
    <div className="user-view">
      <header className="header">
        <h1>User View</h1>
        <p>
          Score: {score.runs}/{score.wickets}
        </p>
        <p>Current Over: {score.currentOver}</p>
      </header>

      <main className="live-section">
        <section className="animation">
          <h2>Animation Section</h2>
          <p>Run Scored: {score.overs[score.currentOver]?.runsPerBall[score.currentBall - 1] || 0}</p>
        </section>

        <section className="this-over">
          <h2>This Over</h2>
          {score.overs[score.currentOver]?.runsPerBall.map((run, index) => (
            <span
              key={index}
              className={`ball ${index === score.currentBall ? 'active' : ''}`}
            >
              {run >= 0 ? run : 'W'}
            </span>
          ))}
        </section>
      </main>
    </div>
  );
}

export default UserView;
