import Preact from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";

export default function CopyButton(
  props: { textBefore: string; textAfter: string } & Preact.PropsWithChildren,
) {
  const [clicked, setClicked] = useState(false);

  const startReset = () => {
    setTimeout(() => {
      setClicked(false);
    }, 2_000);
  };

  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(props.text.toString());
        setClicked(true);
        startReset();
      }}
      disabled={!IS_BROWSER || props.disabled}
      class="px-2 py-1 border(gray-100 2) hover:bg-gray-200 mx-auto"
    >
      {clicked ? "Kopiert!" : props.children}
    </button>
  );
}
