import React from 'react';
import './index.css';
import { Chat } from '../../../../types';

/**
 * ChatsListCard component displays information about a chat and allows the user to select it.
 *
 * @param chat: The chat object containing details like participants and chat ID.
 * @param handleChatSelect: A function to handle the selection of a chat, receiving the chat's ID as an argument.
 */
const ChatsListCard = ({
  chat,
  handleChatSelect,
}: {
  chat: Chat;
  handleChatSelect: (chatID: string | undefined) => void;
}) => (
  // TODO: Task 3 - This component should display a comma-separated list of participants in the chat,
  // using the <p> tag. When the div is clicked, it should call the handleChatSelect function.
  <div className='chats-list-card' onClick={() => handleChatSelect(chat._id?.toString())}>
    <p>{chat.participants.map(p => p.toString()).join(', ')}</p>
  </div>
);

export default ChatsListCard;
