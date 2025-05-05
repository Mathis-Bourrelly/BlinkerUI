import React, { createContext, useContext, useState, ReactNode } from 'react';

type MessageContextType = {
  enableConversationsQuery: boolean;
  enableUnreadMessagesQuery: boolean;
  setEnableConversationsQuery: (enable: boolean) => void;
  setEnableUnreadMessagesQuery: (enable: boolean) => void;
};

const MessageContext = createContext<MessageContextType | undefined>(undefined);

export function MessageProvider({ children }: { children: ReactNode }) {
  // Par défaut, les requêtes sont désactivées
  const [enableConversationsQuery, setEnableConversationsQuery] = useState(false);
  const [enableUnreadMessagesQuery, setEnableUnreadMessagesQuery] = useState(false);

  return (
    <MessageContext.Provider
      value={{
        enableConversationsQuery,
        enableUnreadMessagesQuery,
        setEnableConversationsQuery,
        setEnableUnreadMessagesQuery,
      }}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessageContext() {
  const context = useContext(MessageContext);
  if (context === undefined) {
    throw new Error('useMessageContext must be used within a MessageProvider');
  }
  return context;
}
