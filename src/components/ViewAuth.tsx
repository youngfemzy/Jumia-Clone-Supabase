import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { ShieldCheck, Mail, Lock, User as UserIcon, Store, Sparkles, AlertCircle } from 'lucide-react';

export const ViewAuth: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signUp, currentUser } = useShop();
  const { success: toastSuccess, error: toastError } = useToast();

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('buyer');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [showVerificationPending, setShowVerificationPending] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (isSignUpMode) {
        if (!fullName.trim()) {
          setErrorMessage("Please enter your formal full name.");
          setLoading(false);
          return;
        }
        const res = await signUp(email, password, fullName, role);
        if (res.success) {
          toastSuccess("Account created successfully!");
          if (res.emailVerificationRequired) {
            setRegisteredEmail(email);
            setShowVerificationPending(true);
          } else {
            navigate('/dashboard');
          }
        } else {
          setErrorMessage(res.error || "Signup error occurred.");
        }
      } else {
        const res = await signIn(email, password);
        if (res.success) {
          toastSuccess("Signed in successfully!");
          navigate('/dashboard');
        } else {
          toastError(res.error || "Authentication rejected, check coordinates.");
          setErrorMessage(res.error || "Authentication rejected, check coordinates.");
        }
      }
    } catch (err: any) {
      console.error("Auth submit error caught in view component:", err);
      setErrorMessage(err.message || "An unexpected system transition occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (showVerificationPending) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-xl border border-gray-150 shadow-md overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-8 px-6 text-white text-center flex flex-col items-center">
            <div className="bg-white/15 p-3 rounded-full mb-4 animate-bounce">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-extrabold uppercase tracking-wide">
              Confirm Your Email
            </h2>
            <p className="text-xs text-orange-50/90 mt-1 font-semibold">
              Almost there! Email verification is required.
            </p>
          </div>

          <div className="p-8 space-y-6 text-center">
            <div className="space-y-3">
              <p className="text-sm text-gray-700 leading-relaxed font-semibold">
                We've dispatched a secure activation link to:
              </p>
              <div className="bg-orange-50 inline-block px-4 py-2 rounded-lg border border-orange-100 text-orange-850 text-xs font-mono font-bold select-all break-all shadow-sm">
                {registeredEmail}
              </div>
              <p className="text-xs text-gray-550 leading-relaxed pt-2">
                Click the confirmation button inside that mail to verify your storefront/customer coordinates instantly and unlock Jumia Premium.
              </p>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-left text-[11px] text-amber-800 space-y-1 font-semibold">
              <div className="flex items-center space-x-1.5 font-bold text-amber-900 pb-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Can't find the activation email?</span>
              </div>
              <p>• Verify the spelling of the email address above.</p>
              <p>• Look in your spam/Junk folder or promotions tab.</p>
              <p>• Wait up to 2-3 minutes for the SMTP dispatch.</p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowVerificationPending(false);
                  setIsSignUpMode(false);
                  setErrorMessage(null);
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-lg transition active:scale-95 shadow-md shadow-orange-500/15 cursor-pointer flex items-center justify-center"
              >
                PROCEED TO SIGN IN
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowVerificationPending(false);
                  setErrorMessage(null);
                }}
                className="text-xs text-gray-500 hover:text-orange-500 font-bold transition cursor-pointer"
              >
                Change Registration Email
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16 animate-in fade-in zoom-in-95 duration-200">
      


      <div className="bg-white rounded-xl border border-gray-150 shadow-md overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 py-6 px-6 text-white text-center">
          <h2 className="text-xl font-extrabold uppercase tracking-wide">
            {isSignUpMode ? 'Register Merchant Account' : 'Partner Sign In'}
          </h2>
          <p className="text-xs text-orange-50/80 mt-1 font-semibold">
            {isSignUpMode ? 'Launch seller shop or register customer coordinates.' : 'Connect to your multivendor dashboard panels.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs font-semibold flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isSignUpMode && (
            <div>
              <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Full Name *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="Recipient or Store Owner Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-orange-500 pl-10"
                />
                <UserIcon className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Email coordinate *</label>
            <div className="relative">
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-orange-500 pl-10"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-1.5">Private Password *</label>
            <div className="relative">
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-orange-500 pl-10"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
            </div>
          </div>

          {/* Select Privilege level on Sign Up */}
          {isSignUpMode && (
            <div>
              <label className="block text-[10px] font-extrabold text-gray-500 uppercase tracking-wider mb-2">Account Objective</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('buyer')}
                  className={`p-3 border-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    role === 'buyer' ? 'border-orange-500 bg-orange-50/20 text-orange-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Buyer Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('vendor')}
                  className={`p-3 border-2 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer ${
                    role === 'vendor' ? 'border-orange-500 bg-orange-50/20 text-orange-700' : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Vendor Store</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs uppercase tracking-wider py-3 rounded-lg transition active:scale-95 shadow-md shadow-orange-500/15 cursor-pointer flex items-center justify-center"
          >
            {loading ? 'SYNCING SESSION STATUS...' : isSignUpMode ? 'CREATE ACCOUNT' : 'SECURE SIGN IN'}
          </button>

          {/* Swith modes links */}
          <div className="text-center pt-3 border-t border-gray-50 text-xs">
            <button
              type="button"
              onClick={() => { setIsSignUpMode(!isSignUpMode); setErrorMessage(null); }}
              className="text-orange-500 hover:text-orange-600 font-bold hover:underline"
            >
              {isSignUpMode ? 'Already have credentials? Sign In' : 'Create a new buyer / seller account'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
