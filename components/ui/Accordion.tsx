"use client";

import {
  Fragment,
  useId,
  useRef,
  useState,
  type ElementType,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ChevronRight } from "@/components/icons/ChevronRight";
import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  icon?: ReactNode;
  label: ReactNode;
  /** Omit (or leave undefined) to render the trigger as present but not expandable. */
  panel?: ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpenId?: string;
  /** Heading level wrapping each trigger button. Defaults to h3. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  itemClassName?: string;
  triggerClassName?: string;
  labelClassName?: string;
  panelClassName?: string;
  chevronClassName?: string;
  /** Wrap each rendered item (e.g. to add a per-item scroll-reveal). Receives the fully-built item node. */
  renderItem?: (node: ReactNode, item: AccordionItem, index: number) => ReactNode;
  /** Swap the trailing ChevronRight for a custom control (e.g. a plus/minus). */
  indicator?: (isOpen: boolean) => ReactNode;
}

export default function Accordion({
  items,
  defaultOpenId,
  headingLevel = 3,
  className,
  itemClassName,
  triggerClassName,
  labelClassName,
  panelClassName,
  chevronClassName,
  renderItem,
  indicator,
}: AccordionProps) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const baseId = useId();
  const HeadingTag = `h${headingLevel}` as ElementType;

  const enabledIds = items.filter((item) => !item.disabled && item.panel != null).map((item) => item.id);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, id: string) => {
    const index = enabledIds.indexOf(id);
    if (index === -1) return;

    let nextIndex: number | null = null;
    if (event.key === "ArrowDown") nextIndex = (index + 1) % enabledIds.length;
    else if (event.key === "ArrowUp") nextIndex = (index - 1 + enabledIds.length) % enabledIds.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = enabledIds.length - 1;
    else return;

    event.preventDefault();
    triggerRefs.current[enabledIds[nextIndex]]?.focus();
  };

  return (
    <div className={cn("flex w-full flex-col", className)}>
      {items.map((item, index) => {
        const isOpen = openId === item.id;
        const hasPanel = item.panel != null && !item.disabled;
        const triggerId = `${baseId}-trigger-${item.id}`;
        const panelId = `${baseId}-panel-${item.id}`;

        const itemNode = (
          <div className={itemClassName}>
            <HeadingTag className="m-0">
              <button
                ref={(node) => {
                  triggerRefs.current[item.id] = node;
                }}
                type="button"
                id={triggerId}
                aria-expanded={hasPanel ? isOpen : undefined}
                aria-controls={hasPanel ? panelId : undefined}
                aria-disabled={!hasPanel || undefined}
                disabled={!hasPanel}
                onClick={() => hasPanel && setOpenId(isOpen ? null : item.id)}
                onKeyDown={(event) => handleKeyDown(event, item.id)}
                className={cn(
                  "flex w-full items-start gap-24 text-left outline-none focus-visible:ring-2 focus-visible:ring-secondary disabled:cursor-default",
                  triggerClassName
                )}
              >
                {item.icon ? <span className="shrink-0 pt-2">{item.icon}</span> : null}
                <span className={cn("min-w-0 flex-1", labelClassName)}>{item.label}</span>
                {hasPanel ? (
                  <span className={cn("shrink-0 pt-2", chevronClassName)}>
                    {indicator ? (
                      indicator(isOpen)
                    ) : (
                      <ChevronRight
                        size={14}
                        className={cn(
                          "transition-transform duration-300 ease-out motion-reduce:transition-none",
                          isOpen ? "-rotate-90" : "rotate-90"
                        )}
                      />
                    )}
                  </span>
                ) : null}
              </button>
            </HeadingTag>
            {hasPanel ? (
              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className={cn(
                  "grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
                  isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                )}
              >
                <div className={cn("overflow-hidden", panelClassName)}>{item.panel}</div>
              </div>
            ) : null}
          </div>
        );

        return (
          <Fragment key={item.id}>
            {renderItem ? renderItem(itemNode, item, index) : itemNode}
          </Fragment>
        );
      })}
    </div>
  );
}
