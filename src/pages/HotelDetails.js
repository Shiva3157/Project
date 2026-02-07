import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Modal, Form, Alert, Badge } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hotelAPI, customerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  Hotel, 
  MapPin, 
  Star, 
  Calendar, 
  Users, 
  CreditCard, 
  ArrowLeft,
  User,
  Phone,
  Mail,
  Wifi,
  Car,
  Coffee,
  Dumbbell
} from 'lucide-react';

const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [hotelData, setHotelData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [bookingData, setBookingData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    check_in_date: '',
    check_out_date: '',
    number_of_rooms: 1,
    number_of_guests: 1
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    fetchHotelDetails();
  }, [id]);

  useEffect(() => {
    if (isAuthenticated && showBookingModal) {
      fetchCustomerDetails();
    }
  }, [isAuthenticated, showBookingModal]);

  const fetchHotelDetails = async () => {
    try {
      const response = await hotelAPI.getById(id);
      setHotelData(response.data.data.hotel);
    } catch (error) {
      console.error('Error fetching hotel details:', error);
      toast.error('Failed to load hotel details');
      navigate('/hotels');
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
          customer_name: customer.name,
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
      toast.info('Please login to book this hotel');
      navigate('/login');
      return;
    }
    
    setShowBookingModal(true);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');

    // Validate dates
    const checkIn = new Date(bookingData.check_in_date);
    const checkOut = new Date(bookingData.check_out_date);
    
    if (checkOut <= checkIn) {
      setBookingError('Check-out date must be after check-in date');
      return;
    }

    setBookingLoading(true);

    try {
      const bookingPayload = {
        ...bookingData,
        hotel_id: parseInt(id),
        number_of_rooms: parseInt(bookingData.number_of_rooms),
        number_of_guests: parseInt(bookingData.number_of_guests)
      };

      await hotelAPI.book(bookingPayload);
      toast.success('Hotel booked successfully!');
      setShowBookingModal(false);
      navigate('/my-bookings');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to book hotel';
      setBookingError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const calculateNights = () => {
    if (!bookingData.check_in_date || !bookingData.check_out_date) return 0;
    const checkIn = new Date(bookingData.check_in_date);
    const checkOut = new Date(bookingData.check_out_date);
    const diffTime = Math.abs(checkOut - checkIn);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTotalAmount = () => {
    if (!hotelData || !bookingData.number_of_rooms) return 0;
    const nights = calculateNights();
    return hotelData.price_per_night * parseInt(bookingData.number_of_rooms) * nights;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={20} className="text-warning" fill="currentColor" />);
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={20} className="text-warning" />);
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={20} className="text-muted" />);
    }

    return stars;
  };

  const getAmenityIcon = (amenity) => {
    const amenityLower = amenity.toLowerCase();
    if (amenityLower.includes('wifi')) return <Wifi size={16} />;
    if (amenityLower.includes('parking') || amenityLower.includes('car')) return <Car size={16} />;
    if (amenityLower.includes('restaurant') || amenityLower.includes('dining')) return <Coffee size={16} />;
    if (amenityLower.includes('gym') || amenityLower.includes('fitness')) return <Dumbbell size={16} />;
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

  if (!hotelData) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <h4>Hotel not found</h4>
          <Button as={Link} to="/hotels" variant="primary">
            Back to Hotels
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
            onClick={() => navigate('/hotels')}
            className="mb-3"
          >
            <ArrowLeft size={16} className="me-2" />
            Back to Hotels
          </Button>
        </Col>
      </Row>

      <Row>
        {/* Hotel Image and Details */}
        <Col lg={8} className="mb-4">
          <Card>
            <div style={{ height: '400px', overflow: 'hidden' }}>
              <Card.Img
                src={hotelData.image_url || 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                style={{ height: '100%', objectFit: 'cover' }}
              />
            </div>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-3">
                <h1 className="mb-0">{hotelData.name}</h1>
                <div className="d-flex align-items-center">
                  {renderStars(hotelData.rating)}
                  <span className="ms-2 h5 mb-0">({hotelData.rating})</span>
                </div>
              </div>
              
              <div className="mb-3">
                <MapPin size={20} className="text-primary me-2" />
                <span className="h5">{hotelData.location}</span>
              </div>
              
              <p className="lead text-muted mb-4">
                {hotelData.description || 'Experience comfort and luxury at this beautiful hotel with world-class amenities and exceptional service.'}
              </p>

              {/* Hotel Details */}
              <Row className="mb-4">
                <Col md={4} className="mb-3">
                  <div className="d-flex align-items-center">
                    <CreditCard size={20} className="text-primary me-2" />
                    <div>
                      <strong>Price per Night</strong>
                      <div className="package-price">₹{hotelData.price_per_night.toLocaleString()}</div>
                    </div>
                  </div>
                </Col>
                
                <Col md={4} className="mb-3">
                  <div className="d-flex align-items-center">
                    <Star size={20} className="text-primary me-2" />
                    <div>
                      <strong>Rating</strong>
                      <div className="text-muted">{hotelData.rating} out of 5</div>
                    </div>
                  </div>
                </Col>
                
                <Col md={4} className="mb-3">
                  <div className="d-flex align-items-center">
                    <Hotel size={20} className="text-primary me-2" />
                    <div>
                      <strong>Availability</strong>
                      <div className={hotelData.available_rooms > 0 ? 'text-success' : 'text-danger'}>
                        {hotelData.available_rooms > 0 ? 
                          `${hotelData.available_rooms} rooms available` : 
                          'Fully booked'
                        }
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              {/* Amenities */}
              {hotelData.amenities && (
                <div className="mb-4">
                  <h5 className="mb-3">Amenities</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {hotelData.amenities.split(',').map((amenity, index) => (
                      <Badge key={index} bg="light" text="dark" className="d-flex align-items-center p-2">
                        {getAmenityIcon(amenity.trim())}
                        <span className="ms-2">{amenity.trim()}</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Booking Card */}
        <Col lg={4}>
          <Card className="sticky-top" style={{ top: '20px' }}>
            <Card.Header>
              <h5 className="mb-0">Book This Hotel</h5>
            </Card.Header>
            <Card.Body>
              <div className="text-center mb-3">
                <div className="package-price mb-2">₹{hotelData.price_per_night.toLocaleString()}</div>
                <small className="text-muted">per night</small>
              </div>
              
              <div className="mb-3">
                <strong>Availability:</strong>
                <div className={hotelData.available_rooms > 0 ? 'text-success' : 'text-danger'}>
                  {hotelData.available_rooms > 0 ? 
                    `${hotelData.available_rooms} rooms available` : 
                    'Fully booked'
                  }
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-100 mb-3"
                onClick={handleBookNow}
                disabled={hotelData.available_rooms === 0}
              >
                {hotelData.available_rooms === 0 ? 'Fully Booked' : 'Book Now'}
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
          <Modal.Title>Book Hotel: {hotelData.name}</Modal.Title>
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

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <Calendar size={16} className="me-2" />
                    Check-in Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="check_in_date"
                    value={bookingData.check_in_date}
                    onChange={handleBookingChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                    disabled={bookingLoading}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <Calendar size={16} className="me-2" />
                    Check-out Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="check_out_date"
                    value={bookingData.check_out_date}
                    onChange={handleBookingChange}
                    min={bookingData.check_in_date || new Date().toISOString().split('T')[0]}
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
                    <Hotel size={16} className="me-2" />
                    Number of Rooms
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="number_of_rooms"
                    value={bookingData.number_of_rooms}
                    onChange={handleBookingChange}
                    min="1"
                    max={hotelData.available_rooms || 10}
                    required
                    disabled={bookingLoading}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <Users size={16} className="me-2" />
                    Number of Guests
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="number_of_guests"
                    value={bookingData.number_of_guests}
                    onChange={handleBookingChange}
                    min="1"
                    max="20"
                    required
                    disabled={bookingLoading}
                  />
                </Form.Group>
              </Col>
            </Row>

            {calculateNights() > 0 && (
              <div className="bg-light p-3 rounded mb-3">
                <div className="d-flex justify-content-between">
                  <span>Price per night:</span>
                  <span>₹{hotelData.price_per_night.toLocaleString()}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Number of nights:</span>
                  <span>{calculateNights()}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Number of rooms:</span>
                  <span>{bookingData.number_of_rooms}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>Total Amount:</strong>
                  <strong className="text-primary">₹{getTotalAmount().toLocaleString()}</strong>
                </div>
              </div>
            )}

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
                disabled={bookingLoading || !customerDetails || calculateNights() === 0}
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

export default HotelDetails;
