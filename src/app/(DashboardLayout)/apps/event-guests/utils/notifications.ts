// Notification utility functions for wedding guests management

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

// Predefined notification messages for wedding guests
export const NotificationMessages = {
  // Guest CRUD operations
  guestAdded: (name: string) => `✅ Đã thêm khách mời "${name}" thành công`,
  guestUpdated: (name: string) => `✅ Đã cập nhật thông tin khách mời "${name}" thành công`,
  guestDeleted: (name: string) => `🗑️ Đã xóa khách mời "${name}" thành công`,
  
  // Bulk operations
  bulkDeleted: (count: number) => `🗑️ Đã xóa ${count} khách mời thành công`,
  bulkStatusUpdated: (status: string, count: number) => `📝 Đã cập nhật trạng thái "${status}" cho ${count} khách mời`,
  
  // Data operations
  dataRefreshed: () => `🔄 Đã làm mới danh sách khách mời thành công`,
  dataExported: () => `📊 Đã xuất dữ liệu thành công`,
  
  // Error messages
  addFailed: (error?: string) => `❌ Không thể thêm khách mời${error ? `: ${error}` : '. Vui lòng thử lại.'}`,
  updateFailed: (error?: string) => `❌ Không thể cập nhật thông tin${error ? `: ${error}` : '. Vui lòng thử lại.'}`,
  deleteFailed: (error?: string) => `❌ Không thể xóa khách mời${error ? `: ${error}` : '. Vui lòng thử lại.'}`,
  loadFailed: (error?: string) => `❌ Không thể tải danh sách khách mời${error ? `: ${error}` : '. Vui lòng thử lại.'}`,
  refreshFailed: () => `❌ Không thể làm mới danh sách. Vui lòng thử lại.`,
  
  // Validation messages
  requiredFields: () => `⚠️ Vui lòng điền đầy đủ thông tin bắt buộc`,
  invalidData: (field: string) => `⚠️ Dữ liệu không hợp lệ: ${field}`,
  
  // General messages
  noSelection: () => `⚠️ Vui lòng chọn ít nhất một khách mời`,
  operationCancelled: () => `ℹ️ Thao tác đã được hủy`,
  noChanges: () => `ℹ️ Không có thay đổi nào được thực hiện`,
};

// Helper function to create notifications with predefined messages
export const createGuestNotification = {
  success: {
    added: (name: string) => createSuccessNotification(NotificationMessages.guestAdded(name)),
    updated: (name: string) => createSuccessNotification(NotificationMessages.guestUpdated(name)),
    deleted: (name: string) => createSuccessNotification(NotificationMessages.guestDeleted(name)),
    bulkDeleted: (count: number) => createSuccessNotification(NotificationMessages.bulkDeleted(count)),
    bulkStatusUpdated: (status: string, count: number) => createSuccessNotification(NotificationMessages.bulkStatusUpdated(status, count)),
    dataRefreshed: () => createSuccessNotification(NotificationMessages.dataRefreshed()),
    dataExported: () => createSuccessNotification(NotificationMessages.dataExported()),
  },
  error: {
    addFailed: (error?: string) => createErrorNotification(NotificationMessages.addFailed(error)),
    updateFailed: (error?: string) => createErrorNotification(NotificationMessages.updateFailed(error)),
    deleteFailed: (error?: string) => createErrorNotification(NotificationMessages.deleteFailed(error)),
    loadFailed: (error?: string) => createErrorNotification(NotificationMessages.loadFailed(error)),
    refreshFailed: () => createErrorNotification(NotificationMessages.refreshFailed()),
  },
  warning: {
    requiredFields: () => createWarningNotification(NotificationMessages.requiredFields()),
    invalidData: (field: string) => createWarningNotification(NotificationMessages.invalidData(field)),
    noSelection: () => createWarningNotification(NotificationMessages.noSelection()),
  },
  info: {
    operationCancelled: () => createInfoNotification(NotificationMessages.operationCancelled()),
    noChanges: () => createInfoNotification(NotificationMessages.noChanges()),
  }
};

export default createGuestNotification;
