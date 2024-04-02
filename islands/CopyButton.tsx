import Preact from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

type Props = {
  text: string;
  children: Preact.ComponentChildren;
  disabled?: boolean;
};

export default function CopyButton({ text, disabled = false, children }: Props) {
  const [clicked, setClicked] = useState(false);

  const startReset = () => {
    setTimeout(() => {
      setClicked(false);
    }, 2_000);
  };

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text.toString());
        setClicked(true);
        startReset();
      }}
      disabled={!IS_BROWSER || disabled}
      class="px-2 py-1 border(gray-100 2) hover:bg-gray-200 mx-auto bg-blue-200"
    >
      {clicked ? "Kopiert!" : children}
    </button>
  );
}
