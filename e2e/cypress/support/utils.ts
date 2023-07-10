function compareObjects(object: string, actual: any, expected: any) {
  const newActualObject = transformActualObject(actual, expected);
  cy.log(`New Object ${newActualObject}`);
  Object.entries(newActualObject).forEach(([key, value]: any) => {
    assert.isDefined(expected[key]);
    assert.deepEqual(
      value,
      expected[key],
      `${object}- ${key} matches - ${value}`
    );
  });
}

const OK_STATUSES = [200, 201, 202, 203];

function checkApiResponse(
  response: any,
  flags?: Partial<APIResponseCheckFlags>
) {
  let defaultOkayFlag = flags?.checkOkay ?? true;

  assert.isDefined(response.body.request_id, "Request id is present");

  if (flags?.check404) {
    expect(response.status).to.be.eq(404, "Response status is 404");
    defaultOkayFlag = false;
  }
  if (defaultOkayFlag) {
    expect(response.status).to.be.satisfies(
      (val: number) => OK_STATUSES.includes(val),
      "Response status is 200 OK"
    );
  }

  if (flags?.checkData) {
    assert.isDefined(response.body.data, "Request data is present");
  }
  if (flags?.checkError) {
    assert.isDefined(response.body.data.error, "Error object is present");
    expect(response.status).to.not.satisfies(
      (val: number) => OK_STATUSES.includes(val),
      "Response status is not 200 OK"
    );
  }
}

function getGrantId(provider: "google" | "microsoft", config: any) {
  return provider === "google" ? config.googleGrantId : config.microsoftGrantId;
}

function transformActualObject(actual: any, expected: any) {
  const actualKeys = Object.keys(actual);
  const expectedKeys = Object.keys(expected);

  return expectedKeys.reduce((acc: any, curr: any) => {
    if (!actualKeys.includes(curr)) {
      return acc;
    }
    if (!Array.isArray(actual[curr]) && typeof actual[curr] === "object") {
      acc[curr] = transformActualObject(actual[curr], expected[curr]);
    }
    acc[curr] = actual[curr];
    return acc;
  }, {});
}

function apiRequest(
  requestConfig: Partial<Cypress.RequestOptions>,
  flags?: Partial<APIResponseCheckFlags>
) {
  cy.log(requestConfig.url || "Request made");
  cy.request(requestConfig).as("apiResponse", { type: "static" });
  cy.get("@apiResponse").then((response: any) => {
    cy.log(response.body);
    cy.checkApiResponse(response, flags);
  });
}

export interface ICommonRequestFields {
  provider?: "google" | "microsoft";
  eventKey?: "googleEvent" | "microsoftEvent";
  messageKey?: "googleMessage" | "microsoftMessage";
  draftKey?: "googleDraft" | "microsoftDraft";
  folderKey?: "googleLabel" | "microsoftFolder";
  calendarKey?: "googleCalendar" | "microsoftCalendar";
  contactKey?: "googleContact" | "microsoftContact";
  availabilityKey?: "googleAvailability" | "microsoftAvailability";
  filesKey?: "file";
  flags?: Partial<APIResponseCheckFlags>;
}

export interface APIResponseCheckFlags {
  checkData: boolean;
  checkError: boolean;
  checkOkay: boolean;
  check404: boolean;
}

export default { checkApiResponse, compareObjects, apiRequest, getGrantId };
