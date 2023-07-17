# V3 E2E Test

## Getting started

- run `npm i`
- add your environment variables to the `cypress.env.json` file.
- run `npm run test:dev` - Opens Cypress UI

## Directory Structure

- `cypress/e2e`
  - All the test files
- `cypress/support`
  - Cypress commands by default these files.It injects the Cypress with commands that you can use for your test
  - Right now, there are separate commands for the major endpoints for our Beta release -`cypress.env.json`
  - Environment variables (example: cypress.env.sample.json)
- `cypress/fixtures`
  - Fixtures are primarily used to load external data or mock an API. They all share a common pattern.
    - Required Fields
      - googleGrantId
      - microsoftGrantId,
      - postPayload,
        - test payload objects in the spec files will override these values.
      - putPayload (Optional)
        - test payload objects will override these values.
  ```json
  {
    "grantId": "",
    "googleGrantId": "53ddb155-cacc-41f7-8042-e3b960880ecf",
    "microsoftGrantId": "e578c7ac-94b3-430d-8174-0d76a6a07350",
    "draftId": "",
    "messageId": "",
    "postPayload": {
      "subject": "Sending Emails with Cypress",
      "body": "Nylas API v3 Test!",
      "to": [
        {
          "name": "Kiran Test",
          "email": "kirantestnylas3@gmail.com"
        }
      ]
    },
  ```

## Spec Files

- These are the files where you would write your tests
- Each spec file contains a similar format
  1. Specify a `describe()` block
     1. specify an object key and a provider
        1. Google is set to be the default provider
  2. Run a Before Each Hook
     1. Runs before every test in the suite
  3. Run an After Each hook
     1. runs after every test in the suite.
  4. `it()` specifies the functionality you are testing.
     1. Here you will use all the commands that you create under the support folders
    
- You don't have to utilize beforeEach and afterEach hook. However, this allows you to test each block exclusively with fresh objects.
- Sample File

  ```
  describe("Send - Google E2E Test", () => {
  let messageKey: ICommonRequestFields["messageKey"] = "googleMessage";
  let provider: ICommonRequestFields["provider"] =  "google"

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

      it("message should match the payload", function () {
        cy.wait(120000);
        const message = this[messageKey ?? ""];

        cy.compareObjects("Message", message, this.payload);
      });
    });
  });
  ```
