// In-memory data storage (replace with database later)
let users = [
  {
    id: '1',
    name: 'Demo User',
    email: 'demo@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password123
  }
];

let trucks = [
  {
    id: '1',
    registration_number: 'ABC-123',
    make: 'Volvo',
    model: 'FH16',
    capacity: 25,
    status: 'available',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    registration_number: 'XYZ-456',
    make: 'Scania',
    model: 'R500',
    capacity: 30,
    status: 'in_use',
    created_at: new Date().toISOString()
  }
];

let drivers = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@example.com',
    phone: '+1234567890',
    license_number: 'DL123456',
    status: 'active',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1234567891',
    license_number: 'DL789012',
    status: 'active',
    created_at: new Date().toISOString()
  }
];

let deliveries = [
  {
    id: '1',
    order_number: 'ORD-001',
    origin: 'Warehouse A',
    destination: 'Store B',
    truck_id: '1',
    driver_id: '1',
    weight: 15000,
    status: 'in_progress',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    order_number: 'ORD-002',
    origin: 'Factory C',
    destination: 'Distribution D',
    truck_id: '2',
    driver_id: '2',
    weight: 20000,
    status: 'pending',
    created_at: new Date().toISOString()
  }
];

module.exports = {
  users,
  trucks,
  drivers,
  deliveries
};
