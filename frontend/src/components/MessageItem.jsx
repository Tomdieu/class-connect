import React from 'react';
import { Avatar, Box, Flex, Text, Divider } from '@chakra-ui/react';
import { formatDistanceToNow } from 'date-fns';

const MessageItem = ({ message, isReply = false, depth = 0 }) => {
  // Limit nesting depth to prevent excessive indentation
  const maxDepth = 3;
  const currentDepth = Math.min(depth, maxDepth);
  const indentSize = currentDepth * 20; // 20px per nesting level

  return (
    <Box mb={4}>
      <Flex 
        direction="column" 
        bg={isReply ? "gray.50" : "white"} 
        p={3} 
        borderRadius="md" 
        boxShadow="sm"
        ml={indentSize}
      >
        {/* Message Header with user info */}
        <Flex mb={2} align="center">
          <Avatar 
            size="sm" 
            src={message.sender.avatar} 
            name={`${message.sender.first_name} ${message.sender.last_name}`} 
            mr={2} 
          />
          <Box>
            <Text fontWeight="bold">
              {message.sender.first_name} {message.sender.last_name}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </Text>
          </Box>
        </Flex>
        
        {/* Message Content */}
        <Text mb={2}>{message.content}</Text>
        
        {/* Message File Attachment if any */}
        {message.file && (
          <Box mt={2}>
            <a href={message.file} target="_blank" rel="noopener noreferrer">
              <Text color="blue.500">Attached File</Text>
            </a>
          </Box>
        )}
      </Flex>

      {/* Replies */}
      {message.replies && message.replies.length > 0 && (
        <Box mt={2} ml={indentSize + 10}>
          {message.replies.map((reply) => (
            <MessageItem 
              key={reply.id} 
              message={reply} 
              isReply={true} 
              depth={currentDepth + 1} 
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default MessageItem;