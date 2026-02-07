import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, InputGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { hotelAPI } from '../services/api';
import { Hotel, MapPin, Star, Search, Wifi, Car, Coffee, Dumbbell } from 'lucide-react';

const Hotels = () => {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    location: '',
    min_price: '',
    max_price: '',
    rating: ''
  });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHotels();
  }, [filters]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const response = await hotelAPI.getAll(filters);
      setHotels(response.data.data.hotels);
    } catch (error) {
      console.error('Error fetching hotels:', error);
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
      location: '',
      min_price: '',
      max_price: '',
      rating: ''
    });
    setSearchTerm('');
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="text-warning" fill="currentColor" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="text-warning" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-muted" />);
    }

    return stars;
  };

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi size={14} />;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car size={14} />;
    if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) return <Coffee size={14} />;
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return <Dumbbell size={14} />;
    return null;
  };

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
            <Hotel className="me-3" size={40} />
            Hotels & Accommodations
          </h1>
          <p className="lead text-muted">Find the perfect place to stay for your journey</p>
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
                    <Form.Label>Search Hotels</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>
                        <Search size={16} />
                      </InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder="Search by name, location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                
                <Col md={2}>
                  <Form.Group className="mb-3 mb-md-0">
                    <Form.Label>Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="location"
                      placeholder="Any location"
                      value={filters.location}
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
            Showing {filteredHotels.length} hotel{filteredHotels.length !== 1 ? 's' : ''}
          </p>
        </Col>
      </Row>

      {/* Hotels Grid */}
      <Row>
        {filteredHotels.length === 0 ? (
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <Hotel size={64} className="text-muted mb-3" />
                <h4>No hotels found</h4>
                <p className="text-muted">Try adjusting your search criteria or filters</p>
                <Button variant="primary" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ) : (
          filteredHotels.map((hotel) => (
            <Col lg={4} md={6} key={hotel.hotel_id} className="mb-4">
              <Card className="h-100 package-card card-hover">
                <div style={{ height: '250px', overflow: 'hidden' }}>
                  <Card.Img
                    variant="top"
                    src={hotel.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                    style={{ height: '100%', objectFit: 'cover' }}
                  />
                </div>
                
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className="h5 mb-0">{hotel.name}</Card.Title>
                    <div className="d-flex align-items-center">
                      {renderStars(hotel.rating)}
                      <span className="ms-1 text-muted">({hotel.rating})</span>
                    </div>
                  </div>
                  
                  <div className="mb-2">
                    <MapPin size={16} className="text-muted me-1" />
                    <span className="text-muted">{hotel.location}</span>
                  </div>
                  
                  <Card.Text className="text-muted flex-grow-1">
                    {hotel.description ? 
                      (hotel.description.length > 100 ? 
                        hotel.description.substring(0, 100) + '...' : 
                        hotel.description
                      ) : 
                      'Experience comfort and luxury at this beautiful hotel.'
                    }
                  </Card.Text>
                  
                  {/* Amenities */}
                  {hotel.amenities && (
                    <div className="mb-3">
                      <div className="d-flex flex-wrap gap-1">
                        {hotel.amenities.split(',').slice(0, 4).map((amenity, index) => (
                          <Badge key={index} bg="light" text="dark" className="d-flex align-items-center">
                            {getAmenityIcon(amenity.trim())}
                            <span className="ms-1">{amenity.trim()}</span>
                          </Badge>
                        ))}
                        {hotel.amenities.split(',').length > 4 && (
                          <Badge bg="secondary">+{hotel.amenities.split(',').length - 4} more</Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <div className="package-price">₹{hotel.price_per_night.toLocaleString()}</div>
                        <small className="text-muted">per night</small>
                      </div>
                      {hotel.available_rooms !== undefined && (
                        <div className="text-end">
                          <small className="text-muted">
                            {hotel.available_rooms > 0 ? (
                              <span className="text-success">
                                {hotel.available_rooms} rooms available
                              </span>
                            ) : (
                              <span className="text-danger">No rooms available</span>
                            )}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    as={Link} 
                    to={`/hotels/${hotel.hotel_id}`} 
                    variant="primary" 
                    className="w-100"
                    disabled={hotel.available_rooms === 0}
                  >
                    {hotel.available_rooms === 0 ? 'Fully Booked' : 'View Details'}
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Load More Button (if needed for pagination) */}
      {filteredHotels.length > 0 && (
        <Row className="mt-4">
          <Col className="text-center">
            <p className="text-muted">
              Showing all available hotels. Check back later for new properties!
            </p>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Hotels;
