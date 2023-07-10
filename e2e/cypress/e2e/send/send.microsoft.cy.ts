import type { ICommonRequestFields } from "support/utils";

//TODO File a BUG for beta docs to resolve the send payload structure
/**
 *{
    "grant_id": "4610d0ca-f67f-497d-8ed8-4d72d0817be5",
    "id": "18938c0f9216c388",
    "message": {
        "body": "Nylas API v3 Test!",
        "subject": "Sending Emails with Nylas",
        "from": [
            {
                "name": "",
                "email": "kirantestnylas1@gmail.com"
            }
        ],
        "to": [
            {
                "name": "Kiran Test",
                "email": "kirantestnylas3@gmail.com"
            }
        ],
        "cc": null,
        "bcc": null,
        "reply_to": null,
        "attachments": null,
        "send_at": null,
        "use_draft": false
    },
    "schedule_id": ""
}
 *
 *
 */

describe("Send - Microsoft E2E Test", () => {
  let messageKey: ICommonRequestFields["messageKey"] = "microsoftMessage";
  let provider: ICommonRequestFields["provider"] = "microsoft";

  describe("Microsoft Normal Send", () => {
    beforeEach(() => {
      cy.messageTestBeforeEach({ provider, messageKey, send: true });
    });

    afterEach(() => {
      cy.messageTestAfterEach({ provider, messageKey });
    });

    it("message should match the payload", function () {
      const message = this[messageKey ?? ""];

      cy.compareObjects("Message", message, this.payload);
    });
  });

  /**
   * @async send
   *
   * @description
   * We need to send the message, the first test should wait from the time we scheduled to send
   *
   * Due to time constraints we are testing 2 minutes max ahead
   */

  describe("Microsoft Async Send", () => {
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

    it("message should match the payload", function () {
      cy.wait(120000);
      const message = this[messageKey ?? ""];

      cy.compareObjects("Message", message, this.payload);
    });

    //TODO query for the message and check if it's in the right folder
  });
});
