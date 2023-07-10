import axios from "axios";
import dotenv from "dotenv";
import pino from "pino";
import pinoPretty from "pino-pretty";

dotenv.config();

const token = process.env.API_KEY;

const logger = pino(pinoPretty({}));

interface GetParams {
  calendarId: string;
  limit: number;
  show_cancelled?: boolean;
  expand_recurring: boolean;
  start: number;
  end: number;
  grantId: string;
}

const calendarUrl = ({ grantId }: Partial<GetParams>) =>
  `https://api.us.nylas.com/v3/grants/${grantId}/calendars`;
const url = ({ start, end, limit, calendarId, grantId }: Partial<GetParams>) =>
  `https://api.us.nylas.com/v3/grants/${grantId}/events?calendar_id=${calendarId}&start=${start}&end=${end}&limit=${limit}`;

const getCalendars = async (grantId: string) => {
  let calendars = [];
  try {
    const response = await axios.get(calendarUrl({ grantId }), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.data.data) {
      calendars = response.data.data;
    }
  } catch (error) {
    logger.info(error);
  }
  return calendars
    .filter((cal: any) => cal.is_primary)
    .map((cal: any) => cal.id);
};

const syncEvents = async ({
  limit,
  calendarId,
  start,
  end,
  grantId,
}: Partial<GetParams>) => {
  let data = [];
  let next_cursor: string | null = "";
  const eachRequestLimit = [];
  while (next_cursor !== null) {
    let endpoint: string = next_cursor
      ? `${url({
          calendarId,
          limit,
          start,
          end,
          grantId,
        })}&page_token=${next_cursor}`
      : url({ calendarId, limit, start, end, grantId });

    try {
      let response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.data.length) {
        logger.info(
          `\nRequested Calendar:${calendarId}\nRequested limit=${limit}\n Received Limit: ${response.data.data.length}\n`
        );
        data.push(...response.data.data);
        eachRequestLimit.push(response.data.data.length);
      }
      if (response.data.next_cursor) {
        next_cursor = response.data.next_cursor;
      } else {
        next_cursor = null;
      }
    } catch (error) {
      logger.error(`Error: ${error} ${endpoint}`);
    }
  }
  return { events: data, eachRequestLimit };
};

const timeAggregateData = async ({
  limit,
  grantId,
  start,
  end,
}: Partial<GetParams>) => {
  if (!grantId) {
    throw Error("Grant Id required");
  }
  const startTime = Date.now();
  const calendarIds = await getCalendars(grantId);

  let data = [];
  let eachLimits = [];
  for (const id of calendarIds) {
    const { events, eachRequestLimit } = await syncEvents({
      calendarId: id,
      start,
      end,
      limit,
      grantId,
    });
    data.push(...events);
    eachLimits.push(...eachRequestLimit);
  }

  const endTime = Date.now();

  const duration = endTime - startTime;

  logger.info(`Aggregation completed in ${duration}ms`);
  return {
    data,
    duration,
    eachLimits,
  };
};

export { timeAggregateData };
