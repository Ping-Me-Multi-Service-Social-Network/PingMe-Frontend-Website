export interface ChatTheme {
  name: string;
  backgroundImage?: string;
  header: {
    background: string;
    textColor: string;
    avatarRing: string;
    iconColor: string;
    iconHoverBg: string;
  };
  content: {
    background: string;
    systemMessageBg: string;
    systemMessageText: string;
  };
  messages: {
    sentBubbleBg: string;
    sentBubbleText: string;
    receivedBubbleBg: string;
    receivedBubbleText: string;
    receivedBubbleBorder: string;
    avatarRing: string;
  };
  input: {
    borderColor: string;
    background: string;
    buttonBg: string;
    buttonHover: string;
    buttonText: string;
    iconColor: string;
    iconHoverColor: string;
    iconHoverBg: string;
    attachmentBorder: string;
  };
  sidebar: {
    background: string;
    headerBg: string;
    headerText: string;
    borderColor: string;
    cardBg: string;
    cardBorder: string;
    cardHoverBg: string;
    buttonBorder: string;
    buttonHoverBg: string;
    iconColor: string;
    textPrimary: string;
    textSecondary: string;
  };
}

export const chatThemes: Record<string, ChatTheme> = {
  DEFAULT: {
    name: "Mặc định (Tím)",
    backgroundImage: "",
    header: {
      background: "bg-gradient-to-r from-purple-50 to-blue-50",
      textColor: "text-gray-900",
      avatarRing: "ring-purple-200",
      iconColor: "text-purple-600",
      iconHoverBg: "hover:bg-purple-100",
    },
    content: {
      background: "bg-white",
      systemMessageBg: "bg-gray-100",
      systemMessageText: "text-gray-600",
    },
    messages: {
      sentBubbleBg: "bg-gradient-to-r from-purple-500 to-purple-600",
      sentBubbleText: "text-white",
      receivedBubbleBg: "bg-gradient-to-r from-purple-50 to-pink-50",
      receivedBubbleText: "text-foreground",
      receivedBubbleBorder: "border-purple-100/50",
      avatarRing: "ring-purple-100",
    },
    input: {
      borderColor:
        "border-gray-300 focus:border-purple-500 focus:ring-purple-500",
      background: "bg-gradient-to-r from-gray-50 to-purple-50",
      buttonBg: "bg-gradient-to-r from-purple-600 to-purple-700",
      buttonHover: "hover:from-purple-700 hover:to-purple-800",
      buttonText: "text-white",
      iconColor: "text-gray-600",
      iconHoverColor: "hover:text-purple-600",
      iconHoverBg: "hover:bg-purple-100",
      attachmentBorder: "border-purple-200",
    },
    sidebar: {
      background: "bg-gray-50",
      headerBg: "bg-white",
      headerText: "text-gray-900",
      borderColor: "border-gray-200",
      cardBg: "bg-white",
      cardBorder: "border-gray-200",
      cardHoverBg: "hover:bg-purple-50",
      buttonBorder: "border-gray-200",
      buttonHoverBg: "hover:bg-purple-50",
      iconColor: "text-purple-600",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-500",
    },
  },
  OCEAN: {
    name: "Đại dương (Xanh dương)",
    backgroundImage:
      "/chat-themes/ocean-waves-underwater-blue-cyan-pattern.jpg",
    header: {
      background: "bg-gradient-to-r from-blue-50 to-cyan-50",
      textColor: "text-gray-900",
      avatarRing: "ring-blue-200",
      iconColor: "text-blue-600",
      iconHoverBg: "hover:bg-blue-100",
    },
    content: {
      background: "bg-gradient-to-b from-blue-50/30 to-cyan-50/30",
      systemMessageBg: "bg-blue-100",
      systemMessageText: "text-blue-700",
    },
    messages: {
      sentBubbleBg: "bg-gradient-to-r from-blue-500 to-blue-600",
      sentBubbleText: "text-white",
      receivedBubbleBg: "bg-gradient-to-r from-blue-50 to-cyan-50",
      receivedBubbleText: "text-foreground",
      receivedBubbleBorder: "border-blue-100/50",
      avatarRing: "ring-blue-100",
    },
    input: {
      borderColor: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      background: "bg-gradient-to-r from-blue-50 to-cyan-50",
      buttonBg: "bg-gradient-to-r from-blue-500 to-blue-600",
      buttonHover: "hover:from-blue-600 hover:to-blue-700",
      buttonText: "text-white",
      iconColor: "text-gray-600",
      iconHoverColor: "hover:text-blue-600",
      iconHoverBg: "hover:bg-blue-100",
      attachmentBorder: "border-blue-200",
    },
    sidebar: {
      background: "bg-gray-50",
      headerBg: "bg-white",
      headerText: "text-gray-900",
      borderColor: "border-gray-200",
      cardBg: "bg-white",
      cardBorder: "border-gray-200",
      cardHoverBg: "hover:bg-blue-50",
      buttonBorder: "border-gray-200",
      buttonHoverBg: "hover:bg-blue-50",
      iconColor: "text-blue-600",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-500",
    },
  },
  SUNSET: {
    name: "Hoàng hôn (Cam)",
    backgroundImage: "/chat-themes/sunset-sky-orange-red-gradient-clouds.jpg",
    header: {
      background: "bg-gradient-to-r from-orange-50 to-red-50",
      textColor: "text-gray-900",
      avatarRing: "ring-orange-200",
      iconColor: "text-orange-600",
      iconHoverBg: "hover:bg-orange-100",
    },
    content: {
      background: "bg-gradient-to-b from-orange-50/30 to-red-50/30",
      systemMessageBg: "bg-orange-100",
      systemMessageText: "text-orange-700",
    },
    messages: {
      sentBubbleBg: "bg-gradient-to-r from-orange-500 to-orange-600",
      sentBubbleText: "text-white",
      receivedBubbleBg: "bg-gradient-to-r from-orange-50 to-red-50",
      receivedBubbleText: "text-foreground",
      receivedBubbleBorder: "border-orange-100/50",
      avatarRing: "ring-orange-100",
    },
    input: {
      borderColor:
        "border-gray-300 focus:border-orange-500 focus:ring-orange-500",
      background: "bg-gradient-to-r from-orange-50 to-red-50",
      buttonBg: "bg-gradient-to-r from-orange-500 to-orange-600",
      buttonHover: "hover:from-orange-600 hover:to-orange-700",
      buttonText: "text-white",
      iconColor: "text-gray-600",
      iconHoverColor: "hover:text-orange-600",
      iconHoverBg: "hover:bg-orange-100",
      attachmentBorder: "border-orange-200",
    },
    sidebar: {
      background: "bg-gray-50",
      headerBg: "bg-white",
      headerText: "text-gray-900",
      borderColor: "border-gray-200",
      cardBg: "bg-white",
      cardBorder: "border-gray-200",
      cardHoverBg: "hover:bg-orange-50",
      buttonBorder: "border-gray-200",
      buttonHoverBg: "hover:bg-orange-50",
      iconColor: "text-orange-600",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-500",
    },
  },
  FOREST: {
    name: "Rừng xanh",
    backgroundImage:
      "/chat-themes/forest-trees-green-nature-leaves-pattern.jpg",
    header: {
      background: "bg-gradient-to-r from-green-50 to-emerald-50",
      textColor: "text-gray-900",
      avatarRing: "ring-green-200",
      iconColor: "text-green-600",
      iconHoverBg: "hover:bg-green-100",
    },
    content: {
      background: "bg-gradient-to-b from-green-50/30 to-emerald-50/30",
      systemMessageBg: "bg-green-100",
      systemMessageText: "text-green-700",
    },
    messages: {
      sentBubbleBg: "bg-gradient-to-r from-green-500 to-green-600",
      sentBubbleText: "text-white",
      receivedBubbleBg: "bg-gradient-to-r from-green-50 to-emerald-50",
      receivedBubbleText: "text-foreground",
      receivedBubbleBorder: "border-green-100/50",
      avatarRing: "ring-green-100",
    },
    input: {
      borderColor:
        "border-gray-300 focus:border-green-500 focus:ring-green-500",
      background: "bg-gradient-to-r from-green-50 to-emerald-50",
      buttonBg: "bg-gradient-to-r from-green-500 to-green-600",
      buttonHover: "hover:from-green-600 hover:to-green-700",
      buttonText: "text-white",
      iconColor: "text-gray-600",
      iconHoverColor: "hover:text-green-600",
      iconHoverBg: "hover:bg-green-100",
      attachmentBorder: "border-green-200",
    },
    sidebar: {
      background: "bg-gray-50",
      headerBg: "bg-white",
      headerText: "text-gray-900",
      borderColor: "border-gray-200",
      cardBg: "bg-white",
      cardBorder: "border-gray-200",
      cardHoverBg: "hover:bg-green-50",
      buttonBorder: "border-gray-200",
      buttonHoverBg: "hover:bg-green-50",
      iconColor: "text-green-600",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-500",
    },
  },
  ROSE: {
    name: "Hồng pastel",
    backgroundImage:
      "/chat-themes/pink-rose-petals-soft-pastel-floral-pattern.jpg",
    header: {
      background: "bg-gradient-to-r from-pink-50 to-rose-50",
      textColor: "text-gray-900",
      avatarRing: "ring-pink-200",
      iconColor: "text-pink-600",
      iconHoverBg: "hover:bg-pink-100",
    },
    content: {
      background: "bg-gradient-to-b from-pink-50/30 to-rose-50/30",
      systemMessageBg: "bg-pink-100",
      systemMessageText: "text-pink-700",
    },
    messages: {
      sentBubbleBg: "bg-gradient-to-r from-pink-500 to-pink-600",
      sentBubbleText: "text-white",
      receivedBubbleBg: "bg-gradient-to-r from-pink-50 to-rose-50",
      receivedBubbleText: "text-foreground",
      receivedBubbleBorder: "border-pink-100/50",
      avatarRing: "ring-pink-100",
    },
    input: {
      borderColor: "border-gray-300 focus:border-pink-500 focus:ring-pink-500",
      background: "bg-gradient-to-r from-pink-50 to-rose-50",
      buttonBg: "bg-gradient-to-r from-pink-500 to-pink-600",
      buttonHover: "hover:from-pink-600 hover:to-pink-700",
      buttonText: "text-white",
      iconColor: "text-gray-600",
      iconHoverColor: "hover:text-pink-600",
      iconHoverBg: "hover:bg-pink-100",
      attachmentBorder: "border-pink-200",
    },
    sidebar: {
      background: "bg-gray-50",
      headerBg: "bg-white",
      headerText: "text-gray-900",
      borderColor: "border-gray-200",
      cardBg: "bg-white",
      cardBorder: "border-gray-200",
      cardHoverBg: "hover:bg-pink-50",
      buttonBorder: "border-gray-200",
      buttonHoverBg: "hover:bg-pink-50",
      iconColor: "text-pink-600",
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-500",
    },
  },
  DARK: {
    name: "Tối",
    backgroundImage: "/chat-themes/dark-starry-night-sky-galaxy-pattern.jpg",
    header: {
      background: "bg-gradient-to-r from-gray-800 to-gray-900",
      textColor: "text-white",
      avatarRing: "ring-gray-600",
      iconColor: "text-gray-300",
      iconHoverBg: "hover:bg-gray-700",
    },
    content: {
      background: "bg-gray-900",
      systemMessageBg: "bg-gray-700",
      systemMessageText: "text-gray-200",
    },
    messages: {
      sentBubbleBg: "bg-gradient-to-r from-gray-600 to-gray-700",
      sentBubbleText: "text-white",
      receivedBubbleBg: "bg-gray-800",
      receivedBubbleText: "text-gray-100",
      receivedBubbleBorder: "border-gray-700",
      avatarRing: "ring-gray-700",
    },
    input: {
      borderColor: "border-gray-600 focus:border-gray-500 focus:ring-gray-500",
      background: "bg-gray-800",
      buttonBg: "bg-gray-600",
      buttonHover: "hover:bg-gray-500",
      buttonText: "text-white",
      iconColor: "text-gray-400",
      iconHoverColor: "hover:text-gray-200",
      iconHoverBg: "hover:bg-gray-700",
      attachmentBorder: "border-gray-600",
    },
    sidebar: {
      background: "bg-gray-900",
      headerBg: "bg-gray-800",
      headerText: "text-white",
      borderColor: "border-gray-700",
      cardBg: "bg-gray-800",
      cardBorder: "border-gray-700",
      cardHoverBg: "hover:bg-gray-700",
      buttonBorder: "border-gray-600",
      buttonHoverBg: "hover:bg-gray-700",
      iconColor: "text-gray-300",
      textPrimary: "text-white",
      textSecondary: "text-gray-400",
    },
  },
};

export const getTheme = (themeName?: string | null): ChatTheme => {
  if (!themeName || !chatThemes[themeName]) {
    return chatThemes.DEFAULT;
  }
  return chatThemes[themeName];
};
