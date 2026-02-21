import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { AIMessage } from "@/types/ai/aiMessage";
import { useState, useCallback } from "react";

interface MessageBubbleProps {
  message: AIMessage;
  animate?: boolean;
}

export default function MessageBubble({
  message,
  animate,
}: MessageBubbleProps) {
  const isSent = message.type === "SENT";

  return (
    <div
      className={`flex ${isSent ? "justify-end" : "justify-start"} ${animate ? "msg-enter" : ""}`}
    >
      <div
        className={`flex items-end gap-2 ${isSent ? "max-w-[75%] flex-row-reverse" : "max-w-[90%]"}`}
      >
        {/* AI Avatar */}
        {!isSent && (
          <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2a4 4 0 0 1 4 4v2a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
              <path d="M9 14h6" />
              <path d="M12 14v8" />
              <path d="M8 22h8" />
              <circle cx="9" cy="6" r="1" fill="white" />
              <circle cx="15" cy="6" r="1" fill="white" />
            </svg>
          </div>
        )}

        {/* Bubble */}
        <div
          className={`rounded-2xl px-4 py-2.5 shadow-sm ${
            isSent
              ? "bg-linear-to-r from-violet-500 to-purple-600 text-white rounded-br-sm"
              : "bg-white text-gray-800 border border-gray-100 rounded-bl-sm"
          }`}
        >
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments.map((att) => (
                <button
                  key={att.url}
                  type="button"
                  onClick={() => window.open(att.url, "_blank")}
                  className="appearance-none bg-transparent border-none p-0 cursor-pointer"
                >
                  <img
                    src={att.url}
                    alt="attachment"
                    className="msg-attachment-img"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Text content */}
          {isSent ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
              {message.content}
            </p>
          ) : (
            <div className="ai-markdown text-sm leading-relaxed wrap-break-word">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const codeString = String(children).replace(/\n$/, "");

                    if (match) {
                      return (
                        <div className="ai-code-block">
                          <CodeBlockHeader
                            language={match[1]}
                            code={codeString}
                          />
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: "0 0 8px 8px",
                              fontSize: "13px",
                            }}
                          >
                            {codeString}
                          </SyntaxHighlighter>
                        </div>
                      );
                    }

                    return (
                      <code className="ai-inline-code" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Timestamp */}
          <p
            className={`text-[10px] mt-1 ${
              isSent ? "text-violet-200" : "text-gray-400"
            } text-right`}
          >
            {message.createdAt
              ? new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Small header bar above code blocks with language label + copy button */
function CodeBlockHeader({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="ai-code-header">
      <span className="ai-code-lang">{language}</span>
      <button onClick={handleCopy} className="ai-code-copy-btn">
        {copied ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Đã sao chép
          </>
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            Sao chép
          </>
        )}
      </button>
    </div>
  );
}
