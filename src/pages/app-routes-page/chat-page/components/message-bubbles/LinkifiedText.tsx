import { Fragment } from "react";
import { useNavigate } from "react-router-dom";

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

const URL_REGEX = /(https?:\/\/[^\s]+)/gi;

export default function LinkifiedText({ text, className }: LinkifiedTextProps) {
  const navigate = useNavigate();
  const parts = text.split(URL_REGEX);

  const handleLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, rawUrl: string) => {
    if (event.defaultPrevented) return;
    if (event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    try {
      const target = new URL(rawUrl, window.location.origin);
      if (target.origin === window.location.origin) {
        event.preventDefault();
        navigate(`${target.pathname}${target.search}${target.hash}`);
      }
    } catch {
      // Ignore invalid URL and let browser handle default anchor behavior.
    }
  };

  return (
    <p className={className} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
      {parts.map((part, index) => {
        if (part.match(URL_REGEX)) {
          return (
            <a
              key={`${part}-${index}`}
              href={part}
              onClick={(event) => handleLinkClick(event, part)}
              className="underline underline-offset-2 break-all text-inherit opacity-95 hover:opacity-80"
            >
              {part}
            </a>
          );
        }

        return <Fragment key={`${part}-${index}`}>{part}</Fragment>;
      })}
    </p>
  );
}
