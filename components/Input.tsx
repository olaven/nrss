import { JSX } from "preact";

export const Input = (
  props: JSX.HTMLAttributes<HTMLInputElement>,
) => {
  return (
    <input
      className="border-2 rounded-md px-2"
      {...props}
    />
  );
};
