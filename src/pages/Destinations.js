import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { destinationAPI } from '../services/api';
import { MapPin, Search, Globe } from 'lucide-react';

const Destinations = () => {
  const [destinations, setDestinations] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    country: '',
    search: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDestinations();
    fetchPopularDestinations();
  }, [filters]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching destinations with filters:', filters);
      const response = await destinationAPI.getAll(filters);
      console.log('Destinations response:', response.data);
      if (response.data && response.data.success && response.data.data) {
        setDestinations(response.data.data.destinations || []);
      } else {
        console.error('Invalid response format:', response.data);
        setDestinations([]);
        setError('Invalid response from server');
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
      setDestinations([]);
      setError(`Failed to load destinations: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchPopularDestinations = async () => {
    try {
      console.log('Fetching popular destinations...');
      const response = await destinationAPI.getPopular();
      console.log('Popular destinations response:', response.data);
      if (response.data && response.data.success && response.data.data) {
        setPopularDestinations(response.data.data.destinations.slice(0, 4) || []);
      } else {
        console.error('Invalid popular destinations response:', response.data);
        setPopularDestinations([]);
      }
    } catch (error) {
      console.error('Error fetching popular destinations:', error);
      setPopularDestinations([]);
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
      country: '',
      search: ''
    });
    setSearchTerm('');
  };

  const filteredDestinations = destinations.filter(destination =>
    destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destination.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
    destination.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (error) {
    return (
      <Container className="py-5">
        <Row>
          <Col>
            <Card className="text-center">
              <Card.Body>
                <h4 className="text-danger">Error Loading Destinations</h4>
                <p className="text-muted">{error}</p>
                <Button variant="primary" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <h1 className="display-5 mb-2">
            <MapPin className="me-3" size={40} />
            Destinations
          </h1>
          <p className="lead text-muted">Discover amazing places around the world</p>
        </Col>
      </Row>

      {/* Popular Destinations Section */}
      {popularDestinations.length > 0 && (
        <Row className="mb-5">
          <Col>
            <h2 className="mb-4">Popular Destinations</h2>
            <Row>
              {popularDestinations.map((destination) => (
                <Col lg={3} md={6} key={destination.destination_id} className="mb-4">
                  <Card className="destination-card card-hover h-100">
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      <Card.Img
                        variant="top"
                        src={destination.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                        style={{ height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{destination.name}</Card.Title>
                      <Card.Text className="text-muted mb-2">
                        <Globe size={16} className="me-1" />
                        {destination.country}
                      </Card.Text>
                      <Card.Text className="text-muted flex-grow-1 small">
                        {destination.description ? 
                          (destination.description.length > 80 ? 
                            destination.description.substring(0, 80) + '...' : 
                            destination.description
                          ) : 
                          'Discover the beauty and culture of this amazing destination.'
                        }
                      </Card.Text>
                      <Button as={Link} to={`/destinations/${destination.destination_id}`} variant="primary" size="sm">
                        Explore
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      )}

      {/* Search and Filters */}
      <Row className="mb-4">
        <Col>
          <Card>
            <Card.Body>
              <Row className="align-items-end">
                <Col md={6}>
                  <Form.Group className="mb-3 mb-md-0">
                    <Form.Label>Search Destinations</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Search size={16} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by name, country, description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                
                <Col md={3}>
                  <Form.Group className="mb-3 mb-md-0">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      placeholder="Any country"
                      value={filters.country}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                
                <Col md={3}>
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
          <h3>All Destinations</h3>
          <p className="text-muted">
            Showing {filteredDestinations.length} destination{filteredDestinations.length !== 1 ? 's' : ''}
          </p>
        </Col>
      </Row>

      {/* Destinations Grid */}
      <Row>
        {filteredDestinations.length === 0 ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <MapPin size={64} className="text-muted mb-3" />
                <h4>No destinations found</h4>
                <p className="text-muted">Try adjusting your search criteria or filters</p>
                <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredDestinations.map((destination) => (
            <Col lg={4} md={6} key={destination.destination_id} className="mb-4">
              <Card className="destination-card card-hover h-100">
                <div style={{ height: '250px', overflow: 'hidden' }}>
                  <Card.Img
                    variant="top"
                    src={destination.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                    style={{ height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="h5">{destination.name}</Card.Title>
                  
                  <div className="mb-2">
                    <Globe size={16} className="text-muted me-1" />
                    <span className="text-muted">{destination.country}</span>
                  </div>
                  
                  <Card.Text className="text-muted flex-grow-1">
                    {destination.description ? 
                      (destination.description.length > 120 ? 
                        destination.description.substring(0, 120) + '...' : 
                        destination.description
                      ) : 
                      'Discover the beauty and culture of this amazing destination with its unique attractions and experiences.'
                    }
                  </Card.Text>
                  
                  {destination.best_time_to_visit && (
                    <div className="mb-3">
                      <small className="text-muted">
                        <strong>Best time to visit:</strong> {destination.best_time_to_visit}
                      </small>
                    </div>
                  )}
                  
                  <Button 
                    as={Link} 
                    to={`/destinations/${destination.destination_id}`} 
                    variant="primary" 
                    className="w-100"
                  >
                    Explore Destination
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Call to Action */}
      {filteredDestinations.length > 0 && (
        <Row className="mt-5">
          <Col>
            <Card className="dashboard-card text-center">
              <Card.Body className="py-4">
                <h4 className="mb-3">Ready to Plan Your Trip?</h4>
                <p className="mb-4">
                  Browse our travel packages and hotels to make your dream destination a reality
                </p>
                <Button as={Link} to="/packages" variant="light" size="lg" className="me-3">
                  View Packages
                </Button>
                <Button as={Link} to="/hotels" variant="outline-light" size="lg">
                  Find Hotels
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Destinations;
