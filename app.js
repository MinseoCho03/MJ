const oecd = window.OECD_DATA || {};

const projects = [
  {
    id: "offline-learning-ghana",
    title: "Offline-first learning app for rural schools",
    country: "Ghana",
    region: "West Africa",
    sector: "Education",
    subsector: "Digital learning / rural education",
    beneficiaries: "Rural students",
    stage: "Prototype",
    fundingNeed: "$10,000",
    readiness: "Pilot-oriented prototype",
    readinessFilter: "Pilot-oriented",
    opportunityGap: "Medium-High",
    verification: "Self-reported",
    builderId: "ama-boateng",
    builderName: "Ama Boateng",
    builderRole: "Student builder",
    builderLocation: "Ghana",
    description:
      "A young builder in Ghana is building an offline-first learning app for rural schools where students have limited internet access.",
  },
  {
    id: "maternal-health-india",
    title: "Digital maternal health triage tool",
    country: "India",
    region: "South Asia",
    sector: "Health",
    subsector: "Maternal health / digital health",
    beneficiaries: "Rural clinics and pregnant women",
    stage: "Pilot-ready",
    fundingNeed: "$25,000",
    readiness: "Pilot-ready",
    readinessFilter: "Pilot-ready",
    opportunityGap: "High",
    verification: "Self-reported",
    builderId: "aanya-rao-team",
    builderName: "Aanya Rao and student team",
    builderRole: "Student-led health team",
    builderLocation: "India",
    description:
      "A student-led team is building a digital triage tool to help rural clinics identify maternal health risks earlier.",
  },
  {
    id: "sms-climate-kenya",
    title: "SMS climate alert system for smallholder farmers",
    country: "Kenya",
    region: "East Africa",
    sector: "Climate / Agriculture",
    subsector: "Climate adaptation / farmer advisory",
    beneficiaries: "Smallholder farmers",
    stage: "Prototype",
    fundingNeed: "$15,000",
    readiness: "Early pilot",
    readinessFilter: "Pilot-oriented",
    opportunityGap: "Medium",
    verification: "Self-reported",
    builderId: "otieno-climate-lab",
    builderName: "Otieno Climate Lab",
    builderRole: "Young builder team",
    builderLocation: "Kenya",
    description:
      "A young team is building an SMS alert system that sends localized climate and crop-risk information to smallholder farmers.",
  },
  {
    id: "water-quality-nigeria",
    title: "Community water quality reporting tool",
    country: "Nigeria",
    region: "West Africa",
    sector: "Civic Tech / Health",
    subsector: "Water safety",
    beneficiaries: "Low-income communities",
    stage: "Idea",
    fundingNeed: "$8,000",
    readiness: "Early-stage",
    readinessFilter: "Early-stage",
    opportunityGap: "Medium",
    verification: "Self-reported",
    builderId: "zainab-youth-water",
    builderName: "Zainab Youth Water Group",
    builderRole: "Grassroots youth team",
    builderLocation: "Nigeria",
    description:
      "A local youth team wants to build a mobile reporting system for community water quality issues.",
  },
  {
    id: "telemedicine-indonesia",
    title: "Low-cost telemedicine access kiosk",
    country: "Indonesia",
    region: "Southeast Asia",
    sector: "Health",
    subsector: "Rural healthcare access",
    beneficiaries: "Rural patients",
    stage: "Prototype",
    fundingNeed: "$18,000",
    readiness: "Pilot-oriented prototype",
    readinessFilter: "Pilot-oriented",
    opportunityGap: "Medium-High",
    verification: "Self-reported",
    builderId: "raka-pratama",
    builderName: "Raka Pratama",
    builderRole: "Young founder",
    builderLocation: "Indonesia",
    description:
      "A young founder is prototyping a low-cost telemedicine kiosk for rural areas with limited clinic access.",
  },
];

const manualSector = [
  { label: "Education", count: 8 },
  { label: "Health", count: 6 },
  { label: "Climate", count: 4 },
  { label: "Agriculture", count: 3 },
  { label: "Civic Tech", count: 3 },
];

const manualRegion = [
  { label: "West Africa", count: 8 },
  { label: "South Asia", count: 6 },
  { label: "East Africa", count: 5 },
  { label: "Latin America", count: 5 },
];

const STORAGE_KEYS = {
  submittedProjects: "opportunityAtlas.submittedProjects.v1",
  reviewStatuses: "opportunityAtlas.reviewStatuses.v1",
  builderActivity: "opportunityAtlas.builderActivity.v1",
  messages: "opportunityAtlas.messages.v1",
};

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "based",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "of",
  "on",
  "or",
  "project",
  "program",
  "programme",
  "support",
  "the",
  "this",
  "to",
  "with",
]);

function initialPage() {
  const hashPage = window.location.hash.replace("#", "");
  const allowedPages = new Set([
    "overview",
    "discovery",
    "detail",
    "queue",
    "funder-history",
    "signals",
    "submit",
    "builder-history",
    "builder-notifications",
    "messages",
    "builder-profile",
  ]);
  if (allowedPages.has(hashPage)) return hashPage;
  return window.__INITIAL_PAGE__ || "overview";
}

const state = {
  page: initialPage(),
  selectedProjectId: "offline-learning-ghana",
  selectedBuilderId: "",
  selectedThreadId: "",
  builderProfile: null,
  reviewMessage: "",
  filters: {
    country: "All",
    sector: "All",
    stage: "All",
    readiness: "All",
    gap: "All",
    verification: "Self-reported",
  },
};

function currentPortalType() {
  return document.body.dataset.portal || (window.__INITIAL_PAGE__ === "submit" ? "builder" : "funder");
}

function currentSenderLabel() {
  return currentPortalType() === "builder" ? "Builder" : "Funder";
}

