import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import Heading from "@/components/ui/Heading";
import Text from "@/components/ui/Text";
import type { NewsBlock } from "@/lib/data/news";

interface ArticleBodyProps {
  blocks: NewsBlock[];
}

const STAGGER_STEP_MS = 40;
const STAGGER_CAP_MS = 320;

/** A `listLead` immediately followed by `list` renders as one visual group (20px apart) inside the 60px block rhythm. */
function groupBlocks(blocks: NewsBlock[]): NewsBlock[][] {
  const groups: NewsBlock[][] = [];
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const next = blocks[i + 1];
    if (block.type === "listLead" && next?.type === "list") {
      groups.push([block, next]);
      i++;
    } else {
      groups.push([block]);
    }
  }
  return groups;
}

function renderBlock(block: NewsBlock, key: string) {
  switch (block.type) {
    case "heading":
      return (
        <Heading key={key} level={2} size="h4" className="text-neutral-1">
          {block.text}
        </Heading>
      );
    case "paragraph":
      return (
        <Text key={key} size="p2" className="text-neutral-3">
          {block.text}
        </Text>
      );
    case "listLead":
      return (
        <Text key={key} size="p2" weight="medium" className="text-neutral-1">
          {block.text}
        </Text>
      );
    case "list":
      return (
        <ul key={key} className="flex flex-col gap-12">
          {block.items.map((item, index) => (
            <li key={index} className="flex items-start gap-12">
              <span aria-hidden="true" className="mt-10 size-6 shrink-0 rounded-full bg-neutral-9" />
              <Text size="p2" className="text-neutral-3">
                {item}
              </Text>
            </li>
          ))}
        </ul>
      );
    case "image":
      return (
        <div key={key} className="relative aspect-[820/460] w-full overflow-hidden rounded-16 bg-neutral-2">
          <Image
            src={block.src}
            alt={block.alt}
            fill
            sizes="(min-width: 1024px) 820px, 100vw"
            className="object-cover"
          />
        </div>
      );
  }
}

export default function ArticleBody({ blocks }: ArticleBodyProps) {
  const groups = groupBlocks(blocks);

  return (
    <div className="mx-auto flex w-full max-w-820 flex-col gap-60">
      {groups.map((group, index) => {
        const delay = Math.min(index * STAGGER_STEP_MS, STAGGER_CAP_MS);
        const isImageGroup = group[0].type === "image";
        return (
          <Reveal
            key={index}
            as="div"
            variant={isImageGroup ? "scale" : "up"}
            delay={delay}
            className="flex flex-col gap-20"
          >
            {group.map((block, blockIndex) => renderBlock(block, `${index}-${blockIndex}`))}
          </Reveal>
        );
      })}
    </div>
  );
}
