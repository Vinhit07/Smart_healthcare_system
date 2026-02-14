import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Activity, Mail, Lock, User } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { authService } from '../../services';
import LoadingSpinner from '../../components/LoadingSpinner';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(['PATIENT', 'DOCTOR']),
    specialization: z.string().optional(),
    experience: z.number().optional(),
    location: z.string().optional(),
});

const RegisterPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            role: 'PATIENT',
        },
    });

    const selectedRole = watch('role');

    const onSubmit = async (data) => {
        setIsLoading(true);
        try {
            const response = await authService.register(data);
            login(response.user, response.token);
            toast.success('Registration successful!');
            navigate(getRoleDashboard(response.user.role));
        } catch (error) {
            toast.error(error.response?.data?.error || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const getRoleDashboard = (role) => {
        switch (role) {
            case 'PATIENT':
                return '/patient/dashboard';
            case 'DOCTOR':
                return '/doctor/dashboard';
            default:
                return '/';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-teal-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="bg-indigo-600 p-3 rounded-2xl">
                            <Activity className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900">Create Account</h1>
                    <p className="text-slate-600 mt-2">Join Smart Healthcare today</p>
                </div>

                <div className="card">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="label">
                                <User className="h-4 w-4 inline mr-2" />
                                Full Name
                            </label>
                            <input type="text" {...register('name')} className="input" placeholder="John Doe" />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                        </div>

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

                        {/* Role Selection */}
                        <div>
                            <label className="label">I am a</label>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center justify-center p-4 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-indigo-600 transition">
                                    <input type="radio" {...register('role')} value="PATIENT" className="mr-3" />
                                    <span className="font-medium">Patient</span>
                                </label>
                                <label className="flex items-center justify-center p-4 border-2 border-slate-300 rounded-lg cursor-pointer hover:border-indigo-600 transition">
                                    <input type="radio" {...register('role')} value="DOCTOR" className="mr-3" />
                                    <span className="font-medium">Doctor</span>
                                </label>
                            </div>
                        </div>

                        {/* Doctor-specific fields */}
                        {selectedRole === 'DOCTOR' && (
                            <>
                                <div>
                                    <label className="label">Specialization</label>
                                    <input
                                        type="text"
                                        {...register('specialization')}
                                        className="input"
                                        placeholder="e.g., Cardiology"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label">Experience (years)</label>
                                        <input
                                            type="number"
                                            {...register('experience', { valueAsNumber: true })}
                                            className="input"
                                            placeholder="10"
                                        />
                                    </div>
                                    <div>
                                        <label className="label">Location</label>
                                        <input
                                            type="text"
                                            {...register('location')}
                                            className="input"
                                            placeholder="City"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <button type="submit" disabled={isLoading} className="btn-primary w-full mt-6">
                            {isLoading ? <LoadingSpinner size="sm" /> : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-slate-600">
                            Already have an account?{' '}
                            <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
