import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { UserCheck, ArrowLeft, Loader2 } from 'lucide-react';

const FacultyLogin: React.FC = () => {
    const { loginWithId } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [facultyId, setFacultyId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [loginResult, setLoginResult] = useState<{
        success: boolean;
        message: string;
        user?: any;
    } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !facultyId) {
            setLoginResult({
                success: false,
                message: 'Please enter both Name and Faculty ID.'
            });
            return;
        }

        setIsProcessing(true);
        setLoginResult(null);

        try {
            const result = await loginWithId(name, facultyId, 'faculty');

            if (result.success && result.user && result.redirectPath) {
                setLoginResult({
                    success: true,
                    message: `Welcome ${result.user.name}! Redirecting to Dashboard...`,
                    user: result.user
                });

                setTimeout(() => {
                    navigate(result.redirectPath!, { replace: true });
                }, 1500);
            } else {
                setLoginResult({
                    success: false,
                    message: result.error || 'Authentication failed. Please try again.'
                });
            }
        } catch (error) {
            setLoginResult({
                success: false,
                message: 'Login failed. Please try again.'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md shadow-lg bg-white">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                        <UserCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-blue-900">Faculty Login</CardTitle>
                    <CardDescription>
                        Enter your Name and Faculty ID to access the Dashboard
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                disabled={isProcessing}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="facultyId">Faculty ID</Label>
                            <Input
                                id="facultyId"
                                placeholder="Faculty ID"
                                value={facultyId}
                                onChange={(e) => setFacultyId(e.target.value)}
                                disabled={isProcessing}
                            />
                        </div>

                        {loginResult && (
                            <div className={`p-3 rounded-md text-sm ${loginResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                }`}>
                                {loginResult.message}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Login to Dashboard'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link
                        to="/"
                        className="text-sm text-gray-600 hover:text-blue-600 flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default FacultyLogin;
