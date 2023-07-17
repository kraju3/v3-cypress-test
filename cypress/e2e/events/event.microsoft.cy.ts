import { faker } from "@faker-js/faker";
import { ICommonRequestFields } from "support/utils";

let eventKey: ICommonRequestFields["eventKey"] = "microsoftEvent";
let provider: ICommonRequestFields["provider"] = "microsoft";

describe.skip("Event - Microsoft Event E2E test", () => {
  /***
   * @name Microsoft Timespan Event Test
   *
   *
   * @description this contains the test of creating, deleting and updating Microsoft Meets event
   *            and also validate whether the values change over the participants calendar
   */

  describe("Event - Create a Microsoft Timespan Event", () => {
    beforeEach("Create a Microsoft timespan event", function () {
      cy.evenTestBeforeEach({ eventKey, provider });
    });

    afterEach("Clean up any after", function () {
      cy.evenTestAfterEach({ eventKey, provider });
    });

    it("should match all the properties of the payload", function () {
      const event = this[eventKey];

      assert.isTrue(event.title === this.payload.title, "Event title matches");
      // assert.isTrue(
      //   event.description === this.payload.description,
      //   "Event description matches"
      // );
      expect(event.participants).to.be.have.lengthOf(
        this.payload.participants.length,
        "Same number of participants"
      );

      expect(event.read_only).eq(false, "Calendar is read-only:false");

      expect(event.when.start_time).eq(
        this.payload.when.start_time,
        "Start time matches"
      );
      expect(event.when.end_time).eq(
        this.payload.when.end_time,
        "End time matches"
      );
    });

    it("get by metadata should work", function () {
      const { grantId, calendarId } = this.eventConfig;

      function generateQueryString(metadata: any) {
        return Object.entries(metadata).reduce((acc, [key, val]: any) => {
          acc = `${key}:${val}`;
          return acc;
        }, "");
      }

      const metadataQuery = generateQueryString(this.payload.metadata);
      cy.getEvents({
        grantId,
        calendarId,

        query: {
          metadata_pair: metadataQuery,
        },
      });

      cy.get("@apiResponse").then((res: any) => {
        expect(res.body.data.length).to.be.greaterThan(0);
        res.body.data.forEach((event: any) => {
          const eventMetadataQuery = generateQueryString(event.metadata);
          assert.equal(
            eventMetadataQuery,
            metadataQuery,
            "The metadata values don't match"
          );
        });
      });
    });

    it("update the description", function () {
      const { putPayload, grantId, calendarId } = this.eventConfig;
      const payload = {
        description: "confirmed",
        title: "Updated Title",
        ...putPayload,
      };

      cy.updateEvent({
        grantId,
        eventId: this[eventKey].id,
        calendarId,
        payload,
      });

      cy.get("@apiResponse").then((response: any) => {
        const event = response.body.data;

        cy.compareObjects("Event", event, payload);
      });
    });

    it(
      "should allow the Microsoft participant to rsvp",
      {
        retries: {
          runMode: 2,
          openMode: 1,
        },
      },
      function () {
        //TODO skipping this test for now remove this late
        this.skip();
      }
    );
  });

  /***
   * @name Microsoft Auto Conference Tests
   *
   *
   * @description this contains the test of creating, deleting and updating Microsoft Teams event
   *            and also validate whether the values change over the participants calendar
   */
  describe("Events - Microsoft Auto Conference Tests", () => {
    beforeEach("Create a Microsoft timespan event", function () {
      cy.evenTestBeforeEach({
        eventKey,
        provider,
        payload: {
          conferencing: {
            provider: "Microsoft Teams",
            autocreate: {},
          },
        },
      });
    });

    afterEach("Clean up any after", function () {
      cy.evenTestAfterEach({ eventKey, provider });
    });

    it("Conferencing object is present", function () {
      const event = this[eventKey];

      assert.isDefined(
        event.conferencing,
        "Event conferencing object is not present"
      );
      assert.isDefined(
        event.conferencing.details,
        "Event conferencing details object is not present"
      );
      assert.isDefined(
        event.conferencing.details.url,
        "Event conferencing object meeting url is not present"
      );
      assert.isDefined(
        event.conferencing.details.meeting_code,
        "Event conferencing object meeting_code is not present"
      );
      assert.equal(
        event.conferencing.provider,
        "Microsoft Teams",
        "Event conferencing provider doesn't match with Microsoft Teams"
      );
      cy.pause();
    });

    it("Update the participant list", function () {
      const { putPayload, postPayload, calendarId, grantId } = this.eventConfig;

      const newPayload = {
        ...putPayload,
        participants: [
          ...postPayload.participants,
          {
            email: "kirantestnylas2@gmail.com",
          },
        ],
      };

      const oldParticipant = postPayload.participants[0].email;

      cy.updateEvent({
        grantId,
        eventId: this[eventKey].id,
        calendarId,
        payload: newPayload,
      });

      cy.get("@apiResponse").then((response: any) => {
        const event = response.body.data;
        assert.isDefined(
          event.conferencing,
          "Conferencing object should be defined"
        );
        const newParticipant = event.participants.find(
          (p: any) => p.email === "kirantestnylas2@gmail.com"
        );

        const oldParticipant_ = event.participants.find(
          (p: any) => p.email === oldParticipant
        );

        assert.isDefined(newParticipant, "New Participant is  added");
        assert.isDefined(oldParticipant_, "Old Participant is not removed");
      });

      cy.pause();
    });

    it("Check if the participants meeting url is the same as the organizers", function () {
      cy.wait(10000);

      const { postPayload } = this.eventConfig;

      const participantGrantId = postPayload.participants[0].email;

      cy.getEvents({
        grantId: participantGrantId,
        eventId: this[eventKey].id,
        calendarId: "primary",
        payload: null,
      });

      cy.get("@apiResponse").then((response: any) => {
        const participEvent = response.body.data;
        assert.strictEqual(
          participEvent.conferencing.details.url,
          this[eventKey].conferencing.details.url,
          "Both participant and organizers meeting urls are same"
        );
      });

      it("Check that participants calendar event is read-only", function () {
        cy.get("@apiResponse").then((response: any) => {
          const event = response.body.data;

          assert.isTrue(
            event.read_only === true,
            "Participant calendar event is read-only"
          );
        });
      });
    });

    it("remove the Microsoft Teams meeting link", function () {
      const { grantId, calendarId } = this.eventConfig;
      const newPayload = {
        conferencing: null,
      };
      cy.updateEvent({
        grantId,
        eventId: this[eventKey].id,
        calendarId,
        payload: newPayload,
      });

      cy.get("@apiResponse").then((response: any) => {
        const event = response.body.data;

        assert.isUndefined(
          event.conferencing,
          "Conferencing object should not be present anymore"
        );
      });
    });
  });
});

