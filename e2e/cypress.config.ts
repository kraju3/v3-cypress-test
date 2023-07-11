import { defineConfig } from "cypress";

export default defineConfig({
  projectId: "46feub",
  e2e: {
    setupNodeEvents: (on, config) => {
      const configOverrides: Partial<Cypress.PluginConfigOptions> = {
        video: false,
        screenshotOnRunFailure: false,
        watchForFileChanges: false,
      };

      // To use this:
      // cy.task('log', whateverYouWantInTheTerminal)
      on("task", {
        log: (message) => {
          console.log(message);
        },
      });

      return { ...config, ...configOverrides };
    },
  },
});
