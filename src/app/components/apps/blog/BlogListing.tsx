'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import BlogCard from './BlogCard';
import { orderBy } from 'lodash';
import { useSelector, useDispatch } from '@/store/hooks';
import { fetchBlogPosts } from '@/store/apps/blog/BlogSlice';
import BlogFeaturedCard from './BlogFeaturedCard';
import { BlogPostType } from '../../../(DashboardLayout)/types/apps/blog';

const ITEMS_PER_PAGE = 9;

const BlogListing = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchBlogPosts());
  }, [dispatch]);

  
  const filterBlogs = (posts: BlogPostType[], sortBy: string, _cSearch: string) => {
    // SORT BY

    if (sortBy === 'newest') {
      posts = orderBy(posts, ['createdAt'], ['desc']);
    }
    if (sortBy === 'oldest') {
      posts = orderBy(posts, ['createdAt'], ['asc']);
    }
    if (sortBy === 'popular') {
      posts = orderBy(posts, ['view'], ['desc']);
    }
    if (posts) {
      return (posts = posts.filter((t) => t.featured === false));
    }

    return posts;
  };

  const filterFeaturedpost = (posts: BlogPostType[]) => {
    return (posts = posts.filter((t) => t.featured));
  }; 

  const blogPosts = useSelector((state) =>
    filterBlogs(
      state.blogReducer.blogposts,
      state.blogReducer.sortBy,
      state.blogReducer.blogSearch,
    ),
  );
  const featuredPost = useSelector((state) => filterFeaturedpost(state.blogReducer.blogposts));

  // Combine all posts for pagination
  const allPosts = [...featuredPost, ...blogPosts];
  const totalPages = Math.ceil(allPosts.length / ITEMS_PER_PAGE);
  
  // Get posts for current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentPosts = allPosts.slice(startIndex, endIndex);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Grid container spacing={3}>
      {currentPosts.map((post, index) => {
        return <BlogCard post={post} key={post.id || `post-${index}`} />;
      })}
      
      {totalPages > 1 && (
        <Grid item xs={12} mt={3}>
          <Pagination 
            count={totalPages} 
            page={currentPage}
            onChange={handlePageChange}
            color="primary" 
            sx={{ display: 'flex', justifyContent: 'center' }} 
          />
        </Grid>
      )}
    </Grid>
  );
};

export default BlogListing;
