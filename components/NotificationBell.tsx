import React, { useState, useEffect, useRef } from 'react';
import { Notification } from '../types';
import * as Icons from './Icons';
import { MOCK_REQUISITIONS } from '../constants';

interface NotificationBellProps {
    notifications: Notification[];
    onMarkAllAsRead: () => void;
    onNavigate: (page: string, data?: any) => void;
    onDeleteNotification: (id: number) => void;
}

export default function NotificationBell({ notifications, onMarkAllAsRead, onNavigate, onDeleteNotification }: NotificationBellProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleNotificationClick = (notification: Notification) => {
        if (notification.requisitionId) {
            const requisition = MOCK_REQUISITIONS.find(r => r.id === notification.requisitionId);
            if (requisition) {
                onNavigate('details', requisition);
            }
        }
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none"
                aria-label={`Notificações (${unreadCount} não lidas)`}
            >
                <Icons.BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white"></span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white rounded-lg shadow-xl border z-20">
                    <div className="p-3 flex justify-between items-center border-b">
                        <h3 className="font-semibold text-gray-800">Notificações</h3>
                        {unreadCount > 0 && (
                             <button onClick={onMarkAllAsRead} className="text-sm text-blue-600 hover:underline">
                                Marcar todas como lidas
                            </button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(notification => (
                                <div
                                    key={notification.id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`group p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex justify-between items-start gap-2 ${!notification.read ? 'bg-blue-50' : ''}`}
                                >
                                    <div className="flex-grow">
                                        <p className="text-sm text-gray-700">{notification.text}</p>
                                        <p className="text-xs text-gray-400 mt-1">{new Date(notification.date).toLocaleString('pt-BR')}</p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDeleteNotification(notification.id);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 flex-shrink-0 transition-opacity"
                                        aria-label={`Excluir notificação: ${notification.text}`}
                                    >
                                        <Icons.TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-gray-500">
                                <p>Nenhuma notificação nova.</p>
                            </div>
                        )}
                    </div>
                     <div className="p-2 bg-gray-50 text-center border-t">
                        <button onClick={() => { onNavigate('history'); setIsOpen(false); }} className="text-sm font-semibold text-blue-600 hover:underline">
                            Ver todas as atividades
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}