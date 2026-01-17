import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { login, clearError, selectAuthError } from '../store/slices/authSlice';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectAuthError);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    dispatch(clearError());
    try {
      await dispatch(login(data)).unwrap();
      toast.success('Welcome back! Login successful.');
      navigate(from, { replace: true });
    } catch {
      // Error handled by Redux
    }
  };

  return (
    <div className="layout-centered">
      <div className="auth">
        <Card className="auth__card">
          <CardHeader className="auth__header">
            <div className="auth__icon">
              <LogIn />
            </div>
            <CardTitle className="auth__title">Welcome back</CardTitle>
            <CardDescription className="auth__description">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="auth__content">
                <div className="auth__form">
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <FormField
                    control={form.control}
                    name="identifier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email or Username</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your email or username"
                            autoComplete="username"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>

              <CardFooter className="auth__footer">
                <div className="auth__form">
                  <Button
                    type="submit"
                    className="w-full"
                    loading={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? 'Logging in...' : 'Sign In'}
                  </Button>

                  <p className="auth__footer-text">
                    Don't have an account?{' '}
                    <Link to="/register" className="auth__footer-link">
                      Sign up
                    </Link>
                  </p>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
