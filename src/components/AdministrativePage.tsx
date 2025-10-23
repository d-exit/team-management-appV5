import React, { useState, useCallback } from 'react';
import { Settings, Send, DollarSign, ShoppingBag, Calendar, Users, FileText, BarChart3 } from 'lucide-react';
import { OptimizedButton } from './common/OptimizedButton';
import { AnnouncementsPage } from './AnnouncementsPage';
import { AttendancePage } from './AttendancePage';
import { MemberInfoPage } from './MemberInfoPage';
import { MerchandiseManagementPage } from './MerchandiseManagementPage';
import { PaymentManagementPage } from './PaymentManagementPage';

interface AdministrativePageProps {
  onBack: () => void;
  currentUser?: any;
}

export const AdministrativePage: React.FC<AdministrativePageProps> = ({ onBack, currentUser }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'announcements' | 'attendance' | 'members' | 'merchandise' | 'payments' | 'reports'>('overview');

  const [stats] = useState({
    totalMembers: 25,
    activeMembers: 22,
    pendingPayments: 3,
    totalRevenue: 150000,
    upcomingEvents: 5,
    unreadAnnouncements: 2,
  });

  const handleNavigateTo = useCallback((page: string) => {
    // 実際の実装では、適切なページにナビゲートする
    console.log(`Navigate to: ${page}`);
  }, []);

  const renderOverview = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">管理概要</h2>
      
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">総メンバー数</p>
              <p className="text-2xl font-bold text-white">{stats.totalMembers}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">未払い件数</p>
              <p className="text-2xl font-bold text-white">{stats.pendingPayments}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-500 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">今後の予定</p>
              <p className="text-2xl font-bold text-white">{stats.upcomingEvents}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-500 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">総売上</p>
              <p className="text-2xl font-bold text-white">¥{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">未読お知らせ</p>
              <p className="text-2xl font-bold text-white">{stats.unreadAnnouncements}</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-sky-500 rounded-lg">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">アクティブメンバー</p>
              <p className="text-2xl font-bold text-white">{stats.activeMembers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* クイックアクション */}
      <div className="bg-slate-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">クイックアクション</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <OptimizedButton
            onClick={() => setActiveTab('announcements')}
            icon={<Send className="w-4 h-4" />}
            className="w-full"
          >
            お知らせ作成
          </OptimizedButton>
          
          <OptimizedButton
            onClick={() => setActiveTab('payments')}
            icon={<DollarSign className="w-4 h-4" />}
            className="w-full"
          >
            請求作成
          </OptimizedButton>
          
          <OptimizedButton
            onClick={() => setActiveTab('merchandise')}
            icon={<ShoppingBag className="w-4 h-4" />}
            className="w-full"
          >
            商品管理
          </OptimizedButton>
          
          <OptimizedButton
            onClick={() => setActiveTab('attendance')}
            icon={<Calendar className="w-4 h-4" />}
            className="w-full"
          >
            出欠管理
          </OptimizedButton>
          
          <OptimizedButton
            onClick={() => setActiveTab('members')}
            icon={<Users className="w-4 h-4" />}
            className="w-full"
          >
            メンバー管理
          </OptimizedButton>
          
          <OptimizedButton
            onClick={() => setActiveTab('reports')}
            icon={<BarChart3 className="w-4 h-4" />}
            className="w-full"
          >
            レポート作成
          </OptimizedButton>
        </div>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">お知らせ管理</h2>
      <AnnouncementsPage onBack={() => setActiveTab('overview')} isAdmin={true} currentUser={currentUser} />
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">支払い管理</h2>
      <PaymentManagementPage onBack={() => setActiveTab('overview')} isAdmin={true} />
    </div>
  );

  const renderMerchandise = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">物販管理</h2>
      <MerchandiseManagementPage onBack={() => setActiveTab('overview')} isAdmin={true} />
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">出欠管理</h2>
      <AttendancePage onBack={() => setActiveTab('overview')} isAdmin={true} />
    </div>
  );

  const renderMembers = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">メンバー管理</h2>
      <MemberInfoPage onBack={() => setActiveTab('overview')} isAdmin={true} />
    </div>
  );

  const renderReports = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4">レポート・分析</h2>
      
      <div className="bg-slate-800 rounded-lg p-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">利用可能なレポート</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
              onClick={() => alert('メンバー関連レポートを生成します')}
            >
              <h4 className="font-medium text-white mb-2">メンバー関連</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• メンバー一覧</li>
                <li>• 参加率レポート</li>
                <li>• 新規加入者統計</li>
              </ul>
            </div>
            
            <div 
              className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
              onClick={() => alert('財務関連レポートを生成します')}
            >
              <h4 className="font-medium text-white mb-2">財務関連</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• 収入レポート</li>
                <li>• 支払い状況</li>
                <li>• 物販売上</li>
              </ul>
            </div>
            
            <div 
              className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
              onClick={() => alert('イベント関連レポートを生成します')}
            >
              <h4 className="font-medium text-white mb-2">イベント関連</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• イベント参加率</li>
                <li>• 出欠統計</li>
                <li>• イベント履歴</li>
              </ul>
            </div>
            
            <div 
              className="bg-slate-700 rounded-lg p-4 cursor-pointer hover:bg-slate-600 transition-colors"
              onClick={() => alert('その他レポートを生成します')}
            >
              <h4 className="font-medium text-white mb-2">その他</h4>
              <ul className="text-sm text-slate-300 space-y-1">
                <li>• お知らせ配信統計</li>
                <li>• システム利用状況</li>
                <li>• アクセスログ</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'announcements':
        return renderAnnouncements();
      case 'attendance':
        return renderAttendance();
      case 'members':
        return renderMembers();
      case 'merchandise':
        return renderMerchandise();
      case 'payments':
        return renderPayments();
      case 'reports':
        return renderReports();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            ← 戻る
          </button>
          <h1 className="text-2xl font-bold text-white">庶務機能</h1>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="flex flex-wrap space-x-1 mb-6 bg-slate-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'overview'
              ? 'bg-sky-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          概要
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'announcements'
              ? 'bg-sky-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          お知らせ
        </button>
        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'attendance'
              ? 'bg-sky-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          出欠管理
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'members'
              ? 'bg-sky-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          メンバー管理
        </button>
        <button
          onClick={() => setActiveTab('merchandise')}
          className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'merchandise'
              ? 'bg-sky-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          商品管理
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'payments'
              ? 'bg-sky-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          支払い管理
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`flex-1 min-w-0 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'reports'
              ? 'bg-sky-500 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-700'
          }`}
        >
          レポート
        </button>
      </div>

      {/* コンテンツ */}
      {renderContent()}
    </div>
  );
}; 