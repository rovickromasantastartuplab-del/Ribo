export const mockEvents = [
    {
        id: '1',
        title: 'Client Meeting: Acme Corp',
        start: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
        end: new Date(new Date().setHours(11, 30, 0, 0)).toISOString(),
        type: 'meeting',
        status: 'planned',
        description: 'Quarterly review with Acme Corp management team.',
        location: 'Conference Room A'
    },
    {
        id: '2',
        title: 'Sales Call: Global Tech',
        start: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] + 'T14:00:00',
        end: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0] + 'T15:00:00',
        type: 'call',
        status: 'planned',
        description: 'Introductory call with new prospect.',
        location: 'Google Meet'
    },
    {
        id: '3',
        title: 'Follow-up Task',
        start: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split('T')[0],
        type: 'task',
        status: 'to_do',
        description: 'Send proposal to Local Bakery.',
        allDay: true
    },
    {
        id: '4',
        title: 'Internal Team Sync',
        start: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0] + 'T09:00:00',
        end: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0] + 'T10:00:00',
        type: 'meeting',
        status: 'held',
        description: 'Weekly team sync.',
        location: 'Zoom'
    }
];
