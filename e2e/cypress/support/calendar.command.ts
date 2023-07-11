import type { ICommonRequestFields } from "./utils";
import utils from "./utils";

export interface CalendarRequestParams extends ICommonRequestFields {
  calendarId?: string;
  grantId: string;
  payload: any;
}
function generateCalendarRequest(
  { grantId, calendarId, payload }: Partial<CalendarRequestParams>,
  method: string
) {
  return {
    url: `${Cypress.env("API_BASE_URL")}/grants/${grantId}/calendars${
      calendarId ? `/${calendarId}` : ""
    }`,
    auth: {
      bearer: `${Cypress.env("API_KEY")}`,
    },
    failOnStatusCode: false,
    method,
    ...(payload && { body: payload }),
  };
}

function getCalendars({
  grantId,
  calendarId,
  flags,
}: Partial<CalendarRequestParams>) {
  cy.apiRequest(generateCalendarRequest({ calendarId, grantId }, "GET"), {
    ...(flags && { ...flags }),
  });
}

function updateCalendar({
  grantId,
  calendarId,
  payload,
  flags,
}: Partial<CalendarRequestParams>) {
  cy.apiRequest(
    generateCalendarRequest({ calendarId, grantId, payload }, "PUT"),
    {
      ...(flags && { ...flags }),
    }
  );
}

function deleteCalendar({
  grantId,
  calendarId,
  flags,
}: Partial<CalendarRequestParams>) {
  cy.apiRequest(generateCalendarRequest({ calendarId, grantId }, "DELETE"), {
    ...(flags && { ...flags }),
  });
}

function createCalendar({
  grantId,
  calendarId,
  payload,
  flags,
}: Partial<CalendarRequestParams>) {
  cy.apiRequest(
    generateCalendarRequest({ calendarId, grantId, payload }, "POST"),
    {
      ...(flags && { ...flags }),
    }
  );
}

function calendarTestBeforeEachHook({
  payload = {},
  provider = "google",
  calendarKey = "googleCalendar",
}: Partial<CalendarRequestParams>) {
  cy.fixture("calendars.fixture").as("calendarConfig");

  cy.get("@calendarConfig").then(function (calendarConfig: any) {
    //Clean up on before each hook because afterEach hook approach is an antipattern
    const { postPayload } = calendarConfig;
    const grantId = utils.getGrantId(provider, calendarConfig);

    if (this[calendarKey]) {
      cy.deleteCalendar({
        grantId,
        calendarId: encodeURIComponent(this[calendarKey].id),
        payload: undefined,
      });

      cy.getCalendars({
        grantId,
        calendarId: encodeURIComponent(this[calendarKey].id),
        payload: undefined,
        flags: {
          check404: true,
          checkData: false,
        },
      });
    }

    //If no Calendar is present then Create the calendar

    payload = {
      ...postPayload,
      ...payload,
    };

    calendarConfig.postPayload = payload;
    calendarConfig.grantId = grantId;

    cy.createCalendar({
      grantId,
      calendarId: undefined,
      payload,
    });

    cy.wrap(calendarConfig).as("calendarConfig");

    cy.get("@apiResponse").then(function (response: any) {
      cy.wrap(response.body.data).as(calendarKey);
      cy.wrap(calendarConfig.postPayload).as("payload");
    });
  });
}

function calendarTestAfterEachHook({
  provider = "google",
  calendarKey = "googleCalendar",
}: Partial<CalendarRequestParams>) {
  cy.get("@calendarConfig").then(function (calendarConfig: any) {
    const grantId = utils.getGrantId(provider, calendarConfig);
    if (this[calendarKey]) {
      cy.deleteCalendar({
        grantId,
        calendarId: encodeURIComponent(this[calendarKey].id),
        payload: undefined,
      });
      cy.getCalendars({
        grantId,
        calendarId: encodeURIComponent(this[calendarKey].id),
        payload: undefined,
        flags: {
          check404: true,
          checkData: false,
        },
      });
    }
  });
}

export default {
  getCalendars,
  deleteCalendar,
  updateCalendar,
  createCalendar,
  calendarTestAfterEachHook,
  calendarTestBeforeEachHook,
};
