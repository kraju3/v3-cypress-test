import type { FolderRequestParams } from "support/folder.command";
import type { ICommonRequestFields } from "support/utils";

function checkIfSubFolder({
  grantId = "",
  folderId,
  payload,
}: Partial<FolderRequestParams>) {
  cy.get("@apiResponse").then((res: any) => {
    const subFolder = res.body.data;
    cy.compareObjects("Folder", subFolder, payload);
    expect(subFolder.parent_id).to.be.equals(folderId, "Parent Id matche");
    expect(subFolder.total_count)
      .and(subFolder.unread_count)
      .and(subFolder.child_count)
      .to.be.equals(
        0,
        "Total count,unread count and child_count is all 0 for subfolder"
      );
    cy.getFolders({ grantId, folderId, payload: undefined });
    cy.get("@apiResponse").then((res: any) => {
      const parentFolderUpdated = res.body.data;

      expect(parentFolderUpdated.child_count).to.be.equals(1);
    });
    cy.deleteFolder({ grantId, folderId: subFolder.id, payload: undefined });
    //afterEach will clean up the parent Folder
  });
}

describe("Folder - Google Labels E2E Test", () => {
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
      cy.log(folder);
      cy.compareObjects("Folder", folder, this.payload);

      expect(folder.system_folder).to.equals(
        false,
        "Folder is not a systems folder"
      );
    });

    it("should throw an error if try to create the parent folder with the same name", function () {
      const parentFolder = this[folderKey ?? ""];
      const { grantId, postPayload } = this.draftConfig;
      const newSubFolderPayload = {
        ...postPayload,
        name: parentFolder.name,
      };

      cy.createFolder({
        grantId,
        payload: newSubFolderPayload,
        flags: {
          checkError: true,
          checkOkay: false,
        },
      });
    });

    it("should allow you to create subfolders and delete them", function () {
      const parentFolder = this[folderKey ?? ""];
      const { grantId, postPayload } = this.draftConfig;
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
