import type { ICommonRequestFields } from "support/utils";

describe("Calendar - Google E2E tests", () => {
  let calendarKey: ICommonRequestFields["calendarKey"] = "googleCalendar";
  let provider: ICommonRequestFields["provider"] = "microsoft";

  beforeEach("Create a Google Calendar", function () {
    cy.calendarTestBeforeEach({ calendarKey, provider });
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

  it("should allow you to create an Event on that calendar", function () {
    const { grantId } = this.calendarConfig;
    const calendar = this[calendarKey];

    const start_time = Math.floor(Date.now() / 1000) + 3600;
    const end_time = Math.floor(Date.now() / 1000) + 5400;
    const payload = {
      title: "Test Event on new Calendar",
      description: "Test Description",
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
      assert.isTrue(
        encodeURIComponent(calendar.id) === event.calendar_id,
        `The calendar id match\n Expected:${calendar.id}\n Returned:${event.calendar_id}`
      );
    });
  });
});
