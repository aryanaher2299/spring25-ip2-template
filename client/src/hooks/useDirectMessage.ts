import { useEffect, useState } from 'react';
import { Chat, ChatUpdatePayload, User } from '../types';
import useUserContext from './useUserContext';
import { createChat, getChatById, getChatsByUser, sendMessage } from '../services/chatService';

/**
 * useDirectMessage is a custom hook that provides state and functions for direct messaging between users.
 * It includes a selected user, messages, and a new message state.
 */

const useDirectMessage = () => {
  const { user, socket } = useUserContext();
  const [showCreatePanel, setShowCreatePanel] = useState<boolean>(false);
  const [chatToCreate, setChatToCreate] = useState<string>('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [chats, setChats] = useState<Chat[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const handleJoinChat = (chatID: string) => {
    // TODO: Task 3 - Emit a 'joinChat' event to the socket with the chat ID function argument.
    socket.emit('joinChat', chatID);
  };

  const handleSendMessage = async () => {
    // TODO: Task 3 - Implement the send message handler function.
    // Whitespace-only messages should not be sent, and the current chat to send this message to
    // should be defined. Use the appropriate service function to make an API call, and update the
    // states accordingly.
    if (!selectedChat || newMessage.trim() === '') return;

    const result = await sendMessage(
      {
        msg: newMessage,
        msgFrom: user.username,
        msgDateTime: new Date(),
      },
      selectedChat._id?.toString() ?? '',
    );

    if ('error' in result) return;

    setSelectedChat(prev =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, result],
            updatedAt: new Date(),
          }
        : prev,
    );
    setNewMessage('');
  };

  const handleChatSelect = async (chatID: string | undefined) => {
    // TODO: Task 3 - Implement the chat selection handler function.
    // If the chat ID is defined, fetch the chat details using the appropriate service function,
    // and update the appropriate state variables. Make sure the client emits a socket event to
    // subscribe to the chat room.
    if (!chatID) return;
    const chat = await getChatById(chatID);
    if (!('error' in chat)) {
      setSelectedChat(chat);
      handleJoinChat(chatID);
    }
  };

  const handleUserSelect = (selectedUser: User) => {
    setChatToCreate(selectedUser.username);
  };

  const handleCreateChat = async () => {
    // TODO: Task 3 - Implement the create chat handler function.
    // If the username to create a chat is defined, use the appropriate service function to create a new chat
    // between the current user and the chosen user. Update the appropriate state variables and emit a socket
    // event to join the chat room. Hide the create panel after creating the chat.
    if (!chatToCreate) return;

    const result = await createChat([user.username, chatToCreate]);

    if ('error' in result) return;

    setChats(prev => [...prev, result]);
    setSelectedChat(result);
    handleJoinChat(result._id.toString());
    setShowCreatePanel(false);
    setChatToCreate('');
  };

  useEffect(() => {
    const fetchChats = async () => {
      // TODO: Task 3 - Fetch all the chats with the current user and update the state variable.
      const result = await getChatsByUser(user.username);
      if (!('error' in result)) setChats(result);
    };

    const handleChatUpdate = (chatUpdate: ChatUpdatePayload) => {
      // TODO: Task 3 - Implement the chat update handler function.
      // This function is responsible for updating the state variables based on the
      // socket events received. The function should handle the following cases:
      // - A new chat is created (add the chat to the current list of chats)
      // - A new message is received (update the selected chat with the new message)
      // - Throw an error for an invalid chatUpdate type
      // NOTE: For new messages, the user will only receive the update if they are
      // currently subscribed to the chat room.
      if (chatUpdate.type === 'created') {
        setChats(prev => [...prev, chatUpdate.chat]);
      } else if (chatUpdate.type === 'newMessage') {
        setSelectedChat(prev => {
          if (
            prev &&
            prev._id &&
            chatUpdate.chat._id &&
            prev._id.toString() === chatUpdate.chat._id.toString()
          ) {
            return chatUpdate.chat;
          }
          return prev;
        });
      } else {
        throw new Error('Invalid chat update type');
      }
    };

    fetchChats();

    // TODO: Task 3 - Register the 'chatUpdate' event listener
    socket.on('chatUpdate', handleChatUpdate);

    return () => {
      // TODO: Task 3 - Unsubscribe from the socket event
      // TODO: Task 3 - Emit a socket event to leave the particular chat room
      // they are currently in when the component unmounts.
      socket.off('chatUpdate', handleChatUpdate);

      if (selectedChat?._id) {
        socket.emit('leaveChat', selectedChat._id.toString());
      }
    };
  }, [user.username, socket, selectedChat?._id]);

  return {
    selectedChat,
    chatToCreate,
    chats,
    newMessage,
    setNewMessage,
    showCreatePanel,
    setShowCreatePanel,
    handleSendMessage,
    handleChatSelect,
    handleUserSelect,
    handleCreateChat,
  };
};

export default useDirectMessage;
