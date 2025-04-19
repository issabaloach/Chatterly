import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import {
  Input, Button, Avatar, Badge, Typography, Divider, Empty, Tooltip, Drawer, Modal, Dropdown
} from "antd";
import {
  SendOutlined, MenuOutlined, PhoneOutlined, VideoCameraOutlined, SmileOutlined,
  PaperClipOutlined, CloseOutlined, LogoutOutlined, UserOutlined, SettingOutlined, QuestionCircleOutlined
} from "@ant-design/icons";

const { Text, Title } = Typography;
const socket = io(import.meta.env.VITE_API_BASE_URL); // Replace with your backend URL

const Chat = () => {
  const [users, setUsers] = useState([
    { id: 1, name: "Alice Smith", avatar: "A", status: "online", lastSeen: "Just now" },
    { id: 2, name: "Bob Johnson", avatar: "B", status: "online", lastSeen: "5m ago" },
    { id: 3, name: "Charlie Davis", avatar: "C", status: "offline", lastSeen: "2h ago" },
    { id: 4, name: "Diana Wilson", avatar: "D", status: "online", lastSeen: "Just now" },
    { id: 5, name: "Edward Brown", avatar: "E", status: "offline", lastSeen: "1d ago" },
  ]);

  const [selectedUser, setSelectedUser] = useState(users[0]);
  const [messages, setMessages] = useState([
    { sender: "Alice Smith", receiver: "You", text: "Hey there! How's it going?", timestamp: new Date(Date.now() - 60000 * 30) },
    { sender: "You", receiver: "Alice Smith", text: "I'm good! Just working on this new project.", timestamp: new Date(Date.now() - 60000 * 25) },
    { sender: "Alice Smith", receiver: "You", text: "That sounds exciting! What are you building?", timestamp: new Date(Date.now() - 60000 * 20) },
    { sender: "You", receiver: "Alice Smith", text: "A chat application with React, Ant Design, and Tailwind CSS!", timestamp: new Date(Date.now() - 60000 * 15) },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

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

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const msgData = {
      sender: "You",
      receiver: selectedUser.name,
      text: newMsg,
      timestamp: new Date(),
    };

    socket.emit("sendMessage", msgData);
    setMessages((prev) => [...prev, msgData]);
    setNewMsg("");
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
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
    {
      type: 'divider',
    },
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
          <Avatar className="cursor-pointer bg-blue-500">U</Avatar>
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
        {filteredUsers.length > 0 ? filteredUsers.map((user) => (
          <li
            key={user.id}
            onClick={() => setSelectedUser(user)}
            className={`flex items-center p-3 mb-1 rounded-lg cursor-pointer transition ${selectedUser.id === user.id ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100"}`}
          >
            <Badge dot status={user.status === "online" ? "success" : "default"} offset={[-2, 32]}>
              <Avatar className="mr-3 flex items-center justify-center bg-blue-500" size="large">
                {user.avatar}
              </Avatar>
            </Badge>
            <div className="flex-1 min-w-0">
              <Text strong className="block text-sm">{user.name}</Text>
              <Text className="text-xs text-gray-500 truncate block">{user.lastSeen}</Text>
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
            <Badge dot status={selectedUser.status === "online" ? "success" : "default"} offset={[-2, 32]}>
              <Avatar className="bg-blue-500">{selectedUser.avatar}</Avatar>
            </Badge>
            <div className="ml-3">
              <Text strong>{selectedUser.name}</Text>
              <Text className="text-xs text-gray-500 block">{selectedUser.status === "online" ? "Online" : selectedUser.lastSeen}</Text>
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
                <div key={idx} className={`flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}>
                  {msg.sender !== "You" && (
                    <Avatar size="small" className="mr-2 mt-1 bg-blue-500 hidden sm:block">{selectedUser.avatar}</Avatar>
                  )}
                  <div className={`max-w-xs sm:max-w-sm md:max-w-md p-2 sm:p-3 rounded-xl text-sm shadow ${msg.sender === "You" ? "bg-blue-500 text-white rounded-br-none" : "bg-white text-gray-800 rounded-bl-none"}`} style={{ wordBreak: "break-word" }}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    <div className="text-xs mt-1 opacity-70 text-right">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
        onOk={() => setLogoutModalVisible(false)}
        onCancel={() => setLogoutModalVisible(false)}
        okText="Yes"
        cancelText="No"
      >
        <p>This is just a demo. Add auth later!</p>
      </Modal>
    </div>
  );
};

export default Chat;
