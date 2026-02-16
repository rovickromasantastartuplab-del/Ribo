import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Settings as SettingsIcon,
    Layout,
    Type,
    Star,
    Monitor,
    Award,
    Info,
    Users,
    MessageSquare,
    CreditCard,
    HelpCircle,
    Mail,
    Phone,
    Plus,
    Trash2,
    Save,
    Eye,
    CheckCircle,
    X,
    GripVertical,
    Smartphone,
    Zap,
    TrendingUp,
    Target,
    Heart,
    Rocket,
    Palette // Added Palette as it's used in the component
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { PageTemplate } from '@/components/page-template';
import MediaPicker from '@/components/MediaPicker';
import FeaturesSection from './components/FeaturesSection';
import AboutSection from './components/AboutSection';
import { mockLandingPageData } from '@/mockData/mockLandingPageData';
import { toast } from 'sonner';

export default function LandingPageIndex() {
    const { t } = useTranslation();
    const [data, setData] = useState(mockLandingPageData.data);
    const [activeSection, setActiveSection] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState({});

    const sections = mockLandingPageData.sections;
    const languages = mockLandingPageData.languages;
    const themes = mockLandingPageData.themes;
    const templates = mockLandingPageData.templates;

    const brandColor = data.primary_color || '#3fa9f5';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
    };

    const updateSectionData = (section, newData) => {
        setData(prev => {
            const config = { ...prev.config_sections };
            config.section_data = { ...config.section_data };
            config.section_data[section] = { ...config.section_data[section], ...newData };
            return { ...prev, config_sections: config };
        });
    };

    const updateSectionVisibility = (section, visible) => {
        setData(prev => {
            const config = { ...prev.config_sections };
            config.section_visibility = { ...config.section_visibility, [section]: visible };
            return { ...prev, config_sections: config };
        });
    };

    const getSectionData = (section) => {
        return data.config_sections?.section_data?.[section] || {};
    };

    const handleSave = () => {
        setIsSaving(true);
        // Simulate API call
        setTimeout(() => {
            setIsSaving(false);
            toast.success(t('Settings saved successfully'));
        }, 1000);
    };

    const convertToRelativePath = (url) => {
        if (!url) return url;
        if (!url.startsWith('http')) return url;
        const storageIndex = url.indexOf('/storage/');
        return storageIndex !== -1 ? url.substring(storageIndex) : url;
    };

    const getDisplayUrl = (path) => {
        if (!path) return path;
        if (path.startsWith('http')) return path;
        return `${window.location.origin}${path}`;
    };

    const sectionIcons = {
        general: <SettingsIcon className="h-4 w-4" />,
        header: <Layout className="h-4 w-4" />,
        hero: <Type className="h-4 w-4" />,
        features: <Star className="h-4 w-4" />,
        screenshots: <Monitor className="h-4 w-4" />,
        whychooseus: <Award className="h-4 w-4" />,
        about: <Info className="h-4 w-4" />,
        team: <Users className="h-4 w-4" />,
        testimonials: <MessageSquare className="h-4 w-4" />,
        plans: <CreditCard className="h-4 w-4" />,
        faq: <HelpCircle className="h-4 w-4" />,
        newsletter: <Mail className="h-4 w-4" />,
        contact: <Phone className="h-4 w-4" />,
        footer: <Layout className="h-4 w-4" />
    };

    return (
        <PageTemplate
            title={t("Landing Page Settings")}
            url="/landing-page"
            breadcrumbs={[
                { title: t('Dashboard'), href: '/' },
                { title: t('Landing Page'), href: '#' },
                { title: t('Settings') }
            ]}
            actions={[
                { label: t('View Landing Page'), icon: <Eye className="h-4 w-4 mr-2" />, onClick: () => window.open('/', '_blank'), variant: 'outline' },
                { label: t('Save Changes'), icon: <Save className="h-4 w-4 mr-2" />, onClick: handleSave, loading: isSaving }
            ]}
            noPadding
        >
            <div className="flex flex-col md:flex-row h-[calc(100vh-140px)] overflow-hidden">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
                    <div className="p-4">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{t('Configuration')}</h2>
                        <nav className="space-y-1">
                            {sections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeSection === section.id
                                        ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm'
                                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                                        }`}
                                >
                                    {sectionIcons[section.id]}
                                    {t(section.name)}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-950">
                    <div className="max-w-4xl mx-auto space-y-8">
                        {/* Section Title */}
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                {t(sections.find(s => s.id === activeSection)?.name || '')}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {t('Customize the content and appearance of this section.')}
                            </p>
                        </div>

                        {/* General Settings */}
                        {activeSection === 'general' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                        <SettingsIcon className="h-5 w-5 text-blue-500" />
                                        {t('Company Information')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="company_name">{t('Company Name')}</Label>
                                            <Input id="company_name" name="company_name" value={data.company_name} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company_email">{t('Company Email')}</Label>
                                            <Input id="company_email" name="company_email" value={data.company_email} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="company_phone">{t('Company Phone')}</Label>
                                            <Input id="company_phone" name="company_phone" value={data.company_phone} onChange={handleInputChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="address">{t('Address')}</Label>
                                            <Input id="address" name="address" value={data.address} onChange={handleInputChange} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                        <Palette className="h-5 w-5 text-purple-500" />
                                        {t('Visual Identity')}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="space-y-2">
                                            <Label>{t('Brand Primary Color')}</Label>
                                            <div className="flex gap-2">
                                                <Input type="color" value={data.primary_color} onChange={(e) => setData(prev => ({ ...prev, primary_color: e.target.value }))} className="w-12 h-10 p-1" />
                                                <Input value={data.primary_color} onChange={(e) => setData(prev => ({ ...prev, primary_color: e.target.value }))} className="font-mono" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('Secondary Color')}</Label>
                                            <div className="flex gap-2">
                                                <Input type="color" value={data.secondary_color} onChange={(e) => setData(prev => ({ ...prev, secondary_color: e.target.value }))} className="w-12 h-10 p-1" />
                                                <Input value={data.secondary_color} onChange={(e) => setData(prev => ({ ...prev, secondary_color: e.target.value }))} className="font-mono" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>{t('Accent Color')}</Label>
                                            <div className="flex gap-2">
                                                <Input type="color" value={data.accent_color} onChange={(e) => setData(prev => ({ ...prev, accent_color: e.target.value }))} className="w-12 h-10 p-1" />
                                                <Input value={data.accent_color} onChange={(e) => setData(prev => ({ ...prev, accent_color: e.target.value }))} className="font-mono" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Hero Section */}
                        {activeSection === 'hero' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <Type className="h-5 w-5 text-blue-500" />
                                            {t('Hero Content')}
                                        </h3>
                                        <Switch
                                            checked={data.config_sections?.section_visibility?.hero}
                                            onCheckedChange={(val) => updateSectionVisibility('hero', val)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="hero_title">{t('Main Headline')}</Label>
                                            <Input id="hero_title" value={getSectionData('hero').title} onChange={(e) => updateSectionData('hero', { title: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="hero_subtitle">{t('Subheadline')}</Label>
                                            <Textarea id="hero_subtitle" value={getSectionData('hero').subtitle} onChange={(e) => updateSectionData('hero', { subtitle: e.target.value })} rows={3} />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="hero_button_text">{t('Primary Button Text')}</Label>
                                                <Input id="hero_button_text" value={getSectionData('hero').button_text} onChange={(e) => updateSectionData('hero', { button_text: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="hero_button_link">{t('Primary Button Link')}</Label>
                                                <Input id="hero_button_link" value={getSectionData('hero').button_link} onChange={(e) => updateSectionData('hero', { button_link: e.target.value })} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                        <ImageIcon className="h-5 w-5 text-purple-500" />
                                        {t('Hero Image')}
                                    </h3>
                                    <MediaPicker
                                        label={t('Image')}
                                        value={getDisplayUrl(getSectionData('hero').image)}
                                        onChange={(val) => updateSectionData('hero', { image: convertToRelativePath(val) })}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Features Section */}
                        {activeSection === 'features' && (
                            <FeaturesSection
                                data={data}
                                setData={setData}
                                errors={errors}
                                getSectionData={getSectionData}
                                updateSectionData={updateSectionData}
                                updateSectionVisibility={updateSectionVisibility}
                                brandColor={brandColor}
                                t={t}
                            />
                        )}

                        {/* About Section */}
                        {activeSection === 'about' && (
                            <AboutSection
                                data={data}
                                setData={setData}
                                errors={errors}
                                getSectionData={getSectionData}
                                updateSectionData={updateSectionData}
                                updateSectionVisibility={updateSectionVisibility}
                                brandColor={brandColor}
                                t={t}
                            />
                        )}

                        {/* Testimonials Section */}
                        {activeSection === 'testimonials' && (
                            <div className="space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold flex items-center gap-2">
                                            <MessageSquare className="h-5 w-5 text-green-500" />
                                            {t('Testimonials Content')}
                                        </h3>
                                        <Switch
                                            checked={data.config_sections?.section_visibility?.testimonials}
                                            onCheckedChange={(val) => updateSectionVisibility('testimonials', val)}
                                        />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="testimonials_title">{t('Section Title')}</Label>
                                            <Input id="testimonials_title" value={getSectionData('testimonials').title} onChange={(e) => updateSectionData('testimonials', { title: e.target.value })} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="testimonials_subtitle">{t('Section Subtitle')}</Label>
                                            <Textarea id="testimonials_subtitle" value={getSectionData('testimonials').subtitle} onChange={(e) => updateSectionData('testimonials', { subtitle: e.target.value })} rows={2} />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-semibold">{t('Customer Testimonials')}</h3>
                                        <Button size="sm" onClick={() => {
                                            const current = getSectionData('testimonials').testimonials || [];
                                            updateSectionData('testimonials', { testimonials: [...current, { name: '', role: '', company: '', content: '', rating: 5 }] });
                                        }}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            {t('Add Testimonial')}
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {(getSectionData('testimonials').testimonials || []).map((testimonial, idx) => (
                                            <div key={idx} className="p-4 border dark:border-gray-700 rounded-lg space-y-4 relative">
                                                <Button size="icon" variant="ghost" className="absolute top-2 right-2 text-red-500" onClick={() => {
                                                    const filtered = getSectionData('testimonials').testimonials.filter((_, i) => i !== idx);
                                                    updateSectionData('testimonials', { testimonials: filtered });
                                                }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label>{t('Name')}</Label>
                                                        <Input value={testimonial.name} onChange={(e) => {
                                                            const updated = [...getSectionData('testimonials').testimonials];
                                                            updated[idx].name = e.target.value;
                                                            updateSectionData('testimonials', { testimonials: updated });
                                                        }} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>{t('Role')}</Label>
                                                        <Input value={testimonial.role} onChange={(e) => {
                                                            const updated = [...getSectionData('testimonials').testimonials];
                                                            updated[idx].role = e.target.value;
                                                            updateSectionData('testimonials', { testimonials: updated });
                                                        }} />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>{t('Content')}</Label>
                                                    <Textarea value={testimonial.content} onChange={(e) => {
                                                        const updated = [...getSectionData('testimonials').testimonials];
                                                        updated[idx].content = e.target.value;
                                                        updateSectionData('testimonials', { testimonials: updated });
                                                    }} rows={3} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Fallback for other sections */}
                        {!['general', 'hero', 'features', 'about', 'testimonials'].includes(activeSection) && (
                            <div className="bg-gray-50 dark:bg-gray-900 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
                                {sectionIcons[activeSection] && React.cloneElement(sectionIcons[activeSection], { className: "h-12 w-12 mx-auto text-gray-300 mb-4" })}
                                <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">{t('Section customization coming soon')}</h3>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    {t('We are working on bringing more customization options for the')} {t(sections.find(s => s.id === activeSection)?.name)} {t('section.')}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageTemplate>
    );
}

const ImageIcon = (props) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
);
