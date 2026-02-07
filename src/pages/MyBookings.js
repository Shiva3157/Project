import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs, Badge, Modal } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { packageAPI, hotelAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Package, 
  Hotel, 
  Calendar, 
  MapPin, 
  Users, 
  CreditCard, 
  Eye, 
  X,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

const MyBookings = () => {
  const [activeTab, setActiveTab] = useState('packages');
  const [packageBookings, setPackageBookings] = useState([]);
  const [hotelBookings, setHotelBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch package bookings
      const packagesRes = await packageAPI.getMyBookings();
      setPackageBookings(packagesRes.data.data.bookings);
      
      // Try to fetch hotel bookings, but don't fail if hotels aren't implemented
      try {
        const hotelsRes = await hotelAPI.getMyBookings();
        setHotelBookings(hotelsRes.data.data.bookings);
      } catch (hotelError) {
        console.log('Hotel bookings not available:', hotelError.message);
        setHotelBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'warning', icon: Clock, text: 'Pending' },
      confirmed: { bg: 'success', icon: CheckCircle, text: 'Confirmed' },
      cancelled: { bg: 'danger', icon: XCircle, text: 'Cancelled' },
      completed: { bg: 'info', icon: CheckCircle, text: 'Completed' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge bg={config.bg} className="d-flex align-items-center">
        <IconComponent size={14} className="me-1" />
        {config.text}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (paymentStatus) => {
    const statusConfig = {
      pending: { bg: 'warning', text: 'Payment Pending' },
      paid: { bg: 'success', text: 'Paid' },
      refunded: { bg: 'info', text: 'Refunded' }
    };
    
    const config = statusConfig[paymentStatus] || statusConfig.pending;
    
    return (
      <Badge bg={config.bg}>
        {config.text}
      </Badge>
    );
  };

  const handleCancelBooking = (booking, type) => {
    setSelectedBooking({ ...booking, type });
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;

    setCancelLoading(true);
    try {
      if (selectedBooking.type === 'package') {
        await packageAPI.cancelBooking(selectedBooking.booking_id);
      } else {
        await hotelAPI.cancelBooking(selectedBooking.id);
      }
      
      toast.success('Booking cancelled successfully');
      setShowCancelModal(false);
      setSelectedBooking(null);
      fetchBookings(); // Refresh bookings
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel booking';
      toast.error(errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  const canCancelBooking = (booking) => {
    return booking.status === 'pending' || booking.status === 'confirmed';
  };

  const renderPackageBookings = () => {
    if (packageBookings.length === 0) {
      return (
        <Card className="text-center py-5">
          <Card.Body>
            <Package size={64} className="text-muted mb-3" />
            <h5>No Package Bookings</h5>
            <p className="text-muted">You haven't booked any travel packages yet.</p>
            <Button as={Link} to="/packages" variant="primary">
              Browse Packages
            </Button>
          </Card.Body>
        </Card>
      );
    }

    return (
      <Row>
        {packageBookings.map((booking) => (
          <Col lg={6} key={booking.booking_id} className="mb-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <Package size={16} className="me-2" />
                  {booking.package_name}
                </h6>
                {getStatusBadge(booking.status)}
              </Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <MapPin size={16} className="text-muted me-1" />
                  <span>{booking.destination}</span>
                </div>
                
                <div className="mb-2">
                  <Calendar size={16} className="text-muted me-1" />
                  <span>Travel Date: {new Date(booking.travel_date).toLocaleDateString()}</span>
                </div>
                
                <div className="mb-2">
                  <Users size={16} className="text-muted me-1" />
                  <span>{booking.seats_booked} person{booking.seats_booked > 1 ? 's' : ''}</span>
                </div>
                
                <div className="mb-3">
                  <CreditCard size={16} className="text-muted me-1" />
                  <span className="fw-bold">₹{parseFloat(booking.total_amount).toLocaleString()}</span>
                </div>
                
                <div className="d-flex gap-2">
                  <Button 
                    as={Link} 
                    to={`/packages/${booking.package_id}`} 
                    variant="outline-primary" 
                    size="sm"
                  >
                    <Eye size={14} className="me-1" />
                    View Package
                  </Button>
                  
                  {canCancelBooking(booking) && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleCancelBooking(booking, 'package')}
                    >
                      <X size={14} className="me-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </Card.Body>
              <Card.Footer className="text-muted small">
                Booked on: {new Date(booking.created_at).toLocaleDateString()}
              </Card.Footer>
            </Card>
          </Col>
        ))}}
      </Row>
    );
  };

  const renderHotelBookings = () => {
    if (hotelBookings.length === 0) {
      return (
        <Card className="text-center py-5">
          <Card.Body>
            <Hotel size={64} className="text-muted mb-3" />
            <h5>No Hotel Bookings</h5>
            <p className="text-muted">You haven't booked any hotels yet.</p>
            <Button as={Link} to="/hotels" variant="primary">
              Browse Hotels
            </Button>
          </Card.Body>
        </Card>
      );
    }

    return (
      <Row>
        {hotelBookings.map((booking) => (
          <Col lg={6} key={booking.id} className="mb-4">
            <Card className="h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">
                  <Hotel size={16} className="me-2" />
                  {booking.hotel_name}
                </h6>
                {getStatusBadge(booking.status)}
              </Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <MapPin size={16} className="text-muted me-1" />
                  <span>{booking.location}</span>
                </div>
                
                <div className="mb-2">
                  <Calendar size={16} className="text-muted me-1" />
                  <span>
                    {new Date(booking.check_in_date).toLocaleDateString()} - {' '}
                    {new Date(booking.check_out_date).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="mb-2">
                  <Hotel size={16} className="text-muted me-1" />
                  <span>{booking.number_of_rooms} room{booking.number_of_rooms > 1 ? 's' : ''}</span>
                  <span className="ms-2">
                    <Users size={16} className="text-muted me-1" />
                    {booking.number_of_guests} guest{booking.number_of_guests > 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="mb-2">
                  <small className="text-muted">
                    {booking.nights} night{booking.nights > 1 ? 's' : ''} × ₹{booking.price_per_night?.toLocaleString() || 'N/A'} per night
                  </small>
                </div>
                
                <div className="mb-3">
                  <CreditCard size={16} className="text-muted me-1" />
                  <span className="fw-bold">₹{parseFloat(booking.total_amount).toLocaleString()}</span>
                  <div className="mt-1">
                    {getPaymentStatusBadge(booking.payment_status)}
                  </div>
                </div>
                
                <div className="d-flex gap-2">
                  <Button 
                    as={Link} 
                    to={`/hotels/${booking.hotel_id}`} 
                    variant="outline-primary" 
                    size="sm"
                  >
                    <Eye size={14} className="me-1" />
                    View Hotel
                  </Button>
                  
                  {canCancelBooking(booking) && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleCancelBooking(booking, 'hotel')}
                    >
                      <X size={14} className="me-1" />
                      Cancel
                    </Button>
                  )}
                </div>
              </Card.Body>
              <Card.Footer className="text-muted small">
                Booked on: {new Date(booking.created_at).toLocaleDateString()}
              </Card.Footer>
            </Card>
          </Col>
        ))}
      </Row>
    );
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
          <h1 className="display-6 mb-2">My Bookings</h1>
          <p className="text-muted">Manage your travel bookings and reservations</p>
        </Col>
      </Row>

      {/* Bookings Tabs */}
      <Row>
        <Col>
          <Card>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(tab) => setActiveTab(tab)}
                className="mb-4"
              >
                <Tab 
                  eventKey="packages" 
                  title={
                    <span>
                      <Package size={16} className="me-2" />
                      Package Bookings ({packageBookings.length})
                    </span>
                  }
                >
                  {renderPackageBookings()}
                </Tab>
                
                <Tab 
                  eventKey="hotels" 
                  title={
                    <span>
                      <Hotel size={16} className="me-2" />
                      Hotel Bookings ({hotelBookings.length})
                    </span>
                  }
                >
                  {renderHotelBookings()}
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cancel Booking Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <AlertCircle size={20} className="text-warning me-2" />
            Cancel Booking
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to cancel this booking?</p>
          {selectedBooking && (
            <div className="bg-light p-3 rounded">
              <h6>
                {selectedBooking.type === 'package' ? selectedBooking.package_name : selectedBooking.hotel_name}
              </h6>
              <p className="mb-1">
                <strong>Amount:</strong> ₹{parseFloat(selectedBooking.total_amount).toLocaleString()}
              </p>
              <p className="mb-0 text-muted small">
                Please note that cancellation policies may apply. Refunds will be processed according to our terms and conditions.
              </p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowCancelModal(false)}
            disabled={cancelLoading}
          >
            Keep Booking
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmCancelBooking}
            disabled={cancelLoading}
          >
            {cancelLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Cancelling...
              </>
            ) : (
              'Cancel Booking'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyBookings;