function $(selector, root = document) {
  return root.querySelector(selector);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function gapClass(value) {
  if (value === "High") return "red";
  if (value === "Medium-High") return "amber";
  if (value === "Medium") return "blue";
  return "green";
}

function reviewStatusClass(value) {
  if (value === "Funded") return "green";
  if (value === "Invited to apply") return "green";
  if (value === "Evidence requested") return "blue";
  if (value === "Shortlisted") return "amber";
  return "";
}

function fitClass(value) {
  if (value === "High") return "green";
  if (value === "Medium-High") return "blue";
  return "amber";
}

function compactNumber(value) {
  return new Intl.NumberFormat("en-US").format(value || 0);
}

function fundingAmountValue(value) {
  return Number(String(value || "").replace(/[^0-9.]+/g, "")) || 0;
}

function fundingAmountLabel(value) {
  if (!value) return "$0";
  return `$${compactNumber(value)}`;
}

function truncateText(value, limit = 210) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1).trim()}...`;
}

function slugify(value) {
  return String(value || "project")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 54);
}

function builderIdFor(name, fallback = "builder") {
  return slugify(name || fallback);
}

function builderName(project) {
  return project.builderName || "Self-reported builder";
}

function builderRole(project) {
  return project.builderRole || "Young builder";
}

function builderLocation(project) {
  return project.builderLocation || project.country || "Local builder";
}

function projectCountForBuilder(builderId) {
  return projects.filter((project) => project.builderId === builderId).length;
}

function projectsForBuilder(builderId) {
  return projects.filter((project) => project.builderId === builderId);
}

function readinessFilterFor(label) {
  if (label === "Pilot-ready") return "Pilot-ready";
  if (label === "Early-stage") return "Early-stage";
  return "Pilot-oriented";
}

function deriveReadinessFromStage(stage) {
  if (stage === "Pilot-ready" || stage === "Active users") return "Pilot-ready";
  if (stage === "Prototype") return "Pilot-oriented prototype";
  return "Early-stage";
}

function getReviewStatus(project) {
  return project.reviewStatus || "Not reviewed";
}

function formatDate(value) {
  if (!value) return "Today";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Today";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function storageGet(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Demo persistence should never block the UI if storage is unavailable.
  }
}

function normalizeProject(project) {
  const name = project.builderName || "Self-reported builder";
  return {
    readiness: deriveReadinessFromStage(project.stage),
    readinessFilter: readinessFilterFor(project.readiness || deriveReadinessFromStage(project.stage)),
    opportunityGap: project.opportunityGap || "Medium",
    verification: "Self-reported",
    reviewStatus: "Not reviewed",
    submittedAt: project.submittedAt || new Date().toISOString(),
    builderName: name,
    builderId: project.builderId || builderIdFor(name),
    builderRole: project.builderRole || "Young builder",
    builderLocation: project.builderLocation || project.country || "Local builder",
    ...project,
  };
}

function initializeStoredData() {
  const submitted = storageGet(STORAGE_KEYS.submittedProjects, []);
  submitted.map(normalizeProject).forEach((project) => {
    if (!projects.some((existing) => existing.id === project.id)) projects.push(project);
  });
  const reviewStatuses = storageGet(STORAGE_KEYS.reviewStatuses, {});
  projects.forEach((project) => {
    if (reviewStatuses[project.id]) project.reviewStatus = reviewStatuses[project.id];
    if (project.isSubmitted) initializeBuilderActivity(project);
  });
}

function saveSubmittedProjects() {
  storageSet(
    STORAGE_KEYS.submittedProjects,
    projects.filter((project) => project.isSubmitted),
  );
}

function saveReviewStatuses() {
  const statuses = {};
  projects.forEach((project) => {
    if (project.reviewStatus && project.reviewStatus !== "Not reviewed") {
      statuses[project.id] = project.reviewStatus;
    }
  });
  storageSet(STORAGE_KEYS.reviewStatuses, statuses);
}

function builderProjects() {
  return projects.filter((project) => project.isSubmitted);
}

function defaultBuilderActivity(project) {
  return {
    projectId: project.id,
    builderId: project.builderId || builderIdFor(project.builderName),
    submittedAt: project.submittedAt || new Date().toISOString(),
    searchAppearances: 0,
    projectViews: 0,
    profileViews: 0,
    searchEvents: [],
    projectViewers: [],
    viewers: [],
  };
}

function getBuilderActivity(project, store = storageGet(STORAGE_KEYS.builderActivity, {})) {
  return {
    ...defaultBuilderActivity(project),
    ...(store[project.id] || {}),
  };
}

function updateBuilderActivity(project, updater) {
  const store = storageGet(STORAGE_KEYS.builderActivity, {});
  const activity = getBuilderActivity(project, store);
  store[project.id] = updater(activity) || activity;
  storageSet(STORAGE_KEYS.builderActivity, store);
  return store[project.id];
}

function initializeBuilderActivity(project) {
  updateBuilderActivity(project, (activity) => activity);
}

function funderViewerForProject(project, activity) {
  const intel = getIntel(project.id);
  const funders = intel.potentialFunders || [];
  const viewCount = Number(activity.profileViews || 0) + Number(activity.projectViews || 0);
  const funder = funders.length ? funders[viewCount % funders.length] : null;
  const roles = ["Program officer", "Grantmaking associate", "Fellowship scout", "Innovation fund reviewer"];
  return {
    organization: funder?.name || "Opportunity Atlas review desk",
    role: roles[viewCount % roles.length],
  };
}

function recordBuilderSearchAppearances(visibleProjects, source = "Discovery filters") {
  const eventKey = [
    new Date().toISOString().slice(0, 10),
    source,
    state.filters.country,
    state.filters.sector,
    state.filters.stage,
    state.filters.readiness,
    state.filters.gap,
  ].join("|");

  visibleProjects.filter((project) => project.isSubmitted).forEach((project) => {
    updateBuilderActivity(project, (activity) => {
      const searchEvents = Array.isArray(activity.searchEvents) ? activity.searchEvents : [];
      if (!searchEvents.includes(eventKey)) {
        activity.searchEvents = [...searchEvents, eventKey];
        activity.searchAppearances = activity.searchEvents.length;
        activity.lastSearchAt = new Date().toISOString();
      }
      return activity;
    });
  });
}

function recordBuilderProjectView(project, source = "Evaluation Packet") {
  if (!project) return;
  updateBuilderActivity(project, (activity) => {
    const viewer = funderViewerForProject(project, activity);
    activity.projectViews = Number(activity.projectViews || 0) + 1;
    activity.lastProjectViewedAt = new Date().toISOString();
    activity.projectViewers = [
      {
        ...viewer,
        source,
        viewedAt: activity.lastProjectViewedAt,
      },
      ...(activity.projectViewers || []),
    ].slice(0, 6);
    return activity;
  });
}

function recordBuilderProfileView(project, source = "Builder Profile") {
  if (!project) return;
  updateBuilderActivity(project, (activity) => {
    const viewer = funderViewerForProject(project, activity);
    activity.profileViews = Number(activity.profileViews || 0) + 1;
    activity.lastProfileViewedAt = new Date().toISOString();
    activity.viewers = [
      {
        ...viewer,
        source,
        viewedAt: activity.lastProfileViewedAt,
      },
      ...(activity.viewers || []),
    ].slice(0, 6);
    return activity;
  });
}

function getThreads() {
  return storageGet(STORAGE_KEYS.messages, []);
}

function saveThreads(threads) {
  storageSet(STORAGE_KEYS.messages, threads);
}

function threadIdFor(project) {
  return `thread-${project.builderId || builderIdFor(project.builderName)}-${project.id}`;
}

function ensureThread(project, initiator = currentPortalType()) {
  const threads = getThreads();
  const id = threadIdFor(project);
  let thread = threads.find((item) => item.id === id);
  if (!thread) {
    thread = {
      id,
      projectId: project.id,
      builderId: project.builderId,
      builderName: builderName(project),
      projectTitle: project.title,
      funderName: getIntel(project.id).potentialFunders?.[0]?.name || "Opportunity Atlas funder",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    threads.unshift(thread);
  }

  const starterText =
    initiator === "builder"
      ? `${builderName(project)} opened a conversation with a potentially relevant funder about ${project.title}.`
      : `A funder opened a conversation with ${builderName(project)} about ${project.title}.`;
  if (!thread.messages.some((message) => message.system && message.text === starterText)) {
    thread.messages.push({
      sender: "Opportunity Atlas",
      text: starterText,
      at: new Date().toISOString(),
      system: true,
    });
  }
  thread.updatedAt = new Date().toISOString();
  saveThreads(threads);
  state.selectedThreadId = id;
  return thread;
}

function addMessageToThread(threadId, text, sender = currentSenderLabel()) {
  const threads = getThreads();
  const thread = threads.find((item) => item.id === threadId);
  if (!thread || !String(text || "").trim()) return;
  thread.messages.push({
    sender,
    text: String(text).trim(),
    at: new Date().toISOString(),
  });
  thread.updatedAt = new Date().toISOString();
  saveThreads(threads);
}

function tokenize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

function uniqueTokens(value) {
  return new Set(tokenize(value));
}

function projectSearchText(project) {
  return [
    project.title,
    project.description,
    project.country,
    project.region,
    project.sector,
    project.subsector,
    project.beneficiaries,
    project.teamBackground,
    project.tractionEvidence,
  ].join(" ");
}

function recordSearchText(record) {
  return [
    record.title,
    record.description,
    record.country,
    record.region,
    record.sector,
    record.subsector,
    record.donor,
  ].join(" ");
}

function buildOecdMatchingCorpus() {
  const seen = new Set();
  const records = [];
  Object.values(oecd.projectIntel || {}).forEach((intel) => {
    (intel.similarProjects || []).forEach((record) => {
      const key = [record.title, record.donor, record.country, record.year].join("|");
      if (!seen.has(key)) {
        seen.add(key);
        records.push(record);
      }
    });
  });
  return records;
}

function sameText(a, b) {
  return String(a || "").toLowerCase() === String(b || "").toLowerCase();
}

function recordScore(project, record) {
  const projectTokens = uniqueTokens(projectSearchText(project));
  const recordTokens = uniqueTokens(recordSearchText(record));
  let overlap = 0;
  projectTokens.forEach((token) => {
    if (recordTokens.has(token)) overlap += 1;
  });
  let score = overlap;
  if (sameText(project.sector, record.sector)) score += 5;
  if (sameText(project.country, record.country)) score += 6;
  if (sameText(project.region, record.region)) score += 2;
  if (String(record.sector || "").toLowerCase().includes(String(project.sector || "").toLowerCase())) score += 2;
  return score;
}

function generateFundingContext(project) {
  const corpus = buildOecdMatchingCorpus();
  const scored = corpus
    .map((record) => ({ ...record, score: recordScore(project, record) }))
    .filter((record) => record.score > 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  const donorMap = new Map();
  scored.forEach((record) => {
    const existing = donorMap.get(record.donor) || {
      name: record.donor,
      records: 0,
      amount: 0,
      countries: new Set(),
      sectors: new Set(),
    };
    existing.records += 1;
    existing.amount += Number(record.amount || 0);
    existing.countries.add(record.country);
    existing.sectors.add(record.sector);
    donorMap.set(record.donor, existing);
  });

  const potentialFunders = Array.from(donorMap.values())
    .sort((a, b) => b.records - a.records || b.amount - a.amount)
    .slice(0, 3)
    .map((funder) => ({
      name: funder.name,
      fit: funder.records >= 3 ? "High" : funder.records >= 2 ? "Medium-High" : "Medium",
      amountLabel: funder.amount ? `$${funder.amount >= 1 ? `${funder.amount.toFixed(1)}M` : `${Math.round(funder.amount * 1000)}K`}` : "Matched records",
      reason: `Appears in ${funder.records} related OECD funding record${funder.records === 1 ? "" : "s"} touching ${Array.from(funder.sectors).slice(0, 2).join(", ")} themes.`,
    }));

  return {
    similarProjects: scored,
    potentialFunders,
    fallback:
      scored.length < 2
        ? "No strong historical matches were found in the available OECD records. This does not mean the project is not valuable; it means the current dataset has limited coverage for this project area."
        : "",
  };
}

function evidenceItems(project) {
  const checks = [
    ["Evidence link provided", "No evidence link", project.evidenceLink],
    ["Pilot partner listed", "No pilot partner confirmation", project.pilotPartner],
    ["Current users / beneficiaries provided", "No current users / beneficiaries count", project.usersReached],
    ["Budget breakdown provided", "No budget breakdown", project.budgetBreakdown],
    ["Traction/evidence provided", "No impact evidence", project.tractionEvidence],
    ["Team background provided", "No team background", project.teamBackground],
  ];
  return {
    available: checks.filter(([, , value]) => Boolean(String(value || "").trim())).map(([yes]) => yes),
    missing: checks.filter(([, , value]) => !String(value || "").trim()).map(([, no]) => no),
  };
}

function computeReadiness(project) {
  const evidence = evidenceItems(project).available.length;
  const hasFunding = Boolean(String(project.fundingNeed || "").trim());
  const hasBeneficiaries = Boolean(String(project.beneficiaries || "").trim());
  if ((project.stage === "Pilot-ready" || project.stage === "Active users") && evidence >= 2) return "Pilot-ready";
  if (project.stage === "Prototype" && hasFunding && hasBeneficiaries) return "Pilot-oriented prototype";
  if (project.description && project.sector) return "Early-stage";
  return "Needs more information";
}

function readinessRationale(project) {
  const items = [];
  if (project.stage) items.push(`${project.stage} stage selected`);
  if (project.beneficiaries) items.push("Target beneficiaries are clear");
  if (project.fundingNeed) items.push("Funding request is specific");
  items.push(project.evidenceLink ? "Evidence link is provided" : "Evidence link is missing");
  items.push(project.pilotPartner ? "Pilot/local partner is listed" : "Pilot partner confirmation is missing");
  items.push(project.budgetBreakdown ? "Budget breakdown is provided" : "Budget breakdown is missing");
  items.push(project.tractionEvidence ? "Traction or early evidence is provided" : "Traction or impact evidence is missing");
  return items;
}

function needsReviewItems(project) {
  const missing = evidenceItems(project).missing;
  const items = [...missing];
  if (!project.impactMeasurement) items.push("Missing impact measurement plan");
  return items.length ? items : ["Evidence package is relatively complete; verify claims with source materials."];
}

function computeGap(project, intel) {
  const topSectorLabels = (oecd.topSectors || []).map((sector) => String(sector.label || "").toLowerCase());
  const sectorActive = topSectorLabels.some((label) => label.includes(String(project.sector || "").toLowerCase()));
  const sameCountryMatches = (intel.similarProjects || []).filter((record) => sameText(record.country, project.country)).length;
  const sameSectorMatches = (intel.similarProjects || []).filter((record) => sameText(record.sector, project.sector)).length;
  if (!intel.similarProjects?.length) return "Unknown / Needs more data";
  if (sectorActive && sameCountryMatches <= 1) return "Medium-High";
  if (sameCountryMatches >= 3 && sameSectorMatches >= 3) return "Low";
  return "Medium";
}

function gapRationale(project, intel) {
  const topSectorLabels = (oecd.topSectors || []).map((sector) => sector.label);
  const sectorActive = topSectorLabels.some((label) => String(label || "").toLowerCase().includes(String(project.sector || "").toLowerCase()));
  const sameCountryMatches = (intel.similarProjects || []).filter((record) => sameText(record.country, project.country)).length;
  const items = [];
  items.push(
    sectorActive
      ? `${project.sector} appears as an active global funding sector in OECD records.`
      : `${project.sector} has limited representation in the available OECD top-sector view.`,
  );
  items.push(`The submitted project is in ${project.country}.`);
  items.push(`${sameCountryMatches} similar record${sameCountryMatches === 1 ? " was" : "s were"} found for the same country in the available matching corpus.`);
  items.push("A local project signal exists in this underrepresented space.");
  return items;
}

const DONUT_COLORS = [
  "#1d5fd0", "#08795f", "#e08614", "#9b3eab",
  "#d94f45", "#0e9cb5", "#5c7cfa", "#f59e42",
  "#64748b", "#16a34a",
];

function yearLineChart(items, valueKey = "amount") {
  const values = items.map((item) => item[valueKey] || 0);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const floor = min - range * 0.6;
  const ceil = max + range * 0.4;
  const span = ceil - floor;

  const W = 540, H = 130, ml = 28, mr = 28, mt = 28, mb = 28;
  const pw = W - ml - mr, ph = H - mt - mb;
  const n = items.length;
  const toX = (i) => ml + (i / (n - 1)) * pw;
  const toY = (v) => mt + ph - ((v - floor) / span) * ph;

  const pts = items.map((item, i) => ({
    x: toX(i),
    y: toY(item[valueKey] || 0),
    label: String(item.label),
    amtLabel: item.amountLabel || compactNumber(item[valueKey] || 0),
    value: item[valueKey] || 0,
  }));

  const polyPts = pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath =
    `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}` +
    pts.slice(1).map((p) => ` L${p.x.toFixed(1)},${p.y.toFixed(1)}`).join("") +
    ` L${pts[n - 1].x.toFixed(1)},${H - mb} L${pts[0].x.toFixed(1)},${H - mb} Z`;

  const deltas = pts.slice(1).map((p, i) => {
    const delta = p.value - pts[i].value;
    const color = delta >= 0 ? "#0d9b72" : "#e05050";
    const mx = ((pts[i].x + p.x) / 2).toFixed(1);
    const my = (Math.min(pts[i].y, p.y) - 10).toFixed(1);
    return `<text x="${mx}" y="${my}" text-anchor="middle" font-size="10.5" font-weight="600" fill="${color}">${delta >= 0 ? "+" : "−"}$${Math.round(Math.abs(delta))}M</text>`;
  });

  return `<div class="lchart-outer"><svg class="lchart" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#2868c7" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#2868c7" stop-opacity="0.01"/>
      </linearGradient>
    </defs>
    <path d="${areaPath}" fill="url(#lcg)"/>
    <polyline points="${polyPts}" fill="none" stroke="#2868c7" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${pts
      .map(
        (p) =>
          `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4.5" class="lchart-dot"/>` +
          `<text x="${p.x.toFixed(1)}" y="${(p.y - 12).toFixed(1)}" text-anchor="middle" class="lchart-amt">${escapeHtml(p.amtLabel)}</text>` +
          `<text x="${p.x.toFixed(1)}" y="${(H - 8).toFixed(1)}" text-anchor="middle" class="lchart-lbl">${escapeHtml(p.label)}</text>`,
      )
      .join("")}
    ${deltas.join("")}
  </svg></div>`;
}

function donutChart(items, valueKey = "amount") {
  const slice = items.slice(0, 8);
  const total = slice.reduce((sum, item) => sum + (item[valueKey] || 0), 0) || 1;
  let cum = 0;
  const segments = slice.map((item, i) => {
    const pct = ((item[valueKey] || 0) / total) * 100;
    const start = cum;
    cum += pct;
    return { ...item, pct, start, color: DONUT_COLORS[i] };
  });
  const gradient = segments
    .map((s) => `${s.color} ${s.start.toFixed(1)}% ${(s.start + s.pct).toFixed(1)}%`)
    .join(", ");
  return `<div class="donut-wrap">
    <div class="donut" style="background:conic-gradient(${gradient})"></div>
    <div class="donut-legend">
      ${segments
        .map(
          (s) => `<div class="donut-item">
        <span class="donut-dot" style="background:${s.color}"></span>
        <span class="donut-name">${escapeHtml(s.label)}</span>
        <span class="donut-amt">${escapeHtml(s.amountLabel || "")}</span>
      </div>`,
        )
        .join("")}
    </div>
  </div>`;
}

function barList(items, valueKey = "count") {
  const max = Math.max(...items.map((item) => item[valueKey] || 0), 1);
  return `<div class="bar-list">
    ${items
      .map((item) => {
        const value = item[valueKey] || 0;
        const width = Math.max(6, Math.round((value / max) * 100));
        const label = item.amountLabel || compactNumber(value);
        return `<div class="bar-row">
          <strong>${escapeHtml(item.label)}</strong>
          <div class="bar-track" aria-hidden="true"><div class="bar-fill" style="--value: ${width}%"></div></div>
          <span>${escapeHtml(label)}</span>
        </div>`;
      })
      .join("")}
  </div>`;
}

function kpi(label, value) {
  return `<article class="kpi"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function sectionHeader(title, kicker = "") {
  return `<div class="section-header">
    <div>
      <h2>${escapeHtml(title)}</h2>
      ${kicker ? `<p>${escapeHtml(kicker)}</p>` : ""}
    </div>
  </div>`;
}

