import type { ICommonRequestFields } from "support/utils";

//DONE File a BUG for beta docs to resolve the send payload structure
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

describe("Send - Google E2E Test", () => {
  let messageKey: ICommonRequestFields["messageKey"] = "googleMessage";
  describe("Google Normal Send to a different participant", () => {
    beforeEach(() => {
      cy.messageTestBeforeEach({ messageKey, send: true });
    });

    afterEach(() => {
      cy.messageTestAfterEach({ messageKey });
    });

    it("message should match the payload", function () {
      const message = this[messageKey ?? ""];

      cy.compareObjects("Message", message, this.payload);
    });

    it("message should be received", function () {
      cy.wait(15000);
      const { grantId } = this.messageConfig;
      const message = this[messageKey ?? ""];
      cy.getMessages({ grantId, messageId: message.id, payload: undefined });
      cy.get("@apiResponse").then((res: any) => {
        assert.isDefined(res.body.data, "Response data is present");
        expect(res.body.data.id).to.equals(message.id);
        expect(res.body.data.folders).to.contain("SENT");
        expect(res.body.data.thread_id).to.is.not.undefined(
          "Thread ID is not undefined"
        );
      });
      cy.compareObjects("Message", message, this.payload);
      //   expect(message.to).to.equals(this.payload.to);
    });
  });

  describe("Google Async Send", () => {
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
