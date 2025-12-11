import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { GraduationCap, ArrowLeft, Loader2 } from 'lucide-react';

const StudentLogin: React.FC = () => {
    const { loginWithId } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [loginResult, setLoginResult] = useState<{
        success: boolean;
        message: string;
        user?: any;
    } | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !studentId) {
            setLoginResult({
                success: false,
                message: 'Please enter both Name and Student ID.'
            });
            return;
        }

        setIsProcessing(true);
        setLoginResult(null);

        try {
            const result = await loginWithId(name, studentId, 'student');

            if (result.success && result.user && result.redirectPath) {
                setLoginResult({
                    success: true,
                    message: `Welcome ${result.user.name}! Redirecting to Student Portal...`,
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
                    <div className="mx-auto h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <GraduationCap className="h-6 w-6 text-green-600" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-green-900">Student Login</CardTitle>
                    <CardDescription>
                        Enter your Name and Student ID (Roll No) to access the Portal
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
                            <Label htmlFor="studentId">Student ID</Label>
                            <Input
                                id="studentId"
                                placeholder="Student ID"
                                value={studentId}
                                onChange={(e) => setStudentId(e.target.value)}
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
                            className="w-full bg-green-600 hover:bg-green-700"
                            disabled={isProcessing}
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Login to Portal'
                            )}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Link
                        to="/"
                        className="text-sm text-gray-600 hover:text-green-600 flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Home
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
};

export default StudentLogin;
