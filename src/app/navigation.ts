import {
  BarChart3,
  BookOpen,
  CalendarDays,
  FolderKanban,
  House,
  ListTodo,
  Presentation,
  Settings2,
  SquarePen,
} from 'lucide-react';
export const navigation = [
  { to: '/', label: 'Dashboard', icon: House },
  { to: '/executive', label: 'Executive', icon: Presentation },
  { to: '/tasks', label: 'My Tasks', icon: ListTodo },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/calendar', label: 'Calendar', icon: CalendarDays },
  { to: '/daily', label: 'Daily Log', icon: SquarePen },
  { to: '/notes', label: 'Study Notes', icon: BookOpen },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings2 },
] as const;
