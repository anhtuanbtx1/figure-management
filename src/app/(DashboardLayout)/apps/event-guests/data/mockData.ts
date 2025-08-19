import { EventGuest, GuestStatus } from '../../../types/apps/eventGuest';

export const mockGuests: EventGuest[] = [
  {
    id: '1',
    fullName: 'Nguyễn Văn Anh',
    unit: 'Công ty ABC',
    numberOfPeople: 2,
    status: GuestStatus.CONFIRMED,
    contributionAmount: 2000000,
    relationship: 'Đồng nghiệp',
    notes: 'Khách VIP, cần chỗ ngồi ưu tiên',
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-11-15'),
    createdBy: 'System',
    updatedBy: null,
    isActive: true,
  },
  {
    id: '2',
    fullName: 'Trần Thị Bình',
    unit: 'Gia đình Trần',
    numberOfPeople: 4,
    status: GuestStatus.PENDING,
    contributionAmount: 0,
    relationship: 'Họ hàng',
    notes: 'Chưa phản hồi lời mời',
    createdAt: new Date('2024-10-05'),
    updatedAt: new Date('2024-10-05'),
    createdBy: 'System',
    updatedBy: null,
    isActive: true,
  },
  {
    id: '3',
    fullName: 'Lê Minh Cường',
    unit: 'Công ty XYZ',
    numberOfPeople: 1,
    status: GuestStatus.CONFIRMED,
    contributionAmount: 1500000,
    relationship: 'Đối tác',
    notes: 'Đại diện công ty XYZ',
    createdAt: new Date('2024-10-10'),
    updatedAt: new Date('2024-11-20'),
    createdBy: 'System',
    updatedBy: null,
    isActive: true,
  },
  {
    id: '4',
    fullName: 'Phạm Thị Dung',
    unit: 'Gia đình Phạm',
    numberOfPeople: 3,
    status: GuestStatus.DECLINED,
    contributionAmount: 0,
    relationship: 'Bạn thân',
    notes: 'Bận công tác nước ngoài',
    createdAt: new Date('2024-10-12'),
    updatedAt: new Date('2024-10-15'),
    createdBy: 'System',
    updatedBy: null,
    isActive: true,
  },
  {
    id: '5',
    fullName: 'Hoàng Văn Em',
    unit: 'Nhà tài trợ',
    numberOfPeople: 2,
    status: GuestStatus.CONFIRMED,
    contributionAmount: 3000000,
    relationship: 'Đối tác',
    notes: 'Nhà tài trợ chính',
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-11-25'),
    createdBy: 'System',
    updatedBy: null,
    isActive: true,
  },
];

export const getGuestStats = (guests: EventGuest[]) => {
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(g => g.status === GuestStatus.CONFIRMED).length;
  const pendingGuests = guests.filter(g => g.status === GuestStatus.PENDING).length;
  const declinedGuests = guests.filter(g => g.status === GuestStatus.DECLINED).length;
  const totalContribution = guests.reduce((sum, g) => sum + g.contributionAmount, 0);
  const averageContribution = totalGuests > 0 ? totalContribution / totalGuests : 0;

  return {
    totalGuests,
    confirmedGuests,
    pendingGuests,
    declinedGuests,
    totalContribution,
    averageContribution,
  };
};
