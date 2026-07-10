'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusCircle, 
  Settings, 
  Tag, 
  ShoppingBag, 
  MessageSquare, 
  Sparkles,
  CheckCircle,
  Trash2,
  Edit3,
  Image as ImageIcon,
  Star,
  Upload,
  XCircle,
  ChevronDown,
  LogOut,
  ListOrdered,
  Users,
  ShieldAlert,
  Eye,
  EyeOff
} from 'lucide-react';
import { getApiErrorMessage, parseApiResponse } from '@/lib/clientApi';

// Beautiful light-themed multi-select dropdown for admin panel
function AdminMultiSelect({ options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (opt) => {
    if (selected.includes(opt)) {
      if (selected.length > 1) {
        onChange(selected.filter(item => item !== opt));
      }
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="relative w-full mt-1 group" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 text-left flex justify-between items-center transition-all focus:outline-none focus:border-red-650 h-[42px] shadow-sm"
      >
        <span className="truncate pr-4 text-neutral-700 font-medium">{selected.join(', ') || 'Выберите варианты'}</span>
        <ChevronDown 
          className="w-4 h-4 text-neutral-400 transition-transform duration-300 ease-out"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl z-30 max-h-52 overflow-y-auto py-1.5 transition-all duration-300 transform origin-top scale-100 ease-out">
          {options.map((opt) => {
            const isChecked = selected.includes(opt);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleToggle(opt)}
                className="w-full text-left px-4 py-3 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 flex items-center justify-between transition-all group/item"
              >
                <span className={`transition-transform duration-200 group-hover/item:translate-x-1 ${isChecked ? 'text-red-600 font-bold' : ''}`}>
                  {opt}
                </span>
                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  isChecked ? 'bg-red-600 border-red-600 text-white scale-105 shadow-md shadow-red-600/30' : 'border-neutral-300 bg-white group-hover/item:border-neutral-400'
                }`}>
                  {isChecked && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Beautiful light-themed single-select dropdown for admin panel
function AdminSingleSelect({ options, selected, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (opt) => {
    onChange(opt);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full mt-1 group" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-neutral-800 text-left flex justify-between items-center transition-all focus:outline-none focus:border-red-650 h-[42px] shadow-sm"
      >
        <span className="truncate pr-4 capitalize text-neutral-700 font-medium">{selected}</span>
        <ChevronDown 
          className="w-4 h-4 text-neutral-400 transition-transform duration-300 ease-out"
          style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl z-30 max-h-52 overflow-y-auto py-1.5 transition-all duration-300 transform origin-top scale-100 ease-out">
          {options.map((opt) => {
            const isSelected = selected === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className="w-full text-left px-4 py-3 text-xs text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900 flex items-center justify-between transition-all capitalize group/item"
              >
                <span className={`transition-transform duration-200 group-hover/item:translate-x-1 ${isSelected ? 'text-red-500 font-bold' : ''}`}>
                  {opt}
                </span>
                {isSelected && <CheckCircle className="w-4 h-4 text-red-500 scale-105" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

const getActionLabel = (action) => {
  const labels = {
    'LOGIN_SUCCESS': 'Вход в систему',
    'LOGIN_FAILED': 'Ошибка входа',
    'USER_CREATED': 'Создание сотрудника',
    'USER_UPDATED': 'Редактирование прав',
    'USER_DELETED': 'Удаление сотрудника',
    'DELETE_LEAD': 'Удаление заявки',
    'LEAD_CREATED': 'Создание заявки',
    'LEAD_UPDATED': 'Обновление заявки',
    'LEAD_DELETED': 'Удаление заявки',
    'PRODUCT_CREATED': 'Создание кухни',
    'PRODUCT_UPDATED': 'Редактирование кухни',
    'PRODUCT_DELETED': 'Удаление кухни',
    'REVIEW_CREATED': 'Создание отзыва',
    'REVIEW_UPDATED': 'Редактирование отзыва',
    'REVIEW_DELETED': 'Удаление отзыва',
    'PROMO_CREATED': 'Создание акции',
    'PROMO_UPDATED': 'Редактирование акции',
    'PROMO_DELETED': 'Удаление акции',
    'LEAD_STATUS_UPDATED': 'Статус заявки',
    'LOGIN_RATE_LIMITED': 'Блокировка (флуд)'
  };
  return labels[action] || action;
};

const formatLogDetails = (action, details) => {
  if (!details) return '—';
  const text = String(details).trim();
  if (!text.startsWith('{') && !text.startsWith('[')) {
    return text;
  }
  try {
    const data = JSON.parse(text);
    const permissionLabels = {
      'canManageProducts': 'Управление товарами',
      'canManageReviews': 'Управление отзывами',
      'canManagePromos': 'Управление акциями',
      'canManageLeads': 'Просмотр заявок',
      'canDeleteLeads': 'Удаление заявок',
      'username': 'Имя пользователя',
      'password': 'Пароль'
    };
    
    switch (action) {
      case 'LOGIN_SUCCESS':
        return 'Успешная авторизация в панели управления';
      case 'LOGIN_FAILED':
        return `Неверный пароль или имя пользователя (попытка входа: "${data.username || 'неизвестно'}")`;
      case 'LOGIN_RATE_LIMITED':
        return `Слишком много попыток входа с IP: ${data.ip || 'неизвестно'}`;
      case 'USER_CREATED':
        return `Создана учётная запись сотрудника "${data.username || 'без имени'}"`;
      case 'USER_DELETED':
        return `Удалена учётная запись сотрудника "${data.username || 'без имени'}"`;
      case 'USER_UPDATED': {
        const fields = data.fields || [];
        const translatedFields = fields.map(f => permissionLabels[f] || f);
        return `Обновлены данные сотрудника "${data.username || 'без имени'}"${translatedFields.length > 0 ? ` (измененные поля: ${translatedFields.join(', ')})` : ''}`;
      }
      case 'LEAD_CREATED':
        return 'Поступила новая заявка на расчет стоимости';
      case 'LEAD_UPDATED': {
        const fields = data.fields || [];
        const translated = fields.map(f => f === 'status' ? 'статус' : f);
        return `Обновлена заявка от клиента${translated.length > 0 ? ` (измененные поля: ${translated.join(', ')})` : ''}`;
      }
      case 'LEAD_DELETED':
        return `Удалена заявка от клиента "${data.name || 'без имени'}"`;
      case 'PRODUCT_CREATED':
        return 'Создана карточка кухни';
      case 'PRODUCT_UPDATED':
        return 'Обновлена карточка кухни';
      case 'PRODUCT_DELETED':
        return 'Удалена карточка кухни';
      case 'REVIEW_CREATED':
        return 'Опубликован новый отзыв клиента';
      case 'REVIEW_UPDATED':
        return 'Обновлен отзыв клиента';
      case 'REVIEW_DELETED':
        return 'Удален отзыв клиента';
      case 'PROMO_CREATED':
        return 'Создана новая акция';
      case 'PROMO_UPDATED':
        return 'Обновлена акция';
      case 'PROMO_DELETED':
        return 'Удалена акция';
      default:
        if (data.name) return `Элемент: "${data.name}"`;
        if (data.title) return `Заголовок: "${data.title}"`;
        if (data.username) return `Пользователь: "${data.username}"`;
        return text;
    }
  } catch (e) {
    return text;
  }
};

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [permissions, setPermissions] = useState({
    canManageProducts: false,
    canManageReviews: false,
    canManagePromos: false,
    canManageLeads: false,
    canDeleteLeads: false
  });
  const [users, setUsers] = useState([]);
  const [userForm, setUserForm] = useState({
    username: '',
    password: '',
    canManageProducts: false,
    canManageReviews: false,
    canManagePromos: false,
    canManageLeads: false,
    canDeleteLeads: false
  });
  const [editingUserId, setEditingUserId] = useState(null);
  const [showEmployeePassword, setShowEmployeePassword] = useState(false);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Logout error:', err);
    }
  };
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [leads, setLeads] = useState([]);
  const [logs, setLogs] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loading, setLoading] = useState(true);

  // Dynamic available lists state to allow "+ Добавить свое"
  const [facadeOptions, setFacadeOptions] = useState(['AGT', 'Alvic', 'Fenix', 'ЛДСП', 'ЛДСП EGGER', 'МДФ ПВХ', 'МДФ эмаль', 'Пластик']);
  const [hardwareOptions, setHardwareOptions] = useState(['Blum (Австрия)', 'Hettich (Германия)', 'Boyard (Россия)', 'DTC (Китай)']);
  const [countertopOptions, setCountertopOptions] = useState(['ЛЮКСФОРМ (Пластик HPL)', 'Искусственный камень (Акрил)', 'Кварцевый агломерат', 'Керамогранит', 'Массив дерева']);

  // Form states
  const [productForm, setProductForm] = useState({
    title: '', slug: '', shape: 'угловая', frontType: 'AGT', price: '',
    imageUrl: '', width: '', height: '', depth: '',
    materials: '', hardware: '', backlight: 'Диодная - теплая',
    description: '', seo_title: '', seo_description: '',
    showOnMain: false
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [selectedAdminFacades, setSelectedAdminFacades] = useState(['AGT']);
  const [selectedAdminHardwares, setSelectedAdminHardwares] = useState(['Blum (Австрия)']);
  const [selectedAdminCountertops, setSelectedAdminCountertops] = useState(['ЛЮКСФОРМ (Пластик HPL)']);
  const [editingProductId, setEditingProductId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [reviewImageUploading, setReviewImageUploading] = useState(false);

  const [promoForm, setPromoForm] = useState({
    title: '', discount: '', description: '', seo_title: '', seo_description: ''
  });

  const [reviewForm, setReviewForm] = useState({
    author: '', rating: '5', title: '', text: '', imageUrl: '', videoUrl: '',
    seo_title: '', seo_description: ''
  });

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Dynamic extraction: Hide main website's header, top info-bar, and footer
  useEffect(() => {
    const header = document.querySelector('nav');
    const topInfo = document.querySelector('header');
    const footer = document.querySelector('footer');
    
    if (header) header.style.display = 'none';
    if (topInfo) topInfo.style.display = 'none';
    if (footer) footer.style.display = 'none';
    
    return () => {
      if (header) header.style.display = '';
      if (topInfo) topInfo.style.display = '';
      if (footer) footer.style.display = '';
    };
  }, []);

  const fetchUserStatus = async () => {
    try {
      const res = await fetch('/api/auth/status');
      if (res.ok) {
        const data = await parseApiResponse(res);
        setCurrentUser(data);
        setPermissions(data.permissions);
        
        // Define initial activeTab based on permissions
        if (data.role === 'admin') {
          setActiveTab('dashboard');
        } else {
          if (data.permissions.canManageLeads) {
            setActiveTab('leads');
          } else if (data.permissions.canManageProducts) {
            setActiveTab('products');
          } else if (data.permissions.canManageReviews) {
            setActiveTab('reviews');
          } else if (data.permissions.canManagePromos) {
            setActiveTab('promos');
          } else {
            setActiveTab('no-access');
          }
        }
        return data;
      } else {
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Error loading auth status:', err);
      router.push('/admin/login');
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        setUsers(await parseApiResponse(res));
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  // Fetch initial data
  const fetchData = async (userSession = currentUser, userPerms = permissions) => {
    setLoading(true);
    try {
      const isAdmin = userSession?.role === 'admin';
      
      const prodRes = (isAdmin || userPerms?.canManageProducts) ? await fetch('/api/products') : null;
      const promoRes = (isAdmin || userPerms?.canManagePromos) ? await fetch('/api/promos') : null;
      const revRes = (isAdmin || userPerms?.canManageReviews) ? await fetch('/api/reviews') : null;
      
      if (prodRes && prodRes.ok) {
        const prodData = await parseApiResponse(prodRes);
        setProducts(prodData);
        
        prodData.forEach(p => {
          if (p.frontType && !facadeOptions.includes(p.frontType)) {
            setFacadeOptions(prev => {
              if (prev.includes(p.frontType)) return prev;
              return [...prev, p.frontType];
            });
          }
          if (p.hardware) {
            p.hardware.split(',').forEach(h => {
              const cleaned = h.trim();
              if (cleaned) {
                setHardwareOptions(prev => {
                  if (prev.includes(cleaned)) return prev;
                  return [...prev, cleaned];
                });
              }
            });
          }
          if (p.materials) {
            p.materials.split(',').forEach(m => {
              const cleaned = m.trim();
              if (cleaned) {
                setCountertopOptions(prev => {
                  if (prev.includes(cleaned)) return prev;
                  return [...prev, cleaned];
                });
              }
            });
          }
        });
      }
      if (promoRes && promoRes.ok) setPromos(await parseApiResponse(promoRes));
      if (revRes && revRes.ok) setReviews(await parseApiResponse(revRes));
      
      if (isAdmin || userPerms?.canManageLeads) {
        const leadRes = await fetch('/api/leads');
        if (leadRes.ok) {
          const leadData = await parseApiResponse(leadRes);
          setLeads(leadData);
          if (leadData.length > 0 && !selectedLead) {
            setSelectedLead(leadData[0]);
          }
        }
      }

      if (isAdmin) {
        const logRes = await fetch('/api/logs');
        if (logRes.ok) {
          setLogs(await parseApiResponse(logRes));
        }
        await fetchUsers();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLead = async (id) => {
    if (!confirm('Вы действительно хотите удалить эту заявку?')) return;
    try {
      const res = await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
      await parseApiResponse(res);
      triggerSuccess('Data loaded');
      if (selectedLead?.id === id) {
        setSelectedLead(null);
      }
      fetchData();
    } catch (err) {
      setErrorMsg(getApiErrorMessage(err, 'Could not load data'));
    }
  };

  useEffect(() => {
    fetchUserStatus().then(session => {
      if (session) {
        fetchData(session, session.permissions);
      }
    });
  }, []);

  const triggerSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const method = 'POST';
      const url = editingUserId ? `/api/users?id=${editingUserId}&_method=PATCH` : '/api/users';
      const body = {
        username: userForm.username,
        canManageProducts: userForm.canManageProducts,
        canManageReviews: userForm.canManageReviews,
        canManagePromos: userForm.canManagePromos,
        canManageLeads: userForm.canManageLeads,
        canDeleteLeads: userForm.canDeleteLeads
      };

      if (userForm.password.trim() !== '') {
        body.password = userForm.password;
      } else if (!editingUserId) {
        alert('Пароль обязателен для нового сотрудника');
        return;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        triggerSuccess(editingUserId ? 'Данные сотрудника обновлены!' : 'Сотрудник успешно добавлен!');
        setUserForm({
          username: '',
          password: '',
          canManageProducts: false,
          canManageReviews: false,
          canManagePromos: false,
          canManageLeads: false,
          canDeleteLeads: false
        });
        setEditingUserId(null);
        fetchUsers();
      } else {
        const errData = await parseApiResponse(res);
        alert(errData.message || 'Ошибка сохранения данных');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(getApiErrorMessage(err, 'Could not save user data'));
    }
  };

  const handleEditUserClick = (usr) => {
    setEditingUserId(usr.id);
    setUserForm({
      username: usr.username,
      password: '',
      canManageProducts: usr.canManageProducts,
      canManageReviews: usr.canManageReviews,
      canManagePromos: usr.canManagePromos,
      canManageLeads: usr.canManageLeads,
      canDeleteLeads: usr.canDeleteLeads
    });
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Вы действительно хотите удалить этого сотрудника?')) return;
    try {
      const res = await fetch(`/api/users?id=${id}&_method=DELETE`, { method: 'POST' });
      if (res.ok) {
        triggerSuccess('Сотрудник успешно удален!');
        fetchUsers();
      } else {
        const errData = await parseApiResponse(res);
        alert(errData.message || 'Ошибка при удалении');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(getApiErrorMessage(err, 'Could not delete user'));
    }
  };

  // Reset product form
  const resetProductForm = () => {
    setEditingProductId(null);
    setUploadedImages([]);
    setSelectedAdminFacades(['AGT']);
    setSelectedAdminHardwares(['Blum (Австрия)']);
    setSelectedAdminCountertops(['ЛЮКСФОРМ (Пластик HPL)']);
    setProductForm({
      title: '', slug: '', shape: 'угловая', frontType: '', price: '',
      imageUrl: '', width: '', height: '', depth: '',
      materials: '', hardware: '', backlight: 'Диодная - теплая',
      description: '', seo_title: '', seo_description: '',
      showOnMain: false
    });
  };

  // Submit handlers
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = '/api/products';
      const method = editingProductId ? 'PUT' : 'POST';
      const body = {
        ...productForm,
        frontType: selectedAdminFacades.join(','),
        hardware: selectedAdminHardwares.join(','),
        materials: selectedAdminCountertops.join(','),
        price: parseInt(productForm.price) || 0,
        width: parseInt(productForm.width) || 0,
        height: parseInt(productForm.height) || 0,
        depth: parseInt(productForm.depth) || 0
      };

      if (editingProductId) {
        body.id = editingProductId;
      }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        triggerSuccess(editingProductId ? 'Товар успешно обновлен!' : 'Товар успешно добавлен!');
        resetProductForm();
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Вы действительно хотите удалить этот товар?')) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        triggerSuccess('Товар успешно удален!');
        fetchData();
      }
    } catch (err) {
      console.error('Delete product error:', err);
    }
  };

  const handleToggleShowOnMain = async (product) => {
    const isNewFeaturedState = !product.showOnMain;
    if (isNewFeaturedState) {
      const featuredCount = products.filter(p => p.showOnMain && p.id !== product.id).length;
      if (featuredCount >= 9) {
        alert('Превышен лимит! На главной странице может отображаться не более 9 кухонь.');
        return;
      }
    }

    try {
      const body = {
        ...product,
        showOnMain: isNewFeaturedState
      };
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        triggerSuccess(isNewFeaturedState ? 'Кухня добавлена на главную!' : 'Кухня убрана с главной');
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling featured state:', err);
    }
  };

  const handleEditProductClick = (product) => {
    setEditingProductId(product.id);
    
    // Auto add custom options on editing if they are not in dynamic selection states
    if (product.frontType && !facadeOptions.includes(product.frontType)) {
      setFacadeOptions(prev => [...prev, product.frontType]);
    }
    if (product.hardware) {
      product.hardware.split(',').forEach(h => {
        const cleaned = h.trim();
        if (cleaned && !hardwareOptions.includes(cleaned)) {
          setHardwareOptions(prev => [...prev, cleaned]);
        }
      });
    }
    if (product.materials) {
      product.materials.split(',').forEach(m => {
        const cleaned = m.trim();
        if (cleaned && !countertopOptions.includes(cleaned)) {
          setCountertopOptions(prev => [...prev, cleaned]);
        }
      });
    }

    setProductForm({
      title: product.title,
      slug: product.slug,
      shape: product.shape,
      frontType: product.frontType,
      price: product.price.toString(),
      imageUrl: product.imageUrl || '',
      width: product.width.toString(),
      height: product.height.toString(),
      depth: product.depth.toString(),
      materials: product.materials || '',
      hardware: product.hardware || '',
      backlight: product.backlight || 'Диодная - теплая',
      description: product.description || '',
      seo_title: product.seo_title || '',
      seo_description: product.seo_description || '',
      showOnMain: product.showOnMain || false
    });

    setUploadedImages(product.imageUrl ? product.imageUrl.split(',').filter(Boolean) : []);
    
    const parsedFacades = product.frontType ? product.frontType.split(',').map(s => s.trim()) : ['AGT'];
    setSelectedAdminFacades(parsedFacades);

    const parsedHardwares = product.hardware ? product.hardware.split(',').map(s => s.trim()) : ['Blum (Австрия)'];
    setSelectedAdminHardwares(parsedHardwares);
    
    const parsedCountertops = product.materials ? product.materials.split(',').map(s => s.trim()) : ['ЛЮКСФОРМ (Пластик HPL)'];
    setSelectedAdminCountertops(parsedCountertops);
  };

  // Dynamic adds
  const addCustomFacade = () => {
    const val = window.prompt('Введите название нового фасада (например: Массив Дуба):');
    if (val && val.trim()) {
      const cleaned = val.trim();
      if (!facadeOptions.includes(cleaned)) {
        setFacadeOptions([...facadeOptions, cleaned]);
      }
      if (!selectedAdminFacades.includes(cleaned)) {
        setSelectedAdminFacades([...selectedAdminFacades, cleaned]);
      }
    }
  };

  const addCustomHardware = () => {
    const val = window.prompt('Введите название новой фурнитуры (например: Salice (Италия)):');
    if (val && val.trim()) {
      const cleaned = val.trim();
      if (!hardwareOptions.includes(cleaned)) {
        setHardwareOptions([...hardwareOptions, cleaned]);
      }
      if (!selectedAdminHardwares.includes(cleaned)) {
        setSelectedAdminHardwares([...selectedAdminHardwares, cleaned]);
      }
    }
  };

  const addCustomCountertop = () => {
    const val = window.prompt('Введите название новой столешницы (например: Керамогранит 12мм):');
    if (val && val.trim()) {
      const cleaned = val.trim();
      if (!countertopOptions.includes(cleaned)) {
        setCountertopOptions([...countertopOptions, cleaned]);
      }
      if (!selectedAdminCountertops.includes(cleaned)) {
        setSelectedAdminCountertops([...selectedAdminCountertops, cleaned]);
      }
    }
  };

  // Image Upload Handling
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    const newUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await parseApiResponse(res);
          newUrls.push(data.url);
        }
      } catch (err) {
        console.error('File upload error:', err);
      }
    }

    setUploading(false);

    const updatedImages = [...uploadedImages, ...newUrls];
    setUploadedImages(updatedImages);

    setProductForm(prev => ({
      ...prev,
      imageUrl: updatedImages.join(',')
    }));
  };

  // Video Upload Handling
  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setVideoUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const data = await parseApiResponse(res);
        setReviewForm(prev => ({
          ...prev,
          videoUrl: data.url
        }));
        triggerSuccess('Видео успешно загружено!');
      } else {
        alert('Ошибка при загрузке видео');
      }
    } catch (err) {
      console.error('Video upload error:', err);
      alert('Ошибка соединения при загрузке видео');
    } finally {
      setVideoUploading(false);
    }
  };

  // Review Image Upload Handling
  const handleReviewImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setReviewImageUploading(true);
    const newUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        if (res.ok) {
          const data = await parseApiResponse(res);
          newUrls.push(data.url);
        }
      } catch (err) {
        console.error('Review image upload error:', err);
      }
    }

    setReviewImageUploading(false);

    const existing = reviewForm.imageUrl ? reviewForm.imageUrl.split(',').filter(Boolean) : [];
    const updated = [...existing, ...newUrls];
    setReviewForm(prev => ({
      ...prev,
      imageUrl: updated.join(',')
    }));
    if (newUrls.length > 0) triggerSuccess(`Загружено ${newUrls.length} фото!`);
  };

  const deleteReviewImage = (index) => {
    const images = reviewForm.imageUrl ? reviewForm.imageUrl.split(',').filter(Boolean) : [];
    images.splice(index, 1);
    setReviewForm(prev => ({
      ...prev,
      imageUrl: images.join(',')
    }));
  };

  // Set selected image as cover (title image)
  const makeImageCover = (index) => {
    const updated = [...uploadedImages];
    const [img] = updated.splice(index, 1);
    updated.unshift(img);
    setUploadedImages(updated);
    setProductForm(prev => ({
      ...prev,
      imageUrl: updated.join(',')
    }));
  };

  // Delete specific image from list
  const deleteImage = (index) => {
    const updated = [...uploadedImages];
    updated.splice(index, 1);
    setUploadedImages(updated);
    setProductForm(prev => ({
      ...prev,
      imageUrl: updated.join(',')
    }));
  };

  const handlePromoSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(promoForm)
      });
      if (res.ok) {
        triggerSuccess('Акция успешно добавлена!');
        setPromoForm({ title: '', discount: '', description: '', seo_title: '', seo_description: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...reviewForm,
          rating: parseInt(reviewForm.rating) || 5
        })
      });
      if (res.ok) {
        triggerSuccess('Отзыв успешно добавлен!');
        setReviewForm({ author: '', rating: '5', title: '', text: '', imageUrl: '', videoUrl: '', seo_title: '', seo_description: '' });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 text-neutral-900 py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-neutral-200 gap-4">
          <div>
            <span className="text-red-500 font-semibold tracking-wider text-xs uppercase">Панель управления CMS</span>
            <h1 className="text-3xl font-black text-neutral-900 mt-1">ЦВЕТКОВ МЕБЕЛЬ АДМИНКА</h1>
            <p className="text-neutral-500 text-xs mt-2">
              Управление товарами каталога, акциями, отзывами. Добавляйте свои варианты фасадов, фурнитуры и столешниц.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {errorMsg && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs">{errorMsg}</div>
            )}
            {successMsg && (
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 text-green-700 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>{successMsg}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-neutral-900 hover:bg-red-650 text-white font-bold py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Выйти</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 bg-neutral-100 p-1 rounded-xl w-fit border border-neutral-200">
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { setActiveTab('dashboard'); }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'dashboard' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-850'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Аналитика</span>
            </button>
          )}
          {(currentUser?.role === 'admin' || permissions?.canManageProducts) && (
            <button
              onClick={() => { setActiveTab('products'); resetProductForm(); }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'products' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-850'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Товары ({products.length})</span>
            </button>
          )}
          {(currentUser?.role === 'admin' || permissions?.canManagePromos) && (
            <button
              onClick={() => setActiveTab('promos')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'promos' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-850'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Акции ({promos.length})</span>
            </button>
          )}
          {(currentUser?.role === 'admin' || permissions?.canManageReviews) && (
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'reviews' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-850'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Отзывы ({reviews.length})</span>
            </button>
          )}
          {(currentUser?.role === 'admin' || permissions?.canManageLeads) && (
            <button
              onClick={() => { setActiveTab('leads'); }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'leads' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-850'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Заявки ({leads.length})</span>
            </button>
          )}
          {currentUser?.role === 'admin' && (
            <button
              onClick={() => { setActiveTab('users'); }}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                activeTab === 'users' ? 'bg-red-600 text-white shadow-sm' : 'text-neutral-500 hover:text-neutral-850'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Сотрудники ({users.length})</span>
            </button>
          )}
        </div>

        {/* Main Content Grid */}
        {activeTab === 'no-access' ? (
          <div className="bg-white border border-neutral-200/80 p-8 rounded-3xl text-center space-y-4 max-w-lg mx-auto shadow-sm my-12 animate-fade-in">
            <div className="w-16 h-16 bg-red-50 border border-red-200 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-neutral-900 uppercase">Доступ ограничен</h2>
            <p className="text-neutral-500 text-xs font-light">
              У вашей учётной записи нет активных разрешений для управления разделами сайта.
            </p>
            <p className="text-neutral-400 text-[10px] font-bold uppercase tracking-wider">
              Обратитесь к администратору (CEO) для настройки роли сотрудника
            </p>
          </div>
        ) : activeTab === 'users' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            {/* Form Column */}
            <div className="lg:col-span-1 bg-white border border-neutral-200/80 p-6 rounded-2xl h-fit space-y-6 shadow-sm">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
                  <PlusCircle className="w-5 h-5 text-red-500" />
                  <span>{editingUserId ? 'Редактировать сотрудника' : 'Добавить сотрудника'}</span>
                </h2>
                {editingUserId && (
                  <button 
                    onClick={() => {
                      setEditingUserId(null);
                      setUserForm({
                        username: '',
                        password: '',
                        canManageProducts: false,
                        canManageReviews: false,
                        canManagePromos: false,
                        canManageLeads: false,
                        canDeleteLeads: false
                      });
                    }}
                    className="text-neutral-500 hover:text-neutral-950 text-[10px] uppercase font-bold tracking-wider"
                  >
                    Отмена
                  </button>
                )}
              </div>

              <form onSubmit={handleUserSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Имя пользователя</label>
                  <input
                    type="text" required
                    value={userForm.username}
                    onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                    placeholder="manager_name"
                    className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 focus:border-red-600 focus:outline-none rounded-xl px-4 h-[42px] text-xs text-neutral-900 placeholder-neutral-400 mt-1 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    {editingUserId ? 'Пароль (оставьте пустым для сохранения прежнего)' : 'Пароль'}
                  </label>
                  <div className="relative">
                    <input
                      type={showEmployeePassword ? 'text' : 'password'}
                      required={!editingUserId}
                      value={userForm.password}
                      onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                      placeholder="••••••••"
                      className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 focus:border-red-600 focus:outline-none rounded-xl pl-4 pr-10 h-[42px] text-xs text-neutral-900 placeholder-neutral-400 mt-1 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowEmployeePassword(!showEmployeePassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 focus:outline-none mt-0.5"
                    >
                      {showEmployeePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-450 tracking-wider block">Разрешения (Права доступа)</span>
                  
                  <div className="space-y-2.5">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userForm.canManageProducts}
                        onChange={(e) => setUserForm({...userForm, canManageProducts: e.target.checked})}
                        className="w-4 h-4 rounded border-neutral-300 text-red-600 focus:ring-red-650"
                      />
                      <span className="text-xs text-neutral-700 font-semibold">Управление товарами</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userForm.canManageReviews}
                        onChange={(e) => setUserForm({...userForm, canManageReviews: e.target.checked})}
                        className="w-4 h-4 rounded border-neutral-300 text-red-600 focus:ring-red-650"
                      />
                      <span className="text-xs text-neutral-700 font-semibold">Управление отзывами</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userForm.canManagePromos}
                        onChange={(e) => setUserForm({...userForm, canManagePromos: e.target.checked})}
                        className="w-4 h-4 rounded border-neutral-300 text-red-600 focus:ring-red-650"
                      />
                      <span className="text-xs text-neutral-700 font-semibold">Управление акциями</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={userForm.canManageLeads}
                        onChange={(e) => setUserForm({...userForm, canManageLeads: e.target.checked})}
                        className="w-4 h-4 rounded border-neutral-300 text-red-600 focus:ring-red-650"
                      />
                      <span className="text-xs text-neutral-700 font-semibold">Просмотр и ведение заявок</span>
                    </label>

                    <label className="flex items-center space-x-3 cursor-pointer pl-6 border-l border-neutral-200">
                      <input
                        type="checkbox"
                        checked={userForm.canDeleteLeads}
                        onChange={(e) => setUserForm({...userForm, canDeleteLeads: e.target.checked})}
                        className="w-4 h-4 rounded border-neutral-300 text-red-600 focus:ring-red-650"
                      />
                      <span className="text-xs text-neutral-700 font-semibold flex items-center space-x-1.5">
                        <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                        <span>Удаление заявок</span>
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer mt-4"
                >
                  {editingUserId ? 'Сохранить изменения' : 'Добавить сотрудника'}
                </button>
              </form>
            </div>

            {/* List Column */}
            <div className="lg:col-span-2 bg-white border border-neutral-200/80 p-6 rounded-2xl h-fit space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
                <Settings className="w-5 h-5 text-red-500" />
                <span>Список сотрудников</span>
              </h2>

              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                {users.map(u => (
                  <div key={u.id} className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-xl flex justify-between items-center text-xs gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-neutral-900 text-sm">{u.username}</span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                          u.role === 'admin' 
                            ? 'bg-red-50 text-red-600 border-red-200/50' 
                            : 'bg-blue-50 text-blue-600 border-blue-200/50'
                        }`}>
                          {u.role === 'admin' ? 'CEO' : 'Менеджер'}
                        </span>
                      </div>
                      
                      {u.role !== 'admin' && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {u.canManageProducts && <span className="bg-neutral-200/60 px-2 py-0.5 rounded text-[9px] text-neutral-700 font-bold">Товары</span>}
                          {u.canManageReviews && <span className="bg-neutral-200/60 px-2 py-0.5 rounded text-[9px] text-neutral-700 font-bold">Отзывы</span>}
                          {u.canManagePromos && <span className="bg-neutral-200/60 px-2 py-0.5 rounded text-[9px] text-neutral-700 font-bold">Акции</span>}
                          {u.canManageLeads && <span className="bg-neutral-200/60 px-2 py-0.5 rounded text-[9px] text-neutral-700 font-bold">Заявки</span>}
                          {u.canDeleteLeads && <span className="bg-red-50 border border-red-200/60 text-red-600 px-2 py-0.5 rounded text-[9px] font-bold">Удаление лидов</span>}
                          {!u.canManageProducts && !u.canManageReviews && !u.canManagePromos && !u.canManageLeads && (
                            <span className="text-neutral-400 italic text-[10px]">Нет активных разрешений</span>
                          )}
                        </div>
                      )}
                    </div>

                    {u.role !== 'admin' && (
                      <div className="flex space-x-1 shrink-0">
                        <button
                          onClick={() => handleEditUserClick(u)}
                          className="p-2 rounded-lg bg-white hover:bg-neutral-50 text-neutral-500 hover:text-neutral-850 border border-neutral-200 shadow-sm cursor-pointer"
                          title="Редактировать права"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 rounded-lg bg-white hover:bg-red-50 text-neutral-400 hover:text-red-650 border border-neutral-200 hover:border-red-200/60 shadow-sm cursor-pointer"
                          title="Удалить сотрудника"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'dashboard' ? (
          <div className="space-y-8 animate-fade-in">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Card 1: Total Leads */}
              <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-450 uppercase font-black tracking-wider">Всего лидов</span>
                  <h3 className="text-3xl font-black text-neutral-900">{leads.length}</h3>
                </div>
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100 shadow-sm shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>

              {/* Card 2: Average Budget */}
              <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-450 uppercase font-black tracking-wider">Ср. бюджет сделки</span>
                  <h3 className="text-2xl font-black text-neutral-900">
                    {(() => {
                      let total = 0;
                      let count = 0;
                      leads.forEach(l => {
                        if (l.budget) {
                          const nums = l.budget.replace(/\s/g, '').match(/\d+/g);
                          if (nums && nums.length > 0) {
                            const avg = nums.reduce((sum, n) => sum + parseInt(n), 0) / nums.length;
                            total += avg;
                            count++;
                          }
                        }
                      });
                      const average = count > 0 ? Math.round(total / count) : 350;
                      return `${average.toLocaleString('ru-RU')} тыс. ₽`;
                    })()}
                  </h3>
                  <p className="text-[10px] text-neutral-500 font-medium">На основе ответов квиза</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              {/* Card 3: Active Leads */}
              <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-sm flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-neutral-450 uppercase font-black tracking-wider">Активно в работе</span>
                  <h3 className="text-3xl font-black text-neutral-900">
                    {leads.filter(l => 
                      l.status === 'PROCESSING' || 
                      l.status === 'MEASURING' || 
                      l.status === 'PROJECT_READY'
                    ).length}
                  </h3>
                  <p className="text-[10px] text-yellow-600 font-bold">На стадии обработки/замера</p>
                </div>
                <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center border border-yellow-100 shadow-sm shrink-0">
                  <Tag className="w-6 h-6" />
                </div>
              </div>
            </div>



            {/* Funnel Progress & Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Funnel chart (Visual CRM progress) */}
              <div className="lg:col-span-1 bg-white border border-neutral-200/80 p-6 rounded-3xl space-y-6 shadow-sm">
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-3">Воронка продаж (CRM)</h3>
                
                <div className="space-y-4 text-xs font-semibold">
                  {(() => {
                    const statuses = [
                      { key: 'NEW', label: 'Новые лиды', color: 'bg-blue-500' },
                      { key: 'PROCESSING', label: 'В обработке', color: 'bg-yellow-500' },
                      { key: 'MEASURING', label: 'Замер назначен', color: 'bg-orange-500' },
                      { key: 'PROJECT_READY', label: 'Проект готов', color: 'bg-purple-500' },
                      { key: 'SIGNED', label: 'Договор подписан', color: 'bg-green-500' },
                      { key: 'CANCELLED', label: 'Отказ', color: 'bg-red-500' }
                    ];

                    return statuses.map(s => {
                      const count = leads.filter(l => l.status === s.key || (s.key === 'NEW' && !l.status)).length;
                      const percent = leads.length > 0 ? (count / leads.length * 100).toFixed(0) : 0;
                      return (
                        <div key={s.key} className="space-y-1.5">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="text-neutral-600 font-bold">{s.label}</span>
                            <span className="text-neutral-900 font-black">{count} ({percent}%)</span>
                          </div>
                          <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/30">
                            <div className={`h-full ${s.color} transition-all duration-500`} style={{ width: `${percent}%` }} />
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Right Side: Lead demographics / Cities & Kitchen Shapes */}
              <div className="lg:col-span-2 bg-white border border-neutral-200/80 p-6 rounded-3xl space-y-6 shadow-sm">
                <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-3">Распределение запросов</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs font-semibold">
                  
                  {/* Cities Distribution */}
                  <div className="space-y-4">
                    <span className="text-[10px] text-neutral-450 uppercase font-black tracking-wider block">Регион / Город</span>
                    <div className="space-y-3">
                      {(() => {
                        const cities = {};
                        leads.forEach(l => {
                          const c = l.city || 'Не указан';
                          cities[c] = (cities[c] || 0) + 1;
                        });
                        return Object.entries(cities).sort((a,b) => b[1] - a[1]).slice(0, 4).map(([name, count]) => {
                          const percent = leads.length > 0 ? (count / leads.length * 100).toFixed(0) : 0;
                          return (
                            <div key={name} className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                              <span className="text-neutral-600">{name}</span>
                              <span className="text-neutral-900 font-bold">{count} ({percent}%)</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Kitchen Type Distribution */}
                  <div className="space-y-4">
                    <span className="text-[10px] text-neutral-450 uppercase font-black tracking-wider block">Тип планировки</span>
                    <div className="space-y-3">
                      {(() => {
                        const shapes = {};
                        leads.forEach(l => {
                          const s = l.kitchenType || 'Не указан';
                          shapes[s] = (shapes[s] || 0) + 1;
                        });
                        return Object.entries(shapes).sort((a,b) => b[1] - a[1]).slice(0, 4).map(([name, count]) => {
                          const percent = leads.length > 0 ? (count / leads.length * 100).toFixed(0) : 0;
                          return (
                            <div key={name} className="flex items-center justify-between border-b border-neutral-100 pb-1.5">
                              <span className="text-neutral-600">{name}</span>
                              <span className="text-neutral-900 font-bold">{count} ({percent}%)</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                </div>
              </div>

            </div>



            {/* Audit Logs Section */}
            <div className="bg-white border border-neutral-200/80 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-sm font-black text-neutral-900 uppercase tracking-wider border-b border-neutral-100 pb-3 flex items-center space-x-2">
                <ListOrdered className="w-5 h-5 text-red-500" />
                <span>Журнал действий сотрудников (Аудит)</span>
              </h3>
              
              {logs.length === 0 ? (
                <p className="text-neutral-400 text-xs italic text-center py-6">
                  Действий пока не зарегистрировано. Все действия (например, удаления заявок сотрудниками) появятся здесь.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold">
                    <thead>
                      <tr className="border-b border-neutral-200 text-neutral-450 text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4">Время</th>
                        <th className="py-3 px-4">Сотрудник</th>
                        <th className="py-3 px-4">Действие</th>
                        <th className="py-3 px-4">Детали операции</th>
                        <th className="py-3 px-4">IP-адрес</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.slice(0, 15).map(log => {
                        const isDelete = log.action.toLowerCase().includes('delete');
                        return (
                          <tr key={log.id} className="border-b border-neutral-100 text-neutral-700 hover:bg-neutral-50/50 transition-colors">
                            <td className="py-3 px-4 text-[10px] text-neutral-450 whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString('ru-RU')}
                            </td>
                            <td className="py-3 px-4 font-bold text-neutral-900">
                              {log.user}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                isDelete 
                                  ? 'bg-red-50 text-red-600 border-red-200/50' 
                                  : 'bg-blue-50 text-blue-600 border-blue-200/50'
                              }`}>
                                {getActionLabel(log.action)}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-medium text-neutral-600">
                              {formatLogDetails(log.action, log.details)}
                            </td>
                            <td className="py-3 px-4 text-[10px] text-neutral-450 font-mono">
                              {log.ip || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Form Column */}
          <div className="lg:col-span-1 bg-white border border-neutral-200/80 p-6 rounded-2xl h-fit space-y-6 shadow-sm">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
                <PlusCircle className="w-5 h-5 text-red-500" />
                <span>
                  {activeTab === 'products'
                    ? (editingProductId ? 'Редактировать кухню' : 'Добавить новую кухню')
                    : activeTab === 'promos'
                      ? 'Добавить новую акцию'
                      : activeTab === 'reviews'
                        ? 'Добавить новый отзыв'
                        : 'Детали выбранной заявки'}
                </span>
              </h2>
              {editingProductId && (
                <button 
                  onClick={resetProductForm}
                  className="text-neutral-500 hover:text-neutral-950 text-[10px] uppercase font-bold tracking-wider"
                >
                  Отмена
                </button>
              )}
            </div>

            {/* PRODUCT FORM */}
            {activeTab === 'products' && (
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Название кухни</label>
                  <input
                    type="text" required
                    value={productForm.title}
                    onChange={(e) => setProductForm({...productForm, title: e.target.value})}
                    placeholder="Кухня Арт. ЦМ - 008"
                    className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 focus:border-red-600 focus:outline-none rounded-xl px-4 h-[42px] text-xs text-neutral-900 placeholder-neutral-400 mt-1 transition-all shadow-sm"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Артикул / Slug</label>
                    <input
                      type="text" required
                      value={productForm.slug}
                      onChange={(e) => setProductForm({...productForm, slug: e.target.value})}
                      placeholder="art-cm-008"
                      className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 focus:border-red-600 focus:outline-none rounded-xl px-4 h-[42px] text-xs text-neutral-900 placeholder-neutral-400 mt-1 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Цена (от), ₽</label>
                    <input
                      type="number" required
                      value={productForm.price}
                      onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                      placeholder="185000"
                      className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 focus:border-red-600 focus:outline-none rounded-xl px-4 h-[42px] text-xs text-neutral-900 placeholder-neutral-400 mt-1 transition-all shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center h-4">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Форма</label>
                    </div>
                    <AdminSingleSelect 
                      options={['угловая', 'П-образная', 'прямая', 'с островом']}
                      selected={productForm.shape}
                      onChange={(val) => setProductForm({...productForm, shape: val})}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center h-4">
                      <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Фасады</label>
                      <button
                        type="button"
                        onClick={addCustomFacade}
                        className="text-red-500 hover:text-red-400 text-[9px] font-black uppercase tracking-wider transition-colors"
                      >
                        + Своё
                      </button>
                    </div>
                    <AdminMultiSelect 
                      options={facadeOptions}
                      selected={selectedAdminFacades}
                      onChange={setSelectedAdminFacades}
                    />
                  </div>
                </div>

                {/* MULTI SELECTS FOR HARDWARE AND COUNTERTOPS IN ADMIN */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <div className="flex justify-between items-center h-4">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Фурнитура</span>
                      <button
                        type="button"
                        onClick={addCustomHardware}
                        className="text-red-500 hover:text-red-400 text-[9px] font-black uppercase tracking-wider transition-colors"
                      >
                        + Своё
                      </button>
                    </div>
                    <AdminMultiSelect 
                      options={hardwareOptions}
                      selected={selectedAdminHardwares}
                      onChange={setSelectedAdminHardwares}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center h-4">
                      <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Столешницы</span>
                      <button
                        type="button"
                        onClick={addCustomCountertop}
                        className="text-red-500 hover:text-red-400 text-[9px] font-black uppercase tracking-wider transition-colors"
                      >
                        + Своё
                      </button>
                    </div>
                    <AdminMultiSelect 
                      options={countertopOptions}
                      selected={selectedAdminCountertops}
                      onChange={setSelectedAdminCountertops}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <div className="flex items-center h-4">
                      <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Ширина (мм)</label>
                    </div>
                    <input
                      type="number"
                      value={productForm.width}
                      onChange={(e) => setProductForm({...productForm, width: e.target.value})}
                      placeholder="3600"
                      className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 focus:border-red-600 focus:outline-none rounded-xl px-4 h-[42px] text-xs text-neutral-900 placeholder-neutral-400 mt-1 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center h-4">
                      <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Высота (мм)</label>
                    </div>
                    <input
                      type="number"
                      value={productForm.height}
                      onChange={(e) => setProductForm({...productForm, height: e.target.value})}
                      placeholder="2500"
                      className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 focus:border-red-600 focus:outline-none rounded-xl px-4 h-[42px] text-xs text-neutral-900 placeholder-neutral-400 mt-1 transition-all shadow-sm"
                    />
                  </div>
                  <div>
                    <div className="flex items-center h-4">
                      <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Глубина (мм)</label>
                    </div>
                    <input
                      type="number"
                      value={productForm.depth}
                      onChange={(e) => setProductForm({...productForm, depth: e.target.value})}
                      placeholder="600"
                      className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 focus:border-red-600 focus:outline-none rounded-xl px-4 h-[42px] text-xs text-neutral-900 placeholder-neutral-400 mt-1 transition-all shadow-sm"
                    />
                  </div>
                </div>

                {/* IMAGE UPLOAD & SELECTION SYSTEM */}
                <div className="space-y-2 border-t border-b border-neutral-200 py-4 my-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>Фотографии товара</span>
                  </span>

                  {/* Drag-n-Drop File Selector Card */}
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-neutral-200 hover:border-red-600/40 rounded-xl py-6 cursor-pointer bg-neutral-50/40 transition-colors">
                    <Upload className="w-5 h-5 text-neutral-400 mb-1.5" />
                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      {uploading ? 'Загрузка...' : 'Загрузить фото'}
                    </span>
                    <span className="text-[9px] text-neutral-400 mt-1">Поддерживается мультизагрузка</span>
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden" 
                    />
                  </label>

                  {/* Uploaded Images List with Cover Selection */}
                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-3">
                      {uploadedImages.map((img, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-neutral-200 bg-neutral-50">
                          <img src={img} alt="Загружено" className="w-full h-full object-cover" />
                          
                          {/* Top left overlay tools */}
                          <div className="absolute top-1 left-1 flex space-x-1">
                            <button
                              type="button"
                              onClick={() => makeImageCover(idx)}
                              title={idx === 0 ? "Титульное фото" : "Сделать титульным"}
                              className={`p-1 rounded-md shadow transition-colors ${
                                idx === 0 ? 'bg-red-600 text-white' : 'bg-black/60 hover:bg-black/80 text-yellow-500'
                              }`}
                            >
                              <Star className="w-2.5 h-2.5 fill-current" />
                            </button>
                          </div>

                          {/* Delete overlay tool */}
                          <button
                            type="button"
                            onClick={() => deleteImage(idx)}
                            className="absolute top-1 right-1 p-1 rounded-md bg-black/60 hover:bg-red-600 text-neutral-300 hover:text-white shadow transition-colors"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>

                          {/* Cover badge label */}
                          {idx === 0 && (
                            <div className="absolute bottom-0 inset-x-0 bg-red-600/90 text-white text-[8px] uppercase font-black text-center py-0.5 tracking-wider">
                              Титульная
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Описание</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    placeholder="Описание кухни и характеристик..."
                    rows={3}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 resize-none mt-1 focus:border-red-600 focus:outline-none shadow-sm"
                  />
                </div>
                
                {/* SEO Fields */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-3">
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>SEO настройки (Мета-теги)</span>
                  </span>
                  <div>
                    <label className="text-[9px] uppercase font-semibold text-neutral-500">SEO Title</label>
                    <input
                      type="text"
                      value={productForm.seo_title}
                      onChange={(e) => setProductForm({...productForm, seo_title: e.target.value})}
                      placeholder="Купить угловую кухню Арт..."
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 mt-0.5 focus:border-red-600 focus:outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-semibold text-neutral-500">SEO Description</label>
                    <textarea
                      value={productForm.seo_description}
                      onChange={(e) => setProductForm({...productForm, seo_description: e.target.value})}
                      placeholder="Заказать эксклюзивную кухню по индивидуальному проекту..."
                      rows={2}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 resize-none mt-0.5 focus:border-red-600 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                {/* Show on Homepage Toggle Checkbox */}
                <div className="flex items-center space-x-3 bg-neutral-50 p-3.5 rounded-xl border border-neutral-200">
                  <input
                    type="checkbox"
                    id="showOnMain"
                    checked={productForm.showOnMain}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      if (isChecked) {
                        const featuredCount = products.filter(p => p.showOnMain && p.id !== editingProductId).length;
                        if (featuredCount >= 9) {
                          alert('Превышен лимит! Вы можете выбрать не более 9 кухонь для отображения на главной странице.');
                          return;
                        }
                      }
                      setProductForm({...productForm, showOnMain: isChecked});
                    }}
                    className="w-4 h-4 rounded border-neutral-300 bg-white text-red-600 focus:ring-red-600 focus:ring-offset-white focus:ring-2 cursor-pointer transition-colors"
                  />
                  <label htmlFor="showOnMain" className="text-xs text-neutral-700 font-semibold cursor-pointer select-none">
                    Отображать на главной странице (до 9 шт.)
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-neutral-200 disabled:text-neutral-400 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  {editingProductId ? 'Сохранить изменения' : 'Добавить товар'}
                </button>
              </form>
            )}

            {/* PROMO FORM */}
            {activeTab === 'promos' && (
              <form onSubmit={handlePromoSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Название акции</label>
                  <input
                    type="text" required
                    value={promoForm.title}
                    onChange={(e) => setPromoForm({...promoForm, title: e.target.value})}
                    placeholder="Скидка новоселам"
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 mt-1 focus:border-red-600 focus:outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Размер скидки</label>
                  <input
                    type="text" required
                    value={promoForm.discount}
                    onChange={(e) => setPromoForm({...promoForm, discount: e.target.value})}
                    placeholder="15%"
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 mt-1 focus:border-red-600 focus:outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Описание спецпредложения</label>
                  <textarea
                    value={promoForm.description}
                    onChange={(e) => setPromoForm({...promoForm, description: e.target.value})}
                    placeholder="Детальное описание условий акции..."
                    rows={3}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 resize-none mt-1 focus:border-red-600 focus:outline-none shadow-sm"
                  />
                </div>

                {/* SEO Fields */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-3">
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>SEO настройки (Мета-теги)</span>
                  </span>
                  <div>
                    <label className="text-[9px] uppercase font-semibold text-neutral-500">SEO Title</label>
                    <input
                      type="text"
                      value={promoForm.seo_title}
                      onChange={(e) => setPromoForm({...promoForm, seo_title: e.target.value})}
                      placeholder="Акция: Скидка 15% на мебель..."
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 mt-0.5 focus:border-red-600 focus:outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-semibold text-neutral-500">SEO Description</label>
                    <textarea
                      value={promoForm.seo_description}
                      onChange={(e) => setPromoForm({...promoForm, seo_description: e.target.value})}
                      placeholder="Получите гарантированную скидку на кухонную мебель..."
                      rows={2}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 resize-none mt-0.5 focus:border-red-600 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  Добавить акцию
                </button>
              </form>
            )}

            {/* REVIEW FORM */}
            {activeTab === 'reviews' && (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Имя автора</label>
                    <input
                      type="text" required
                      value={reviewForm.author}
                      onChange={(e) => setReviewForm({...reviewForm, author: e.target.value})}
                      placeholder="Елена"
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 mt-1 focus:border-red-600 focus:outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Оценка (1-5)</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({...reviewForm, rating: e.target.value})}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 mt-1 focus:border-red-600 focus:outline-none shadow-sm"
                    >
                      <option value="5">5 звезд</option>
                      <option value="4">4 звезды</option>
                      <option value="3">3 звезды</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Заголовок отзыва</label>
                  <input
                    type="text"
                    value={reviewForm.title}
                    onChange={(e) => setReviewForm({...reviewForm, title: e.target.value})}
                    placeholder="Спасибо Цветков Мебель!"
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 mt-1 focus:border-red-600 focus:outline-none shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Текст отзыва</label>
                  <textarea
                    required
                    value={reviewForm.text}
                    onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                    placeholder="Напишите полный отзыв клиента о кухне..."
                    rows={3}
                    className="w-full bg-white border border-neutral-200 rounded-lg px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 resize-none mt-1 focus:border-red-600 focus:outline-none shadow-sm"
                  />
                </div>

                {/* Photo Upload Field */}
                <div className="space-y-2 border-t border-neutral-200 pt-4 my-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>Фото к отзыву (Опционально)</span>
                  </span>

                  <div className="flex items-center space-x-3">
                    <label className="flex flex-col items-center justify-center border border-dashed border-neutral-300 hover:border-red-600/40 rounded-xl py-3 px-4 cursor-pointer bg-neutral-50/40 transition-colors flex-1 text-center">
                      <Upload className="w-4 h-4 text-neutral-400 mb-1" />
                      <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                        {reviewImageUploading ? 'Загрузка...' : 'Загрузить фото'}
                      </span>
                      <input 
                        type="file" 
                        accept="image/*"
                        multiple
                        onChange={handleReviewImageUpload}
                        disabled={reviewImageUploading}
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {reviewForm.imageUrl && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {reviewForm.imageUrl.split(',').filter(Boolean).map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img src={url} alt={`review-photo-${idx}`} className="w-16 h-16 object-cover rounded-lg border border-neutral-200" />
                          <button
                            type="button"
                            onClick={() => deleteReviewImage(idx)}
                            className="absolute -top-1.5 -right-1.5 bg-white border border-neutral-200 rounded-full p-0.5 text-neutral-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Upload Field */}
                <div className="space-y-2 border-t border-neutral-200 pt-4 my-2">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider flex items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-red-500" />
                    <span>Видеоотзыв клиента (Опционально)</span>
                  </span>

                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <label className="flex flex-col items-center justify-center border border-dashed border-neutral-300 hover:border-red-600/40 rounded-xl py-3 px-4 cursor-pointer bg-neutral-50/40 transition-colors flex-1 text-center">
                        <Upload className="w-4 h-4 text-neutral-400 mb-1" />
                        <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                          {videoUploading ? 'Загрузка...' : 'Загрузить видео файл'}
                        </span>
                        <input 
                          type="file" 
                          accept="video/*"
                          onChange={handleVideoUpload}
                          disabled={videoUploading}
                          className="hidden" 
                        />
                      </label>

                      {reviewForm.videoUrl && (
                        <div className="flex items-center space-x-2 bg-white border border-neutral-200 p-2 rounded-xl shadow-sm relative">
                          {/rutube\.ru/i.test(reviewForm.videoUrl) ? (
                            <div className="w-16 h-10 bg-neutral-900 text-[8px] text-white flex items-center justify-center rounded-lg font-bold text-center p-1">
                              RuTube
                            </div>
                          ) : (
                            <video src={reviewForm.videoUrl} className="w-16 h-10 object-cover rounded-lg" />
                          )}
                          <button
                            type="button"
                            onClick={() => setReviewForm(prev => ({ ...prev, videoUrl: '' }))}
                            className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-red-600 transition-colors"
                            title="Удалить видео"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider">Или вставьте ссылку на RuTube видео</label>
                      <input
                        type="text"
                        value={reviewForm.videoUrl}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, videoUrl: e.target.value }))}
                        placeholder="https://rutube.ru/video/..."
                        className="w-full bg-white hover:bg-neutral-50 border border-neutral-200 focus:border-red-600 focus:outline-none rounded-xl px-3 h-[36px] text-xs text-neutral-900 placeholder-neutral-400 mt-1 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* SEO Fields */}
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-3">
                  <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest flex items-center space-x-1">
                    <Sparkles className="w-3 h-3" />
                    <span>SEO настройки (Мета-теги)</span>
                  </span>
                  <div>
                    <label className="text-[9px] uppercase font-semibold text-neutral-500">SEO Title</label>
                    <input
                      type="text"
                      value={reviewForm.seo_title}
                      onChange={(e) => setReviewForm({...reviewForm, seo_title: e.target.value})}
                      placeholder="Отзыв Елены о покупке мебели..."
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 mt-0.5 focus:border-red-600 focus:outline-none shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] uppercase font-semibold text-neutral-500">SEO Description</label>
                    <textarea
                      value={reviewForm.seo_description}
                      onChange={(e) => setReviewForm({...reviewForm, seo_description: e.target.value})}
                      placeholder="Читать отзыв заказчика Елены о дизайне кухни..."
                      rows={2}
                      className="w-full bg-white border border-neutral-200 rounded-lg px-2.5 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 resize-none mt-0.5 focus:border-red-600 focus:outline-none shadow-sm"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                >
                  Добавить отзыв
                </button>
              </form>
            )}

            {/* LEADS DETAIL VIEW */}
            {activeTab === 'leads' && (
              <div className="space-y-4">
                {selectedLead ? (
                  <div className="space-y-4 text-xs">
                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/60 space-y-3">
                      <div>
                        <span className="text-[10px] text-neutral-450 uppercase font-bold tracking-wider">Клиент</span>
                        <h4 className="text-sm font-black text-neutral-900 mt-0.5">{selectedLead.name}</h4>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-450 uppercase font-bold tracking-wider">Телефон</span>
                        <p className="font-bold text-neutral-800 mt-0.5">
                          <a href={`tel:${selectedLead.phone}`} className="hover:text-red-650 transition-colors">
                            {selectedLead.phone}
                          </a>
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-450 uppercase font-bold tracking-wider">Дата заявки</span>
                        <p className="text-neutral-600 mt-0.5">{new Date(selectedLead.createdAt).toLocaleString('ru-RU')}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/60 space-y-3">
                      <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest block">Ответы конфигуратора</span>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-neutral-450 uppercase font-bold">Тип кухни</span>
                          <p className="font-semibold text-neutral-800 mt-0.5">{selectedLead.kitchenType || '—'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-450 uppercase font-bold">Сроки установки</span>
                          <p className="font-semibold text-neutral-800 mt-0.5">{selectedLead.installTime || '—'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-450 uppercase font-bold">Длина кухни</span>
                          <p className="font-semibold text-neutral-800 mt-0.5">{selectedLead.kitchenLength || '—'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-neutral-450 uppercase font-bold">Бюджет</span>
                          <p className="font-semibold text-neutral-800 mt-0.5">{selectedLead.budget || '—'}</p>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[9px] text-neutral-450 uppercase font-bold">Город доставки</span>
                          <p className="font-semibold text-neutral-800 mt-0.5">{selectedLead.city || '—'}</p>
                        </div>
                      </div>
                    </div>

                    {selectedLead.projectFile && (
                      <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/60 space-y-2">
                        <span className="text-[10px] text-neutral-450 uppercase font-bold tracking-wider block">Прикрепленный файл проекта</span>
                        <a 
                          href={selectedLead.projectFile} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-red-650 text-white font-bold py-2.5 px-4 rounded-xl text-[10px] uppercase tracking-wider transition-colors shadow-sm"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Открыть файл</span>
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-neutral-500 text-xs italic text-center py-12">
                    Выберите заявку из списка справа для просмотра деталей
                  </p>
                )}
              </div>
            )}
          </div>

          {/* List Column */}
          <div className="lg:col-span-2 bg-white border border-neutral-200/80 p-6 rounded-2xl h-fit space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-neutral-900 flex items-center space-x-2">
              <Settings className="w-5 h-5 text-red-500" />
              <span>Список существующих записей</span>
            </h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                
                {/* PRODUCTS LIST */}
                {activeTab === 'products' && products.map(p => {
                  const images = p.imageUrl ? p.imageUrl.split(',').filter(Boolean) : [];
                  const coverImage = images[0] || '/images/kitchen-default.jpg';
                  return (
                    <div key={p.id} className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-xl flex justify-between items-center text-xs gap-4">
                      <div className="flex items-center space-x-3 max-w-[70%]">
                        {/* Cover thumbnail representation */}
                        <div className="w-14 h-11 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 flex-shrink-0">
                          <img src={coverImage} alt={p.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-bold text-neutral-900 text-sm">{p.title}</span>
                            <span className="bg-neutral-200/60 px-2 py-0.5 rounded text-[9px] text-neutral-600 font-bold">{p.frontType}</span>
                            <span className="bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded text-[9px] text-neutral-500 font-mono">
                              Фото: {images.length}
                            </span>
                            {p.showOnMain && (
                              <span className="bg-yellow-50 border border-yellow-200/80 text-yellow-600 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider flex items-center space-x-1">
                                <span>На главной</span>
                              </span>
                            )}
                          </div>
                          <p className="text-neutral-500 line-clamp-1">{p.description}</p>
                          <div className="text-[10px] text-red-500 font-semibold flex items-center space-x-1">
                            <span className="text-neutral-600">SEO:</span>
                            <span className="truncate max-w-[200px]">{p.seo_title || 'Не задано'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4 shrink-0">
                        <div className="text-right">
                          <span className="font-bold text-neutral-900 block">{p.price.toLocaleString('ru-RU')} ₽</span>
                          <span className="text-[10px] text-neutral-500">{p.shape}</span>
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleToggleShowOnMain(p)}
                            className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                              p.showOnMain 
                                ? 'bg-yellow-50 border-yellow-200 text-yellow-600 hover:bg-yellow-100' 
                                : 'bg-white border-neutral-200 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50'
                            }`}
                            title={p.showOnMain ? "Убрать с главной" : "Показать на главной"}
                          >
                            <Star className={`w-3.5 h-3.5 ${p.showOnMain ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            onClick={() => handleEditProductClick(p)}
                            className="p-2 rounded-lg bg-white hover:bg-neutral-50 text-neutral-500 hover:text-neutral-800 border border-neutral-200 shadow-sm cursor-pointer"
                            title="Редактировать"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 rounded-lg bg-white hover:bg-red-50 text-neutral-400 hover:text-red-600 border border-neutral-200 hover:border-red-200/60 shadow-sm cursor-pointer"
                            title="Удалить"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* PROMOS LIST */}
                {activeTab === 'promos' && promos.map(p => (
                  <div key={p.id} className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-xl flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="bg-red-50 border border-red-200/80 text-red-600 px-2 py-0.5 rounded font-black">{p.discount}</span>
                        <span className="font-bold text-neutral-900 text-sm">{p.title}</span>
                      </div>
                      <p className="text-neutral-500 line-clamp-1">{p.description}</p>
                      <div className="text-[10px] text-red-500 font-semibold flex items-center space-x-1">
                        <span className="text-neutral-600">SEO:</span>
                        <span>{p.seo_title || 'Не задано'}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* REVIEWS LIST */}
                {activeTab === 'reviews' && reviews.map(r => (
                  <div key={r.id} className="p-4 bg-neutral-50 border border-neutral-200/80 rounded-xl flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-neutral-900 text-sm">{r.title || 'Отзыв'}</span>
                        <span className="text-red-500">{'★'.repeat(r.rating)}</span>
                      </div>
                      <p className="text-neutral-500 line-clamp-1 italic">&quot;{r.text}&quot;</p>
                      <span className="text-[10px] text-neutral-400 block">Автор: {r.author}</span>
                      <div className="text-[10px] text-red-500 font-semibold flex items-center space-x-1">
                        <span className="text-neutral-600">SEO:</span>
                        <span>{r.seo_title || 'Не задано'}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* LEADS LIST */}
                {activeTab === 'leads' && leads.map(l => (
                  <div 
                    key={l.id} 
                    onClick={() => setSelectedLead(l)}
                    className={`p-4 border rounded-xl flex justify-between items-center text-xs cursor-pointer transition-all ${
                      selectedLead?.id === l.id 
                        ? 'border-red-500 bg-red-50/10' 
                        : 'border-neutral-200/80 bg-neutral-50 hover:bg-neutral-100/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-neutral-900 text-sm">{l.name}</span>
                        <span className="text-neutral-400">|</span>
                        <span className="text-neutral-600 font-medium">{l.phone}</span>
                      </div>
                      <p className="text-neutral-500">
                        {l.kitchenType || 'Тип не указан'} • {l.budget || 'Бюджет не указан'} • {l.city || 'Город не указан'}
                      </p>
                      <span className="text-[10px] text-neutral-400 block">
                        {new Date(l.createdAt).toLocaleString('ru-RU')}
                      </span>
                    </div>
                    {(currentUser?.role === 'admin' || permissions?.canDeleteLeads) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteLead(l.id);
                        }}
                        className="p-2 rounded-lg bg-white hover:bg-red-50 text-neutral-400 hover:text-red-600 border border-neutral-200 hover:border-red-200/60 shadow-sm cursor-pointer shrink-0"
                        title="Удалить заявку"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}

              </div>
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
