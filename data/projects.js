/**
 * Shared project data for Link with iQ.
 *
 * This is the single source of truth used by project.html (the detail-page
 * template, which reads ?slug= from the URL and looks up an entry here).
 * The homepage's project cards are still hand-written HTML for reliability
 * and SEO, but their content should stay in sync with this file.
 */
window.LINKWITHIQ_PROJECTS = [
  {
    slug: "community-toolkit",
    name: "Community Toolkit",
    status: "live",
    statusLabel: "Live",
    repo: "linkwithiq/community-toolkit",
    tags: ["web", "open-source"],
    summary: "A set of free, plug-and-play tools for small community groups to organise events, track members, and share updates without needing a budget.",
    problem: "Small community groups — tenant associations, mutual aid networks, hobby clubs — often can't justify paying for event and membership software, so they end up juggling spreadsheets, group chats, and paper sign-up sheets.",
    approach: "A lightweight, self-hostable toolkit covering the three things almost every group needs: an event page with RSVPs, a simple member directory, and an update/announcement feed. No accounts required to view public pages; organisers get a single login.",
    outcome: "Early version live and in use by two community gardens for event sign-ups. Member directory and announcement feed are functional; working on CSV import for groups migrating off spreadsheets.",
    links: [
      { label: "View on GitHub", href: "https://github.com/linkwithiq/community-toolkit" }
    ]
  },
  {
    slug: "resource-finder",
    name: "Resource Finder",
    status: "building",
    statusLabel: "In progress",
    repo: "linkwithiq/resource-finder",
    tags: ["civic", "database"],
    summary: "A simple, searchable directory that connects people with local help — food, shelter, legal aid — filtered by location and need, not jargon.",
    problem: "Directories of social services exist, but they're often outdated, scattered across multiple sites, or written in agency language that's hard to search if you don't already know the category you need.",
    approach: "A single searchable directory where you describe your situation in plain language (\"I need somewhere to sleep tonight\") and it maps that to the right categories and nearby listings, sourced from public, regularly-refreshed datasets where available.",
    outcome: "Data model and search matching are built; currently sourcing and verifying an initial dataset for a single pilot region before expanding coverage.",
    links: [
      { label: "Follow progress on GitHub", href: "https://github.com/linkwithiq/resource-finder" }
    ]
  },
  {
    slug: "study-with-iq",
    name: "Study With iQ",
    status: "building",
    statusLabel: "In progress",
    repo: "linkwithiq/study-with-iq",
    tags: ["education", "docs"],
    summary: "Free, structured learning paths and cheat-sheets for students getting started in programming — written in plain language, no prerequisites assumed.",
    problem: "Most beginner programming resources either assume too much prior knowledge or are so simplified they don't prepare learners for real projects — and a lot of free material is scattered, outdated, or paywalled halfway through.",
    approach: "Short, sequential learning paths (not a full course platform) that take someone from zero to a first real project in a specific track — currently focused on a web-basics path and a python-basics path — plus printable cheat-sheets for common syntax and concepts.",
    outcome: "Web-basics path outline and first four lessons are drafted. Looking for early learners willing to test the material and flag where it's confusing.",
    links: [
      { label: "Follow progress on GitHub", href: "https://github.com/linkwithiq/study-with-iq" }
    ]
  },
  {
    slug: "snippet-library",
    name: "Snippet Library",
    status: "live",
    statusLabel: "Live",
    repo: "linkwithiq/snippet-library",
    tags: ["dev-tools", "open-source"],
    summary: "A growing, curated set of copy-paste-ready code snippets and boilerplate for common product problems, saving builders the reinvention tax.",
    problem: "The same handful of problems — form validation, debounced search, auth guards, pagination — get solved over and over across small projects, usually worse each time because nobody has the reference open.",
    approach: "A plain, framework-tagged library of short, well-commented snippets for the problems that come up constantly, organised so you can find what you need without wading through a mega-framework.",
    outcome: "Live with an initial set of JavaScript/TypeScript snippets covering forms, data fetching, and common UI patterns. Python and CSS sections are next.",
    links: [
      { label: "View on GitHub", href: "https://github.com/linkwithiq/snippet-library" }
    ]
  },
  {
    slug: "report-it",
    name: "Report It",
    status: "concept",
    statusLabel: "Concept",
    repo: "linkwithiq/report-it",
    tags: ["civic", "mobile"],
    summary: "A lightweight way for residents to flag broken civic infrastructure — potholes, outages, unsafe crossings — and track what happens next.",
    problem: "Reporting a pothole or broken streetlight often means finding the right department, filling out a form built for desktop in 2009, and then having no idea whether anything happened.",
    approach: "A minimal mobile-first report flow (photo, pin a location, one-line description) that files into existing municipal reporting systems where an API or email intake exists, with a simple status view so the reporter can see what happened.",
    outcome: "Still scoping which cities have usable public reporting intake and what a realistic v1 looks like before writing code — this is the earliest-stage project on the list.",
    links: [
      { label: "Follow progress on GitHub", href: "https://github.com/linkwithiq/report-it" }
    ]
  },
  {
    slug: "portfolio-starter",
    name: "Portfolio Starter",
    status: "live",
    statusLabel: "Live",
    repo: "linkwithiq/portfolio-starter",
    tags: ["template", "open-source"],
    summary: "A no-nonsense, accessible starter template so anyone can put up a personal or project site in an afternoon — no framework fatigue.",
    problem: "Putting up a simple personal or project site shouldn't require learning a build pipeline, and a lot of \"starter templates\" ship bloated with dependencies nobody needs for a five-page site.",
    approach: "Plain HTML/CSS/JS, zero build step, deploys straight to GitHub Pages. Accessible by default (semantic markup, keyboard nav, focus states) with a small set of clearly-documented customization points.",
    outcome: "Live and stable. Used as the base for this very site, in fact.",
    links: [
      { label: "View on GitHub", href: "https://github.com/linkwithiq/portfolio-starter" }
    ]
  }
];
