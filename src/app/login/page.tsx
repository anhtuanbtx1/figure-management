'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, TextField, Button, InputAdornment,
  IconButton, CircularProgress, Alert, Fade,
} from '@mui/material';
import { IconEye, IconEyeOff, IconLock, IconUser } from '@tabler/icons-react';

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

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-30px) rotate(8deg); }
        }
        @keyframes float2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%       { transform: translateY(-20px) rotate(-6deg); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-15px) scale(1.08); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.05); }
        }
        @keyframes shimmer {
          0%   { transform: translateX(-100%) rotate(45deg); }
          100% { transform: translateX(300%) rotate(45deg); }
        }
        @keyframes orb1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(40px, -60px) scale(1.1); }
          66%       { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes orb2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%       { transform: translate(-50px, 40px) scale(1.05); }
          66%       { transform: translate(30px, -50px) scale(1.1); }
        }
      `}</style>

      <Box sx={{
        minHeight: '100vh',
        background: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe)',
        backgroundSize: '400% 400%',
        animation: 'gradientShift 12s ease infinite',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Animated orbs */}
        <Box sx={{
          position: 'absolute', top: '10%', left: '15%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          filter: 'blur(60px)',
          animation: 'orb1 8s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', bottom: '10%', right: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          filter: 'blur(80px)',
          animation: 'orb2 10s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <Box sx={{
          position: 'absolute', top: '50%', right: '20%',
          width: 200, height: 200, borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          filter: 'blur(40px)',
          animation: 'orb1 6s ease-in-out infinite 2s',
          pointerEvents: 'none',
        }} />

        {/* Floating emoji decorations */}
        <Box sx={{ position: 'absolute', top: '8%', left: '8%', fontSize: 48, animation: 'float1 5s ease-in-out infinite', opacity: 0.6, pointerEvents: 'none' }}>⚽</Box>
        <Box sx={{ position: 'absolute', top: '15%', right: '12%', fontSize: 40, animation: 'float2 6s ease-in-out infinite 1s', opacity: 0.5, pointerEvents: 'none' }}>🏆</Box>
        <Box sx={{ position: 'absolute', bottom: '20%', left: '6%', fontSize: 36, animation: 'float3 7s ease-in-out infinite 0.5s', opacity: 0.5, pointerEvents: 'none' }}>🎯</Box>
        <Box sx={{ position: 'absolute', bottom: '12%', right: '8%', fontSize: 44, animation: 'float1 4.5s ease-in-out infinite 2s', opacity: 0.5, pointerEvents: 'none' }}>🧸</Box>
        <Box sx={{ position: 'absolute', top: '40%', left: '3%', fontSize: 32, animation: 'float2 8s ease-in-out infinite 1.5s', opacity: 0.4, pointerEvents: 'none' }}>💎</Box>
        <Box sx={{ position: 'absolute', top: '60%', right: '4%', fontSize: 30, animation: 'float3 5.5s ease-in-out infinite 3s', opacity: 0.4, pointerEvents: 'none' }}>🌟</Box>

        {/* Login card */}
        <Fade in={mounted} timeout={700}>
          <Box sx={{
            width: '100%',
            maxWidth: 420,
            mx: 2,
            background: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(32px)',
            WebkitBackdropFilter: 'blur(32px)',
            border: '1px solid rgba(255,255,255,0.35)',
            borderRadius: '28px',
            p: { xs: 3, sm: 5 },
            boxShadow: '0 24px 64px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.4)',
            position: 'relative',
            zIndex: 1,
            overflow: 'hidden',
          }}>

            {/* Shimmer effect on card */}
            <Box sx={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)',
              animation: 'shimmer 4s ease-in-out infinite',
              pointerEvents: 'none',
              borderRadius: '28px',
            }} />

            {/* Header */}
            <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
              <Box sx={{
                width: 80, height: 80, borderRadius: '24px',
                background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                mb: 2.5, fontSize: 40,
                animation: 'pulse 3s ease-in-out infinite',
              }}>
                🏠
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{
                color: 'white',
                textShadow: '0 2px 12px rgba(0,0,0,0.2)',
                letterSpacing: '-0.5px',
              }}>
                Chào mừng!
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, fontWeight: 500 }}>
                Đăng nhập để tiếp tục quản lý
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Fade in>
                  <Alert severity="error" sx={{
                    mb: 2, borderRadius: '12px',
                    background: 'rgba(255,255,255,0.25)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.4)',
                    '& .MuiAlert-icon': { color: 'white' },
                    backdropFilter: 'blur(8px)',
                  }}>
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
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
                    '&.Mui-focused fieldset': { borderColor: 'white', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.75)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
                  '& input::placeholder': { color: 'rgba(255,255,255,0.5)' },
                  '& .MuiInputAdornment-root svg': { color: 'rgba(255,255,255,0.7)' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><IconUser size={18} /></InputAdornment>
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
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '14px',
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
                    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.7)' },
                    '&.Mui-focused fieldset': { borderColor: 'white', borderWidth: 2 },
                  },
                  '& .MuiInputLabel-root': { color: 'rgba(255,255,255,0.75)' },
                  '& .MuiInputLabel-root.Mui-focused': { color: 'white' },
                  '& .MuiInputAdornment-root svg': { color: 'rgba(255,255,255,0.7)' },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start"><IconLock size={18} /></InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(v => !v)} edge="end" sx={{ color: 'rgba(255,255,255,0.7)' }}>
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
                  py: 1.7,
                  borderRadius: '14px',
                  background: 'rgba(255,255,255,0.9)',
                  color: '#5b21b6',
                  fontWeight: 800,
                  fontSize: 15,
                  textTransform: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  '&:hover': {
                    background: 'white',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': { background: 'rgba(255,255,255,0.3)', color: 'rgba(255,255,255,0.5)' },
                  transition: 'all 0.25s ease',
                }}
              >
                {loading
                  ? <CircularProgress size={22} sx={{ color: '#5b21b6' }} />
                  : '🚀 Đăng nhập'}
              </Button>
            </Box>

            {/* Hint */}
            <Box mt={3} p={2} sx={{
              background: 'rgba(255,255,255,0.15)',
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.25)',
              textAlign: 'center',
            }}>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                Tài khoản mặc định:{' '}
                <strong style={{ color: 'white' }}>admin</strong>
                {' / '}
                <strong style={{ color: 'white' }}>123456</strong>
              </Typography>
            </Box>
          </Box>
        </Fade>
      </Box>
    </>
  );
}
