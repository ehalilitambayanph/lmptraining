import { useMemo, useState } from "react";
import {
  CalendarPlus,
  Sparkles,
  Workflow,
  Plug,
  Code,
  Mail,
  MessageSquare,
  PhoneCall,
  BellRing,
  ClipboardList,
  Globe,
  CheckCircle,
  Link2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import {
  type AutomationConfig,
  type ConferencingProvider,
  type EventDetails,
  type LandingDefinition,
  type ProposalInput,
  type QuestionDefinition,
  type QuestionType,
  generateServiceProposal,
} from "@/lib/ai";
import { cn } from "@/lib/utils";

const timezoneOptions = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Singapore",
  "Australia/Sydney",
];

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const integrationTargets: Array<{ value: string; label: string; description: string }> = [
  { value: "node", label: "Node.js", description: "Use our TypeScript SDK or REST endpoints." },
  { value: "python", label: "Python", description: "Drop-in client with asyncio support." },
  { value: "ruby", label: "Ruby", description: "Native gem with webhook helpers." },
  { value: ".net", label: ".NET", description: "First-class SDK for C# and F# teams." },
  { value: "php", label: "PHP", description: "Composer package compatible with Laravel & Symfony." },
  { value: "go", label: "Go", description: "Idiomatic Go client with retry utilities." },
  { value: "java", label: "Java", description: "Spring Boot starter for Appointmentlyy." },
];

const reminderOptions = ["72 hours", "24 hours", "6 hours", "1 hour", "15 minutes"];

const conferencingProviders: Array<{ value: ConferencingProvider; label: string; description: string }> = [
  { value: "zoom", label: "Zoom", description: "Generate secure Zoom meetings with host + attendee links." },
  { value: "gmeet", label: "Google Meet", description: "Instant G Suite calendar events with Meet links." },
  { value: "teams", label: "Microsoft Teams", description: "Push meetings directly into Microsoft 365." },
  { value: "custom", label: "Bring your own", description: "Use a static link or a custom conferencing provider." },
];

const createQuestion = (type: QuestionType = "shortText"): QuestionDefinition => ({
  id: `question-${Math.random().toString(36).slice(2, 8)}`,
  prompt: "",
  type,
  required: true,
  options: type === "multipleChoice" ? ["Option 1", "Option 2"] : [],
});

const duplicateQuestion = (question: QuestionDefinition): QuestionDefinition => ({
  ...question,
  id: `question-${Math.random().toString(36).slice(2, 8)}`,
  options: [...question.options],
});

const buildSnapshot = (
  eventDetails: EventDetails,
  landing: LandingDefinition,
  questionnaire: QuestionDefinition[],
  automations: AutomationConfig,
): ProposalInput => ({
  eventDetails: {
    ...eventDetails,
    availability: [...eventDetails.availability],
    apiTargets: [...eventDetails.apiTargets],
    conferencing: { ...eventDetails.conferencing },
  },
  landing: {
    ...landing,
    featuredBenefits: [...landing.featuredBenefits],
  },
  questionnaire: questionnaire.map((question) => ({
    ...question,
    options: [...question.options],
  })),
  automations: {
    email: { ...automations.email },
    sms: { ...automations.sms },
    voice: { ...automations.voice },
    reminders: { ...automations.reminders, offsets: [...automations.reminders.offsets] },
  },
});

