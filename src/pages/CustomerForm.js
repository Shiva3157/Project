import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { customerAPI } from '../services/api';
import { toast } from 'react-toastify';
import { User, CreditCard, Phone, Mail, MapPin, Save, ArrowLeft } from 'lucide-react';

const CustomerForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    id_type: 'Aadhar Card',
    id_number: '',
    name: '',
    gender: 'Male',
    country: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCustomerDetails = async () => {
      try {
        const response = await customerAPI.get();
        const customer = response.data.data.customer;
        
        if (customer) {
          setFormData({
            id_type: customer.id_type || 'Aadhar Card',
            id_number: customer.id_number || '',
            name: customer.full_name || '',
            gender: customer.gender || 'Male',
            country: customer.country || '',
            phone: customer.phone || '',
            email: customer.email || ''
          });
        }
      } catch (error) {
        // Customer details don't exist yet, this is fine for new users
        console.log('No existing customer details found');
      }
    };

    fetchCustomerDetails();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Map form data to backend expected format
      const profileData = {
        name: formData.name, // This will be mapped to full_name in backend
        phone: formData.phone,
        email: formData.email,
        id_type: formData.id_type,
        id_number: formData.id_number,
        gender: formData.gender,
        country: formData.country,
        address: '' // Set empty address for now
      };

      await customerAPI.update(profileData);
      toast.success('Customer details saved successfully!');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to save customer details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your customer details?')) {
      return;
    }

    setLoading(true);
    try {
      await customerAPI.delete();
      toast.success('Customer details deleted successfully!');
      navigate('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete customer details';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                <User size={20} className="me-2" />
                Add Personal Details
              </h4>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft size={16} className="me-1" />
                Back to Dashboard
              </Button>
            </Card.Header>
            <Card.Body>
              {error && (
                <Alert variant="danger" className="mb-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <CreditCard size={16} className="me-2" />
                        ID Type
                      </Form.Label>
                      <Form.Select
                        name="id_type"
                        value={formData.id_type}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      >
                        <option value="Aadhar Card">Aadhar Card</option>
                        <option value="Passport">Passport</option>
                        <option value="Driving Licence">Driving Licence</option>
                        <option value="Others">Others</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>ID Number</Form.Label>
                      <Form.Control
                        type="text"
                        name="id_number"
                        value={formData.id_number}
                        onChange={handleChange}
                        placeholder="Enter ID number"
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <User size={16} className="me-2" />
                        Full Name
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Gender</Form.Label>
                      <Form.Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <MapPin size={16} className="me-2" />
                        Country
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        placeholder="Enter your country"
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Phone size={16} className="me-2" />
                        Phone Number
                      </Form.Label>
                      <Form.Control
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        required
                        disabled={loading}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label>
                    <Mail size={16} className="me-2" />
                    Email Address
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email address"
                    required
                    disabled={loading}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between">
                  <div>
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={loading}
                      className="me-2"
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="me-2" />
                          Save Details
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => navigate('/dashboard')}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CustomerForm;
