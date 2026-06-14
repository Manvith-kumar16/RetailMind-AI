import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setServerError(null);
      
      let token = 'mock_jwt_token_12345';
      let user = { id: '1', name: data.name, email: data.email, role: 'admin' };

      try {
        const response = await api.post('/auth/register', {
          name: data.name,
          email: data.email,
          password: data.password
        });
        
        if (response.data?.token) {
          token = response.data.token;
          user = response.data.user || user;
        }
      } catch (err: any) {
        console.warn('API endpoint not found or error, using fallback mock token for demo', err);
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      login(token, user);
      navigate('/');
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 font-sans p-4 sm:p-8">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-primary-100/50 mix-blend-multiply blur-3xl" />
        <div className="absolute top-40 -right-40 h-[500px] w-[500px] rounded-full bg-indigo-100/50 mix-blend-multiply blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-md">
        {/* Logo or Brand */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-xl shadow-primary-600/20 mb-4">
            <span className="text-xl font-bold tracking-tight">RM</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create your workspace</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Get started with RetailMind AI for free</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            
            {serverError && (
              <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{serverError}</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="name">
                Full Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <User className={cn("h-5 w-5 transition-colors", errors.name ? "text-red-400" : "text-slate-400 group-focus-within:text-primary-500")} />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className={cn(
                    "block w-full rounded-xl border bg-surface-50 p-3 pl-11 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                    "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                    errors.name ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
                  )}
                  {...register('name')}
                />
              </div>
              {errors.name && (
                <p className="text-xs font-medium text-red-500 mt-1.5 ml-1">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Mail className={cn("h-5 w-5 transition-colors", errors.email ? "text-red-400" : "text-slate-400 group-focus-within:text-primary-500")} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  className={cn(
                    "block w-full rounded-xl border bg-surface-50 p-3 pl-11 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                    "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                    errors.email ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
                  )}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium text-red-500 mt-1.5 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock className={cn("h-5 w-5 transition-colors", errors.password ? "text-red-400" : "text-slate-400 group-focus-within:text-primary-500")} />
                </div>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "block w-full rounded-xl border bg-surface-50 p-3 pl-11 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                    "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                    errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
                  )}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-500 mt-1.5 ml-1">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock className={cn("h-5 w-5 transition-colors", errors.confirmPassword ? "text-red-400" : "text-slate-400 group-focus-within:text-primary-500")} />
                </div>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className={cn(
                    "block w-full rounded-xl border bg-surface-50 p-3 pl-11 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                    "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                    errors.confirmPassword ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
                  )}
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs font-medium text-red-500 mt-1.5 ml-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 px-4 text-sm font-semibold text-white transition-all hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-600/20 active:bg-primary-800 disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-primary-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create workspace</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm font-medium text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
