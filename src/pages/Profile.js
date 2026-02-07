import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Tab, Tabs } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { User, Mail, Lock, Save } from 'lucide-react';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileLoading(true);

    try {
      const response = await authAPI.updateProfile(profileData);
      const updatedUser = response.data.data.user;
      
      updateUser(updatedUser);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      setProfileError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setPasswordLoading(true);

    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      toast.success('Password changed successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setPasswordError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card>
            <Card.Header>
              <h4 className="mb-0">
                <User size={20} className="me-2" />
                Account Settings
              </h4>
            </Card.Header>
            <Card.Body>
              <Tabs
                activeKey={activeTab}
                onSelect={(tab) => setActiveTab(tab)}
                className="mb-4"
              >
                {/* Profile Information Tab */}
                <Tab eventKey="profile" title="Profile Information">
                  <Form onSubmit={handleProfileSubmit}>
                    {profileError && (
                      <Alert variant="danger" className="mb-3">
                        {profileError}
                      </Alert>
                    )}

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
                            value={profileData.name}
                            onChange={handleProfileChange}
                            placeholder="Enter your full name"
                            required
                            disabled={profileLoading}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <Mail size={16} className="me-2" />
                            Email Address
                          </Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleProfileChange}
                            placeholder="Enter your email address"
                            required
                            disabled={profileLoading}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Username</Form.Label>
                      <Form.Control
                        type="text"
                        value={user?.username || ''}
                        disabled
                        className="bg-light"
                      />
                      <Form.Text className="text-muted">
                        Username cannot be changed
                      </Form.Text>
                    </Form.Group>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="me-2" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </Form>
                </Tab>

                {/* Change Password Tab */}
                <Tab eventKey="password" title="Change Password">
                  <Form onSubmit={handlePasswordSubmit}>
                    {passwordError && (
                      <Alert variant="danger" className="mb-3">
                        {passwordError}
                      </Alert>
                    )}

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <Lock size={16} className="me-2" />
                        Current Password
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="Enter your current password"
                        required
                        disabled={passwordLoading}
                      />
                    </Form.Group>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <Lock size={16} className="me-2" />
                            New Password
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="Enter new password"
                            required
                            disabled={passwordLoading}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <Lock size={16} className="me-2" />
                            Confirm New Password
                          </Form.Label>
                          <Form.Control
                            type="password"
                            name="confirmPassword"
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="Confirm new password"
                            required
                            disabled={passwordLoading}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Button
                      type="submit"
                      variant="primary"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          Changing...
                        </>
                      ) : (
                        <>
                          <Lock size={16} className="me-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </Form>
                </Tab>

                {/* Account Information Tab */}
                <Tab eventKey="info" title="Account Information">
                  <div className="row">
                    <div className="col-md-6">
                      <h6>Account Details</h6>
                      <table className="table table-borderless">
                        <tbody>
                          <tr>
                            <td><strong>Username:</strong></td>
                            <td>{user?.username}</td>
                          </tr>
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td>{user?.email}</td>
                          </tr>
                          <tr>
                            <td><strong>Full Name:</strong></td>
                            <td>{user?.name}</td>
                          </tr>
                          <tr>
                            <td><strong>Member Since:</strong></td>
                            <td>
                              {user?.created_at 
                                ? new Date(user.created_at).toLocaleDateString()
                                : 'N/A'
                              }
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    
                    <div className="col-md-6">
                      <h6>Security</h6>
                      <div className="alert alert-info">
                        <h6 className="alert-heading">Account Security</h6>
                        <p className="mb-2">Your account is secured with:</p>
                        <ul className="mb-0">
                          <li>Password authentication</li>
                          <li>Secure session management</li>
                          <li>Data encryption</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Profile;
