import type { ICommonRequestFields } from "support/utils";

/** This tests after each hook will fail because microsoft moves the draft to a specific folder */
describe("Draft - Google E2E Test", () => {
  let draftKey: ICommonRequestFields["draftKey"] = "microsoftDraft";
  let provider: ICommonRequestFields["provider"] = "microsoft";

  describe("Create a Draft", () => {
    beforeEach(() => {
      cy.draftsTestBeforeEach({ draftKey, provider });
    });

    afterEach(() => {
      cy.draftsTestAfterEach({ draftKey, provider });
    });

    it("draft should match the payload", function () {
      const draft = this[draftKey];

      cy.compareObjects("Message", draft, this.payload);
    });

    /***
     * TODO Change this when the PUT call is done for Microsoft - HTTP 501
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
        assert.equal(updatedDraft.id, draft.id, "Draft id did not change");
      });
    });
  });
});
