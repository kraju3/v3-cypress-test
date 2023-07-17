const { RRuleSet, RRule, datetime } = require("rrule");
const rruleSet = new RRuleSet();

// Add a rrule to rruleSet
rruleSet.rrule(
  new RRule({
    freq: RRule.DAILY,
    count: 36,
    dtstart: datetime(2023, 7, 17, 9, 30),
    until: datetime(2023, 8, 22, 9, 30),
  })
);

// Add a exclusion date to rruleSet
rruleSet.exdate(datetime(2023, 7, 22, 9, 30));

// To string
console.log(rruleSet.toString().split("\n"));
