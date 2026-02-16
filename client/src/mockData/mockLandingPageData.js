export const mockLandingPageData = {
    data: {
        id: 1,
        company_name: "Ribo SaaS",
        company_email: "hello@ribo.com",
        company_phone: "+1 (555) 000-0000",
        address: "123 Business Ave, San Francisco, CA",
        primary_color: "#3fa9f5",
        secondary_color: "#34d399",
        accent_color: "#f59e0b",
        theme_mode: "light",
        active_template: "modern",
        config_sections: {
            section_visibility: {
                hero: true,
                features: true,
                why_choose_us: true,
                about: true,
                team: true,
                testimonials: true,
                plans: true,
                faq: true,
                newsletter: true,
                contact: true,
                screenshots: true
            },
            section_data: {
                hero: {
                    title: "Scale Your Business with Ribo",
                    subtitle: "The all-in-one CRM and ERP solution for modern startups.",
                    button_text: "Get Started Free",
                    button_link: "/register",
                    secondary_button_text: "View Demo",
                    secondary_button_link: "#",
                    image: "/storage/landing/hero.png",
                    image_position: "right",
                    background_color: "#f8fafc",
                    text_color: "#1f2937",
                    stats: [
                        { value: "10K+", label: "Active Users" },
                        { value: "500+", label: "Enterprise Clients" }
                    ]
                },
                features: {
                    title: "Powerful Features",
                    subtitle: "Everything you need to manage your business in one place.",
                    features_list: [
                        { icon: "users", title: "CRM", description: "Manage your leads and customers effectively." },
                        { icon: "briefcase", title: "Project Management", description: "Keep track of all your projects and tasks." },
                        { icon: "shopping-bag", title: "Invoicing", description: "Professional invoices in seconds." }
                    ]
                },
                screenshots: {
                    title: "See Ribo in Action",
                    subtitle: "Explore our intuitive interface.",
                    screenshots_list: [
                        { src: "/storage/landing/ss1.png", alt: "Dashboard", title: "Dashboard", description: "Overview of your business." },
                        { src: "/storage/landing/ss2.png", alt: "Kanban", title: "Kanban Board", description: "Manage opportunities easily." }
                    ]
                },
                why_choose_us: {
                    title: "Why Choose Ribo?",
                    subtitle: "The best choice for growing teams.",
                    reasons: [
                        { icon: "zap", title: "Fast Setup", description: "Get started in minutes." },
                        { icon: "shield", title: "Secure", description: "Your data is safe with us." }
                    ],
                    stats_title: "Trusted by Industry Leaders",
                    stats: [
                        { value: "99.9%", label: "Uptime", color: "blue" },
                        { value: "24/7", label: "Support", color: "green" }
                    ]
                },
                team: {
                    title: "Our Team",
                    subtitle: "The people behind Ribo.",
                    members: [
                        { name: "John Doe", role: "CEO", bio: "Passionate about enterprise software.", image: "/storage/team/1.png" },
                        { name: "Jane Smith", role: "CTO", bio: "Loves building scalable systems.", image: "/storage/team/2.png" }
                    ]
                },
                testimonials: {
                    title: "What Our Customers Say",
                    subtitle: "Join thousands of satisfied users.",
                    testimonials: [
                        { name: "Alice Johnson", role: "Manager", company: "TechCorp", content: "Ribo changed the way we work.", rating: 5 },
                        { name: "Bob Wilson", role: "Founder", company: "StartupX", content: "Highly recommended for any small business.", rating: 5 }
                    ]
                },
                faq: {
                    title: "Frequently Asked Questions",
                    subtitle: "Find answers to your questions.",
                    faqs: [
                        { question: "Is there a free trial?", answer: "Yes, we offer a 14-day free trial." },
                        { question: "Can I cancel anytime?", answer: "Absolutely, no long-term contracts." }
                    ]
                }
            }
        }
    },
    sections: [
        { id: 'general', name: 'General Settings', icon: 'Settings' },
        { id: 'header', name: 'Header', icon: 'Layout' },
        { id: 'hero', name: 'Hero Section', icon: 'Type' },
        { id: 'features', name: 'Features', icon: 'Star' },
        { id: 'screenshots', name: 'Screenshots', icon: 'Monitor' },
        { id: 'whychooseus', name: 'Why Choose Us', icon: 'Award' },
        { id: 'about', name: 'About Us', icon: 'Info' },
        { id: 'team', name: 'Team', icon: 'Users' },
        { id: 'testimonials', name: 'Testimonials', icon: 'MessageSquare' },
        { id: 'plans', name: 'Plans', icon: 'CreditCard' },
        { id: 'faq', name: 'FAQ', icon: 'HelpCircle' },
        { id: 'newsletter', name: 'Newsletter', icon: 'Mail' },
        { id: 'contact', name: 'Contact Us', icon: 'Phone' },
        { id: 'footer', name: 'Footer', icon: 'Layout' }
    ],
    themes: [
        { id: 'light', name: 'Light' },
        { id: 'dark', name: 'Dark' }
    ],
    templates: [
        { id: 'modern', name: 'Modern Template' },
        { id: 'classic', name: 'Classic Template' }
    ],
    languages: [
        { code: 'en', name: 'English' },
        { code: 'fr', name: 'French' }
    ]
};
