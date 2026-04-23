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
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      background: '#f5f6fa',
    }}>
      {/* Left panel */}
      <Box sx={{
        display: { xs: 'none', md: 'flex' },
        flex: 1,
        background: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        p: 6,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle grid pattern */}
        <Box sx={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        {/* Glow */}
        <Box sx={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 380 }}>
          <Box sx={{
            width: 64, height: 64, borderRadius: '16px',
            background: 'rgba(99,102,241,0.2)',
            border: '1px solid rgba(99,102,241,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 4, fontSize: 30,
          }}>
            🏠
          </Box>
          <Typography variant="h3" fontWeight={700} sx={{ color: 'white', mb: 2, lineHeight: 1.2 }}>
            Hệ thống<br />Quản lý
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8 }}>
            Quản lý nhân vật, đội bóng, đồ chơi và nhiều tính năng khác trong một nền tảng thống nhất.
          </Typography>

          <Box sx={{ mt: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {['Quản lý nhân vật & đội hình', 'Theo dõi ví & lương', 'Quản lý đồ chơi & cá Guppy'].map(f => (
              <Box key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1', flexShrink: 0 }} />
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.55)' }}>{f}</Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Right panel - form */}
      <Box sx={{
        width: { xs: '100%', md: 480 },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        px: { xs: 3, sm: 6 },
        py: 6,
        background: 'white',
      }}>
        <Fade in={mounted} timeout={500}>
          <Box sx={{ maxWidth: 360, mx: 'auto', width: '100%' }}>
            {/* Logo */}
            <Box sx={{ mb: 5 }}>
              <Box sx={{
                width: 44, height: 44, borderRadius: '12px',
                background: '#6366f1',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                mb: 3, fontSize: 22,
              }}>
                🏠
              </Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: '#0f172a', mb: 0.5 }}>
                Đăng nhập
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Nhập thông tin tài khoản để tiếp tục
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px', fontSize: 13 }}>
                  {error}
                </Alert>
              )}

              <Typography variant="caption" fontWeight={600} sx={{ color: '#475569', mb: 0.75, display: 'block' }}>
                Tên đăng nhập
              </Typography>
              <TextField
                fullWidth
                placeholder="Nhập tên đăng nhập"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
                size="small"
                sx={{
                  mb: 2.5,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    fontSize: 14,
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 1.5 },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconUser size={16} color="#94a3b8" />
                    </InputAdornment>
                  ),
                }}
              />

              <Typography variant="caption" fontWeight={600} sx={{ color: '#475569', mb: 0.75, display: 'block' }}>
                Mật khẩu
              </Typography>
              <TextField
                fullWidth
                placeholder="Nhập mật khẩu"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                size="small"
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                    fontSize: 14,
                    '& fieldset': { borderColor: '#e2e8f0' },
                    '&:hover fieldset': { borderColor: '#cbd5e1' },
                    '&.Mui-focused fieldset': { borderColor: '#6366f1', borderWidth: 1.5 },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconLock size={16} color="#94a3b8" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPass(v => !v)} edge="end" size="small" sx={{ color: '#94a3b8' }}>
                        {showPass ? <IconEyeOff size={16} /> : <IconEye size={16} />}
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
                  py: 1.4,
                  borderRadius: '10px',
                  background: '#6366f1',
                  fontWeight: 600,
                  fontSize: 14,
                  textTransform: 'none',
                  boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                  '&:hover': {
                    background: '#4f46e5',
                    boxShadow: '0 6px 20px rgba(99,102,241,0.45)',
                  },
                  '&:disabled': { background: '#e2e8f0', color: '#94a3b8', boxShadow: 'none' },
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? <CircularProgress size={20} sx={{ color: 'white' }} /> : 'Đăng nhập'}
              </Button>
            </Box>


          </Box>
        </Fade>
      </Box>
    </Box>
  );
}
