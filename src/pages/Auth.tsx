import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import CaptchaInput from '@/components/CaptchaInput';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, signUp, user } = useAuth();
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    captcha: '',
  });
  const [loginCaptchaValid, setLoginCaptchaValid] = useState(false);
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    captcha: '',
  });
  const [registerCaptchaValid, setRegisterCaptchaValid] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginCaptchaValid) {
      toast.error('Please complete the captcha correctly');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signIn(loginData.email, loginData.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Logged in successfully!');
        navigate('/profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerCaptchaValid) {
      toast.error('Please complete the captcha correctly');
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await signUp(
        registerData.email, 
        registerData.password, 
        registerData.firstName, 
        registerData.lastName
      );
      
      if (error) {
        if (error.message.includes('User already registered')) {
          toast.error('User with this email already exists');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success('Registration successful! Please check your email for verification.');
        navigate('/profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Anmelden</TabsTrigger>
              <TabsTrigger value="register">Registrieren</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Anmelden</CardTitle>
                  <CardDescription>
                    Melden Sie sich mit Ihrem Konto an
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">E-Mail</Label>
                      <Input
                        id="login-email"
                        type="email"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="login-password">Passwort</Label>
                      <Input
                        id="login-password"
                        type="password"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        required
                      />
                    </div>
                    
                    <CaptchaInput
                      value={loginData.captcha}
                      onChange={(value) => setLoginData({ ...loginData, captcha: value })}
                      isValid={loginCaptchaValid}
                      onValidationChange={setLoginCaptchaValid}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || !loginCaptchaValid}
                    >
                      {loading ? 'Anmelden...' : 'Anmelden'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Registrieren</CardTitle>
                  <CardDescription>
                    Erstellen Sie ein neues Konto
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <Label htmlFor="register-firstName">Vorname</Label>
                      <Input
                        id="register-firstName"
                        type="text"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="register-lastName">Nachname</Label>
                      <Input
                        id="register-lastName"
                        type="text"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="register-email">E-Mail</Label>
                      <Input
                        id="register-email"
                        type="email"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="register-password">Passwort</Label>
                      <Input
                        id="register-password"
                        type="password"
                        value={registerData.password}
                        onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    
                    <CaptchaInput
                      value={registerData.captcha}
                      onChange={(value) => setRegisterData({ ...registerData, captcha: value })}
                      isValid={registerCaptchaValid}
                      onValidationChange={setRegisterCaptchaValid}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={loading || !registerCaptchaValid}
                    >
                      {loading ? 'Registrieren...' : 'Registrieren'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Auth;