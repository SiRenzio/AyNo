import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface RegisterForm {
    [key: string]: string;
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

const inputClass =
    'h-12 rounded-xl border-white/20 bg-white/[0.055] px-4 text-base text-white shadow-none placeholder:text-slate-600 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/25 focus-visible:ring-offset-0';
const labelClass = 'text-[11px] font-semibold tracking-[0.16em] text-slate-400 uppercase';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });
    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        post(route('register'), { onFinish: () => reset('password', 'password_confirmation') });
    };

    return (
        <AuthLayout title="Create your account" description="Start organizing the things you cannot afford to forget.">
            <Head title="Register" />
            <form className="space-y-4" onSubmit={submit}>
                <div className="space-y-2">
                    <Label htmlFor="name" className={labelClass}>
                        Full name
                    </Label>
                    <Input
                        id="name"
                        className={inputClass}
                        type="text"
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="name"
                        value={data.name}
                        onChange={(event) => setData('name', event.target.value)}
                        disabled={processing}
                        placeholder="Your full name"
                    />
                    <InputError message={errors.name} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email" className={labelClass}>
                        Email address
                    </Label>
                    <Input
                        id="email"
                        className={inputClass}
                        type="email"
                        required
                        tabIndex={2}
                        autoComplete="email"
                        value={data.email}
                        onChange={(event) => setData('email', event.target.value)}
                        disabled={processing}
                        placeholder="you@email.com"
                    />
                    <InputError message={errors.email} />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="password" className={labelClass}>
                            Password
                        </Label>
                        <Input
                            id="password"
                            className={inputClass}
                            type="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(event) => setData('password', event.target.value)}
                            disabled={processing}
                            placeholder="Create password"
                        />
                        <InputError message={errors.password} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password_confirmation" className={labelClass}>
                            Confirm password
                        </Label>
                        <Input
                            id="password_confirmation"
                            className={inputClass}
                            type="password"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(event) => setData('password_confirmation', event.target.value)}
                            disabled={processing}
                            placeholder="Repeat password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>
                </div>
                <Button
                    type="submit"
                    className="mt-2 h-13 w-full rounded-xl bg-blue-600 text-base font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.25)] hover:bg-blue-500"
                    tabIndex={5}
                    disabled={processing}
                >
                    {processing && <LoaderCircle className="size-4 animate-spin" />} Create account
                </Button>
                <p className="text-center text-xs leading-5 text-slate-500">
                    By creating an account, you agree to keep your reminder information accurate and secure.
                </p>
            </form>
        </AuthLayout>
    );
}
