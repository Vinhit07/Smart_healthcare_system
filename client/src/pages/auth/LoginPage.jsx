import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Activity, Mail, Lock } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { authService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

const LoginPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await authService.login(data);
            login(response.user, response.token);
            toast.success('Login successful!');

            // Navigate based on role
            switch (response.user.role) {
                case 'PATIENT':
                    navigate('/patient/dashboard');
                    break;
                case 'DOCTOR':
                    navigate('/doctor/dashboard');
                    break;
                case 'ADMIN':
                    navigate('/admin/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (error) {
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-indigo-600 p-3 rounded-2xl">
                            <Activity className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Smart Healthcare</h1>
                    <p className="text-slate-600 mt-2">Sign in to your account</p>
                </div>

                {/* Login Form */}
                <div className="card">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label className="label">
                                <Mail className="h-4 w-4 inline mr-2" />
                                Email Address
                            </label>
                            <input
                                type="email"
                                {...register('email')}
                                className="input"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                        </div>

                        {/* Password */}
                        <div>
                            <label className="label">
                                <Lock className="h-4 w-4 inline mr-2" />
                                Password
                            </label>
                            <input
                                type="password"
                                {...register('password')}
                                className="input"
                                placeholder="••••••••"
                            />
                            {errors.password && (
                                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>

                        {/* Submit Button */}
                        <button type="submit" disabled={isLoading} className="btn-primary w-full">
                            {isLoading ? <LoadingSpinner size="sm" /> : 'Sign In'}
                        </button>
                    </form>

                    {/* Register Link */}
                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</p>
                    <div className="text-xs text-blue-700 space-y-1">
                        <p>Patient: patient1@healthcare.com / Password@123</p>
                        <p>Doctor: dr.sarah@healthcare.com / Password@123</p>
                        <p>Admin: admin@healthcare.com / Password@123</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
