'use client'
import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Pagination from '@mui/material/Pagination';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import { IconSearch, IconFilter, IconSortAscending, IconSortDescending } from '@tabler/icons-react';
import BlogCard from './BlogCard';
import { orderBy } from 'lodash';
import { useSelector, useDispatch } from '@/store/hooks';
import { fetchBlogPosts, SearchBlog, SortBlog } from '@/store/apps/blog/BlogSlice';
import BlogFeaturedCard from './BlogFeaturedCard';
import { BlogPostType } from '../../../(DashboardLayout)/types/apps/blog';

const ITEMS_PER_PAGE = 10;

const BlogListing = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [gameFilter, setGameFilter] = useState('all');
  const [elementFilter, setElementFilter] = useState('all');

  useEffect(() => {
    dispatch(fetchBlogPosts());
  }, [dispatch]);

  
  const filterBlogs = (posts: BlogPostType[], sortBy: string, cSearch: string) => {
    let filteredPosts = [...posts];

    // SEARCH FILTER
    if (cSearch) {
      filteredPosts = filteredPosts.filter((post: any) => 
        post.title?.toLowerCase().includes(cSearch.toLowerCase()) ||
        post.category?.toLowerCase().includes(cSearch.toLowerCase()) ||
        post.game?.toLowerCase().includes(cSearch.toLowerCase()) ||
        post.element?.toLowerCase().includes(cSearch.toLowerCase())
      );
    }

    // CATEGORY FILTER
    if (categoryFilter !== 'all') {
      filteredPosts = filteredPosts.filter((post: any) => post.category === categoryFilter);
    }

    // GAME FILTER
    if (gameFilter !== 'all') {
      filteredPosts = filteredPosts.filter((post: any) => post.game === gameFilter);
    }

    // ELEMENT FILTER
    if (elementFilter !== 'all') {
      filteredPosts = filteredPosts.filter((post: any) => post.element === elementFilter);
    }

    // SORT BY
    if (sortBy === 'newest') {
      filteredPosts = orderBy(filteredPosts, ['createdAt', 'id'], ['desc', 'desc']);
    }
    if (sortBy === 'oldest') {
      filteredPosts = orderBy(filteredPosts, ['createdAt', 'id'], ['asc', 'asc']);
    }
    if (sortBy === 'popular') {
      filteredPosts = orderBy(filteredPosts, ['view', 'id'], ['desc', 'desc']);
    }
    if (sortBy === 'name-asc') {
      filteredPosts = orderBy(filteredPosts, [(post: any) => post.title?.toLowerCase(), 'id'], ['asc', 'asc']);
    }
    if (sortBy === 'name-desc') {
      filteredPosts = orderBy(filteredPosts, [(post: any) => post.title?.toLowerCase(), 'id'], ['desc', 'desc']);
    }

    return filteredPosts;
  }; 

  const blogPosts = useSelector((state) =>
    filterBlogs(
      state.blogReducer.blogposts,
      state.blogReducer.sortBy,
      state.blogReducer.blogSearch,
    ),
  );

  // Get all unique categories, games, and elements for filters
  const allPosts = useSelector((state) => state.blogReducer.blogposts);
  const categories = ['all', ...Array.from(new Set(allPosts.map((post: any) => post.category).filter(Boolean)))];
  const games = ['all', ...Array.from(new Set(allPosts.map((post: any) => post.game).filter(Boolean)))];
  const elements = ['all', ...Array.from(new Set(allPosts.map((post: any) => post.element).filter(Boolean)))];

  // Pagination - cố định 10 nhân vật mỗi trang
  const totalPosts = blogPosts.length;
  const totalPages = Math.ceil(totalPosts / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalPosts);
  const currentPosts = blogPosts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Tự động chuyển về trang 1 nếu bộ lọc làm giảm số trang nhỏ hơn currentPage
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    dispatch(SearchBlog(value));
    setCurrentPage(1);
  };

  const handleSortChange = (value: string) => {
    dispatch(SortBlog(value));
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchInput('');
    setCategoryFilter('all');
    setGameFilter('all');
    setElementFilter('all');
    dispatch(SearchBlog(''));
    dispatch(SortBlog('newest'));
    setCurrentPage(1);
  };

  const activeFiltersCount = [
    categoryFilter !== 'all',
    gameFilter !== 'all',
    elementFilter !== 'all',
    searchInput !== ''
  ].filter(Boolean).length;

  return (
    <Box>
      {/* Search Header */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 600 }}>
          Tìm kiếm nhân vật
        </Typography>
        <Typography variant="subtitle1" color="textSecondary" sx={{ mb: 3 }}>
          Khám phá và tìm kiếm nhân vật yêu thích của bạn
        </Typography>
        
        {/* Main Search Box */}
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên, danh mục, game, hệ..."
          value={searchInput}
          onChange={(e) => handleSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <IconSearch size={24} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 800,
            '& .MuiOutlinedInput-root': {
              fontSize: '1.1rem',
              padding: '8px',
            },
          }}
        />
      </Box>

      {/* Filters and Sort */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
          <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setCurrentPage(1);
                }}
                label="Danh mục"
              >
                {categories.map((cat: string) => (
                  <MenuItem key={cat} value={cat}>
                    {cat === 'all' ? 'Tất cả' : cat}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Game</InputLabel>
              <Select
                value={gameFilter}
                onChange={(e) => {
                  setGameFilter(e.target.value);
                  setCurrentPage(1);
                }}
                label="Game"
              >
                {games.map((game: string) => (
                  <MenuItem key={game} value={game}>
                    {game === 'all' ? 'Tất cả' : game}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Hệ</InputLabel>
              <Select
                value={elementFilter}
                onChange={(e) => {
                  setElementFilter(e.target.value);
                  setCurrentPage(1);
                }}
                label="Hệ"
              >
                {elements.map((elem: string) => (
                  <MenuItem key={elem} value={elem}>
                    {elem === 'all' ? 'Tất cả' : elem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {activeFiltersCount > 0 && (
              <Chip
                label={`${activeFiltersCount} bộ lọc`}
                onDelete={handleClearFilters}
                color="primary"
                variant="outlined"
                sx={{ height: 40 }}
              />
            )}
          </Stack>

          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Sắp xếp</InputLabel>
            <Select
              value={useSelector((state) => state.blogReducer.sortBy)}
              onChange={(e) => handleSortChange(e.target.value)}
              label="Sắp xếp"
            >
              <MenuItem value="newest">Mới nhất</MenuItem>
              <MenuItem value="oldest">Cũ nhất</MenuItem>
              <MenuItem value="popular">Phổ biến</MenuItem>
              <MenuItem value="name-asc">Tên A-Z</MenuItem>
              <MenuItem value="name-desc">Tên Z-A</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Box>

      {/* Results Count & Page Summary */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="body1" color="textSecondary">
          Tìm thấy <strong>{totalPosts}</strong> nhân vật
          {searchInput && ` cho "${searchInput}"`}
        </Typography>
        {totalPosts > 0 && (
          <Typography variant="body2" color="textSecondary">
            Trang <strong>{currentPage}</strong> / <strong>{totalPages || 1}</strong> (10 nhân vật / trang)
          </Typography>
        )}
      </Box>

      {/* Results Grid */}
      <Grid container spacing={2.5} columns={{ xs: 12, sm: 12, md: 10, lg: 10 }}>
        {currentPosts.length > 0 ? (
          currentPosts.map((post, index) => {
            return <BlogCard post={post} key={`${post.id}-${post.title}-${index}`} />;
          })
        ) : (
          <Grid item xs={12} sm={12} md={10} lg={10}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h5" color="textSecondary" sx={{ mb: 2 }}>
                Không tìm thấy nhân vật nào
              </Typography>
              <Typography variant="body1" color="textSecondary">
                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
      
      {/* Pagination Toolbar */}
      {totalPosts > 0 && (
        <Box
          sx={{
            mt: 4,
            p: 2,
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : '#fcfcfc',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          {/* Thông tin số lượng item */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label="10 / trang"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
            <Typography variant="body2" color="textSecondary">
              Hiển thị <strong>{startIndex + 1}</strong> – <strong>{endIndex}</strong> trong tổng số <strong>{totalPosts}</strong> nhân vật
            </Typography>
          </Stack>

          {/* Nút phân trang */}
          {totalPages > 1 && (
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              shape="rounded"
              variant="outlined"
              size="medium"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  fontWeight: 600,
                },
                '& .Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: '#fff !important',
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default BlogListing;
