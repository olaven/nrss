import { ComponentChildren, JSX } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { Button } from "../components/Button.tsx";

type Props = {
  copyText: string;
  children: ComponentChildren;
  disabled?: boolean;
} & JSX.HTMLAttributes<HTMLButtonElement>;

export default function CopyButton(props: Props) {
  const { copyText, disabled = false, children, ...buttonProps } = props;
  const [clicked, setClicked] = useState(false);

  const startReset = () => {
    setTimeout(() => {
      setClicked(false);
    }, 2_000);
  };

  return (
    <Button
      onClick={() => {
        navigator.clipboard.writeText(copyText.toString());
        setClicked(true);
        startReset();
      }}
      disabled={!IS_BROWSER || disabled}
      {...buttonProps}
    >
      {clicked ? "Kopiert!" : children}
    </Button>
  );
}
