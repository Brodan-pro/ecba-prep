export interface ActivityStatement {
  id: string;
  text: string;
}

export interface Domain {
  id: string;
  number: number;
  name: string;
  weight: number;
  questionCount: number;
  color: string;
  bgColor: string;
  activities: ActivityStatement[];
  techniques?: string[];
}

export const ECBA_DOMAINS: Domain[] = [
  {
    id: "domain1",
    number: 1,
    name: "Understanding Business Analysis",
    weight: 20,
    questionCount: 10,
    color: "#7C3AED",
    bgColor: "#EDE9FE",
    activities: [
      { id: "1.1", text: "Define business analysis, describe its role in enabling change, and outline key activities across contexts." },
      { id: "1.2", text: "Describe the six BACCM concepts, explain how they relate, and use them to support structured thinking." },
      { id: "1.3", text: "Explain how business analysis supports value creation and benefits organizations in various industries." },
      { id: "1.4", text: "Define value in business analysis and explain how outcomes are assessed to support value realization." },
    ],
  },
  {
    id: "domain2",
    number: 2,
    name: "Mindset for Effective Business Analysis",
    weight: 14,
    questionCount: 7,
    color: "#0369A1",
    bgColor: "#E0F2FE",
    activities: [
      { id: "2.1", text: "Explain how mindset influences your effectiveness and identify ways to adopt an empowering mindset." },
      { id: "2.2", text: "Recognize the shared values that drive work and explain how those values support the work to be done." },
      { id: "2.3", text: "Identify core business analysis principles and apply them to guide your work and improve outcomes." },
      { id: "2.4", text: "Recognize foundational competencies and assess when to apply them in your work." },
    ],
  },
  {
    id: "domain3",
    number: 3,
    name: "Implementing Business Analysis",
    weight: 6,
    questionCount: 3,
    color: "#065F46",
    bgColor: "#D1FAE5",
    activities: [
      { id: "3.1", text: "Identify roles that perform business analysis and describe how responsibilities vary across contexts." },
      { id: "3.2", text: "Compare business analysis approaches and explain how to choose an approach based on the situation." },
      { id: "3.3", text: "Identify organizational considerations that influence your work and explain their potential impact." },
      { id: "3.4", text: "Describe the difference between requirements and designs and explain how they evolve throughout the initiative." },
    ],
  },
  {
    id: "domain4",
    number: 4,
    name: "Change",
    weight: 10,
    questionCount: 5,
    color: "#B45309",
    bgColor: "#FEF3C7",
    activities: [
      { id: "4.1", text: "Recognize how key organizational, environmental, and stakeholder factors can influence your work." },
      { id: "4.2", text: "Describe processes and systems to identify areas impacted by changes, and evaluate the impacts." },
      { id: "4.3", text: "Track progress toward goals and support teams in adapting to changes, under direction." },
      { id: "4.4", text: "Suggest and help implement simple improvements, working within clear guidelines." },
    ],
  },
  {
    id: "domain5",
    number: 5,
    name: "Need",
    weight: 10,
    questionCount: 5,
    color: "#BE185D",
    bgColor: "#FCE7F3",
    activities: [
      { id: "5.1", text: "Use basic elicitation methods and build positive rapport with stakeholders to elicit information." },
      { id: "5.2", text: "Document requirements clearly and collaborate with stakeholders to validate needs, under guidance." },
      { id: "5.3", text: "Compare stakeholder needs with outcomes to check alignment and flag conflicts for review." },
      { id: "5.4", text: "Support stakeholders in prioritizing needs, considering business value and urgency." },
    ],
  },
  {
    id: "domain6",
    number: 6,
    name: "Solution",
    weight: 10,
    questionCount: 5,
    color: "#0E7490",
    bgColor: "#CFFAFE",
    activities: [
      { id: "6.1", text: "Explain basic solution validation concepts and record findings." },
      { id: "6.2", text: "Assist in evaluating solution options, considering feasibility and risks, and contribute to preparing recommendations." },
      { id: "6.3", text: "Support defining scope and collaborate on planning and monitoring implementation activities." },
      { id: "6.4", text: "Support preparation and updating of design artifacts to maintain clarity." },
    ],
  },
  {
    id: "domain7",
    number: 7,
    name: "Stakeholder",
    weight: 10,
    questionCount: 5,
    color: "#7C2D12",
    bgColor: "#FFEDD5",
    activities: [
      { id: "7.1", text: "Communicate with stakeholders using tailored messages to maintain engagement." },
      { id: "7.2", text: "Identify stakeholder roles and interests, and support analysis of their impact." },
      { id: "7.3", text: "Facilitate stakeholder collaboration and feedback throughout the initiative." },
      { id: "7.4", text: "Identify key stakeholder motivations, drivers, and concerns to understand their decisions." },
    ],
  },
  {
    id: "domain8",
    number: 8,
    name: "Value",
    weight: 10,
    questionCount: 5,
    color: "#3730A3",
    bgColor: "#E0E7FF",
    activities: [
      { id: "8.1", text: "Confirm understanding of desired outcomes aligned with business objectives." },
      { id: "8.2", text: "Support identification of value opportunities and help address barriers to delivery." },
      { id: "8.3", text: "Describe how solutions meet business goals and relay information effectively for stakeholders." },
      { id: "8.4", text: "Support defining key performance indicators (KPIs) aligned with value to measure success." },
    ],
  },
  {
    id: "domain9",
    number: 9,
    name: "Context",
    weight: 10,
    questionCount: 5,
    color: "#166534",
    bgColor: "#DCFCE7",
    activities: [
      { id: "9.1", text: "Assist in validating information quality and alignment to your situation, and document those validation outcomes." },
      { id: "9.2", text: "Support recognizing constraints and adapt plans to maintain alignment." },
      { id: "9.3", text: "Assist in analyzing technology trends and support technology integration." },
      { id: "9.4", text: "Apply relevant industry standards and frameworks to guide the work to be done." },
    ],
  },
];

export const ECBA_TECHNIQUES = [
  "Backlog Management",
  "Brainstorming",
  "Business Capability Analysis",
  "Business Rules Analysis",
  "Collaborative Games",
  "Data Modelling",
  "Document Analysis",
  "Interviews",
  "Lessons Learned",
  "Metrics and Key Performance Indicators (KPIs)",
  "Organizational Modelling",
  "Process Analysis",
  "Process Modelling",
  "Risk Analysis and Management",
  "Root Cause Analysis",
  "Scope Modelling",
  "Stakeholder List, Map, or Personas",
  "SWOT Analysis",
  "User Stories",
  "Workshops",
];

export const TOTAL_EXAM_QUESTIONS = 50;
export const EXAM_DURATION_SECONDS = 75 * 60; // 75 minutes
