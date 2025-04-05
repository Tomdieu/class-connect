"use client";

import { ThumbsUp } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { useI18n } from "@/locales/client";

enum ReactionType {
  LIKE = 'LIKE',
  LOVE = 'LOVE',
  HAHA = 'HAHA',
  WOW = 'WOW',
  SAD = 'SAD',
  ANGRY = 'ANGRY'
}

interface ReactionButtonProps {
  onReact: (type: ReactionType) => void;
  activeReaction?: ReactionType | null;
  isLoading?: boolean;
  isSmall?: boolean;
}

export default function ReactionButton({ 
  onReact, 
  activeReaction, 
  isLoading = false, 
  isSmall = false 
}: ReactionButtonProps) {
  const [showReactions, setShowReactions] = useState(false);
  const reactionsRef = useRef<HTMLDivElement>(null);
  const t = useI18n();

  const reactions = [
    { type: ReactionType.LIKE, emoji: "👍", label: t("reactions.like") },
    { type: ReactionType.LOVE, emoji: "❤️", label: t("reactions.love") },
    { type: ReactionType.HAHA, emoji: "😄", label: t("reactions.haha") },
    { type: ReactionType.WOW, emoji: "😮", label: t("reactions.wow") },
    { type: ReactionType.SAD, emoji: "😢", label: t("reactions.sad") },
    { type: ReactionType.ANGRY, emoji: "😠", label: t("reactions.angry") },
  ];

  const handleOutsideClick = (event: MouseEvent) => {
    if (reactionsRef.current && !reactionsRef.current.contains(event.target as Node)) {
      setShowReactions(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // Handle quick reaction (when button is clicked directly)
  const handleQuickReaction = () => {
    if (isLoading) return;
    
    if (activeReaction) {
      onReact(activeReaction); // Toggle off the active reaction
    } else {
      onReact(ReactionType.LIKE); // Default to Like
    }
  };

  // Get the current reaction display
  const getActiveReactionDisplay = () => {
    if (!activeReaction) return null;
    
    const reaction = reactions.find(r => r.type === activeReaction);
    return reaction ? (
      <>
        <span className="mr-1">{reaction.emoji}</span>
        {!isSmall && <span className="hidden sm:inline">{reaction.label}</span>}
      </>
    ) : null;
  };

  return (
    <div className="relative" ref={reactionsRef}>
      <Button
        variant="ghost"
        size={isSmall ? "xs" : "sm"}
        onClick={handleQuickReaction}
        onMouseEnter={() => !isLoading && setShowReactions(true)}
        className={`flex items-center gap-1 hover:bg-gray-100 ${
          activeReaction ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
        } ${isSmall ? "py-1 px-2 h-7" : ""}`}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="flex items-center gap-1">
            <div className={`border-2 border-current border-t-transparent rounded-full animate-spin
              ${isSmall ? "h-3 w-3" : "h-4 w-4"}`} />
            {!isSmall && <span className="hidden sm:inline">Loading</span>}
          </div>
        ) : (
          getActiveReactionDisplay() || (
            <>
              <ThumbsUp className={isSmall ? "h-3 w-3" : "h-4 w-4"} />
              {!isSmall && <span className="hidden sm:inline">{t("forum.like")}</span>}
            </>
          )
        )}
      </Button>

      {showReactions && !isLoading && (
        <div 
          className={`absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg p-1.5 flex z-10 border
            ${isSmall ? "scale-75 origin-bottom-left" : ""}`}
          onMouseLeave={() => setShowReactions(false)}
        >
          {reactions.map((reaction) => (
            <button
              key={reaction.type}
              onClick={() => {
                onReact(reaction.type);
                setShowReactions(false);
              }}
              className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-gray-100 transition-transform hover:scale-125"
              title={reaction.label}
            >
              <span className="text-lg">{reaction.emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
