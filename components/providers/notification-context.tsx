"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"
import { websocketManager } from "@/lib/websocket-manager"
import { authStorage } from "@/lib/auth-storage"

export interface Notification {
    id: string | number
    message: string
    [key: string]: any
}

interface NotificationContextType {
    notifications: Notification[]
    acknowledge: (id: string | number) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([])

    useEffect(() => {
        // Subscribe to WebSocket messages
        const unsubscribe = websocketManager.subscribe((message: any) => {
            // Handle both single message and array of messages (history)
            const messages = Array.isArray(message) ? message : [message];

            const newNotifications: Notification[] = [];

            messages.forEach(msg => {
                // Skip if it's an ACK confirmation or doesn't look like a notification
                // Adjust these checks based on actual backend response for ACK
                if (!msg || (msg.type === 'ACK_CONFIRMATION') || (!msg.message && !msg.text && !msg.content)) {
                    return;
                }

                // Skip if already acknowledged (if backend sends status)
                if (msg.acknowledged || msg.status === 'ACKNOWLEDGED' || msg.read) {
                    return;
                }

                const notification: Notification = {
                    id: msg.id || msg.notification_id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    message: msg.message || msg.text || msg.content || JSON.stringify(msg),
                    ...msg
                };

                newNotifications.push(notification);
            });

            if (newNotifications.length === 0) return;

            setNotifications(prev => {
                const uniqueNew = newNotifications.filter(newNotif =>
                    !prev.some(existing => existing.id === newNotif.id)
                );

                if (uniqueNew.length === 0) return prev;

                return [...uniqueNew, ...prev];
            })
        })

        // Check if user is logged in and connect if needed (redundant if handled in login/signup, but good for page refreshes)
        const user = authStorage.getUserData()
        if (user && user.email && !websocketManager.isConnected()) {
            websocketManager.connectWithEmail(user.email).catch(console.error)
        }

        return () => {
            unsubscribe()
        }
    }, [])

    const acknowledge = useCallback(async (id: string | number) => {
        try {
            await websocketManager.acknowledgeNotification(id)
            setNotifications(prev => prev.filter(n => n.id !== id))
        } catch (error) {
            console.error("Failed to acknowledge notification:", error)
            // Optionally handle error (e.g., show toast)
        }
    }, [])

    return (
        <NotificationContext.Provider value={{ notifications, acknowledge }}>
            {children}
        </NotificationContext.Provider>
    )
}

export function useNotifications() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error("useNotifications must be used within a NotificationProvider")
    }
    return context
}
