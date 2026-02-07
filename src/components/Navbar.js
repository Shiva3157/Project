import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';
import { User, LogOut, Settings, MapPin, Package, Hotel } from 'lucide-react';

const NavigationBar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>
            <MapPin className="me-2" size={24} />
            Travel Management
          </Navbar.Brand>
        </LinkContainer>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/packages">
              <Nav.Link>
                <Package className="me-1" size={16} />
                Packages
              </Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/hotels">
              <Nav.Link>
                <Hotel className="me-1" size={16} />
                Hotels
              </Nav.Link>
            </LinkContainer>
            
            <LinkContainer to="/destinations">
              <Nav.Link>
                <MapPin className="me-1" size={16} />
                Destinations
              </Nav.Link>
            </LinkContainer>
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                <LinkContainer to="/dashboard">
                  <Nav.Link>Dashboard</Nav.Link>
                </LinkContainer>
                
                <NavDropdown
                  title={
                    <span>
                      <User className="me-1" size={16} />
                      {user?.name || user?.username}
                    </span>
                  }
                  id="user-dropdown"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>
                      <Settings className="me-2" size={16} />
                      Profile
                    </NavDropdown.Item>
                  </LinkContainer>
                  
                  <LinkContainer to="/my-bookings">
                    <NavDropdown.Item>
                      <Package className="me-2" size={16} />
                      My Bookings
                    </NavDropdown.Item>
                  </LinkContainer>
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item onClick={handleLogout}>
                    <LogOut className="me-2" size={16} />
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
                
                <LinkContainer to="/register">
                  <Nav.Link>Register</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