function funderWorkflow(active) {
  const steps = [
    { id: "discover", label: "Discover", text: "Filter and browse self-reported projects." },
    { id: "review", label: "Review", text: "Open an evaluation packet." },
    { id: "act", label: "Act", text: "Shortlist, request evidence, or invite." },
    { id: "manage", label: "Manage", text: "Track projects in the review queue." },
  ];
  return `<section class="workflow" aria-label="Funder workflow">
    ${steps
      .map(
        (step, index) => `<article class="${step.id === active ? "active" : ""}">
          <span>${index + 1}</span>
          <div><strong>${escapeHtml(step.label)}</strong><p>${escapeHtml(step.text)}</p></div>
        </article>`,
      )
      .join("")}
  </section>`;
}

function projectCard(project, featured = false) {
  return `<article class="card project-card">
    <div class="project-card-head">
      <h3>${escapeHtml(project.title)}</h3>
      <div class="meta">${escapeHtml(project.country)} · ${escapeHtml(project.region)}</div>
      <div class="meta">${escapeHtml(project.sector)} · ${escapeHtml(project.subsector || "General")}</div>
      <button class="builder-link" data-builder-id="${escapeHtml(project.builderId)}" data-project-id="${escapeHtml(project.id)}" type="button">
        ${escapeHtml(builderName(project))}
        <span>${escapeHtml(builderRole(project))} · ${escapeHtml(projectCountForBuilder(project.builderId))} project${projectCountForBuilder(project.builderId) === 1 ? "" : "s"}</span>
      </button>
    </div>
    <p>${escapeHtml(project.description)}</p>
    <dl class="project-facts">
      <div><dt>Funding Need</dt><dd>${escapeHtml(project.fundingNeed)}</dd></div>
      <div><dt>Stage</dt><dd>${escapeHtml(project.stage)}</dd></div>
    </dl>
    <div class="badge-row">
      <span class="badge blue">Readiness: ${escapeHtml(project.readiness)}</span>
      <span class="badge ${gapClass(project.opportunityGap)}">Opportunity Gap: ${escapeHtml(project.opportunityGap)}</span>
      <span class="badge green">Verification: ${escapeHtml(project.verification)}</span>
    </div>
    <div class="card-footer">
      <span class="money">${featured ? "Featured gap" : "Evaluation packet"}</span>
      <div class="action-row">
        <button class="btn contact-builder-btn" data-project-id="${escapeHtml(project.id)}">Contact Builder</button>
        <button class="btn primary packet-btn" data-project-id="${escapeHtml(project.id)}">${featured ? "View" : "View"}</button>
      </div>
    </div>
  </article>`;
}

