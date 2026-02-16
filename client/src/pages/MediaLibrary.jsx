import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Search,
    Plus,
    Info,
    Copy,
    Download,
    MoreHorizontal,
    Image as ImageIcon,
    Calendar,
    HardDrive,
    Upload,
    X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock Data
const mockMedia = [
    {
        id: 1,
        name: "Dashboard Screenshot",
        file_name: "dashboard_v1.png",
        url: "https://placehold.co/600x400/png",
        thumb_url: "https://placehold.co/150x150/png",
        size: 245000,
        mime_type: "image/png",
        created_at: "2024-02-14T10:00:00Z",
    },
    {
        id: 2,
        name: "Company Logo",
        file_name: "logo_final.svg",
        url: "https://placehold.co/600x400/svg",
        thumb_url: "https://placehold.co/150x150/svg",
        size: 45000,
        mime_type: "image/svg+xml",
        created_at: "2024-02-13T14:30:00Z",
    },
    {
        id: 3,
        name: "Project Proposal",
        file_name: "proposal_2024.pdf",
        url: "#",
        thumb_url: "https://placehold.co/150x150/e2e8f0/64748b?text=PDF",
        size: 1024000,
        mime_type: "application/pdf",
        created_at: "2024-02-12T09:15:00Z",
    },
    {
        id: 4,
        name: "Team Photo",
        file_name: "team_outing.jpg",
        url: "https://placehold.co/600x400/jpg",
        thumb_url: "https://placehold.co/150x150/jpg",
        size: 3500000,
        mime_type: "image/jpeg",
        created_at: "2024-02-10T11:45:00Z",
    },
];

export default function MediaLibrary() {
    const [searchTerm, setSearchTerm] = useState('');
    const [mediaItems, setMediaItems] = useState(mockMedia);

    const filteredMedia = mediaItems.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.file_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Page Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Media Library</h1>
                    <p className="text-muted-foreground">
                        Manage your uploaded files and assets
                    </p>
                </div>
                <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Media
                </Button>
            </div>

            {/* Stats and Search */}
            <Card className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row">
                    <div className="flex-1 relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search media files..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-md">
                                <ImageIcon className="h-4 w-4 text-primary" />
                            </div>
                            <span className="text-sm font-semibold">{mediaItems.length} Files</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-green-500/10 rounded-md">
                                <HardDrive className="h-4 w-4 text-green-600" />
                            </div>
                            <span className="text-sm font-semibold">
                                {formatFileSize(mediaItems.reduce((acc, item) => acc + item.size, 0))}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Media Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                {filteredMedia.map((item) => (
                    <div
                        key={item.id}
                        className="group relative bg-card border rounded-lg overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                        {/* Image/Thumbnail Container */}
                        <div className="relative aspect-square bg-muted">
                            <img
                                src={item.thumb_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                            />
                            {/* Overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200" />

                            {/* Actions */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button size="icon" variant="secondary" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem>
                                            <Info className="mr-2 h-4 w-4" /> View Info
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Copy className="mr-2 h-4 w-4" /> Copy Link
                                        </DropdownMenuItem>
                                        <DropdownMenuItem>
                                            <Download className="mr-2 h-4 w-4" /> Download
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive">
                                            <X className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>

                            {/* File Type Badge */}
                            <div className="absolute top-2 left-2">
                                <Badge variant="secondary" className="text-xs backdrop-blur-sm bg-background/80">
                                    {item.mime_type.split('/')[1].toUpperCase()}
                                </Badge>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-3">
                            <h3 className="text-sm font-medium truncate" title={item.name}>{item.name}</h3>
                            <div className="flex items-center justify-between mt-1 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <HardDrive className="h-3 w-3" />
                                    {formatFileSize(item.size)}
                                </span>
                                <span>{formatDate(item.created_at)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
