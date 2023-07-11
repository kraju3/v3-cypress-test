import type { FolderRequestParams } from "support/folder.command";
import type { ICommonRequestFields } from "support/utils";

/**
 *
 * TODO file a bug for Doc to remove child_count
 */

function checkIfSubFolder({
  grantId = "",
  folderId,
  payload,
}: Partial<FolderRequestParams>) {
  cy.get("@apiResponse").then((res: any) => {
    const subFolder = res.body.data;
    cy.compareObjects("Folder", subFolder, payload);
    expect(subFolder.parent_id).to.be.equals(folderId, "Parent Id matches");
    expect(subFolder.total_count).to.be.equals(0, "Total count is 0");
    expect(subFolder.unread_count).to.be.equals(0, "Unread count is 0");
    //expect(subFolder.child_count).to.be.equals(0, "Child Count is 0");

    cy.getFolders({ grantId, folderId, payload: undefined });
    cy.get("@apiResponse").then((res: any) => {
      const parentFolderUpdated = res.body.data;

      expect(parentFolderUpdated.child_count).to.be.equals(1);
    });
    cy.deleteFolder({ grantId, folderId: subFolder.id, payload: undefined });

    //afterEach will clean up the parent Folder
  });
}

describe("Folder - Microsoft Labels E2E Test", () => {
  let folderKey: ICommonRequestFields["folderKey"] = "microsoftFolder";
  let provider: ICommonRequestFields["provider"] = "microsoft";
  describe("Create a Folder", () => {
    beforeEach(() => {
      cy.foldersTestBeforeEach({ folderKey, provider });
    });

    afterEach(() => {
      cy.foldersTestAfterEach({ folderKey, provider });
    });

    it("folder should match the payload", function () {
      const folder = this[folderKey ?? ""];

      cy.compareObjects("Folder", folder, this.payload);
    });

    it("should throw an error if try to create the parent folder with the same name", function () {
      const parentFolder = this[folderKey ?? ""];
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

    it("should allow you to create subfolders and delete them", function () {
      const parentFolder = this[folderKey ?? ""];
      const { grantId, postPayload } = this.folderConfig;
      const newSubFolderPayload = {
        ...postPayload,
        name: "Test1",
        parent_id: parentFolder.id,
      };

      cy.createFolder({ grantId, payload: newSubFolderPayload });
      checkIfSubFolder({
        grantId,
        folderId: parentFolder.id,
        payload: newSubFolderPayload,
      });
    });
  });
});
