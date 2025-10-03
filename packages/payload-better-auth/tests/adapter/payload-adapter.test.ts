import { expect, test, describe, beforeAll, afterAll } from "vitest";
import { runAdapterTest } from "better-auth/adapters/test";
import { payloadAdapter } from "../../src/better-auth/payload-adapter";
import { beforeAllFixtures } from "../fixtures/beforeAll.fixtures";
import { afterAllFixtures } from "../fixtures/afterAll.fixtures";
import { getSuite } from "../fixtures/suite.ctx";

describe("Payload Adapter Tests", async () => {
    beforeAll(beforeAllFixtures(), 1000*60)

    afterAll(afterAllFixtures())

  await runAdapterTest({
    getAdapter: async (betterAuthOptions = {}) => {
      const adapter = payloadAdapter({
        payload: getSuite().payload,
        debugLogs: {
          // If your adapter config allows passing in debug logs, then pass this here.
          isRunningAdapterTests: true, // This is our super secret flag to let us know to only log debug logs if a test fails.
        },
      });
      return adapter(betterAuthOptions);
    },
    disableTests: {
    //   FIND_MODEL_WITH_MODIFIED_FIELD_NAME: true,
      SHOULD_FIND_MANY_WITH_NOT_IN_OPERATOR: true,
      SHOULD_PREFER_GENERATE_ID_IF_PROVIDED: true
    }
  });
});