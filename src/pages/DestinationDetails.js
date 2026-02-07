import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { destinationAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  MapPin, 
  Globe, 
  Calendar, 
  Star, 
  Package, 
  Hotel, 
  ArrowLeft,
  Users,
  CreditCard
} from 'lucide-react';

const DestinationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [destinationData, setDestinationData] = useState(null);
  const [relatedPackages, setRelatedPackages] = useState([]);
  const [relatedHotels, setRelatedHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDestinationDetails();
  }, [id]);

  const fetchDestinationDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching destination details for ID:', id);
      const response = await destinationAPI.getById(id);
      console.log('Destination details response:', response.data);
      
      if (response.data && response.data.success && response.data.data) {
        const data = response.data.data;
        setDestinationData(data.destination);
        setRelatedPackages(data.related_packages || []);
        setRelatedHotels(data.related_hotels || []);
      } else {
        console.error('Invalid destination details response:', response.data);
        toast.error('Invalid response from server');
        navigate('/destinations');
      }
    } catch (error) {
      console.error('Error fetching destination details:', error);
      toast.error(`Failed to load destination details: ${error.message}`);
      navigate('/destinations');
    } finally {
      setLoading(false);
    }
  };

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

  if (!destinationData) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h4>Destination not found</h4>
          <Button as={Link} to="/destinations" variant="primary">
            Back to Destinations
          </Button>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      {/* Back Button */}
      <Row className="mb-3">
        <Col>
          <Button
            variant="outline-secondary"
            onClick={() => navigate('/destinations')}
            className="mb-3"
          >
            <ArrowLeft size={16} className="me-2" />
            Back to Destinations
          </Button>
        </Col>
      </Row>

      {/* Destination Header */}
      <Row className="mb-4">
        <Col>
          <Card>
            <div style={{ height: '400px', overflow: 'hidden' }}>
              <Card.Img
                src={destinationData.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80'}
                style={{ height: '100%', objectFit: 'cover' }}
              />
            </div>
            <Card.Body>
              <Row>
                <Col md={8}>
                  <h1 className="display-5 mb-3">{destinationData.name}</h1>
                  
                  <div className="mb-3">
                    <Globe size={20} className="text-primary me-2" />
                    <span className="h5">{destinationData.country}</span>
                  </div>
                  
                  <p className="lead text-muted mb-4">
                    {destinationData.description || 
                      `Discover the beauty and culture of ${destinationData.name}, a magnificent destination that offers unforgettable experiences and breathtaking sights.`
                    }
                  </p>

                  {destinationData.best_time_to_visit && (
                    <div className="mb-3">
                      <Calendar size={20} className="text-primary me-2" />
                      <strong>Best time to visit:</strong> {destinationData.best_time_to_visit}
                    </div>
                  )}
                </Col>
                
                <Col md={4} className="text-center">
                  <div className="bg-light p-4 rounded">
                    <h5 className="mb-3">Quick Actions</h5>
                    <div className="d-grid gap-2">
                      <Button as={Link} to="/packages" variant="primary">
                        <Package size={16} className="me-2" />
                        View Packages
                      </Button>
                      <Button as={Link} to="/hotels" variant="outline-primary">
                        <Hotel size={16} className="me-2" />
                        Find Hotels
                      </Button>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Popular Attractions */}
      {destinationData.popular_attractions && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <h4 className="mb-0">
                  <Star size={20} className="me-2" />
                  Popular Attractions
                </h4>
              </Card.Header>
              <Card.Body>
                <div className="d-flex flex-wrap gap-2">
                  {destinationData.popular_attractions.split(',').map((attraction, index) => (
                    <Badge key={index} bg="primary" className="p-2">
                      {attraction.trim()}
                    </Badge>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Related Packages */}
      {relatedPackages.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <Package size={20} className="me-2" />
                  Travel Packages to {destinationData.name}
                </h4>
                <Button as={Link} to="/packages" variant="outline-primary" size="sm">
                  View All Packages
                </Button>
              </Card.Header>
              <Card.Body>
                <Row>
                  {relatedPackages.map((pkg) => (
                    <Col lg={4} md={6} key={pkg.package_id} className="mb-3">
                      <Card className="h-100 package-card card-hover">
                        <div style={{ height: '200px', overflow: 'hidden' }}>
                          <Card.Img
                            variant="top"
                            src={pkg.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                            style={{ height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <Card.Title className="h6">{pkg.title}</Card.Title>
                          <div className="mb-2">
                            <Calendar size={14} className="text-muted me-1" />
                            <small className="text-muted">{pkg.duration_days} days</small>
                          </div>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="package-price">₹{pkg.price.toLocaleString()}</span>
                              <small className="text-muted">per person</small>
                            </div>
                            <Button 
                              as={Link} 
                              to={`/packages/${pkg.package_id}`} 
                              variant="primary" 
                              size="sm" 
                              className="w-100"
                            >
                              View Details
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Related Hotels */}
      {relatedHotels.length > 0 && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <Hotel size={20} className="me-2" />
                  Hotels in {destinationData.name}
                </h4>
                <Button as={Link} to="/hotels" variant="outline-primary" size="sm">
                  View All Hotels
                </Button>
              </Card.Header>
              <Card.Body>
                <Row>
                  {relatedHotels.map((hotel) => (
                    <Col lg={4} md={6} key={hotel.hotel_id} className="mb-3">
                      <Card className="h-100 package-card card-hover">
                        <div style={{ height: '200px', overflow: 'hidden' }}>
                          <Card.Img
                            variant="top"
                            src={hotel.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                            style={{ height: '100%', objectFit: 'cover' }}
                          />
                        </div>
                        <Card.Body className="d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title className="h6 mb-0">{hotel.name}</Card.Title>
                            <div className="d-flex align-items-center">
                              {renderStars(hotel.rating)}
                              <span className="ms-1 small text-muted">({hotel.rating})</span>
                            </div>
                          </div>
                          <div className="mt-auto">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="package-price">₹{hotel.price_per_night.toLocaleString()}</span>
                              <small className="text-muted">per night</small>
                            </div>
                            <Button 
                              as={Link} 
                              to={`/hotels/${hotel.hotel_id}`} 
                              variant="primary" 
                              size="sm" 
                              className="w-100"
                            >
                              View Details
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* No Related Content */}
      {relatedPackages.length === 0 && relatedHotels.length === 0 && (
        <Row className="mb-4">
          <Col>
            <Card className="text-center py-5">
              <Card.Body>
                <MapPin size={64} className="text-muted mb-3" />
                <h4>Explore More Options</h4>
                <p className="text-muted mb-4">
                  While we don't have specific packages or hotels for this destination yet, 
                  you can browse our full collection to find similar options.
                </p>
                <Button as={Link} to="/packages" variant="primary" className="me-3">
                  Browse All Packages
                </Button>
                <Button as={Link} to="/hotels" variant="outline-primary">
                  Browse All Hotels
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Call to Action */}
      <Row>
        <Col>
          <Card className="dashboard-card text-center">
            <Card.Body className="py-4">
              <h4 className="mb-3">Ready to Visit {destinationData.name}?</h4>
              <p className="mb-4">
                Start planning your perfect trip with our travel packages and accommodation options
              </p>
              <Button as={Link} to="/packages" variant="light" size="lg" className="me-3">
                <Package size={20} className="me-2" />
                Browse Packages
              </Button>
              <Button as={Link} to="/hotels" variant="outline-light" size="lg">
                <Hotel size={20} className="me-2" />
                Find Hotels
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DestinationDetails;
