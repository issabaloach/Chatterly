import React, { useState } from 'react';
import { Card, Avatar, Typography, Button, Modal, Form, Input, message, Upload } from 'antd';
import { EditOutlined, UserOutlined, UploadOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const { Title, Text } = Typography;

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, setUser } = useAuth(); // ✅ Ensure setUser is available from context
  const [editVisible, setEditVisible] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [form] = Form.useForm();
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return <div>Loading...</div>;

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return '';
    return avatarPath.startsWith('http') ? avatarPath : `http://localhost:5000${avatarPath}`;
  };

  const handleEdit = () => {
    setEditVisible(true);
    form.setFieldsValue({ username: user.username, email: user.email });
    setAvatarUrl(getAvatarUrl(user?.avatar));
  };

  const handleSave = async (values) => {
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', {
        username: values.username,
        avatar: avatarUrl.replace('http://localhost:5000', ''),
      });

      const updatedUser = {
        ...user,
        username: res.data.username,
        avatar: res.data.avatar,
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser); // ✅ update context
      message.success('Profile updated!');
      setEditVisible(false);
    } catch (err) {
      console.error(err);
      message.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (info) => {
    if (info.file.status === 'uploading') {
      setUploading(true);
      return;
    }

    if (info.file.status === 'done') {
      const url = info.file.response.url;
      const fullUrl = getAvatarUrl(url);
      setAvatarUrl(fullUrl);
      setUploading(false);

      const updatedUser = { ...user, avatar: url };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser); // ✅ update context
      message.success('Avatar updated!');
    }

    if (info.file.status === 'error') {
      setUploading(false);
      message.error('Failed to upload avatar');
    }
  };

  const customUpload = async ({ file, onSuccess, onError }) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onSuccess(res.data);
    } catch (err) {
      console.error('Upload error:', err);
      onError(err);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #d9fdd3 0%, #e7f0fd 100%)',
      }}
    >
      <Card
        style={{
          maxWidth: 420,
          borderRadius: 28,
          boxShadow: '0 4px 32px 0 rgba(60, 180, 80, 0.10)',
          border: 'none',
        }}
        bodyStyle={{ padding: 36 }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/chat')}
          style={{
            marginBottom: 16,
            background: '#e7f0fd',
            border: 'none',
            color: '#222',
            fontWeight: 500,
          }}
        >
          Back to Home
        </Button>

        <div className="flex flex-col items-center">
          <Avatar
            size={120}
            src={getAvatarUrl(user?.avatar)}
            icon={!getAvatarUrl(user?.avatar) && <UserOutlined />}
            style={{
              backgroundColor: avatarUrl ? '#fff' : '#25d366',
              fontSize: 48,
              border: '5px solid #e7f0fd',
              boxShadow: '0 2px 8px #b6e6c6',
              marginBottom: 18,
            }}
          >
            {!getAvatarUrl(user?.avatar) && (user?.username?.split(' ').map(w => w[0]).join('').toUpperCase() || 'U')}
          </Avatar>

          <Title level={2} style={{ fontWeight: 700, fontSize: 34, color: '#222', marginTop: 8 }}>
            {user?.username}
          </Title>
          <Text type="secondary" style={{ fontSize: 19, color: '#555' }}>
            {user?.email}
          </Text>

          <Button
            icon={<EditOutlined />}
            onClick={handleEdit}
            type="primary"
            size="large"
            style={{
              background: '#25d366',
              borderColor: '#25d366',
              width: 180,
              marginTop: 16,
              marginBottom: 12,
            }}
          >
            Edit Profile
          </Button>

          <Button
            icon={<LockOutlined />}
            onClick={() => setPasswordVisible(true)}
            size="large"
            style={{ width: 180 }}
          >
            Change Password
          </Button>
        </div>
      </Card>

      {/* Edit Modal */}
      <Modal
        title="Edit Profile"
        open={editVisible}
        onOk={form.submit}
        onCancel={() => setEditVisible(false)}
        okText="Save"
        confirmLoading={saving}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ username: user.username, email: user.email }}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: 'Please enter a username' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Avatar">
            <Upload
              name="avatar"
              showUploadList={false}
              customRequest={customUpload}
              onChange={handleAvatarChange}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />} loading={uploading}>
                Change Avatar
              </Button>
            </Upload>
            {avatarUrl && <Avatar size={64} src={avatarUrl} className="mt-2" />}
          </Form.Item>
        </Form>
      </Modal>

      {/* Password Modal */}
      <Modal
        title="Change Password"
        open={passwordVisible}
        onCancel={() => setPasswordVisible(false)}
        onOk={() => setPasswordVisible(false)}
        okText="Save"
      >
        <Form layout="vertical">
          <Form.Item label="Current Password">
            <Input.Password />
          </Form.Item>
          <Form.Item label="New Password">
            <Input.Password />
          </Form.Item>
          <Form.Item label="Confirm New Password">
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Profile;
