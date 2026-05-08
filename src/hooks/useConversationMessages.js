import { useCallback, useEffect, useState } from "react";
import {
  getMessagesForConversation,
  subscribeToMessageUpdates,
} from "../utils/storage";

/**
 * Loads messages for a single parent–professor conversation and keeps them
 * updated across tabs via BroadcastChannel + storage events + light polling.
 */
export function useConversationMessages(username, role, conversationId) {
  const [messages, setMessages] = useState([]);

  const reload = useCallback(() => {
    if (!conversationId || !username || !role) {
      setMessages([]);
      return;
    }
    setMessages(getMessagesForConversation(conversationId, username, role));
  }, [conversationId, username, role]);

  useEffect(() => {
    const unsub = subscribeToMessageUpdates(reload);
    return unsub;
  }, [conversationId, reload]);

  return { messages, reload };
}