function pageHeader(id, title, subtitle, description = "", actions = "", portal = "Funder Portal") {
  return `<header class="page-header">
    <div>
      <div class="eyebrow">${escapeHtml(portal)}</div>
      <h1 id="${id}">${escapeHtml(title)}</h1>
      <p class="lead">${escapeHtml(subtitle)}</p>
      ${description ? `<p class="lead">${escapeHtml(description)}</p>` : ""}
    </div>
    ${actions ? `<div class="badge-row">${actions}</div>` : ""}
  </header>`;
}

function renderOverview() {
  const featured = projects.slice(0, 3);
  const countryCount = new Set(projects.map((project) => project.country)).size;
  const highGapCount = projects.filter((project) => project.opportunityGap === "High" || project.opportunityGap === "Medium-High").length;
  const pilotReadyCount = projects.filter((project) => project.readiness === "Pilot-ready").length;
  $("#overview").innerHTML = `
    ${pageHeader(
      "overview-title",
      "Opportunity Atlas",
      "Discover overlooked young builders through their projects.",
      "Opportunity Atlas turns self-reported local projects into structured, funder-readable opportunity profiles, helping opportunity providers discover young builders beyond traditional credentials and networks.",
    )}
    <section class="grid four">
      ${kpi("Submitted Projects", projects.length)}
      ${kpi("Countries Represented", countryCount)}
      ${kpi("High Gap Projects", highGapCount)}
      ${kpi("Pilot-Ready Projects", pilotReadyCount)}
    </section>
    <section class="section grid two">
      <article class="card chart-card">
        ${sectionHeader("Projects by Sector", "Submitted local projects by primary impact area.")}
        ${barList(manualSector)}
      </article>
      <article class="card chart-card">
        ${sectionHeader("Projects by Region", "Geographic distribution of submitted project signals.")}
        ${barList(manualRegion)}
      </article>
    </section>
    <section class="section">
      ${sectionHeader("Featured Opportunity Gaps", "Self-reported projects with reviewable funding gaps and structured project context.")}
      <div class="grid three">
        ${featured.map((project) => projectCard(project, true)).join("")}
      </div>
    </section>
    <section class="section note-panel">
      <strong>Responsible recommendation boundary:</strong> Opportunity Atlas does not automatically decide who deserves funding. It helps funders discover, compare, and review overlooked local projects.
    </section>
  `;
}

