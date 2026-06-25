import {
  IconPoint,
  IconCalendar,
  IconCurrencyDollar,
  IconAperture,
  IconWallet,
  IconUsers,
  IconNotebook,
  IconFileCheck,
  IconBell,
  IconClock,
  IconFlask,
  IconBallFootball,
  IconBox,
  IconDatabase,
  IconSettings,
} from "@tabler/icons-react";

export interface MenuitemsType {
  [x: string]: any;
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: any;
  iconName?: string;
  href?: string;
  children?: MenuitemsType[];
  chip?: string;
  chipColor?: string;
  variant?: string;
  external?: boolean;
  allowedRoles?: string[];
}

export const IconMap: { [key: string]: any } = {
  IconPoint,
  IconCalendar,
  IconCurrencyDollar,
  IconAperture,
  IconWallet,
  IconUsers,
  IconNotebook,
  IconFileCheck,
  IconBell,
  IconClock,
  IconFlask,
  IconBallFootball,
  IconBox,
  IconDatabase,
  IconSettings,
};

// Helper function to map iconName string back to Icon React Component
export function mapMenuIcons(items: MenuitemsType[]): MenuitemsType[] {
  return items.map((item) => {
    const newItem = { ...item };
    if (newItem.iconName && IconMap[newItem.iconName]) {
      newItem.icon = IconMap[newItem.iconName];
    }
    if (newItem.children) {
      newItem.children = mapMenuIcons(newItem.children);
    }
    return newItem;
  });
}

const Menuitems: MenuitemsType[] = [
  {
    navlabel: true,
    subheader: "Home",
  },
  {
    id: "home",
    title: "Trang chủ",
    icon: IconAperture,
    iconName: "IconAperture",
    href: "/",
    chipColor: "secondary",
  },
  {
    id: "blog",
    title: "Quản lý nhân vật",
    icon: IconWallet,
    iconName: "IconWallet",
    href: "/apps/blog",
  },
  {
    id: "wallet",
    title: "Quản lý ví",
    icon: IconWallet,
    iconName: "IconWallet",
    href: "/apps/wallet",
  },
  {
    id: "toy-management",
    title: "Quản lý đồ chơi",
    icon: IconBox,
    iconName: "IconBox",
    href: "/apps/toy-management",
  },
  {
    id: "laundry-orders",
    title: "Quản lý giặt ủi",
    icon: IconFileCheck,
    iconName: "IconFileCheck",
    href: "/apps/laundry-orders",
    children: [
      {
        id: "laundry-orders-list",
        title: "Danh sách đơn",
        icon: IconPoint,
        iconName: "IconPoint",
        href: "/apps/laundry-orders/list",
      },
      {
        id: "laundry-orders-customers",
        title: "Khách hàng",
        icon: IconPoint,
        iconName: "IconPoint",
        href: "/apps/laundry-orders/customers",
      },
      {
        id: "laundry-orders-reports",
        title: "Báo cáo giặt ủi",
        icon: IconPoint,
        iconName: "IconPoint",
        href: "/apps/laundry-orders/reports",
      },
    ],
  },
  {
    id: "db-manager",
    title: "Quản lý Database",
    icon: IconDatabase,
    iconName: "IconDatabase",
    href: "/apps/db-manager",
  },
  {
    id: "menu-manager",
    title: "Quản lý Menu",
    icon: IconSettings,
    iconName: "IconSettings",
    href: "/apps/menu-manager",
    isAdminOnly: true,
  },
  {
    id: "football-lineup",
    title: "Quản lý đội hình",
    icon: IconBallFootball,
    iconName: "IconBallFootball",
    href: "/apps/football-lineup",
  },
  {
    id: "event-guests",
    title: "Quản lý khách mời sự kiện",
    icon: IconUsers,
    iconName: "IconUsers",
    href: "/apps/event-guests",
  },
  {
    id: "kanban",
    title: "Kanban",
    icon: IconNotebook,
    iconName: "IconNotebook",
    href: "/apps/kanban",
  },
  {
    id: "leave-requests",
    title: "Xin nghỉ phép",
    icon: IconCalendar,
    iconName: "IconCalendar",
    href: "/apps/leave-requests",
  },
  {
    id: "payroll",
    title: "Ghi bảng lương nhân sự",
    icon: IconCurrencyDollar,
    iconName: "IconCurrencyDollar",
    href: "/apps/payroll",
    children: [
      {
        id: "payroll-import",
        title: "Import Excel",
        icon: IconPoint,
        iconName: "IconPoint",
        href: "/apps/payroll/import",
      },
      {
        id: "payroll-list",
        title: "Danh sách bảng lương",
        icon: IconPoint,
        iconName: "IconPoint",
        href: "/apps/payroll/list",
      },
      {
        id: "payroll-statistics",
        title: "Thống kê lương nhân viên",
        icon: IconPoint,
        iconName: "IconPoint",
        href: "/apps/payroll/statistics",
      },
    ],
  },
  {
    id: "reminders",
    title: "Nhắc nhở",
    icon: IconBell,
    iconName: "IconBell",
    href: "/apps/reminders",
    children: [
      {
        id: "reminders-list",
        title: "Danh sách nhắc nhở",
        icon: IconPoint,
        iconName: "IconPoint",
        href: "/apps/reminders/list",
      },
      {
        id: "reminders-create",
        title: "Tạo nhắc nhở mới",
        icon: IconPoint,
        iconName: "IconPoint",
        href: "/apps/reminders/create",
      },
      {
        id: "reminders-calendar",
        title: "Lịch nhắc nhở",
        icon: IconClock,
        iconName: "IconClock",
        href: "/apps/reminders/calendar",
      },
      {
        id: "reminders-telegram-settings",
        title: "Cài đặt Telegram",
        icon: IconPoint,
        iconName: "IconPoint",
        href: "/apps/reminders/telegram-settings",
      },
    ],
  },
];

export default Menuitems;
