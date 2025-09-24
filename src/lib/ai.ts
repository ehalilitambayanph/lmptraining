import { format } from "date-fns";

export type QuestionType = "shortText" | "longForm" | "multipleChoice";

export interface QuestionDefinition {
  id: string;
  prompt: string;
  type: QuestionType;
  required: boolean;
  options: string[];
}

export type ConferencingProvider = "zoom" | "gmeet" | "teams" | "custom";

export interface EventDetails {
  name: string;
  description: string;
  duration: number;
  timezone: string;
  availability: string[];
  buffer: number;
  minNotice: number;
  webhookUrl: string;
  apiTargets: string[];
  conferencing: {
    provider: ConferencingProvider;
    autoGenerate: boolean;
    joinLink: string;
    instructions: string;
  };
}

export interface LandingDefinition {
  headline: string;
  subheadline: string;
  callToAction: string;
  successMessage: string;
  redirectUrl: string;
  brandColor: string;
  featuredBenefits: string[];
}

export interface AutomationConfig {
  email: {
    enabled: boolean;
    subject: string;
    template: string;
  };
  sms: {
    enabled: boolean;
    template: string;
  };
  voice: {
    enabled: boolean;
    provider: string;
    script: string;
    handoffNumber: string;
  };
  reminders: {
    enabled: boolean;
    offsets: string[];
    message: string;
  };
}

export interface ProposalInput {
  eventDetails: EventDetails;
  landing: LandingDefinition;
  questionnaire: QuestionDefinition[];
  automations: AutomationConfig;
}

interface OpenAIChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
  error?: {
    message?: string;
  };
}

const buildFallbackProposal = (input: ProposalInput) => {
  const { eventDetails, landing, questionnaire, automations } = input;

  const formattedAvailability = eventDetails.availability.length
    ? eventDetails.availability.join(", ")
    : "Flexible availability provided upon request";

  const questionnaireHighlights = questionnaire
    .map((question, index) => {
      const prefix = `${index + 1}. ${question.prompt}`;
      if (question.type === "multipleChoice" && question.options.length) {
        return `${prefix} (multiple choice: ${question.options.join(", ")})`;
      }
      return prefix;
    })
    .join("\n");

  const automationHighlights = [
    automations.email.enabled
      ? `• Branded email confirmations using subject "${automations.email.subject}"`
      : null,
    automations.sms.enabled
      ? "• SMS reminders triggered on every confirmed booking"
      : null,
    automations.voice.enabled
      ? `• ${automations.voice.provider} AI voice agent primed with a scripted pre-call warmup`
      : null,
    automations.reminders.enabled
      ? `• Meeting reminders scheduled for ${automations.reminders.offsets.join(", ") || "custom times"}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  const nextStepsDate = format(new Date(), "MMMM d, yyyy");

  return [
    `# Appointmentlyy Service Proposal for ${eventDetails.name}`,
    "",
    "## Engagement Summary",
    `- **Duration:** ${eventDetails.duration} minutes (includes ${eventDetails.buffer} minute buffer)` ,
    `- **Time zone:** ${eventDetails.timezone}`,
    `- **Availability:** ${formattedAvailability}`,
    `- **Conferencing:** ${eventDetails.conferencing.provider.toUpperCase()} ${
      eventDetails.conferencing.autoGenerate
        ? "with automatic link creation"
        : eventDetails.conferencing.joinLink
          ? `(${eventDetails.conferencing.joinLink})`
          : ""
    }`,
    "",
    "## Client Intake Strategy",
    questionnaireHighlights || "The intake form is ready to be personalised for each booking.",
    "",
    "## Automation & Follow-up",
    automationHighlights || "Automations can be enabled as needed for this experience.",
    "",
    "## Landing Experience",
    `Prospects will land on a branded page titled "${landing.headline}" with the call-to-action "${landing.callToAction}".`,
    `Key benefits surfaced: ${landing.featuredBenefits.join(", ")}.`,
    `Upon completion attendees see a success state that says: "${landing.successMessage}" and are redirected to ${landing.redirectUrl}.`,
    "",
    "## Implementation Next Steps",
    `1. Connect the Appointmentlyy API to ${eventDetails.apiTargets.join(", ") || "your preferred stack"}.`,
    "2. Sync conferencing credentials so links are created instantly for every booking.",
    "3. Map questionnaire responses into your CRM workflow and hand-off automation sequences.",
    `4. Go-live target: ${nextStepsDate}.`,
  ].join("\n");
};

export const generateServiceProposal = async (input: ProposalInput): Promise<string> => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackProposal(input);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are Appointmentlyy, an AI assistant that creates professional service proposals from scheduling configurations.",
          },
          {
            role: "user",
            content: `Create a concise and persuasive proposal using the following scheduling data: ${JSON.stringify(input)}`,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = (await response.json()) as OpenAIChatResponse;

    const message = data.choices?.[0]?.message?.content?.trim();

    if (message) {
      return message;
    }

    console.warn("OpenAI returned no content", data.error?.message);
  } catch (error) {
    console.error("Failed to generate proposal with OpenAI", error);
  }

  return buildFallbackProposal(input);
};
