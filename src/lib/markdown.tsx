import ReactMarkdown from "react-markdown";
import { resolvePublicAssetUrl } from "@/lib/site-url";

type Props = {
  content: string;
  className?: string;
};

export function MarkdownContent({ content, className }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          h1: ({ children }) => <h1 className="text-2xl font-semibold mt-6 mb-3">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xl font-semibold mt-5 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-lg font-medium mt-4 mb-2">{children}</h3>,
          p: ({ children }) => <p className="mb-3 leading-relaxed text-muted-foreground">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1 text-muted-foreground">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1 text-muted-foreground">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          a: ({ href, children }) => {
            const resolved = href ? (resolvePublicAssetUrl(href) ?? href) : href;
            return (
              <a href={resolved} className="text-foreground underline underline-offset-2" target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
