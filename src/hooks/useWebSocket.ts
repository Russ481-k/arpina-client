"use client";

import { useEffect, useRef, useCallback, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChatMessageDto } from '@/types/api/chat';
import { useRecoilValue } from 'recoil';
import { authState } from '@/stores/auth';
import { getToken } from '@/lib/auth-utils';

interface UseWebSocketProps {
  threadId?: number;
  onMessageReceived?: (message: ChatMessageDto) => void;
}

export const useWebSocket = ({ threadId, onMessageReceived }: UseWebSocketProps) => {
  const client = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useRecoilValue(authState);
  const subscriptionRef = useRef<any>(null);
  const connectingRef = useRef(false);

  const connect = useCallback(() => {
    if (!threadId || typeof window === 'undefined' || !isAuthenticated) {
      console.log('Missing required data for connection:', { threadId, isAuthenticated });
      return;
    }

    if (client.current?.connected || connectingRef.current) {
      console.log('Already connected or connecting');
      return;
    }

    try {
      console.log('Attempting to connect to WebSocket...');
      connectingRef.current = true;
      
      const newClient = new Client();
      const socket = new SockJS('http://localhost:8080/ws');
      const token = getToken();
      
      // 클라이언트 설정
      newClient.configure({
        webSocketFactory: () => socket,
        connectHeaders: {
          Authorization: `Bearer ${token}`,
        },
        debug: (str) => {
          console.log('STOMP Debug:', str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        onConnect: () => {
          console.log('Successfully connected to WebSocket');
          setIsConnected(true);
          connectingRef.current = false;
          
          // 이전 구독 해제
          if (subscriptionRef.current) {
            try {
              subscriptionRef.current.unsubscribe();
            } catch (error) {
              console.error('Error unsubscribing:', error);
            }
          }
          
          // 새로운 구독 설정
          subscriptionRef.current = newClient.subscribe(`/sub/chat/room/${threadId}`, (message) => {
            console.log('Received message:', message);
            try {
              const receivedMessage = JSON.parse(message.body) as ChatMessageDto;
              onMessageReceived?.(receivedMessage);
            } catch (error) {
              console.error('Error parsing message:', error);
            }
          });
        },
        onStompError: (frame) => {
          console.error('STOMP error:', frame);
          setIsConnected(false);
          connectingRef.current = false;
        },
        onWebSocketError: (event) => {
          console.error('WebSocket error:', event);
          setIsConnected(false);
          connectingRef.current = false;
        },
        onDisconnect: () => {
          console.log('Disconnected from WebSocket');
          setIsConnected(false);
          connectingRef.current = false;
          subscriptionRef.current = null;
        },
      });

      client.current = newClient;
      newClient.activate();
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      setIsConnected(false);
      connectingRef.current = false;
    }
  }, [threadId, onMessageReceived, isAuthenticated]);

  const disconnect = useCallback(() => {
    if (subscriptionRef.current) {
      try {
        subscriptionRef.current.unsubscribe();
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
      subscriptionRef.current = null;
    }

    if (client.current?.connected) {
      console.log('Disconnecting WebSocket...');
      client.current.deactivate();
      client.current = null;
      setIsConnected(false);
    }
    connectingRef.current = false;
  }, []);

  const sendMessage = useCallback((message: ChatMessageDto) => {
    if (!client.current?.connected || !threadId) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    try {
      client.current.publish({
        destination: '/pub/chat/message',
        body: JSON.stringify(message),
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [threadId]);

  useEffect(() => {
    if (isAuthenticated) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [connect, disconnect, isAuthenticated]);

  return {
    isConnected,
    sendMessage,
  };
}; 