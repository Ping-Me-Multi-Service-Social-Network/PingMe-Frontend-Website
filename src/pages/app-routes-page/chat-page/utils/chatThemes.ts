import type { CSSProperties } from "react";

export interface ChatTheme {
  name: string;
  backgroundImage?: string;
  header: {
    /** CSS style object for background */
    bgStyle: CSSProperties;
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
    sentBubbleStyle: CSSProperties;
    sentBubbleText: string;
    /** CSS style object for received bubble */
    receivedBubbleStyle: CSSProperties;
    receivedBubbleText: string;
    receivedBubbleBorder: string;
    avatarRing: string;
  };
  input: {
    borderColor: string;
    /** CSS style object for toolbar background */
    toolbarBgStyle: CSSProperties;
    /** CSS style object for send button */
    sendBtnStyle: CSSProperties;
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

/**
 * Helper to create a theme with common patterns to reduce code duplication
 */
const createTheme = (params: {
  name: string;
  backgroundImage?: string;
  color: string;
  h1: number;
  h2: number;
  sentL: number;
  sentC?: number;
  buttonL?: number;
  buttonC?: number;
  hInput?: number;
  toolbarC?: number;
  receivedBg?: string;
  receivedShadow?: string;
  receivedBorder?: string;
  receivedRing?: string;
  systemBg?: string;
  systemText?: string;
  headerC1?: number;
  headerC2?: number;
}): ChatTheme => {
  const {
    name,
    backgroundImage = "",
    color,
    h1,
    h2,
    sentL,
    sentC = 0.18,
    buttonL = sentL,
    buttonC = sentC,
    hInput = h1,
    toolbarC = 0.03,
    receivedBg = `oklch(0.96 0.04 ${h1})`,
    receivedShadow = "none",
    receivedBorder = `border-${color}-100/50`,
    receivedRing = `ring-${color}-100`,
    systemBg = `bg-${color}-100`,
    systemText = `text-${color}-700`,
    headerC1 = 0.04,
    headerC2 = 0.05,
  } = params;

  return {
    name,
    backgroundImage,
    header: {
      bgStyle: { background: `linear-gradient(to right, oklch(0.95 ${headerC1} ${h1}), oklch(0.95 ${headerC2} ${h2}))` },
      textColor: "text-gray-900",
      avatarRing: `ring-${color}-200`,
      iconColor: `text-${color}-600`,
      iconHoverBg: `hover:bg-${color}-100`,
    },
    content: {
      background: "bg-white",
      systemMessageBg: systemBg,
      systemMessageText: systemText,
    },
    messages: {
      sentBubbleStyle: { background: `oklch(${sentL} ${sentC} ${h1})`, color: "white" },
      sentBubbleText: "text-white",
      receivedBubbleStyle: { background: receivedBg, boxShadow: receivedShadow },
      receivedBubbleText: "text-foreground",
      receivedBubbleBorder: receivedBorder,
      avatarRing: receivedRing,
    },
    input: {
      borderColor: `border-gray-300 focus:border-${color}-500 focus:ring-${color}-500`,
      toolbarBgStyle: { background: `oklch(0.97 ${toolbarC} ${hInput})` },
      sendBtnStyle: { background: `oklch(${buttonL} ${buttonC} ${h1})` },
      sendBtnHoverFilter: "brightness(1.1)",
      buttonText: "text-white",
      iconColor: "text-gray-600",
      iconHoverColor: `hover:text-${color}-600`,
      iconHoverBg: `hover:bg-${color}-100`,
      attachmentBorder: `border-${color}-200`,
    },
    sidebar: {
      background: "bg-gray-50",
      headerBg: "bg-white",
      headerText: "text-gray-900",
      borderColor: "border-gray-200",
      cardBg: "bg-white",
      cardBorder: "border-gray-200",
      cardHoverBg: `hover:bg-${color}-50`,
      buttonBorder: "border-gray-200",
      buttonHoverBg: `hover:bg-${color}-50`,
      iconColor: `text-${color}-600`,
      textPrimary: "text-gray-900",
      textSecondary: "text-gray-500",
    },
  };
};

export const chatThemes: Record<string, ChatTheme> = {
  DEFAULT: createTheme({
    name: "Mặc định (Tím)",
    color: "purple",
    h1: 292,
    h2: 282,
    sentL: 0.55,
    sentC: 0.2,
    buttonL: 0.45,
    headerC2: 0.03,
    systemBg: "bg-gray-200/50",
    systemText: "text-gray-500",
    receivedBg: "white",
    receivedShadow: "0 1px 2px rgba(0,0,0,0.05)",
    receivedBorder: "border-transparent",
    receivedRing: "ring-transparent",
    toolbarC: 0.02,
  }),
  OCEAN: createTheme({
    name: "Đại dương (Xanh dương)",
    backgroundImage: "/chat-themes/ocean-waves-underwater-blue-cyan-pattern.webp",
    color: "blue",
    h1: 285,
    h2: 195,
    sentL: 0.5,
    receivedBg: "oklch(0.95 0.04 285)",
    toolbarC: 0.02,
    headerC2: 0.04,
  }),
  SUNSET: createTheme({
    name: "Hoàng hôn (Cam)",
    backgroundImage: "/chat-themes/sunset-sky-orange-red-gradient-clouds.webp",
    color: "orange",
    h1: 55,
    h2: 30,
    sentL: 0.6,
    headerC1: 0.06,
  }),
  FOREST: createTheme({
    name: "Rừng xanh",
    backgroundImage: "/chat-themes/forest-trees-green-nature-leaves-pattern.webp",
    color: "green",
    h1: 145,
    h2: 165,
    sentL: 0.55,
    headerC1: 0.06,
  }),
  ROSE: createTheme({
    name: "Hồng pastel",
    backgroundImage: "/chat-themes/pink-rose-petals-soft-pastel-floral-pattern.webp",
    color: "pink",
    h1: 350,
    h2: 10,
    sentL: 0.6,
    sentC: 0.2,
    headerC1: 0.06,
  }),
};

export const getTheme = (themeName?: string | null): ChatTheme => {
  if (!themeName || !chatThemes[themeName]) {
    return chatThemes.DEFAULT;
  }
  return chatThemes[themeName];
};
