import React, { useState } from 'react';
import { PageTemplate } from '@/components/page-template';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Phone, CheckSquare, Clock, ExternalLink } from 'lucide-react';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockEvents } from '@/data/mockEvents';

export default function CalendarIndex() {
    const { t } = useTranslation();
    const [events, setEvents] = useState(mockEvents);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Google Calendar Sync states (mocked/disabled for now)
    const [activeCalendar, setActiveCalendar] = useState('local');
    const [isSyncing, setIsSyncing] = useState(false);

    const handleEventClick = (info) => {
        info.jsEvent.preventDefault();
        const event = info.event;

        setSelectedEvent({
            title: event.title,
            start: event.startStr,
            end: event.endStr,
            type: event.extendedProps.type,
            status: event.extendedProps.status,
            description: event.extendedProps.description,
            location: event.extendedProps.location,
            ...event.extendedProps
        });
        setShowModal(true);
    };

    const getEventIcon = (type) => {
        switch (type) {
            case 'meeting': return <Calendar className="h-4 w-4" />;
            case 'call': return <Phone className="h-4 w-4" />;
            case 'task': return <CheckSquare className="h-4 w-4" />;
            default: return <Calendar className="h-4 w-4" />;
        }
    };

    const getEventColor = (type) => {
        switch (type) {
            case 'meeting': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'call': return 'bg-green-100 text-green-800 border-green-200';
            case 'task': return 'bg-amber-100 text-amber-800 border-amber-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Helper to style events on the calendar
    const handleEventDidMount = (info) => {
        const type = info.event.extendedProps.type;
        if (type === 'meeting') {
            info.el.style.backgroundColor = '#dbeafe';
            info.el.style.borderColor = '#bfdbfe';
            info.el.style.color = '#1e40af';
        } else if (type === 'call') {
            info.el.style.backgroundColor = '#dcfce7';
            info.el.style.borderColor = '#bbf7d0';
            info.el.style.color = '#166534';
        } else if (type === 'task') {
            info.el.style.backgroundColor = '#fef3c7';
            info.el.style.borderColor = '#fde68a';
            info.el.style.color = '#92400e';
        }
    };

    const breadcrumbs = [
        { title: t('Dashboard'), href: '/dashboard' },
        { title: t('Calendar') }
    ];

    return (
        <PageTemplate
            title={t('Calendar')}
            breadcrumbs={breadcrumbs}
            noPadding
        >
            <div className="p-4 h-full flex flex-col">
                <Card className="p-4 flex-1 flex flex-col">
                    <div className="mb-4 flex flex-wrap gap-4 justify-end">
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }}></div>
                                <span className="text-sm">{t('Meetings')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b77f' }}></div>
                                <span className="text-sm">{t('Calls')}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
                                <span className="text-sm">{t('Tasks')}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 calendar-container">
                        <FullCalendar
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                            initialView="dayGridMonth"
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            events={events}
                            eventClick={handleEventClick}
                            eventDidMount={handleEventDidMount}
                            timeZone='local'
                            eventTimeFormat={{
                                hour: '2-digit',
                                minute: '2-digit',
                                meridiem: 'short',
                            }}
                            height="100%"
                            eventDisplay="block"
                            dayMaxEvents={2}
                        />
                    </div>
                </Card>
            </div>

            {/* Event Details Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedEvent && getEventIcon(selectedEvent.type)}
                            {selectedEvent?.title}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedEvent && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Badge className={getEventColor(selectedEvent.type || 'event')}>
                                    {selectedEvent.type ? t(selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)) : t('Event')}
                                </Badge>
                                <Badge variant="outline">
                                    {selectedEvent.status}
                                </Badge>
                            </div>

                            <div className="space-y-3">
                                <div className="text-sm">
                                    <div className="flex items-start gap-2">
                                        <Clock className="h-4 w-4 text-gray-500 mt-0.5" />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <strong className="text-gray-700">{t('Start')}:</strong>
                                                <span className="text-gray-600">
                                                    {selectedEvent.start ? (
                                                        <>
                                                            {new Date(selectedEvent.start).toLocaleString()}
                                                        </>
                                                    ) : '-'}
                                                </span>
                                            </div>
                                            {selectedEvent.end && (
                                                <div className="flex items-center gap-2 mt-1">
                                                    <strong className="text-gray-700">{t('End')}:</strong>
                                                    <span className="text-gray-600">
                                                        {new Date(selectedEvent.end).toLocaleString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {selectedEvent.description && (
                                    <div className="text-sm">
                                        <strong className="text-gray-700 block mb-1">{t('Description')}:</strong>
                                        <p className="text-gray-600 bg-muted p-2 rounded-md">{selectedEvent.description}</p>
                                    </div>
                                )}

                                {selectedEvent.location && (
                                    <div className="text-sm">
                                        <strong className="text-gray-700">{t('Location')}:</strong>
                                        <span className="text-gray-600 ml-2">{selectedEvent.location}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end pt-4 border-t">
                                <Button variant="outline" onClick={() => setShowModal(false)}>
                                    Close
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </PageTemplate>
    );
}
