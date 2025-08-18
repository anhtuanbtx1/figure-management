
import {TodoCategory } from '@/app/(DashboardLayout)/types/apps/kanban'
import mock from '../mock';

const KanbanData : TodoCategory[] =  [
  {
    id: '1',
    name: 'Todo',
    child: [
      {
        id: '101',
        task: 'Thiết kế giao diện trang chủ',
        taskImage: '/images/kanban/kanban-img-1.jpg',
        taskText: '',
        date: '24 Tháng 12',
        taskProperty: 'Design',

      },
      {
        id: '102',
        task: 'Phát triển tính năng đăng nhập',
        taskImage: '',
        taskText: 'Tạo form đăng nhập với validation và xử lý lỗi phù hợp.',
        date: '25 Tháng 12',
        taskProperty: 'Development',

      },
      {
        id: '103',
        task: 'Tối ưu hóa hiệu suất ứng dụng mobile',
        taskImage: '',
        taskText: '',
        date: '26 Tháng 12',
        taskProperty: 'Development',

      },
    ],
  },
  {
    id: '2',
    name: 'Progress',
    child: [
      {
        id: '104',
        task: 'Cải thiện navigation menu',
        taskImage: '',
        taskText: '',
        date: '27 Tháng 12',
        taskProperty: 'Design',
        category: ''
      },
      {
        id: '105',
        task: 'Phát triển tính năng chat',
        taskImage: '/images/kanban/kanban-img-2.jpg',
        taskText: '',
        date: '28 Tháng 12',
        taskProperty: 'Development',
        category: ''
      },
      {
        id: '106',
        task: 'Thiết kế concept đầu tiên',
        taskImage: '',
        taskText: '',
        date: '29 Tháng 12',
        taskProperty: 'Design',
        category: ''
      },
    ],
  },
  {
    id: '3',
    name: 'Pending',
    child: [
      {
        id: '107',
        task: 'Phát triển persona người dùng',
        taskImage: '',
        taskText:
          'Tạo persona người dùng dựa trên dữ liệu nghiên cứu để đại diện cho các nhóm người dùng khác nhau và đặc điểm, mục tiêu, hành vi của họ.',
        date: '30 Tháng 12',
        taskProperty: 'Research',
        category: 'Pending',
      },
      {
        id: '108',
        task: 'Tổng quan thiết kế lại',
        taskImage: '/images/kanban/kanban-img-3.jpg',
        taskText: '',
        date: '31 Tháng 12',
        taskProperty: 'Design',
        category: 'Pending',
      },
    ],
  },
  {
    id: '4',
    name: 'Done',
    child: [
      {
        id: '109',
        task: 'Kiểm thử khả năng sử dụng',
        taskImage: '/images/kanban/kanban-img-4.jpg',
        taskText: '',
        date: '20 Tháng 12',
        taskProperty: 'Testing',
        category: 'Done',
      },
      {
        id: '110',
        task: 'Triển khai navigation mới',
        taskImage: '',
        taskText: '',
        date: '21 Tháng 12',
        taskProperty: 'Development',
        category: 'Done',
      },
      {
        id: '111',
        task: 'Thiết kế nhận diện thương hiệu',
        taskImage: '',
        taskText: '',
        date: '22 Tháng 12',
        taskProperty: 'Design',
        category: 'Done',
      },
      {
        id: '112',
        task: 'Nghiên cứu đối thủ cạnh tranh',
        taskImage: '',
        taskText:
          'Nghiên cứu các đối thủ cạnh tranh và xác định điểm mạnh, điểm yếu của từng đối thủ. So sánh tính năng sản phẩm, chất lượng...',
        date: '23 Tháng 12',
        taskProperty: 'Research',
        category: 'Done',
      },
    ],
  },
];

// Extracting unique task properties from TodoData
const taskPropertiesSet = new Set<string>();

// Using forEach loops instead of flatMap
KanbanData.forEach((category) => {
  category.child.forEach((task) => {
    taskPropertiesSet.add(task.taskProperty);
  });
});

// Convert Set to array
export const TaskProperties = Array.from(taskPropertiesSet);

// Mock API endpoint to fetch TodoData
mock.onGet('/api/TodoData').reply(200, KanbanData);

// Mock API endpoint to delete a category
mock.onDelete('/api/TodoData').reply((config) => {
  const { id } = JSON.parse(config.data);
  const updatedTodoData = KanbanData.filter((category) => category.id !== id);
  return [200, updatedTodoData];
});

// Mock API endpoint to clear all tasks from a category
mock.onDelete('/api/TodoData/clearTasks').reply((config) => {
  const { categoryId } = JSON.parse(config.data);
  const updatedTodoData = KanbanData.map((category) => {
    if (category.id === categoryId) {
      return { ...category, child: [] };
    }
    return category;
  });
  return [200, updatedTodoData];
});

// Mock API endpoint to add a new task
mock.onPost('/api/TodoData/addTask').reply((config) => {
  const { categoryId, newTaskData } = JSON.parse(config.data);
  const updatedTodoData = KanbanData.map((category) => {
    if (category.id === categoryId) {
      return { ...category, child: [...category.child, newTaskData] };
    }
    return category;
  });
  return [200, updatedTodoData];
});

// Mock API endpoint to add a new category
mock.onPost('/api/TodoData/addCategory').reply((config) => {
  const { categoryName } = JSON.parse(config.data);
  const newCategory = {
    id: Math.random(),
    name: categoryName,
    child: [],
  };
  KanbanData.push(newCategory);
  return [200, newCategory];
});

// Mock API endpoint to update the name of a category
mock.onPost('/api/TodoData/updateCategory').reply((config) => {
  const { categoryId, categoryName } = JSON.parse(config.data);
  const updatedTodoData = KanbanData.map((category) => {
    if (category.id === categoryId) {
      return { ...category, name: categoryName };
    }
    return category;
  });
  return [200, updatedTodoData];
});

// Mock API endpoint to edit a task
mock.onPut('/api/TodoData/editTask').reply((config) => {
  const { taskId, newData } = JSON.parse(config.data);
  KanbanData.forEach((category) => {
    category.child.forEach((task) => {
      if (task.id === taskId) {
        Object.assign(task, newData);
      }
    });
  });
  return [200, KanbanData];
});

// Mock API endpoint to delete a task
mock.onDelete('/api/TodoData/deleteTask').reply((config) => {
  const { taskId } = JSON.parse(config.data);
  const updatedTodoData = KanbanData.filter((task) => task.id !== taskId);
  return [200, updatedTodoData];
});

export default KanbanData;
