import type { ICommonRequestFields } from "./utils";
import utils from "./utils";

export interface DraftRequestParams extends Partial<ICommonRequestFields> {
  grantId: string;
  draftId?: string;
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

function generateDraftRequest(
  { grantId, payload, draftId, query }: Partial<DraftRequestParams>,
  method: string
) {
  return {
    url: `${Cypress.env("API_BASE_URL")}/grants/${grantId}/drafts${
      draftId ? `/${draftId}` : ""
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

function getDrafts({
  grantId,
  draftId,
  query,
  flags,
}: Partial<DraftRequestParams>) {
  cy.apiRequest(generateDraftRequest({ grantId, draftId, query }, "GET"), {
    ...(flags && { ...flags }),
  });
}

function updateDraft({
  grantId,
  draftId,
  query,
  payload,
  flags,
}: Partial<DraftRequestParams>) {
  cy.apiRequest(
    generateDraftRequest({ grantId, draftId, query, payload }, "PUT"),
    {
      ...(flags && { ...flags }),
    }
  );
}

function deleteDraft({
  grantId,
  draftId,
  query,
  flags,
}: Partial<DraftRequestParams>) {
  cy.apiRequest(generateDraftRequest({ grantId, draftId, query }, "DELETE"), {
    ...(flags && { ...flags }),
  });
}

function createDraft({ grantId, payload, flags }: Partial<DraftRequestParams>) {
  cy.apiRequest(generateDraftRequest({ grantId, payload }, "POST"), {
    ...(flags && { ...flags }),
  });
}

function draftsTestBeforeEachHook({
  payload,
  provider = "google",
  draftKey = "googleDraft",
}: Partial<DraftRequestParams>) {
  cy.fixture("drafts.fixture").as("draftConfig");

  cy.get("@draftConfig").then(function (draftConfig: any) {
    //Clean up on before each hook because afterEach hook approach is an antipattern
    const { postPayload } = draftConfig;
    const grantId = utils.getGrantId(provider, draftConfig);

    if (this[draftKey]) {
      //TODO Add logic to update for the designated trash folder
      cy.deleteDraft({
        grantId,
        draftId: this[draftKey].id,
      });
      cy.getDrafts({
        grantId,
        draftId: this[draftKey].id,

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
    draftConfig.postPayload = payload;
    draftConfig.grantId = grantId;

    cy.createDraft({
      grantId,
      draftId: undefined,
      payload,
    });

    cy.wrap(draftConfig).as("draftConfig");

    cy.get("@apiResponse").then(function (response: any) {
      cy.wrap({ id: response.body.data.id, ...response.body.data.message }).as(
        draftKey
      );
      cy.wrap(draftConfig.postPayload).as("payload");
    });

    //If no Draft is present then Create the Draft with 30 minutes from now
  });
}

function draftsTestAfterEachHook({
  provider = "google",
  draftKey = "googleDraft",
}: Partial<DraftRequestParams>) {
  cy.get("@draftConfig").then(function (draftConfig: any) {
    const grantId = utils.getGrantId(provider, draftConfig);
    if (this[draftKey]) {
      cy.deleteDraft({
        grantId,
        draftId: this[draftKey].id,
      });
      cy.getDrafts({
        grantId,
        draftId: this[draftKey].id,
        flags: {
          check404: provider === "google",
          checkData: false,
        },
      });

      if (provider === "microsoft") {
        cy.get("@apiResponse").then((res: any) => {
          const { folders } = res.body.data;
          expect(folders).to.have.lengthOf.greaterThan(
            0,
            "There should be atleast 1 folder"
          );
        });
      }
    }
  });
}
export default {
  getDrafts,
  deleteDraft,
  updateDraft,
  createDraft,
  draftsTestBeforeEachHook,
  draftsTestAfterEachHook,
};
