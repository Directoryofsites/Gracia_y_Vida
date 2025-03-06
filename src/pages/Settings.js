import React, { useState } from 'react';

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="settings-page">
      <h2>Settings</h2>
      <div className="settings-section">
        <h3>Appearance</h3>
        <div className="setting-option">
          <label htmlFor="darkMode">Dark Mode</label>
          <input
            type="checkbox"
            id="darkMode"
            checked={darkMode}
            onChange={(e) => setDarkMode(e.target.checked)}
          />
        </div>
      </div>
      <div className="settings-section">
        <h3>Notifications</h3>
        <div className="setting-option">
          <label htmlFor="notifications">Enable Notifications</label>
          <input
            type="checkbox"
            id="notifications"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
        </div>
      </div>
      <button>Save Settings</button>
    </div>
  );
};

export default Settings;