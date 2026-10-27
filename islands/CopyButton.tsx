import { ComponentChildren, JSX } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { Button } from "../components/Button.tsx";
import IconCopy from "https://deno.land/x/tabler_icons_tsx@0.0.5/tsx/copy.tsx";
// BUG: We have to use the GitHub URL until they resolve the issue: https://github.com/hashrock/tabler-icons-tsx/issues/16
import IconCopyCheck from "https://raw.githubusercontent.com/hashrock/tabler-icons-tsx/df5d89c516984fde5c8ec8a382a1348f9fa1aee6/tsx/copy-check.tsx";

type Props = {
  copyText: string;
  children: ComponentChildren;
  disabled?: boolean;
} & JSX.HTMLAttributes<HTMLButtonElement>;

export default function CopyButton(props: Props) {
  const { copyText, disabled = false, children, className = "", ...buttonProps } = props;
  const [clicked, setClicked] = useState(false);

  const startReset = () => {
    setTimeout(() => {
      setClicked(false);
    }, 2_000);
  };

  const copy = async (text: string) => {
    // navigator.clipboard is undefined in non-secure contexts (plain HTTP,
    // some in-app webviews), so fall back to a temporary textarea.
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  };

  return (
    <Button
      onClick={async () => {
        try {
          await copy(copyText.toString());
          setClicked(true);
          startReset();
        } catch (error) {
          console.error("Failed to copy feed URL", error);
        }
      }}
      disabled={!IS_BROWSER || disabled}
      className={`${className} ${clicked ? "bg-green-500" : ""}`}
      {...buttonProps}
    >
      {clicked
        ? (
          <>
            <IconCopyCheck /> Kopiert!
          </>
        )
        : (
          <>
            <IconCopy /> {children}
          </>
        )}
    </Button>
  );
}
