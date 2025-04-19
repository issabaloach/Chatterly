import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography, Divider, Checkbox, message } from "antd";
import { LockOutlined, MailOutlined, GoogleOutlined, AppleFilled, FacebookFilled } from "@ant-design/icons";
import API from "../utils/api";

const { Title, Text } = Typography;

const Login = ({ setIsAuthenticated }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const res = await API.post("/auth/login", values);
      // Save token
      localStorage.setItem("token", res.data.token);
      // Update auth state
      setIsAuthenticated(true);
      message.success("Login successful!");
      // Redirect to chat
      navigate("/");
    } catch (err) {
      message.error(err.response?.data?.message || "Login failed. Please try again.");
      console.error("Login failed", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen w-screen flex overflow-hidden flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white text-2xl font-bold mb-2">
            C
          </div>
          <Title level={3} className="m-0">Welcome to Chatterly</Title>
          <Text className="text-gray-500">Sign in to continue</Text>
        </div>

        {/* Login Form */}
        <Form
          form={form}
          name="login"
          layout="vertical"
          onFinish={handleLogin}
          requiredMark={false}
          className="mb-4"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Please enter your email" },
              { type: "email", message: "Please enter a valid email" }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />} 
              placeholder="Email" 
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Password" 
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <div className="flex justify-between items-center mb-4">
            <Checkbox>Remember me</Checkbox>
            <Link to="/forgot-password" className="text-blue-500 text-sm hover:text-blue-600">
              Forgot password?
            </Link>
          </div>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 rounded-lg"
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>

        {/* Social Login Options */}
        <div className="mb-4">
          <Divider className="text-gray-400">or continue with</Divider>
          
          <div className="flex justify-center gap-4 mt-4">
            <Button 
              icon={<GoogleOutlined />} 
              size="large" 
              className="flex items-center justify-center border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50"
            />
            <Button 
              icon={<FacebookFilled />} 
              size="large" 
              className="flex items-center justify-center border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50"
            />
            <Button 
              icon={<AppleFilled />} 
              size="large" 
              className="flex items-center justify-center border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50"
            />
          </div>
        </div>

        {/* Register Link */}
        <div className="text-center">
          <Text className="text-gray-500">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 font-medium hover:text-blue-600">
              Sign Up
            </Link>
          </Text>
        </div>
      </div>

      {/* Footer Text */}
      <Text className="text-gray-400 text-xs mt-8">
        © {new Date().getFullYear()} Chatterly. All rights reserved.
      </Text>
    </div>
  );
};

export default Login;