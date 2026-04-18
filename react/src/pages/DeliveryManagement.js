import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { deliveryService, truckService, driverService } from '../services/api';

const DeliveryManagement = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    order_number: '',
    origin: '',
    destination: '',
    truck_id: '',
    driver_id: '',
    status: 'pending',
    weight: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deliveriesRes, trucksRes, driversRes] = await Promise.all([
        deliveryService.getAll(),
        truckService.getAll(),
        driverService.getAll(),
      ]);
      setDeliveries(deliveriesRes.data || []);
      setTrucks(trucksRes.data || []);
      setDrivers(driversRes.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (delivery = null) => {
    if (delivery) {
      setEditingId(delivery.id);
      setFormData(delivery);
    } else {
      setEditingId(null);
      setFormData({
        order_number: '',
        origin: '',
        destination: '',
        truck_id: '',
        driver_id: '',
        status: 'pending',
        weight: '',
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await deliveryService.update(editingId, formData);
      } else {
        await deliveryService.create(formData);
      }
      fetchData();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save delivery');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      try {
        await deliveryService.delete(id);
        fetchData();
      } catch (err) {
        setError('Failed to delete delivery');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await deliveryService.updateStatus(id, newStatus);
      fetchData();
    } catch (err) {
      setError('Failed to update delivery status');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  const getTruckNumber = (id) => {
    const truck = trucks.find(t => t.id === id);
    return truck?.registration_number || 'N/A';
  };

  const getDriverName = (id) => {
    const driver = drivers.find(d => d.id === id);
    return driver?.name || 'N/A';
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Delivery Orders</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Create New Delivery
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>Order Number</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Truck</th>
              <th>Driver</th>
              <th>Weight</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.length > 0 ? (
              deliveries.map(delivery => (
                <tr key={delivery.id}>
                  <td>{delivery.order_number}</td>
                  <td>{delivery.origin}</td>
                  <td>{delivery.destination}</td>
                  <td>{getTruckNumber(delivery.truck_id)}</td>
                  <td>{getDriverName(delivery.driver_id)}</td>
                  <td>{delivery.weight} kg</td>
                  <td>
                    <Form.Select
                      size="sm"
                      value={delivery.status}
                      onChange={(e) => handleStatusChange(delivery.id, e.target.value)}
                      className="d-inline-block w-auto"
                    >
                      <option value="pending">Pending</option>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleOpenModal(delivery)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(delivery.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="text-center">No deliveries found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Delivery' : 'Create New Delivery'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Order Number</Form.Label>
              <Form.Control
                type="text"
                name="order_number"
                value={formData.order_number}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Origin</Form.Label>
              <Form.Control
                type="text"
                name="origin"
                value={formData.origin}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Destination</Form.Label>
              <Form.Control
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Weight (kg)</Form.Label>
              <Form.Control
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Truck</Form.Label>
              <Form.Select
                name="truck_id"
                value={formData.truck_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Truck --</option>
                {trucks.map(truck => (
                  <option key={truck.id} value={truck.id}>
                    {truck.registration_number} - {truck.make} {truck.model}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Select Driver</Form.Label>
              <Form.Select
                name="driver_id"
                value={formData.driver_id}
                onChange={handleChange}
                required
              >
                <option value="">-- Choose Driver --</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} - {driver.phone}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="pending">Pending</option>
                <option value="assigned">Assigned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              {editingId ? 'Update Delivery' : 'Create Delivery'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default DeliveryManagement;
