import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

// Simple Textarea component shim until fully implemented
const Textarea = (props) => (
    <textarea
        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        {...props}
    />
);

export default function PayoutRequests({ userType, payoutRequests, settings, stats }) {
    const { t } = useTranslation();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Mock useForm
    const [createData, setCreateData] = useState({ amount: '' });
    const [createProcessing, setCreateProcessing] = useState(false);
    const [createErrors, setCreateErrors] = useState({});

    const [rejectData, setRejectData] = useState({ notes: '' });
    const [rejectProcessing, setRejectProcessing] = useState(false);

    const handleCreatePayout = async (e) => {
        e.preventDefault();
        setCreateProcessing(true);
        // Mock API call
        setTimeout(() => {
            setCreateProcessing(false);
            if (parseFloat(createData.amount) > stats.availableBalance) {
                setCreateErrors({ amount: t('Amount exceeds available balance') });
                return;
            }
            if (parseFloat(createData.amount) < settings.threshold_amount) {
                setCreateErrors({ amount: t('Amount is less than minimum threshold') });
                return;
            }
            setShowCreateDialog(false);
            setCreateData({ amount: '' });
            toast({ title: t('Payout request created successfully') });
        }, 1000);
    };

    const handleApprove = (request) => {
        toast({ title: t('Approving payout request...') });
        setTimeout(() => {
            toast({ title: t('Payout request approved') });
        }, 1000);
    };

    const handleReject = (e) => {
        e.preventDefault();
        if (selectedRequest) {
            setRejectProcessing(true);
            setTimeout(() => {
                setRejectProcessing(false);
                setShowRejectDialog(false);
                setSelectedRequest(null);
                setRejectData({ notes: '' });
                toast({ title: t('Payout request rejected') });
            }, 1000);
        }
    };

    const getStatusBadge = (status) => {
        const colorMap = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800'
        };
        const color = colorMap[status] || 'bg-gray-100 text-gray-800';
        return (
            <Badge className={`capitalize ${color}`}>
                {t(status.charAt(0).toUpperCase() + status.slice(1))}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            {userType === 'company' && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t('Create Payout Request')}</CardTitle>
                        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                            <DialogTrigger asChild>
                                <Button disabled={stats.availableBalance < settings.threshold_amount}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    {t('Request Payout')}
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{t('Create Payout Request')}</DialogTitle>
                                </DialogHeader>
                                <form onSubmit={handleCreatePayout} className="space-y-4">
                                    <div>
                                        <Label htmlFor="amount">{t('Amount')}</Label>
                                        <Input
                                            id="amount"
                                            type="number"
                                            step="0.01"
                                            min={settings.threshold_amount}
                                            max={stats.availableBalance}
                                            value={createData.amount}
                                            onChange={(e) => setCreateData({ ...createData, amount: e.target.value })}
                                            placeholder={`Min: $${settings.threshold_amount}`}
                                        />
                                        {createErrors.amount && <p className="text-sm text-red-500">{createErrors.amount}</p>}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        <p>{t('Available Balance')}: {window.appSettings?.formatCurrency(stats.availableBalance) || `$${stats.availableBalance}`}</p>
                                        <p>{t('Minimum Amount')}: {window.appSettings?.formatCurrency(settings.threshold_amount) || `$${settings.threshold_amount}`}</p>
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                                            {t('Cancel')}
                                        </Button>
                                        <Button type="submit" disabled={createProcessing}>
                                            {t('Submit Request')}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {stats.availableBalance < settings.threshold_amount
                                ? t('You need at least {{amount}} to request a payout', { amount: formatCurrency(settings.threshold_amount) })
                                : t('You can request up to {{amount}} for payout', { amount: formatCurrency(stats.availableBalance) })}
                        </p>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>
                        {userType === 'superadmin' ? t('All Payout Requests') : t('Your Payout Requests')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow className="dark:bg-gray-800 dark:border-gray-700">
                                {userType === 'superadmin' && <TableHead>{t('Company')}</TableHead>}
                                <TableHead>{t('Amount')}</TableHead>
                                <TableHead>{t('Status')}</TableHead>
                                <TableHead>{t('Date')}</TableHead>
                                {userType === 'superadmin' && <TableHead>{t('Actions')}</TableHead>}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payoutRequests.data?.map((request) => (
                                <TableRow key={request.id} className="dark:bg-gray-900 dark:border-gray-700 dark:hover:bg-gray-800">
                                    {userType === 'superadmin' && (
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{request.company?.name}</p>
                                                <p className="text-sm text-muted-foreground dark:text-gray-400">{request.company?.email}</p>
                                            </div>
                                        </TableCell>
                                    )}
                                    <TableCell>{formatCurrency(request.amount)}</TableCell>
                                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                                    <TableCell>{formatDateTime(request.created_at, false)}</TableCell>
                                    {userType === 'superadmin' && request.status === 'pending' && (
                                        <TableCell>
                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleApprove(request)}
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    {t('Approve')}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setSelectedRequest(request);
                                                        setShowRejectDialog(true);
                                                    }}
                                                >
                                                    <X className="h-4 w-4 mr-1" />
                                                    {t('Reject')}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t('Reject Payout Request')}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleReject} className="space-y-4">
                        <div>
                            <Label htmlFor="notes">{t('Rejection Reason')}</Label>
                            <Textarea
                                id="notes"
                                value={rejectData.notes}
                                onChange={(e) => setRejectData({ ...rejectData, notes: e.target.value })}
                                placeholder={t('Enter reason for rejection...')}
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button type="button" variant="outline" onClick={() => setShowRejectDialog(false)}>
                                {t('Cancel')}
                            </Button>
                            <Button type="submit" variant="destructive" disabled={rejectProcessing}>
                                {t('Reject Request')}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
