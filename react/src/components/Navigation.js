import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand className="fw-bold">
          <Link to="/" className="text-white text-decoration-none">
            <img src='/images/truck.png' 
              alt="truck"
              style={{width:'80px', verticalAlign: 'middle', marginRight: '10px'}}/> Shofe Truck Management System
          </Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-center">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="nav-link text-white">
                  Dashboard
                </Link>
                <Link to="/trucks" className="nav-link text-white">
                  Trucks
                </Link>
                <Link to="/drivers" className="nav-link text-white">
                  Drivers
                </Link>
                <Link to="/deliveries" className="nav-link text-white">
                  Deliveries
                </Link>
                <span className="navbar-text ms-3 text-white">
                  Welcome, <strong>{user?.name || 'User'}</strong>
                </span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={handleLogout}
                  className="ms-2"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link text-white">
                  Login
                </Link>
                <Link to="/register" className="nav-link text-white">
                  Register
                </Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