function filterOptions(label, key, options) {
  return `<label>${escapeHtml(label)}
    <select data-filter="${escapeHtml(key)}">
      ${options.map((option) => `<option ${state.filters[key] === option ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
    </select>
  </label>`;
}

function matchesFilter(project) {
  const f = state.filters;
  const sectorMatch =
    f.sector === "All" ||
    project.sector === f.sector ||
    project.sector.split(" / ").includes(f.sector);
  return (
    (f.country === "All" || project.country === f.country) &&
    sectorMatch &&
    (f.stage === "All" || project.stage === f.stage) &&
    (f.readiness === "All" || project.readinessFilter === f.readiness) &&
    (f.gap === "All" || project.opportunityGap === f.gap) &&
    project.verification === "Self-reported"
  );
}

function renderDiscovery() {
  const visible = projects.filter(matchesFilter);
  $("#discovery").innerHTML = `
    ${pageHeader(
      "discovery-title",
      "Discover Projects",
      "Browse self-reported projects from young builders and grassroots teams.",
    )}
    <section class="filter-panel" aria-label="Project filters">
      ${filterOptions("Country", "country", ["All", "Ghana", "India", "Kenya", "Nigeria", "Indonesia"])}
      ${filterOptions("Sector", "sector", ["All", "Education", "Health", "Climate", "Agriculture", "Civic Tech"])}
      ${filterOptions("Stage", "stage", ["All", "Idea", "Prototype", "Pilot-ready", "Active users"])}
      ${filterOptions("Readiness", "readiness", ["All", "Early-stage", "Pilot-oriented", "Pilot-ready"])}
      ${filterOptions("Opportunity Gap", "gap", ["All", "Low", "Medium", "Medium-High", "High"])}
      ${filterOptions("Verification", "verification", ["Self-reported"])}
    </section>
    <section class="section">
      <div class="grid three">
        ${visible.length ? visible.map((project) => projectCard(project)).join("") : `<div class="empty">No projects match the selected filters.</div>`}
      </div>
    </section>
  `;
}

function queueProjectCard(project) {
  const status = getReviewStatus(project);
  return `<article class="queue-card">
    <div>
      <h3>${escapeHtml(project.title)}</h3>
      <p class="meta">${escapeHtml(project.country)} · ${escapeHtml(project.sector)}</p>
      <button class="builder-link" data-builder-id="${escapeHtml(project.builderId)}" data-project-id="${escapeHtml(project.id)}" type="button">${escapeHtml(builderName(project))}</button>
    </div>
    <div class="badge-row">
      <span class="badge blue">Readiness: ${escapeHtml(project.readiness)}</span>
      <span class="badge ${gapClass(project.opportunityGap)}">Opportunity Gap: ${escapeHtml(project.opportunityGap)}</span>
      <span class="badge green">Verification: ${escapeHtml(project.verification)}</span>
      <span class="badge ${reviewStatusClass(status)}">${escapeHtml(status)}</span>
    </div>
    <button class="btn primary packet-btn" data-project-id="${escapeHtml(project.id)}">View</button>
  </article>`;
}

function fundedProjectCard(project) {
  const intel = getIntel(project.id);
  const leadFunder = intel.potentialFunders?.[0]?.name || "Opportunity Atlas funder";
  return `<article class="history-item">
    <div>
      <h3>${escapeHtml(project.title)}</h3>
      <p class="meta">${escapeHtml(project.country)} · ${escapeHtml(project.region)} · ${escapeHtml(project.sector)}</p>
      <button class="builder-link" data-builder-id="${escapeHtml(project.builderId)}" data-project-id="${escapeHtml(project.id)}" type="button">${escapeHtml(builderName(project))}</button>
      <p class="meta">Recorded by ${escapeHtml(leadFunder)} as a demo funding decision.</p>
    </div>
    <div class="badge-row">
      <span class="badge green">Funding status: Funded</span>
      <span class="badge blue">Readiness: ${escapeHtml(project.readiness)}</span>
      <span class="badge ${gapClass(project.opportunityGap)}">Opportunity Gap: ${escapeHtml(project.opportunityGap)}</span>
      <span class="badge green">Verification: ${escapeHtml(project.verification)}</span>
    </div>
    <div class="activity-stats">
      <div><span>Recorded Amount</span><strong>${escapeHtml(project.fundingNeed)}</strong></div>
      <div><span>Stage</span><strong>${escapeHtml(project.stage)}</strong></div>
      <div><span>Funding Context</span><strong>${escapeHtml(intel.potentialFunders?.length ? "Matched OECD funder signals" : "Limited dataset coverage")}</strong></div>
    </div>
    <div class="action-row">
      <button class="btn primary packet-btn" data-project-id="${escapeHtml(project.id)}">Open Evaluation Packet</button>
    </div>
  </article>`;
}

function renderQueueGroup(title, status) {
  const grouped = projects.filter((project) => getReviewStatus(project) === status);
  return `<section class="card queue-group">
    ${sectionHeader(title, `${grouped.length} project${grouped.length === 1 ? "" : "s"}`)}
    <div class="queue-list">
      ${grouped.length ? grouped.map(queueProjectCard).join("") : `<div class="empty">No projects in this status yet.</div>`}
    </div>
  </section>`;
}

function renderQueue() {
  $("#queue").innerHTML = `
    ${pageHeader(
      "queue-title",
      "Review Queue",
      "Manage project review statuses after discovery and evaluation.",
    )}
    <section class="queue-grid">
      ${renderQueueGroup("Shortlisted", "Shortlisted")}
      ${renderQueueGroup("Evidence Requested", "Evidence requested")}
      ${renderQueueGroup("Invited to Apply", "Invited to apply")}
      ${renderQueueGroup("Funded", "Funded")}
    </section>
  `;
}

function renderFunderHistory() {
  const target = $("#funder-history");
  if (!target) return;
  const funded = projects.filter((project) => getReviewStatus(project) === "Funded");
  const recordedFunding = funded.reduce((sum, project) => sum + fundingAmountValue(project.fundingNeed), 0);
  const activePipeline = projects.filter((project) => ["Shortlisted", "Evidence requested", "Invited to apply"].includes(getReviewStatus(project))).length;
  target.innerHTML = `
    ${pageHeader(
      "funder-history-title",
      "Funding History",
      "Track projects your funder team has marked as funded in this demo workflow.",
    )}
    <section class="grid four">
      ${kpi("Funded Projects", funded.length)}
      ${kpi("Recorded Funding", fundingAmountLabel(recordedFunding))}
      ${kpi("Active Pipeline", activePipeline)}
      ${kpi("Self-Reported Profiles", projects.length)}
    </section>
    <section class="section card">
      ${sectionHeader("Recorded Funding History", "Projects marked funded from the Evaluation Packet action bar.")}
      ${funded.length ? `<div class="history-list">${funded.map(fundedProjectCard).join("")}</div>` : `<div class="empty">No funded projects recorded yet. Open an Evaluation Packet and click Record Funding to add one here.</div>`}
    </section>
    <section class="section note-panel">
      <strong>Demo record only:</strong> Recording funding here does not execute a financial transaction. It only helps funders track which projects they have marked as funded inside this prototype.
    </section>
  `;
}

function builderStats(builderId) {
  const builderProjectsList = projectsForBuilder(builderId);
  return builderProjectsList.reduce(
    (totals, project) => {
      const activity = getBuilderActivity(project);
      totals.projectViews += Number(activity.projectViews || 0);
      totals.profileViews += Number(activity.profileViews || 0);
      totals.searchAppearances += Number(activity.searchAppearances || 0);
      return totals;
    },
    { projectViews: 0, profileViews: 0, searchAppearances: 0 },
  );
}

function renderBuilderProfilePage() {
  const target = $("#builder-profile");
  if (!target) return;
  const builderId = state.selectedBuilderId || projects[0].builderId;
  const builderProjectList = projectsForBuilder(builderId);
  const primaryProject = builderProjectList[0] || projects[0];
  const stats = builderStats(builderId);
  target.innerHTML = `
    ${pageHeader(
      "builder-profile-title",
      builderName(primaryProject),
      `${builderRole(primaryProject)} · ${builderLocation(primaryProject)}`,
      "Builder profiles help funders understand who is behind self-reported project submissions without treating credentials as proof of quality.",
      `<button class="btn primary contact-builder-btn" data-project-id="${escapeHtml(primaryProject.id)}">Contact Builder</button>`,
    )}
    <section class="grid four">
      ${kpi("Submitted Projects", builderProjectList.length)}
      ${kpi("Project Views", stats.projectViews)}
      ${kpi("Profile Views", stats.profileViews)}
      ${kpi("Search Appearances", stats.searchAppearances)}
    </section>
    <section class="section card">
      ${sectionHeader("Builder Projects", "Self-reported projects connected to this builder profile.")}
      <div class="grid three">
        ${builderProjectList.map((project) => projectCard(project)).join("")}
      </div>
    </section>
    <section class="section note-panel">
      <strong>Profile view signal:</strong> Opening this profile increments builder profile views. Opening an Evaluation Packet increments project views.
    </section>
  `;
}

function getProject(id = state.selectedProjectId) {
  return projects.find((project) => project.id === id) || projects[0];
}

function getIntel(projectId) {
  const project = getProject(projectId);
  const precomputed = oecd.projectIntel?.[projectId];
  const generated = generateFundingContext(project);
  if (precomputed) {
    return {
      ...precomputed,
      fallback: "",
      coverageNote:
        "Funder relevance is based on available OECD funding records. Funders not represented in the dataset may not appear in this list.",
    };
  }
  return {
    ...generated,
    gapSignal: {
      label: computeGap(project, generated),
      interpretation: "This is a funding-pattern signal for further review, not a conclusion about merit or investability.",
    },
    coverageNote:
      "Funder relevance is based on available OECD funding records. Funders not represented in the dataset may not appear in this list.",
  };
}

function renderProfileField(label, value) {
  return `<div class="field"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
}

function renderList(items) {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderEvidenceStatus(project) {
  const evidence = evidenceItems(project);
  return `<article class="card evidence-card">
    ${sectionHeader("Evidence Status", "Self-reported does not mean verified. This section helps funders see what evidence is available and what should be requested next.")}
    <span class="badge green">Verification status: Self-reported</span>
    <div class="split-list section">
      <div>
        <h3>Available Evidence</h3>
        ${evidence.available.length ? renderList(evidence.available) : `<p class="meta">No supporting evidence fields have been provided yet.</p>`}
      </div>
      <div>
        <h3>Missing Evidence</h3>
        ${renderList(evidence.missing.length ? evidence.missing : ["No major evidence gaps flagged by the current form."])}
      </div>
    </div>
  </article>`;
}

function latestViewerLabel(activity) {
  const latest = activity.viewers?.[0];
  if (!latest) return "No profile views yet";
  return `${latest.role} at ${latest.organization}`;
}

function renderBuilderHistory(projectList) {
  if (!projectList.length) {
    return `<div class="empty">No submitted projects yet. Submit a project to build your creator history.</div>`;
  }

  return `<div class="history-list">
    ${projectList
      .map((project) => {
        const activity = getBuilderActivity(project);
        const reviewStatus = getReviewStatus(project);
        return `<article class="history-item">
          <div>
            <h3>${escapeHtml(project.title)}</h3>
            <p class="meta">${escapeHtml(project.country)} · ${escapeHtml(project.region)} · ${escapeHtml(project.sector)}</p>
            <p class="meta">Submitted ${escapeHtml(formatDate(activity.submittedAt || project.submittedAt))}</p>
          </div>
          <div class="badge-row">
            <span class="badge green">Verification: Self-reported</span>
            <span class="badge blue">Readiness: ${escapeHtml(project.readiness)}</span>
            <span class="badge ${gapClass(project.opportunityGap)}">Opportunity Gap: ${escapeHtml(project.opportunityGap)}</span>
            <span class="badge ${reviewStatusClass(reviewStatus)}">${escapeHtml(reviewStatus)}</span>
          </div>
          <div class="activity-stats">
            <div><span>Appeared in searches</span><strong>${escapeHtml(activity.searchAppearances || 0)}</strong></div>
            <div><span>Project views</span><strong>${escapeHtml(activity.projectViews || 0)}</strong></div>
            <div><span>Profile views</span><strong>${escapeHtml(activity.profileViews || 0)}</strong></div>
            <div><span>Latest viewer</span><strong>${escapeHtml(latestViewerLabel(activity))}</strong></div>
          </div>
          <div class="action-row">
            <a class="btn" href="../funder/index.html#discovery">View in Funder Dashboard</a>
            <button class="btn contact-funder-btn" data-project-id="${escapeHtml(project.id)}">Contact Funder</button>
            <button class="btn primary packet-btn" data-project-id="${escapeHtml(project.id)}">Open Evaluation Packet</button>
          </div>
        </article>`;
      })
      .join("")}
  </div>`;
}

function builderNotifications(projectList) {
  return projectList.flatMap((project) => {
    const activity = getBuilderActivity(project);
    const intel = getIntel(project.id);
    const topFunder = intel.potentialFunders?.[0];
    const notifications = [];

    if (topFunder) {
      notifications.push({
        label: "Funder recommendation",
        title: `${topFunder.name} appeared as a potentially relevant funder`,
        text: `${topFunder.reason} This is a relevance signal from available OECD funding records, not a funding decision.`,
        date: activity.submittedAt,
      });
    } else {
      notifications.push({
        label: "Coverage note",
        title: `Limited funder patterns found for ${project.title}`,
        text: "No strong funder patterns were found in the available records. This may reflect dataset coverage, not lack of project value.",
        date: activity.submittedAt,
      });
    }

    if (activity.searchAppearances) {
      notifications.push({
        label: "Search visibility",
        title: `${project.title} appeared in ${activity.searchAppearances} funder search${activity.searchAppearances === 1 ? "" : "es"}`,
        text: "Search appearances are counted when the self-reported profile appears in the Funder Discovery dashboard during this demo session.",
        date: activity.lastSearchAt || activity.submittedAt,
      });
    }

    if (activity.projectViews) {
      const latest = activity.projectViewers?.[0];
      notifications.push({
        label: "Project view",
        title: latest ? `${latest.role} at ${latest.organization} opened your Evaluation Packet` : `${project.title} received a project view`,
        text: "Project views are counted when a funder opens the project's Evaluation Packet in this browser.",
        date: activity.lastProjectViewedAt || activity.submittedAt,
      });
    }

    if (activity.profileViews) {
      const latest = activity.viewers?.[0];
      notifications.push({
        label: "Profile view",
        title: latest ? `${latest.role} at ${latest.organization} viewed your profile` : `${project.title} received a profile view`,
        text: "Profile views are counted when a funder clicks the builder name or opens the builder profile.",
        date: activity.lastProfileViewedAt || activity.submittedAt,
      });
    }

    const reviewStatus = getReviewStatus(project);
    if (reviewStatus !== "Not reviewed") {
      notifications.push({
        label: "Review status",
        title: `${project.title} is now marked: ${reviewStatus}`,
        text: "This status reflects funder actions taken inside the current Opportunity Atlas demo workflow.",
        date: activity.lastViewedAt || activity.submittedAt,
      });
    }

    return notifications;
  });
}

function renderBuilderNotifications(projectList) {
  const notifications = builderNotifications(projectList).slice(0, 8);
  if (!projectList.length) {
    return `<div class="empty">Notifications will appear after you submit a project.</div>`;
  }
  if (!notifications.length) {
    return `<div class="empty">No notifications yet.</div>`;
  }

  return `<div class="notification-list">
    ${notifications
      .map(
        (item) => `<article class="notification-item">
          <div class="notification-dot" aria-hidden="true"></div>
          <div>
            <div class="notification-topline">
              <span class="badge blue">${escapeHtml(item.label)}</span>
              <span class="meta">${escapeHtml(formatDate(item.date))}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.text)}</p>
          </div>
        </article>`,
      )
      .join("")}
  </div>`;
}

