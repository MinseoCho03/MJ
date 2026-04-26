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

const state = {
  page: window.__INITIAL_PAGE__ || "overview",
  selectedProjectId: "offline-learning-ghana",
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
  return {
    readiness: deriveReadinessFromStage(project.stage),
    readinessFilter: readinessFilterFor(project.readiness || deriveReadinessFromStage(project.stage)),
    opportunityGap: project.opportunityGap || "Medium",
    verification: "Self-reported",
    reviewStatus: "Not reviewed",
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
      <button class="btn primary packet-btn" data-project-id="${escapeHtml(project.id)}">${featured ? "View" : "View"}</button>
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
       <button class="btn primary review-action" data-action="invite">Invite to Apply</button>`,
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
                <button class="btn primary packet-btn" data-project-id="${escapeHtml(profile.id)}">View</button>
              </div>`
            : `<div class="empty">Submit a project to generate a structured funder-readable preview.</div>`
        }
      </article>
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
      ${kpi("Recipient Countries", `${metrics.recipientCountries || 163}+`)}
      ${kpi("Donor Organizations", `${metrics.donorOrganizations || 506}+`)}
    </section>
    <section class="section filter-panel">
      ${filterOptions("Country", "country", ["All", "Ghana", "India", "Kenya", "Nigeria", "Indonesia"])}
      ${filterOptions("Sector", "sector", ["All", "Education", "Health", "Climate", "Agriculture", "Civic Tech"])}
      <label>Donor Country<select><option>All</option><option>United States</option><option>United Kingdom</option><option>Netherlands</option><option>Switzerland</option></select></label>
      <label>Year<select><option>All</option>${yearly.map((item) => `<option>${escapeHtml(item.year)}</option>`).join("")}</select></label>
    </section>
    <section class="section grid two">
      <article class="card chart-card">
        ${sectionHeader("Funding by Year")}
        ${barList(yearly.map((item) => ({ label: item.year, amount: item.amount, amountLabel: item.amountLabel })), "amount")}
      </article>
      <article class="card chart-card">
        ${sectionHeader("Top Recipient Countries")}
        ${barList(oecd.topRecipientCountries || [], "amount")}
      </article>
      <article class="card chart-card">
        ${sectionHeader("Top Sectors")}
        ${barList(oecd.topSectors || [], "amount")}
      </article>
      <article class="card chart-card">
        ${sectionHeader("Top Funders")}
        ${barList(oecd.topFunders || [], "amount")}
      </article>
    </section>
    <section class="section note-panel">
      <strong>OECD data is used as funding intelligence, not talent data.</strong> It helps funders understand historical philanthropy funding patterns, similar funded projects, and funder relevance.
    </section>
  `;
}

function renderCurrentPage() {
  renderOverview();
  renderDiscovery();
  renderDetail();
  renderQueue();
  renderSignals();
  renderSubmit();
  document.querySelectorAll(".page").forEach((page) => page.classList.toggle("active", page.id === state.page));
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.page === state.page));
}

function goTo(page) {
  state.page = page;
  renderCurrentPage();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.addEventListener("click", (event) => {
  if (event.target.closest("#reset-demo-data")) {
    localStorage.removeItem(STORAGE_KEYS.submittedProjects);
    localStorage.removeItem(STORAGE_KEYS.reviewStatuses);
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
    state.reviewMessage = "";
    goTo("detail");
    return;
  }

  const reviewAction = event.target.closest(".review-action");
  if (reviewAction) {
    const project = getProject();
    const messages = {
      shortlist: ["Shortlisted", "Project added to shortlist."],
      evidence: ["Evidence requested", "Evidence request marked."],
      invite: ["Invited to apply", "Project marked as invited to apply."],
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
  renderDiscovery();
});

document.addEventListener("submit", (event) => {
  if (event.target.id !== "project-form") return;
  event.preventDefault();
  const form = new FormData(event.target);
  const title = form.get("title");
  const stage = form.get("stage") || "Idea";
  const newProject = {
    id: `${slugify(title)}-${Date.now().toString(36)}`,
    title: title || "Untitled local project",
    country: form.get("country") || "Unspecified",
    region: form.get("region") || "Unspecified",
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
  saveSubmittedProjects();
  renderSubmit();
});

initializeStoredData();
renderCurrentPage();
