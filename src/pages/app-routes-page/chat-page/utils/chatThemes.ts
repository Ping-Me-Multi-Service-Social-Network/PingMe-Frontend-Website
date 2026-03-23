export interface ChatTheme {
  name: string;
  backgroundImage?: string;
  header: {
    /** CSS style object for background */
    bgStyle: React.CSSProperties;
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
    /** CSS style object for sent bubble */
    sentBubbleStyle: React.CSSProperties;
    sentBubbleText: string;
    /** CSS style object for received bubble */
    receivedBubbleStyle: React.CSSProperties;
    receivedBubbleText: string;
    receivedBubbleBorder: string;
    avatarRing: string;
  };
  input: {
    borderColor: string;
    /** CSS style object for toolbar background */
    toolbarBgStyle: React.CSSProperties;
    /** CSS style object for send button */
    sendBtnStyle: React.CSSProperties;
    sendBtnHoverFilter: string;
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
      bgStyle: { background: "linear-gradient(to right, oklch(0.95 0.04 270), oklch(0.95 0.03 260))" },
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
      sentBubbleStyle: { background: "oklch(0.45 0.2 270)", color: "white" },
      sentBubbleText: "text-white",
      receivedBubbleStyle: { background: "oklch(0.95 0.04 270)" },
      receivedBubbleText: "text-foreground",
      receivedBubbleBorder: "border-purple-100/50",
      avatarRing: "ring-purple-100",
    },
    input: {
      borderColor: "border-gray-300 focus:border-purple-500 focus:ring-purple-500",
      toolbarBgStyle: { background: "oklch(0.97 0.02 270)" },
      sendBtnStyle: { background: "oklch(0.45 0.2 270)" },
      sendBtnHoverFilter: "brightness(1.1)",
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
    backgroundImage: "/chat-themes/ocean-waves-underwater-blue-cyan-pattern.webp",
    header: {
      bgStyle: { background: "linear-gradient(to right, oklch(0.95 0.04 240), oklch(0.95 0.04 195))" },
      textColor: "text-gray-900",
      avatarRing: "ring-blue-200",
      iconColor: "text-blue-600",
      iconHoverBg: "hover:bg-blue-100",
    },
    content: {
      background: "bg-white",
      systemMessageBg: "bg-blue-100",
      systemMessageText: "text-blue-700",
    },
    messages: {
      sentBubbleStyle: { background: "oklch(0.5 0.18 240)", color: "white" },
      sentBubbleText: "text-white",
      receivedBubbleStyle: { background: "oklch(0.95 0.04 240)" },
      receivedBubbleText: "text-foreground",
      receivedBubbleBorder: "border-blue-100/50",
      avatarRing: "ring-blue-100",
    },
    input: {
      borderColor: "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
      toolbarBgStyle: { background: "oklch(0.97 0.02 240)" },
      sendBtnStyle: { background: "oklch(0.5 0.18 240)" },
      sendBtnHoverFilter: "brightness(1.1)",
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
    backgroundImage: "/chat-themes/sunset-sky-orange-red-gradient-clouds.webp",
    header: {
      bgStyle: { background: "linear-gradient(to right, oklch(0.95 0.06 55), oklch(0.95 0.05 30))" },
      textColor: "text-gray-900",
      avatarRing: "ring-orange-200",
      iconColor: "text-orange-600",
      iconHoverBg: "hover:bg-orange-100",
    },
    content: {
      background: "bg-white",
      systemMessageBg: "bg-orange-100",
      systemMessageText: "text-orange-700",
    },
    messages: {
      sentBubbleStyle: { background: "oklch(0.6 0.18 55)", color: "white" },
      sentBubbleText: "text-white",
      receivedBubbleStyle: { background: "oklch(0.96 0.04 55)" },
      receivedBubbleText: "text-foreground",
      receivedBubbleBorder: "border-orange-100/50",
      avatarRing: "ring-orange-100",
    },
    input: {
      borderColor: "border-gray-300 focus:border-orange-500 focus:ring-orange-500",
      toolbarBgStyle: { background: "oklch(0.97 0.03 55)" },
      sendBtnStyle: { background: "oklch(0.6 0.18 55)" },
      sendBtnHoverFilter: "brightness(1.1)",
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
    backgroundImage: "/chat-themes/forest-trees-green-nature-leaves-pattern.webp",
    header: {
      bgStyle: { background: "linear-gradient(to right, oklch(0.95 0.06 145), oklch(0.95 0.05 165))" },
      textColor: "text-gray-900",
      avatarRing: "ring-green-200",
      iconColor: "text-green-600",
      iconHoverBg: "hover:bg-green-100",
    },
    content: {
      background: "bg-white",
      systemMessageBg: "bg-green-100",
      systemMessageText: "text-green-700",
    },
    messages: {
      sentBubbleStyle: { background: "oklch(0.55 0.18 145)", color: "white" },
      sentBubbleText: "text-white",
      receivedBubbleStyle: { background: "oklch(0.96 0.04 145)" },
      receivedBubbleText: "text-foreground",
      receivedBubbleBorder: "border-green-100/50",
      avatarRing: "ring-green-100",
    },
    input: {
      borderColor: "border-gray-300 focus:border-green-500 focus:ring-green-500",
      toolbarBgStyle: { background: "oklch(0.97 0.03 145)" },
      sendBtnStyle: { background: "oklch(0.55 0.18 145)" },
      sendBtnHoverFilter: "brightness(1.1)",
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
    backgroundImage: "/chat-themes/pink-rose-petals-soft-pastel-floral-pattern.webp",
    header: {
      bgStyle: { background: "linear-gradient(to right, oklch(0.95 0.06 350), oklch(0.95 0.05 10))" },
      textColor: "text-gray-900",
      avatarRing: "ring-pink-200",
      iconColor: "text-pink-600",
      iconHoverBg: "hover:bg-pink-100",
    },
    content: {
      background: "bg-white",
      systemMessageBg: "bg-pink-100",
      systemMessageText: "text-pink-700",
    },
    messages: {
      sentBubbleStyle: { background: "oklch(0.6 0.2 350)", color: "white" },
      sentBubbleText: "text-white",
      receivedBubbleStyle: { background: "oklch(0.96 0.04 350)" },
      receivedBubbleText: "text-foreground",
      receivedBubbleBorder: "border-pink-100/50",
      avatarRing: "ring-pink-100",
    },
    input: {
      borderColor: "border-gray-300 focus:border-pink-500 focus:ring-pink-500",
      toolbarBgStyle: { background: "oklch(0.97 0.03 350)" },
      sendBtnStyle: { background: "oklch(0.6 0.2 350)" },
      sendBtnHoverFilter: "brightness(1.1)",
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
    backgroundImage: "/chat-themes/dark-starry-night-sky-galaxy-pattern.webp",
    header: {
      bgStyle: { background: "oklch(0.2 0.02 270)" },
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
      sentBubbleStyle: { background: "oklch(0.35 0.04 270)", color: "white" },
      sentBubbleText: "text-white",
      receivedBubbleStyle: { background: "oklch(0.22 0.02 270)", color: "oklch(0.9 0.01 270)" },
      receivedBubbleText: "text-gray-100",
      receivedBubbleBorder: "border-gray-700",
      avatarRing: "ring-gray-700",
    },
    input: {
      borderColor: "border-gray-600 focus:border-gray-500 focus:ring-gray-500",
      toolbarBgStyle: { background: "oklch(0.2 0.02 270)" },
      sendBtnStyle: { background: "oklch(0.4 0.04 270)" },
      sendBtnHoverFilter: "brightness(1.2)",
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
