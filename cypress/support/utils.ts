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

  if (flags?.checkError) {
    assert.isDefined(response.body.data.error, "Error object is present");
    expect(response.statusText).to.be.not.equals("OK");
    cy.log(`@${response.body.data.error}`);
  }
  if (defaultOkayFlag) {
    expect(response.statusText).to.be.equals("OK");
    assert.isTrue(response.status < 400);
  }

  if (flags?.checkData) {
    assert.isDefined(response.body.data, "Request data is present");
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
      return acc;
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
