import type { ICommonRequestFields } from "./utils";
import utils from "./utils";

export interface FolderRequestParams extends Partial<ICommonRequestFields> {
  grantId: string;
  folderId?: string;
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
}

function generateFolderRequest(
  { grantId, payload, folderId, query }: Partial<FolderRequestParams>,
  method: string
) {
  return {
    url: `${Cypress.env("API_BASE_URL")}/grants/${grantId}/folders${
      folderId ? `/${folderId}` : ""
    }`,
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

function getFolders({
  grantId,
  folderId,
  query,
  flags,
}: Partial<FolderRequestParams>) {
  cy.apiRequest(generateFolderRequest({ grantId, folderId, query }, "GET"), {
    ...(flags && { ...flags }),
  });
}

function updateFolder({
  grantId,
  folderId,
  query,
  payload,
  flags,
}: Partial<FolderRequestParams>) {
  cy.apiRequest(
    generateFolderRequest({ grantId, folderId, query, payload }, "PUT"),
    {
      ...(flags && { ...flags }),
    }
  );
}

function deleteFolder({
  grantId,
  folderId,
  query,
  flags,
}: Partial<FolderRequestParams>) {
  cy.apiRequest(generateFolderRequest({ grantId, folderId, query }, "DELETE"), {
    ...(flags && { ...flags }),
  });
}

function createFolder({
  grantId,
  payload,
  flags,
}: Partial<FolderRequestParams>) {
  cy.apiRequest(generateFolderRequest({ grantId, payload }, "POST"), {
    ...(flags && { ...flags }),
  });
}

function foldersTestBeforeEachHook({
  payload,
  provider = "google",
  folderKey = "googleLabel",
}: Partial<FolderRequestParams>) {
  cy.fixture("folders.fixture").as("folderConfig");

  cy.get("@folderConfig").then(function (folderConfig: any) {
    //Clean up on before each hook because afterEach hook approach is an antipattern
    const { postPayload } = folderConfig;
    const grantId = utils.getGrantId(provider, folderConfig);

    if (this[folderKey]) {
      //TODO Add logic to update for the designated trash folder
      cy.deleteFolder({
        grantId,
        folderId: this[folderKey].id,
      });
      cy.getFolders({
        grantId,
        folderId: this[folderKey].id,

        flags: {
          check404: true,
          checkData: false,
        },
      });
    }

    payload = {
      ...postPayload,
      ...payload,
    };
    folderConfig.postPayload = payload;
    folderConfig.grantId = grantId;

    cy.createFolder({
      grantId,
      folderId: undefined,
      payload,
    });

    cy.wrap(folderConfig).as("folderConfig");

    cy.get("@apiResponse").then(function (response: any) {
      cy.wrap(response.body.data).as(folderKey);
      cy.wrap(folderConfig.postPayload).as("payload");
    });

    //If no Folder is present then Create the Folder with 30 minutes from now
  });
}

function foldersTestAfterEachHook({
  provider = "google",
  folderKey = "googleLabel",
}: Partial<FolderRequestParams>) {
  cy.get("@folderConfig").then(function (folderConfig: any) {
    const grantId = utils.getGrantId(provider, folderConfig);
    if (this[folderKey]) {
      //TODO Add logic to updatefor the designated trash folder
      cy.deleteFolder({
        grantId,
        folderId: this[folderKey].id,
      });
      cy.getFolders({
        grantId,
        folderId: this[folderKey].id,

        flags: {
          check404: true,
          checkData: false,
        },
      });
    }
  });
}
export default {
  getFolders,
  deleteFolder,
  updateFolder,
  createFolder,
  foldersTestBeforeEachHook,
  foldersTestAfterEachHook,
};
