// third-party
import { format } from 'date-fns';
import NextLink  from 'next/link';
import { useDispatch } from '@/store/hooks';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import { IconEye, IconMessage2, IconPoint, IconSword, IconShield, IconHeartbeat, IconShieldCheck } from '@tabler/icons-react';
import { fetchBlogPost } from '@/store/apps/blog/BlogSlice';
import BlankCard from '../../shared/BlankCard';
import { BlogPostType } from '../../../(DashboardLayout)/types/apps/blog';

interface Btype {
  post: BlogPostType;
  index?: number;
}

const BlogCard = ({ post }: Btype) => {
  const dispatch = useDispatch();
  const { coverImg, title, category, element, game, strength = 3, attack = 3, defense = 3, hp = 3, armor = 3 }: any = post;

  const linkTo = title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');

  const StatRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
      <Icon size={18} />
      <Typography variant="body2" sx={{ minWidth: '80px', fontWeight: 500 }}>
        {label}:
      </Typography>
      <Rating 
        value={value} 
        precision={0.5}
        max={5} 
        readOnly 
        size="small"
        sx={{ 
          '& .MuiRating-iconFilled': {
            color: '#FFD700'
          },
          '& .MuiRating-iconEmpty': {
            color: 'rgba(255, 215, 0, 0.3)'
          }
        }}
      />
      <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary', minWidth: '30px' }}>
        {value.toFixed(1)}
      </Typography>
    </Stack>
  );

  return (
    <Grid item xs={12} lg={4} md={4} sm={6} display="flex" alignItems="stretch">
      <BlankCard className="hoverCard">
        <>
          <Typography
            component={NextLink}
            href={`/apps/blog/detail/${linkTo}`}
            onClick={() => dispatch(fetchBlogPost(linkTo))}
            sx={{ display: 'block', overflow: 'hidden' }}
          >
            <CardMedia 
              component="img" 
              height="280" 
              image={coverImg} 
              alt={title}
              sx={{
                objectFit: 'contain',
                objectPosition: 'center',
                width: '100%',
                backgroundColor: (theme) => theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[100],
                transition: 'transform 0.3s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                }
              }}
            />
          </Typography>
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

              <StatRow icon={IconSword} label="Sức mạnh" value={strength} />
              <StatRow icon={IconSword} label="Tấn công" value={attack} />
              <StatRow icon={IconShield} label="Phòng thủ" value={defense} />
              <StatRow icon={IconHeartbeat} label="Máu" value={hp} />
              <StatRow icon={IconShieldCheck} label="Giáp" value={armor} />
            </Box>
          </CardContent>
        </>
      </BlankCard>
    </Grid>
  );
};

export default BlogCard;
