import type { ICommonRequestFields } from "./utils";
import utils from "./utils";

export interface EventQueryParams extends ICommonRequestFields {
  calendarId: string;
  grantId: string;
  payload: any;
  eventId?: any;
  rsvp?: boolean;
  query?: Cypress.RequestOptions["qs"];
}

function generateEventRequest(
  {
    grantId,
    calendarId,
    payload,
    eventId,
    rsvp,
    query,
  }: Partial<EventQueryParams>,
  method: string
) {
  return {
    url: `${Cypress.env("API_BASE_URL")}/grants/${grantId}/events${
      eventId ? `/${eventId}` : ""
    }${rsvp ? `/send-rsvp` : ""}?calendar_id=${calendarId}`,
    auth: {
      bearer: `${Cypress.env("API_KEY")}`,
    },
    method,
    failOnStatusCode: false,
    ...(payload && { body: payload }),
    ...(query && {
      qs: {
        ...query,
        calendar_id: calendarId,
      },
    }),
  };
}

function getEvents({
  grantId,
  calendarId,
  eventId,
  query,
}: Partial<EventQueryParams>) {
  cy.apiRequest(
    generateEventRequest({ grantId, calendarId, eventId, query }, "GET")
  );
}

function updateEvent({
  grantId,
  calendarId,
  eventId,
  payload,
}: Partial<EventQueryParams>) {
  cy.apiRequest(
    generateEventRequest({ grantId, calendarId, eventId, payload }, "PUT")
  );
}

function deleteEvent({
  grantId,
  calendarId,
  eventId,
}: Partial<EventQueryParams>) {
  cy.apiRequest(
    generateEventRequest({ grantId, calendarId, eventId }, "DELETE")
  );
}

function createEvent({
  grantId,
  calendarId,
  eventId,
  payload,
}: Partial<EventQueryParams>) {
  cy.apiRequest(
    generateEventRequest({ grantId, calendarId, eventId, payload }, "POST")
  );
}

function rsvPEvent({
  grantId,
  calendarId,
  eventId,
  payload,
}: Partial<EventQueryParams>) {
  cy.apiRequest(
    generateEventRequest(
      { grantId, calendarId, eventId, payload, rsvp: true },
      "POST"
    )
  );
}

function eventTestBeforeEachHook({
  payload,
  provider = "google",
  eventKey = "googleEvent",
}: Partial<EventQueryParams>) {
  cy.fixture("events.fixture").as("eventConfig");

  cy.get("@eventConfig").then(function (eventConfig: any) {
    //Clean up on before each hook because afterEach hook approach is an antipattern
    const { calendarId, postPayload } = eventConfig;
    const grantId = utils.getGrantId(provider, eventConfig);

    if (this[eventKey]) {
      cy.deleteEvent({
        grantId,
        eventId: this[eventKey].id,
        calendarId,
        payload: undefined,
      });

      //only check the event status is cancelled for Google
      if (provider === "google") {
        cy.getEvents({
          grantId,
          eventId: this[eventKey].id,
          calendarId,
          payload: undefined,
        });
        cy.get("@apiResponse").then((response: any) => {
          assert.isTrue(response.body.data.status === "cancelled");
        });
      }
    }

    //If no Event is present then Create the event with 30 minutes from now

    const start_time = Math.floor(Date.now() / 1000) + 3600;
    const end_time = Math.floor(Date.now() / 1000) + 5400;

    payload = {
      when: {
        start_time,
        end_time,
      },
      ...postPayload,
      ...payload,
    };

    eventConfig.postPayload = payload;
    eventConfig.grantId = grantId;

    cy.createEvent({
      grantId,
      eventId: undefined,
      calendarId,
      payload,
    });

    cy.wrap(eventConfig).as("eventConfig");

    cy.get("@apiResponse").then(function (response: any) {
      cy.wrap(response.body.data).as(eventKey);
      cy.wrap(eventConfig.postPayload).as("payload");
    });
  });
}

function eventTestAfterEachHook({
  provider = "google",
  eventKey = "googleEvent",
}: Partial<EventQueryParams>) {
  cy.get("@eventConfig").then(function (eventConfig: any) {
    const { calendarId } = eventConfig;
    const grantId = utils.getGrantId(provider, eventConfig);
    if (this[eventKey]) {
      cy.deleteEvent({
        grantId,
        eventId: this[eventKey].id,
        calendarId,
        payload: undefined,
      });
      if (provider === "microsoft") {
        return;
      }
      cy.getEvents({
        grantId,
        eventId: this[eventKey].id,
        calendarId,
        payload: undefined,
      });

      cy.get("@apiResponse").then((response: any) => {
        assert.isTrue(response.body.data.status === "cancelled");
      });
    }
  });
}
export default {
  getEvents,
  deleteEvent,
  updateEvent,
  createEvent,
  rsvPEvent,
  eventTestBeforeEachHook,
  eventTestAfterEachHook,
};
