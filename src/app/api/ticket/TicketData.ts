import mock from '../mock';
import { Chance } from 'chance';
import { TicketType } from '@/app/(DashboardLayout)/types/apps/ticket';

const chance = new Chance();

const TicketData: TicketType[] = [
  {
    Id: 1,
    ticketTitle: 'Lỗi đăng nhập không thể truy cập tài khoản',
    ticketDescription:
      'Khách hàng báo cáo không thể đăng nhập vào tài khoản của mình. Đã thử reset mật khẩu nhưng vẫn không thành công. Cần hỗ trợ kiểm tra và khôi phục quyền truy cập.',
    Status: 'Đã đóng',
    Label: 'error',
    thumb: "/images/profile/user-10.jpg",
    AgentName: 'Liam',
    Date: chance.date(),
    deleted: false,
  },
  {
    Id: 2,
    ticketTitle: 'Yêu cầu cập nhật thông tin thanh toán',
    ticketDescription:
      'Khách hàng muốn thay đổi phương thức thanh toán từ thẻ tín dụng sang ví điện tử. Cần hướng dẫn quy trình và hỗ trợ cập nhật thông tin trong hệ thống.',
    Status: 'Chờ xử lý',
    Label: 'warning',
    thumb: "/images/profile/user-2.jpg",
    AgentName: 'Steve',
    Date: chance.date(),
    deleted: false,
  },
  {
    Id: 3,
    ticketTitle: 'Hỗ trợ cài đặt ứng dụng mobile',
    ticketDescription:
      'Khách hàng gặp khó khăn trong việc cài đặt và sử dụng ứng dụng mobile. Cần hướng dẫn chi tiết các bước cài đặt và cấu hình ban đầu.',
    Status: 'Đang mở',
    Label: 'success',
    thumb: "/images/profile/user-3.jpg",
    AgentName: 'Jack',
    Date: chance.date(),
    deleted: false,
  },
  {
    Id: 4,
    ticketTitle: 'Báo cáo lỗi hiển thị giao diện',
    ticketDescription:
      'Giao diện website hiển thị không đúng trên trình duyệt Safari. Một số thành phần bị lệch và không thể click được. Cần kiểm tra và sửa lỗi tương thích.',
    Status: 'Đã đóng',
    Label: 'error',
    thumb: "/images/profile/user-4.jpg",
    AgentName: 'Steve',
    Date: chance.date(),
    deleted: false,
  },
  {
    Id: 5,
    ticketTitle: 'Vấn đề về tốc độ tải trang',
    ticketDescription:
      'Website tải rất chậm, đặc biệt là trang chủ và trang sản phẩm. Khách hàng phàn nàn về trải nghiệm người dùng kém. Cần tối ưu hóa hiệu suất và tốc độ tải.',
    Status: 'Đã đóng',
    Label: 'error',
    thumb: "/images/profile/user-5.jpg",
    AgentName: 'Liam',
    Date: chance.date(),
    deleted: false,
  },
  {
    Id: 6,
    ticketTitle: 'Yêu cầu hoàn tiền đơn hàng',
    ticketDescription:
      'Khách hàng yêu cầu hoàn tiền cho đơn hàng #12345 do sản phẩm không đúng mô tả. Cần xử lý hoàn tiền và cập nhật chính sách đổi trả cho khách hàng.',
    Status: 'Chờ xử lý',
    Label: 'warning',
    thumb: "/images/profile/user-6.jpg",
    AgentName: 'Jack',
    Date: chance.date(),
    deleted: false,
  },
  {
    Id: 7,
    ticketTitle: 'Hỗ trợ tích hợp API thanh toán',
    ticketDescription:
      'Khách hàng doanh nghiệp cần hỗ trợ tích hợp API thanh toán vào hệ thống của họ. Cần cung cấp tài liệu kỹ thuật và hướng dẫn implementation.',
    Status: 'Đang mở',
    Label: 'success',
    thumb: "/images/profile/user-7.jpg",
    AgentName: 'Steve',
    Date: chance.date(),
    deleted: false,
  },
  {
    Id: 8,
    ticketTitle: 'Lỗi xử lý đơn hàng tự động',
    ticketDescription:
      'Hệ thống xử lý đơn hàng tự động bị lỗi, một số đơn hàng không được cập nhật trạng thái. Cần kiểm tra và sửa lỗi trong quy trình automation.',
    Status: 'Đã đóng',
    Label: 'error',
    thumb: "/images/profile/user-8.jpg",
    AgentName: 'John',
    Date: chance.date(),
    deleted: false,
  },
];

mock.onGet('/api/data/ticket/TicketData').reply(() => {
  return [200, TicketData];
});
export default TicketData;
