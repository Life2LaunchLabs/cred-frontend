import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

async function hydrate() {
  if (import.meta.env.DEV) {
    const { worker } = await import("~/mocks/browser");
    await worker.start({ onUnhandledRequest: "bypass" });
  }

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
}

hydrate();
