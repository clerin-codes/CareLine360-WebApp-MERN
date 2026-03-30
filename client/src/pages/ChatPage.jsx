import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { getMessages, markAsRead } from "../api/chatApi";
import { getSocket, joinChatRoom, leaveChatRoom, sendChatMessage, emitTyping, emitStopTyping } from "../socket/socketClient";
import ChatWindow from "../components/chat/ChatWindow";
import ChatInput from "../components/chat/ChatInput";

export default function ChatPage() {
  const { id } = useParams();
  const { currentUser } = useUser();
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUserRole, setTypingUserRole] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection and set up listeners
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    if (!socket) {
      console.error("Socket not initialized");
      return;
    }

    const onConnect = () => {
      setConnected(true);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const handleNewMessage = (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
      if (currentUser) {
        markAsRead(id, currentUser._id).catch(() => {});
      }
    };

    const handleRoomJoined = ({ appointmentId }) => {
      console.log("ChatPage: Joined room:", appointmentId);
      setConnected(true);
    };

    const handleUserTyping = ({ userId, role, isTyping: typing, senderRole }) => {
      if (userId !== currentUser?._id) {
        setIsTyping(typing);
        setTypingUserRole(senderRole || role);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("new_message", handleNewMessage);
    socket.on("room_joined", handleRoomJoined);
    socket.on("user_typing", handleUserTyping);

    // Set initial connection state
    if (socket.connected) setConnected(true);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_message", handleNewMessage);
      socket.off("room_joined", handleRoomJoined);
      socket.off("user_typing", handleUserTyping);
    };
  }, [id, currentUser]);

  // Join room and fetch initial messages
  useEffect(() => {
    if (!id) return;

    joinChatRoom(id);

    getMessages(id)
      .then((res) => {
        setMessages(res.data.messages || res.data.data || []);
        if (currentUser) {
          markAsRead(id, currentUser._id).catch(() => {});
        }
      })
      .catch((err) => console.error("Failed to fetch messages:", err));

    return () => {
      leaveChatRoom(id);
    };
  }, [id, currentUser]);

  const handleSend = (text) => {
    if (!currentUser || !text.trim()) return;
    clearTimeout(typingTimeoutRef.current);
    emitStopTyping(id);
    sendChatMessage(id, text.trim());
  };

  const handleTyping = useCallback(() => {
    if (!id) return;
    emitTyping(id);
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitStopTyping(id);
    }, 1500);
  }, [id]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-gray-900">Consultation Chat</h1>
          <span className={`text-xs px-2 py-0.5 rounded-full ${connected ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
            {connected ? "Connected" : "Connecting..."}
          </span>
        </div>
        <Link to={`/appointments/${id}`} className="text-sm text-gray-500 hover:text-blue-600 flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>Back to Appointment</span>
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-100 overflow-hidden flex flex-col" style={{ height: "calc(100vh - 220px)" }}>
        <ChatWindow
          messages={messages}
          currentUserId={currentUser?._id}
          isTyping={isTyping}
          typingUserRole={typingUserRole}
        />
        <ChatInput
          onSend={handleSend}
          onTyping={handleTyping}
          disabled={!currentUser || !connected}
          isTyping={isTyping}
          typingUserRole={typingUserRole}
        />
      </div>
    </div>
  );
}
