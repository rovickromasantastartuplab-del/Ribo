export const mockProducts = [
    {
        id: 1,
        name: 'Standard Laptop',
        sku: 'LAP-001',
        description: 'High performance standard laptop for daily use.',
        price: 999.99,
        stock_quantity: 45,
        status: 'active',
        category: { id: 1, name: 'Electronics' },
        brand: { id: 1, name: 'GenericTech' },
        media: [{ collection_name: 'main', original_url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200' }],
        created_at: '2024-01-15T10:00:00Z'
    },
    {
        id: 2,
        name: 'Ergonomic Mouse',
        sku: 'MOU-002',
        description: 'Wireless ergonomic mouse with optical sensor.',
        price: 49.99,
        stock_quantity: 8,
        status: 'active',
        category: { id: 1, name: 'Electronics' },
        brand: { id: 1, name: 'GenericTech' },
        media: [{ collection_name: 'main', original_url: 'https://images.unsplash.com/photo-1527864509941-da951e1295a9?w=200' }],
        created_at: '2024-01-20T11:30:00Z'
    },
    {
        id: 3,
        name: 'Mechanical Keyboard',
        sku: 'KEY-003',
        description: 'RGB Backlit mechanical keyboard.',
        price: 129.99,
        stock_quantity: 0,
        status: 'inactive',
        category: { id: 1, name: 'Electronics' },
        brand: { id: 2, name: 'ClickyKeys' },
        media: [{ collection_name: 'main', original_url: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=200' }],
        created_at: '2024-01-25T09:15:00Z'
    }
];

export const mockCategories = [
    { id: 1, name: 'Electronics', status: 'active' },
    { id: 2, name: 'Furniture', status: 'active' },
    { id: 3, name: 'Stationery', status: 'active' }
];

export const mockBrands = [
    { id: 1, name: 'GenericTech', status: 'active' },
    { id: 2, name: 'ClickyKeys', status: 'active' },
    { id: 3, name: 'OfficeMate', status: 'active' }
];

export const mockTaxes = [
    { id: 1, name: 'VAT', rate: 20, status: 'active' },
    { id: 2, name: 'Sales Tax', rate: 10, status: 'active' }
];

export const mockInvoices = [
    {
        id: 1,
        invoice_number: 'INV-2024-001',
        name: 'Website Redesign',
        account: { id: 1, name: 'Acme Corp' },
        total_amount: 5000.00,
        status: 'sent',
        due_date: '2024-03-01',
        assigned_user: { id: 1, name: 'John Doe' },
        products: [{ id: 1, name: 'Service' }],
        created_at: '2024-02-01T10:00:00Z'
    },
    {
        id: 2,
        invoice_number: 'INV-2024-002',
        name: 'Hardware Supply',
        account: { id: 2, name: 'Globex' },
        total_amount: 1500.00,
        status: 'paid',
        due_date: '2024-02-15',
        assigned_user: { id: 2, name: 'Jane Smith' },
        products: [{ id: 1, name: 'Laptop' }, { id: 2, name: 'Mouse' }],
        created_at: '2024-01-15T09:00:00Z'
    }
];

export const mockQuotes = [
    {
        id: 1,
        quote_number: 'QUO-2024-001',
        name: 'New Office Setup',
        account: { id: 1, name: 'Acme Corp' },
        total_amount: 12000.00,
        status: 'accepted',
        valid_until: '2024-04-01',
        assigned_user: { id: 1, name: 'John Doe' },
        created_at: '2024-02-10T14:00:00Z'
    }
];

export const mockSalesOrders = [
    {
        id: 1,
        order_number: 'SO-2024-001',
        name: 'Spring Inventory',
        account: { id: 2, name: 'Globex' },
        total_amount: 3500.00,
        status: 'shipped',
        order_date: '2024-02-05',
        assigned_user: { id: 2, name: 'Jane Smith' },
        created_at: '2024-02-05T08:30:00Z'
    }
];

export const mockPurchaseOrders = [
    {
        id: 1,
        order_number: 'PO-2024-001',
        name: 'Bulk Component Order',
        vendor: 'TechSupplies Inc',
        total_amount: 8500.00,
        status: 'pending',
        order_date: '2024-02-10',
        created_at: '2024-02-10T10:00:00Z'
    }
];

export const mockDeliveryOrders = [
    {
        id: 1,
        order_number: 'DO-2024-001',
        name: 'Delivery Batch A',
        customer: 'Acme Corp',
        status: 'delivered',
        delivery_date: '2024-02-12',
        created_at: '2024-02-12T09:00:00Z'
    }
];

export const mockReturnOrders = [
    {
        id: 1,
        order_number: 'RO-2024-001',
        name: 'Defective Returns',
        customer: 'Globex',
        status: 'received',
        return_date: '2024-02-14',
        created_at: '2024-02-14T11:00:00Z'
    }
];

export const mockReceiptOrders = [
    {
        id: 1,
        order_number: 'REC-2024-001',
        name: 'Incoming Stock',
        vendor: 'TechSupplies Inc',
        status: 'completed',
        receipt_date: '2024-02-15',
        created_at: '2024-02-15T10:00:00Z'
    }
];

// Generic alias to prevent import errors in legacy-copied files
export const mockOrders = mockSalesOrders;
