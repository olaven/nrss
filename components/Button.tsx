import { ComponentChildren, JSX } from "preact";

type ButtonProps = {
  children: ComponentChildren;
} & JSX.HTMLAttributes<HTMLButtonElement>;

const className = "p-2 border(gray-100 2) hover:bg-gray-200 bg-blue-200 font-medium";

export function Button(props: ButtonProps) {
  const { children, className: additionalClass = "", ...buttonProps } = props;

  return (
    <button className={`${className} ${additionalClass}`} {...buttonProps}>
      {children}
    </button>
  );
}

type AnchorProps = {
  children: ComponentChildren;
} & JSX.HTMLAttributes<HTMLAnchorElement>;

export function ButtonLink(props: AnchorProps) {
  const { children, className: additionalClass = "", ...linkProps } = props;

  return (
    <a className={`${className} ${additionalClass}`} {...linkProps}>
      {children}
    </a>
  );
}
