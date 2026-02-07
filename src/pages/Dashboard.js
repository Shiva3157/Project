import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { packageAPI, hotelAPI, customerAPI } from '../services/api';
import { 
  User, 
  Package, 
  Hotel, 
  MapPin, 
  Calendar, 
  CreditCard,
  Settings,
  Plus,
  Eye,
  Edit
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    packageBookings: 0,
    hotelBookings: 0,
    totalSpent: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [customerDetails, setCustomerDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [packageBookingsRes, hotelBookingsRes, customerRes] = await Promise.all([
          packageAPI.getMyBookings(),
          hotelAPI.getMyBookings(),
          customerAPI.get().catch(() => ({ data: { data: { customer: null } } }))
        ]);

        const packageBookings = packageBookingsRes.data.data.bookings;
        const hotelBookings = hotelBookingsRes.data.data.bookings;
        
        // Calculate stats
        const totalPackageSpent = packageBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
        const totalHotelSpent = hotelBookings.reduce((sum, booking) => sum + parseFloat(booking.total_amount), 0);
        
        setStats({
          packageBookings: packageBookings.length,
          hotelBookings: hotelBookings.length,
          totalSpent: totalPackageSpent + totalHotelSpent
        });

        // Get recent bookings (last 5)
        const allBookings = [
          ...packageBookings.map(b => ({ ...b, type: 'package' })),
          ...hotelBookings.map(b => ({ ...b, type: 'hotel' }))
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5);
        
        setRecentBookings(allBookings);
        setCustomerDetails(customerRes.data.data.customer);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      confirmed: 'status-confirmed',
      cancelled: 'status-cancelled',
      completed: 'status-completed'
    };
    
    return (
      <span className={`booking-status ${statusClasses[status] || 'status-pending'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
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
      {/* Welcome Section */}
      <Row className="mb-4">
        <Col>
          <Card className="dashboard-card">
            <Card.Body className="text-center py-4">
              <h2 className="mb-3">Welcome back, {user?.name}!</h2>
              <p className="lead mb-0">Manage your travel bookings and explore new destinations</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stats Cards */}
      <Row className="mb-4">
        <Col md={4} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <Package size={40} className="text-primary me-3" />
              <div>
                <h3 className="mb-1">{stats.packageBookings}</h3>
                <p className="text-muted mb-0">Package Bookings</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <Hotel size={40} className="text-primary me-3" />
              <div>
                <h3 className="mb-1">{stats.hotelBookings}</h3>
                <p className="text-muted mb-0">Hotel Bookings</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4} className="mb-3">
          <Card className="stats-card h-100">
            <Card.Body className="d-flex align-items-center">
              <CreditCard size={40} className="text-primary me-3" />
              <div>
                <h3 className="mb-1">₹{stats.totalSpent.toLocaleString()}</h3>
                <p className="text-muted mb-0">Total Spent</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Quick Actions */}
        <Col lg={4} className="mb-4">
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                {!customerDetails ? (
                  <Button as={Link} to="/customer-details" variant="primary">
                    <Plus size={16} className="me-2" />
                    Add Personal Details
                  </Button>
                ) : (
                  <Button as={Link} to="/customer-details" variant="outline-primary">
                    <Edit size={16} className="me-2" />
                    Update Personal Details
                  </Button>
                )}
                
                <Button as={Link} to="/packages" variant="outline-primary">
                  <Package size={16} className="me-2" />
                  Browse Packages
                </Button>
                
                <Button as={Link} to="/hotels" variant="outline-primary">
                  <Hotel size={16} className="me-2" />
                  Find Hotels
                </Button>
                
                <Button as={Link} to="/destinations" variant="outline-primary">
                  <MapPin size={16} className="me-2" />
                  Explore Destinations
                </Button>
                
                <Button as={Link} to="/my-bookings" variant="outline-secondary">
                  <Eye size={16} className="me-2" />
                  View All Bookings
                </Button>
                
                <Button as={Link} to="/profile" variant="outline-secondary">
                  <Settings size={16} className="me-2" />
                  Account Settings
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Customer Details Card */}
          {customerDetails && (
            <Card className="mt-3">
              <Card.Header>
                <h5 className="mb-0">Personal Details</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-2">
                  <strong>Name:</strong> {customerDetails.name}
                </div>
                <div className="mb-2">
                  <strong>Email:</strong> {customerDetails.email}
                </div>
                <div className="mb-2">
                  <strong>Phone:</strong> {customerDetails.phone}
                </div>
                <div className="mb-2">
                  <strong>Country:</strong> {customerDetails.country}
                </div>
                <Button as={Link} to="/customer-details" variant="outline-primary" size="sm">
                  <Edit size={14} className="me-1" />
                  Edit Details
                </Button>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* Recent Bookings */}
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Bookings</h5>
              <Button as={Link} to="/my-bookings" variant="outline-primary" size="sm">
                View All
              </Button>
            </Card.Header>
            <Card.Body>
              {recentBookings.length === 0 ? (
                <div className="text-center py-4">
                  <Package size={48} className="text-muted mb-3" />
                  <h6 className="text-muted">No bookings yet</h6>
                  <p className="text-muted">Start exploring our packages and hotels!</p>
                  <Button as={Link} to="/packages" variant="primary">
                    Browse Packages
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Details</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking, index) => (
                        <tr key={index}>
                          <td>
                            {booking.type === 'package' ? (
                              <Package size={16} className="text-primary me-1" />
                            ) : (
                              <Hotel size={16} className="text-primary me-1" />
                            )}
                            {booking.type === 'package' ? 'Package' : 'Hotel'}
                          </td>
                          <td>
                            <div>
                              <strong>
                                {booking.type === 'package' 
                                  ? booking.package_name 
                                  : booking.hotel_name}
                              </strong>
                              <br />
                              <small className="text-muted">
                                {booking.type === 'package' 
                                  ? booking.destination 
                                  : booking.location}
                              </small>
                            </div>
                          </td>
                          <td>
                            <Calendar size={14} className="me-1" />
                            {booking.type === 'package' 
                              ? new Date(booking.travel_date).toLocaleDateString()
                              : new Date(booking.check_in_date).toLocaleDateString()}
                          </td>
                          <td>
                            <strong>₹{parseFloat(booking.total_amount).toLocaleString()}</strong>
                          </td>
                          <td>
                            {getStatusBadge(booking.status)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
