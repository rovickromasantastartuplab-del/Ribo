import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import MediaLibraryModal from '@/components/MediaLibraryModal';
import { Image as ImageIcon, X, Trash2 } from 'lucide-react';

export default function MediaPicker({
    label,
    value = '',
    onChange,
    multiple = false,
    placeholder = 'Select image...',
    showPreview = true,
    returnType = 'url'
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSelect = (selectedData) => {
        onChange(selectedData);
    };

    const handleClear = () => {
        if (multiple) {
            onChange([]);
        } else {
            onChange(returnType === 'id' ? '' : '');
        }
        setImageUrls([]);
        setImageNames([]);
    };

    const [imageUrls, setImageUrls] = useState([]);
    const [imageNames, setImageNames] = useState([]);

    // Fetch image URLs and names when using ID return type
    useEffect(() => {
        if (returnType === 'id' && value) {
            const ids = Array.isArray(value) ? value : [value].filter(Boolean);
            if (ids.length > 0) {
                // Mock Fetch media URLs and names from IDs
                // In a real app, this would be an API call
                // fetch(route('api.media.index'), ... )

                // MOCK implementation
                const urls = [];
                const names = [];
                ids.forEach(id => {
                    // For mock, just generate a placeholder
                    urls.push(`https://picsum.photos/seed/${id}/200/200`);
                    names.push(`Image ${id}`);
                });
                setImageUrls(urls);
                setImageNames(names);

            } else {
                setImageUrls([]);
                setImageNames([]);
            }
        } else if (returnType === 'url') {
            const valueStr = Array.isArray(value) ? value.join(',') : String(value || '');
            const urls = valueStr ? valueStr.split(',').map(url => url.trim()).filter(Boolean) : [];
            setImageUrls(urls);
            setImageNames(urls.map((url, index) => `Image ${index + 1}`));
        }
    }, [value, returnType]);

    const displayValue = imageUrls.map((img) => {
        const imagePathArr = String(img || '').split('/');
        return imagePathArr[imagePathArr.length - 1];
    }).join(', ');

    return (
        <div className="space-y-2">
            {label && <Label>{label}</Label>}

            <div className="flex gap-2">
                <Input
                    value={displayValue}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    readOnly={multiple}
                />
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(true)}
                >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Browse
                </Button>
                {(imageNames.length > 0 || displayValue) && (
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={handleClear}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Preview */}
            {showPreview && imageUrls.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-2">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="relative">
                            <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-20 object-cover rounded border"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                }}
                            />
                            {multiple && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        if (Array.isArray(value)) {
                                            const newValue = value.filter((_, i) => i !== index);
                                            onChange(newValue);
                                        }
                                    }}
                                    className="absolute top-1 right-1 h-6 w-6 p-0 bg-red-white text-destructive hover:bg-destructive/10"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <MediaLibraryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSelect={handleSelect}
                multiple={multiple}
                returnType={returnType}
                preSelected={Array.isArray(value) ? value : (value ? [value] : [])}
            />
        </div>
    );
}
