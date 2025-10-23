// Notification utility functions for laundry orders management

export interface NotificationConfig {
  open: boolean;
  message: string;
  severity: 'success' | 'error' | 'warning' | 'info';
}

// Success notification messages
export const createSuccessNotification = (message: string): NotificationConfig => ({
  open: true,
  message,
  severity: 'success'
});

export const createErrorNotification = (message: string): NotificationConfig => ({
  open: true,
  message,
  severity: 'error'
});

export const createWarningNotification = (message: string): NotificationConfig => ({
  open: true,
  message,
  severity: 'warning'
});

export const createInfoNotification = (message: string): NotificationConfig => ({
  open: true,
  message,
  severity: 'info'
});

// Predefined notification messages for laundry orders
export const NotificationMessages = {
  // Order CRUD operations
  orderCreated: (orderNumber: string) => `✅ Đã tạo đơn hàng ${orderNumber} thành công!`,
  orderUpdated: (orderNumber: string) => `✅ Đã cập nhật đơn hàng ${orderNumber} thành công`,
  orderDeleted: (orderNumber: string) => `🗑️ Đã xóa đơn hàng ${orderNumber} thành công`,
  
  // Status updates
  statusUpdated: (orderNumber: string, status: string) => `📝 Đã cập nhật trạng thái đơn ${orderNumber} sang "${status}"`,
  totalCostUpdated: (orderNumber: string) => `💰 Đã cập nhật tổng chi phí đơn hàng ${orderNumber}`,
  
  // Customer operations
  customerCreated: (name: string) => `✅ Đã tạo khách hàng "${name}" thành công`,
  customerFound: (name: string) => `🔍 Tìm thấy khách hàng "${name}"`,
  
  // Error messages
  createFailed: (error?: string) => `❌ Không thể tạo đơn hàng${error ? `: ${error}` : '. Vui lòng thử lại.'}`,
  updateFailed: (error?: string) => `❌ Không thể cập nhật đơn hàng${error ? `: ${error}` : '. Vui lòng thử lại.'}`,
  deleteFailed: (error?: string) => `❌ Không thể xóa đơn hàng${error ? `: ${error}` : '. Vui lòng thử lại.'}`,
  loadFailed: (error?: string) => `❌ Không thể tải danh sách đơn hàng${error ? `: ${error}` : '. Vui lòng thử lại.'}`,
  statusUpdateFailed: (error?: string) => `❌ Không thể cập nhật trạng thái${error ? `: ${error}` : ''}`,
  
  // Validation messages
  requiredFields: () => `⚠️ Vui lòng điền đầy đủ thông tin bắt buộc`,
  invalidPhone: () => `⚠️ Số điện thoại không hợp lệ`,
  invalidAmount: () => `⚠️ Vui lòng nhập số tiền hợp lệ`,
  
  // General messages
  operationCancelled: () => `ℹ️ Thao tác đã được hủy`,
  noChanges: () => `ℹ️ Không có thay đổi nào được thực hiện`,
};

// Helper function to create notifications with predefined messages
export const createLaundryNotification = {
  success: {
    orderCreated: (orderNumber: string) => createSuccessNotification(NotificationMessages.orderCreated(orderNumber)),
    orderUpdated: (orderNumber: string) => createSuccessNotification(NotificationMessages.orderUpdated(orderNumber)),
    orderDeleted: (orderNumber: string) => createSuccessNotification(NotificationMessages.orderDeleted(orderNumber)),
    statusUpdated: (orderNumber: string, status: string) => createSuccessNotification(NotificationMessages.statusUpdated(orderNumber, status)),
    totalCostUpdated: (orderNumber: string) => createSuccessNotification(NotificationMessages.totalCostUpdated(orderNumber)),
    customerCreated: (name: string) => createSuccessNotification(NotificationMessages.customerCreated(name)),
  },
  error: {
    createFailed: (error?: string) => createErrorNotification(NotificationMessages.createFailed(error)),
    updateFailed: (error?: string) => createErrorNotification(NotificationMessages.updateFailed(error)),
    deleteFailed: (error?: string) => createErrorNotification(NotificationMessages.deleteFailed(error)),
    loadFailed: (error?: string) => createErrorNotification(NotificationMessages.loadFailed(error)),
    statusUpdateFailed: (error?: string) => createErrorNotification(NotificationMessages.statusUpdateFailed(error)),
  },
  warning: {
    requiredFields: () => createWarningNotification(NotificationMessages.requiredFields()),
    invalidPhone: () => createWarningNotification(NotificationMessages.invalidPhone()),
    invalidAmount: () => createWarningNotification(NotificationMessages.invalidAmount()),
  },
  info: {
    operationCancelled: () => createInfoNotification(NotificationMessages.operationCancelled()),
    noChanges: () => createInfoNotification(NotificationMessages.noChanges()),
    customerFound: (name: string) => createInfoNotification(NotificationMessages.customerFound(name)),
  }
};

export default createLaundryNotification;
