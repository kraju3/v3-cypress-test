import type { ICommonRequestFields } from "support/utils";

describe("Draft - Google E2E Test", () => {
  let draftKey: ICommonRequestFields["draftKey"] = "googleDraft";
  describe("Create a Draft", () => {
    beforeEach(() => {
      cy.draftsTestBeforeEach({ draftKey });
    });

    afterEach(() => {
      cy.draftsTestAfterEach({ draftKey });
    });

    it("draft should match the payload", function () {
      const draft = this[draftKey];

      cy.compareObjects("Message", draft, this.payload);
    });

    /***
     * TODO Change this when the PUT call is done for Google- HTTP 501
     */
    it("should allow me to update the draft and see if the properties match", function () {
      const draft = this[draftKey];
      const { grantId, putPayload } = this.draftConfig;

      cy.updateDraft({
        grantId,
        payload: putPayload,
        draftId: draft.id,
      });

      cy.get("@apiResponse").then((res: any) => {
        const updatedDraft = res.body.data;
        cy.compareObjects("Draft", updatedDraft, putPayload);

        //check if the id changed or not
        assert.equal(updatedDraft.id, draft.id, "Draft id did not change");
      });
    });
  });
});
