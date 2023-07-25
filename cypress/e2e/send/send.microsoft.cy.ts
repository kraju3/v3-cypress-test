import { faker } from "@faker-js/faker";
import { checkMessage } from "support/message.command";
import type { ICommonRequestFields } from "support/utils";

/**
 * POST returns attachments and GET returns files
 */

let messageKey: ICommonRequestFields["messageKey"] = "microsoftMessage";
let provider: ICommonRequestFields["provider"] = "microsoft";

describe("Send - Microsoft E2E Test", () => {
  describe.only("Microsoft Normal Send", () => {
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
          attachments: [],
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

  describe.only("attachment test", function () {
    beforeEach(() => {
      cy.messageTestBeforeEach({
        messageKey,
        provider,
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
      cy.messageTestAfterEach({ messageKey, provider });
    });

    it("should allow me to attach less than 3MB via payload", function () {
      //check the send response
      cy.wait(10000);
      checkMessage(messageKey, (message) => {
        const { grantId } = this.messageConfig;
        cy.getMessages({
          messageId: message.id,
          grantId,
          query: {
            subject: this.payload.subject,
          },
        });
      });

      //check the get call
      checkMessage("apiResponse", (response) => {
        const message = response.body.data[0];
        assert.isDefined(message.attachments);

        cy.wrap(message.attachments)
          .as("attachments")
          .each((attachment: any) => {
            assert.isDefined(attachment.id);
            assert.isTrue(attachment.id !== "");
          });
      });
    });
  });
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
 * *
 */
