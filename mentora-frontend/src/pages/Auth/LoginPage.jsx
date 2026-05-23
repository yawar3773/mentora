import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import  { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService.js';
import { BrainCircuit, Mail, Lock, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {

  const [email, setEmail] = useState('alex@email.com');
  const [password, setPassowrd] = useState('Test@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const{ token, user } = await authService.login(email, password);
      login(user, token);
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to login. Please check your credentials.');
      toast.error(err.message || 'Failed to login.');
    } finally{
      setLoading(false);
    }
  };
  
  return (
    <div className=''>
      <div className=''/>

      <div className=''>
        <div className=''>
          {/* Header */ }
          <div className=''>
            <div className=''>
                <BrainCircuit className='' strokeWidth={2} />
            </div>
            <h1 className=''>
              Welcome Back
            </h1>
            <p>
              Sign in to continue your journey
            </p>
          </div>

          {/* Form */}
          <div className=''>

            {/* Email field */}
            <div className=''>
              <label className=''>
                Email
              </label>
              <div className=''>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transform-colors duration-200 ${
                  focusedField === 'email' ? 'text-emerald-500' : 'text-slate-400'
                }`}>
                  <Mail className='' strokeWidth={2}/>
                </div>
                <input 
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className=''
                  placeholder='you@example.com'
                />
              </div>
            </div>

            {/* Password Field */}
            <div className=''>
              <label className="">
                Password
              </label>
              <div className=''>
                <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-non transition-colors duration-200 ${
                  focusedField === 'password' ? 'text-emerald-500' : 'text-slate-400'
                }`}>
                  <Lock className='' strokeWidth={2} />
                </div>
                <input 
                type="text" 
                value={password}
                onChange={(e) => setPassowrd(e.target.value)}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                className=''
                placeholder='*******'
                />
              </div>
            </div>

            {/* Error Message */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;