import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { truckService, driverService, deliveryService } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    trucks: 0,
    drivers: 0,
    deliveries: 0,
    activeDeliveries: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [trucksRes, driversRes, deliveriesRes] = await Promise.all([
          truckService.getAll(),
          driverService.getAll(),
          deliveryService.getAll(),
        ]);

        const deliveries = deliveriesRes.data || [];
        const activeDeliveries = deliveries.filter(d => d.status === 'in_progress').length;

        setStats({
          trucks: trucksRes.data?.length || 0,
          drivers: driversRes.data?.length || 0,
          deliveries: deliveries.length,
          activeDeliveries,
        });
      } catch (err) {
        setError('Failed to load dashboard data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
        <Spinner animation="border" />
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Dashboard</h1>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row className="mb-4">
        <Col md={6} lg={3} className="mb-3">
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="text-primary mb-2">{stats.trucks}</h2>
              <Card.Text>Total Trucks</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="text-success mb-2">{stats.drivers}</h2>
              <Card.Text>Total Drivers</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="text-info mb-2">{stats.deliveries}</h2>
              <Card.Text>Total Deliveries</Card.Text>
            </Card.Body>
          </Card>
        </Col>

        <Col md={6} lg={3} className="mb-3">
          <Card className="text-center shadow-sm">
            <Card.Body>
              <h2 className="text-warning mb-2">{stats.activeDeliveries}</h2>
              <Card.Text>Active Deliveries</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <Card.Title className="mb-0">Welcome!</Card.Title>
            </Card.Header>
            <Card.Body>
              <p>
                Hello <strong>{user?.name || 'User'}</strong>, welcome to the Haulage Truck Management System.
              </p>
              <p>
                Use the navigation menu above to manage trucks, drivers, and delivery orders. Track your fleet in real-time and optimize your logistics operations.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