function renderBuilderDashboard() {
  const submitted = builderProjects();
  const activities = submitted.map((project) => getBuilderActivity(project));
  const searchTotal = activities.reduce((sum, activity) => sum + Number(activity.searchAppearances || 0), 0);
  const projectViewTotal = activities.reduce((sum, activity) => sum + Number(activity.projectViews || 0), 0);
  const profileViewTotal = activities.reduce((sum, activity) => sum + Number(activity.profileViews || 0), 0);

  return `<section class="builder-dashboard">
    <section class="grid four">
      ${kpi("Submitted Profiles", submitted.length)}
      ${kpi("Appeared in Searches", searchTotal)}
      ${kpi("Project Views", projectViewTotal)}
      ${kpi("Profile Views", profileViewTotal)}
    </section>
  </section>`;
}

function renderBuilderHistoryPage() {
  const target = $("#builder-history");
  if (!target) return;
  const submitted = builderProjects();
  target.innerHTML = `
    ${pageHeader(
      "builder-history-title",
      "Submission History",
      "Review the self-reported opportunity profiles you have submitted.",
      "",
      "",
      "Builder Portal",
    )}
    ${renderBuilderDashboard()}
    <section class="section card">
      ${sectionHeader("Submitted Projects", "These profiles are visible to funders in the Discovery workflow.")}
      ${renderBuilderHistory(submitted)}
    </section>
  `;
}

function renderBuilderNotificationsPage() {
  const target = $("#builder-notifications");
  if (!target) return;
  const submitted = builderProjects();
  target.innerHTML = `
    ${pageHeader(
      "builder-notifications-title",
      "Notifications",
      "Track funder relevance, search visibility, and profile-view signals.",
      "",
      "",
      "Builder Portal",
    )}
    ${renderBuilderDashboard()}
    <section class="section card">
      ${sectionHeader("Funder Signals", "Demo notifications inspired by professional profile and pipeline workflows.")}
      ${renderBuilderNotifications(submitted)}
      <div class="section note-panel">
        <strong>Demo visibility signals:</strong> These notifications come from local browser activity in this prototype. They are not verified outreach, funding offers, or real-time analytics.
      </div>
    </section>
  `;
}

function renderSimilarTable(records) {
  if (!records.length) {
    return `<div class="empty">No strong historical matches were found in the available OECD records. This does not mean the project is not valuable; it means the current dataset has limited coverage for this project area.</div>`;
  }
  const rows = records.slice(0, 6).map(
    (record) => `<tr>
      <td><strong>${escapeHtml(record.title)}</strong><br><span class="meta">${escapeHtml(truncateText(record.description || "No project description available."))}</span></td>
      <td>${escapeHtml(record.donor)}</td>
      <td>${escapeHtml(record.country)}</td>
      <td>${escapeHtml(record.sector)}</td>
      <td>${escapeHtml(record.year || "N/A")}</td>
      <td>${escapeHtml(record.amountLabel)}</td>
      <td>${escapeHtml(record.relevance)}</td>
    </tr>`,
  );
  return `<div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Project / Recipient Title</th>
          <th>Donor</th>
          <th>Country</th>
          <th>Sector</th>
          <th>Year</th>
          <th>Amount</th>
          <th>Relevance</th>
        </tr>
      </thead>
      <tbody>${rows.join("")}</tbody>
    </table>
  </div>`;
}

function renderFunders(funders) {
  if (!funders.length) {
    return `<div class="empty">No strong funder patterns were found in the available records. This may reflect dataset coverage, not lack of project value.</div>`;
  }
  return `<div class="grid three">
    ${funders
      .slice(0, 3)
      .map(
        (funder) => `<article class="card">
          <h3>${escapeHtml(funder.name)}</h3>
          <div class="badge-row">
            <span class="badge ${fitClass(funder.fit)}">Fit: ${escapeHtml(funder.fit)}</span>
            <span class="badge green">Matched funding: ${escapeHtml(funder.amountLabel)}</span>
          </div>
          <p class="meta">${escapeHtml(funder.reason)}</p>
        </article>`,
      )
      .join("")}
  </div>`;
}

function renderDetail() {
  const project = getProject();
  const intel = getIntel(project.id);
  const gap = intel.gapSignal || {};
  const gapLabel = project.opportunityGap || gap.label || "Unknown / Needs more data";
  const reviewStatus = getReviewStatus(project);
  const readiness = project.readiness || computeReadiness(project);
  const readinessReasons = readinessRationale(project);
  const gapReasons = project.gapRationale || gapRationale(project, intel);
  $("#detail").innerHTML = `
    ${pageHeader(
      "detail-title",
      project.title,
      `${project.country} · ${project.sector} · ${project.stage}`,
      "",
      `<span class="badge green">Verification: ${escapeHtml(project.verification)}</span>
       <span class="badge blue">Readiness: ${escapeHtml(readiness)}</span>
       <span class="badge ${gapClass(gapLabel)}">Opportunity Gap: ${escapeHtml(gapLabel)}</span>
       <span class="badge ${reviewStatusClass(reviewStatus)}">Current Review Status: ${escapeHtml(reviewStatus)}</span>
       <button class="btn review-action" data-action="shortlist">Shortlist</button>
       <button class="btn review-action" data-action="evidence">Request Evidence</button>
       <button class="btn review-action" data-action="invite">Invite to Apply</button>
       <button class="btn contact-builder-btn" data-project-id="${escapeHtml(project.id)}">Contact Builder</button>
       <button class="btn primary review-action" data-action="funded">Record Funding</button>`,
    )}
    ${state.reviewMessage ? `<div class="toast">${escapeHtml(state.reviewMessage)}</div>` : ""}
    <section class="packet-strip">
      <article><span>Packet Type</span><strong>Funder Review</strong></article>
      <article><span>Primary Need</span><strong>${escapeHtml(project.fundingNeed)} pilot grant</strong></article>
      <article><span>Evidence Status</span><strong>Self-reported</strong></article>
      <article><span>OECD Layer</span><strong>Funding intelligence</strong></article>
    </section>
    <section class="section detail-layout">
      <article class="card">
        ${sectionHeader("Project Snapshot", "Structured project record prepared for funder screening.")}
        <div class="profile-grid">
          ${renderProfileField("Project", project.title)}
          <div class="field">
            <span>Builder</span>
            <strong>
              <button class="builder-link inline" data-builder-id="${escapeHtml(project.builderId)}" data-project-id="${escapeHtml(project.id)}" type="button">${escapeHtml(builderName(project))}</button>
            </strong>
          </div>
          ${renderProfileField("Builder Role", builderRole(project))}
          ${renderProfileField("Country", project.country)}
          ${renderProfileField("Region", project.region)}
          ${renderProfileField("Sector", project.sector)}
          ${renderProfileField("Subsector", project.subsector)}
          ${renderProfileField("Beneficiaries", project.beneficiaries)}
          ${renderProfileField("Stage", project.stage)}
          ${renderProfileField("Funding Need", `${project.fundingNeed} pilot grant`)}
          ${renderProfileField("Verification", project.verification)}
          ${renderProfileField("Current Review Status", reviewStatus)}
          ${project.pilotPartner ? renderProfileField("Pilot / Local Partner", project.pilotPartner) : ""}
          ${project.usersReached ? renderProfileField("Current Users / Beneficiaries", project.usersReached) : ""}
          ${project.budgetBreakdown ? renderProfileField("Budget Breakdown", project.budgetBreakdown) : ""}
          ${project.teamBackground ? renderProfileField("Team Background", project.teamBackground) : ""}
          ${project.tractionEvidence ? renderProfileField("Traction / Evidence", project.tractionEvidence) : ""}
          ${project.impactMeasurement ? renderProfileField("Impact Measurement Plan", project.impactMeasurement) : ""}
        </div>
        <div class="section note-panel"><strong>Verification status: Self-reported.</strong></div>
      </article>
      <article class="card">
        ${sectionHeader("Readiness & Risks", "Readiness is separate from funder relevance.")}
        <span class="badge blue">${escapeHtml(readiness)}</span>
        <div class="split-list section">
          <div>
            <h3>Strengths</h3>
            ${renderList([
              project.description ? "Clear project description" : "Project description needs detail",
              project.beneficiaries ? "Specific target beneficiaries" : "Target beneficiaries need detail",
              project.stage ? `${project.stage} stage selected` : "Stage needs confirmation",
              project.fundingNeed ? "Concrete funding request" : "Funding request needs detail",
            ])}
          </div>
          <div>
            <h3>Needs Review</h3>
            ${renderList(needsReviewItems(project))}
          </div>
        </div>
        <div class="section rationale-box">
          <h3>Why this readiness?</h3>
          ${renderList(readinessReasons)}
        </div>
        <div class="section">
          <h3>Recommended review questions</h3>
          <ol>
            <li>Can the builder provide a demo or screenshots?</li>
            <li>Is there a letter from a pilot partner?</li>
            <li>What is the budget breakdown?</li>
            <li>How many users or beneficiaries will be reached?</li>
            <li>What outcome will be measured?</li>
          </ol>
        </div>
      </article>
    </section>
    <section class="section">
      ${renderEvidenceStatus(project)}
    </section>

    <section class="section card">
      ${sectionHeader("Funding Context", "Historical philanthropy records that may indicate funder relevance.")}
      <p class="lead">OECD philanthropy data is used as a funding intelligence layer. It helps identify which funders may care about this project area based on historical funding behavior.</p>
      ${renderSimilarTable(intel.similarProjects || [])}
      <div class="section note-panel"><strong>Similar funded projects indicate funder relevance, not proof of project quality.</strong> ${escapeHtml(intel.coverageNote)}</div>
      <div class="split-list">
        <div>
          <h3>Relevant funding patterns</h3>
          ${renderList([
            `${project.sector} projects have received funding in ${project.region}.`,
            intel.similarProjects?.length
              ? `${intel.similarProjects.length} related records were found in the available matching corpus.`
              : "No strong historical matches were found in the available OECD records.",
            "The project is contextualized against historical philanthropy themes in OECD records.",
          ])}
        </div>
        <div class="note-panel">
          <strong>Funding intelligence only</strong>
          <p>OECD data is not used as talent data. It contextualizes historical funding patterns, similar funded projects, and funder relevance.</p>
        </div>
      </div>
      <div class="section">
        <h3>Potentially Relevant Funders</h3>
        ${renderFunders(intel.potentialFunders || [])}
      </div>
    </section>

    <section class="section card">
      ${sectionHeader("Opportunity Gap", "Funding-pattern context for responsible investigation.")}
      <div class="badge-row">
        <span class="badge ${gapClass(gapLabel)}">Opportunity Gap: ${escapeHtml(gapLabel)}</span>
        <span class="badge blue">Country-sector funding: ${escapeHtml(gap.countrySectorAmountLabel || "Needs review")}</span>
        <span class="badge green">Sector median by country: ${escapeHtml(gap.sectorMedianCountryAmountLabel || "Needs review")}</span>
      </div>
      <h3 class="section">Why this may be overlooked:</h3>
      ${renderList(gapReasons)}
      <h3 class="section">Interpretation</h3>
      <p class="lead">This may be an overlooked opportunity for funders to investigate, not a guaranteed investment.</p>
      <div class="note-panel"><strong>Underfunding is a signal, not a conclusion.</strong></div>
    </section>
  `;
}

