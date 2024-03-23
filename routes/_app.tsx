import { PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html lang="no">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>NRSS</title>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
}
