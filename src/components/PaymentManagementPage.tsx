import React, { useState, useCallback } from 'react';
import { CreditCard, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Download, Send, Copy, Search } from 'lucide-react';
import { OptimizedButton } from './common/OptimizedButton';
import { MemberSelector } from './common/MemberSelector';
import { TagSelector } from './common/TagSelector';

interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface Payment {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue';
  type: 'monthly' | 'activity' | 'special';
  description: string;
  tagIds?: string[];
  paidAt?: Date;
  paymentMethod?: 'credit_card' | 'bank_transfer' | 'cash';
}

interface PaymentManagementPageProps {
  onBack: () => void;
  isAdmin?: boolean;
}

export const PaymentManagementPage: React.FC<PaymentManagementPageProps> = ({ onBack, isAdmin = false }) => {
  // タグデータ
  const [tags, setTags] = useState<Tag[]>([
    { id: '1', name: '月謝', color: 'bg-blue-500', createdAt: new Date() },
    { id: '2', name: '活動費', color: 'bg-green-500', createdAt: new Date() },
    { id: '3', name: '特別費', color: 'bg-purple-500', createdAt: new Date() },
    { id: '4', name: '緊急', color: 'bg-red-500', createdAt: new Date() },
  ]);

  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      title: '2024年1月月謝',
      amount: 8000,
      dueDate: new Date('2024-01-31'),
      status: 'paid',
      type: 'monthly',
      description: '1月分の月謝です。基本練習費、施設使用料、コーチ料を含みます。',
      tagIds: ['1'],
      paidAt: new Date('2024-01-15'),
      paymentMethod: 'credit_card',
    },
    {
      id: '2',
      title: '2024年2月月謝',
      amount: 8000,
      dueDate: new Date('2024-02-29'),
      status: 'pending',
      type: 'monthly',
      description: '2月分の月謝です。基本練習費、施設使用料、コーチ料を含みます。',
      tagIds: ['1'],
    },
    {
      id: '3',
      title: '遠征試合参加費',
      amount: 15000,
      dueDate: new Date('2024-02-15'),
      status: 'overdue',
      type: 'activity',
      description: '3月の遠征試合の参加費です。交通費、宿泊費、食事代を含みます。',
      tagIds: ['2', '4'],
    },
    {
      id: '4',
      title: '2024年3月月謝',
      amount: 8000,
      dueDate: new Date('2024-03-31'),
      status: 'pending',
      type: 'monthly',
      description: '3月分の月謝です。基本練習費、施設使用料、コーチ料を含みます。',
      tagIds: ['1'],
    },
    {
      id: '5',
      title: 'ユニフォーム代',
      amount: 12000,
      dueDate: new Date('2024-03-15'),
      status: 'pending',
      type: 'special',
      description: '新年度ユニフォームの購入費です。ユニフォーム、ジャケット、ソックスを含みます。',
      tagIds: ['3'],
    },
    {
      id: '6',
      title: '大会参加費',
      amount: 8000,
      dueDate: new Date('2024-04-30'),
      status: 'pending',
      type: 'activity',
      description: '春の大会参加費です。エントリー料、審判料を含みます。',
      tagIds: ['2'],
    },
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  const [createForm, setCreateForm] = useState({
    title: '',
    amount: 0,
    dueDate: '',
    type: 'monthly' as 'monthly' | 'activity' | 'special',
    description: '',
    selectedMemberIds: [] as string[],
    tagIds: [] as string[],
  });

  // モックメンバーデータ
  const [members] = useState([
    { id: '1', name: '田中太郎', email: 'tanaka@example.com', role: 'メンバー' },
    { id: '2', name: '佐藤花子', email: 'sato@example.com', role: 'メンバー' },
    { id: '3', name: '鈴木三郎', email: 'suzuki@example.com', role: 'メンバー' },
    { id: '4', name: '高橋四郎', email: 'takahashi@example.com', role: 'メンバー' },
    { id: '5', name: '渡辺五郎', email: 'watanabe@example.com', role: 'メンバー' },
  ]);

  const [paymentForm, setPaymentForm] = useState({
    paymentMethod: 'credit_card' as 'credit_card' | 'bank_transfer' | 'cash',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const handleCreatePayment = useCallback(() => {
    if (!createForm.title || createForm.amount <= 0) return;

    const newPayment: Payment = {
      id: `payment-${Date.now()}`,
      title: createForm.title,
      amount: createForm.amount,
      dueDate: new Date(createForm.dueDate),
      status: 'pending',
      type: createForm.type,
      description: createForm.description,
      tagIds: createForm.tagIds,
    };

    setPayments(prev => [...prev, newPayment]);
    setCreateForm({
      title: '',
      amount: 0,
      dueDate: '',
      type: 'monthly',
      description: '',
      selectedMemberIds: [],
      tagIds: [],
    });
    setShowCreateForm(false);
  }, [createForm]);

  const handleDuplicatePayment = useCallback((payment: Payment) => {
    setCreateForm({
      title: `${payment.title} (コピー)`,
      amount: payment.amount,
      dueDate: payment.dueDate.toISOString().split('T')[0],
      type: payment.type,
      description: payment.description,
      selectedMemberIds: [],
      tagIds: payment.tagIds || [],
    });
    setShowCreateForm(true);
  }, []);

  const handlePayment = useCallback(() => {
    if (!selectedPayment) return;

    setPayments(prev =>
      prev.map(payment =>
        payment.id === selectedPayment.id
          ? {
              ...payment,
              status: 'paid',
              paidAt: new Date(),
              paymentMethod: paymentForm.paymentMethod,
            }
          : payment
      )
    );

    setPaymentForm({
      paymentMethod: 'credit_card',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    });
    setSelectedPayment(null);
    setShowPaymentForm(false);
  }, [selectedPayment, paymentForm]);

  const handleSendReminder = useCallback((paymentId: string) => {
    // 実際の実装ではメール送信APIを呼び出す
    alert('支払いリマインダーを送信しました。');
  }, []);

  const filteredPayments = payments.filter(payment => {
    if (filter === 'pending') return payment.status === 'pending';
    if (filter === 'paid') return payment.status === 'paid';
    if (filter === 'overdue') return payment.status === 'overdue';

    // 検索フィルター
    if (searchTerm && !payment.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !payment.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // タグフィルター
    if (selectedTagIds.length > 0) {
      const paymentTagIds = payment.tagIds || [];
      if (!selectedTagIds.some(tagId => paymentTagIds.includes(tagId))) {
        return false;
      }
    }

    // 日付フィルター
    if (selectedDateRange.start || selectedDateRange.end) {
      const paymentDate = payment.dueDate;
      const startDate = selectedDateRange.start ? new Date(selectedDateRange.start) : null;
      const endDate = selectedDateRange.end ? new Date(selectedDateRange.end) : null;

      if (startDate && paymentDate < startDate) return false;
      if (endDate && paymentDate > endDate) return false;
    }

    return true;
  });

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusLabel = (status: Payment['status']) => {
    switch (status) {
      case 'paid':
        return '支払済み';
      case 'pending':
        return '未払い';
      case 'overdue':
        return '期限切れ';
    }
  };

  const getTypeLabel = (type: Payment['type']) => {
    switch (type) {
      case 'monthly':
        return '月謝';
      case 'activity':
        return '活動費';
      case 'special':
        return '特別費';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getPaymentTags = (tagIds: string[] = []) => {
    return tags.filter(tag => tagIds.includes(tag.id));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-sky-400 hover:text-sky-300 transition-colors"
          >
            ← 戻る
          </button>
          <h1 className="text-2xl font-bold text-white">{isAdmin ? '請求管理' : '支払い管理'}</h1>
        </div>
        {isAdmin && (
          <OptimizedButton
            onClick={() => setShowCreateForm(true)}
            icon={<Send className="w-4 h-4" />}
          >
            請求作成
          </OptimizedButton>
        )}
      </div>

      {/* フィルター */}
      <div className="space-y-4 mb-6">
        {/* ステータスフィルター */}
        <div className="flex space-x-2">
          <OptimizedButton
            variant={filter === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            すべて
          </OptimizedButton>
          <OptimizedButton
            variant={filter === 'pending' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('pending')}
          >
            未払い
          </OptimizedButton>
          <OptimizedButton
            variant={filter === 'paid' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('paid')}
          >
            支払済み
          </OptimizedButton>
          <OptimizedButton
            variant={filter === 'overdue' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter('overdue')}
          >
            期限切れ
          </OptimizedButton>
        </div>

        {/* 検索・フィルター */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 検索 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="請求を検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* タグフィルター */}
          <TagSelector
            tags={tags}
            selectedTagIds={selectedTagIds}
            onSelectionChange={setSelectedTagIds}
            onTagsChange={setTags}
            title="タグで絞り込み"
            placeholder="タグを検索..."
            allowCreate={isAdmin}
            allowEdit={isAdmin}
            showSelectAll={false}
            showSearch={true}
          />

          {/* 日付フィルター */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">開始日</label>
              <input
                type="date"
                value={selectedDateRange.start}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-400 mb-1">終了日</label>
              <input
                type="date"
                value={selectedDateRange.end}
                onChange={(e) => setSelectedDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 支払い一覧 */}
      <div className="space-y-4">
        {filteredPayments.map(payment => (
          <div
            key={payment.id}
            className={`bg-slate-800 rounded-lg p-4 border-l-4 ${
              payment.status === 'paid'
                ? 'border-green-500'
                : payment.status === 'overdue'
                ? 'border-red-500'
                : 'border-yellow-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(payment.status)}
                  <span className="text-sm font-medium text-slate-300">
                    {getStatusLabel(payment.status)}
                  </span>
                  <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                    {getTypeLabel(payment.type)}
                  </span>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicatePayment(payment);
                      }}
                      className="text-slate-400 hover:text-slate-300 ml-auto"
                      title="複製"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                <h3 className="text-lg font-semibold text-white mb-2">
                  {payment.title}
                </h3>
                
                <p className="text-slate-300 text-sm mb-3">
                  {payment.description}
                </p>

                {/* タグ表示 */}
                {payment.tagIds && payment.tagIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {getPaymentTags(payment.tagIds).map(tag => (
                      <span
                        key={tag.id}
                        className={`inline-flex items-center gap-1 ${tag.color} text-white px-2 py-1 rounded-full text-xs`}
                      >
                        <span>{tag.name}</span>
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <span className="text-white font-semibold">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-300">
                        期限: {payment.dueDate.toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    {payment.status === 'paid' && payment.paidAt && (
                      <span className="text-xs text-slate-400">
                        支払日: {payment.paidAt.toLocaleDateString('ja-JP')}
                      </span>
                    )}
                    {payment.status === 'pending' && !isAdmin && (
                      <OptimizedButton
                        size="sm"
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowPaymentForm(true);
                        }}
                        icon={<CreditCard className="w-4 h-4" />}
                      >
                        支払う
                      </OptimizedButton>
                    )}
                    {isAdmin && payment.status !== 'paid' && (
                      <OptimizedButton
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendReminder(payment.id)}
                        icon={<Send className="w-4 h-4" />}
                      >
                        リマインダー
                      </OptimizedButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 請求作成フォーム */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">請求作成</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  タイトル
                </label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="請求のタイトル"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  金額
                </label>
                <input
                  type="number"
                  value={createForm.amount}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="金額を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  支払期限
                </label>
                <input
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  種類
                </label>
                <select
                  value={createForm.type}
                  onChange={(e) => setCreateForm(prev => ({ 
                    ...prev, 
                    type: e.target.value as 'monthly' | 'activity' | 'special' 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="monthly">月謝</option>
                  <option value="activity">活動費</option>
                  <option value="special">特別費</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  説明
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="請求の説明"
                />
              </div>

              {/* タグ選択 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  タグ
                </label>
                <TagSelector
                  tags={tags}
                  selectedTagIds={createForm.tagIds}
                  onSelectionChange={(selectedIds) => setCreateForm(prev => ({ ...prev, tagIds: selectedIds }))}
                  onTagsChange={setTags}
                  title="タグを選択"
                  placeholder="タグを検索..."
                  allowCreate={true}
                  allowEdit={true}
                  showSelectAll={false}
                  showSearch={true}
                />
              </div>

              {/* メンバー選択 */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  対象メンバー
                </label>
                <MemberSelector
                  members={members}
                  selectedMemberIds={createForm.selectedMemberIds}
                  onSelectionChange={(selectedIds) => setCreateForm(prev => ({ ...prev, selectedMemberIds: selectedIds }))}
                  title="請求対象メンバー"
                  placeholder="メンバーを検索..."
                  showSelectAll={true}
                  showSearch={true}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <OptimizedButton
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                キャンセル
              </OptimizedButton>
              <OptimizedButton
                onClick={handleCreatePayment}
                disabled={!createForm.title || createForm.amount <= 0}
              >
                作成
              </OptimizedButton>
            </div>
          </div>
        </div>
      )}

      {/* 支払いフォーム */}
      {showPaymentForm && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">支払い</h2>
            
            <div className="bg-slate-700 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-white mb-2">{selectedPayment.title}</h3>
              <p className="text-slate-300 text-sm mb-2">{selectedPayment.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">金額:</span>
                <span className="text-white font-semibold">{formatCurrency(selectedPayment.amount)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  支払方法
                </label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm(prev => ({ 
                    ...prev, 
                    paymentMethod: e.target.value as 'credit_card' | 'bank_transfer' | 'cash' 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="credit_card">クレジットカード</option>
                  <option value="bank_transfer">銀行振込</option>
                  <option value="cash">現金</option>
                </select>
              </div>

              {paymentForm.paymentMethod === 'credit_card' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      カード番号
                    </label>
                    <input
                      type="text"
                      value={paymentForm.cardNumber}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="1234 5678 9012 3456"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        有効期限
                      </label>
                      <input
                        type="text"
                        value={paymentForm.expiryDate}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, expiryDate: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <OptimizedButton
                variant="outline"
                onClick={() => setShowPaymentForm(false)}
              >
                キャンセル
              </OptimizedButton>
              <OptimizedButton
                onClick={handlePayment}
                disabled={paymentForm.paymentMethod === 'credit_card' && (!paymentForm.cardNumber || !paymentForm.expiryDate || !paymentForm.cvv)}
              >
                支払い完了
              </OptimizedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 