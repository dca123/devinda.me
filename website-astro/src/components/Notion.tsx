import type {
  RichTextItemResponse,
  TextRichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { clsx } from "clsx";
import type { Content } from "../lib/notionExtracter";
import { twMerge } from "tailwind-merge";
import shiki, { getHighlighter } from "shiki";

const NotionColorMap: Record<
  TextRichTextItemResponse["annotations"]["color"],
  string
> = {
  blue: "text-blue-500",
  blue_background: "bg-blue-500",
  brown: "text-amber-500",
  brown_background: "bg-amber-500",
  gray: "text-gray-500",
  gray_background: "bg-gray-500",
  green: "text-green-500",
  green_background: "bg-green-500",
  orange: "text-orange-500",
  orange_background: "bg-orange-500",
  pink: "text-pink-500",
  pink_background: "bg-pink-500",
  purple: "text-purple-500",
  purple_background: "bg-purple-500",
  red: "text-red-500",
  red_background: "bg-red-500",
  yellow: "text-yellow-500",
  yellow_background: "bg-yellow-500",
  default: "",
};

const RichTextSpan = ({
  content,
}: {
  content: Array<RichTextItemResponse>;
}) => {
  const blocks = content.map((text) => {
    const {
      bold,
      color: notionColor,
      italic,
      code,
      strikethrough,
      underline,
    } = text.annotations;
    const color = NotionColorMap[notionColor];
    const Block = ({ className }: { className?: string }) => (
      <span
        key={text.plain_text}
        className={twMerge(
          clsx(
            bold && "font-extrabold",
            italic && "italic",
            color,
            code && "bg-gray-700 text-red-300 px-1 rounded font-mono text-sm",
            strikethrough && "line-through",
            underline && "underline",
            "leading-relaxed",
            className,
          ),
        )}
      >
        {text.plain_text}
      </span>
    );

    if (text.href !== null)
      return (
        <a href={text.href}>
          <Block className="underline" />
        </a>
      );
    return <Block />;
  });

  return <>{blocks}</>;
};

const highlighter = await getHighlighter({
  theme: "github-dark",
});

export default function Notion({ blocks }: { blocks: Content }) {
  return blocks.map((block) => {
    switch (block.type) {
      case "paragraph":
        return (
          <p className="pt-1">{RichTextSpan({ content: block.content })}</p>
        );
      case "heading_1":
        return (
          <h1 className="text-3xl font-medium font-title pt-5 tracking-wider">
            <RichTextSpan content={block.content} />
          </h1>
        );
      case "heading_2":
        return (
          <h2 className="text-2xl font-normal font-title pt-4 tracking-wide">
            <RichTextSpan content={block.content} />
          </h2>
        );
      case "heading_3":
        return (
          <h3 className="text-xl font-light font-title pt-2">
            <RichTextSpan content={block.content} />
          </h3>
        );
      case "bulleted_list_item":
        return (
          <ul className="list-disc list-inside ">
            {block.content.map((content, idx) => (
              <li key={idx}>
                <RichTextSpan content={content} />
              </li>
            ))}
          </ul>
        );
      case "numbered_list_item":
        return (
          <ol className="list-decimal list-inside space-y-2">
            {block.content.map((content, idx) => (
              <li key={idx}>
                <span className="pl-1">
                  <RichTextSpan content={content} />
                </span>
              </li>
            ))}
          </ol>
        );
      case "code":
        let lang = block.language;
        if (lang === "typescript") lang = "tsx";
        if (lang === "javascript") lang = "jsx";

        const code = highlighter.codeToThemedTokens(
          block.content[0].plain_text,
          lang,
        );
        const html = shiki.renderToHtml(code, {
          bg: highlighter.getBackgroundColor("github-dark"),
          fg: highlighter.getForegroundColor("github-dark"),
          elements: {
            pre(props) {
              return `<pre class="${props.className} p-4 rounded overflow-x-auto text-sm" style="${props.style}">${props.children}</pre>`;
            },
          },
        });

        return <div dangerouslySetInnerHTML={{ __html: html }} />;
      case "image":
        return (
          <figure className="w-full space-y-1">
            <img
              {...block.content.transformedImage.attributes}
              src={block.content.transformedImage.src}
              className="w-full md:w-2/3 object-contain rounded mx-auto"
            />
            <figcaption className="text-center text-sm">
              <RichTextSpan content={block.content.caption} />
            </figcaption>
          </figure>
        );
      case "quote":
        return (
          <blockquote className="bg-gray-800 rounded p-5 font-medium">
            <RichTextSpan content={block.content} />
          </blockquote>
        );
      case "callout":
        return (
          <aside className="bg-card rounded p-5 ">
            <RichTextSpan content={block.content} />
          </aside>
        );
      case "to_do":
        return (
          <div>
            <input
              type="checkbox"
              className="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />{" "}
            <RichTextSpan content={block.content} />
          </div>
        );
      default:
        return (
          <h1 className="text-red-400">Missing {block.content} block here</h1>
        );
    }
  });
}
