'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, TextField, Button, InputAdornment,
  IconButton, CircularProgress, Alert, Fade,
} from '@mui/material';
import { IconEye, IconEyeOff, IconLock, IconUser, IconBallFootball } from '@tabler/icons-react';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || 'Đăng nhập thất bại');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Không thể kết nối server');
    } finally {
      setLoading(false);
    }
  };

  const inputSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '12px',
      background: 'rgba(255,255,255,0.06)',
      color: 'white',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.15)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
      '&.Mui-focused fieldset': { borderColor: '#4ae176' },
    },
    '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.5)' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#4ae176' },
    '& .MuiInputAdornment-root svg': { color: 'rgba(255,255,255,0.4)' },
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a0f0d 0%, #0d1f15 40%, #0a1628 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background decorations */}
      <Box sx={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <Box sx={{ position: 'absolute', top: '-20%', right: '-10%', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,225,118,0.08) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', bottom: '-20%', left: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(96,165,250,0.06) 0%, transparent 70%)' }} />
        <Box sx={{ position: 'absolute', top: '30%', left: '5%', opacity: 0.04, fontSize: 200 }}>⚽</Box>
        <Box sx={{ position: 'absolute', bottom: '10%', right: '5%', opacity: 0.03, fontSize: 150 }}>🏆</Box>
      </Box>

      <Fade in={mounted} timeout={600}>
        <Box sx={{
          width: '100%',
          maxWidth: 440,
          mx: 2,
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          p: { xs: 3, sm: 5 },
          boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Logo / Icon */}
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Box sx={{
              width: 72, height: 72, borderRadius: '20px',
              background: 'linear-gradient(135deg, #4ae176, #22c55e)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 12px 32px rgba(74,225,118,0.35)',
              mb: 2,
            }}>
              <IconBallFootball size={38} color="white" />
            </Box>
            <Typography variant="h4" fontWeight={800} sx={{ color: 'white', letterSpacing: '-0.5px' }}>
              Chào mừng trở lại
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.45)', mt: 0.5 }}>
              Đăng nhập để tiếp tục quản lý
            </Typography>
          </Box>

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            {error && (
              <Fade in>
                <Alert severity="error" sx={{ mb: 2, borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)', '& .MuiAlert-icon': { color: '#f87171' } }}>
                  {error}
                </Alert>
              </Fade>
            )}

            <TextField
              fullWidth
              label="Tên đăng nhập"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
              sx={{ ...inputSx, mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconUser size={18} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              fullWidth
              label="Mật khẩu"
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              sx={{ ...inputSx, mb: 3 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconLock size={18} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPass(v => !v)} edge="end" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                      {showPass ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.6,
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #4ae176, #22c55e)',
                color: '#001a0a',
                fontWeight: 800,
                fontSize: 15,
                textTransform: 'none',
                boxShadow: '0 8px 24px rgba(74,225,118,0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #6ef094, #4ae176)',
                  boxShadow: '0 12px 32px rgba(74,225,118,0.45)',
                  transform: 'translateY(-1px)',
                },
                '&:disabled': { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' },
                transition: 'all 0.25s ease',
              }}
            >
              {loading ? <CircularProgress size={22} sx={{ color: 'rgba(255,255,255,0.6)' }} /> : 'Đăng nhập'}
            </Button>
          </Box>

          {/* Hint */}
          <Box mt={3} p={2} sx={{ background: 'rgba(74,225,118,0.06)', borderRadius: '10px', border: '1px solid rgba(74,225,118,0.15)' }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', display: 'block', textAlign: 'center' }}>
              Tài khoản mặc định: <strong style={{ color: 'rgba(255,255,255,0.7)' }}>admin</strong> / <strong style={{ color: 'rgba(255,255,255,0.7)' }}>123456</strong>
            </Typography>
          </Box>
        </Box>
      </Fade>
    </Box>
  );
}
