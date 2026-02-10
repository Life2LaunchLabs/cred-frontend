import { setupWorker } from "msw/browser";
import { getBadgingAppAPIV0Mock } from "~/api/generated";
import { handlers } from "./handlers";

// Custom handlers first — MSW uses the first match, so these override generated ones
export const worker = setupWorker(...handlers, ...getBadgingAppAPIV0Mock());
