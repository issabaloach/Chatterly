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

const { Text, Title } = Typography;

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

  // Fetch users (for demo, just current user)
  useEffect(() => {
    setUsers([{ id: user?.id, name: user?.username, avatar: user?.username?.[0]?.toUpperCase() || "U", status: "online", lastSeen: "Just now" }]);
    setSelectedUser({ id: user?.id, name: user?.username, avatar: user?.username?.[0]?.toUpperCase() || "U", status: "online", lastSeen: "Just now" });
  }, [user]);

  // Fetch messages from backend
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get("/chat/messages");
        setMessages(res.data);
      } catch (err) {
        message.error("Failed to load messages");
      }
    };
    fetchMessages();
  }, []);

  // Setup socket.io connection
  useEffect(() => {
    if (!token) return;
    const s = io("/", {
      auth: { token },
      transports: ["websocket"]
    });
    setSocket(s);
    s.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => s.disconnect();
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

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    const msgData = {
      sender: user.username,
      content: newMsg,
      createdAt: new Date(),
    };
    try {
      // Save to backend
      await api.post("/chat/messages", { content: newMsg });
      // Emit to socket
      socket.emit("sendMessage", msgData);
      setMessages((prev) => [...prev, msgData]);
      setNewMsg("");
    } catch (err) {
      message.error("Failed to send message");
    }
  };

  const filteredUsers = users.filter(u => u.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const groupedMessages = messages.reduce((groups, message) => {
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
    },
    {
      key: '2',
      label: 'Settings',
      icon: <SettingOutlined />,
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
        <Title level={4} className="m-0 text-blue-600">Chatterly</Title>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar className="cursor-pointer bg-blue-500">{user?.username?.[0]?.toUpperCase() || "U"}</Avatar>
        </Dropdown>
        <Button className="md:hidden ml-2" type="text" icon={<CloseOutlined />} onClick={() => setSidebarOpen(false)} />
      </header>
      <div className="p-3">
        <Input
          placeholder="Search conversations..."
          prefix={<span className="text-gray-400">🔍</span>}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="rounded-full bg-gray-100 border-none hover:bg-gray-200 transition"
        />
      </div>
      <Divider className="my-1" />
      <ul className="flex-1 overflow-y-auto px-2 py-1">
        {filteredUsers.length > 0 ? filteredUsers.map((u) => (
          <li
            key={u.id}
            onClick={() => setSelectedUser(u)}
            className={`flex items-center p-3 mb-1 rounded-lg cursor-pointer transition ${selectedUser?.id === u.id ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"}`}
          >
            <Badge dot status={u.status === "online" ? "success" : "default"} offset={[-2, 32]}>
              <Avatar className="mr-3 flex items-center justify-center bg-blue-500" size="large">
                {u.avatar}
              </Avatar>
            </Badge>
            <div className="flex-1 min-w-0">
              <Text strong className="block text-sm">{u.name}</Text>
              <Text className="text-xs text-gray-500 truncate block">{u.lastSeen}</Text>
            </div>
          </li>
        )) : (
          <Empty description="No conversations found" image={Empty.PRESENTED_IMAGE_SIMPLE} className="mt-10" />
        )}
      </ul>
    </>
  );

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-80 lg:w-96 bg-white border-r border-gray-200 flex-col">
        {sidebarContent}
      </aside>
      <Drawer
        placement="left"
        closable={false}
        onClose={() => setSidebarOpen(false)}
        open={sidebarOpen}
        width="80%"
        bodyStyle={{ padding: 0 }}
        contentWrapperStyle={{ maxWidth: "320px" }}
      >
        <div className="h-full flex flex-col">
          {sidebarContent}
        </div>
      </Drawer>
      {/* Chat Window */}
      <main className="flex-1 flex flex-col w-full h-full">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button className="mr-3 md:hidden" type="text" icon={<MenuOutlined />} onClick={() => setSidebarOpen(true)} />
            <Badge dot status={selectedUser?.status === "online" ? "success" : "default"} offset={[-2, 32]}>
              <Avatar className="bg-blue-500">{selectedUser?.avatar}</Avatar>
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
        <section ref={chatContainerRef} className="flex-1 p-3 sm:p-4 overflow-y-auto">
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <div key={date} className="space-y-2 sm:space-y-3 mb-4">
              <div className="flex justify-center">
                <Text className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {date === new Date().toLocaleDateString() ? 'Today' : date}
                </Text>
              </div>
              {msgs.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.sender === user?.username ? "justify-end" : "justify-start"}`}>
                  {msg.sender !== user?.username && (
                    <Avatar size="small" className="mr-2 mt-1 bg-blue-500 hidden sm:block">{selectedUser?.avatar}</Avatar>
                  )}
                  <div className={`max-w-xs sm:max-w-sm md:max-w-md p-2 sm:p-3 rounded-xl text-sm shadow ${msg.sender === user?.username ? "bg-blue-500 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"}`} style={{ wordBreak: "break-word" }}>
                    <p className="whitespace-pre-wrap">{msg.content || msg.text}</p>
                    <div className="text-xs mt-1 opacity-70 text-right">
                      {new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <div ref={bottomRef}></div>
        </section>
        <form onSubmit={sendMessage} className="bg-white border-t px-2 sm:px-4 py-2 sm:py-3 flex items-center gap-1 sm:gap-2">
          <Tooltip title="Attach file"><Button type="text" icon={<PaperClipOutlined />} shape="circle" className="hidden sm:flex" /></Tooltip>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Type your message..."
            className="flex-1 rounded-full border-gray-200"
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            suffix={<Tooltip title="Emoji"><SmileOutlined className="cursor-pointer text-gray-400 hover:text-blue-500" /></Tooltip>}
            onPressEnter={(e) => {
              if (!e.shiftKey) sendMessage(e);
            }}
          />
          <Button type="primary" shape="circle" icon={<SendOutlined />} onClick={sendMessage} className="bg-blue-500 hover:bg-blue-600" />
        </form>
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