function renderSubmit() {
  const profile = state.builderProfile;
  $("#submit").innerHTML = `
    ${pageHeader(
      "submit-title",
      "Submit a Local Project",
      "Turn an informal project into a funder-readable opportunity profile.",
      "",
      "",
      "Builder Portal",
    )}
    <section class="builder-submit-grid">
      <form id="project-form" class="card">
        <div class="form-grid">
          <label>Builder Name<input name="builderName" required value="Mariana Torres" /></label>
          <label>Builder Role<input name="builderRole" value="Student builder" /></label>
          <label>Project Title<input name="title" required value="Community tutoring map for public libraries" /></label>
          <label>Country<input name="country" required value="Colombia" /></label>
          <label>Region<input name="region" required value="Latin America" /></label>
          <label>Sector<input name="sector" required value="Education" /></label>
          <label>Subsector<input name="subsector" value="Tutoring access / public learning spaces" /></label>
          <label>Current Stage<select name="stage"><option>Idea</option><option selected>Prototype</option><option>Pilot-ready</option><option>Active users</option></select></label>
          <label class="wide">Project Description<textarea name="description" required>Student volunteers are mapping local tutoring availability and matching learners to low-cost sessions in public libraries.</textarea></label>
          <label>Target Beneficiaries<input name="beneficiaries" required value="Public school students" /></label>
          <label>Funding Need<input name="funding" required value="$12,000" /></label>
          <label>Evidence Link, optional<input name="evidence" placeholder="https://..." /><small>Demo, photos, website, GitHub, pitch deck, field report, or other proof.</small></label>
          <label>Pilot partner or local partner<input name="pilotPartner" placeholder="School, clinic, NGO, community group" /></label>
          <label>Current users / beneficiaries reached<input name="usersReached" placeholder="e.g. 120 students, 3 schools, 2 workshops" /></label>
          <label>Budget breakdown<textarea name="budgetBreakdown" placeholder="How would the requested funding be used?"></textarea><small>How would the requested funding be used?</small></label>
          <label>Team background<textarea name="teamBackground" placeholder="Who is building this and what local experience do they have?"></textarea></label>
          <label>Traction or evidence<textarea name="tractionEvidence" placeholder="Any users, pilots, testimonials, workshops, or early results?"></textarea><small>Any users, pilots, testimonials, workshops, or early results?</small></label>
          <label class="wide">Impact measurement plan<textarea name="impactMeasurement" placeholder="What outcome would be measured during a pilot?"></textarea></label>
        </div>
        <div class="section">
          <button class="btn primary" type="submit">Generate Opportunity Profile</button>
        </div>
      </form>
      <article id="profile-preview" class="card">
        ${sectionHeader("Self-Reported Opportunity Profile", "This preview is structured for funder review.")}
        ${
          profile
            ? `<div class="profile-grid">
                ${renderProfileField("Project title", profile.title)}
                ${renderProfileField("Builder", builderName(profile))}
                ${renderProfileField("Builder role", builderRole(profile))}
                ${renderProfileField("Country", profile.country)}
                ${renderProfileField("Region", profile.region)}
                ${renderProfileField("Sector", profile.sector)}
                ${renderProfileField("Subsector", profile.subsector)}
                ${renderProfileField("Beneficiaries", profile.beneficiaries)}
                ${renderProfileField("Stage", profile.stage)}
                ${renderProfileField("Funding need", profile.fundingNeed)}
                ${renderProfileField("Readiness", profile.readiness)}
                ${renderProfileField("Opportunity gap", profile.opportunityGap)}
                ${renderProfileField("Verification status", "Self-reported")}
                ${profile.evidenceLink ? renderProfileField("Evidence link", profile.evidenceLink) : ""}
                ${profile.pilotPartner ? renderProfileField("Pilot / local partner", profile.pilotPartner) : ""}
                ${profile.usersReached ? renderProfileField("Current users / beneficiaries", profile.usersReached) : ""}
                ${profile.budgetBreakdown ? renderProfileField("Budget breakdown", profile.budgetBreakdown) : ""}
                ${profile.teamBackground ? renderProfileField("Team background", profile.teamBackground) : ""}
                ${profile.tractionEvidence ? renderProfileField("Traction or evidence", profile.tractionEvidence) : ""}
                ${profile.impactMeasurement ? renderProfileField("Impact measurement plan", profile.impactMeasurement) : ""}
              </div>
              <div class="section note-panel">Your project has been converted into a self-reported opportunity profile and added to the Funder Discovery Dashboard.</div>
              <div class="section badge-row">
                <a class="btn" href="../funder/index.html#discovery">View in Funder Dashboard</a>
                <button class="btn route-btn" data-page="builder-history" type="button">View History</button>
                <button class="btn primary packet-btn" data-project-id="${escapeHtml(profile.id)}">View Evaluation Packet</button>
              </div>`
            : `<div class="empty">Submit a project to generate a structured funder-readable preview.</div>`
        }
      </article>
    </section>
  `;
}

function threadPreview(thread) {
  const latest = thread.messages?.[thread.messages.length - 1];
  return latest ? latest.text : "No messages yet.";
}

function threadPrimaryName(thread) {
  return currentPortalType() === "builder"
    ? thread.funderName || "Funder"
    : thread.builderName || "Builder";
}

function threadMeta(thread) {
  return currentPortalType() === "builder"
    ? `${thread.projectTitle} · ${thread.builderName || "Your profile"}`
    : `${thread.projectTitle} · ${thread.funderName || "Funder"}`;
}

function messageSide(sender) {
  if (sender === currentSenderLabel()) return "mine";
  if (sender === "Builder" || sender === "Funder") return "theirs";
  return "system";
}

function messageSenderName(message, thread) {
  if (message.system) return "Opportunity Atlas";
  if (message.sender === currentSenderLabel()) return "You";
  if (message.sender === "Builder") return thread.builderName || "Builder";
  if (message.sender === "Funder") return thread.funderName || "Funder";
  return message.sender || "Message";
}

