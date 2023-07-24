import { faker } from "@faker-js/faker";
import { add, format, startOfToday } from "date-fns";
import { P } from "pino";
import { start } from "repl";
import type { ICommonRequestFields } from "support/utils";

let calendarKey: ICommonRequestFields["calendarKey"] = "virtualCalendar";
let provider: ICommonRequestFields["provider"] = "virtualCalendar";
describe("Calendar - Virtual Calendar E2E tests", () => {
  beforeEach("Create a Virtual Calendar", function () {
    cy.calendarTestBeforeEach({
      calendarKey,
      provider,
      payload: {
        timezone: "America/Chicago",
      },
    });
  });

  afterEach("Clean up any Calendars after", function () {
    cy.calendarTestAfterEach({ calendarKey, provider });
  });

  it("should match the payload of the POST request", function () {
    const calendar = this[calendarKey];

    const { postPayload } = this.calendarConfig;
    cy.compareObjects("Calendar", calendar, postPayload);
    expect(calendar.read_only).eq(false, "Calendar is read-only:false");
    assert.isTrue(
      calendar.timezone === this.payload.timezone,
      "Timezone data is reflected"
    );
  });

  it("update the description", function () {
    const { grantId, putPayload } = this.calendarConfig;
    const payload = {
      description: "Updated Calendar description",
      name: "New Calendar Title",
      ...putPayload,
    };
    cy.updateCalendar({
      grantId,
      calendarId: this[calendarKey].id,
      payload,
    });

    cy.wait(5000);

    cy.get("@apiResponse").then((response: any) => {
      const calendar = response.body.data;
      cy.compareObjects("Calendar", calendar, payload);
    });
  });

  it("should allow you to create an Event -timespan on that calendar", function () {
    const { grantId } = this.calendarConfig;
    const calendar = this[calendarKey];

    const start_time = Math.floor(Date.now() / 1000) + 3600;
    const end_time = Math.floor(Date.now() / 1000) + 5400;
    const payload = {
      title: "Test Event on new Calendar",
      description: "Test Description",
      visibility: "private",
      participants: [
        {
          email: "kiran.raju@nylas.com",
        },
      ],
      when: {
        start_time,
        end_time,
      },
    };

    cy.wait(5000);

    cy.createEvent({
      grantId,
      eventId: undefined,
      calendarId: calendar.id,
      payload,
    });

    cy.get("@apiResponse").then(function (response: any) {
      const event = response.body.data;
      cy.compareObjects("Event", event, payload);
      assert.isTrue(
        encodeURIComponent(calendar.id) === event.calendar_id,
        `The calendar id match\n Expected:${calendar.id}\n Returned:${event.calendar_id}`
      );
    });
  });

  it("should allow you to create an Event datespan on that calendar", function () {
    const { grantId } = this.calendarConfig;
    const calendar = this[calendarKey];

    const startDate = startOfToday();
    const endDate = add(startDate, {
      days: 1,
    });

    const start_date = format(startDate, "yyyy-MM-dd");
    const end_date = format(endDate, "yyyy-MM-dd");

    const payload = {
      title: "Test Event on new Calendar",
      description: "Test Description",
      when: {
        start_date,
        end_date,
      },
    };

    cy.wait(5000);

    cy.createEvent({
      grantId,
      eventId: undefined,
      calendarId: calendar.id,
      payload,
    });

    cy.get("@apiResponse").then(function (response: any) {
      const event = response.body.data;
      cy.compareObjects("Event", event, payload);
      assert.isTrue(
        encodeURIComponent(calendar.id) === event.calendar_id,
        `The calendar id match\n Expected:${calendar.id}\n Returned:${event.calendar_id}`
      );
    });
  });

  it("should allow you to create an Event date on that calendar", function () {
    const { grantId } = this.calendarConfig;
    const calendar = this[calendarKey];

    const startDate = startOfToday();

    const date = format(startDate, "yyyy-MM-dd");

    const payload = {
      title: "Test Event on new Calendar",
      description: "Test Description",
      when: {
        date,
      },
    };

    cy.wait(5000);

    cy.createEvent({
      grantId,
      eventId: undefined,
      calendarId: calendar.id,
      payload,
    });

    cy.get("@apiResponse").then(function (response: any) {
      const event = response.body.data;
      cy.compareObjects("Event", event, payload);
      assert.isTrue(
        encodeURIComponent(calendar.id) === event.calendar_id,
        `The calendar id match\n Expected:${calendar.id}\n Returned:${event.calendar_id}`
      );
    });
  });
});

describe("Virtual Calendar Max count", function () {
  beforeEach(() => {
    cy.fixture("calendars.fixture").then(function (config: any) {
      const { virtualCalendarGrantId: grantId } = config;
      cy.wrap(config).as("calendarConfig");
      let calendarIds: string[] = [];
      for (let i = 0; i < 10; i++) {
        cy.createCalendar({
          grantId,
          payload: {
            name: `Cypress Recurrence ${faker.string.uuid()}`,
          },
        });
        cy.get(`@apiResponse`).then((res: any) => {
          const calendar = res.body.data;
          calendarIds.push(calendar.id);
        });
      }
      cy.wrap(calendarIds).as("calendarIdsToDelete");
    });
  });

  afterEach(() => {
    cy.fixture("calendars.fixture").then(function (config: any) {
      const { virtualCalendarGrantId: grantId } = config;
      cy.getCalendars({
        grantId,
      });

      cy.get("@apiResponse").then((res: any) => {
        const calendars = res.body.data;

        for (const calendar of calendars) {
          cy.deleteCalendar({
            grantId,
            calendarId: calendar.id,
          });
        }
      });
    });
  });
  it("should fail when I try to create the 11th calendar", function () {
    cy.get("@calendarConfig").then((config: any) => {
      const { virtualCalendarGrantId: grantId } = config;
      cy.createCalendar({
        grantId,
        payload: {
          name: `Cypress Recurrence ${faker.string.uuid()}`,
        },
        flags: {
          checkError: true,
          checkOkay: false,
        },
      });
      cy.get("@calendarIdsToDelete").then((ids: any) => {
        for (const id of ids) {
          cy.deleteCalendar({
            grantId,
            calendarId: id,
          });
        }
      });
    });
  });
});
