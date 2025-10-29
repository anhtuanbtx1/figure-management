import mock from "../mock";
import { Chance } from "chance";
import { random } from "lodash";
import { sub } from "date-fns";
import { uniqueId } from "lodash";
import { BlogType, BlogPostType } from "../../(DashboardLayout)/types/apps/blog";

const chance = new Chance();


const BlogComment: BlogType[] = [
  {
    id: uniqueId("#comm_"),
    profile: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-5.jpg",
      name: chance.name(),
    },
    time: chance.date(),
    comment: chance.paragraph({ sentences: 2 }),
    replies: [],
  },
  {
    id: uniqueId("#comm_"),
    profile: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-3.jpg",
      name: chance.name(),
    },
    time: chance.date(),
    comment: chance.paragraph({ sentences: 2 }),
    replies: [
      {
        id: uniqueId("#comm_"),
        profile: {
          id: chance.integer({ min: 1, max: 2000 }),
          avatar: "/images/profile/user-3.jpg",
          name: chance.name(),
        },
        time: chance.date(),
        comment: chance.paragraph({ sentences: 2 }),
      },
    ],
  },
  {
    id: uniqueId("#comm_"),
    profile: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-4.jpg",
      name: chance.name(),
    },
    time: chance.date(),
    comment: chance.paragraph({ sentences: 2 }),
    replies: [],
  },
];