const AppointmentlyyBuilder = () => {
  const { toast } = useToast();

  const [eventDetails, setEventDetails] = useState<EventDetails>({
    name: "Discovery & Strategy Consultation",
    description:
      "45-minute intake to understand goals, tech stack, and desired automation outcomes. Includes routing to the best advisor.",
    duration: 45,
    timezone: "UTC",
    availability: ["Tuesday", "Wednesday", "Thursday"],
    buffer: 15,
    minNotice: 12,
    webhookUrl: "https://api.appointmentlyy.com/hooks/demo",
    apiTargets: ["node", "python", "go"],
    conferencing: {
      provider: "zoom",
      autoGenerate: true,
      joinLink: "",
      instructions: "Authenticated Zoom links are created automatically at confirmation.",
    },
  });

  const [landing, setLanding] = useState<LandingDefinition>({
    headline: "Book your Appointmentlyy strategy session",
    subheadline: "Bring Calendly-class scheduling, AI proposals, and omnichannel automations together in one workspace.",
    callToAction: "Schedule consultation",
    successMessage: "You're on the calendar! Watch for confirmation emails and SMS reminders shortly.",
    redirectUrl: "https://appointmentlyy.com/thank-you",
    brandColor: "#2563eb",
    featuredBenefits: [
      "Instant routing & conferencing setup",
      "AI-written service proposals sent in minutes",
      "Automation workflows for email, SMS, and voice",
    ],
  });

  const [questionnaire, setQuestionnaire] = useState<QuestionDefinition[]>([
    {
      id: "question-vision",
      prompt: "What outcome are you hoping to achieve from this engagement?",
      type: "longForm",
      required: true,
      options: [],
    },
    {
      id: "question-tools",
      prompt: "Which tools are part of your current stack?",
      type: "multipleChoice",
      required: false,
      options: ["HubSpot", "Salesforce", "Custom CRM", "Other"],
    },
  ]);

  const [automations, setAutomations] = useState<AutomationConfig>({
    email: {
      enabled: true,
      subject: "You're booked: {event_name} on {event_date}",
      template:
        "Hi {first_name},\\n\\nThanks for scheduling {event_name}. Your call is confirmed for {event_date} at {event_time}. We'll meet via {conferencing_provider}.\\n\\nBring any assets you'd like our AI analyst to review.\\n\\n- The Appointmentlyy Team",
    },
    sms: {
      enabled: true,
      template: "Reminder: {event_name} with Appointmentlyy on {event_date} at {event_time}. Reply HELP for support.",
    },
    voice: {
      enabled: false,
      provider: "Vocode AI",
      script:
        "Hi {first_name}, I'm your Appointmentlyy voice assistant. I'm calling to make sure you're set for our {event_name} on {event_date}. Reply to the SMS we just sent if you need to reschedule.",
      handoffNumber: "+1 (555) 010-2000",
    },
    reminders: {
      enabled: true,
      offsets: ["24 hours", "1 hour"],
      message:
        "We can't wait to connect! Your appointment starts soon. Need anything ahead of time? Reply to this message and the team is alerted.",
    },
  });

  const [lastPublishedConfig, setLastPublishedConfig] = useState<ProposalInput | null>(null);
  const [proposal, setProposal] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const shareUrl = useMemo(() => {
    const source = lastPublishedConfig?.eventDetails.name || eventDetails.name || "experience";
    const slug = source.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    return `https://appointmentlyy.com/${slug || "experience"}`;
  }, [eventDetails.name, lastPublishedConfig?.eventDetails.name]);

  const activePreview = lastPublishedConfig ?? buildSnapshot(eventDetails, landing, questionnaire, automations);

  const schedulePayload = useMemo(
    () => ({
      name: eventDetails.name,
      duration: eventDetails.duration,
      timezone: eventDetails.timezone,
      availability: eventDetails.availability,
      bufferMinutes: eventDetails.buffer,
      minimumNoticeHours: eventDetails.minNotice,
      conferencing: eventDetails.conferencing,
      questionnaire: questionnaire.map((question) => ({
        prompt: question.prompt,
        type: question.type,
        required: question.required,
        options: question.type === "multipleChoice" ? question.options : undefined,
      })),
      automations: {
        email: automations.email.enabled,
        sms: automations.sms.enabled,
        voice: automations.voice.enabled,
        reminders: automations.reminders.enabled ? automations.reminders.offsets : [],
      },
      webhookUrl: eventDetails.webhookUrl,
    }),
    [automations, eventDetails, questionnaire],
  );

  const payloadString = useMemo(() => JSON.stringify(schedulePayload, null, 2), [schedulePayload]);

  const integrationSnippets = useMemo(() => {
    const nodeSnippet = `import fetch from 'node-fetch';

const response = await fetch('https://api.appointmentlyy.com/v1/schedules', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(${payloadString})
});

const schedule = await response.json();`;

    const pythonSnippet = `import requests

payload = ${payloadString}
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}

response = requests.post("https://api.appointmentlyy.com/v1/schedules", json=payload, headers=headers)
print(response.json())`;

    const rubySnippet = `require 'net/http'
require 'json'

payload = ${payloadString}
uri = URI('https://api.appointmentlyy.com/v1/schedules')

request = Net::HTTP::Post.new(uri)
request['Authorization'] = 'Bearer YOUR_API_KEY'
request['Content-Type'] = 'application/json'
request.body = JSON.dump(payload)

response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
  http.request(request)
end

puts JSON.parse(response.body)`;

    return { node: nodeSnippet, python: pythonSnippet, ruby: rubySnippet };
  }, [payloadString]);

  const publishSchedule = () => {
    if (!eventDetails.name.trim()) {
      toast({
        variant: "destructive",
        title: "Add an event name",
        description: "Provide a name for the experience before publishing your schedule.",
      });
      return;
    }

    if (!eventDetails.availability.length) {
      toast({
        variant: "destructive",
        title: "Choose availability",
        description: "Select at least one day so customers can find a slot.",
      });
      return;
    }

    const snapshot = buildSnapshot(eventDetails, landing, questionnaire, automations);
    setLastPublishedConfig(snapshot);
    toast({
      title: "Schedule published",
      description: "Landing page, conferencing, and workflows are now synced.",
    });
  };

  const handleGenerateProposal = async () => {
    try {
      setIsAnalyzing(true);
      const payload = buildSnapshot(eventDetails, landing, questionnaire, automations);
      const result = await generateServiceProposal(payload);
      setProposal(result);
      toast({
        title: "AI proposal ready",
        description: "Appointmentlyy analysed the submission and created a tailored plan.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Unable to generate proposal",
        description: "Double-check your OpenAI credentials and try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateQuestion = (id: string, update: Partial<QuestionDefinition>) => {
    setQuestionnaire((previous) =>
      previous.map((question) => (question.id === id ? { ...question, ...update } : question)),
    );
  };

  const toggleAvailability = (day: string, checked: boolean) => {
    setEventDetails((previous) => {
      const availability = checked
        ? Array.from(new Set([...previous.availability, day]))
        : previous.availability.filter((existing) => existing !== day);

      return { ...previous, availability };
    });
  };

  const toggleApiTarget = (target: string, checked: boolean) => {
    setEventDetails((previous) => {
      const apiTargets = checked
        ? Array.from(new Set([...previous.apiTargets, target]))
        : previous.apiTargets.filter((item) => item !== target);

      return { ...previous, apiTargets };
    });
  };

  const toggleReminder = (offset: string, checked: boolean) => {
    setAutomations((previous) => {
      const offsets = checked
        ? Array.from(new Set([...previous.reminders.offsets, offset]))
        : previous.reminders.offsets.filter((value) => value !== offset);

      return { ...previous, reminders: { ...previous.reminders, offsets } };
    });
  };

  const addQuestion = (type: QuestionType = "shortText") => {
    setQuestionnaire((previous) => [...previous, createQuestion(type)]);
  };

  const removeQuestion = (id: string) => {
    setQuestionnaire((previous) => previous.filter((question) => question.id !== id));
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({ title: "Share link copied", description: "Send it to customers or embed it on your site." });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Clipboard unavailable",
        description: "Copy the link manually if clipboard access is blocked.",
      });
    }
  };

  const activeStacks = eventDetails.apiTargets;

  return (
    <div className="min-h-screen bg-gradient-subtle pb-16">
      <div className="border-b bg-card/80 shadow-sm">
        <div className="container mx-auto grid items-center gap-10 px-6 py-12 md:grid-cols-[1.8fr,1fr]">
          <div className="space-y-6">
            <Badge className="bg-primary/10 text-primary">
              Appointmentlyy Platform
            </Badge>
            <div className="space-y-4">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Build the scheduling OS that wins every meeting</h1>
              <p className="text-lg text-muted-foreground">
                Appointmentlyy is the API-first scheduler that rivals Calendly and Luncal with instant conferencing, AI-assisted
                proposals, and automation workflows spanning email, SMS, voice, and in-product notifications.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" onClick={publishSchedule}>
                <CalendarPlus className="h-4 w-4" /> Publish schedule
              </Button>
              <Button size="lg" variant="outline" onClick={handleGenerateProposal} disabled={isAnalyzing}>
                <Sparkles className="h-4 w-4" /> {isAnalyzing ? "Analysing..." : "Generate AI proposal"}
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Plug className="h-4 w-4 text-primary" /> Native conferencing for Zoom, Meet & Teams
              </div>
              <div className="flex items-center gap-2">
                <Workflow className="h-4 w-4 text-primary" /> Visual automation builder for omni-channel follow-up
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> AI-powered landing pages & proposals
              </div>
            </div>
          </div>
          <Card className="shadow-elegant border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                Go-live checklist
                <CheckCircle className="h-5 w-5 text-success" />
              </CardTitle>
              <CardDescription>
                Track the critical building blocks before sending your booking link to customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-sm">
              <div className="flex items-center justify-between">
                <span>Connected conferencing</span>
                <Badge variant="secondary" className="capitalize">
                  {eventDetails.conferencing.provider}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Questionnaire length</span>
                <Badge variant="secondary">{questionnaire.length} prompts</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>Automation channels</span>
                <Badge variant="secondary">
                  {[
                    automations.email.enabled && "Email",
                    automations.sms.enabled && "SMS",
                    automations.voice.enabled && "Voice",
                    automations.reminders.enabled && "Reminders",
                  ]
                    .filter(Boolean)
                    .join(" • ") || "Draft"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span>API coverage</span>
                <Badge variant="secondary">{activeStacks.length} stacks</Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="share-link" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Booking link preview
                </Label>
                <div className="flex items-center gap-2">
                  <Input id="share-link" value={shareUrl} readOnly className="text-sm" />
                  <Button type="button" variant="outline" onClick={copyShareLink}>
                    <Link2 className="h-4 w-4" /> Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <main className="container mx-auto mt-12 space-y-10 px-6">
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <CalendarPlus className="h-5 w-5 text-primary" /> Schedule configuration
              </CardTitle>
              <CardDescription>
                Define the experience details, booking rules, and conference preferences your team will rely on.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="event-name">Event name</Label>
                  <Input
                    id="event-name"
                    value={eventDetails.name}
                    onChange={(event) => setEventDetails((previous) => ({ ...previous, name: event.target.value }))}
                    placeholder="Product demo, onboarding session, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={15}
                    value={eventDetails.duration}
                    onChange={(event) =>
                      setEventDetails((previous) => ({ ...previous, duration: Number(event.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Primary time zone</Label>
                  <Select
                    value={eventDetails.timezone}
                    onValueChange={(value) => setEventDetails((previous) => ({ ...previous, timezone: value }))}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select a timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      {timezoneOptions.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buffer">Buffer between meetings (minutes)</Label>
                  <Input
                    id="buffer"
                    type="number"
                    min={0}
                    value={eventDetails.buffer}
                    onChange={(event) =>
                      setEventDetails((previous) => ({ ...previous, buffer: Number(event.target.value) || 0 }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-description">Customer-facing description</Label>
                <Textarea
                  id="event-description"
                  value={eventDetails.description}
                  onChange={(event) => setEventDetails((previous) => ({ ...previous, description: event.target.value }))}
                  placeholder="Explain why someone should book with you."
                  rows={4}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">Recurring availability</Label>
                <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                  {daysOfWeek.map((day) => {
                    const checked = eventDetails.availability.includes(day);
                    return (
                      <div key={day} className={cn("flex items-center gap-3 rounded-lg border p-3", checked && "border-primary")}
                      >
                        <Checkbox
                          id={`availability-${day}`}
                          checked={checked}
                          onCheckedChange={(value) => toggleAvailability(day, value === true)}
                        />
                        <Label htmlFor={`availability-${day}`} className="text-sm font-medium">
                          {day}
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="notice">Minimum notice (hours)</Label>
                  <Input
                    id="notice"
                    type="number"
                    min={0}
                    value={eventDetails.minNotice}
                    onChange={(event) =>
                      setEventDetails((previous) => ({ ...previous, minNotice: Number(event.target.value) || 0 }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook">Webhook URL</Label>
                  <Input
                    id="webhook"
                    type="url"
                    value={eventDetails.webhookUrl}
                    onChange={(event) => setEventDetails((previous) => ({ ...previous, webhookUrl: event.target.value }))}
                    placeholder="https://api.yourcompany.com/appointmentlyy"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Plug className="h-5 w-5 text-primary" /> Conferencing setup
              </CardTitle>
              <CardDescription>
                Choose which conferencing provider to sync and how meeting links are generated.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="conferencing-provider">Provider</Label>
                <Select
                  value={eventDetails.conferencing.provider}
                  onValueChange={(value) =>
                    setEventDetails((previous) => ({
                      ...previous,
                      conferencing: { ...previous.conferencing, provider: value as ConferencingProvider },
                    }))
                  }
                >
                  <SelectTrigger id="conferencing-provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {conferencingProviders.map((provider) => (
                      <SelectItem key={provider.value} value={provider.value}>
                        {provider.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
                {conferencingProviders.find((provider) => provider.value === eventDetails.conferencing.provider)?.description}
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-1">
                  <div className="font-medium">Auto-generate unique meeting links</div>
                  <p className="text-sm text-muted-foreground">
                    Appointmentlyy will use OAuth to create host and attendee links instantly after booking.
                  </p>
                </div>
                <Switch
                  checked={eventDetails.conferencing.autoGenerate}
                  onCheckedChange={(value) =>
                    setEventDetails((previous) => ({
                      ...previous,
                      conferencing: { ...previous.conferencing, autoGenerate: value },
                    }))
                  }
                />
              </div>

              {!eventDetails.conferencing.autoGenerate && (
                <div className="space-y-2">
                  <Label htmlFor="join-link">Static conferencing link</Label>
                  <Input
                    id="join-link"
                    type="url"
                    value={eventDetails.conferencing.joinLink}
                    onChange={(event) =>
                      setEventDetails((previous) => ({
                        ...previous,
                        conferencing: { ...previous.conferencing, joinLink: event.target.value },
                      }))
                    }
                    placeholder="https://meet.example.com/your-room"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="conferencing-instructions">Internal instructions</Label>
                <Textarea
                  id="conferencing-instructions"
                  value={eventDetails.conferencing.instructions}
                  onChange={(event) =>
                    setEventDetails((previous) => ({
                      ...previous,
                      conferencing: { ...previous.conferencing, instructions: event.target.value },
                    }))
                  }
                  placeholder="Notes for hosts, backup dial-in details, or escalation steps."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ClipboardList className="h-5 w-5 text-primary" /> Questionnaire builder
              </CardTitle>
              <CardDescription>
                Capture the context Appointmentlyy will send to the AI proposal engine and your automation workflows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-wrap gap-3">
                <Button type="button" onClick={() => addQuestion("shortText")}>Add short answer</Button>
                <Button type="button" variant="outline" onClick={() => addQuestion("longForm")}>
                  Add long-form
                </Button>
                <Button type="button" variant="outline" onClick={() => addQuestion("multipleChoice")}>
                  Add multiple choice
                </Button>
              </div>

              <div className="space-y-4">
                {questionnaire.map((question) => (
                  <Card key={question.id} className="border border-primary/10">
                    <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{question.prompt || "Untitled question"}</CardTitle>
                        <CardDescription className="capitalize">{question.type}</CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={question.required}
                          onCheckedChange={(value) => updateQuestion(question.id, { required: value })}
                        />
                        <span className="text-sm text-muted-foreground">Required</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setQuestionnaire((previous) => [...previous, duplicateQuestion(question)])}
                        >
                          Duplicate
                        </Button>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestion(question.id)}>
                          Remove
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor={`question-${question.id}`}>Question prompt</Label>
                        <Input
                          id={`question-${question.id}`}
                          value={question.prompt}
                          onChange={(event) => updateQuestion(question.id, { prompt: event.target.value })}
                          placeholder="What would you like to ask attendees?"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Response type</Label>
                          <Select
                            value={question.type}
                            onValueChange={(value) =>
                              updateQuestion(question.id, {
                                type: value as QuestionType,
                                options: value === "multipleChoice" ? question.options.length ? question.options : ["Option 1"] : [],
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="shortText">Short text</SelectItem>
                              <SelectItem value="longForm">Long form</SelectItem>
                              <SelectItem value="multipleChoice">Multiple choice</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Internal routing tag</Label>
                          <Input placeholder="e.g. onboarding, enterprise, success" />
                        </div>
                      </div>

                      {question.type === "multipleChoice" && (
                        <div className="space-y-3">
                          <Label>Options</Label>
                          {question.options.map((option, index) => (
                            <div key={`${question.id}-option-${index}`} className="flex items-center gap-2">
                              <Input
                                value={option}
                                onChange={(event) => {
                                  const newOptions = [...question.options];
                                  newOptions[index] = event.target.value;
                                  updateQuestion(question.id, { options: newOptions });
                                }}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newOptions = question.options.filter((_, optionIndex) => optionIndex !== index);
                                  updateQuestion(question.id, { options: newOptions });
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => updateQuestion(question.id, { options: [...question.options, `Option ${question.options.length + 1}`] })}
                          >
                            Add option
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Code className="h-5 w-5 text-primary" /> API & integration surface
              </CardTitle>
              <CardDescription>
                Appointmentlyy ships with universal APIs and SDKs, so the experience embeds anywhere you operate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3">
                {integrationTargets.map((target) => {
                  const checked = eventDetails.apiTargets.includes(target.value);
                  return (
                    <div
                      key={target.value}
                      className={cn("flex items-start gap-3 rounded-lg border p-3", checked && "border-primary")}
                    >
                      <Checkbox
                        id={`stack-${target.value}`}
                        checked={checked}
                        onCheckedChange={(value) => toggleApiTarget(target.value, value === true)}
                      />
                      <div className="space-y-1">
                        <Label htmlFor={`stack-${target.value}`} className="text-sm font-medium">
                          {target.label}
                        </Label>
                        <p className="text-xs text-muted-foreground">{target.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">SDK coverage</Label>
                <div className="flex flex-wrap gap-2">
                  {activeStacks.map((stack) => (
                    <Badge key={stack} variant="secondary" className="capitalize">
                      {stack}
                    </Badge>
                  ))}
                  {!activeStacks.length && <span className="text-sm text-muted-foreground">Select at least one stack.</span>}
                </div>
              </div>

              <Tabs defaultValue="node" className="pt-2">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="node">Node</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                  <TabsTrigger value="ruby">Ruby</TabsTrigger>
                </TabsList>
                <TabsContent value="node">
                  <pre className="mt-3 overflow-x-auto rounded-md bg-secondary/60 p-4 text-xs">{integrationSnippets.node}</pre>
                </TabsContent>
                <TabsContent value="python">
                  <pre className="mt-3 overflow-x-auto rounded-md bg-secondary/60 p-4 text-xs">{integrationSnippets.python}</pre>
                </TabsContent>
                <TabsContent value="ruby">
                  <pre className="mt-3 overflow-x-auto rounded-md bg-secondary/60 p-4 text-xs">{integrationSnippets.ruby}</pre>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Workflow className="h-5 w-5 text-primary" /> Automation designer
              </CardTitle>
              <CardDescription>
                Power the customer journey with targeted emails, SMS, AI voice agents, and punctual reminders.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Transactional email</div>
                      <p className="text-sm text-muted-foreground">
                        Send confirmations, prep instructions, and post-call follow ups branded to your business.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={automations.email.enabled}
                    onCheckedChange={(value) =>
                      setAutomations((previous) => ({ ...previous, email: { ...previous.email, enabled: value } }))
                    }
                  />
                </div>
                {automations.email.enabled && (
                  <div className="grid gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Email subject</Label>
                      <Input
                        id="email-subject"
                        value={automations.email.subject}
                        onChange={(event) =>
                          setAutomations((previous) => ({
                            ...previous,
                            email: { ...previous.email, subject: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-template">Email template</Label>
                      <Textarea
                        id="email-template"
                        rows={6}
                        value={automations.email.template}
                        onChange={(event) =>
                          setAutomations((previous) => ({
                            ...previous,
                            email: { ...previous.email, template: event.target.value },
                          }))
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Use liquid-style tokens like {'{event_date}'} and {'{first_name}'} for personalised content.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">SMS notifications</div>
                      <p className="text-sm text-muted-foreground">
                        Deliver timely reminders and two-way updates for reschedules or quick replies.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={automations.sms.enabled}
                    onCheckedChange={(value) =>
                      setAutomations((previous) => ({ ...previous, sms: { ...previous.sms, enabled: value } }))
                    }
                  />
                </div>
                {automations.sms.enabled && (
                  <div className="space-y-2">
                    <Label htmlFor="sms-template">SMS template</Label>
                    <Textarea
                      id="sms-template"
                      rows={4}
                      value={automations.sms.template}
                      onChange={(event) =>
                        setAutomations((previous) => ({
                          ...previous,
                          sms: { ...previous.sms, template: event.target.value },
                        }))
                      }
                    />
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <PhoneCall className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">AI voice agent</div>
                      <p className="text-sm text-muted-foreground">
                        Let Appointmentlyy dial out with a friendly reminder or escalate to a human if the attendee needs support.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={automations.voice.enabled}
                    onCheckedChange={(value) =>
                      setAutomations((previous) => ({ ...previous, voice: { ...previous.voice, enabled: value } }))
                    }
                  />
                </div>
                {automations.voice.enabled && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="voice-provider">Voice provider</Label>
                      <Input
                        id="voice-provider"
                        value={automations.voice.provider}
                        onChange={(event) =>
                          setAutomations((previous) => ({
                            ...previous,
                            voice: { ...previous.voice, provider: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="voice-script">Call script</Label>
                      <Textarea
                        id="voice-script"
                        rows={4}
                        value={automations.voice.script}
                        onChange={(event) =>
                          setAutomations((previous) => ({
                            ...previous,
                            voice: { ...previous.voice, script: event.target.value },
                          }))
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="voice-handoff">Warm hand-off number</Label>
                      <Input
                        id="voice-handoff"
                        value={automations.voice.handoffNumber}
                        onChange={(event) =>
                          setAutomations((previous) => ({
                            ...previous,
                            voice: { ...previous.voice, handoffNumber: event.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <BellRing className="mt-1 h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">Meeting reminders</div>
                      <p className="text-sm text-muted-foreground">
                        Align your cadence with the customer by configuring multi-channel reminders.
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={automations.reminders.enabled}
                    onCheckedChange={(value) =>
                      setAutomations((previous) => ({
                        ...previous,
                        reminders: { ...previous.reminders, enabled: value },
                      }))
                    }
                  />
                </div>
                {automations.reminders.enabled && (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {reminderOptions.map((offset) => {
                        const checked = automations.reminders.offsets.includes(offset);
                        return (
                          <Button
                            key={offset}
                            type="button"
                            variant={checked ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleReminder(offset, !checked)}
                          >
                            {offset}
                          </Button>
                        );
                      })}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reminder-message">Reminder message</Label>
                      <Textarea
                        id="reminder-message"
                        rows={4}
                        value={automations.reminders.message}
                        onChange={(event) =>
                          setAutomations((previous) => ({
                            ...previous,
                            reminders: { ...previous.reminders, message: event.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Sparkles className="h-5 w-5 text-primary" /> AI proposal engine
              </CardTitle>
              <CardDescription>
                Appointmentlyy analyses every submission and drafts a comprehensive service proposal with OpenAI.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" onClick={handleGenerateProposal} disabled={isAnalyzing}>
                <Sparkles className="h-4 w-4" /> {isAnalyzing ? "Analysing questionnaire..." : "Generate proposal"}
              </Button>
              <p className="text-sm text-muted-foreground">
                We pass the questionnaire responses, automation plan, and conferencing selections into an OpenAI prompt so your
                team receives actionable next steps moments after a booking lands.
              </p>
              {proposal && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold">Latest proposal draft</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(proposal);
                          toast({ title: "Proposal copied" });
                        } catch (error) {
                          console.error(error);
                          toast({
                            variant: "destructive",
                            title: "Clipboard unavailable",
                            description: "Copy the text manually if clipboard access is blocked.",
                          });
                        }
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                  <div className="max-h-[360px] overflow-y-auto rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">
                    <pre className="whitespace-pre-wrap text-left font-sans text-sm">{proposal}</pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr,1fr]">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Globe className="h-5 w-5 text-primary" /> Landing page builder
              </CardTitle>
              <CardDescription>
                Design the conversion-focused page prospects see after they pick a time on your schedule.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="landing-headline">Headline</Label>
                  <Input
                    id="landing-headline"
                    value={landing.headline}
                    onChange={(event) => setLanding((previous) => ({ ...previous, headline: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landing-cta">Call-to-action</Label>
                  <Input
                    id="landing-cta"
                    value={landing.callToAction}
                    onChange={(event) => setLanding((previous) => ({ ...previous, callToAction: event.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="landing-subheadline">Subheadline</Label>
                  <Textarea
                    id="landing-subheadline"
                    rows={3}
                    value={landing.subheadline}
                    onChange={(event) => setLanding((previous) => ({ ...previous, subheadline: event.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landing-color">Brand colour</Label>
                  <Input
                    id="landing-color"
                    type="color"
                    value={landing.brandColor}
                    onChange={(event) => setLanding((previous) => ({ ...previous, brandColor: event.target.value }))}
                    className="h-10 w-24 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landing-redirect">Redirect URL</Label>
                  <Input
                    id="landing-redirect"
                    type="url"
                    value={landing.redirectUrl}
                    onChange={(event) => setLanding((previous) => ({ ...previous, redirectUrl: event.target.value }))}
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="landing-success">Success message</Label>
                  <Textarea
                    id="landing-success"
                    rows={3}
                    value={landing.successMessage}
                    onChange={(event) => setLanding((previous) => ({ ...previous, successMessage: event.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Featured benefits</Label>
                {landing.featuredBenefits.map((benefit, index) => (
                  <div key={`benefit-${index}`} className="flex items-center gap-2">
                    <Input
                      value={benefit}
                      onChange={(event) => {
                        const updated = [...landing.featuredBenefits];
                        updated[index] = event.target.value;
                        setLanding((previous) => ({ ...previous, featuredBenefits: updated }));
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setLanding((previous) => ({
                          ...previous,
                          featuredBenefits: previous.featuredBenefits.filter((_, benefitIndex) => benefitIndex !== index),
                        }))
                      }
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    setLanding((previous) => ({
                      ...previous,
                      featuredBenefits: [...previous.featuredBenefits, "New benefit"],
                    }))
                  }
                >
                  Add benefit
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="text-xl">Landing page preview</CardTitle>
              <CardDescription>
                This is the experience customers will see after your schedule is submitted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div
                className="space-y-5 rounded-xl bg-card p-6 text-card-foreground shadow-inner"
                style={{
                  background: `linear-gradient(135deg, ${activePreview.landing.brandColor}, ${activePreview.landing.brandColor}cc)`,
                }}
              >
                <Badge className="bg-white/20 text-white">Appointmentlyy</Badge>
                <div className="space-y-2 text-white">
                  <h3 className="text-2xl font-semibold">{activePreview.landing.headline}</h3>
                  <p className="text-sm opacity-90">{activePreview.landing.subheadline}</p>
                </div>
                <div className="space-y-2 rounded-lg bg-white/10 p-4">
                  <div className="text-sm font-medium text-white">Agenda</div>
                  <p className="text-sm text-white/80">{activePreview.eventDetails.description}</p>
                  <div className="flex flex-wrap gap-2 pt-2 text-xs">
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {activePreview.eventDetails.duration} min
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {activePreview.eventDetails.timezone}
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white capitalize">
                      {activePreview.eventDetails.conferencing.provider}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2 rounded-lg bg-white p-4 text-sm text-slate-900">
                  <div className="font-semibold">What you'll prepare</div>
                  <ul className="list-disc space-y-1 pl-4">
                    {activePreview.landing.featuredBenefits.map((benefit, index) => (
                      <li key={`preview-benefit-${index}`}>{benefit}</li>
                    ))}
                  </ul>
                  <Button className="mt-4 w-full" size="lg">
                    {activePreview.landing.callToAction}
                  </Button>
                </div>
                <p className="text-xs text-white/80">
                  After booking, visitors see: "{activePreview.landing.successMessage}" and redirect to {activePreview.landing.redirectUrl}.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default AppointmentlyyBuilder;
