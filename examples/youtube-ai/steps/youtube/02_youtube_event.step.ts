import { EventConfig, Handlers } from "motia";
import z from "zod";

export const config: EventConfig = {
  type: "event",
  name: "YouTube Event",
  description:
    "Event triggered when a new YouTube title generation is requested.",
  subscribes: ["youtube.title"],
  flows: ["youtube-ai"],
  emits: [],
  input: z.object({
    jobId: z.string(),
    email: z.string(),
    channel: z.string(),
  }),
};

export const handler: Handlers["YouTube Event"] = async (
  event,
  { logger, state }
) => {
  try {
    const { jobId, email, channel } = event;

    logger.info(`Processing YouTube title generation for job ${jobId}`, {
      jobId,
      email,
      channel,
    });
    // Here you would add the logic to process the YouTube title generation

    // For demonstration, we'll just log the event
    logger.info(
      `YouTube title generation event processed successfully for job ${jobId}`
    );
    return {
      success: true,
      status: 200,
      message: `YouTube event for job ${jobId} processed successfully.`,
      body: {
        jobId,
        email,
        channel,
      },
    };
  } catch (error) {
    logger.error("Error processing YouTube event", { error });
    return {
      status: 500,
      error: "Internal Server Error",
      message: (error as Error).message,
    };
  }
};
