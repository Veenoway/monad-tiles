export default function PreviewPage() {
  return (
    <html>
      <head>
        <script
          type="module"
          dangerouslySetInnerHTML={{
            __html: `
              import { sdk } from "https://esm.sh/@farcaster/frame-sdk";
              sdk.actions.ready({ disableNativeGestures: true });
              console.log("🟢 SDK ready() called (preview)");
            `,
          }}
        ></script>
      </head>
      <body>
        <h1>🧪 Preview Mini App</h1>
      </body>
    </html>
  );
}
