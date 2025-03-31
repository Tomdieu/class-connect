/**
 * Message utility functions for parsing and displaying chat messages
 */

/**
 * Extracts user information from a message sender object
 * @param {Object} sender - The sender object from the message
 * @returns {Object} - Formatted user information
 */
export const extractUserInfo = (sender) => {
  if (!sender) return null;
  
  return {
    id: sender.id,
    name: `${sender.first_name} ${sender.last_name}`,
    avatar: sender.avatar,
    email: sender.email,
    isAdmin: sender.is_superuser || sender.is_staff,
    educationLevel: sender.education_level,
    classDisplay: sender.class_display
  };
};

/**
 * Parses a message to extract parent message information
 * @param {Object} message - The message object to parse
 * @returns {Object} - Object containing message and parent information
 */
export const parseMessageWithParent = (message) => {
  if (!message) return null;
  
  const result = {
    id: message.id,
    content: message.content,
    createdAt: message.created_at,
    file: message.file,
    sender: extractUserInfo(message.sender),
    forum: message.forum,
    parentMessage: null,
    replies: (message.replies || []).map(reply => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.created_at,
      file: reply.file,
      sender: extractUserInfo(reply.sender)
    }))
  };
  
  // Extract parent message information if available
  if (message.parent) {
    result.parentMessage = {
      id: message.parent.id,
      content: message.parent.content,
      createdAt: message.parent.created_at,
      sender: extractUserInfo(message.parent.sender)
    };
  }
  
  return result;
};

/**
 * Formats messages for display, handling nested parent-reply relationships
 * @param {Array} messages - Array of message objects
 * @returns {Array} - Formatted messages with proper parent-child relationships
 */
export const formatMessagesForDisplay = (messages) => {
  if (!messages || !Array.isArray(messages)) {
    return [];
  }
  
  return messages.map(message => parseMessageWithParent(message));
};

/**
 * Gets the formatted display name for a message user
 * @param {Object} user - User object
 * @returns {String} - Formatted display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'Unknown User';
  return user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email;
};