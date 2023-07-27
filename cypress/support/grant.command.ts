import type { ICommonRequestFields } from "./utils";
import utils from "./utils";

export interface GrantRequestParams extends Partial<ICommonRequestFields> {
  grantId?: string;
  payload?: any;
}
function generateGrantRequest(
  { grantId, payload }: Partial<GrantRequestParams>,
  method: string
) {
  return {
    url: `${Cypress.env("API_BASE_URL")}/grants${grantId ? `/${grantId}` : ""}`,
    auth: {
      bearer: `${Cypress.env("API_KEY")}`,
    },
    failOnStatusCode: false,
    method,
    ...(payload && { body: payload }),
  };
}

function getGrants({ grantId, flags }: Partial<GrantRequestParams>) {
  cy.apiRequest(generateGrantRequest({ grantId }, "GET"), {
    ...(flags && { ...flags }),
  });
}

function updateGrant({ grantId, payload, flags }: Partial<GrantRequestParams>) {
  cy.apiRequest(generateGrantRequest({ grantId, payload }, "PUT"), {
    ...(flags && { ...flags }),
  });
}

function revokeGrant({ grantId, flags }: Partial<GrantRequestParams>) {
  cy.apiRequest(generateGrantRequest({ grantId }, "DELETE"), {
    ...(flags && { ...flags }),
  });
}

function createGrant({ payload, flags }: Partial<GrantRequestParams>) {
  cy.apiRequest(generateGrantRequest({ payload }, "POST"), {
    ...(flags && { ...flags }),
  });
}

export default {
  getGrants,
  updateGrant,
  revokeGrant,
  createGrant,
};
