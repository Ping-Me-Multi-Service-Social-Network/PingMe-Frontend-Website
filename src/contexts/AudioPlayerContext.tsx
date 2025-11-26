"use client";

import { createContext } from "react";
import type { AudioPlayerContextType } from "./audioPlayerTypes";

export const AudioPlayerContext = createContext<
  AudioPlayerContextType | undefined
>(undefined);
