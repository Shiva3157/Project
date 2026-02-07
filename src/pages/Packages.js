import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { packageAPI } from '../services/api';
import { Package, MapPin, Calendar, Users, Search, Filter } from 'lucide-react';

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    destination: '',
    min_price: '',
    max_price: '',
    duration: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPackages();
  }, [filters]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await packageAPI.getAll(filters);
      setPackages(response.data.data.packages);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilters({
      destination: '',
      min_price: '',
      max_price: '',
      duration: ''
    });
    setSearchTerm('');
  };

  const filteredPackages = packages.filter(pkg =>
    pkg.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pkg.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Container className="py-5">
        <div className="d-flex justify-content-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-5 mb-2">
            <Package className="me-3" size={40} />
            Travel Packages
          </h1>
          <p className="lead text-muted">Discover amazing destinations with our curated travel packages</p>
        </Col>
      </Row>

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row className="align-items-end">
                <Col md={4}>
                  <Form.Group className="mb-3 mb-md-0">
                    <Form.Label>Search Packages</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Search size={16} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by name, destination..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group className="mb-3 mb-md-0">
                    <Form.Label>Destination</Form.Label>
                    <Form.Control
                      type="text"
                      name="destination"
                      placeholder="Any destination"
                      value={filters.destination}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group className="mb-3 mb-md-0">
                    <Form.Label>Min Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      name="min_price"
                      placeholder="0"
                      value={filters.min_price}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group className="mb-3 mb-md-0">
                    <Form.Label>Max Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      name="max_price"
                      placeholder="Any"
                      value={filters.max_price}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Button
                    variant="outline-secondary"
                    onClick={clearFilters}
                    className="w-100"
                  >
                    Clear Filters
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Results Count */}
      <Row className="mb-3">
        <Col>
          <p className="text-muted">
            Showing {filteredPackages.length} package{filteredPackages.length !== 1 ? 's' : ''}
          </p>
        </Col>
      </Row>

      {/* Packages Grid */}
      <Row>
        {filteredPackages.length === 0 ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <Package size={64} className="text-muted mb-3" />
                <h4>No packages found</h4>
                <p className="text-muted">Try adjusting your search criteria or filters</p>
                <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredPackages.map((pkg) => (
            <Col lg={4} md={6} key={pkg.package_id} className="mb-4">
              <Card className="h-100 package-card card-hover">
                <div style={{ height: '250px', overflow: 'hidden' }}>
                  <Card.Img
                    variant="top"
                    src={pkg.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                    style={{ height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h5">{pkg.title}</Card.Title>
                  
                  <div className="mb-2">
                    <MapPin size={16} className="text-muted me-1" />
                    <span className="text-muted">{pkg.destination}</span>
                  </div>
                  
                  <Card.Text className="text-muted flex-grow-1">
                    {pkg.description ? 
                      (pkg.description.length > 100 ? 
                        pkg.description.substring(0, 100) + '...' : 
                        pkg.description
                      ) : 
                      'Explore this amazing destination with our carefully crafted package.'
                    }
                  </Card.Text>
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted">
                        <Calendar size={16} className="me-1" />
                        {pkg.duration_days} days
                      </span>
                      <span className="text-muted">
                        <Users size={16} className="me-1" />
                        Up to {pkg.max_persons || 10} persons
                      </span>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="package-price">₹{pkg.price.toLocaleString()}</span>
                      <small className="text-muted">per person</small>
                    </div>
                  </div>
                  
                  <Button 
                    as={Link} 
                    to={`/packages/${pkg.package_id}`} 
                    variant="primary" 
                    className="w-100"
                  >
                    View Details
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Load More Button (if needed for pagination) */}
      {filteredPackages.length > 0 && (
        <Row className="mt-4">
          <Col className="text-center">
            <p className="text-muted">
              Showing all available packages. Check back later for new destinations!
            </p>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Packages;
