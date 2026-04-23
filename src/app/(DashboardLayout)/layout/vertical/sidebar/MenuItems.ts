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
    title: "Quản lý cá Guppy",
    icon: IconFlask,
    href: "/apps/guppy-breeding",
  },
  {
    id: uniqueId(),
    title: "Quản lý giặt ủi",
    icon: IconFileCheck,
    href: "/apps/laundry-orders",
    children: [
      {
        id: uniqueId(),
        title: "Danh sách đơn",
        icon: IconPoint,
        href: "/apps/laundry-orders/list",
      },
      {
        id: uniqueId(),
        title: "Khách hàng",
        icon: IconPoint,
        href: "/apps/laundry-orders/customers",
      },
      {
        id: uniqueId(),
        title: "Báo cáo giặt ủi",
        icon: IconPoint,
        href: "/apps/laundry-orders/reports",
      },
    ],
  },
  {
    id: uniqueId(),
    title: "Quản lý đội hình",
    icon: IconBallFootball,
    href: "/apps/football-lineup",
    chip: "New",
    chipColor: "success",
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
    title: "Xin nghỉ phép",
    icon: IconCalendar,
    href: "/apps/leave-requests",
  },
  {
    id: uniqueId(),
    title: "Ghi bảng lương nhân sự",
    icon: IconCurrencyDollar,
    href: "/apps/payroll",
    children: [
      {
        id: uniqueId(),
        title: "Import Excel",
        icon: IconPoint,
        href: "/apps/payroll/import",
      },
      {
        id: uniqueId(),
        title: "Danh sách bảng lương",
        icon: IconPoint,
        href: "/apps/payroll/list",
      },
      {
        id: uniqueId(),
        title: "Thống kê lương nhân viên",
        icon: IconPoint,
        href: "/apps/payroll/statistics",
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

  ];

export default Menuitems;
