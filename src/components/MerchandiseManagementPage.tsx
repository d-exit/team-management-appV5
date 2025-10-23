import React, { useState, useCallback } from 'react';
import { ShoppingBag, Package, Truck, CreditCard, Plus, Edit, Trash2, Eye, Image, Upload } from 'lucide-react';
import { OptimizedButton } from './common/OptimizedButton';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'uniform' | 'equipment' | 'accessory' | 'other';
  sizes?: string[];
  colors?: string[];
  stock: number;
  image?: string;
  isActive: boolean;
}

interface Order {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  size?: string;
  color?: string;
  totalAmount: number;
  deliveryMethod: 'shipping' | 'handover';
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  orderedBy: string;
  orderedAt: Date;
  paidAt?: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
  shippingAddress?: string;
}

interface MerchandiseManagementPageProps {
  onBack: () => void;
  isAdmin?: boolean;
}

export const MerchandiseManagementPage: React.FC<MerchandiseManagementPageProps> = ({ onBack, isAdmin = false }) => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'チームユニフォーム',
      description: '公式チームユニフォームです。2024年最新デザインで、軽量・速乾性に優れています。',
      price: 8000,
      category: 'uniform',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['青', '白'],
      stock: 50,
      isActive: true,
    },
    {
      id: '2',
      name: '練習用シャツ',
      description: '日常練習用のシャツです。吸汗速乾素材で快適に練習できます。',
      price: 3000,
      category: 'uniform',
      sizes: ['S', 'M', 'L'],
      colors: ['グレー', '黒'],
      stock: 30,
      isActive: true,
    },
    {
      id: '3',
      name: '公式試合用ボール',
      description: '公式試合用の高品質ボールです。JFA公認品で、試合でも使用できます。',
      price: 5000,
      category: 'equipment',
      stock: 20,
      isActive: true,
    },
    {
      id: '4',
      name: '練習用ボール',
      description: '日常練習用のボールです。耐久性に優れ、長期間使用できます。',
      price: 2500,
      category: 'equipment',
      stock: 40,
      isActive: true,
    },
    {
      id: '5',
      name: 'チームジャケット',
      description: 'チーム公式ジャケットです。防寒性に優れ、試合時のウォームアップにも使用できます。',
      price: 12000,
      category: 'uniform',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['青', '黒'],
      stock: 25,
      isActive: true,
    },
    {
      id: '6',
      name: 'サッカーソックス',
      description: 'チームカラーのサッカーソックスです。3足セットでお得です。',
      price: 1500,
      category: 'accessory',
      sizes: ['S', 'M', 'L'],
      colors: ['青', '白'],
      stock: 100,
      isActive: true,
    },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      productId: '1',
      productName: 'チームユニフォーム',
      quantity: 1,
      size: 'M',
      color: '青',
      totalAmount: 8000,
      deliveryMethod: 'shipping',
      status: 'paid',
      orderedBy: '田中太郎',
      orderedAt: new Date('2024-01-15'),
      paidAt: new Date('2024-01-15'),
      shippingAddress: '東京都渋谷区...',
    },
    {
      id: '2',
      productId: '2',
      productName: '練習用シャツ',
      quantity: 2,
      size: 'L',
      color: 'グレー',
      totalAmount: 6000,
      deliveryMethod: 'handover',
      status: 'pending',
      orderedBy: '佐藤花子',
      orderedAt: new Date('2024-01-20'),
    },
  ]);

  const [showCreateProduct, setShowCreateProduct] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<'products' | 'orders'>('products');
  const [filter, setFilter] = useState<'all' | 'uniform' | 'equipment' | 'accessory' | 'other'>('all');

  const [createProductForm, setCreateProductForm] = useState({
    name: '',
    description: '',
    price: 0,
    category: 'uniform' as 'uniform' | 'equipment' | 'accessory' | 'other',
    sizes: [] as string[],
    colors: [] as string[],
    stock: 0,
    images: [] as string[],
  });

  const [orderForm, setOrderForm] = useState({
    quantity: 1,
    size: '',
    color: '',
    deliveryMethod: 'shipping' as 'shipping' | 'handover',
    shippingAddress: '',
  });

  const handleCreateProduct = useCallback(() => {
    if (!createProductForm.name || createProductForm.price <= 0) return;

    const newProduct: Product = {
      id: `product-${Date.now()}`,
      name: createProductForm.name,
      description: createProductForm.description,
      price: createProductForm.price,
      category: createProductForm.category,
      sizes: createProductForm.sizes,
      colors: createProductForm.colors,
      stock: createProductForm.stock,
      image: createProductForm.images[0], // 最初の画像をメイン画像として設定
      isActive: true,
    };

    setProducts(prev => [...prev, newProduct]);
    setCreateProductForm({
      name: '',
      description: '',
      price: 0,
      category: 'uniform',
      sizes: [],
      colors: [],
      stock: 0,
      images: [],
    });
    setShowCreateProduct(false);
  }, [createProductForm]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const imageUrl = URL.createObjectURL(file);
      setCreateProductForm(prev => ({
        ...prev,
        images: [...prev.images, imageUrl],
      }));
    });
  }, []);

  const handleCreateOrder = useCallback(() => {
    if (!selectedProduct || orderForm.quantity <= 0) return;

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: orderForm.quantity,
      size: orderForm.size,
      color: orderForm.color,
      totalAmount: selectedProduct.price * orderForm.quantity,
      deliveryMethod: orderForm.deliveryMethod,
      status: 'pending',
      orderedBy: '現在のユーザー',
      orderedAt: new Date(),
      shippingAddress: orderForm.shippingAddress,
    };

    setOrders(prev => [...prev, newOrder]);
    setOrderForm({
      quantity: 1,
      size: '',
      color: '',
      deliveryMethod: 'shipping',
      shippingAddress: '',
    });
    setSelectedProduct(null);
    setShowOrderForm(false);
  }, [selectedProduct, orderForm]);

  const handleUpdateOrderStatus = useCallback((orderId: string, status: Order['status']) => {
    setOrders(prev =>
      prev.map(order =>
        order.id === orderId
          ? {
              ...order,
              status,
              ...(status === 'paid' && { paidAt: new Date() }),
              ...(status === 'shipped' && { shippedAt: new Date() }),
              ...(status === 'delivered' && { deliveredAt: new Date() }),
            }
          : order
      )
    );
  }, []);

  const handleDeleteProduct = useCallback((productId: string) => {
    if (window.confirm('この商品を削除しますか？')) {
      setProducts(prev => prev.filter(product => product.id !== productId));
    }
  }, []);

  const filteredProducts = products.filter(product => {
    if (filter === 'all') return true;
    return product.category === filter;
  });

  const getCategoryLabel = (category: Product['category']) => {
    switch (category) {
      case 'uniform':
        return 'ユニフォーム';
      case 'equipment':
        return '用具';
      case 'accessory':
        return 'アクセサリー';
      case 'other':
        return 'その他';
    }
  };

  const getStatusLabel = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return '注文済み';
      case 'paid':
        return '支払済み';
      case 'shipped':
        return '発送済み';
      case 'delivered':
        return '配達済み';
      case 'cancelled':
        return 'キャンセル';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
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
          <h1 className="text-2xl font-bold text-white">物販管理</h1>
        </div>
        <div className="flex space-x-2">
          <OptimizedButton
            variant={viewMode === 'products' ? 'primary' : 'outline'}
            onClick={() => setViewMode('products')}
          >
            商品
          </OptimizedButton>
          <OptimizedButton
            variant={viewMode === 'orders' ? 'primary' : 'outline'}
            onClick={() => setViewMode('orders')}
          >
            注文
          </OptimizedButton>
          {isAdmin && viewMode === 'products' && (
            <OptimizedButton
              onClick={() => setShowCreateProduct(true)}
              icon={<Plus className="w-4 h-4" />}
            >
              商品追加
            </OptimizedButton>
          )}
        </div>
      </div>

      {viewMode === 'products' && (
        <>
          {/* 商品フィルター */}
          <div className="flex space-x-2 mb-6">
            <OptimizedButton
              variant={filter === 'all' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              すべて
            </OptimizedButton>
            <OptimizedButton
              variant={filter === 'uniform' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('uniform')}
            >
              ユニフォーム
            </OptimizedButton>
            <OptimizedButton
              variant={filter === 'equipment' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('equipment')}
            >
              用具
            </OptimizedButton>
            <OptimizedButton
              variant={filter === 'accessory' ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setFilter('accessory')}
            >
              アクセサリー
            </OptimizedButton>
          </div>

          {/* 商品一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                    {getCategoryLabel(product.category)}
                  </span>
                  {isAdmin && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
                
                {/* 商品画像 */}
                {product.image && (
                  <div className="mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  </div>
                )}

                <h3 className="text-lg font-semibold text-white mb-2">
                  {product.name}
                </h3>
                
                <p className="text-slate-300 text-sm mb-3">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-semibold">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="text-slate-400 text-sm">
                    在庫: {product.stock}個
                  </span>
                </div>

                {product.sizes && product.sizes.length > 0 && (
                  <div className="mb-2">
                    <span className="text-xs text-slate-400">サイズ: </span>
                    <span className="text-xs text-slate-300">
                      {product.sizes.join(', ')}
                    </span>
                  </div>
                )}

                {product.colors && product.colors.length > 0 && (
                  <div className="mb-3">
                    <span className="text-xs text-slate-400">カラー: </span>
                    <span className="text-xs text-slate-300">
                      {product.colors.join(', ')}
                    </span>
                  </div>
                )}

                {!isAdmin && (
                  <OptimizedButton
                    size="sm"
                    onClick={() => {
                      setSelectedProduct(product);
                      setShowOrderForm(true);
                    }}
                    disabled={product.stock <= 0}
                  >
                    注文する
                  </OptimizedButton>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {viewMode === 'orders' && (
        <>
          {/* 注文一覧 */}
          <div className="space-y-4">
            {orders.map(order => (
              <div key={order.id} className="bg-slate-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="px-2 py-1 bg-slate-700 rounded text-xs text-slate-300">
                        {getStatusLabel(order.status)}
                      </span>
                      <span className="text-xs text-slate-400">
                        {order.deliveryMethod === 'shipping' ? '配送' : '手渡し'}
                      </span>
                      {/* 進捗バー */}
                      <div className="flex-1 ml-4">
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              order.status === 'pending' ? 'bg-yellow-500 w-1/4' :
                              order.status === 'paid' ? 'bg-blue-500 w-1/2' :
                              order.status === 'shipped' ? 'bg-purple-500 w-3/4' :
                              order.status === 'delivered' ? 'bg-green-500 w-full' :
                              'bg-red-500 w-full'
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>注文</span>
                          <span>支払い</span>
                          <span>発送</span>
                          <span>完了</span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {order.productName}
                    </h3>
                    
                    <div className="text-sm text-slate-300 mb-3">
                      <div>数量: {order.quantity}個</div>
                      {order.size && <div>サイズ: {order.size}</div>}
                      {order.color && <div>カラー: {order.color}</div>}
                      <div>合計: {formatCurrency(order.totalAmount)}</div>
                      <div>注文者: {order.orderedBy}</div>
                      <div>注文日: {order.orderedAt.toLocaleDateString('ja-JP')}</div>
                    </div>

                    {order.shippingAddress && (
                      <div className="text-xs text-slate-400 mb-3">
                        配送先: {order.shippingAddress}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2">
                    {isAdmin && order.status === 'pending' && (
                      <OptimizedButton
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, 'paid')}
                      >
                        支払い確認
                      </OptimizedButton>
                    )}
                    {isAdmin && order.status === 'paid' && (
                      <OptimizedButton
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, 'shipped')}
                      >
                        発送
                      </OptimizedButton>
                    )}
                    {isAdmin && order.status === 'shipped' && (
                      <OptimizedButton
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                      >
                        配達完了
                      </OptimizedButton>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 商品作成フォーム */}
      {showCreateProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4">商品追加</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  商品名
                </label>
                <input
                  type="text"
                  value={createProductForm.name}
                  onChange={(e) => setCreateProductForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="商品名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  説明
                </label>
                <textarea
                  value={createProductForm.description}
                  onChange={(e) => setCreateProductForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="商品の説明"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  価格
                </label>
                <input
                  type="number"
                  value={createProductForm.price}
                  onChange={(e) => setCreateProductForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="価格を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  カテゴリ
                </label>
                <select
                  value={createProductForm.category}
                  onChange={(e) => setCreateProductForm(prev => ({ 
                    ...prev, 
                    category: e.target.value as 'uniform' | 'equipment' | 'accessory' | 'other' 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="uniform">ユニフォーム</option>
                  <option value="equipment">用具</option>
                  <option value="accessory">アクセサリー</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  在庫数
                </label>
                <input
                  type="number"
                  value={createProductForm.stock}
                  onChange={(e) => setCreateProductForm(prev => ({ ...prev, stock: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="在庫数を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  サイズ（カンマ区切り）
                </label>
                <input
                  type="text"
                  value={createProductForm.sizes.join(', ')}
                  onChange={(e) => setCreateProductForm(prev => ({ 
                    ...prev, 
                    sizes: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="S, M, L"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  カラー（カンマ区切り）
                </label>
                <input
                  type="text"
                  value={createProductForm.colors.join(', ')}
                  onChange={(e) => setCreateProductForm(prev => ({ 
                    ...prev, 
                    colors: e.target.value.split(',').map(s => s.trim()).filter(s => s) 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="青, 白, 黒"
                />
              </div>

              {/* 画像アップロード */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  商品画像
                </label>
                <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center space-y-2"
                  >
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="text-slate-400 text-sm">画像をアップロード</span>
                  </label>
                </div>
                
                {/* アップロードされた画像のプレビュー */}
                {createProductForm.images.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      アップロードされた画像
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {createProductForm.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`商品画像 ${index + 1}`}
                            className="w-full h-20 object-cover rounded"
                          />
                          <button
                            onClick={() => setCreateProductForm(prev => ({
                              ...prev,
                              images: prev.images.filter((_, i) => i !== index)
                            }))}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <OptimizedButton
                variant="outline"
                onClick={() => setShowCreateProduct(false)}
              >
                キャンセル
              </OptimizedButton>
              <OptimizedButton
                onClick={handleCreateProduct}
                disabled={!createProductForm.name || createProductForm.price <= 0}
              >
                追加
              </OptimizedButton>
            </div>
          </div>
        </div>
      )}

      {/* 注文フォーム */}
      {showOrderForm && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">商品注文</h2>
            
            <div className="bg-slate-700 p-4 rounded-lg mb-4">
              <h3 className="font-semibold text-white mb-2">{selectedProduct.name}</h3>
              <p className="text-slate-300 text-sm mb-2">{selectedProduct.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">価格:</span>
                <span className="text-white font-semibold">{formatCurrency(selectedProduct.price)}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  数量
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedProduct.stock}
                  value={orderForm.quantity}
                  onChange={(e) => setOrderForm(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    サイズ
                  </label>
                  <select
                    value={orderForm.size}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, size: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">サイズを選択</option>
                    {selectedProduct.sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
              )}

              {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    カラー
                  </label>
                  <select
                    value={orderForm.color}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">カラーを選択</option>
                    {selectedProduct.colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  配送方法
                </label>
                <select
                  value={orderForm.deliveryMethod}
                  onChange={(e) => setOrderForm(prev => ({ 
                    ...prev, 
                    deliveryMethod: e.target.value as 'shipping' | 'handover' 
                  }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="shipping">配送</option>
                  <option value="handover">手渡し</option>
                </select>
              </div>

              {orderForm.deliveryMethod === 'shipping' && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    配送先住所
                  </label>
                  <textarea
                    value={orderForm.shippingAddress}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, shippingAddress: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="配送先住所を入力"
                  />
                </div>
              )}

              <div className="bg-slate-700 p-3 rounded">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">合計金額:</span>
                  <span className="text-white font-semibold">
                    {formatCurrency(selectedProduct.price * orderForm.quantity)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <OptimizedButton
                variant="outline"
                onClick={() => setShowOrderForm(false)}
              >
                キャンセル
              </OptimizedButton>
              <OptimizedButton
                onClick={handleCreateOrder}
                disabled={orderForm.quantity <= 0 || orderForm.quantity > selectedProduct.stock}
              >
                注文する
              </OptimizedButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 