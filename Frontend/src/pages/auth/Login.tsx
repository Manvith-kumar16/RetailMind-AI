import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/cn';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const from = location.state?.from?.pathname || '/';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setServerError(null);
      await login(data.email, data.password);
      navigate(from, { replace: true });
    } catch (error: any) {
      setServerError(error.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 font-sans p-4 sm:p-8">
      {/* Decorative background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary-100/50 mix-blend-multiply blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-100/50 mix-blend-multiply blur-3xl" />
      </div>

      <div className="z-10 w-full max-w-md">
        {/* Logo or Brand */}
        <div className="mb-8 flex flex-col items-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-xl shadow-primary-600/20 mb-4">
            <span className="text-xl font-bold tracking-tight">RM</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-500 font-medium">Log in to your RetailMind AI workspace</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100">
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            
            {serverError && (
              <div className="flex items-center gap-3 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p>{serverError}</p>
              </div>
            )}

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
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-700" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                  <Lock className={cn("h-5 w-5 transition-colors", errors.password ? "text-red-400" : "text-slate-400 group-focus-within:text-primary-500")} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "block w-full rounded-xl border bg-surface-50 p-3 pl-11 pr-11 text-sm text-slate-900 transition-all placeholder:text-slate-400",
                    "focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10",
                    errors.password ? "border-red-300 focus:border-red-500 focus:ring-red-500/10" : "border-slate-200"
                  )}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium text-red-500 mt-1.5 ml-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 py-3 px-4 text-sm font-semibold text-white transition-all hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-600/20 active:bg-primary-800 disabled:opacity-70 disabled:cursor-not-allowed mt-2 shadow-lg shadow-primary-600/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center text-sm font-medium text-slate-500 flex flex-col gap-2">
            <div>
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 hover:underline">
                Create workspace
              </Link>
            </div>
            <div>
              New here?{' '}
              <Link to="/onboarding" className="text-primary-600 hover:text-primary-700 hover:underline">
                Take a quick tour
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
