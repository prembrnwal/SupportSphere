import type { Ticket, User, TicketCategory, TicketPriority, TicketStatus } from '@/types';

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: 'Technical',
  billing: 'Billing',
  account: 'Account',
  feature_request: 'Feature Request',
  bug: 'Bug Report',
  general: 'General',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  closed: 'Closed',
};

export const dummyUsers: User[] = [
  { id: 'u1', name: 'Aarav Sharma', email: 'aarav@acme.com', role: 'customer', createdAt: '2025-01-12T10:00:00Z' },
  { id: 'u2', name: 'Priya Verma', email: 'priya@acme.com', role: 'agent', createdAt: '2024-11-02T10:00:00Z' },
  { id: 'u3', name: 'Rohan Mehta', email: 'rohan@acme.com', role: 'agent', createdAt: '2024-10-14T10:00:00Z' },
  { id: 'u4', name: 'Isha Kapoor', email: 'isha.admin@acme.com', role: 'admin', createdAt: '2024-01-01T10:00:00Z' },
  { id: 'u5', name: 'Karan Singh', email: 'karan@acme.com', role: 'customer', createdAt: '2025-03-20T10:00:00Z' },
  { id: 'u6', name: 'Neha Joshi', email: 'neha@acme.com', role: 'customer', createdAt: '2025-04-02T10:00:00Z' },
  { id: 'u7', name: 'Dev Patel', email: 'dev@acme.com', role: 'agent', createdAt: '2024-12-11T10:00:00Z' },
];

const cats: TicketCategory[] = ['technical', 'billing', 'account', 'feature_request', 'bug', 'general'];
const prs: TicketPriority[] = ['low', 'medium', 'high', 'urgent'];
const sts: TicketStatus[] = ['open', 'in_progress', 'closed'];

const titles = [
  'Unable to log in after password reset',
  'Invoice shows incorrect amount for June',
  'Feature request: dark mode for mobile app',
  'App crashes when uploading large files',
  'Cannot update billing address',
  'Two-factor authentication not working',
  'Export to CSV button unresponsive',
  'Request to merge duplicate accounts',
  'Slow loading times on dashboard',
  'Need clarification on subscription tiers',
  'Notification emails not being received',
  'API rate limit errors on integration',
  'UI glitch on settings page',
  'Refund request for cancelled plan',
  'Add support for SSO login',
  'Ticket comments not saving',
  'Broken link in onboarding email',
  'Data export missing recent records',
];

function randomFrom<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

export const dummyTickets: Ticket[] = titles.map((title, i) => {
  const status = randomFrom(sts, i);
  const createdAt = daysAgo(30 - i);
  const agent = status === 'open' ? undefined : randomFrom(dummyUsers.filter((u) => u.role === 'agent'), i).name;
  return {
    id: `t${i + 1}`,
    ticketNumber: `TCK-${1000 + i}`,
    title,
    description:
      'This is a detailed description of the issue reported by the customer. It includes steps to reproduce, expected behavior, and any relevant context that helps the support team resolve it quickly and efficiently.',
    category: randomFrom(cats, i),
    priority: randomFrom(prs, i + 2),
    status,
    createdBy: randomFrom(dummyUsers.filter((u) => u.role === 'customer'), i).name,
    assignedAgent: agent,
    createdAt,
    updatedAt: daysAgo(30 - i - 1 < 0 ? 0 : 30 - i - 1),
    timeline: [
      { id: 'e1', label: 'Ticket created', timestamp: createdAt, actor: randomFrom(dummyUsers, i).name },
      ...(status !== 'open'
        ? [{ id: 'e2', label: 'Assigned to agent', timestamp: daysAgo(28 - i), actor: agent || 'Support Team' }]
        : []),
      ...(status === 'in_progress'
        ? [{ id: 'e3', label: 'Status changed to In Progress', timestamp: daysAgo(27 - i), actor: agent || 'Support Team' }]
        : []),
      ...(status === 'closed'
        ? [
            { id: 'e3', label: 'Status changed to In Progress', timestamp: daysAgo(27 - i), actor: agent || 'Support Team' },
            { id: 'e4', label: 'Ticket resolved and closed', timestamp: daysAgo(25 - i), actor: agent || 'Support Team' },
          ]
        : []),
    ],
    comments:
      status === 'closed'
        ? [
            {
              id: 'c1',
              author: agent || 'Support Agent',
              authorRole: 'agent',
              message: 'Thanks for the details — we identified the root cause and applied a fix. Please confirm on your end.',
              createdAt: daysAgo(26 - i),
            },
            {
              id: 'c2',
              author: 'Customer',
              authorRole: 'customer',
              message: 'Confirmed, working now. Thank you for the quick turnaround!',
              createdAt: daysAgo(25 - i),
            },
          ]
        : [],
  };
});

export function getCurrentUserTickets(userName: string) {
  return dummyTickets.filter((t) => t.createdBy === userName);
}

export const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Head of Support, Nova Inc.',
    quote:
      'SupportHub transformed how our team handles customer issues. Response times dropped by 40% in the first month.',
    avatar: 'SC',
  },
  {
    name: 'Marcus Lee',
    role: 'CTO, Fluxware',
    quote: 'The cleanest support tooling we have used. Our agents actually enjoy working in it now.',
    avatar: 'ML',
  },
  {
    name: 'Ana Torres',
    role: 'Customer Success Lead, Brightly',
    quote: 'Ticket assignment and SLA tracking finally feel effortless. Highly recommended for growing teams.',
    avatar: 'AT',
  },
];

export const faqs = [
  {
    q: 'How does the free trial work?',
    a: 'You get full access to all features for 14 days, no credit card required. Cancel anytime.',
  },
  {
    q: 'Can I migrate my existing tickets?',
    a: 'Yes, we support CSV import and direct migration from most major helpdesk platforms.',
  },
  {
    q: 'Is there a limit on the number of agents?',
    a: 'No, our plans scale with your team. Add or remove agents anytime from the admin panel.',
  },
  {
    q: 'Do you offer SLA management?',
    a: 'Yes, SLA rules, escalations, and automated reminders are built into every paid plan.',
  },
  {
    q: 'Is my data secure?',
    a: 'We use industry-standard encryption at rest and in transit, with SOC 2 compliant infrastructure.',
  },
];
