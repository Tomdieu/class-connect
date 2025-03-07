"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FileText,
  Video,
  FileCode,
  GraduationCap,
  FileQuestion,
} from "lucide-react";

type ResourceMenuProps = {
  onPDFClick: () => void;
  onVideoClick: () => void;
  onExerciseClick: () => void;
  onRevisionClick: () => void;
};

const menuVariants = {
  initial: { opacity: 0, scale: 0.95, y: -20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -20,
    transition: { duration: 0.15 },
  },
};

const itemVariants = {
  initial: { opacity: 0, x: -20 },
  animate: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.2,
    },
  }),
  hover: {
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
  },
};

const ResourceMenu: React.FC<ResourceMenuProps> = ({
  onPDFClick,
  onVideoClick,
  onExerciseClick,
  onRevisionClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: <FileText className="h-5 w-5 text-red-500" />,
      label: "PDF",
      onClick: onPDFClick,
    },
    {
      icon: <Video className="h-5 w-5 text-blue-500" />,
      label: "Video",
      onClick: onVideoClick,
    },
    {
      icon: <FileCode className="h-5 w-5 text-orange-500" />,
      label: "Exercise",
      onClick: onExerciseClick,
    },
    {
      icon: <GraduationCap className="h-5 w-5 text-green-500" />,
      label: "Revision",
      onClick: onRevisionClick,
    },
    // {
    //   icon: <FileQuestion className="h-5 w-5 text-purple-500" />,
    //   label: "Quiz",
    //   onClick: onQuizClick,
    // },
  ];

  const handleItemClick = (callback: () => void) => {
    setIsOpen(false);
    if (callback) {
      setTimeout(() => {
        callback();
      }, 200);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-muted-foreground select-none cursor-pointer shadow-lg p-3 rounded-full hover:bg-gray-100"
      >
        <Plus className="h-5 w-5" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-30"
            />

            <motion.div
              variants={menuVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="absolute right-0 mt-2 w-36 rounded-lg bg-white shadow-xl z-40 overflow-hidden py-1"
            >
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  custom={index}
                  variants={itemVariants}
                  initial="initial"
                  animate="animate"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleItemClick(item.onClick)}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer"
                >
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ResourceMenu;
