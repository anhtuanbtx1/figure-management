import { KanbanTaskDb as KanbanTask, KanbanColumn, KanbanListResponse, KanbanColumnsResponse, KanbanStats, KanbanStatsResponse } from '@/types/apps/kanban-db';

const API_BASE = '/api/kanban/tasks';

function ensureJson(res: Response) {
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) throw new Error(`Máy chủ trả về định dạng không hợp lệ (${ct})`);
}

async function parseOk<T = any>(res: Response): Promise<T> {
  ensureJson(res);
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Lỗi máy chủ (${res.status})`);
  return data as T;
}

export default class KanbanService {
  static async fetchColumns(boardId: string = 'board-1'): Promise<KanbanColumn[]> {
    const res = await fetch(`/api/kanban/columns?boardId=${encodeURIComponent(boardId)}`, { cache: 'no-store' });
    const data = await parseOk<KanbanColumnsResponse>(res);
    if (!data.success) throw new Error(data.message || 'Không thể tải danh sách cột');
    return data.data;
  }

  static async fetchStats(boardId: string = 'board-1', timeWindow: number = 7): Promise<KanbanStats> {
    const res = await fetch(`/api/kanban/stats?boardId=${encodeURIComponent(boardId)}&timeWindow=${timeWindow}`, { cache: 'no-store' });
    const data = await parseOk<KanbanStatsResponse>(res);
    if (!data.success || !data.data) throw new Error(data.message || 'Không thể tải thống kê');
    return data.data;
  }

  static async fetchTasks(boardId: string = 'board-1'): Promise<KanbanTask[]> {
    const res = await fetch(`${API_BASE}?boardId=${encodeURIComponent(boardId)}`, { cache: 'no-store' });
    const data = await parseOk<KanbanListResponse>(res);
    if (!data.success) throw new Error(data.message || 'Không thể tải danh sách công việc');
    return data.data;
  }

  static async createTask(task: Partial<KanbanTask> & { columnId: string; title: string; boardId?: string }): Promise<KanbanTask> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    const data = await parseOk(res);
    if (!data.success) throw new Error(data.message || 'Tạo nhiệm vụ thất bại');
    return data.data;
  }

  static async updateTask(id: string, patch: Partial<KanbanTask>): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const data = await parseOk(res);
    if (!data.success) throw new Error(data.message || 'Cập nhật nhiệm vụ thất bại');
  }

  static async deleteTask(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    const data = await parseOk(res);
    if (!data.success) throw new Error(data.message || 'Xóa nhiệm vụ thất bại');
  }

  static async moveTask(id: string, params: { boardId?: string; fromColumnId?: string; toColumnId: string; toPosition: number }): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await parseOk(res);
    if (!data.success) throw new Error(data.message || 'Di chuyển nhiệm vụ thất bại');
  }
}

