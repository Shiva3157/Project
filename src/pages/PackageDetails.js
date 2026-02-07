import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { packageAPI, customerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  Package, 
  MapPin, 
  Calendar, 
  Users, 
  CreditCard, 
  Check, 
  X, 
  ArrowLeft,
  User,
  Phone,
  Mail
} from 'lucide-react';

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [bookingData, setBookingData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    number_of_persons: 1,
    travel_date: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    fetchPackageDetails();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && showBookingModal) {
      fetchCustomerDetails();
    }
  }, [isAuthenticated, showBookingModal]);

  const fetchPackageDetails = async () => {
    try {
      const response = await packageAPI.getById(id);
      setPackageData(response.data.data.package);
    } catch (error) {
      console.error('Error fetching package details:', error);
      toast.error('Failed to load package details');
      navigate('/packages');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async () => {
    try {
      const response = await customerAPI.get();
      const customer = response.data.data.customer;
      setCustomerDetails(customer);
      
      if (customer) {
        setBookingData(prev => ({
          ...prev,
          customer_name: customer.full_name || customer.name,
          customer_email: customer.email,
          customer_phone: customer.phone
        }));
      }
    } catch (error) {
      console.log('No customer details found');
    }
  };

  const handleBookingChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
  };

  const handleBookNow = () => {
    if (!isAuthenticated) {
      toast.info('Please login to book this package');
      navigate('/login');
      return;
    }
    
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingLoading(true);

    try {
      const bookingPayload = {
        package_id: parseInt(id),
        travel_date: bookingData.travel_date,
        seats_booked: parseInt(bookingData.number_of_persons)
      };

      await packageAPI.book(bookingPayload);
      toast.success('Package booked successfully!');
      setShowBookingModal(false);
      navigate('/my-bookings');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to book package';
      setBookingError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const getTotalAmount = () => {
    if (!packageData || !bookingData.number_of_persons) return 0;
    return packageData.price * parseInt(bookingData.number_of_persons);
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

  if (!packageData) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h4>Package not found</h4>
          <Button as={Link} to="/packages" variant="primary">
            Back to Packages
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
            onClick={() => navigate('/packages')}
            className="mb-3"
          >
            <ArrowLeft size={16} className="me-2" />
            Back to Packages
          </Button>
        </Col>
      </Row>

      <Row>
        {/* Package Image */}
        <Col lg={8} className="mb-4">
          <Card>
            <div style={{ height: '400px', overflow: 'hidden' }}>
              <Card.Img
                src={packageData.image_url || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                style={{ height: '100%', objectFit: 'cover' }}
              />
            </div>
            <Card.Body>
              <h1 className="mb-3">{packageData.title}</h1>
              
              <div className="mb-3">
                <MapPin size={20} className="text-primary me-2" />
                <span className="h5">{packageData.destination}</span>
              </div>
              
              <p className="lead text-muted mb-4">
                {packageData.description || 'Experience the beauty and culture of this amazing destination with our carefully crafted travel package.'}
              </p>

              {/* Package Details */}
              <Row className="mb-4">
                <Col md={4} className="mb-3">
                  <div className="d-flex align-items-center">
                    <Calendar size={20} className="text-primary me-2" />
                    <div>
                      <strong>Duration</strong>
                      <div className="text-muted">{packageData.duration_days} days</div>
                    </div>
                  </div>
                </Col>
                
                <Col md={4} className="mb-3">
                  <div className="d-flex align-items-center">
                    <Users size={20} className="text-primary me-2" />
                    <div>
                      <strong>Max Persons</strong>
                      <div className="text-muted">Up to {packageData.max_persons || 10}</div>
                    </div>
                  </div>
                </Col>
                
                <Col md={4} className="mb-3">
                  <div className="d-flex align-items-center">
                    <CreditCard size={20} className="text-primary me-2" />
                    <div>
                      <strong>Price</strong>
                      <div className="package-price">₹{packageData.price.toLocaleString()}</div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Includes & Excludes */}
              <Row>
                <Col md={6}>
                  <h5 className="text-success mb-3">
                    <Check size={20} className="me-2" />
                    Includes
                  </h5>
                  <div className="mb-4">
                    {packageData.includes ? (
                      <ul className="list-unstyled">
                        {packageData.includes.split(',').map((item, index) => (
                          <li key={index} className="mb-1">
                            <Check size={16} className="text-success me-2" />
                            {item.trim()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">Package inclusions will be provided upon booking.</p>
                    )}
                  </div>
                </Col>
                
                <Col md={6}>
                  <h5 className="text-danger mb-3">
                    <X size={20} className="me-2" />
                    Excludes
                  </h5>
                  <div className="mb-4">
                    {packageData.excludes ? (
                      <ul className="list-unstyled">
                        {packageData.excludes.split(',').map((item, index) => (
                          <li key={index} className="mb-1">
                            <X size={16} className="text-danger me-2" />
                            {item.trim()}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted">Package exclusions will be provided upon booking.</p>
                    )}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>

        {/* Booking Card */}
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">Book This Package</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <div className="package-price mb-2">₹{packageData.price.toLocaleString()}</div>
                <small className="text-muted">per person</small>
              </div>
              
              <div className="mb-3">
                <strong>Available:</strong>
                <div className="text-muted">
                  {packageData.available_from && packageData.available_to ? (
                    <>
                      {new Date(packageData.available_from).toLocaleDateString()} - {' '}
                      {new Date(packageData.available_to).toLocaleDateString()}
                    </>
                  ) : (
                    'Year round'
                  )}
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100 mb-3"
                onClick={handleBookNow}
              >
                Book Now
              </Button>

              {!isAuthenticated && (
                <div className="text-center">
                  <small className="text-muted">
                    <Link to="/login">Login</Link> or <Link to="/register">Register</Link> to book
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Booking Modal */}
      <Modal show={showBookingModal} onHide={() => setShowBookingModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Book Package: {packageData.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!customerDetails && (
            <Alert variant="warning">
              <strong>Complete your profile first!</strong>
              <div className="mt-2">
                <Button
                  as={Link}
                  to="/customer-details"
                  variant="outline-warning"
                  size="sm"
                >
                  Add Personal Details
                </Button>
              </div>
            </Alert>
          )}

          {bookingError && (
            <Alert variant="danger">{bookingError}</Alert>
          )}

          <Form onSubmit={handleBookingSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <User size={16} className="me-2" />
                    Customer Name
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="customer_name"
                    value={bookingData.customer_name}
                    onChange={handleBookingChange}
                    required
                    disabled={bookingLoading}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <Mail size={16} className="me-2" />
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="customer_email"
                    value={bookingData.customer_email}
                    onChange={handleBookingChange}
                    required
                    disabled={bookingLoading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <Phone size={16} className="me-2" />
                    Phone
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="customer_phone"
                    value={bookingData.customer_phone}
                    onChange={handleBookingChange}
                    required
                    disabled={bookingLoading}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <Users size={16} className="me-2" />
                    Number of Persons
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="number_of_persons"
                    value={bookingData.number_of_persons}
                    onChange={handleBookingChange}
                    min="1"
                    max={packageData.max_persons || 10}
                    required
                    disabled={bookingLoading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>
                <Calendar size={16} className="me-2" />
                Travel Date
              </Form.Label>
              <Form.Control
                type="date"
                name="travel_date"
                value={bookingData.travel_date}
                onChange={handleBookingChange}
                min={new Date().toISOString().split('T')[0]}
                required
                disabled={bookingLoading}
              />
            </Form.Group>

            <div className="bg-light p-3 rounded mb-3">
              <div className="d-flex justify-content-between">
                <span>Package Price:</span>
                <span>₹{packageData.price.toLocaleString()} × {bookingData.number_of_persons}</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total Amount:</strong>
                <strong className="text-primary">₹{getTotalAmount().toLocaleString()}</strong>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <Button
                variant="secondary"
                onClick={() => setShowBookingModal(false)}
                className="me-2"
                disabled={bookingLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={bookingLoading || !customerDetails}
              >
                {bookingLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Booking...
                  </>
                ) : (
                  'Confirm Booking'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default PackageDetails;
