import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Bus, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuthStore } from '@/stores/authStore';
import { apiService as api } from '@/services/api';
import { toast } from "@/components/ui/sonner";

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!acceptTerms) {
      toast.error('Please accept the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const { success, message } = await api.register({
        email: formData.email,
        password: formData.password,
        name: formData.name
      });

      if (!success) {
        toast.error(message || 'Registration failed. Please try again.');
        return;
      }

      toast.success(`${message}!`);
      navigate('/login', { replace: true });

    } catch (error) {
      console.log('Registration error:', error.message , error.status);
      
      if (typeof error === 'object' && error !== null && 'message' in error) {
        
        const err = error;
        if (err.status === 409) {
          console.log('Account already exists or verification email resent');
          toast.error('An account with this email already exists or verification email resent.');
        } else if (err.status === 400) {
          toast.error(err.message || 'Invalid registration data.');
        } else if (err.status === 406) {
          toast.error('Registration not acceptable. Please check your details.');
        } else {
          toast.error(err.message || 'Registration failed. Please try again.');
        }
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-white">
      <div className="flex min-h-screen">
        {/* Left side - Info Panel (Hidden on mobile) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-50 flex-col justify-center">
          <div className="px-8 xl:px-12 py-8">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <div className="flex items-center mb-6">
                  <div className="bg-blue-600 p-3 rounded-2xl">
                    <Bus className="h-8 w-8 text-white" />
                  </div>
                  <div className="ml-4">
                    <h1 className="text-2xl xl:text-3xl font-bold text-gray-900">BusTracker</h1>
                    <p className="text-sm xl:text-base text-gray-600">Smart Transit Solutions</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-2xl xl:text-3xl font-bold text-gray-900 leading-tight">
                  Join thousands of smart commuters
                </h2>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-2 rounded-lg mt-1 flex-shrink-0">
                      <svg className="h-4 w-4 xl:h-5 xl:w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm xl:text-base">Real-time Tracking</h3>
                      <p className="text-gray-600 text-xs xl:text-sm">Get live updates on bus locations and arrival times</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-lg mt-1 flex-shrink-0">
                      <svg className="h-4 w-4 xl:h-5 xl:w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm xl:text-base">Route Planning</h3>
                      <p className="text-gray-600 text-xs xl:text-sm">Plan your journey with optimized routes and schedules</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="bg-purple-100 p-2 rounded-lg mt-1 flex-shrink-0">
                      <svg className="h-4 w-4 xl:h-5 xl:w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM9 7H4l5-5v5zm11 4h-6l2-2 2 2-2 2h2zm-11 0H3l2-2-2-2 2-2H3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm xl:text-base">Smart Notifications</h3>
                      <p className="text-gray-600 text-xs xl:text-sm">Receive alerts about delays, route changes, and more</p>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Trusted by <span className="font-semibold text-gray-900">10,000+</span> daily commuters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Form with improved mobile responsiveness */}
        <div className="w-full lg:w-1/2 flex flex-col min-h-screen">
          {/* Mobile header - Fixed at top */}
          <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-4 flex-shrink-0">
            <div className="flex items-center justify-center">
              <div className="bg-blue-600 p-2.5 rounded-xl">
                <Bus className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-bold text-gray-900">BusTracker</h2>
                <p className="text-gray-600 text-xs">Smart Transit Solutions</p>
              </div>
            </div>
          </div>

          {/* Form container - Scrollable content */}
          <div className="flex-1 flex items-center justify-center overflow-y-auto">
            <div className="w-full max-w-md mx-auto">
              {/* Form wrapper with better mobile spacing */}
              <div className="mx-4 lg:mx-0 lg:shadow-lg lg:border border-gray-200 lg:rounded-lg">
                {/* Desktop header */}
                <div className="text-center pb-4 px-4 pt-6 lg:pb-6 lg:px-6 lg:pt-8">
                  <div className="text-xl lg:text-2xl font-bold text-gray-900 hidden lg:block">
                    Create your account
                  </div>
                  <div className="text-lg font-bold text-gray-900 block lg:hidden mb-2">
                    Create your account
                  </div>
                  <p className="text-gray-600 text-sm lg:mt-2">
                    Start your smart commuting journey today
                  </p>
                </div>

                {/* Form fields */}
                <div className="px-4 pb-6 lg:px-6 lg:pb-8">
                  <div className="space-y-4 lg:space-y-5">
                    {/* Name field */}
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                        Full name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Enter your full name"
                          className="pl-10 h-11 lg:h-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Email field */}
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                        Email address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email"
                          className="pl-10 h-11 lg:h-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Password field */}
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={formData.password}
                          onChange={handleInputChange}
                          placeholder="Create a password"
                          className="pl-10 pr-10 h-11 lg:h-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm rounded-lg"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password field */}
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                        Confirm password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          autoComplete="new-password"
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          placeholder="Confirm your password"
                          className="pl-10 pr-10 h-11 lg:h-10 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500 text-sm rounded-lg"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Terms checkbox */}
                    <div className="flex items-start space-x-3 pt-2">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked ? true : false)}
                        className="mt-0.5 h-4 w-4 border-gray-300 rounded"
                      />
                      <Label htmlFor="terms" className="text-xs lg:text-sm text-gray-600 leading-4 cursor-pointer">
                        I agree to the{' '}
                        <Link to="/terms" className="text-blue-600 hover:text-blue-500 font-medium">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link to="/privacy" className="text-blue-600 hover:text-blue-500 font-medium">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>

                    {/* Submit button */}
                    <Button
                      type="submit"
                      onClick={handleSubmit}
                      className="w-full h-11 lg:h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm shadow-md hover:shadow-lg transition-all duration-200 rounded-lg mt-6"
                      disabled={loading || !formData.email || !formData.password || !formData.confirmPassword || !acceptTerms}
                    >
                      {loading ? 'Creating account...' : 'Create account'}
                    </Button>

                    {/* Login link */}
                    <div className="text-center pt-4 border-t border-gray-200 mt-6">
                      <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                          to="/login"
                          className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                        >
                          Sign in
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};