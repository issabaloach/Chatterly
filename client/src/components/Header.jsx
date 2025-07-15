import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Avatar, Drawer, Typography, Dropdown } from 'antd';
import { MenuOutlined, LogoutOutlined, UserOutlined, LoginOutlined } from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

const { Header: AntHeader } = Layout;
const { Title } = Typography;

const Header = () => {
  const { user, logout, token } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

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
    <AntHeader style={{ background: '#fff', padding: 0, boxShadow: '0 2px 8px #f0f1f2', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="flex items-center justify-between px-4 h-full w-full">
        <Link to="/">
          <Title level={4} style={{ margin: 0, color: '#1677ff', letterSpacing: 1 }}>Chatterly</Title>
        </Link>
        <div className="hidden md:flex items-center">
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ borderBottom: 'none', background: 'transparent' }}
          />
        </div>
        <Button className="md:hidden" type="text" icon={<MenuOutlined />} onClick={() => setDrawerOpen(true)} />
        <Drawer
          title={<Title level={5} style={{ margin: 0 }}>Chatterly</Title>}
          placement="right"
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
        >
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={() => setDrawerOpen(false)}
          />
        </Drawer>
      </div>
    </AntHeader>
  );
};

export default Header; 