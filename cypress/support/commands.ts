import type { CalendarRequestParams } from "./calendar.command";
import CalendarCommands from "./calendar.command";
import type { DraftRequestParams } from "./draft.command";
import DraftCommands from "./draft.command";
import type { EventQueryParams } from "./event.command";
import EventCommands from "./event.command";
import type { FolderRequestParams } from "./folder.command";
import FolderCommands from "./folder.command";
import type { MessageRequestParams } from "./message.command";
import MessageCommands from "./message.command";
import UtilCommand from "./utils";

declare global {
  namespace Cypress {
    interface Chainable {
      //Events
      createEvent: (params: EventQueryParams) => Chainable<void>;
      getEvents: (params: EventQueryParams) => Chainable<void>;
      updateEvent: (params: EventQueryParams) => Chainable<void>;
      deleteEvent: (params: EventQueryParams) => Chainable<void>;
      rsvpEvent: (params: EventQueryParams) => Chainable<void>;
      evenTestBeforeEach: (
        params: Partial<EventQueryParams>
      ) => Chainable<void>;
      evenTestAfterEach: (params: Partial<EventQueryParams>) => Chainable<void>;

      //Calendars
      createCalendar: (params: CalendarRequestParams) => Chainable<void>;
      getCalendars: (params: CalendarRequestParams) => Chainable<void>;
      updateCalendar: (params: CalendarRequestParams) => Chainable<void>;
      deleteCalendar: (params: CalendarRequestParams) => Chainable<void>;
      calendarTestBeforeEach: (
        params: Partial<CalendarRequestParams>
      ) => Chainable<void>;
      calendarTestAfterEach: (
        params: Partial<CalendarRequestParams>
      ) => Chainable<void>;

      //Messages

      sendMessage: (params: MessageRequestParams) => Chainable<void>;
      getMessages: (params: MessageRequestParams) => Chainable<void>;
      updateMessage: (params: MessageRequestParams) => Chainable<void>;
      deleteMessage: (params: MessageRequestParams) => Chainable<void>;
      messageTestBeforeEach: (
        params: Partial<MessageRequestParams>
      ) => Chainable<void>;
      messageTestAfterEach: (
        params: Partial<MessageRequestParams>
      ) => Chainable<void>;

      //draft
      createDraft: (params: DraftRequestParams) => Chainable<void>;
      getDrafts: (params: DraftRequestParams) => Chainable<void>;
      updateDraft: (params: DraftRequestParams) => Chainable<void>;
      deleteDraft: (params: DraftRequestParams) => Chainable<void>;
      draftsTestBeforeEach: (
        params: Partial<DraftRequestParams>
      ) => Chainable<void>;
      draftsTestAfterEach: (
        params: Partial<DraftRequestParams>
      ) => Chainable<void>;

      //folders
      createFolder: (params: FolderRequestParams) => Chainable<void>;
      getFolders: (params: FolderRequestParams) => Chainable<void>;
      updateFolder: (params: FolderRequestParams) => Chainable<void>;
      deleteFolder: (params: FolderRequestParams) => Chainable<void>;
      foldersTestBeforeEach: (
        params: Partial<FolderRequestParams>
      ) => Chainable<void>;
      foldersTestAfterEach: (
        params: Partial<FolderRequestParams>
      ) => Chainable<void>;
      checkIfSubFolder: (
        params: Partial<FolderRequestParams>
      ) => Chainable<void>;

      //utils
      compareObjects: (
        object: string,
        actual: any,
        expected: any
      ) => Chainable<void>;
      checkApiResponse: (
        response: any,
        flags?: Partial<{ checkData: boolean; checkError: boolean }>
      ) => Chainable<void>;
      apiRequest: (
        requestConfig: Partial<Cypress.RequestOptions>,
        flags?: Partial<{ checkData: boolean; checkError: boolean }>
      ) => Chainable<void>;
    }
  }
}

//Utils
Cypress.Commands.add("compareObjects", UtilCommand.compareObjects);
Cypress.Commands.add("apiRequest", UtilCommand.apiRequest);
Cypress.Commands.add("checkApiResponse", UtilCommand.checkApiResponse);

//Event
Cypress.Commands.add("createEvent", EventCommands.createEvent);
Cypress.Commands.add("deleteEvent", EventCommands.deleteEvent);
Cypress.Commands.add("updateEvent", EventCommands.updateEvent);
Cypress.Commands.add("getEvents", EventCommands.getEvents);
Cypress.Commands.add("rsvpEvent", EventCommands.rsvPEvent);
Cypress.Commands.add(
  "evenTestBeforeEach",
  EventCommands.eventTestBeforeEachHook
);
Cypress.Commands.add("evenTestAfterEach", EventCommands.eventTestAfterEachHook);

//Message
Cypress.Commands.add("sendMessage", MessageCommands.sendMessage);
Cypress.Commands.add("deleteMessage", MessageCommands.deleteMessage);
Cypress.Commands.add("updateMessage", MessageCommands.updateMessage);
Cypress.Commands.add("getMessages", MessageCommands.getMessages);
Cypress.Commands.add(
  "messageTestBeforeEach",
  MessageCommands.messageTestBeforeEachHook
);
Cypress.Commands.add(
  "messageTestAfterEach",
  MessageCommands.messageTestAfterEachHook
);

//Drafts

Cypress.Commands.add("createDraft", DraftCommands.createDraft);
Cypress.Commands.add("deleteDraft", DraftCommands.deleteDraft);
Cypress.Commands.add("updateDraft", DraftCommands.updateDraft);
Cypress.Commands.add("getDrafts", DraftCommands.getDrafts);
Cypress.Commands.add(
  "draftsTestBeforeEach",
  DraftCommands.draftsTestBeforeEachHook
);
Cypress.Commands.add(
  "draftsTestAfterEach",
  DraftCommands.draftsTestAfterEachHook
);

//Folders
Cypress.Commands.add("createFolder", FolderCommands.createFolder);
Cypress.Commands.add("deleteFolder", FolderCommands.deleteFolder);
Cypress.Commands.add("updateFolder", FolderCommands.updateFolder);
Cypress.Commands.add("getFolders", FolderCommands.getFolders);
Cypress.Commands.add(
  "foldersTestBeforeEach",
  FolderCommands.foldersTestBeforeEachHook
);
Cypress.Commands.add(
  "foldersTestAfterEach",
  FolderCommands.foldersTestAfterEachHook
);
Cypress.Commands.add("checkIfSubFolder", FolderCommands.checkIfSubFolder);

//Calendar
Cypress.Commands.add("createCalendar", CalendarCommands.createCalendar);
Cypress.Commands.add("deleteCalendar", CalendarCommands.deleteCalendar);
Cypress.Commands.add("updateCalendar", CalendarCommands.updateCalendar);
Cypress.Commands.add("getCalendars", CalendarCommands.getCalendars);
Cypress.Commands.add(
  "calendarTestBeforeEach",
  CalendarCommands.calendarTestBeforeEachHook
);
Cypress.Commands.add(
  "calendarTestAfterEach",
  CalendarCommands.calendarTestAfterEachHook
);
