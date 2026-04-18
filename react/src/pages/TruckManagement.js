import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { truckService } from '../services/api';

const TruckManagement = () => {
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    registration_number: '',
    make: '',
    model: '',
    capacity: '',
    status: 'available',
  });

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      setLoading(true);
      const response = await truckService.getAll();
      setTrucks(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load trucks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (truck = null) => {
    if (truck) {
      setEditingId(truck.id);
      setFormData(truck);
    } else {
      setEditingId(null);
      setFormData({
        registration_number: '',
        make: '',
        model: '',
        capacity: '',
        status: 'available',
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
        await truckService.update(editingId, formData);
      } else {
        await truckService.create(formData);
      }
      fetchTrucks();
      handleCloseModal();
    } catch (err) {
      setError('Failed to save truck');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this truck?')) {
      try {
        await truckService.delete(id);
        fetchTrucks();
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to delete truck');
        console.error(err);
      }
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

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Truck Management</h1>
        <Button variant="primary" onClick={() => handleOpenModal()}>
          + Add New Truck
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="table-responsive">
        <Table striped bordered hover>
          <thead className="table-dark">
            <tr>
              <th>Registration Number</th>
              <th>Make & Model</th>
              <th>Capacity</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {trucks.length > 0 ? (
              trucks.map(truck => (
                <tr key={truck.id}>
                  <td>{truck.registration_number}</td>
                  <td>{truck.make} {truck.model}</td>
                  <td>{truck.capacity} tons</td>
                  <td>
                    <span className={`badge bg-${truck.status === 'available' ? 'success' : 'warning'}`}>
                      {truck.status}
                    </span>
                  </td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleOpenModal(truck)}
                      className="me-2"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(truck.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No trucks found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>{editingId ? 'Edit Truck' : 'Add New Truck'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Registration Number</Form.Label>
              <Form.Control
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Make</Form.Label>
              <Form.Control
                type="text"
                name="make"
                value={formData.make}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Model</Form.Label>
              <Form.Control
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Capacity (tons)</Form.Label>
              <Form.Control
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="available">Available</option>
                <option value="in_use">In Use</option>
                <option value="maintenance">Maintenance</option>
              </Form.Select>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100">
              {editingId ? 'Update Truck' : 'Add Truck'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default TruckManagement;
