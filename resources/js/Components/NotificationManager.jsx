import React, { useState, useEffect } from 'react';
import Notification from './Notification';

const NotificationManager = () => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (message, type = 'success') => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type }]);
    };

    const removeNotification = (id) => {
        setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    };

    useEffect(() => {
        window.showNotification = addNotification;
    }, []);

    return (
        <div className="notification-container">
            {notifications.map((notif, index) => (
                <div key={notif.id} style={{ animationDelay: `${index * 100}ms` }}>
                    <Notification
                        message={notif.message}
                        type={notif.type}
                        onClose={() => removeNotification(notif.id)}
                    />
                </div>
            ))}
        </div>
    );
};

export default NotificationManager;