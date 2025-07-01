import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from "@/components/ui/sonner";
import { apiService } from '@/services/api';

export const ResetPasswordPage = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!token) {
            toast.error('Invalid or missing reset token.');
            return;
        }

        if (!password || !confirmPassword) {
            toast.error('Please fill in all fields.');
            return;
        }

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters long.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
           const response =  await apiService.resetPassword(token, password);
           console.log(response);
           
            toast.success('Password reset successful! Please log in.');
            navigate('/login');
        } catch (error) {
            toast.error('Failed to reset password. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center">
                        <div className="bg-primary/10 p-3 rounded-full">
                            <Lock className="h-12 w-12 text-primary" />
                        </div>
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset your password</h2>
                    <p className="mt-2 text-sm text-gray-600">Enter your new password below.</p>
                </div>

                <Card className="shadow-xl border-0">
                    <CardHeader className="space-y-1 pb-6">
                        <CardTitle className="text-2xl text-center">Create new password</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="password">New password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    className="h-11"
                                />
                            </div>

                            <Button type="submit" className="w-full h-11" disabled={loading}>
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </form>

                        <div className="text-center">
                            <Button
                                variant="link"
                                onClick={() => navigate('/login')}
                                className="text-sm text-primary"
                            >
                                <ArrowLeft className="mr-1 h-4 w-4" />
                                Back to sign in
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
