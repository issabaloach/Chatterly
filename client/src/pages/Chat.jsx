import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Input, Button, Avatar, Badge, Typography, Divider, Empty, Tooltip, Drawer, Modal, Dropdown, message
} from "antd";
import {
  SendOutlined, MenuOutlined, PhoneOutlined, VideoCameraOutlined, SmileOutlined,
  PaperClipOutlined, CloseOutlined, LogoutOutlined, UserOutlined, SettingOutlined, QuestionCircleOutlined
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { Picker } from 'emoji-mart';
import { useNavigate } from 'react-router-dom';
import { getAvatarUrl } from '../utils/avatar';

const { Text, Title } = Typography;

const chatBubbleStyle = (isSender) => ({
  fontSize: 17,
  padding: '14px 20px',
  borderRadius: 22,
  marginBottom: 10,
  maxWidth: '80vw',
  background: isSender ? '#d9fdd3' : '#fff',
  color: '#222',
  boxShadow: '0 2px 8px #e0e7ef',
  alignSelf: isSender ? 'flex-end' : 'flex-start',
  borderTopRightRadius: isSender ? 6 : 22,
  borderTopLeftRadius: isSender ? 22 : 6,
  border: isSender ? '1.5px solid #25d366' : '1.5px solid #e0e7ef',
  textAlign: 'left',
});

const sidebarItemStyle = (selected) => ({
  fontSize: 18,
  padding: '18px 14px',
  borderRadius: 14,
  marginBottom: 8,
  background: selected ? '#e2f7cb' : 'transparent',
  color: selected ? '#25d366' : '#222',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  fontWeight: selected ? 700 : 500,
  boxShadow: selected ? '0 2px 8px #d9fdd3' : 'none',
  border: selected ? '2px solid #25d366' : '2px solid transparent',
});

const Chat = () => {
  const { user, logout, token } = useAuth();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const fileInputRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const navigate = useNavigate();

  const commonEmojis = ['😀', '😂', '😍', '😎', '😭', '😡', '🤔', '👍', '👎', '❤️', '💔', '🎉', '🎂', '🎁', '��', '💯', '✨', '💪', '🙏'];

  // Fetch all users except current user
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users');
        setUsers(res.data);
        if (res.data.length > 0 && !selectedUser) setSelectedUser(res.data[0]);
      } catch (err) {
        message.error('Failed to load users');
      }
    };
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  // Fetch messages with selected user
  useEffect(() => {
    if (!selectedUser) return;
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/chat/messages?userId=${selectedUser._id}`);
        setMessages(res.data);
      } catch (err) {
        message.error('Failed to load messages');
      }
    };
    fetchMessages();
    // eslint-disable-next-line
  }, [selectedUser]);
  console.log('user:', user);
  // Setup socket.io connection
  useEffect(() => {
    if (!token) return;
    
    const socketUrl = 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 100,
    });
    
    setSocket(socket);
    
    socket.on("connect", () => {
      console.log("Connected to socket server");
    });
    
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      message.error("Failed to connect to chat server");
    });
    
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.disconnect();
  }, [token]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
    setSidebarOpen(false);
  }, [selectedUser]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // When sending a message, include receiver
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedUser) return;
    const msgData = {
      sender: user._id,
      receiver: selectedUser._id,
      content: newMsg,
      createdAt: new Date(),
    };
    try {
      await api.post('/chat/messages', { content: newMsg, receiver: selectedUser._id });
      socket.emit('sendMessage', msgData);
      setMessages((prev) => [...prev, msgData]);
      setNewMsg('');
    } catch (err) {
      message.error('Failed to send message');
    }
  };

  // Handle file attachment
  const handleAttachClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // TODO: Implement backend file upload endpoint
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/chat/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileUrl = res.data.url;
      const msgData = {
        sender: user.username,
        content: '',
        file: { name: file.name, url: fileUrl },
        createdAt: new Date(),
      };
      socket.emit('sendMessage', msgData);
    setMessages((prev) => [...prev, msgData]);
    } catch (err) {
      message.error('Failed to upload file');
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMsg(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  // Only show messages between current user and selected user
  const filteredMessages = messages.filter(
    m => (m.sender._id === user._id && m.receiver._id === selectedUser?._id) ||
         (m.sender._id === selectedUser?._id && m.receiver._id === user._id)
  );

  const groupedMessages = filteredMessages.reduce((groups, message) => {
    const date = new Date(message.createdAt || message.timestamp).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  const userMenuItems = [
    {
      key: '1',
      label: 'Profile',
      icon: <UserOutlined />,
      onClick: () => navigate('/profile'),
    },
    {
      key: '2',
      label: 'Settings',
      icon: <SettingOutlined />,
      onClick: () => navigate('/settings'),
    },
    {
      key: '3',
      label: 'Help',
      icon: <QuestionCircleOutlined />,
    },
    { type: 'divider' },
    {
      key: '4',
      label: 'Logout',
      icon: <LogoutOutlined />,
      onClick: () => setLogoutModalVisible(true),
    },
  ];

  const sidebarContent = (
    <>
      <header className="p-4 flex items-center justify-between border-b border-gray-100">
        <Title level={4} className="m-0 text-green-600" style={{ letterSpacing: 1, fontWeight: 700 }}>Chatterly</Title>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
        <Avatar className="cursor-pointer bg-green-500" style={{ backgroundColor: '#25d366', fontSize: 22 }} src={getAvatarUrl(user?.avatar) || undefined}>
  {!user?.avatar && (user?.username?.[0]?.toUpperCase() || 'U')}
</Avatar>

        </Dropdown>
      </header>
      <div className="p-3">
        <Input
          placeholder="Search conversations..."
          prefix={<span className="text-gray-400">🔍</span>}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-full bg-gray-100 border-none hover:bg-gray-200 transition text-base"
          style={{ fontSize: 17, padding: '10px 16px' }}
        />
      </div>
      <Divider className="my-1" />
      <ul className="flex-1 overflow-y-auto px-2 py-1">
        {filteredUsers.length > 0 ? filteredUsers.map((u) => (
          <li
            key={u.id}
            onClick={() => setSelectedUser(u)}
            style={sidebarItemStyle(selectedUser?.id === u.id)}
          >
            <Badge dot status={u.status === "online" ? "success" : "default"} offset={[-2, 32]}>
              <Avatar className="mr-3 flex items-center justify-center bg-green-500" size={54} style={{ fontSize: 24, backgroundColor: '#25d366' }} src={getAvatarUrl(u.avatar) || undefined}>
                {!u.avatar && (u.username?.[0]?.toUpperCase() || 'U')}
              </Avatar>
            </Badge>
            <div className="flex-1 min-w-0">
              <Text strong className="block text-lg">{u.name}</Text>
              <Text className="text-base text-gray-500 truncate block">{u.lastSeen}</Text>
            </div>
          </li>
        )) : (
          <Empty description="No conversations found" image={Empty.PRESENTED_IMAGE_SIMPLE} className="mt-10" />
        )}
      </ul>
    </>
  );

  return (
    <div
      style={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #e7f0fd 0%, #d9fdd3 100%)',
        display: 'flex',
        boxSizing: 'border-box',
      }}
    >
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-col" style={{ height: '100vh', boxSizing: 'border-box' }}>
        {sidebarContent}
      </aside>
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setSidebarOpen(false)}
        open={sidebarOpen}
        width="80%"
        styles={{
          body: { padding: 0 },
          wrapper: { maxWidth: "320px" }
        }}
      >
        <div className="h-full flex flex-col">
          {sidebarContent}
        </div>
      </Drawer>
      {/* Chat Window */}
      <main className="flex-1 flex flex-col w-full" style={{ height: '100vh', overflow: 'hidden', boxSizing: 'border-box' }}>
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between" style={{ flex: '0 0 auto', boxSizing: 'border-box' }}>
          <div className="flex items-center">
            <Button className="mr-3 md:hidden" type="text" icon={<MenuOutlined />} onClick={() => setSidebarOpen(true)} />
            <Badge dot status={selectedUser?.status === "online" ? "success" : "default"} offset={[-2, 32]}>
              <Avatar className="bg-blue-500" src={getAvatarUrl(selectedUser?.avatar) || undefined}>
                {!selectedUser?.avatar && (selectedUser?.username?.[0]?.toUpperCase() || 'U')}
              </Avatar>
            </Badge>
            <div className="ml-3">
              <Text strong>{selectedUser?.name}</Text>
              <Text className="text-xs text-gray-500 block">{selectedUser?.status === "online" ? "Online" : selectedUser?.lastSeen}</Text>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2">
            <Tooltip title="Call"><Button type="text" icon={<PhoneOutlined />} shape="circle" className="hidden sm:flex" /></Tooltip>
            <Tooltip title="Video call"><Button type="text" icon={<VideoCameraOutlined />} shape="circle" className="hidden sm:flex" /></Tooltip>
            <Tooltip title="Options">
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
                <Button type="text" icon={<MenuOutlined />} shape="circle" />
              </Dropdown>
            </Tooltip>
          </div>
        </header>
        <section
          ref={chatContainerRef}
          className="flex-1 p-3 sm:p-4"
          style={{
            flex: '1 1 0%',
            overflowY: 'auto',
            overflowX: 'hidden',
            minHeight: 0,
            maxHeight: 'none',
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box',
          }}
        >
          {Object.entries(
            filteredMessages.reduce((groups, message) => {
              const date = new Date(message.createdAt || message.timestamp).toLocaleDateString();
              if (!groups[date]) groups[date] = [];
              groups[date].push(message);
              return groups;
            }, {})
          ).map(([date, msgs]) => (
            <div key={date} className="space-y-2 sm:space-y-3 mb-4">
              <div className="flex justify-center">
                <Text className="bg-gray-200 text-gray-600 text-sm px-4 py-1 rounded-full">
                  {date === new Date().toLocaleDateString() ? 'Today' : date}
                </Text>
              </div>
              {msgs.map((msg, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === user?.username ? 'flex-end' : 'flex-start' }}>
                  <div style={chatBubbleStyle(msg.sender === user?.username)}>
                    {/* Wrap conditional rendering in a fragment to fix linter error */}
                    <>
                      {msg.file ? (
                        <a href={msg.file.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 17, color: '#1677ff', textDecoration: 'underline' }}>
                          {msg.file.name}
                        </a>
                      ) : (
                        <span style={{ fontSize: 17 }}>{msg.content || msg.text}</span>
                      )}
                    </>
                    <div style={{ fontSize: 13, opacity: 0.7, marginTop: 6, textAlign: 'right' }}>
                      {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={bottomRef}></div>
        </section>
        <form
          onSubmit={sendMessage}
          className="bg-white border-t px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-1 sm:gap-2"
          style={{ flex: '0 0 auto', boxSizing: 'border-box' }}
        >
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Tooltip title="Attach file">
            <Button
              type="text"
              icon={<PaperClipOutlined />}
              shape="circle"
              className="hidden sm:flex"
              size="large"
              onClick={handleAttachClick}
            />
          </Tooltip>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            className="flex-1 rounded-full border-gray-200 text-base"
            style={{ fontSize: 17, padding: '12px 16px' }}
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            suffix={
              <Tooltip title="Emoji">
                <SmileOutlined
                  className="cursor-pointer text-gray-400 hover:text-blue-500"
                  style={{ fontSize: 22 }}
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                />
              </Tooltip>
            }
            onPressEnter={(e) => {
              if (!e.shiftKey) sendMessage(e);
            }}
          />
          <Button type="primary" shape="circle" icon={<SendOutlined style={{ fontSize: 22 }} />} onClick={sendMessage} className="bg-blue-500 hover:bg-blue-600" size="large" />
        </form>
        {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: 100, right: 0, zIndex: 1000, background: 'white', border: '1px solid #ddd', borderRadius: 8, padding: 8, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                onClick={() => handleEmojiSelect(emoji)}
                style={{ fontSize: 20, background: 'none', border: 'none', cursor: 'pointer', padding: 4, borderRadius: 4 }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </main>
      <Modal
        title="Log Out"
        open={logoutModalVisible}
        onOk={logout}
        onCancel={() => setLogoutModalVisible(false)}
        okText="Yes"
        cancelText="No"
      >
        <p>Are you sure you want to log out?</p>
      </Modal>
    </div>
  );
};

export default Chat;
