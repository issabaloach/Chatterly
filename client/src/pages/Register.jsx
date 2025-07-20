import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Form, Input, Button, Typography, Divider, message } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined, AppleFilled, FacebookFilled } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

const Register = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      // Optionally fetch user info from backend
      message.success('Google signup successful!');
      navigate('/chat');
    }
  }, [location, navigate]);

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      await register(values.name, values.email, values.password);
      message.success("Registration successful! Please log in.");
    } catch (err) {
      message.error(err?.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className=" min-h-screen h-screen w-screen flex overflow-hidden flex-col items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Logo and Header */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-500 text-white text-2xl font-bold mb-2">
            C
          </div>
          <Title level={3} className="m-0">Create an Account</Title>
          <Text className="text-gray-500">Join Chatterly today</Text>
        </div>

        {/* SignUp Form */}
        <Form
          form={form}
          name="register"
          layout="vertical"
          onFinish={handleRegister}
          requiredMark={false}
          className="mb-4"
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: "Please enter your name" }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />} 
              placeholder="Full Name" 
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

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
            rules={[
              { required: true, message: "Please enter your password" },
              { min: 6, message: "Password must be at least 6 characters" }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Password" 
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />} 
              placeholder="Confirm Password" 
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large"
              loading={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 rounded-lg"
            >
              Sign Up
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
              onClick={handleGoogleSignup}
            >
              Sign up with Google
            </Button>
            {/* Other social buttons can be added here */}
          </div>
        </div>

        {/* Login Link */}
        <div className="text-center">
          <Text className="text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 font-medium hover:text-blue-600">
              Log In
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

export default Register;