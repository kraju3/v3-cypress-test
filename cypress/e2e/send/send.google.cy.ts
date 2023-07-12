import { randomUUID } from "crypto";
import { checkMessage } from "support/message.command";
import type { ICommonRequestFields } from "support/utils";
import { faker } from "@faker-js/faker";

/**
 * TODO: Should Message GET request support metadata?
 *
 *
 */

describe("Send - Google E2E Test", () => {
  let messageKey: ICommonRequestFields["messageKey"] = "googleMessage";

  describe("Google Normal Send to a different participant", () => {
    beforeEach(() => {
      cy.messageTestBeforeEach({
        messageKey,
        send: true,
        payload: {
          subject: `Cypress ${faker.string.uuid()}`,
          metadata: {
            key1: "Cypress Test",
          },
        },
      });
    });

    afterEach(() => {
      cy.messageTestAfterEach({ messageKey });
    });

    it("message should match the payload", function () {
      checkMessage(messageKey, (message) => {
        cy.compareObjects("Message Sent: ", message, this.payload);
      });
    });

    it(
      "message should be received",
      {
        retries: {
          openMode: 2,
          runMode: 1,
        },
      },
      function () {
        cy.wait(5000);
        checkMessage(messageKey, (messageSent) => {
          const recipient = messageSent.to[0];
          cy.getMessages({
            grantId: recipient.email ?? "",
            query: {
              subject: this.payload.subject,
            },
          });
        });
        //Check to see if the recipient has this message
        checkMessage("apiResponse", (response) => {
          const messageReceived = response.body.data;
          expect(messageReceived[0]?.folders).to.includes("INBOX");
          assert.isNotNull(messageReceived[0].thread_id);
        });
      }
    );
  });

  // !Skipping this for now till the Webhook Implementation is done
  describe.skip("Google Async Send", () => {
    beforeEach(() => {
      cy.messageTestBeforeEach({
        messageKey,
        send: true,
        payload: {
          useDraft: false,
          send_at: Math.floor(Date.now() / 1000) + 120,
        },
      });
    });

    afterEach(() => {
      cy.messageTestAfterEach({ messageKey });
    });

    // TODO: Create stubs for async send flow.
  });
});
