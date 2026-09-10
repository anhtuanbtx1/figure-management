// third-party
import { useState } from 'react';
import NextLink from 'next/link';
import { useDispatch } from '@/store/hooks';
import axios from '@/utils/axios';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import { IconCamera, IconHandGrab, IconSword, IconShield, IconHeartbeat, IconShieldCheck } from '@tabler/icons-react';
import { fetchBlogPost, fetchBlogPosts } from '@/store/apps/blog/BlogSlice';
import BlankCard from '../../shared/BlankCard';
import { BlogPostType } from '../../../(DashboardLayout)/types/apps/blog';

interface Btype {
  post: BlogPostType;
  index?: number;
}

const BlogCard = ({ post }: Btype) => {
  const dispatch = useDispatch();
  const { id, coverImg, title, category, element, game, strength = 3, attack = 3, defense = 3, hp = 3, armor = 3 }: any = post;

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newImgUrl, setNewImgUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hovering, setHovering] = useState(false);

  // Guard: nếu title null/undefined thì không render để tránh crash
  if (!title) return null;

  const linkTo = ((title as string) || '')
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
    || String(id);


  const handleOpenDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setNewImgUrl(coverImg || '');
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!newImgUrl.trim()) {
      setError('Vui lòng nhập URL ảnh');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await axios.patch(`/api/characters/${id}`, { coverImg: newImgUrl.trim() });
      setDialogOpen(false);
      dispatch(fetchBlogPosts() as any);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Cập nhật thất bại, thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  const StatRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return (
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
        <Icon size={18} />
        <Typography variant="body2" sx={{ minWidth: '80px', fontWeight: 500 }}>
          {label}:
        </Typography>
        <Rating
          value={safeValue}
          precision={0.5}
          max={5}
          readOnly
          size="small"
          sx={{
            '& .MuiRating-iconFilled': { color: '#FFD700' },
            '& .MuiRating-iconEmpty': { color: 'rgba(255, 215, 0, 0.3)' },
          }}
        />
        <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary', minWidth: '30px' }}>
          {safeValue.toFixed(1)}
        </Typography>
      </Stack>
    );
  };

  return (
    <Grid item xs={12} sm={6} md={6} lg={6} display="flex" alignItems="stretch">
      <BlankCard className="hoverCard" sx={{ width: '100%' }}>
        <>
          {/* Ảnh + nút đổi ảnh khi hover */}
          <Box
            sx={{ position: 'relative', overflow: 'hidden' }}
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
          >
            <Typography
              component={NextLink}
              href={`/apps/blog/detail/${linkTo}`}
              onClick={() => dispatch(fetchBlogPost(linkTo))}
              sx={{ display: 'block' }}
            >
              <CardMedia
                component="img"
                image={coverImg}
                alt={title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  transition: 'transform 0.3s ease-in-out',
                  '&:hover': { transform: 'scale(1.05)' },
                }}
              />
            </Typography>

            {/* Nút camera — hiện khi hover */}
            <Tooltip title="Đổi ảnh nhân vật" placement="top">
              <IconButton
                onClick={handleOpenDialog}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  opacity: hovering ? 1 : 0,
                  transform: hovering ? 'scale(1)' : 'scale(0.8)',
                  transition: 'opacity 0.2s ease, transform 0.2s ease',
                  '&:hover': { backgroundColor: 'primary.main' },
                }}
              >
                <IconCamera size={18} />
              </IconButton>
            </Tooltip>
          </Box>

          <CardContent>
            <Box mb={2}>
              <Typography
                gutterBottom
                variant="h5"
                color="inherit"
                sx={{ textDecoration: 'none' }}
                component={NextLink}
                href={`/apps/blog/detail/${linkTo}`}
                onClick={() => dispatch(fetchBlogPost(linkTo))}
              >
                {title}
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
                Thông số nhân vật
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} sx={{ mb: 2 }}>
                {category && <Chip label={category} size="small" color="primary" variant="outlined" />}
                {game && <Chip label={`Game: ${game}`} size="small" color="secondary" variant="outlined" />}
                {element && <Chip label={`Hệ: ${element}`} size="small" color="success" />}
              </Stack>

              <StatRow icon={IconHandGrab} label="Sức mạnh" value={strength} />
              <StatRow icon={IconSword} label="Tấn công" value={attack} />
              <StatRow icon={IconShield} label="Phòng thủ" value={defense} />
              <StatRow icon={IconHeartbeat} label="Máu" value={hp} />
              <StatRow icon={IconShieldCheck} label="Giáp" value={armor} />
            </Box>
          </CardContent>
        </>
      </BlankCard>

      {/* Dialog đổi ảnh */}
      <Dialog open={dialogOpen} onClose={() => !loading && setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 600 }}>
          🖼️ Đổi ảnh nhân vật
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {title}
          </Typography>
        </DialogTitle>

        <DialogContent>
          {/* Preview ảnh */}
          {newImgUrl && (
            <Box
              sx={{
                mb: 2,
                textAlign: 'center',
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                backgroundColor: '#f5f5f5',
                minHeight: 80,
              }}
            >
              <img
                src={newImgUrl}
                alt="preview"
                style={{ maxHeight: 220, maxWidth: '100%', objectFit: 'contain' }}
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </Box>
          )}

          <TextField
            autoFocus
            fullWidth
            label="URL ảnh mới"
            placeholder="https://... hoặc /images/blog/ten-anh.jpg"
            value={newImgUrl}
            onChange={(e) => { setNewImgUrl(e.target.value); setError(''); }}
            variant="outlined"
            disabled={loading}
            helperText="Nhập URL ảnh từ internet hoặc đường dẫn trong project (public/images/blog/)"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={loading} color="inherit">
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={loading || !newImgUrl.trim()}
            startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <IconCamera size={16} />}
          >
            {loading ? 'Đang lưu...' : 'Lưu ảnh'}
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
};

export default BlogCard;

