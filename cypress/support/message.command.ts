import { FolderRequestParams } from "./folder.command";
import type { ICommonRequestFields } from "./utils";
import utils from "./utils";

export interface MessageRequestParams extends Partial<ICommonRequestFields> {
  grantId: string;
  messageId?: string;
  query?: Partial<{
    limit: number;
    subject: string;
    any_email: string;
    to: string;
    from: string;
    cc: string;
    bcc: string;
    in: string;
    unread: boolean;
    starred: boolean;
    thread_id: string;
    received_before: string;
    received_after: string;
    has_attachment: string;
  }>;
  send?: boolean;
}

function generateMessageRequest(
  { grantId, payload, messageId, query, send }: Partial<MessageRequestParams>,
  method: string
) {
  return {
    url: `${Cypress.env("API_BASE_URL")}/grants/${grantId}/messages${
      messageId ? `/${messageId}` : ""
    }${send ? `/send` : ""}`,
    auth: {
      bearer: `${Cypress.env("API_KEY")}`,
    },
    method,
    failOnStatusCode: false,
    ...(payload && { body: payload }),
    ...(query && {
      qs: query,
    }),
  };
}

function getMessages({
  grantId,
  messageId,
  query,
}: Partial<MessageRequestParams>) {
  cy.apiRequest(generateMessageRequest({ grantId, messageId, query }, "GET"), {
    checkData: true,
  });
}

function updateMessage({
  grantId,
  messageId,
  query,
  payload,
}: Partial<MessageRequestParams>) {
  cy.apiRequest(
    generateMessageRequest({ grantId, messageId, query, payload }, "PUT"),
    {
      checkData: true,
    }
  );
}

function deleteMessage({
  grantId,
  messageId,
  query,
}: Partial<MessageRequestParams>) {
  cy.apiRequest(
    generateMessageRequest({ grantId, messageId, query }, "DELETE")
  );
}

function sendMessage({
  grantId,
  payload,
  send = true,
}: Partial<MessageRequestParams>) {
  cy.apiRequest(generateMessageRequest({ grantId, payload, send }, "POST"), {
    checkData: true,
  });
}

export function checkMessage(messageKey: string, handler: (res: any) => void) {
  return cy.get(`@${messageKey}`).then((res) => handler(res));
}

// ? Interesting Find

//So its files for Google and attachments for Microsoft
function messageTestBeforeEachHook({
  payload,
  provider = "google",
  messageKey = "googleMessage",
  send,
}: Partial<MessageRequestParams>) {
  cy.fixture("messages.fixture").as("messageConfig");

  cy.get("@messageConfig").then(function (messageConfig: any) {
    //Clean up on before each hook because afterEach hook approach is an antipattern
    const { postPayload } = messageConfig;
    const grantId = utils.getGrantId(provider, messageConfig);

    if (this[messageKey]) {
      //TODO Add logic to update for the designated trash folder
      //   cy.getMessages({
      //     grantId,
      //     messageId: this[messageKey].id,
      //
      //   });
    }

    if (send) {
      payload = {
        ...postPayload,
        ...payload,
      };

      messageConfig.postPayload = payload;
      messageConfig.grantId = grantId;

      cy.sendMessage({
        grantId,
        payload,
        send,
      });

      cy.wrap(messageConfig).as("messageConfig");

      cy.get("@apiResponse").then(function (response: any) {
        // expect(response.body.data.id, "Message Id").to.be.not.equals("");
        // expect(response.body.data.id, "Message Id").to.be.not.equals(null);

        cy.wrap(
          send
            ? { id: response.body.data.id, ...response.body.data.message }
            : response.body.data
        ).as(messageKey);
        cy.wrap(messageConfig.postPayload).as("payload");
      });
    }

    //If no Message is present then Create the Message with 30 minutes from now
  });
}

function messageTestAfterEachHook({
  provider = "google",
  messageKey = "googleMessage",
}: Partial<MessageRequestParams>) {
  cy.get("@messageConfig").then(function (messageConfig: any) {
    //const grantId = utils.getGrantId(provider, messageConfig);
    if (this[messageKey]) {
      //TODO Add logic to updatefor the designated trash folder
      //   cy.getMessages({
      //     grantId,
      //     messageId: this[messageKey].id,
      //
      //   });
    }
  });
}
export default {
  getMessages,
  deleteMessage,
  updateMessage,
  sendMessage,
  messageTestBeforeEachHook,
  messageTestAfterEachHook,
};
