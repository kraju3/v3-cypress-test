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
    const calendar = this[calendarKey ?? ""];

    assert.isTrue(calendar.name === this.payload.name, "Calendar name matches");
    assert.isTrue(
      calendar.description === this.payload.description,
      "Calendar description matches"
    );

    expect(calendar.read_only).eq(false, "Calendar is read-only:false");
    assert.isTrue(
      calendar.timezone === this.payload.timezone,
      "Timezone data is reflected"
    );

    assert.isDefined(calendar.location);
  });

  it("update the description", function () {
    const { grantId, putPayload } = this.eventConfig;
    const payload = {
      description: "Updated Calendar description",
      name: "New Calendar Title",
      ...putPayload,
    };

    cy.wait(20000);
    cy.updateCalendar({
      grantId,
      calendarId: this[calendarKey ?? ""].id,
      payload,
    });

    cy.get("@apiResponse").then((response: any) => {
      const calendar = response.body.data;
      assert.isTrue(
        calendar.name === payload.name,
        "Calendar title is different from POST payload"
      );
      assert.isTrue(
        calendar.description === payload.description,
        "Calendar descrption is not the same as the POST payload"
      );
    });
  });

  it("should allow you to create an Event on that calendar", function () {
    const { grantId } = this.eventConfig;
    const calendar = this[calendarKey ?? ""];

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

    cy.wait(20000);

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

  it("should not allow you to create a calendar with Google System Calendar name", function () {
    const { grantId } = this.eventConfig;
    const payload = {
      name: "Holidays in United States",
    };

    cy.createCalendar({ grantId, payload });

    cy.get("@apiResponse").then(function (response: any) {
      expect(response.status).to.be.eq(200);

      assert.isDefined(response.body.error, "No error is thrown");
    });
  });
});
