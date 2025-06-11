// frontend/src/contexts/NotificationContext.js

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

const NotificationContext = createContext();

export const useNotifications = () => {
    return useContext(NotificationContext);
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    const fetchNotifications = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setNotifications([]);
            return;
        }
        try {
            const response = await axios.get(`${API_BASE_URL}/api/notifications`, { headers: { Authorization: `Bearer ${token}` } });
            const sortedNotifications = response.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setNotifications(sortedNotifications);
        } catch (error) {
            console.error("알림을 가져오는 중 오류 발생", error);
            setNotifications([]);
        }
    }, []);

    useEffect(() => {
        let interval;
        if (isLoggedIn) {
            fetchNotifications();
            interval = setInterval(fetchNotifications, 15000);
        } else {
            setNotifications([]);
        }
        return () => clearInterval(interval);
    }, [isLoggedIn, fetchNotifications]);

    // 개별 알림 읽음 처리 (상태를 is_read: true로 변경)
    const dismissNotification = async (notificationId) => {
        const token = localStorage.getItem('token');
        if (!token) return;

        setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));

        try {
            await axios.post(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error("알림 읽음 처리 API 호출 실패", error);
            fetchNotifications();
        }
    };

    // 모든 알림 읽음 처리 (상태를 is_read: true로 변경)
    const readAllNotifications = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
        if (unreadIds.length === 0) return;

        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));

        try {
            await axios.post(`${API_BASE_URL}/api/notifications/read-all`, {}, { headers: { Authorization: `Bearer ${token}` } });
        } catch (error) {
            console.error("알림 모두 읽음 처리 API 호출 실패", error);
            fetchNotifications();
        }
    };

    const value = {
        notifications,
        dismissNotification,
        readAllNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};