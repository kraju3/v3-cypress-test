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
      const folder = this[folderKey];
      cy.log(folder);
      cy.compareObjects("Folder", folder, this.payload);

      expect(folder.system_folder).to.equals(
        false,
        "Folder is not a systems folder"
      );
    });

    it("folder should update name", function () {
      const folder = this[folderKey];

      const { grantId, putPayload } = this.folderConfig;
      const payload = {
        ...putPayload,
        name: `Update ${folder.name}`,
      };
      cy.updateFolder({
        grantId,
        folderId: folder.id,
        payload,
      });
      cy.get("@apiResponse").then((res: any) => {
        cy.compareObjects("Folder", res.body.data, payload);
      });
    });

    it("should throw an error if try to create the parent folder with the same name", function () {
      const parentFolder = this[folderKey];
      const { grantId, postPayload } = this.folderConfig;
      const newSubFolderPayload = {
        ...postPayload,
        name: parentFolder.name,
      };

      cy.createFolder({
        grantId,
        payload: newSubFolderPayload,
        flags: {
          checkError: false,
          checkOkay: false,
        },
      });

      cy.get("@apiResponse").then((res: any) => {
        expect(res.status).to.be.equals(
          409,
          `${res.status}: ${res?.statusText}`
        );
      });
    });
    /**
     * TODO file a bug for this
     */
    it("should allow you to create subfolders and delete them", function () {
      const parentFolder = this[folderKey];
      const { grantId, postPayload } = this.folderConfig;
      const newSubFolderPayload = {
        ...postPayload,
        name: `${parentFolder.name}/Test1`,
      };

      cy.createFolder({ grantId, payload: newSubFolderPayload });
      cy.get("@apiResponse").then((res: any) => {
        const subFolder = res.body.data;
        cy.compareObjects("SubFolder", subFolder, newSubFolderPayload);
        cy.pause();
        cy.deleteFolder({
          grantId,
          folderId: subFolder.id,
        });
      });
    });
  });
});
