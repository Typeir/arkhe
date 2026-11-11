/**
 * @fileoverview The MDX components map, as thin wrappers like the app's:
 * Unit is an inline Tooltip trigger with rich content, Keyword a link
 * HoverCard whose body loads on first open, the MDX Tooltip takes a
 * trigger span and a content span, and Popover, Menu and Select take MDX
 * literals.
 *
 * @module tests/mdx/components
 * @version 1.0.0
 * @author Typeir
 * @since 0.1.0
 */

import {
  HoverCard,
  Menu,
  Popover,
  Select,
  Tooltip,
  type ComboboxOption,
  type MenuEntry,
} from '@arkhe/react';
import type { MDXComponents } from 'mdx/types';
import {
  Children,
  useCallback,
  type AnchorHTMLAttributes,
  type JSX,
  type ReactNode,
} from 'react';
import { loadShard, measure } from './data';

/**
 * Anchor standing in for the app's router link; marks what it renders.
 *
 * @component
 * @param {AnchorHTMLAttributes<HTMLAnchorElement>} props - Anchor props.
 * @returns {JSX.Element} Anchor.
 */
export const RouterLink = (
  props: AnchorHTMLAttributes<HTMLAnchorElement>,
): JSX.Element => <a {...props} data-router-link='' />;

/**
 * A measure with its renderings in a tooltip.
 *
 * @component
 * @param {{ value: string; unit: string; denominator?: string }} props - Quantity and unit.
 * @returns {JSX.Element} Inline trigger.
 */
export const Unit = ({
  value,
  unit,
  denominator,
}: {
  value: string;
  unit: string;
  denominator?: string;
}): JSX.Element => {
  const { label, renderings } = measure(value, unit, denominator);
  return (
    <Tooltip
      inline
      content={renderings.map((text) => (
        <span key={text}>{text} </span>
      ))}>
      {label}
    </Tooltip>
  );
};

/**
 * A keyword linking to its rule, with a card that loads on first open.
 *
 * @component
 * @param {{ term: string; display?: string; href: string }} props - Keyword, its text and route.
 * @returns {JSX.Element} Link trigger.
 */
export const Keyword = ({
  term,
  display,
  href,
}: {
  term: string;
  display?: string;
  href: string;
}): JSX.Element => {
  const load = useCallback(() => loadShard(term), [term]);
  return (
    <HoverCard
      title={display ?? term}
      href={`/en/${href}`}
      load={load}
      loaded={(text: string) => (
        <div>
          <h3>{display ?? term}</h3>
          <p>{text}</p>
        </div>
      )}>
      {display ?? term}
    </HoverCard>
  );
};

/**
 * The MDX Tooltip: first child the trigger, second the description.
 *
 * @component
 * @param {{ children?: ReactNode }} props - Trigger and content spans.
 * @returns {JSX.Element} Inline trigger.
 */
export const MdxTooltip = ({
  children,
}: {
  children?: ReactNode;
}): JSX.Element => {
  const [trigger, content] = Children.toArray(children).filter(
    (node) => typeof node !== 'string' || node.trim().length > 0,
  );
  if (!trigger || !content) return <span>{children}</span>;
  return (
    <Tooltip inline content={content}>
      {trigger}
    </Tooltip>
  );
};

/**
 * Menu with a no-op action, since MDX passes no functions.
 *
 * @component
 * @param {{ trigger: string; items: readonly MenuEntry[] }} props - Trigger and entries.
 * @returns {JSX.Element} Menu.
 */
export const MdxMenu = ({
  trigger,
  items,
}: {
  trigger: string;
  items: readonly MenuEntry[];
}): JSX.Element => (
  <Menu trigger={trigger} items={items} onSelect={() => undefined} />
);

/**
 * Select from MDX literals.
 *
 * @component
 * @param {{ label: string; items: readonly ComboboxOption[] }} props - Label and options.
 * @returns {JSX.Element} Select.
 */
export const MdxSelect = ({
  label,
  items,
}: {
  label: string;
  items: readonly ComboboxOption[];
}): JSX.Element => <Select label={label} items={items} />;

/**
 * The components map handed to the MDX content.
 *
 * @constant MDX_COMPONENTS
 * @type {MDXComponents}
 */
export const MDX_COMPONENTS: MDXComponents = {
  Unit,
  Keyword,
  Tooltip: MdxTooltip,
  Popover,
  Menu: MdxMenu,
  Select: MdxSelect,
};
