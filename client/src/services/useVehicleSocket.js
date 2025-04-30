// src/services/useVehicleSocket.js
import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const useVehicleSocket = (onVehicleUpdate) => {
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef(null);

    useEffect(() => {
        // connect to server port on dev - modify this to match your server setup
        const serverUrl = import.meta.env.DEV ? 'http://localhost:3000' : window.location.origin;

        // Create the socket connection
        const socket = io(serverUrl, {
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000
        });
        
        socketRef.current = socket;

        socket.on('connect', () => {
            console.log('Connected to vehicle tracking');
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from vehicle tracking');
            setIsConnected(false);
        });

        socket.on('vehicleUpdate', ({ topic, data }) => {
            if (onVehicleUpdate) {
                onVehicleUpdate(data, topic);
            }
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setIsConnected(false);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        }
    }, [onVehicleUpdate]);

    // Provide a way to manually reconnect if needed
    const reconnect = () => {
        if (socketRef.current) {
            socketRef.current.connect();
        }
    };

    return { isConnected, reconnect };
}

export default useVehicleSocket;
