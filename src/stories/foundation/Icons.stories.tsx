import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Users, UserPlus, UserCheck, UserX, User,
  Briefcase, Building2, Building,
  ArrowRight, ArrowLeft, ArrowUp, ArrowDown,
  ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  LayoutDashboard, BarChart3, PieChart, LineChart,
  Settings, Bell, Search, Filter, Download, Upload,
  Plus, Minus, Trash2, Edit, Eye, EyeOff,
  CheckCircle2, AlertCircle, AlertTriangle, Info, X,
  Menu, MoreHorizontal, MoreVertical,
  Calendar, Clock, FileText, Folder,
  TrendingUp, TrendingDown,
  Home, LogOut, Lock, Mail, Phone,
  Loader2, RefreshCw,
  ZoomIn, ZoomOut, Maximize2,
  type LucideIcon,
} from 'lucide-react';

const ICON_GROUPS: { label: string; icons: Array<{ name: string; Icon: LucideIcon }> }[] = [
  {
    label: 'Agents & Personnes',
    icons: [
      { name: 'Users',      Icon: Users },
      { name: 'UserPlus',   Icon: UserPlus },
      { name: 'UserCheck',  Icon: UserCheck },
      { name: 'UserX',      Icon: UserX },
      { name: 'User',       Icon: User },
    ],
  },
  {
    label: 'Organisation',
    icons: [
      { name: 'Briefcase',  Icon: Briefcase },
      { name: 'Building2',  Icon: Building2 },
      { name: 'Building',   Icon: Building },
    ],
  },
  {
    label: 'Navigation',
    icons: [
      { name: 'LayoutDashboard', Icon: LayoutDashboard },
      { name: 'ChevronRight',    Icon: ChevronRight },
      { name: 'ChevronLeft',     Icon: ChevronLeft },
      { name: 'ChevronDown',     Icon: ChevronDown },
      { name: 'ChevronUp',       Icon: ChevronUp },
      { name: 'ArrowRight',      Icon: ArrowRight },
      { name: 'ArrowLeft',       Icon: ArrowLeft },
      { name: 'ArrowUp',         Icon: ArrowUp },
      { name: 'ArrowDown',       Icon: ArrowDown },
      { name: 'Home',            Icon: Home },
    ],
  },
  {
    label: 'Actions',
    icons: [
      { name: 'Plus',         Icon: Plus },
      { name: 'Minus',        Icon: Minus },
      { name: 'Trash2',       Icon: Trash2 },
      { name: 'Edit',         Icon: Edit },
      { name: 'Eye',          Icon: Eye },
      { name: 'EyeOff',       Icon: EyeOff },
      { name: 'Download',     Icon: Download },
      { name: 'Upload',       Icon: Upload },
      { name: 'RefreshCw',    Icon: RefreshCw },
    ],
  },
  {
    label: 'UI / Interface',
    icons: [
      { name: 'Search',       Icon: Search },
      { name: 'Filter',       Icon: Filter },
      { name: 'Menu',         Icon: Menu },
      { name: 'MoreHorizontal', Icon: MoreHorizontal },
      { name: 'MoreVertical', Icon: MoreVertical },
      { name: 'Settings',     Icon: Settings },
      { name: 'Bell',         Icon: Bell },
    ],
  },
  {
    label: 'Charts',
    icons: [
      { name: 'BarChart3',  Icon: BarChart3 },
      { name: 'PieChart',   Icon: PieChart },
      { name: 'LineChart',  Icon: LineChart },
      { name: 'TrendingUp', Icon: TrendingUp },
      { name: 'TrendingDown', Icon: TrendingDown },
    ],
  },
  {
    label: 'Statut / Feedback',
    icons: [
      { name: 'CheckCircle2',  Icon: CheckCircle2 },
      { name: 'AlertCircle',   Icon: AlertCircle },
      { name: 'AlertTriangle', Icon: AlertTriangle },
      { name: 'Info',          Icon: Info },
      { name: 'X',             Icon: X },
      { name: 'Loader2',       Icon: Loader2 },
    ],
  },
  {
    label: 'Formulaires / Données',
    icons: [
      { name: 'Calendar',  Icon: Calendar },
      { name: 'Clock',     Icon: Clock },
      { name: 'FileText',  Icon: FileText },
      { name: 'Folder',    Icon: Folder },
      { name: 'Mail',      Icon: Mail },
      { name: 'Phone',     Icon: Phone },
      { name: 'Lock',      Icon: Lock },
      { name: 'LogOut',    Icon: LogOut },
    ],
  },
  {
    label: 'OrgChart',
    icons: [
      { name: 'ZoomIn',    Icon: ZoomIn },
      { name: 'ZoomOut',   Icon: ZoomOut },
      { name: 'Maximize2', Icon: Maximize2 },
    ],
  },
];

function IconsPage() {
  return (
    <div className="space-y-8 p-6 bg-background min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Icônes</h1>
        <p className="text-muted-foreground text-sm mt-1">Catalogue des icônes Lucide utilisées dans AUGURE</p>
      </div>

      {ICON_GROUPS.map(({ label, icons }) => (
        <section key={label} className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground border-b border-border pb-1">{label}</h2>
          <div className="grid grid-cols-6 gap-3 sm:grid-cols-8 lg:grid-cols-12">
            {icons.map(({ name, Icon }) => (
              <div
                key={name}
                className="flex flex-col items-center gap-2 rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                title={name}
              >
                <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
                <span className="text-xs text-muted-foreground text-center font-mono leading-tight">{name}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const meta: Meta = {
  title:     'Foundation/Icons',
  component: IconsPage,
  parameters: {
    layout: 'fullscreen',
    docs: { description: { component: 'Catalogue des icônes Lucide utilisées dans l\'application AUGURE.' } },
  },
};
export default meta;
type Story = StoryObj;

export const Catalogue: Story = { name: 'Catalogue des icônes' };
