import { ICommonRequestFields } from "support/utils";

let eventKey: ICommonRequestFields["eventKey"] = "googleEvent";

describe("Event - Google Timespan Event E2E test", () => {
  /***
   * @name Google Timespan Event Test
   *
   *
   * @description this contains the test of creating, deleting and updating Google Meets event
   *            and also validate whether the values change over the participants calendar
   */

  describe("Event - Create a Google Timespan Event", () => {
    beforeEach("Create a Google timespan event", function () {
      cy.evenTestBeforeEach({ eventKey });
    });

    afterEach("Clean up any after", function () {
      cy.evenTestAfterEach({ eventKey });
    });

    it("should match all the properties of the payload", function () {
      const event = this[eventKey];

      assert.isTrue(event.title === this.payload.title, "Event title matches");
      assert.isTrue(
        event.description === this.payload.description,
        "Event description matches"
      );
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
        ...putPayload,
        description: "confirmed",
        title: "Updated Title",
      };

      cy.updateEvent({
        grantId,
        eventId: this[eventKey].id,
        calendarId,
        payload,
      });

      cy.get("@apiResponse").then((response: any) => {
        const event = response.body.data;
        assert.isTrue(
          event.description === payload.description,
          "Updated description is not reflected"
        );

        assert.equal(
          event.title,
          payload.title,
          "Updated title is not reflected"
        );
      });
    });
    /**
     * TWIMC: Keep in mind the participant should have a grant in your application
     */

    it(
      "should allow the Google participant to rsvp",
      {
        retries: {
          runMode: 2,
          openMode: 1,
        },
      },
      function () {
        cy.wait(5000);

        const { grantId, calendarId, putPayload, postPayload } =
          this.eventConfig;
        const rsvpPayload = {
          status: "yes",
          comment: "Yes I can make it",
        };

        const participant =
          putPayload.participants[0] ?? postPayload.participant[0];

        cy.rsvpEvent({
          calendarId: "primary",
          grantId: participant,
          eventId: this[eventKey].id,
          payload: rsvpPayload,
        });

        cy.getEvents({
          calendarId,
          grantId,
          eventId: this[eventKey].id,
          payload: null,
        });

        cy.get("@apiResponse").then((res: any) => {
          const eventData = res.body.data;
          const participant_ = eventData.participants.find(
            (particp: any) => particp.email === participant
          );

          assert.isTrue(
            participant_.status === "yes",
            "RSVP status for the participant matches"
          );
        });
      }
    );
  });

  /***
   * @name Google Auto Conference Tests
   *
   *
   * @description this contains the test of creating, deleting and updating Google Meets event
   *            and also validate whether the values change over the participants calendar
   */
  describe("Events - Google Auto Conference Tests", () => {
    beforeEach("Create a Google timespan event", function () {
      cy.evenTestBeforeEach({
        payload: {
          conferencing: {
            provider: "Google Meet",
            autocreate: {},
          },
        },
      });
    });

    afterEach("Clean up any after", function () {
      cy.evenTestAfterEach({});
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
        "Google Meet",
        "Event conferencing provider doesn't match with Google Meet"
      );
      cy.pause();
    });

    it("Update the participant list", function () {
      const { putPayload, postPayload, calendarId, grantId } = this.eventConfig;

      const newPayload = {
        ...postPayload,
        ...putPayload,
      };

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
        expect(event.participants).to.deep.equals(
          newPayload.participants ?? []
        );
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

    //*** Commented out due to a BUG */
    it("remove the Google meeting link", function () {
      const { grantId, calendarId } = this.eventConfig;
      const newPayload = {
        conferencing: {},
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

  /**
   * This test will fail if the participant don't have a valid grant. However, you can validate via UI with the pause.
   */

  describe("Google - Hide participant works for both", () => {
    beforeEach(
      "Create a Google timespan event with hide participants",
      function () {
        cy.evenTestBeforeEach({
          eventKey,
          payload: {
            hide_participants: true,
          },
        });
      }
    );

    afterEach("Clean up any after", function () {
      cy.evenTestAfterEach({ eventKey });
    });

    it("should match all the properties of the payload", function () {
      const event = this[eventKey];
      const { grantId, calendarId, postPayload } = this.eventConfig;

      assert(event.hide_participants === true, "Hide participant is true");
    });

    it("Participant event should not contain any participants", function () {
      cy.wait(5000);

      const event = this[eventKey];

      const { calendarId, postPayload } = this.eventConfig;

      const participant = postPayload.participants.filter(
        (particip: any) => particip.email !== event.organizer.email
      );

      cy.getEvents({
        calendarId,
        grantId: participant[0].email,
        eventId: this[eventKey].id,
        payload: null,
      });

      cy.get("@apiResponse").then((res: any) => {
        const eventData = res.body.data;
        const otherParticipantExist = eventData.participants.some(
          (particip: any) => particip.email !== participant[0].email
        );
        assert.isFalse(
          otherParticipantExist,
          "Only participant should be the main organizer"
        );
      });
    });
  });
});

/**
 * Google Recurring Event tests
 */

describe("Google - Recurring Event Test", () => {
  beforeEach(() => {});

  afterEach(() => {});
});
