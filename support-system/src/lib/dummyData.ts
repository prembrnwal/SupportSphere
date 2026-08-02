import type { User, Ticket, TicketCategory, TicketPriority, TicketStatus } from '@/types';

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
  technical: 'Technical Support',
  billing: 'Billing & Invoicing',
  account: 'Account Management',
  feature_request: 'Feature Request',
  bug: 'Bug Report',
  general: 'General Inquiry',
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
  { id: 'u2', name: 'Priya Verma', email: 'priya@acme.com', role: 'admin', createdAt: '2024-11-02T10:00:00Z' },
  { id: 'u3', name: 'Rohan Mehta', email: 'rohan@acme.com', role: 'customer', createdAt: '2024-10-14T10:00:00Z' },
  { id: 'u4', name: 'Isha Kapoor', email: 'admin@helpdesk.com', role: 'admin', createdAt: '2024-01-01T10:00:00Z' },
  { id: 'u5', name: 'Karan Singh', email: 'customer@company.com', role: 'customer', createdAt: '2025-03-20T10:00:00Z' },
  { id: 'u6', name: 'Neha Joshi', email: 'neha@acme.com', role: 'customer', createdAt: '2025-04-02T10:00:00Z' },
  { id: 'u7', name: 'Dev Patel', email: 'dev@acme.com', role: 'admin', createdAt: '2024-12-11T10:00:00Z' },
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
  const adminName = status === 'open' ? undefined : 'System Admin';
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
    assignedAgent: adminName,
    createdAt,
    updatedAt: daysAgo(30 - i - 1 < 0 ? 0 : 30 - i - 1),
    timeline: [
      { id: 'e1', label: 'Ticket created', timestamp: createdAt, actor: randomFrom(dummyUsers, i).name },
      ...(status !== 'open'
        ? [{ id: 'e2', label: 'Assigned to admin', timestamp: daysAgo(28 - i), actor: adminName || 'Admin' }]
        : []),
      ...(status === 'in_progress'
        ? [{ id: 'e3', label: 'Status changed to In Progress', timestamp: daysAgo(27 - i), actor: adminName || 'Admin' }]
        : []),
      ...(status === 'closed'
        ? [
            { id: 'e3', label: 'Status changed to In Progress', timestamp: daysAgo(27 - i), actor: adminName || 'Admin' },
            { id: 'e4', label: 'Ticket resolved and closed', timestamp: daysAgo(25 - i), actor: adminName || 'Admin' },
          ]
        : []),
    ],
    comments:
      status === 'closed'
        ? [
            {
              id: 'c1',
              author: 'System Admin',
              authorRole: 'admin',
              message: 'Thanks for the details — we identified the root cause and applied a fix. Please confirm on your end.',
              createdAt: daysAgo(26 - i),
            },
            {
              id: 'c2',
              author: 'Aarav Sharma',
              authorRole: 'customer',
              message: 'Confirmed! Everything is working smoothly now. Thank you!',
              createdAt: daysAgo(25 - i),
            },
          ]
        : [],
  };
});

export const testimonials = [
  {
    quote: 'Helpdesk cut our first response time by half within the first week of rollout.',
    name: 'Sarah Jenkins',
    role: 'VP of Customer Success',
    avatar: 'SJ',
  },
  {
    quote: 'The cleanest support tool we have used. Agents love it and setup took minutes.',
    name: 'Michael Chen',
    role: 'Head of Operations',
    avatar: 'MC',
  },
  {
    quote: 'SLA alerts saved us from breaching major enterprise contracts. Highly recommended.',
    name: 'Elena Rostova',
    role: 'Support Director',
    avatar: 'ER',
  },
];

export const faqs = [
  {
    q: 'How long does setup take?',
    a: 'Under 5 minutes. Simply create an account, invite your team, and you are ready to start handling customer tickets.',
  },
  {
    q: 'Can I integrate with our existing stack?',
    a: 'Yes, Helpdesk offers REST APIs and webhooks to integrate with your web apps, databases, and CRMs.',
  },
  {
    q: 'Is there a free trial?',
    a: 'Yes, we offer a 14-day free trial on all plans with full feature access and no credit card required.',
  },
  {
    q: 'How does SLA tracking work?',
    a: 'You can configure response and resolution deadline rules by priority. Automated notifications fire before any SLA breaches.',
  },
];
