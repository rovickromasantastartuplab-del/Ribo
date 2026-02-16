import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { MultiSelectField } from '@/components/MultiSelectField';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import MediaPicker from '@/components/MediaPicker';

export function CrudFormModal({
    isOpen,
    onClose,
    onSubmit,
    formConfig,
    initialData = {},
    title,
    mode,
    description,
    isSubmitting = false
}) {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [relationOptions, setRelationOptions] = useState({});

    // Mock route function
    const route = (name, params) => {
        // Basic mock implementation
        return `/api/${name.replace('.', '/')}/${params || ''}`;
    };

    // Conditionally declare handleExport only if exportRoute exists
    const handleExportAction = formConfig.exportRoute ? () => {
        window.location.href = route(formConfig.exportRoute);
    } : undefined;

    // Calculate total price for price summary
    const calculateTotal = () => {
        if (!formConfig.priceSummary) return 0;
        const quantity = formData[formConfig.priceSummary.quantityFieldName || 'quantity'] || formConfig.priceSummary.quantity || 1;
        return formConfig.priceSummary.unitPrice * quantity;
    };

    // Load initial data when modal opens
    useEffect(() => {
        if (isOpen) {
            // Create a clean copy of the initial data
            const cleanData = { ...initialData };

            // Process fields and set default values
            formConfig.fields.forEach(field => {
                if (field.type === 'multi-select') {
                    if (cleanData[field.name] && !Array.isArray(cleanData[field.name])) {
                        // Convert to array if it's not already
                        cleanData[field.name] = Array.isArray(cleanData[field.name])
                            ? cleanData[field.name]
                            : cleanData[field.name] ? [cleanData[field.name].toString()] : [];
                    }
                }

                // Set default values for fields that don't have values yet (create mode)
                if (mode === 'create' && (cleanData[field.name] === undefined || cleanData[field.name] === null)) {
                    if (field.defaultValue !== undefined) {
                        cleanData[field.name] = field.defaultValue;
                    }
                }
            });

            setFormData(cleanData || {});
            setErrors({});

            // Load relation data for select fields
            formConfig.fields.forEach(field => {
                if (field.relation && field.relation.endpoint) {
                    // MOCK FETCH for now
                    /* 
                   fetch(field.relation.endpoint)
                     .then(res => res.json())
                     .then(data => {
                       setRelationOptions(prev => ({
                         ...prev,
                         [field.name]: Array.isArray(data) ? data : data.data || []
                       }));
                     })
                     .catch(err => {
                       // Silent error handling
                     });
                     */
                    // Setting dummy options for development
                    setRelationOptions(prev => ({
                        ...prev,
                        [field.name]: []
                    }))
                }
            });

            // Other fetch logic for parent_module, attendees etc. is commented out for strict client-port
            // until backend is ready.
        }
    }, [isOpen, initialData, formConfig.fields, mode]);

    const handleChange = (name, value) => {
        const newFormData = { ...formData, [name]: value };

        // Auto-calculate amount when products change
        if (name === 'products' && Array.isArray(value)) {
            const totalAmount = value.reduce((total, product) => {
                const quantity = parseFloat(product.quantity) || 0;
                const unitPrice = parseFloat(product.unit_price) || 0;
                return total + (quantity * unitPrice);
            }, 0);
            newFormData.amount = totalAmount;
        }

        // Dependency Logic (mocked/disabled for now as it relies on backend routes)
        // ...

        setFormData(newFormData);

        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }

        // Call field's onChange if it exists
        const field = formConfig.fields.find(f => f.name === name);
        if (field?.onChange) {
            field.onChange(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Process form data before validation
        const processedData = { ...formData };

        // Ensure multi-select fields are properly formatted
        formConfig.fields.forEach(field => {
            if (field.type === 'multi-select' && processedData[field.name]) {
                // Make sure it's an array of strings
                if (!Array.isArray(processedData[field.name])) {
                    processedData[field.name] = [processedData[field.name].toString()];
                }
            }
        });

        setFormData(processedData);

        // Basic validation
        const newErrors = {};
        formConfig.fields.forEach(field => {
            // For file fields in edit mode, they're never required
            if (field.type === 'file' && mode === 'edit') {
                return;
            }

            // Check if field is conditionally required based on other field values
            const isConditionallyRequired = field.conditional ? field.conditional(mode, formData) : true;

            if (field.required && isConditionallyRequired && !formData[field.name]) {
                newErrors[field.name] = `${field.label} is required`;
            }

            // File validation logic...
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Create a clean copy without any unexpected properties
        const cleanData = { ...formData };

        // Process multi-select fields
        formConfig.fields.forEach(field => {
            if (field.type === 'multi-select' && cleanData[field.name]) {
                if (!Array.isArray(cleanData[field.name])) {
                    cleanData[field.name] = [cleanData[field.name].toString()];
                }
            }
        });

        onSubmit(cleanData);
    };

    const renderField = (field) => {
        // Check if field should be conditionally rendered
        if (field.conditional && !field.conditional(mode, formData)) {
            return null;
        }

        // If field has custom render function, use it
        if (field.render) {
            return field.render(field, formData, handleChange);
        }

        // Handle custom field type
        if (field.type === 'custom') {
            return field.render ? field.render(field, formData, handleChange) : null;
        }

        // If in view mode, render as read-only for non-custom fields
        if (mode === 'view') {
            // View mode logic...
            return (
                <div className="p-2 border rounded-md bg-gray-50 dark:bg-gray-800">
                    {formData[field.name] || '-'}
                </div>
            );
        }

        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'time':
                return (
                    <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        disabled={mode === 'view'}
                    />
                );

            case 'color':
                return (
                    <div className="flex items-center gap-3">
                        <Input
                            id={field.name}
                            name={field.name}
                            type="color"
                            value={formData[field.name] || field.defaultValue || '#3B82F6'}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                            required={field.required}
                            className={`h-10 w-20 cursor-pointer ${errors[field.name] ? 'border-red-500' : ''}`}
                            disabled={mode === 'view'}
                        />
                        <Input
                            type="text"
                            value={formData[field.name] || field.defaultValue || '#3B82F6'}
                            onChange={(e) => {
                                // Validate hex color format
                                const value = e.target.value;
                                if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                                    handleChange(field.name, value);
                                }
                            }}
                            placeholder="#3B82F6"
                            className={`flex-1 ${errors[field.name] ? 'border-red-500' : ''}`}
                            disabled={mode === 'view'}
                        />
                    </div>
                );

            case 'date':
                // Format date value for input (YYYY-MM-DD format)
                const dateValue = formData[field.name] ?
                    (formData[field.name] instanceof Date ?
                        formData[field.name].toISOString().split('T')[0] :
                        (typeof formData[field.name] === 'string' && formData[field.name].includes('T') ?
                            formData[field.name].split('T')[0] :
                            formData[field.name])) : '';

                return (
                    <Input
                        id={field.name}
                        name={field.name}
                        type="date"
                        placeholder={field.placeholder}
                        value={dateValue}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        disabled={mode === 'view'}
                    />
                );

            case 'number':
                return (
                    <Input
                        id={field.name}
                        name={field.name}
                        type="number"
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value ? parseFloat(e.target.value) : '')}
                        required={field.required}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        disabled={mode === 'view'}
                    />
                );

            case 'textarea':
                return (
                    <Textarea
                        id={field.name}
                        name={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className={errors[field.name] ? 'border-red-500' : ''}
                        disabled={mode === 'view'}
                    />
                );

            case 'select':
                const options = field.relation
                    ? relationOptions[field.name] || []
                    : field.options || [];

                const currentValue = String(formData[field.name] || '');

                return (
                    <Select
                        key={`${field.name}-${currentValue}`}
                        value={currentValue}
                        onValueChange={(value) => handleChange(field.name, value)}
                        disabled={mode === 'view'}
                    >
                        <SelectTrigger className={errors[field.name] ? 'border-red-500' : ''}>
                            <SelectValue placeholder={field.placeholder || `Select ${field.label}`}>
                                {field.options?.find(opt => opt.value === currentValue)?.label || currentValue || field.placeholder || `Select ${field.label}`}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="z-[60000]">
                            {options.map((option) => (
                                <SelectItem key={option.value} value={String(option.value)}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                );

            case 'radio':
                return (
                    <RadioGroup
                        value={formData[field.name] || ''}
                        onValueChange={(value) => handleChange(field.name, value)}
                        disabled={mode === 'view'}
                        className="flex gap-4"
                    >
                        {field.options?.map((option) => (
                            <div key={option.value} className="flex items-center space-x-2">
                                <RadioGroupItem value={option.value} id={`${field.name}-${option.value}`} />
                                <Label htmlFor={`${field.name}-${option.value}`}>{option.label}</Label>
                            </div>
                        ))}
                    </RadioGroup>
                );

            case 'checkbox':
                return (
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={field.name}
                            checked={!!formData[field.name]}
                            onCheckedChange={(checked) => {
                                handleChange(field.name, checked);
                                if (field.onChange) {
                                    field.onChange(checked);
                                }
                            }}
                            disabled={mode === 'view'}
                        />
                        <Label htmlFor={field.name}>{field.placeholder || field.label}</Label>
                    </div>
                );

            case 'switch':
                return (
                    <div className="flex items-center space-x-2">
                        <Switch
                            id={field.name}
                            checked={!!formData[field.name]}
                            onCheckedChange={(checked) => handleChange(field.name, checked)}
                            disabled={mode === 'view'}
                        />
                        <Label htmlFor={field.name} className="font-normal cursor-pointer">
                            {field.label}
                        </Label>
                    </div>
                );

            case 'multi-select':
                return (
                    <MultiSelectField
                        field={field}
                        formData={formData}
                        handleChange={handleChange}
                    />
                );

            case 'media-picker':
                const currentImageUrl = formData[field.name] || '';

                return (
                    <MediaPicker
                        value={currentImageUrl}
                        onChange={(value) => handleChange(field.name, value)}
                        placeholder={field.placeholder || `Select ${field.label}`}
                        showPreview={true}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn("max-h-[85vh] overflow-y-auto", formConfig.modalSize || "sm:max-w-xl")}>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && <DialogDescription>{description}</DialogDescription>}
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className={cn(
                        "grid gap-4 py-4",
                        formConfig.layout === 'grid' || formConfig.columns > 1
                            ? `grid-cols-1 md:grid-cols-${formConfig.columns || 2}`
                            : "grid-cols-1"
                    )}>
                        {formConfig.fields.map((field) => {
                            // Check if field should be conditionally rendered
                            if (field.conditional && !field.conditional(mode, formData)) {
                                return null;
                            }

                            return (
                                <div
                                    key={field.name}
                                    className={cn("space-y-2", field.className)}
                                    style={field.colSpan ? { gridColumn: `span ${field.colSpan} / span ${field.colSpan}` } : {}}
                                >
                                    {field.type !== 'switch' && field.type !== 'checkbox' && (
                                        <Label htmlFor={field.name} className={field.required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
                                            {field.label}
                                        </Label>
                                    )}
                                    {renderField(field)}
                                    {errors[field.name] && (
                                        <p className="text-sm text-red-500">{errors[field.name]}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {formConfig.priceSummary && (
                        <div className="flex justify-end pt-2 border-t mt-4">
                            <div className="text-right">
                                <p className="text-sm text-muted-foreground">{t('Total')}</p>
                                <p className="text-2xl font-bold">${calculateTotal().toFixed(2)}</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-4">
                        {formConfig.exportRoute && mode !== 'create' && (
                            <Button variant="outline" type="button" onClick={handleExportAction} className="mr-auto">
                                {t('Export')}
                            </Button>
                        )}
                        <Button variant="outline" type="button" onClick={onClose}>
                            {t('Cancel')}
                        </Button>
                        {mode !== 'view' && (
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? t('Saving...') : (mode === 'create' ? t('Create') : t('Save Changes'))}
                            </Button>
                        )}
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
