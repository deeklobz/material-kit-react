import { useState, useCallback, type FormEvent } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/context/AuthContext';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignUpView() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    organization_name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSignUp = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError('');

      if (formData.password !== formData.password_confirmation) {
        setError('Passwords do not match');
        return;
      }

      setLoading(true);

      try {
        await register(formData);
        router.push('/');
      } catch (err: any) {
        setError(err.response?.data?.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [formData, register, router]
  );

  const renderForm = (
    <Box component="form" onSubmit={handleSignUp}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        fullWidth
        name="organization_name"
        label="Organization Name"
        value={formData.organization_name}
        onChange={handleChange('organization_name')}
        required
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          fullWidth
          name="first_name"
          label="First Name"
          value={formData.first_name}
          onChange={handleChange('first_name')}
          required
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />
        <TextField
          fullWidth
          name="last_name"
          label="Last Name"
          value={formData.last_name}
          onChange={handleChange('last_name')}
          required
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />
      </Box>

      <TextField
        fullWidth
        name="email"
        label="Email address"
        value={formData.email}
        onChange={handleChange('email')}
        required
        type="email"
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="phone"
        label="Phone Number"
        value={formData.phone}
        onChange={handleChange('phone')}
        required
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        value={formData.password}
        onChange={handleChange('password')}
        required
        type={showPassword ? 'text' : 'password'}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
      />

      <TextField
        fullWidth
        name="password_confirmation"
        label="Confirm Password"
        value={formData.password_confirmation}
        onChange={handleChange('password_confirmation')}
        required
        type={showPassword ? 'text' : 'password'}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Create account'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Get started</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Already have an account?
          <Link href="/sign-in" variant="subtitle2" sx={{ ml: 0.5 }}>
            Sign in
          </Link>
        </Typography>
      </Box>
      {renderForm}
    </>
  );
}
