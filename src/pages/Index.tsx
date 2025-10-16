import { useMemo } from "react";
import { Search, Bell, Settings, PlusCircle, Building2, Stethoscope, TrendingUp, Users, Package2, Clock, Activity, ShieldCheck, PlugZap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

const teamOrder = ["Field Sales", "Marketing", "Doctors", "Admin", "Finance"] as const;

const pipelineStages: Record<typeof teamOrder[number], { title: string; description: string; status: "active" | "idle" | "blocked" }[]> = {
  "Field Sales": [
    { title: "Lead Discovery", description: "12 new clinics added this week", status: "active" },
    { title: "Demo Scheduled", description: "8 clinics awaiting follow-up", status: "active" },
    { title: "Contract Review", description: "3 clinics negotiating pricing", status: "idle" },
    { title: "Onboarding", description: "2 clinics onboarding with doctors", status: "idle" },
  ],
  Marketing: [
    { title: "Campaign Strategy", description: "AI-driven pet owner nurture flow", status: "active" },
    { title: "Content Production", description: "5 blog posts in design", status: "active" },
    { title: "Event Promotion", description: "Vet Expo partnerships pending", status: "idle" },
    { title: "Analytics", description: "Attribution model review", status: "blocked" },
  ],
  Doctors: [
    { title: "Care Plans", description: "14 active treatment plans", status: "active" },
    { title: "Tele-Consults", description: "6 remote consults scheduled", status: "active" },
    { title: "Case Reviews", description: "2 escalations from sales", status: "idle" },
    { title: "Compliance", description: "New prescription guideline training", status: "idle" },
  ],
  Admin: [
    { title: "Clinic Onboarding", description: "6 clinics awaiting credentialing", status: "active" },
    { title: "License Audits", description: "Quarterly compliance checks", status: "idle" },
    { title: "HR & Payroll", description: "Payroll run scheduled Friday", status: "active" },
    { title: "Systems", description: "Single sign-on rollout", status: "blocked" },
  ],
  Finance: [
    { title: "Billing", description: "$84k outstanding invoices", status: "active" },
    { title: "Procurement", description: "Vendor negotiations for consumables", status: "idle" },
    { title: "Forecasting", description: "Q3 ARR forecast review", status: "active" },
    { title: "Compliance", description: "New sales tax rules for pet meds", status: "idle" },
  ],
};

const metrics = [
  {
    label: "Monthly Recurring Clinics",
    value: "128",
    change: "+12.4% vs last month",
    icon: Building2,
  },
  {
    label: "Active Care Plans",
    value: "412",
    change: "Dr. teams managing 56 critical cases",
    icon: Stethoscope,
  },
  {
    label: "Pipeline Value",
    value: "$1.2M",
    change: "42 enterprise hospitals in review",
    icon: TrendingUp,
  },
  {
    label: "Teams On Track",
    value: "5",
    change: "Cross-functional SLA compliance",
    icon: Users,
  },
];

const appointments = [
  {
    clinic: "Oakridge Animal Hospital",
    contact: "Dr. Selena Moore",
    type: "In-clinic implementation",
    time: "Today · 3:00 PM",
    owner: "Field Sales",
  },
  {
    clinic: "BrightPaws Veterinary",
    contact: "Dr. Noah Lee",
    type: "Telehealth onboarding",
    time: "Tomorrow · 9:00 AM",
    owner: "Doctors",
  },
  {
    clinic: "Pioneer Pet Specialists",
    contact: "Jordan Banks",
    type: "Finance reconciliation",
    time: "Tomorrow · 2:30 PM",
    owner: "Finance",
  },
];

const productInventory = [
  {
    sku: "RX-1001",
    name: "CompanionCare Plus",
    category: "Chronic Care Plan",
    stock: 68,
    threshold: 40,
    owner: "Doctors",
  },
  {
    sku: "DX-2040",
    name: "Lab Diagnostics Bundle",
    category: "Diagnostics",
    stock: 28,
    threshold: 50,
    owner: "Field Sales",
  },
  {
    sku: "AI-4500",
    name: "Predictive Wellness AI",
    category: "Software License",
    stock: 120,
    threshold: 80,
    owner: "Marketing",
  },
  {
    sku: "SU-3020",
    name: "Surgery Essentials Kit",
    category: "Surgical Supplies",
    stock: 16,
    threshold: 25,
    owner: "Admin",
  },
];

const alerts = [
  {
    title: "Expiring DEA Certificates",
    detail: "3 clinics require renewal assistance before May 12",
    severity: "critical" as const,
  },
  {
    title: "Inventory Low",
    detail: "Surgery Essentials Kit inventory at 16 units",
    severity: "warning" as const,
  },
  {
    title: "AI Integration Request",
    detail: "Radiology insights API ready for sandbox testing",
    severity: "info" as const,
  },
];

const apiIntegrations = [
  {
    name: "Radiology Insights AI",
    description: "Ingest radiology images and return AI-driven diagnostic suggestions within the CRM record.",
    status: "Sandbox Connected",
    action: "Manage",
  },
  {
    name: "Pharmacy Fulfillment",
    description: "Sync prescriptions to partner pharmacies with two-way status updates.",
    status: "Awaiting Credentials",
    action: "Connect",
  },
  {
    name: "Marketing Automation",
    description: "Push treatment follow-up journeys into HubSpot or Marketo with enriched pet profiles.",
    status: "Live",
    action: "View Logs",
  },
];

type TeamName = typeof teamOrder[number];

type IconRenderer = (props: { className?: string }) => JSX.Element;

const teamIcons: Record<TeamName, IconRenderer> = {
  "Field Sales": Building2,
  Marketing: Activity,
  Admin: ShieldCheck,
  Finance: TrendingUp,
  Doctors: Stethoscope,
};

const getStatusBadge = (status: "active" | "idle" | "blocked") => {
  switch (status) {
    case "active":
      return <Badge variant="default">On track</Badge>;
    case "idle":
      return <Badge variant="secondary">At risk</Badge>;
    case "blocked":
      return <Badge variant="destructive">Blocked</Badge>;
  }
};

const Index = () => {
  const inventoryCapacity = useMemo(() => {
    const total = productInventory.reduce((acc, item) => acc + item.stock, 0);
    const thresholds = productInventory.reduce((acc, item) => acc + item.threshold, 0);
    return Math.min(100, Math.round((total / thresholds) * 100));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted/40 via-background to-muted/40 text-foreground">
      <header className="border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">VetSynergy CRM</p>
              <h1 className="text-lg font-semibold">Commercial Veterinary Operations Hub</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-sm md:flex">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search clinics, pets, or deals" className="h-7 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0" />
            </div>
            <Button variant="outline" size="icon" className="rounded-full">
              <Bell className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-full">
              <Settings className="h-4 w-4" />
            </Button>
            <Button size="sm" className="hidden md:inline-flex">
              <PlusCircle className="mr-2 h-4 w-4" />
              New record
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
                <metric.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">{metric.value}</div>
                <p className="text-xs text-muted-foreground">{metric.change}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Operational Control Center</CardTitle>
              <CardDescription>Cross-team snapshot to support same-day decisions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <Tabs defaultValue="Field Sales" className="w-full">
                <TabsList className="flex flex-wrap gap-2">
                  {teamOrder.map((team) => (
                    <TabsTrigger key={team} value={team} className="rounded-full px-4 py-1 text-xs font-semibold uppercase">
                      {team}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {teamOrder.map((team) => (
                  <TabsContent key={team} value={team} className="mt-4 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        {(() => {
                          const Icon = teamIcons[team];
                          return <Icon className="h-5 w-5" />;
                        })()}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold leading-tight">{team} Focus</h3>
                        <p className="text-sm text-muted-foreground">Workflow progress and next actions owned by {team.toLowerCase()}.</p>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      {pipelineStages[team].map((stage) => (
                        <Card key={stage.title} className="border-dashed">
                          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                            <div>
                              <CardTitle className="text-sm font-semibold">{stage.title}</CardTitle>
                              <CardDescription>{stage.description}</CardDescription>
                            </div>
                            {getStatusBadge(stage.status)}
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mission-Critical Alerts</CardTitle>
              <CardDescription>Escalations requiring leadership attention.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.title} className="rounded-lg border border-dashed p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">{alert.title}</h4>
                    {alert.severity === "critical" && <Badge variant="destructive">Critical</Badge>}
                    {alert.severity === "warning" && <Badge variant="secondary">Warning</Badge>}
                    {alert.severity === "info" && <Badge>Info</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{alert.detail}</p>
                  <Button variant="ghost" size="sm" className="mt-3 h-8 px-2 text-xs uppercase tracking-wide">
                    Review
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Client & Case Board</CardTitle>
              <CardDescription>End-to-end visibility from acquisition through care delivery.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  24 accounts require multi-team collaboration this week.
                </div>
                <Button size="sm" variant="outline">
                  Export report
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {appointments.map((appt) => (
                  <Card key={`${appt.clinic}-${appt.time}`} className="border-border/60 bg-background/60">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold leading-tight">{appt.clinic}</CardTitle>
                      <CardDescription>{appt.type}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>Point of contact</span>
                        <span className="font-medium text-foreground">{appt.contact}</span>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Schedule</span>
                        <Badge variant="outline">{appt.time}</Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Owner</span>
                        <Badge>{appt.owner}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capacity & Utilization</CardTitle>
              <CardDescription>Resource alignment across teams.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-dashed p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Inventory Coverage</h4>
                    <p className="text-xs text-muted-foreground">Stock vs minimum safety thresholds.</p>
                  </div>
                  <Package2 className="h-5 w-5 text-primary" />
                </div>
                <Progress value={inventoryCapacity} className="mt-4" />
                <p className="mt-2 text-xs text-muted-foreground">{inventoryCapacity}% coverage across all inventory programs.</p>
              </div>
              <div className="rounded-lg border border-dashed p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold">Team Utilization</h4>
                    <p className="text-xs text-muted-foreground">Field teams at 84% capacity · Doctors at 72%.</p>
                  </div>
                  <Clock className="h-5 w-5 text-primary" />
                </div>
                <Button variant="ghost" size="sm" className="mt-3 h-8 px-2 text-xs uppercase tracking-wide">
                  Open planner
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Product Inventory System</CardTitle>
              <CardDescription>Real-time stock levels and ownership across programs.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ScrollArea className="h-[280px]">
                <div className="grid min-w-[640px] grid-cols-[0.8fr_1.2fr_1fr_0.6fr_0.6fr] gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>SKU</span>
                  <span>Product</span>
                  <span>Category</span>
                  <span>Stock</span>
                  <span>Owner</span>
                </div>
                <Separator className="my-3" />
                <div className="space-y-3">
                  {productInventory.map((item) => {
                    const utilization = Math.min(100, Math.round((item.stock / item.threshold) * 100));
                    const lowStock = item.stock < item.threshold;
                    return (
                      <div key={item.sku} className="grid min-w-[640px] grid-cols-[0.8fr_1.2fr_1fr_0.6fr_0.6fr] items-center gap-3 rounded-lg border border-border/50 bg-background/60 px-3 py-3 text-sm">
                        <span className="font-semibold">{item.sku}</span>
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">Safety threshold {item.threshold} units</p>
                        </div>
                        <Badge variant="secondary" className="w-fit">{item.category}</Badge>
                        <div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{item.stock} units</span>
                            <span>{utilization}%</span>
                          </div>
                          <Progress value={utilization} className="mt-2" />
                          {lowStock && <p className="mt-1 text-xs font-semibold text-destructive">Below threshold · escalate to procurement</p>}
                        </div>
                        <Badge variant="outline" className="w-fit">{item.owner}</Badge>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>API & Automation Integrations</CardTitle>
              <CardDescription>Connect VetSynergy to intelligence engines and partner systems.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {apiIntegrations.map((integration) => (
                <div key={integration.name} className="rounded-lg border border-dashed p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold">{integration.name}</h4>
                      <p className="text-xs text-muted-foreground">{integration.description}</p>
                    </div>
                    <PlugZap className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="outline">{integration.status}</Badge>
                    <Button size="sm" variant="ghost" className="h-8 px-2 text-xs uppercase tracking-wide">
                      {integration.action}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section>
          <Card>
            <CardHeader>
              <CardTitle>Executive Briefing Notes</CardTitle>
              <CardDescription>Week-in-review to align leadership before field stand-up.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
              <div className="xl:col-span-2 space-y-3">
                <h4 className="font-semibold">Revenue & Pipeline</h4>
                <p className="text-sm text-muted-foreground">
                  ARR pacing at 108% of target. Field Sales prioritising 6-hospital chain with 90-day close horizon. Finance coordinating custom terms with procurement to support upsell bundles.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Patient Outcomes</h4>
                <p className="text-sm text-muted-foreground">
                  Doctors team launched chronic care dashboards enabling same-day adjustments. Reduction in emergency escalations by 18% week-over-week.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Marketing Momentum</h4>
                <p className="text-sm text-muted-foreground">
                  AI-personalised nurture campaign driving 32% increase in consultation bookings. Partner webinars generating 240 qualified leads.
                </p>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold">Operational Health</h4>
                <p className="text-sm text-muted-foreground">
                  Admin finalising SSO rollout. Finance aligning with compliance on new pet med tax policy for multi-state customers.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
};

export default Index;
