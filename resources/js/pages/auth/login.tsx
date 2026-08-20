import { Head, Link, useForm } from '@inertiajs/react';
import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { FormEventHandler, useState } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm {
    [key: string]: string | boolean;
    email: string;
    password: string;
    remember: boolean;
}
interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

const inputClass =
    'h-13 rounded-xl border-white/20 bg-white/[0.055] px-4 text-base text-white shadow-none placeholder:text-slate-600 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:ring-offset-0';

export default function Login({ status, canResetPassword }: LoginProps) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({ email: '', password: '', remember: false });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('login'), { onFinish: () => reset('password') });
    };

    return (
        <AuthLayout title="Welcome back" description="Sign in to access your reminders and upcoming events.">
            <Head title="Sign in" />
            {status && <div className="mb-5 rounded-xl border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm text-blue-200">{status}</div>}
            <form className="space-y-5" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        Email address
                    </Label>
                    <Input
                        id="email"
                        className={inputClass}
                        type="email"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        placeholder="you@email.com"
                    />
                    <InputError message={errors.email} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="password" className="text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase">
                        Password
                    </Label>
                    <div className="relative">
                        <Input
                            id="password"
                            className={`${inputClass} pr-12`}
                            type={showPassword ? 'text' : 'password'}
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((visible) => !visible)}
                            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-white/5 hover:text-white"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                        </button>
                    </div>
                    <InputError message={errors.password} />
                </div>
                <div className="flex items-center justify-between gap-4">
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-400" htmlFor="remember">
                        <Checkbox
                            id="remember"
                            name="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            tabIndex={3}
                            className="border-white/25 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
                        />
                        Remember me
                    </label>
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-blue-400 transition hover:text-blue-300"
                            tabIndex={5}
                        >
                            Forgot password?
                        </Link>
                    )}
                </div>
                <Button
                    type="submit"
                    className="h-13 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] hover:bg-blue-500"
                    tabIndex={4}
                    disabled={processing}
                >
                    {processing && <LoaderCircle className="size-4 animate-spin" />} Sign in
                </Button>
            </form>
        </AuthLayout>
    );
}
