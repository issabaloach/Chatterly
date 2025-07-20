import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Drawer, Typography, Dropdown } from 'antd';
import { MenuOutlined, LogoutOutlined, UserOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  const { user, logout, token } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = token
    ? [
        {
          key: 'user',
          label: (
            <span>
              <Avatar style={{ backgroundColor: '#1677ff', marginRight: 8 }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </Avatar>
              {user?.username}
            </span>
          ),
          children: [
            {
              key: 'profile',
              label: 'Profile',
              onClick: () => navigate('/profile'),
            },
            {
              key: 'settings',
              label: 'Settings',
              onClick: () => navigate('/settings'),
            },
            {
              type: 'divider',
            },
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: <span onClick={logout}>Logout</span>,
            },
          ],
        },
      ]
    : [
        {
          key: 'login',
          icon: <LoginOutlined />,
          label: <Link to="/login">Login</Link>,
        },
        {
          key: 'register',
          icon: <UserOutlined />,
          label: <Link to="/register">Register</Link>,
        },
      ];

  return (
  <>
  
  </>
  );
};

export default Header; 