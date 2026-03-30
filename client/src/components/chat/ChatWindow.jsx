import { useEffect, useRef } from "react";
import ChatBubble from "./ChatBubble";

export default function ChatWindow({ messages, currentUserId, isTyping, typingUserRole }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50" style={{ minHeight: "400px" }}>
      {messages.length === 0 && (
        <p className="text-center text-gray-400 mt-8">No messages yet. Start the conversation!</p>
      )}
      {messages.map((msg) => (
        <ChatBubble
          key={msg._id || msg.createdAt}
          message={msg}
          isOwn={msg.senderId?.toString() === currentUserId?.toString()}
        />
      ))}

      {isTyping && (
        <div className="flex justify-start mb-3">
          <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white shadow-sm ring-1 ring-gray-100">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <span className="text-xs text-gray-500 ml-1">
              {typingUserRole === "doctor" ? "Doctor is typing..." : "Patient is typing..."}
            </span>
          </div>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
