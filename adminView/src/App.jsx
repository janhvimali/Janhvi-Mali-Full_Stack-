import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

const socket = io('backend-kappa-umber.vercel.app');

function AdminView() {
  const [score, setScore] = useState({
    runs: 0,
    wickets: 0,
    currentOver: 0,
    currentBall: 0,
    overs: [],
  });

  useEffect(() => {
    fetch('backend-kappa-umber.vercel.app/score')
      .then((res) => res.json())
      .then((data) => setScore(data));

    socket.on('update', (data) => {
      setScore(data);
    });

    return () => socket.off('update');
  }, []);

  const handleUpdate = (runs, out = false) => {
    fetch('backend-kappa-umber.vercel.app/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: out ? { out: true } : { runs } }),
    });
  };

  return (
    <div className="admin-view">
      <header className="header">
        <h1>Admin View</h1>
        <p>
          Score: {score.runs}/{score.wickets}
        </p>
        <p>Current Over: {score.currentOver}</p>
      </header>

      <main className="controls">
        <section className="current-ball">
          <h2>Current Ball: {score.currentBall + 1}</h2>
          {[0, 1, 2, 3, 4, 6].map((run) => (
            <button key={run} onClick={() => handleUpdate(run)}>
              {run} Runs
            </button>
          ))}
          <button onClick={() => handleUpdate(0, true)}>Wicket</button>
        </section>

        <section className="over-listing">
          <h2>Completed Overs</h2>
          {score.overs.map((over, index) => (
            <div key={index}>
              <h3>Over {index + 1}</h3>
              <p>{over.runsPerBall.join(', ')}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

export default AdminView;
