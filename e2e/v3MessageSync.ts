import axios from "axios";
import dotenv from "dotenv";
import pino from "pino";
import pinoPretty from "pino-pretty";

dotenv.config();

const token = process.env.API_KEY;

const logger = pino(pinoPretty({}));

const start = 1683456704;
const end = 1687929027;
const limit = 200;

const url = () =>
  `https://api.us.nylas.com/v3/grants/f8821384-544c-4730-b133-ee339510bd31/messages?&received_after=${start}&limit=${limit}`;

const syncMessages = async () => {
  let data = [];
  let next_cursor: string | null = "";
  while (next_cursor !== null) {
    let endpoint: string = next_cursor
      ? `${url()}&page_token=${next_cursor}`
      : url();

    try {
      const start = Date.now();
      let response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const end = Date.now();
      if (response.data.data.length) {
        logger.info(
          `\nRequested Messages ${endpoint}\nRequested limit=${limit}\n Received Limit: ${
            response.data.data.length
          }\n Latency: ${end - start}ms\n \Request ID- ${
            response.data.request_id
          }`
        );
        data.push(...response.data.data);
      }
      if (response.data.next_cursor) {
        next_cursor = response.data.next_cursor;
      } else {
        next_cursor = null;
      }
    } catch (error: any) {
      logger.error(`Error: ${error} ${endpoint}`);
      logger.info(error?.response.data);
    }
  }
  return data;
};

const timeAggregateData = async () => {
  const start = Date.now();
  let data = await syncMessages();

  const end = Date.now();

  const duration = end - start;

  console.log(`Aggregation completed in ${duration}ms`);
  return data;
};

export { timeAggregateData };
