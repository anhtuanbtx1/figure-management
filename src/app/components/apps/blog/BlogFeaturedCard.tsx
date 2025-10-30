import Link from 'next/link';
import { useDispatch } from '@/store/hooks';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
// import alpha from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { IconEye, IconMessage2, IconHandGrab, IconSword, IconShield, IconHeartbeat, IconShieldCheck } from '@tabler/icons-react';
import { format } from 'date-fns';
import Rating from '@mui/material/Rating';
import Divider from '@mui/material/Divider';
import { fetchBlogPost } from '@/store/apps/blog/BlogSlice';
import BlankCard from '../../shared/BlankCard';
import { BlogPostType } from '../../../(DashboardLayout)/types/apps/blog';

const CoverImgStyle = styled(CardContent)({
  position: 'absolute',
  top: '0',
  left: '0',
  zIndex: 1,
  width: '100%',
  height: '100%',
  color: 'white',
});
const CoverBox = styled(Box)({
  top: 0,
  content: "''",
  width: '100%',
  height: '100%',
  position: 'absolute',
});

interface Btype {
  post: BlogPostType;
  index: number;
}

const BlogFeaturedCard = ({ post, index }: Btype) => {
  const dispatch = useDispatch();
  const { coverImg, title, category, element, game, strength = 3, attack = 3, defense = 3, hp = 3, armor = 3 }: any = post;
  const linkTo = title
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '');
  const mainPost = index === 0;

  const StatRowOverlay = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
      <Icon size={16} />
      <Typography variant="caption" sx={{ minWidth: '70px', fontWeight: 500 }}>
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
      <Typography variant="caption" sx={{ ml: 0.5, fontSize: '0.7rem', minWidth: '25px' }}>
        {value.toFixed(1)}
      </Typography>
    </Stack>
  );

  const CoverImgBg = styled(BlankCard)({
    p: 0,
    height: '400px',
    position: 'relative',
    background: `url(${coverImg}) no-repeat center`,
    backgroundSize: 'contain',
    backgroundPosition: 'center center',
    backgroundColor: '#f5f5f5',
    transition: 'transform 0.3s ease-in-out',
    '&:hover': {
      transform: 'scale(1.02)',
    },
  });

  return (
    <>
      {post ? (
        <Grid
          item
          xs={12}
          lg={mainPost ? 8 : 4}
          md={12}
          sm={12}
          display="flex"
          alignItems="stretch"
        >
          <CoverImgBg className="hoverCard">
            <>
              <Typography
                component={Link}
                href={`/apps/blog/detail/${linkTo}`}
                onClick={() => dispatch(fetchBlogPost(linkTo))}
              >
                <CoverBox
                  sx={{ backgroundColor: (theme) => alpha(theme.palette.grey[900], 0.6) }}
                />
              </Typography>
              <CoverImgStyle>
                <Box
                  height={'100%'}
                  display={'flex'}
                  justifyContent="space-between"
                  flexDirection="column"
                >
                  <Box>
                    <Box mb={2}>
                      <Typography
                        gutterBottom
                        variant="h3"
                        color="inherit"
                        sx={{ textDecoration: 'none', mb: 2 }}
                        component={Link}
                        href={`/apps/blog/detail/${linkTo}`}
                        onClick={() => dispatch(fetchBlogPost(linkTo))}
                      >
                        {title}
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                      borderRadius: 2, 
                      p: 2,
                      backdropFilter: 'blur(10px)'
                    }}>
                      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>
                        Thông số nhân vật
                      </Typography>
                      
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5} sx={{ mb: 1.5 }}>
                        {category && <Chip label={category} size="small" color="primary" sx={{ backgroundColor: 'rgba(63, 81, 181, 0.8)' }} />}
                        {game && <Chip label={`Game: ${game}`} size="small" color="secondary" variant="outlined" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />}
                        {element && <Chip label={`Hệ: ${element}`} size="small" color="success" sx={{ backgroundColor: 'rgba(76, 175, 80, 0.8)' }} />}
                      </Stack>

                      <StatRowOverlay icon={IconHandGrab} label="Sức mạnh" value={strength} />
                      <StatRowOverlay icon={IconSword} label="Tấn công" value={attack} />
                      <StatRowOverlay icon={IconShield} label="Phòng thủ" value={defense} />
                      <StatRowOverlay icon={IconHeartbeat} label="Máu" value={hp} />
                      <StatRowOverlay icon={IconShieldCheck} label="Giáp" value={armor} />
                    </Box>
                  </Box>
                </Box>
              </CoverImgStyle>
            </>
          </CoverImgBg>
        </Grid>
      ) : (
        ''
      )}
    </>
  );
};

export default BlogFeaturedCard;
