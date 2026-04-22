// Notifications dropdown

interface notificationType {
  avatar: string;
  title: string;
  subtitle: string;
}

const notifications: notificationType[] = [
  {
    avatar: "/images/profile/user-2.jpg",
    title: "Roman Joined the Team!",
    subtitle: "Congratulate him",
  },
  {
    avatar: "/images/profile/user-3.jpg",
    title: "New message received",
    subtitle: "Salma sent you new message",
  },
  {
    avatar: "/images/profile/user-4.jpg",
    title: "New Payment received",
    subtitle: "Check your earnings",
  },
  {
    avatar: "/images/profile/user-5.jpg",
    title: "Jolly completed tasks",
    subtitle: "Assign her new tasks",
  },
  {
    avatar: "/images/profile/user-6.jpg",
    title: "Roman Joined the Team!",
    subtitle: "Congratulate him",
  },
  {
    avatar: "/images/profile/user-7.jpg",
    title: "New message received",
    subtitle: "Salma sent you new message",
  },
  {
    avatar: "/images/profile/user-8.jpg",
    title: "New Payment received",
    subtitle: "Check your earnings",
  },
  {
    avatar: "/images/profile/user-9.jpg",
    title: "Jolly completed tasks",
    subtitle: "Assign her new tasks",
  },
];

//
// Profile dropdown
//
interface ProfileType {
  href: string;
  title: string;
  subtitle: string;
  icon: any;
}
const profile: ProfileType[] = [
  {
    href: "/apps/user-profile/profile",
    title: "My Profile",
    subtitle: "Account Settings",
    icon: "/images/svgs/icon-account.svg",
  },
];

// apps dropdown

interface appsLinkType {
  href: string;
  title: string;
  subtext: string;
  avatar: string;
}

const appsLink: appsLinkType[] = [
  {
    href: "/apps/calendar",
    title: "Calendar App",
    subtext: "Get dates",
    avatar: "/images/svgs/icon-dd-date.svg",
  },
  {
    href: "/apps/contacts",
    title: "Contact Application",
    subtext: "2 Unsaved Contacts",
    avatar: "/images/svgs/icon-dd-mobile.svg",
  },
  {
    href: "/apps/blog/post",
    title: "Blog App",
    subtext: "added new blog",
    avatar: "/images/svgs/icon-dd-application.svg",
  },
];

interface LinkType {
  href: string;
  title: string;
}

const pageLinks: LinkType[] = [
  {
    href: "/theme-pages/pricing",
    title: "Pricing Page",
  },
  {
    href: "/auth/auth1/login",
    title: "Authentication Design",
  },
  {
    href: "/auth/auth1/register",
    title: "Register Now",
  },
  {
    href: "/404",
    title: "404 Error Page",
  },
  {
    href: "/apps/user-profile/profile",
    title: "User Application",
  },
  {
    href: "/apps/blog/post",
    title: "Blog Design",
  },
];

export { notifications,  profile, pageLinks, appsLink };
