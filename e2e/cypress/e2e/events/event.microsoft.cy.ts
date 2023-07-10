describe("Event - Microsoft Event E2E test", () => {
  let eventKey: "googleEvent" | "microsoftEvent" = "microsoftEvent";
  let provider: "google" | "microsoft" = "microsoft";
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
        payload: undefined,
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
        // assert.isTrue(
        //   response.body.data.description === payload.description,
        //   "Updated description is not reflected"
        // );

        assert.equal(
          response.body.data.title,
          payload.title,
          "Updated title is not reflected"
        );
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
        payload: {
          conferencing: {
            provider: "Microsoft Teams",
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
        assert.isDefined(
          response.body.data.conferencing,
          "Conferencing object should be defined"
        );
        const newParticipant = response.body.data.participants.find(
          (p: any) => p.email === "kirantestnylas2@gmail.com"
        );

        const oldParticipant_ = response.body.data.participants.find(
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
          assert.isTrue(
            response.body.data.read_only === true,
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
        assert.isUndefined(
          response.body.data.conferencing,
          "Conferencing object should not be present anymore"
        );
      });
    });
  });
});
