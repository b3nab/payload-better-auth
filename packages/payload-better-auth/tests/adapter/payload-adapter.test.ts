import { expect, test, describe, beforeAll, afterAll } from "vitest";
import { runAdapterTest } from "better-auth/adapters/test";
import { payloadAdapter } from "../../src/better-auth/payload-adapter";
import { beforeAllFixtures } from "../fixtures/beforeAll.fixtures";
import { afterAllFixtures } from "../fixtures/afterAll.fixtures";

describe("My Adapter Tests", async () => {
    beforeAll(beforeAllFixtures())

    afterAll(afterAllFixtures())

  const adapter = payloadAdapter({
    debugLogs: {
      // If your adapter config allows passing in debug logs, then pass this here.
      isRunningAdapterTests: true, // This is our super secret flag to let us know to only log debug logs if a test fails.
    },
  });

  await runAdapterTest({
    getAdapter: async (betterAuthOptions = {}) => {
      return adapter(betterAuthOptions);
    },
    disableTests: {
      FIND_MODEL_WITH_MODIFIED_FIELD_NAME: true,
      SHOULD_PREFER_GENERATE_ID_IF_PROVIDED: true
    }
  });
});