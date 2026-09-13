import React from 'react';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { IconArrowBackUp, IconCircle } from '@tabler/icons-react';
import { BlogType } from '../../../../(DashboardLayout)/types/apps/blog';

const BlogComment = ({ comment }: BlogType | any) => {
  const [showReply, setShowReply] = React.useState(false);

  return (
    <>
      <Box mt={2} p={{ xs: 2, sm: 3 }} sx={{ borderRadius: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'action.hover' : 'grey.100' }}>
        <Stack direction={'row'} gap={2} alignItems="center" flexWrap="wrap">
          <Avatar
            alt="Remy Sharp"
            src={comment?.profile.avatar}
            sx={{ width: '33px', height: '33px' }}
          />
          <Typography variant="h6" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>{comment?.profile.name}</Typography>
          <Typography variant="caption" color="textSecondary">
            <>
              <IconCircle size="7" fill="" fillOpacity={'0.1'} strokeOpacity="0.1" />{' '}
              {comment?.profile.time}
            </>
          </Typography>
        </Stack>
        <Box py={1.5}>
          <Typography color="textSecondary" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>{comment?.comment}</Typography>
        </Box>
        <Stack direction="row" gap={1} alignItems="center">
          <Tooltip title="Reply" placement="top">
            <Fab size="small" color="info" onClick={() => setShowReply(!showReply)}>
              <IconArrowBackUp size="16" />
            </Fab>
          </Tooltip>
        </Stack>
      </Box>
      {comment?.replies ? (
        <>
          {comment?.replies.map((reply: BlogType | any) => {
            return (
              <Box sx={{ pl: { xs: 1.5, sm: 3.5 } }} key={reply.comment}>
                <Box mt={1.5} p={{ xs: 2, sm: 3 }} sx={{ borderRadius: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'action.hover' : 'grey.100' }}>
                  <Stack direction={'row'} gap={2} alignItems="center" flexWrap="wrap">
                    <Avatar alt="Remy Sharp" src={reply.profile.avatar} sx={{ width: '30px', height: '30px' }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>{reply.profile.name}</Typography>
                    <Typography variant="caption" color="textSecondary">
                      <IconCircle size="7" fill="" fillOpacity={'0.1'} strokeOpacity="0.1" />{' '}
                      {reply.profile.time}
                    </Typography>
                  </Stack>
                  <Box py={1.5}>
                    <Typography color="textSecondary" sx={{ fontSize: { xs: '0.85rem', sm: '0.95rem' } }}>{reply.comment}</Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </>
      ) : (
        ''
      )}
      {showReply ? (
        <Box p={{ xs: 1.5, sm: 2 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
            <Stack direction="row" gap={1.5} alignItems="center">
              <Avatar
                alt="Remy Sharp"
                src={comment?.profile.avatar}
                sx={{ width: '33px', height: '33px' }}
              />
              <Typography variant="subtitle2" sx={{ display: { xs: 'block', sm: 'none' } }}>Trả lời</Typography>
            </Stack>
            <TextField placeholder="Reply..." variant="outlined" fullWidth size="small" />
            <Button variant="contained" color="primary">Reply</Button>
          </Stack>
        </Box>
      ) : (
        ''
      )}
    </>
  );
};

export default BlogComment;
