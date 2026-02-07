import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Carousel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { packageAPI, destinationAPI } from '../services/api';
import { MapPin, Package, Hotel, Star, Users, Calendar } from 'lucide-react';

const Home = () => {
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [packagesRes, destinationsRes] = await Promise.all([
          packageAPI.getAll({ limit: 6 }),
          destinationAPI.getPopular()
        ]);
        
        setFeaturedPackages(packagesRes.data.data.packages.slice(0, 6));
        setPopularDestinations(destinationsRes.data.data.destinations.slice(0, 4));
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const heroImages = [
    {
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'Discover Amazing Destinations',
      subtitle: 'Explore the world with our curated travel packages'
    },
    {
      src: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'Luxury Hotels & Resorts',
      subtitle: 'Stay in comfort with our premium accommodations'
    },
    {
      src: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      title: 'Adventure Awaits',
      subtitle: 'Create memories that will last a lifetime'
    }
  ];

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </Container>
    );
  }

  return (
    <>
      {/* Hero Carousel */}
      <Carousel className="mb-5">
        {heroImages.map((image, index) => (
          <Carousel.Item key={index}>
            <div
              className="d-block w-100 hero-section"
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${image.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                height: '500px'
              }}
            >
              <Container className="h-100 d-flex align-items-center">
                <div className="text-white">
                  <h1 className="display-4 fw-bold mb-3">{image.title}</h1>
                  <p className="lead mb-4">{image.subtitle}</p>
                  <Button as={Link} to="/packages" variant="primary" size="lg">
                    Explore Packages
                  </Button>
                </div>
              </Container>
            </div>
          </Carousel.Item>
        ))}
      </Carousel>

      <Container>
        {/* Features Section */}
        <Row className="mb-5">
          <Col md={4} className="text-center mb-4">
            <div className="p-4">
              <Package size={48} className="text-primary mb-3" />
              <h4>Travel Packages</h4>
              <p className="text-muted">
                Discover amazing travel packages to destinations around the world
              </p>
            </div>
          </Col>
          <Col md={4} className="text-center mb-4">
            <div className="p-4">
              <Hotel size={48} className="text-primary mb-3" />
              <h4>Hotel Booking</h4>
              <p className="text-muted">
                Book comfortable accommodations at the best prices
              </p>
            </div>
          </Col>
          <Col md={4} className="text-center mb-4">
            <div className="p-4">
              <MapPin size={48} className="text-primary mb-3" />
              <h4>Destinations</h4>
              <p className="text-muted">
                Explore popular destinations and plan your perfect trip
              </p>
            </div>
          </Col>
        </Row>

        {/* Featured Packages */}
        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-4">Featured Packages</h2>
            <Row>
              {featuredPackages.map((pkg) => (
                <Col md={4} key={pkg.id} className="mb-4">
                  <Card className="h-100 package-card card-hover">
                    <Card.Img
                      variant="top"
                      src={pkg.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                      style={{ height: '200px', objectFit: 'cover' }}
                    />
                    <Card.Body className="d-flex flex-column">
                      <Card.Title>{pkg.name}</Card.Title>
                      <Card.Text className="text-muted flex-grow-1">
                        <MapPin size={16} className="me-1" />
                        {pkg.destination}
                      </Card.Text>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">
                          <Calendar size={16} className="me-1" />
                          {pkg.duration_days} days
                        </span>
                        <span className="package-price">₹{pkg.price.toLocaleString()}</span>
                      </div>
                      <Button as={Link} to={`/packages/${pkg.id}`} variant="primary" className="w-100">
                        View Details
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <div className="text-center">
              <Button as={Link} to="/packages" variant="outline-primary" size="lg">
                View All Packages
              </Button>
            </div>
          </Col>
        </Row>

        {/* Popular Destinations */}
        <Row className="mb-5">
          <Col>
            <h2 className="text-center mb-4">Popular Destinations</h2>
            <Row>
              {popularDestinations.map((destination) => (
                <Col md={6} lg={3} key={destination.id} className="mb-4">
                  <Card className="destination-card card-hover">
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      <Card.Img
                        variant="top"
                        src={destination.image_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'}
                        style={{ height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <Card.Body>
                      <Card.Title>{destination.name}</Card.Title>
                      <Card.Text className="text-muted small">
                        {destination.country}
                      </Card.Text>
                      <Button as={Link} to={`/destinations/${destination.id}`} variant="outline-primary" size="sm">
                        Explore
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
            <div className="text-center">
              <Button as={Link} to="/destinations" variant="outline-primary" size="lg">
                View All Destinations
              </Button>
            </div>
          </Col>
        </Row>

        {/* Call to Action */}
        <Row className="mb-5">
          <Col>
            <Card className="dashboard-card text-center">
              <Card.Body className="py-5">
                <h3 className="mb-3">Ready to Start Your Journey?</h3>
                <p className="lead mb-4">
                  Join thousands of travelers who have discovered amazing destinations with us
                </p>
                <Button as={Link} to="/register" variant="light" size="lg" className="me-3">
                  Get Started
                </Button>
                <Button as={Link} to="/packages" variant="outline-light" size="lg">
                  Browse Packages
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Home;
