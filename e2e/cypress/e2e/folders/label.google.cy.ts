import type { ICommonRequestFields } from "support/utils";

describe("Folder - Google Labels E2E Test", () => {
  let folderKey: ICommonRequestFields["folderKey"] = "googleLabel";
  describe("Create a Folder", () => {
    beforeEach(() => {
      cy.foldersTestBeforeEach({ folderKey });
    });

    afterEach(() => {
      cy.foldersTestAfterEach({ folderKey });
    });

    it("folder should match the payload", function () {
      const folder = this[folderKey ?? ""];
      cy.log(folder);
      cy.compareObjects("Folder", folder, this.payload);

      expect(folder.system_folder).to.equals(
        false,
        "Folder is not a systems folder"
      );
    });
  });
});