function renderMessages() {
  const target = $("#messages");
  if (!target) return;
  const portal = currentPortalType();
  const threads = getThreads().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const activeThread = threads.find((thread) => thread.id === state.selectedThreadId) || threads[0];
  if (activeThread) state.selectedThreadId = activeThread.id;

  target.innerHTML = `
    ${pageHeader(
      "messages-title",
      "Messages",
      portal === "builder"
        ? "Manage local demo conversations with funders."
        : "Manage local demo conversations with builders.",
      "Messages in this prototype stay in browser localStorage. They are not sent externally.",
      "",
      portal === "builder" ? "Builder Portal" : "Funder Portal",
    )}
    <section class="messages-shell">
      <aside class="thread-list card">
        ${sectionHeader("Threads", `${threads.length} conversation${threads.length === 1 ? "" : "s"}`)}
        ${
          threads.length
            ? threads
                .map(
                  (thread) => `<button class="thread-item ${thread.id === state.selectedThreadId ? "active" : ""}" data-thread-id="${escapeHtml(thread.id)}" type="button">
                    <strong>${escapeHtml(threadPrimaryName(thread))}</strong>
                    <span>${escapeHtml(threadMeta(thread))}</span>
                    <p>${escapeHtml(truncateText(threadPreview(thread), 96))}</p>
                  </button>`,
                )
                .join("")
            : `<div class="empty">No messages yet. Use Contact Builder or Contact Funder to start a local demo thread.</div>`
        }
      </aside>
      <section class="message-panel card">
        ${
          activeThread
            ? `<div class="message-header">
                <div>
                  <h2>${escapeHtml(threadPrimaryName(activeThread))}</h2>
                  <p class="meta">${escapeHtml(threadMeta(activeThread))}</p>
                </div>
                <span class="badge blue">Local demo thread</span>
              </div>
              <div class="message-list">
                ${(activeThread.messages || [])
                  .map(
                    (message) => `<article class="message-bubble ${messageSide(message.sender)}">
                      <span>${escapeHtml(messageSenderName(message, activeThread))} · ${escapeHtml(formatDate(message.at))}</span>
                      <p>${escapeHtml(message.text)}</p>
                    </article>`,
                  )
                  .join("")}
              </div>
              <form id="message-form" class="message-form">
                <input name="message" placeholder="${portal === "builder" ? "Write a local reply to the funder..." : "Write a local message to the builder..."}" required />
                <button class="btn primary" type="submit">Add Message</button>
              </form>`
            : `<div class="empty">Start from a project card, builder profile, or history item to create a conversation.</div>`
        }
      </section>
    </section>
  `;
}

function renderSignals() {
  const metrics = oecd.metrics || {};
  const yearly = oecd.fundingByYear || [];
  $("#signals").innerHTML = `
    ${pageHeader(
      "signals-title",
      "OECD Funding Signals",
      "Explore historical philanthropy funding patterns used to contextualize local projects.",
    )}
    <section class="grid four">
      ${kpi("Total Funding", metrics.totalFundingLabel || "$68.2B")}
      ${kpi("Funding Records", metrics.recordCountLabel || "116K+")}
      ${kpi("Recipient Countries", String(metrics.recipientCountries || 163))}
      ${kpi("Donor Organizations", String(metrics.donorOrganizations || 506))}
    </section>
    <article class="card chart-card section">
      ${sectionHeader("Funding by Year", "Total disbursements per year · USD millions, deflated")}
      ${yearLineChart(yearly.map((item) => ({ label: item.year, amount: item.amount, amountLabel: item.amountLabel })), "amount")}
    </article>
    <section class="section grid two">
      <article class="card chart-card">
        ${sectionHeader("Funding by Sector", "Share of total disbursements")}
        ${donutChart(oecd.topSectors || [], "amount")}
      </article>
      <article class="card chart-card">
        ${sectionHeader("Top Funders")}
        ${barList(oecd.topFunders || [], "amount")}
      </article>
    </section>
    <article class="card chart-card section">
      ${sectionHeader("Top Recipient Countries")}
      ${barList(oecd.topRecipientCountries || [], "amount")}
    </article>
    <section class="section note-panel">
      <strong>OECD data is used as funding intelligence, not talent data.</strong> It helps funders understand historical philanthropy funding patterns, similar funded projects, and funder relevance.
    </section>
  `;
}

function renderCurrentPage() {
  renderOverview();
  renderDiscovery();
  renderDetail();
  renderBuilderProfilePage();
  renderQueue();
  renderFunderHistory();
  renderSignals();
  renderMessages();
  renderSubmit();
  renderBuilderHistoryPage();
  renderBuilderNotificationsPage();
  document.querySelectorAll(".page").forEach((page) => page.classList.toggle("active", page.id === state.page));
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.page === state.page));
  document.querySelectorAll(".top-tab").forEach((link) => link.classList.toggle("active", link.dataset.page === state.page));
}

function goTo(page) {
  state.page = page;
  if (page === "discovery") {
    recordBuilderSearchAppearances(projects.filter(matchesFilter), "Discover Projects");
  }
  renderCurrentPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (event) => {
  if (event.target.closest("#reset-demo-data")) {
    localStorage.removeItem(STORAGE_KEYS.submittedProjects);
    localStorage.removeItem(STORAGE_KEYS.reviewStatuses);
    localStorage.removeItem(STORAGE_KEYS.builderActivity);
    localStorage.removeItem(STORAGE_KEYS.messages);
    window.location.reload();
    return;
  }

  const nav = event.target.closest(".nav-link");
  if (nav) {
    goTo(nav.dataset.page);
    return;
  }

  const route = event.target.closest(".route-btn");
  if (route) {
    if (route.dataset.resetFilters === "true") {
      Object.assign(state.filters, {
        country: "All",
        sector: "All",
        stage: "All",
        readiness: "All",
        gap: "All",
        verification: "Self-reported",
      });
    }
    goTo(route.dataset.page);
    return;
  }

  const packet = event.target.closest(".packet-btn");
  if (packet) {
    state.selectedProjectId = packet.dataset.projectId;
    const project = getProject(state.selectedProjectId);
    if (currentPortalType() === "funder" && ["overview", "discovery", "queue", "funder-history", "builder-profile"].includes(state.page)) {
      recordBuilderProjectView(project, "Evaluation Packet");
    }
    state.reviewMessage = "";
    goTo("detail");
    return;
  }

  const builderLink = event.target.closest(".builder-link");
  if (builderLink) {
    const project = getProject(builderLink.dataset.projectId);
    state.selectedBuilderId = builderLink.dataset.builderId || project.builderId;
    if (currentPortalType() === "funder") recordBuilderProfileView(project, "Builder Profile");
    goTo("builder-profile");
    return;
  }

  const contactBuilder = event.target.closest(".contact-builder-btn");
  if (contactBuilder) {
    const project = getProject(contactBuilder.dataset.projectId);
    ensureThread(project, "funder");
    goTo("messages");
    return;
  }

  const contactFunder = event.target.closest(".contact-funder-btn");
  if (contactFunder) {
    const project = getProject(contactFunder.dataset.projectId);
    ensureThread(project, "builder");
    goTo("messages");
    return;
  }

  const thread = event.target.closest(".thread-item");
  if (thread) {
    state.selectedThreadId = thread.dataset.threadId;
    renderMessages();
    return;
  }

  const reviewAction = event.target.closest(".review-action");
  if (reviewAction) {
    const project = getProject();
    const messages = {
      shortlist: ["Shortlisted", "Project added to shortlist."],
      evidence: ["Evidence requested", "Evidence request marked."],
      invite: ["Invited to apply", "Project marked as invited to apply."],
      funded: ["Funded", "Funding recorded in funder history."],
    };
    const [status, message] = messages[reviewAction.dataset.action] || messages.shortlist;
    project.reviewStatus = status;
    state.reviewMessage = message;
    saveReviewStatuses();
    renderDetail();
  }
});

document.addEventListener("change", (event) => {
  const filter = event.target.closest("[data-filter]");
  if (!filter) return;
  state.filters[filter.dataset.filter] = filter.value;
  if (state.page === "discovery") {
    recordBuilderSearchAppearances(projects.filter(matchesFilter), "Discovery filter");
  }
  renderDiscovery();
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "message-form") {
    event.preventDefault();
    const form = new FormData(event.target);
    addMessageToThread(state.selectedThreadId, form.get("message"));
    renderMessages();
    return;
  }

  if (event.target.id !== "project-form") return;
  event.preventDefault();
  const form = new FormData(event.target);
  const title = form.get("title");
  const stage = form.get("stage") || "Idea";
  const submittedBuilderName = form.get("builderName") || "Self-reported builder";
  const newProject = {
    id: `${slugify(title)}-${Date.now().toString(36)}`,
    title: title || "Untitled local project",
    builderName: submittedBuilderName,
    builderId: builderIdFor(submittedBuilderName),
    builderRole: form.get("builderRole") || "Young builder",
    country: form.get("country") || "Unspecified",
    region: form.get("region") || "Unspecified",
    builderLocation: form.get("country") || "Local builder",
    sector: form.get("sector") || "Unspecified",
    subsector: form.get("subsector") || "General",
    beneficiaries: form.get("beneficiaries") || "Unspecified",
    stage,
    fundingNeed: form.get("funding") || "Needs review",
    verification: "Self-reported",
    description: form.get("description") || "No description provided.",
    evidenceLink: form.get("evidence") || "",
    pilotPartner: form.get("pilotPartner") || "",
    usersReached: form.get("usersReached") || "",
    budgetBreakdown: form.get("budgetBreakdown") || "",
    teamBackground: form.get("teamBackground") || "",
    tractionEvidence: form.get("tractionEvidence") || "",
    impactMeasurement: form.get("impactMeasurement") || "",
    reviewStatus: "Not reviewed",
    submittedAt: new Date().toISOString(),
    isSubmitted: true,
  };
  newProject.readiness = computeReadiness(newProject);
  newProject.readinessFilter = readinessFilterFor(newProject.readiness);
  const newProjectIntel = generateFundingContext(newProject);
  newProject.opportunityGap = computeGap(newProject, newProjectIntel);
  newProject.gapRationale = gapRationale(newProject, newProjectIntel);
  projects.push(newProject);
  state.builderProfile = newProject;
  state.selectedProjectId = newProject.id;
  state.reviewMessage = "";
  initializeBuilderActivity(newProject);
  saveSubmittedProjects();
  renderSubmit();
});

initializeStoredData();
if (state.page === "discovery") {
  recordBuilderSearchAppearances(projects.filter(matchesFilter), "Discover Projects");
}
renderCurrentPage();
