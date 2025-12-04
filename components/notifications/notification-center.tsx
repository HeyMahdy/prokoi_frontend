"use client"

import React from "react"
import { useNotifications } from "@/components/providers/notification-context"
import { Bell, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

export function NotificationCenter() {
    const { notifications, acknowledge } = useNotifications()
    const [open, setOpen] = React.useState(false)

    const unreadCount = notifications.length

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="default"
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all relative"
                    >
                        <Bell className="h-6 w-6" />
                        {unreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="absolute -top-1 -right-1 h-6 w-6 flex items-center justify-center rounded-full p-0 text-xs"
                            >
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </Badge>
                        )}
                        <span className="sr-only">Open notifications</span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0 mr-6 mb-2" align="end" side="top">
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/40">
                        <h4 className="font-semibold text-sm">Notifications</h4>
                        {unreadCount > 0 && (
                            <Badge variant="secondary" className="text-xs font-normal">
                                {unreadCount} unread
                            </Badge>
                        )}
                    </div>
                    <ScrollArea className="h-[300px]">
                        {notifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground p-4 text-center">
                                <Bell className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-sm">No new notifications</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1 p-1">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className="flex items-start gap-3 p-3 text-sm hover:bg-muted/50 transition-colors rounded-md group relative"
                                    >
                                        <div className="flex-1 space-y-1">
                                            <p className="leading-relaxed">{notification.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => acknowledge(notification.id)}
                                            title="Acknowledge"
                                        >
                                            <Check className="h-4 w-4" />
                                            <span className="sr-only">Acknowledge</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </div>
    )
}
