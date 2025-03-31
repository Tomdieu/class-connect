import React from 'react';
import { format } from 'date-fns';
import { MessagesType, UserType } from '../types';

interface MessageStructureProps {
  message: MessagesType;
  isReply?: boolean;
  onReply?: (messageId: string) => void;
}

const MessageStructure: React.FC<MessageStructureProps> = ({ 
  message, 
  isReply = false,
  onReply
}) => {
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy h:mm a');
    } catch (error) {
      return dateString;
    }
  };

  const renderUserInfo = (user: UserType) => (
    <div className="message-sender">
      <div className="avatar">
        <img 
          src={user.avatar} 
          alt={`${user.first_name} ${user.last_name}`}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/default-avatar.png';
          }}
        />
      </div>
      <div className="user-details">
        <div className="user-name">{user.first_name} {user.last_name}</div>
        <div className="user-education">{user.class_display}</div>
      </div>
    </div>
  );

  return (
    <div className={`message-container ${isReply ? 'reply' : 'main-message'}`}>
      {!isReply && message.parent && (
        <div className="replied-message mb-2 pl-2 border-l-2 border-gray-300">
          <p className="text-sm text-gray-500">
            <span className="font-medium">{message.parent.sender.first_name}</span> wrote:
          </p>
          <p className="text-sm text-gray-600">{message.parent.content}</p>
        </div>
      )}

      <div className="message">
        {renderUserInfo(message.sender)}
        
        <div className="message-body">
          <div className="message-content">{message.content}</div>
          
          {message.file && (
            <div className="message-attachment">
              <a href={message.file} target="_blank" rel="noopener noreferrer">
                View Attachment
              </a>
            </div>
          )}
          
          <div className="message-timestamp">
            {formatDate(message.created_at)}
          </div>
        </div>
      </div>

      {!isReply && (
        <>
          <div className="message-actions">
            {onReply && (
              <button 
                className="reply-button"
                onClick={() => onReply(message.id)}
              >
                Reply
              </button>
            )}
          </div>

          {message.replies && message.replies.length > 0 && (
            <div className="replies-container">
              <div className="replies-header">
                {message.replies.length} {message.replies.length === 1 ? 'Reply' : 'Replies'}
              </div>
              <div className="replies-list">
                {message.replies.map(reply => (
                  <div key={reply.id} className="reply-item">
                    {renderUserInfo(reply.sender)}
                    <div className="message-body">
                      <div className="message-content">{reply.content}</div>
                      {reply.file && (
                        <div className="message-attachment">
                          <a href={reply.file} target="_blank" rel="noopener noreferrer">
                            View Attachment
                          </a>
                        </div>
                      )}
                      <div className="message-timestamp">
                        {formatDate(reply.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MessageStructure;