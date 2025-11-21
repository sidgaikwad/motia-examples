import { ApiRouteConfig, Handlers, Logger } from "motia";
import z from "zod";

interface submitRequestBody {
  email: string;
  channel: string;
}

const bodySchema = z.object({
  email: z.string(),
  channel: z.string().min(1),
});

const responseSchema = {
  201: z.object({
    alert_id: z.string(),
    message: z.string(),
  }),
  400: z.object({ error: z.string() }),
  500: z.object({ error: z.string() }),
};

export const config: ApiRouteConfig = {
  type: "api",
  method: "POST",
  path: "/post",
  emits: ["youtube.title"],
  description: "Generate a YouTube video title based on the provided topic.",
  name: "Generate YouTube Title",
  flows: ["youtube-ai"],
  bodySchema: bodySchema,
};

export const handler: Handlers["Generate YouTube Title"] = async (
  req,
  { logger, emit, state }
) => {
  try {
    logger.info("Received the data", req.body);
    const { email, channel } = req.body as submitRequestBody;

    if (!channel || !email) {
      logger.error("No channel or email provided in the request body.");
      return {
        status: 400,
        error: "Bad Request: 'channel' and 'email' are required fields.",
      };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      logger.error("Invalid email format provided.");
      return {
        status: 400,
        error: "Bad Request: 'email' is not in a valid format.",
      };
    }

    const jobId = `job_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    await state.set("youtube_title", jobId, {
      status: "queued",
      jobId,
      email,
      channel,
      createdAt: new Date().toISOString(),
    });

    logger.info(`Job ${jobId} has been queued successfully.`);

    await emit({
      topic: "youtube.title",
      data: { jobId, email, channel },
    });
    return {
      success: true,
      status: 200,
      body: { message: "Job queued successfully", jobId },
    };
  } catch (error) {
    logger.error("Error generating YouTube video title:", error);
    return {
      status: 500,
      error: "Internal Server Error",
    };
  }
};
