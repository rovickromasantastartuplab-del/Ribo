export const mockOpportunities = [
    {
        id: 1,
        name: "Acme Corp Web Redesign",
        amount: "5000.00",
        status: "active",
        opportunity_stage: { id: 1, name: "New", color: "#3b82f6" },
        account: { id: 1, name: "Acme Corp" },
        contact: { id: 1, name: "John Doe" },
        created_at: "2023-10-25T10:00:00Z"
    },
    {
        id: 2,
        name: "Global Tech SaaS Platform",
        amount: "12000.00",
        status: "active",
        opportunity_stage: { id: 2, name: "Qualified", color: "#10b77f" },
        account: { id: 2, name: "Global Tech" },
        contact: { id: 2, name: "Jane Smith" },
        created_at: "2023-10-26T14:30:00Z"
    },
    {
        id: 3,
        name: "Local Bakery Mobile App",
        amount: "3500.00",
        status: "active",
        opportunity_stage: { id: 3, name: "Proposal", color: "#f59e0b" },
        account: { id: 3, name: "Fresh Bakes" },
        contact: { id: 3, name: "Mike Miller" },
        created_at: "2023-10-27T09:15:00Z"
    },
    {
        id: 4,
        name: "Consulting Retainer",
        amount: "2000.00",
        status: "active",
        opportunity_stage: { id: 1, name: "New", color: "#3b82f6" },
        account: { id: 4, name: "Consulting Inc" },
        contact: { id: 4, name: "Sarah Connor" },
        created_at: "2023-10-28T11:00:00Z"
    },
    {
        id: 5,
        name: "Enterprise ERP System",
        amount: "50000.00",
        status: "active",
        opportunity_stage: { id: 4, name: "Negotiation", color: "#8b5cf6" },
        account: { id: 5, name: "Big Corp" },
        contact: { id: 5, name: "Bruce Wayne" },
        created_at: "2023-10-20T16:45:00Z"
    }
];

export const mockStages = [
    { id: 1, name: "New", color: "#3b82f6" },
    { id: 2, name: "Qualified", color: "#10b77f" },
    { id: 3, name: "Proposal", color: "#f59e0b" },
    { id: 4, name: "Negotiation", color: "#8b5cf6" },
    { id: 5, name: "Won", color: "#22c55e" },
    { id: 6, name: "Lost", color: "#ef4444" }
];
