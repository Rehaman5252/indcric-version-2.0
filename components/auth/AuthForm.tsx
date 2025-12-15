'use client';

import React, { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod'; // ✅ FIX: Import z from 'zod' not 'z from zod'
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { useAuth } from '@/context/AuthProvider';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

// ✅ FIX: Added confirmPassword field and validation
const signupSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  phone: z.string().regex(/^\d{10}$/, { message: 'Please enter a valid 10-digit phone number.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
  confirmPassword: z.string().min(8, { message: 'Confirm password must be at least 8 characters.' }), // ✅ ADDED
  referralCode: z.string().optional(),
  terms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions to continue.',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // ✅ ADDED validation
});

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const GoogleIcon = (
  <svg
    className="mr-2 h-4 w-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 533.5 544.3"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fill="#4285F4"
      d="M533.5 278.4c0-18.3-1.5-36-4.6-53.1H272v100.7h147.2c-6.4 34.6-25.6 63.9-54.6 83.5v69.4h88.4c51.7-47.6 80.5-117.8 80.5-200.5z"
    />
    <path
      fill="#34A853"
      d="M272 544.3c73.7 0 135.6-24.3 180.8-66.1l-88.4-69.4c-24.6 16.5-56.1 26-92.4 26-71 0-131.2-47.9-152.8-112.3H28.4v70.6C73.2 486.6 166.2 544.3 272 544.3z"
    />
    <path
      fill="#FBBC05"
      d="M119.2 322.5c-11-32.6-11-67.9 0-100.5V151.4H28.4c-35.6 70.9-35.6 155.1 0 226z"
    />
    <path
      fill="#EA4335"
      d="M272 107.7c39.9-.6 78.3 14.5 107.5 42.7l80.1-80.1C407.4 24.5 344.7-.6 272 0 166.2 0 73.2 57.7 28.4 151.4l90.8 70.6C140.8 155.6 201 107.7 272 107.7z"
    />
  </svg>
);


function AuthFormComponent({ type }: { type: 'login' | 'signup' }) {
  const { registerWithEmail, loginWithEmail, signInWithGoogle, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast(); // ✅ FIX: Correct destructuring
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const formSchema = type === 'login' ? loginSchema : signupSchema;

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '', // ✅ ADDED
      referralCode: searchParams.get('ref') ?? '',
      terms: false,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const from = searchParams.get('from') ?? '/';

    let result = null;

    if (type === 'signup') {
      const { name, email, phone, password, referralCode } = values as z.infer<
        typeof signupSchema
      >;
      result = await registerWithEmail(name, email, phone, password, referralCode);

      if (result) {
        toast({
          title: 'Signup Successful!',
          description: 'A verification link has been sent to your email. Please verify to continue.',
        });
      }
    } else {
      const { email, password } = values as z.infer<typeof loginSchema>;
      result = await loginWithEmail(email, password);

      if (result) {
        router.replace(from);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const from = searchParams.get('from') ?? '/';
    const result = await signInWithGoogle();

    if (result) {
      router.replace(from);
    }
  };

  if (user) {
    const from = searchParams.get('from') ?? '/';
    router.replace(from);
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {type === 'login' ? 'Time to Bat Again!' : 'Join the Squad!'}
        </CardTitle>
        <CardDescription>
          {type === 'login'
            ? 'Welcome back, player! Log in to face the next challenge.'
            : 'Sign up to start your cricket journey and climb the leaderboard.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {type === 'signup' && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type === 'signup' && (
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="10-digit number" type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" {...field} />
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
                    <div className="relative">
                      <Input
                        placeholder="••••••••"
                        type={showPassword ? 'text' : 'password'}
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isSubmitting}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* ✅ FIX: Confirm Password Field for Signup */}
            {type === 'signup' && (
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="••••••••"
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...field}
                          className="pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          disabled={isSubmitting}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type === 'signup' && (
              <FormField
                control={form.control}
                name="referralCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referral Code (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter code from a friend" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {type === 'signup' && (
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I acknowledge this platform is for testing cricket knowledge only, and not for
                        entertainment, financial gain, or gambling. I accept the{' '}
                        <Button variant="link" asChild className="p-1 h-auto">
                          <Link href="/policies" target="_blank" rel="noopener noreferrer">
                            Terms & Conditions
                          </Link>
                        </Button>
                        .
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === 'login' ? 'Login' : 'Sign Up'}
            </Button>
          </form>
        </Form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
  variant="outline"
  className="w-full"
  onClick={handleGoogleSignIn}
  disabled={isSubmitting}
>
  {GoogleIcon}
  Google
</Button>

      </CardContent>

      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          {type === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <Button variant="link" asChild className="p-1">
            <Link
              href={
                type === 'login'
                  ? `/auth/signup?${searchParams.toString()}`
                  : `/auth/login?${searchParams.toString()}`
              }
            >
              {type === 'login' ? 'Sign Up' : 'Login'}
            </Link>
          </Button>
        </p>
      </CardFooter>
    </Card>
  );
}

export default function AuthForm(props: { type: 'login' | 'signup' }) {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="animate-spin h-8 w-8" />
        </div>
      }
    >
      <AuthFormComponent {...props} />
    </Suspense>
  );
}