const BlogPost: BlogPostType[] = [
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "Garmins Instinct Crossover is a rugged hybrid smartwatch",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img2.jpg",
    createdAt: sub(new Date(), { days: 8, hours: 6, minutes: 20 }),
    view: random(9999),
    share: random(9999),
    category: "Gadget",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-5.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Lửa",
    game: "Genshin Impact",
    strength: 4,
    attack: 5,
    defense: 3,
    hp: 4,
    armor: 3,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "After Twitter Staff Cuts, Survivors Face Radio Silence",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img1.jpg",
    createdAt: sub(new Date(), { days: 7, hours: 3, minutes: 20 }),
    view: random(9999),
    share: random(9999),
    category: "Lifestyle",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-2.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Nước",
    game: "Honkai Star Rail",
    strength: 3,
    attack: 4,
    defense: 5,
    hp: 3,
    armor: 4,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title:
      "Apple is apparently working on a new streamlined accessibility for iOS",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img3.jpg",
    createdAt: sub(new Date(), { days: 5, hours: 2, minutes: 20 }),
    view: random(9999),
    share: random(9999),
    category: "Design",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-3.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Gió",
    game: "Genshin Impact",
    strength: 5,
    attack: 3,
    defense: 4,
    hp: 5,
    armor: 3,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "Why Figma is selling to Adobe for $20 billion",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img4.jpg",
    createdAt: sub(new Date(), { days: 7, hours: 6, minutes: 20 }),
    view: random(9999),
    share: random(9999),
    category: "Design",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-4.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Đất",
    game: "League of Legends",
    strength: 4,
    attack: 4,
    defense: 3,
    hp: 4,
    armor: 5,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "Streaming video way before it was cool, go dark tomorrow",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img5.jpg",
    createdAt: sub(new Date(), { days: 4, hours: 6, minutes: 20 }),
    view: random(9999),
    share: random(9999),
    category: "Lifestyle",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-5.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Sấm",
    game: "Genshin Impact",
    strength: 2,
    attack: 5,
    defense: 4,
    hp: 3,
    armor: 4,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "As yen tumbles, gadget-loving Japan goes for secondhand iPhones ",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img6.jpg",
    createdAt: sub(new Date(), { days: 2, hours: 6, minutes: 20 }),
    view: random(9999),
    share: random(9999),
    category: "Gadget",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-6.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Băng",
    game: "Dota 2",
    strength: 5,
    attack: 4,
    defense: 5,
    hp: 5,
    armor: 4,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title:
      "Intel loses bid to revive antitrust case against patent foe Fortress",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img11.jpg",
    createdAt: sub(new Date(), { days: 3, hours: 6, minutes: 20 }),
    view: random(9999),
    share: random(9999),
    category: "Social",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-2.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Ánh sáng",
    game: "Honkai Star Rail",
    strength: 3,
    attack: 3,
    defense: 5,
    hp: 4,
    armor: 5,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "COVID outbreak deepens as more lockdowns loom in China",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img8.jpg",
    createdAt: sub(new Date(), { days: 4, hours: 6, minutes: 20 }),
    view: random(9999),
    share: random(9999),
    category: "Health",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-3.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Bóng tối",
    game: "League of Legends",
    strength: 4,
    attack: 3,
    defense: 3,
    hp: 5,
    armor: 3,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "Early Black Friday Amazon deals: cheap TVs, headphones, laptops",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img9.jpg",
    createdAt: sub(new Date(), { days: 5, hours: 3, minutes: 20 }),
    view: random(9999),
    share: random(9999),
    category: "Gadget",
    featured: true,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-4.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Lửa",
    game: "Genshin Impact",
    strength: 5,
    attack: 5,
    defense: 4,
    hp: 5,
    armor: 5,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "The Future of AI in Modern Technology",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img2.jpg",
    createdAt: sub(new Date(), { days: 6, hours: 2, minutes: 30 }),
    view: random(9999),
    share: random(9999),
    category: "Technology",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-4.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Thần",
    game: "Honkai Star Rail",
    strength: 5,
    attack: 5,
    defense: 5,
    hp: 5,
    armor: 5,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "Top Gaming Strategies for Competitive Players",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img3.jpg",
    createdAt: sub(new Date(), { days: 1, hours: 4, minutes: 15 }),
    view: random(9999),
    share: random(9999),
    category: "Gaming",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-6.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Gió",
    game: "League of Legends",
    strength: 4,
    attack: 5,
    defense: 3,
    hp: 4,
    armor: 3,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "Web3 Revolution: What You Need to Know",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img4.jpg",
    createdAt: sub(new Date(), { days: 3, hours: 8, minutes: 45 }),
    view: random(9999),
    share: random(9999),
    category: "Technology",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-2.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Nước",
    game: "Genshin Impact",
    strength: 3,
    attack: 4,
    defense: 4,
    hp: 3,
    armor: 4,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "Best Practices for Modern UI/UX Design",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img5.jpg",
    createdAt: sub(new Date(), { days: 2, hours: 5, minutes: 10 }),
    view: random(9999),
    share: random(9999),
    category: "Design",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-3.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Đất",
    game: "Dota 2",
    strength: 4,
    attack: 3,
    defense: 5,
    hp: 4,
    armor: 4,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "Cloud Computing Trends in 2025",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img6.jpg",
    createdAt: sub(new Date(), { days: 5, hours: 7, minutes: 25 }),
    view: random(9999),
    share: random(9999),
    category: "Technology",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-5.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Sấm",
    game: "Honkai Star Rail",
    strength: 5,
    attack: 4,
    defense: 4,
    hp: 5,
    armor: 5,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "Mobile First Development Strategies",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img11.jpg",
    createdAt: sub(new Date(), { days: 4, hours: 3, minutes: 50 }),
    view: random(9999),
    share: random(9999),
    category: "Development",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-4.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Băng",
    game: "Genshin Impact",
    strength: 3,
    attack: 3,
    defense: 4,
    hp: 4,
    armor: 3,
  },
  {
    id: chance.integer({ min: 1, max: 2000 }),
    title: "Cybersecurity Best Practices for 2025",
    content: chance.paragraph({ sentences: 2 }),
    coverImg: "/images/blog/blog-img8.jpg",
    createdAt: sub(new Date(), { days: 1, hours: 9, minutes: 5 }),
    view: random(9999),
    share: random(9999),
    category: "Security",
    featured: false,
    author: {
      id: chance.integer({ min: 1, max: 2000 }),
      avatar: "/images/profile/user-6.jpg",
      name: chance.name(),
    },
    comments: BlogComment,
    element: "Ánh sáng",
    game: "League of Legends",
    strength: 5,
    attack: 3,
    defense: 5,
    hp: 3,
    armor: 5,
  },
];

mock.onGet("/api/data/blog/BlogPosts").reply(() => {
  return [200, BlogPost];
});

// ----------------------------------------------------------------------
mock.onPost("/api/data/blog/post").reply((config) => {
  try {
    const { title } = JSON.parse(config.data);
    const paramCase = (t: string) =>
      t
        .toLowerCase()
        .replace(/ /g, "-")
        .replace(/[^\w-]+/g, "");

    const post = BlogPost.find((_post) => paramCase(_post.title) === title);

    if (!post) {
      return [404, { message: "Post not found" }];
    }

    return [200, { post }];
  } catch (error) {
    console.error(error);

    return [500, { message: "Internal server error" }];
  }
});

mock.onPost("/api/data/blog/post/add").reply((config) => {
  try {
    const { postId, comment } = JSON.parse(config.data);
    const postIndex = BlogPost.findIndex((x) => x.id === postId);
    const post = BlogPost[postIndex];
    const cComments = post.comments || [];
    post.comments = [comment, ...cComments];

    return [200, { posts: [...BlogPost] }];
  } catch (err) {
    console.error(err);

    return [500, { message: "Internal server error" }];
  }
});
