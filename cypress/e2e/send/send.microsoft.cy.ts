import { faker } from "@faker-js/faker";
import { checkMessage } from "support/message.command";
import type { ICommonRequestFields } from "support/utils";

let messageKey: ICommonRequestFields["messageKey"] = "microsoftMessage";
let provider: ICommonRequestFields["provider"] = "microsoft";

describe.only("Send - Microsoft E2E Test", () => {
  describe("Microsoft Normal Send", () => {
    beforeEach(() => {
      cy.messageTestBeforeEach({
        provider,
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
      cy.messageTestAfterEach({ provider, messageKey });
    });

    afterEach(() => {
      cy.messageTestAfterEach({ messageKey });
    });

    it("message should match the payload", function () {
      checkMessage(messageKey, (message: any) => {
        cy.compareObjects("Message Sent: ", message, this.payload);
      });
    });

    it("should check for all the properties of the message", function () {
      checkMessage(messageKey, (message: any) => {});
    });

    it(
      "message shold be received",
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

        checkMessage("apiResponse", (response) => {
          const messageReceived = response.body.data;
          expect(messageReceived[0]?.folders).to.includes("INBOX");
          assert.isNotNull(messageReceived[0].thread_id);
        });
      }
    );
  });

  //TODO query for the message and check if it's in the right folder

  /**
   * @async send
   *
   * @description
   * We need to send the message, the first test should wait from the time we scheduled to send
   *
   * Due to time constraints we are testing 2 minutes max ahead
   *
   * ! SKIPPED
   */

  describe.skip("Microsoft Async Send", () => {
    beforeEach(() => {
      cy.messageTestBeforeEach({
        provider,
        messageKey,
        send: true,
        payload: {
          useDraft: false,
          send_at: Math.floor(Date.now() / 1000) + 120,
        },
      });
    });

    afterEach(() => {
      cy.messageTestAfterEach({ provider, messageKey });
    });

    //TODO check async message
  });
});
