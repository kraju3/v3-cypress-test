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
      createEvent: (params: EventQueryParams) => void;
      getEvents: (params: EventQueryParams) => void;
      updateEvent: (params: EventQueryParams) => void;
      deleteEvent: (params: EventQueryParams) => void;
      rsvpEvent: (params: EventQueryParams) => void;
      evenTestBeforeEach: (params: Partial<EventQueryParams>) => void;
      evenTestAfterEach: (params: Partial<EventQueryParams>) => void;

      //Calendars
      createCalendar: (params: CalendarRequestParams) => void;
      getCalendars: (params: CalendarRequestParams) => void;
      updateCalendar: (params: CalendarRequestParams) => void;
      deleteCalendar: (params: CalendarRequestParams) => void;
      calendarTestBeforeEach: (params: Partial<CalendarRequestParams>) => void;
      calendarTestAfterEach: (params: Partial<CalendarRequestParams>) => void;

      //Messages

      sendMessage: (params: MessageRequestParams) => void;
      getMessages: (params: MessageRequestParams) => void;
      updateMessage: (params: MessageRequestParams) => void;
      deleteMessage: (params: MessageRequestParams) => void;
      messageTestBeforeEach: (params: Partial<MessageRequestParams>) => void;
      messageTestAfterEach: (params: Partial<MessageRequestParams>) => void;

      //draft
      createDraft: (params: DraftRequestParams) => void;
      getDrafts: (params: DraftRequestParams) => void;
      updateDraft: (params: DraftRequestParams) => void;
      deleteDraft: (params: DraftRequestParams) => void;
      draftsTestBeforeEach: (params: Partial<DraftRequestParams>) => void;
      draftsTestAfterEach: (params: Partial<EventQueryParams>) => void;

      //folders
      createFolder: (params: FolderRequestParams) => void;
      getFolders: (params: FolderRequestParams) => void;
      updateFolder: (params: FolderRequestParams) => void;
      deleteFolder: (params: FolderRequestParams) => void;
      foldersTestBeforeEach: (params: Partial<FolderRequestParams>) => void;
      foldersTestAfterEach: (params: Partial<EventQueryParams>) => void;

      //utils
      compareObjects: (object: string, actual: any, expected: any) => void;
      checkApiResponse: (
        response: any,
        flags?: Partial<{ checkData: boolean; checkError: boolean }>
      ) => void;
      apiRequest: (
        requestConfig: Partial<Cypress.RequestOptions>,
        flags?: Partial<{ checkData: boolean; checkError: boolean }>
      ) => void;
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
