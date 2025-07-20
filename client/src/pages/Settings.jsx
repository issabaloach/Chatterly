import React, { useState } from 'react';
import { Card, Typography, Switch, Divider, List, Avatar, Button } from 'antd';
import { UserOutlined, BellOutlined, BulbOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const Settings = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #d9fdd3 0%, #e7f0fd 100%)',
        boxSizing: 'border-box',
      }}
    >
      <Card
        style={{
          maxWidth: 500,
          width: '100%',
          borderRadius: 28,
          boxShadow: '0 4px 32px 0 rgba(60, 180, 80, 0.10)',
          padding: 0,
          border: 'none',
        }}
        bodyStyle={{ padding: 36 }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/chat')}
          style={{ marginBottom: 16, background: '#e7f0fd', border: 'none', color: '#222', fontWeight: 500 }}
        >
          Back to Home
        </Button>
        <div className="flex flex-col items-center mb-6">
          <Avatar
            size={80}
            style={{
              backgroundColor: user?.avatar ? '#fff' : '#25d366',
              fontSize: 36,
              border: '4px solid #e7f0fd',
              boxShadow: '0 2px 8px #b6e6c6',
              marginBottom: 12,
            }}
            src={user?.avatar}
            icon={!user?.avatar && <UserOutlined />}
          >
            {!user?.avatar && (user?.username?.split(' ').map(w => w[0]).join('').toUpperCase() || 'U')}
          </Avatar>
          <Title level={3} className="mt-2 mb-0 text-center" style={{ fontWeight: 700, fontSize: 26, color: '#222' }}>
            {user?.username}
          </Title>
        </div>
        <Title level={2} className="mb-4" style={{ color: '#222', fontWeight: 700, fontSize: 30 }}>Settings</Title>
        <Divider orientation="left" style={{ color: '#25d366', fontWeight: 600 }}>Account</Divider>
        <List itemLayout="horizontal">
          <List.Item>
            <List.Item.Meta
              avatar={<Avatar style={{ backgroundColor: '#25d366' }} icon={<UserOutlined />} />}
              title={<Text style={{ fontSize: 18 }}>Profile</Text>}
              description={<Text type="secondary">Manage your profile info</Text>}
            />
          </List.Item>
        </List>
        <Divider orientation="left" style={{ color: '#25d366', fontWeight: 600 }}>Notifications</Divider>
        <List itemLayout="horizontal">
          <List.Item actions={[<Switch defaultChecked />]}>
            <List.Item.Meta
              avatar={<Avatar style={{ backgroundColor: '#25d366' }} icon={<BellOutlined />} />}
              title={<Text style={{ fontSize: 18 }}>Enable notifications</Text>}
            />
          </List.Item>
        </List>
        <Divider orientation="left" style={{ color: '#25d366', fontWeight: 600 }}>Theme</Divider>
        <List itemLayout="horizontal">
          <List.Item actions={[<Switch checked={darkMode} onChange={setDarkMode} />]}>
            <List.Item.Meta
              avatar={<Avatar style={{ backgroundColor: '#25d366' }} icon={<BulbOutlined />} />}
              title={<Text style={{ fontSize: 18 }}>Dark mode</Text>}
            />
          </List.Item>
        </List>
      </Card>
    </div>
  );
};

export default Settings; 