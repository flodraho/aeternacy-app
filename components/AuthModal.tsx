
import React, { useEffect, useRef, useState } from 'react';
import { AuthMode } from '../types';
import { BrainCircuit, MailCheck } from 'lucide-react';
import AppleIcon from './icons/AppleIcon';
import { auth } from '../services/firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup,
    updateProfile,
    sendPasswordResetEmail
} from 'firebase/auth';

interface AuthModalProps {
  mode: AuthMode;
  onClose: () => void;
  onSuccess: (isNewUser: boolean) => void;
  switchMode: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSuccess, switchMode }) => {
  const [view, setView] = useState<AuthMode | 'resetSent'>(mode);
  const isLogin = view === AuthMode.Login;
  const isRegister = view === AuthMode.Register;
  const isReset = view === AuthMode.ResetPassword;

  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      setView(mode);
  }, [mode]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();
    try {
        await signInWithPopup(auth, provider);
        onClose();
    } catch (error: any) {
        setError(error.message);
        console.error("Google Sign-In Error:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const email = emailRef.current?.value;
    if (!email) {
        setError("Please enter your email address.");
        setIsLoading(false);
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        setView('resetSent');
    } catch (error: any) {
        setError("Could not send reset email. Please check the address and try again.");
        console.error("Password Reset Error:", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const name = nameRef.current?.value;

    if (!email || !password) {
        setError("Email and password are required.");
        setIsLoading(false);
        return;
    }

    try {
        if (isLogin) {
            await signInWithEmailAndPassword(auth, email, password);
        } else { // isRegister
            if (!name) {
                setError("Name is required for registration.");
                setIsLoading(false);
                return;
            }
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(userCredential.user, { displayName: name });
        }
        onClose();
    } catch (error: any) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                setError("Invalid email or password.");
                break;
            case 'auth/email-already-in-use':
                setError("This email is already registered. Please login.");
                break;
            case 'auth/weak-password':
                 setError("Password should be at least 6 characters.");
                 break;
            case 'auth/operation-not-allowed':
                setError("This sign-in method is not enabled. Please contact support.");
                break;
            default:
                setError("An error occurred. Please try again.");
                console.error("Firebase Auth Error:", error);
        }
    } finally {
        setIsLoading(false);
    }
  };
  
  const renderMainForm = () => (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {isRegister && (
          <div>
            <label className="block text-sm font-medium text-slate-300" htmlFor="name">Name</label>
            <input ref={nameRef} type="text" id="name" className="mt-1 w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500" required />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-300" htmlFor="email">Email</label>
          <input ref={emailRef} type="email" id="email" className="mt-1 w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300" htmlFor="password">Password</label>
          <input ref={passwordRef} type="password" id="password" className="mt-1 w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500" required />
        </div>

        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

        {isLogin && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-cyan-600 focus:ring-cyan-500"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <button onClick={() => setView(AuthMode.ResetPassword)} className="font-semibold text-cyan-400 hover:text-cyan-300">
                Forgot password?
              </button>
            </div>
          </div>
        )}

        <div>
          <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-md transition-colors disabled:bg-gray-600">
            {isLoading ? 'Processing...' : (isLogin ? 'Login' : 'Create Account')}
          </button>
        </div>
      </form>
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-slate-600" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-slate-800 px-2 text-slate-400">Or continue with</span>
        </div>
      </div>

      <div className="space-y-4">
        <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-md text-white font-semibold transition-colors"
        >
            <svg className="w-5 h-5" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.222 0-9.618-3.319-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.012 35.887 44 30.275 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
            <span>Continue with Google</span>
        </button>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-md text-white font-semibold transition-colors"
        >
          <AppleIcon />
          <span>Continue with Apple</span>
        </button>
      </div>
    </>
  );

  const renderResetForm = () => (
    <>
        <form onSubmit={handlePasswordReset} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300" htmlFor="email">Email</label>
              <input ref={emailRef} type="email" id="email" placeholder="Enter your registered email" className="mt-1 w-full p-3 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-cyan-500 focus:border-cyan-500" required />
            </div>
            {error && <p className="text-red-400 text-sm text-center">{error}</p>}
             <div>
              <button type="submit" disabled={isLoading} className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-md transition-colors disabled:bg-gray-600">
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </div>
        </form>
         <p className="text-center text-sm text-slate-400 mt-6">
            Remembered your password?{' '}
            <button onClick={() => setView(AuthMode.Login)} className="font-semibold text-cyan-400 hover:text-cyan-300">
              Back to Login
            </button>
          </p>
    </>
  );
  
  const renderResetSent = () => (
    <div className="text-center">
        <MailCheck className="w-12 h-12 text-green-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white font-brand">Check Your Email</h3>
        <p className="text-slate-300 mt-2">A password reset link has been sent to the email address you provided, if an account exists.</p>
        <button onClick={() => setView(AuthMode.Login)} className="mt-6 w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 rounded-md transition-colors">
            Back to Login
        </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-800 rounded-lg shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <div className="flex flex-col items-center mb-6">
            <BrainCircuit className="w-8 h-8 text-cyan-400" />
            <h2 className="text-3xl font-bold mt-2 text-white font-brand">
                {isReset ? 'Reset Password' : view === 'resetSent' ? '' : isLogin ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p className="text-slate-400 mt-1">
                {isReset ? 'Enter your email to receive a reset link.' : view === 'resetSent' ? '' : isLogin ? 'Sign in to continue your journey.' : 'Start preserving your legacy today.'}
            </p>
          </div>
          
          {isReset && renderResetForm()}
          {view === 'resetSent' && renderResetSent()}
          {(isLogin || isRegister) && (
            <>
                {renderMainForm()}
                <p className="text-center text-sm text-slate-400 mt-6">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button onClick={() => setView(isLogin ? AuthMode.Register : AuthMode.Login)} className="font-semibold text-cyan-400 hover:text-cyan-300">
                    {isLogin ? 'Register' : 'Login'}
                    </button>
                </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
