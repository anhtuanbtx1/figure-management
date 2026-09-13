/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import React, { useEffect } from "react";
import { fetchBlogPosts, fetchBlogPost } from "@/store/apps/blog/BlogSlice";
import { useRouter, usePathname, useSearchParams  } from "next/navigation";
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Breadcrumb from "@/app/(DashboardLayout)/layout/shared/breadcrumb/Breadcrumb";
import {
  IconEye,
  IconMessage2,
  IconPoint,
  IconQuote,
} from "@tabler/icons-react";
import { format } from "date-fns";
import BlogComment from "./BlogComment";
import { uniqueId } from "lodash";
import { addComment } from "@/store/apps/blog/BlogSlice";
import BlankCard from "../../../shared/BlankCard";
import { useDispatch, useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import type { BlogPostType, BlogType } from "../../../../(DashboardLayout)/types/apps/blog";


const BlogDetail = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathName = usePathname();
  
  const getTitle: string | any = pathName.split('/').pop();
  
  const [replyTxt, setReplyTxt] = React.useState("");

  useEffect(() => {
    dispatch(fetchBlogPosts());
  }, [dispatch]);

  const paramCase = (t: string) =>
    t
      .toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");

  // Get post
  const getPost = useSelector((state: AppState) => state.blogReducer.blogposts);
  console.log(getPost);
  const post: BlogPostType | any = getPost.find(
    (p: BlogPostType) => getTitle === paramCase(p.title)
  );
  
  const BCrumb = [
    {
      to: "/",
      title: "Home",
    },
    {
      to: "/apps/blog/posts",
      title: "Blog",
    },
    {
      title: "Blog post",
    },
  ];

  const onSubmit = async (id: number, reply: string) => {
    const replyId: string = uniqueId("#comm_");
    const newReply = {
      id: replyId,
      profile: {
        id: uniqueId("#REPLY_"),
        avatar: post?.author.avatar,
        name: post?.author.name,
        time: "now",
      },
      comment: reply,
      replies: [],
    };
    dispatch(addComment(id, newReply));
    dispatch(fetchBlogPost(getTitle));
    setReplyTxt("");
  };

  // skeleton
  const [isLoading, setLoading] = React.useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Box>
      <Breadcrumb title="Blog Detail" items={BCrumb} />
      {post ? (
        <>
          <BlankCard>
            <>
              {isLoading ? (
                <>
                  <Skeleton
                    animation="wave"
                    variant="rectangular"
                    width="100%"
                    sx={{
                      height: { xs: 220, sm: 340, md: 440 },
                      borderRadius: (theme) => theme.shape.borderRadius / 5,
                    }}
                  ></Skeleton>
                </>
              ) : (
                <CardMedia
                  component="img"
                  image={post?.coverImg}
                  alt={post?.title || "Character Image"}
                  sx={{
                    height: { xs: 220, sm: 340, md: 440 },
                    objectFit: 'cover',
                  }}
                />
              )}
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Stack direction="row" alignItems="center" sx={{ marginTop: { xs: "-25px", sm: "-35px", md: "-45px" } }}>
                  <Tooltip
                    title={post ? post?.author?.name || '' : ""}
                    placement="top"
                  >
                    <Avatar
                      aria-label="author avatar"
                      src={post?.author?.avatar}
                      sx={{ width: { xs: 40, sm: 48 }, height: { xs: 40, sm: 48 }, border: '2px solid white' }}
                    ></Avatar>
                  </Tooltip>
                  <Chip
                    sx={{
                      marginLeft: "auto",
                      marginTop: "-10px",
                      backgroundColor: (theme: any) => theme.palette.mode === 'dark' ? theme.palette.background.dark : 'white',
                      fontWeight: 600,
                    }}
                    label="2 min Read"
                    size="small"
                  ></Chip>
                </Stack>
                <Chip
                  label={post?.category}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ marginTop: 2, fontWeight: 600 }}
                ></Chip>
                <Box my={2.5}>
                  <Typography
                    gutterBottom
                    variant="h1"
                    fontWeight={700}
                    color="inherit"
                    sx={{
                      textDecoration: "none",
                      fontSize: { xs: '1.35rem', sm: '1.85rem', md: '2.25rem' },
                      lineHeight: 1.35,
                    }}
                  >
                    {post?.title}
                  </Typography>
                </Box>
                <Stack direction="row" gap={{ xs: 2, sm: 3 }} alignItems="center" flexWrap="wrap">
                  <Stack direction="row" gap={0.8} alignItems="center">
                    <IconEye size="18" /> <Typography variant="body2">{post?.view}</Typography>
                  </Stack>
                  <Stack direction="row" gap={0.8} alignItems="center">
                    <IconMessage2 size="18" /> <Typography variant="body2">{post?.comments?.length || 0}</Typography>
                  </Stack>

                  <Stack direction="row" ml={{ xs: 0, sm: "auto" }} alignItems="center">
                    <IconPoint size="16" />
                    <small>
                      {post?.createdAt ? (
                        <>{format(new Date(post.createdAt), "E, MMM d, yyyy")}</>
                      ) : (
                        ""
                      )}
                    </small>
                  </Stack>
                </Stack>
              </CardContent>
              <Divider />
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography variant="h2" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mb: 1.5, fontWeight: 600 }}>Title of the paragraph</Typography>
                <p style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
                  But you cannot figure out what it is or what it can do. MTA
                  web directory is the simplest way in which one can bid on a
                  link, or a few links if they wish to do so. The link directory
                  on MTA displays all of the links it currently has, and does so
                  in alphabetical order, which makes it much easier for someone
                  to find what they are looking for if it is something specific
                  and they do not want to go through all the other sites and
                  links as well. It allows you to start your bid at the bottom
                  and slowly work your way to the top of the list.
                </p>
                <p style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
                  Gigure out what it is or what it can do. MTA web directory is
                  the simplest way in which one can bid on a link, or a few
                  links if they wish to do so. The link directory on MTA
                  displays all of the links it currently has, and does so in
                  alphabetical order, which makes it much easier for someone to
                  find what they are looking for if it is something specific and
                  they do not want to go through all the other sites and links
                  as well. It allows you to start your bid at the bottom and
                  slowly work your way to the top of the
                </p>
                <Typography fontWeight={600} sx={{ my: 1 }}>This is strong text.</Typography>
                <Typography fontStyle="italic" sx={{ mb: 2 }}>This is italic text.</Typography>
                <Box my={3}>
                  <Divider />
                </Box>
                <Typography variant="h3" sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' }, mb: 1.5, fontWeight: 600 }}>Unorder list.</Typography>
                <ul style={{ paddingLeft: '1.5rem', lineHeight: 1.7 }}>
                  <li>Gigure out what it is or</li>
                  <li>The links it currently</li>
                  <li>It allows you to start your bid</li>
                  <li>Gigure out what it is or</li>
                  <li>The links it currently</li>
                  <li>It allows you to start your bid</li>
                </ul>
                <Box my={3}>
                  <Divider />
                </Box>
                <Typography variant="h3" sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' }, mb: 1.5, fontWeight: 600 }}>Order list.</Typography>
                <ol style={{ paddingLeft: '1.5rem', lineHeight: 1.7 }}>
                  <li>Gigure out what it is or</li>
                  <li>The links it currently</li>
                  <li>It allows you to start your bid</li>
                  <li>Gigure out what it is or</li>
                  <li>The links it currently</li>
                  <li>It allows you to start your bid</li>
                </ol>
                <Box my={3}>
                  <Divider />
                </Box>
                <Typography variant="h3" sx={{ fontSize: { xs: '1.1rem', sm: '1.3rem' }, mb: 1.5, fontWeight: 600 }}>Quotes</Typography>
                <Box p={{ xs: 2, sm: 3 }} mt={2} sx={{ borderRadius: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'action.hover' : 'grey.100' }}>
                  <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconQuote size={20} /> Life is short, Smile while you still have
                    teeth!
                  </Typography>
                </Box>
              </CardContent>
            </>
          </BlankCard>
          <BlankCard sx={{ mt: 3, p: 0 }}>
            <CardContent>
              <Typography variant="h4" fontWeight={600}>
                Post Comments
              </Typography>
              <br />
              <TextField
                rows={4}
                multiline
                fullWidth
                value={replyTxt}
                onChange={(e) => setReplyTxt(e.target.value)}
              ></TextField>
              <br />
              <br />
              <Button
                color="primary"
                variant="contained"
                onClick={() => onSubmit(post.id, replyTxt)}
              >
                Post Comment
              </Button>

              <Stack direction="row" gap={2} alignItems="center" mb={3} mt={5}>
                <Typography variant="h4" fontWeight={600}>
                  Comments
                </Typography>
                <Box
                  px={1.5}
                  py={1}
                  color="primary.main"
                  bgcolor={"primary.light"}
                >
                  <Typography variant="h6" fontWeight={600}>
                    {post?.comments.length}
                  </Typography>
                </Box>
              </Stack>
              <Box>
                {post?.comments?.map((comment: BlogType | any) => {
                  return (
                    <BlogComment comment={comment} key={comment.profile.id} />
                  );
                })}
              </Box>
            </CardContent>
          </BlankCard>
        </>
      ) : (
        "No found"
      )}
    </Box>
  );
};

export default BlogDetail;
