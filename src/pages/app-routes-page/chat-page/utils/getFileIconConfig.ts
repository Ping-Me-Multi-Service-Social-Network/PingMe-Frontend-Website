import {
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileAudio,
  FileCode,
  File,
  type LucideIcon,
} from "lucide-react";

export interface FileIconConfig {
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
}

export const getFileIconConfig = (fileName: string): FileIconConfig => {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  switch (ext) {
    case "pdf":
      return { icon: FileText, bgColor: "bg-red-500", textColor: "text-red-500" };
    case "doc":
    case "docx":
      return { icon: FileText, bgColor: "bg-blue-600", textColor: "text-blue-600" };
    case "xls":
    case "xlsx":
    case "csv":
      return { icon: FileSpreadsheet, bgColor: "bg-emerald-600", textColor: "text-emerald-600" };
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return { icon: FileArchive, bgColor: "bg-amber-500", textColor: "text-amber-500" };
    case "mp3":
    case "wav":
    case "m4a":
    case "ogg":
      return { icon: FileAudio, bgColor: "bg-violet-500", textColor: "text-violet-500" };
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "html":
    case "css":
    case "json":
      return { icon: FileCode, bgColor: "bg-slate-700", textColor: "text-slate-700" };
    case "txt":
      return { icon: FileText, bgColor: "bg-gray-500", textColor: "text-gray-500" };
    default:
      return { icon: File, bgColor: "bg-indigo-500", textColor: "text-indigo-500" };
  }
};
