'use client';
import { Check, Copy } from 'lucide-react';
import {
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  forwardRef,
  useCallback,
  useRef,
} from 'react';
import { cn } from '@/utils/cn';
import {
  ScrollArea,
  ScrollBar,
  ScrollViewport,
} from '@/components/ui/scroll-area';
import { useCopyButton } from '@/utils/use-copy-button';
import { buttonVariants } from '@/theme/variants';

export type CodeBlockProps = HTMLAttributes<HTMLElement> & {
  /**
   * Icon of code block
   *
   * When passed as a string, it assumes the value is the HTML of icon
   */
  icon?: ReactNode;

  /**
   * Allow to copy code with copy button
   *
   * @defaultValue true
   */
  allowCopy?: boolean;

  /**
   * Keep original background color generated by Shiki or Rehype Code
   *
   * @defaultValue false
   */
  keepBackground?: boolean;
};

export const Pre = forwardRef<HTMLPreElement, HTMLAttributes<HTMLPreElement>>(
  ({ className, ...props }, ref) => {
    return (
      <pre ref={ref} className={cn('p-4', className)} {...props}>
        {props.children}
      </pre>
    );
  },
);

Pre.displayName = 'Pre';

export const CodeBlock = forwardRef<HTMLElement, CodeBlockProps>(
  (
    {
      title,
      allowCopy = true,
      keepBackground = false,
      icon,
      className,
      ...props
    },
    ref,
  ) => {
    const areaRef = useRef<HTMLDivElement>(null);
    const onCopy = useCallback(() => {
      const pre = areaRef.current?.getElementsByTagName('pre').item(0);

      if (!pre) return;

      const clone = pre.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('.nd-copy-ignore').forEach((node) => {
        node.remove();
      });

      void navigator.clipboard.writeText(clone.textContent ?? '');
    }, []);

    return (
      <figure
        ref={ref}
        className={cn(
          'not-prose group fd-codeblock relative my-6 overflow-hidden rounded-lg border bg-fd-secondary/50 text-sm',
          keepBackground && 'fd-codeblock-keep-bg',
          className,
        )}
        {...props}
      >
        {title ? (
          <div className="flex flex-row items-center gap-2 border-b bg-fd-muted px-4 py-1.5">
            {icon ? (
              <div
                className="text-fd-muted-foreground [&_svg]:size-3.5"
                {...(typeof icon === 'string'
                  ? {
                      dangerouslySetInnerHTML: { __html: icon },
                    }
                  : {
                      children: icon,
                    })}
              />
            ) : null}
            <figcaption className="flex-1 truncate text-fd-muted-foreground">
              {title}
            </figcaption>
            {allowCopy ? (
              <CopyButton className="-me-2" onCopy={onCopy} />
            ) : null}
          </div>
        ) : (
          allowCopy && (
            <CopyButton
              className="absolute right-2 top-2 z-[2] backdrop-blur-sm"
              onCopy={onCopy}
            />
          )
        )}
        <ScrollArea ref={areaRef} dir="ltr">
          <ScrollViewport>{props.children}</ScrollViewport>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </figure>
    );
  },
);

CodeBlock.displayName = 'CodeBlock';

function CopyButton({
  className,
  onCopy,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  onCopy: () => void;
}): ReactElement {
  const [checked, onClick] = useCopyButton(onCopy);

  return (
    <button
      type="button"
      className={cn(
        buttonVariants({
          color: 'ghost',
          className: 'transition-all group-hover:opacity-100',
        }),
        !checked && 'opacity-0',
        className,
      )}
      aria-label="Copy Text"
      onClick={onClick}
      {...props}
    >
      <Check
        className={cn('size-3.5 transition-transform', !checked && 'scale-0')}
      />
      <Copy
        className={cn(
          'absolute size-3.5 transition-transform',
          checked && 'scale-0',
        )}
      />
    </button>
  );
}
