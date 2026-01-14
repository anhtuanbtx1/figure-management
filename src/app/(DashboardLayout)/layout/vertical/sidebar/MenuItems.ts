import { uniqueId } from "lodash";

interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
}
import {
  IconAward,
  IconBoxMultiple,
  IconPoint,
  IconAlertCircle,
  IconNotes,
  IconCalendar,
  IconMail,
  IconTicket,
  IconEdit,
  IconGitMerge,
  IconCurrencyDollar,
  IconApps,
  IconFileDescription,
  IconFileDots,
  IconFiles,
  IconBan,
  IconStar,
  IconMoodSmile,
  IconBorderAll,
  IconBorderHorizontal,
  IconBorderInner,
  IconBorderVertical,
  IconBorderTop,
  IconUserCircle,
  IconPackage,
  IconMessage2,
  IconBasket,
  IconChartLine,
  IconChartArcs,
  IconChartCandle,
  IconChartArea,
  IconChartDots,
  IconChartDonut3,
  IconChartRadar,
  IconLogin,
  IconUserPlus,
  IconRotate,
  IconBox,
  IconAperture,
  IconShoppingCart,
  IconHelp,
  IconBoxAlignBottom,
  IconBoxAlignLeft,
  IconClipboardList,
  IconFile,
  IconBorderStyle2,
  IconAppWindow,
  IconLockAccess,
  IconZoomCode,
  IconRotateClockwise,
  IconUserCheck,
  IconSettings,
  IconLogin2,
  IconAlertTriangle,
  IconUserX,
  IconMessages,
  IconMessage,
  IconBasketPlus,
  IconChartPie,
  IconChartBar,
  IconChartLine as IconChartLineAlt,
  IconWallet,
  IconUsers,
  IconNotebook,
  IconFileCheck,
  IconLayout,
  IconBell,
  IconClock,
} from "@tabler/icons-react";

const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "Home",
  },

  {
    id: uniqueId(),
    title: "Trang chủ",
    icon: IconAperture,
    href: "/",
    //chip: "New",
    chipColor: "secondary",
  },
  {
    id: uniqueId(),
    title: "eCommerce",
    icon: IconShoppingCart,
    href: "/dashboards/ecommerce",
  },
  {
    id: uniqueId(),
    title: "Quản lý nhân vật",
    icon: IconWallet,
    href: "/apps/blog",
  },
  {
    id: uniqueId(),
    title: "Quản lý ví",
    icon: IconWallet,
    href: "/apps/wallet",
  },
  {
    id: uniqueId(),
    title: "Quản lý đồ chơi",
    icon: IconBox,
    href: "/apps/toy-management",
  },
  {
    id: uniqueId(),
    title: "Quản lý khách mời sự kiện",
    icon: IconUsers,
    href: "/apps/event-guests",
  },
  {
    id: uniqueId(),
    title: "Kanban",
    icon: IconNotebook,
    href: "/apps/kanban",
  },
  {
    id: uniqueId(),
    title: "Hóa đơn",
    icon: IconFileCheck,
    href: "/apps/invoice/list",
  },
  {
    id: uniqueId(),
    title: "Quản lý giặt ủi",
    icon: IconShoppingCart,
    href: "/apps/laundry-orders",
    children: [
      {
        id: uniqueId(),
        title: "Danh sách đơn hàng",
        icon: IconPoint,
        href: "/apps/laundry-orders/list",
      },
      {
        id: uniqueId(),
        title: "Quản lý khách hàng",
        icon: IconPoint,
        href: "/apps/laundry-orders/customers",
      },
      {
        id: uniqueId(),
        title: "Báo cáo thống kê",
        icon: IconPoint,
        href: "/apps/laundry-orders/reports",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Nhắc nhở",
    icon: IconBell,
    href: "/apps/reminders",
    children: [
      {
        id: uniqueId(),
        title: "Danh sách nhắc nhở",
        icon: IconPoint,
        href: "/apps/reminders/list",
      },
      {
        id: uniqueId(),
        title: "Tạo nhắc nhở mới",
        icon: IconPoint,
        href: "/apps/reminders/create",
      },
      {
        id: uniqueId(),
        title: "Lịch nhắc nhở",
        icon: IconClock,
        href: "/apps/reminders/calendar",
      },
      {
        id: uniqueId(),
        title: "Cài đặt Telegram",
        icon: IconPoint,
        href: "/apps/reminders/telegram-settings",
      },
    ],
  },
  {
    navlabel: true,
    subheader: "Pages",
  },
  {
    id: uniqueId(),
    title: "Roll Base Access",
    icon: IconLockAccess,
    href: "/theme-pages/casl",
  },
  {
    id: uniqueId(),
    title: "Treeview",
    icon: IconGitMerge,
    href: "/theme-pages/treeview",
  },
  {
    id: uniqueId(),
    title: "Pricing",
    icon: IconCurrencyDollar,
    href: "/theme-pages/pricing",
  },
  {
    id: uniqueId(),
    title: "Account Setting",
    icon: IconUserCircle,
    href: "/theme-pages/account-settings",
  },
  {
    id: uniqueId(),
    title: "FAQ",
    icon: IconHelp,
    href: "/theme-pages/faq",
  },
  {
    id: uniqueId(),
    title: "Widgets",
    icon: IconLayout,
    href: "/widgets/cards",
    children: [
      {
        id: uniqueId(),
        title: "Cards",
        icon: IconPoint,
        href: "/widgets/cards",
      },
      {
        id: uniqueId(),
        title: "Banners",
        icon: IconPoint,
        href: "/widgets/banners",
      },
      {
        id: uniqueId(),
        title: "Charts",
        icon: IconPoint,
        href: "/widgets/charts",
      },
    ],
  },
  {
    navlabel: true,
    subheader: "Auth",
  },
  {
    id: uniqueId(),
    title: "Login",
    icon: IconLogin,
    href: "/authentication/login",
    children: [
      {
        id: uniqueId(),
        title: "Side Login",
        icon: IconPoint,
        href: "/authentication/login",
      },
      {
        id: uniqueId(),
        title: "Boxed Login",
        icon: IconPoint,
        href: "/authentication/login2",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Register",
    icon: IconUserPlus,
    href: "/authentication/register",
    children: [
      {
        id: uniqueId(),
        title: "Side Register",
        icon: IconPoint,
        href: "/authentication/register",
      },
      {
        id: uniqueId(),
        title: "Boxed Register",
        icon: IconPoint,
        href: "/authentication/register2",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Forgot Password",
    icon: IconRotate,
    href: "/authentication/forgot-password",
    children: [
      {
        id: uniqueId(),
        title: "Side Forgot Password",
        icon: IconPoint,
        href: "/authentication/forgot-password",
      },
      {
        id: uniqueId(),
        title: "Boxed Forgot Password",
        icon: IconPoint,
        href: "/authentication/forgot-password2",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Two Steps",
    icon: IconZoomCode,
    href: "/authentication/two-steps",
    children: [
      {
        id: uniqueId(),
        title: "Side Two Steps",
        icon: IconPoint,
        href: "/authentication/two-steps",
      },
      {
        id: uniqueId(),
        title: "Boxed Two Steps",
        icon: IconPoint,
        href: "/authentication/two-steps2",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Error",
    icon: IconAlertCircle,
    href: "/authentication/error",
  },
  {
    id: uniqueId(),
    title: "Maintenance",
    icon: IconSettings,
    href: "/authentication/maintenance",
  },
];

export default Menuitems;
