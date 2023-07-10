import axios from "axios";
import dotenv from "dotenv";
import pino from "pino";
import pinoPretty from "pino-pretty";

const logger = pino(pinoPretty({}));

dotenv.config();

const token = process.env.API_KEY;

const limit = 100;
const url = () =>
  `https://api.us.nylas.com/v3/grants/e578c7ac-94b3-430d-8174-0d76a6a07350/folders?limit=${limit}`;

const syncFolders = async () => {
  let data = [];
  let next_cursor: string | null = "";
  let previousNext_cursor = null;
  while (next_cursor !== null) {
    let endpoint: string = next_cursor
      ? `${url()}&page_token=${next_cursor}`
      : url();

    try {
      let response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data.data.length) {
        logger.info(
          `\nRequested Folders:${endpoint}\nRequested limit=${limit}\n Received Limit: ${response.data.data.length}\n Next Curosr:${response.data.next_cursor}\n`
        );
        data.push(...response.data.data);
      }
      if (previousNext_cursor === next_cursor) {
        logger.info("Next cursor is the same");
        break;
      }
      if (response.data.next_cursor) {
        previousNext_cursor = next_cursor;
        next_cursor = response.data.next_cursor;
      } else {
        next_cursor = null;
      }
    } catch (error) {
      logger.error(`Error: ${error} ${endpoint}`);
    }
  }
  return data;
};

const timeAggregateData = async () => {
  const start = Date.now();
  const data = await syncFolders();
  const end = Date.now();

  const duration = end - start;

  logger.info(`Aggregation completed in ${duration}ms`);
  return data;
};

timeAggregateData()
  .then((res) => logger.info(res.length))
  .catch((error) => logger.info(error));
