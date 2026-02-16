import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload, X, FileSpreadsheet, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

export function ImportModal({ isOpen, onClose, endpoint, samplePath, entityName }) {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Check file type (csv or xlsx)
            const allowedTypes = [
                'text/csv',
                'application/vnd.activeborder', // Common browser mimetype for Excel? No.
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];
            // Or just check extension
            const extension = selectedFile.name.split('.').pop().toLowerCase();
            if (['csv', 'xlsx', 'xls'].includes(extension)) {
                setFile(selectedFile);
            } else {
                toast.error(t('Invalid file type. Please upload a CSV or Excel file.'));
                e.target.value = null;
            }
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            toast.success(t('{{entity}} imported successfully', { entity: entityName }));
            onClose();
            setFile(null);
            // Ideally trigger a refresh of the parent data
            window.location.reload(); // Simple refresh for now or trigger callback if provided
        } catch (error) {
            console.error("Import failed", error);
            const msg = error.response?.data?.message || t('Import failed');
            toast.error(msg);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownloadSample = () => {
        if (samplePath) {
            window.open(samplePath, '_blank');
        } else {
            toast.error(t('Sample file not available'));
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{t('Import {{entity}}', { entity: entityName })}</DialogTitle>
                    <DialogDescription>
                        {t('Upload a CSV or Excel file to import {{entity}}.', { entity: entityName })}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
                                <FileSpreadsheet className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="text-sm font-medium">{t('Sample Template')}</h4>
                                <p className="text-xs text-gray-500">{t('Download the sample file to see the required format.')}</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadSample}>
                            <Download className="h-4 w-4 mr-2" />
                            {t('Download')}
                        </Button>
                    </div>

                    <div
                        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${file ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50 dark:border-gray-700 dark:hover:border-gray-600 dark:hover:bg-gray-800'
                            }`}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".csv,.xlsx,.xls"
                            className="hidden"
                        />

                        {file ? (
                            <div className="flex flex-col items-center">
                                <FileSpreadsheet className="h-10 w-10 text-green-500 mb-2" />
                                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</span>
                                <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mt-2 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    {t('Remove')}
                                </Button>
                            </div>
                        ) : (
                            <>
                                <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                                    <Upload className="h-6 w-6 text-gray-500" />
                                </div>
                                <h4 className="text-sm font-medium mb-1">{t('Click to upload')}</h4>
                                <p className="text-xs text-gray-500">{t('or drag and drop your file here')}</p>
                                <p className="text-xs text-gray-400 mt-2">{t('Supported formats: .csv, .xlsx')}</p>
                            </>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isUploading}>
                        {t('Cancel')}
                    </Button>
                    <Button onClick={handleUpload} disabled={!file || isUploading}>
                        {isUploading ? (
                            <>
                                <span className="animate-spin mr-2">⏳</span>
                                {t('Uploading...')}
                            </>
                        ) : (
                            t('Import')
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