/**
 * Microsoft Recurring Event tests
 *
 * ? Do we not support COUNT?
 *
 *
 *
 * ! The current test is doing a DAILY rule. Alter the payload for your tests
 */

describe.only("Google - Recurring Event Test", () => {
  beforeEach(() => {
    cy.evenTestBeforeEach({
      eventKey,
      provider,
      payload: {
        title: `Cypress Recurrence ${faker.string.uuid()}`,
        when: {
          start_time: 1689604200,
          end_time: 1689606000,
        },
        recurrence: {
          rrule: [
            "RRULE:FREQ=DAILY;COUNT=35;UNTIL=20230822T093000Z",
            "EXDATE:20230722T143000Z",
          ],
          timezone: "America/Chicago",
        },
      },
    });
  });

  afterEach(() => {
    cy.evenTestAfterEach({ eventKey, provider });
  });

  it("should create a recurring event", function () {
    cy.log(`Recurring Event payload${this.payload}\n Compare UI and payload`);

    cy.get(`@${eventKey}`).then((event: any) => {
      assert.isDefined(event.recurrence);
    });
  });

  it("should allow you to update master event", function () {
    cy.log(`Recurring Event payload${this.payload}\n Compare UI and payload`);

    cy.get(`@${eventKey}`).then((event: any) => {
      const { grantId } = this.eventConfig;
      cy.updateEvent({
        grantId,
        calendarId: "primary",
        eventId: event.id,
        payload: {
          description: "Updated description Event title",
        },
      });
      cy.getEvents({
        grantId,
        calendarId: "primary",
        query: {
          title: event.title,
          expand_recurring: true,
          limit: 100,
          start: 1689604200,
          end: 1692867869,
        },
      });
    });

    cy.get("@apiResponse").then((res: any) => {
      const events = res.body.data;
      //! 35 instances are based on the current payload
      assert.equal(events.length, 35, "Contains 35 events");

      events.forEach((event: any) => {
        expect(event.ical_uid).to.equals(
          this[eventKey].ical_uid,
          "ICal uid links back to master event"
        );
        expect(event.description).to.equals("Updated description Event title");
      });
    });
  });

  it("should allow you to update an instance event", function () {
    cy.log(`Recurring Event payload${this.payload}\n Compare UI and payload`);

    cy.get(`@${eventKey}`).then((event: any) => {
      const { grantId } = this.eventConfig;
      cy.getEvents({
        grantId,
        calendarId: "primary",
        query: {
          title: event.title,
          expand_recurring: true,
          limit: 100,
          start: 1689604200,
          end: 1692867869,
        },
      });
    });

    cy.get("@apiResponse").then((res: any) => {
      const events = res.body.data;
      cy.wrap(events[2]).as("eventToUpdate");
    });

    cy.get("@eventToUpdate").then((eventToUpdate: any) => {
      const { grantId } = this.eventConfig;
      cy.updateEvent({
        grantId,
        calendarId: "primary",
        eventId: eventToUpdate.id,
        payload: {
          description: "Updated description for an instance Event title",
        },
      });
      cy.get("@apiResponse").then((res: any) => {
        const updatedEvent = res.body.data;
        expect(updatedEvent.ical_uid).to.equals(
          this[eventKey].ical_uid,
          "ICal uid links back to master event"
        );
        expect(updatedEvent.description).to.equals(
          "Updated description for an instance Event title"
        );
      });
    });
  });
});
