'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { userService, UserProfile } from '../services/user';
import { novelService } from '../services/novel';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  User,
  Heart,
  BookOpen,
  Eye,
  Calendar,
  Settings,
  LogOut,
  Edit3,
  Camera,
  ChevronRight,
  Bookmark,
  Clock,
  TrendingUp,
  Award,
  Star,
  Grid,
  List,
  RefreshCw,
  Shield,
  UserCheck,
  FileText,
  UserPlus
} from 'lucide-react';
import toast from 'react-hot-toast';

// صورة الخلفية
import backgroundImage from '../assets/adaptive-icon.png';

// مكون تحميل Skeleton
const SkeletonRow = () => (
  <div className="animate-pulse bg-white/5 rounded-xl p-4">
    <div className="flex justify-between items-center">
      <div className="w-12 h-12 bg-white/10 rounded-xl" />
      <div className="flex-1 mr-4">
        <div className="h-4 bg-white/10 rounded w-1/3 mb-2" />
        <div className="h-3 bg-white/10 rounded w-1/4" />
      </div>
    </div>
  </div>
);

const GridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className="animate-pulse">
        <div className="aspect-[2/3] bg-white/10 rounded-xl" />
        <div className="h-3 bg-white/10 rounded w-3/4 mt-2" />
        <div className="h-2 bg-white/10 rounded w-1/2 mt-1" />
      </div>
    ))}
  </div>
);

// مكون بطاقة العمل (Grid)
const WorkCard = ({ work, onClick }: { work: any; onClick: () => void }) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -4 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    onClick={onClick}
    className="cursor-pointer group"
  >
    <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="aspect-[2/3]">
        <img
          src={work.cover}
          alt={work.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex justify-between items-center text-white text-xs">
          <span>{work.chaptersCount} فصل</span>
          <span>{work.views} مشاهدة</span>
        </div>
      </div>
    </div>
    <h3 className="text-sm font-semibold text-white mt-2 line-clamp-2 group-hover:text-primary transition-colors">
      {work.title}
    </h3>
  </motion.div>
);

// مكون بطاقة المفضلة (Grid)
const FavoriteCard = ({ item, onClick }: { item: any; onClick: () => void }) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -4 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    onClick={onClick}
    className="cursor-pointer group"
  >
    <div className="relative overflow-hidden rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
      <div className="aspect-[2/3]">
        <img
          src={item.cover}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <div className="absolute top-2 left-2">
        <div className="bg-black/50 backdrop-blur-sm rounded-full p-1">
          <Heart size={12} className="fill-red-500 text-red-500" />
        </div>
      </div>
    </div>
    <h3 className="text-sm font-semibold text-white mt-2 line-clamp-2 group-hover:text-primary transition-colors">
      {item.title}
    </h3>
  </motion.div>
);

// مكون بطاقة التاريخ (List)
const HistoryCard = ({ item, onClick }: { item: any; onClick: () => void }) => (
  <motion.div
    whileHover={{ scale: 1.01, x: -4 }}
    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    onClick={onClick}
    className="flex flex-row-reverse gap-4 bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer"
  >
    <div className="w-20 h-24 rounded-lg overflow-hidden shrink-0">
      <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
    </div>
    <div className="flex-1 text-right">
      <h3 className="text-white font-bold text-base line-clamp-1">{item.title}</h3>
      <p className="text-primary text-sm mt-1 line-clamp-1">
        {item.lastChapterTitle ? `الفصل ${item.lastChapterId}: ${item.lastChapterTitle}` : `الفصل ${item.lastChapterId}`}
      </p>
      <div className="mt-2">
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
            style={{ width: `${item.progress || 0}%` }}
          />
        </div>
        <p className="text-xs text-white/40 mt-1">{item.progress || 0}% مكتمل</p>
      </div>
    </div>
  </motion.div>
);

// 🔥 مكون الإحصاءات المعدل (تصميم جديد)
const DataRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.3 }}
    className="flex items-center justify-between py-4 border-b border-white/10 last:border-0"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5">
        <Icon size={16} className="text-white" />
      </div>
      <div className="text-right">
        <p className="text-white/60 text-sm">{label}</p>
        <p className="text-white font-medium text-base">{value}</p>
      </div>
    </div>
  </motion.div>
);

export default function MyPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userInfo, isAuthenticated, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'data' | 'works' | 'favorites' | 'history'>('data');
  const [worksPage, setWorksPage] = useState(1);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreWorks, setHasMoreWorks] = useState(true);
  const [hasMoreFavorites, setHasMoreFavorites] = useState(true);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', bio: '' });
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll({ container: scrollContainerRef });
  const headerOpacity = useTransform(scrollY, [0, 100], [1, 0.8]);
  const headerBlur = useTransform(scrollY, [0, 100], [0, 8]);

  const isProfileAdmin = userInfo?.role === 'admin';
  const isProfileContributor = userInfo?.role === 'contributor' || isProfileAdmin;
  const isSelf = true;

  // 🔥 استخدم React Query مع staleTime طويل لتجنب إعادة الطلب
  const {
    data: statsData,
    isLoading: statsLoading,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ['userStats'],
    queryFn: () => userService.getUserStats(undefined, 1, 20),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 دقائق
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const {
    data: favoritesData,
    isLoading: favoritesLoading,
  } = useQuery({
    queryKey: ['userFavorites', favoritesPage],
    queryFn: () => novelService.getUserLibrary(undefined, 'favorites', favoritesPage, 20),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const {
    data: historyData,
    isLoading: historyLoading,
  } = useQuery({
    queryKey: ['userHistory', historyPage],
    queryFn: () => novelService.getUserLibrary(undefined, 'history', historyPage, 20),
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const profileUser = statsData?.user || null;
  const myWorks = statsData?.myWorks || [];
  const stats = {
    readChapters: statsData?.readChapters || 0,
    addedChapters: statsData?.addedChapters || 0,
    totalViews: statsData?.totalViews || 0,
    joinDate: profileUser?.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('ar-EG') : 'غير معروف',
  };
  const favorites = favoritesData || [];
  const history = historyData || [];

  // تحديث editForm عند تحميل البيانات
  useEffect(() => {
    if (profileUser) {
      setEditForm({
        name: profileUser.name,
        email: profileUser.email,
        bio: profileUser.bio || '',
      });
    }
  }, [profileUser]);

  // تحميل المزيد للـ works (باستخدام نفس الاستعلام)
  const loadMoreWorks = useCallback(async () => {
    if (loadingMore || !hasMoreWorks) return;
    setLoadingMore(true);
    try {
      const nextPage = worksPage + 1;
      const res = await userService.getUserStats(undefined, nextPage, 20);
      const newWorks = res.myWorks || [];
      if (newWorks.length > 0) {
        // تحديث الكاش يدويًا
        queryClient.setQueryData(['userStats'], (old: any) => ({
          ...old,
          myWorks: [...(old?.myWorks || []), ...newWorks],
        }));
        setWorksPage(nextPage);
        setHasMoreWorks(newWorks.length === 20);
      } else {
        setHasMoreWorks(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [worksPage, hasMoreWorks, loadingMore, queryClient]);

  // تحميل المزيد للمفضلة
  const loadMoreFavorites = useCallback(async () => {
    if (loadingMore || !hasMoreFavorites) return;
    setLoadingMore(true);
    try {
      const nextPage = favoritesPage + 1;
      const res = await novelService.getUserLibrary(undefined, 'favorites', nextPage, 20);
      if (res.length > 0) {
        queryClient.setQueryData(['userFavorites', nextPage], res);
        setFavoritesPage(nextPage);
        setHasMoreFavorites(res.length === 20);
      } else {
        setHasMoreFavorites(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [favoritesPage, hasMoreFavorites, loadingMore, queryClient]);

  // تحميل المزيد للسجل
  const loadMoreHistory = useCallback(async () => {
    if (loadingMore || !hasMoreHistory) return;
    setLoadingMore(true);
    try {
      const nextPage = historyPage + 1;
      const res = await novelService.getUserLibrary(undefined, 'history', nextPage, 20);
      if (res.length > 0) {
        queryClient.setQueryData(['userHistory', nextPage], res);
        setHistoryPage(nextPage);
        setHasMoreHistory(res.length === 20);
      } else {
        setHasMoreHistory(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMore(false);
    }
  }, [historyPage, hasMoreHistory, loadingMore, queryClient]);

  // مراقبة التمرير لتحميل المزيد
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
      const isBottom = scrollHeight - scrollTop - clientHeight < 200;
      if (isBottom && !loadingMore) {
        if (activeTab === 'works' && hasMoreWorks) loadMoreWorks();
        else if (activeTab === 'favorites' && hasMoreFavorites) loadMoreFavorites();
        else if (activeTab === 'history' && hasMoreHistory) loadMoreHistory();
      }
    };
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activeTab, hasMoreWorks, hasMoreFavorites, hasMoreHistory, loadingMore, loadMoreWorks, loadMoreFavorites, loadMoreHistory]);

  const handleUpdateProfile = async () => {
    try {
      const updated = await userService.updateProfile({
        name: editForm.name,
        email: editForm.email,
        bio: editForm.bio,
      });
      // تحديث الكاش يدويًا
      queryClient.setQueryData(['userStats'], (old: any) => ({
        ...old,
        user: updated,
      }));
      setIsEditing(false);
      toast.success('تم تحديث الملف الشخصي');
    } catch (err: any) {
      toast.error(err.message || 'فشل تحديث الملف الشخصي');
    }
  };

  const handleLogout = () => {
    logout();
    queryClient.clear(); // مسح كل الكاش
    router.push('/login');
    toast.success('تم تسجيل الخروج');
  };

  // عرض التبويبات
  const renderTabButton = (id: 'data' | 'works' | 'favorites' | 'history', label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        activeTab === id
          ? 'bg-white/10 text-white border-b-2 border-primary'
          : 'text-white/60 hover:text-white hover:bg-white/5'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  // عرض محتوى التبويب
  const renderContent = () => {
    if (activeTab === 'data') {
      return (
        <motion.div
          key="data"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <h3 className="text-white font-bold text-lg mb-3">النبذة التعريفية</h3>
            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  className="w-full bg-white/10 text-white rounded-lg p-3 border border-white/20 focus:border-primary outline-none"
                  rows={4}
                  placeholder="أضف نبذة عنك..."
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdateProfile} className="bg-primary text-white px-4 py-2 rounded-lg">حفظ</button>
                  <button onClick={() => setIsEditing(false)} className="bg-white/10 text-white px-4 py-2 rounded-lg">إلغاء</button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-white/70 leading-relaxed">
                  {profileUser?.bio || "لا توجد نبذة تعريفية."}
                </p>
                {isSelf && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="mt-3 text-primary text-sm flex items-center gap-1 hover:underline"
                  >
                    <Edit3 size={14} />
                    تعديل النبذة
                  </button>
                )}
              </>
            )}
          </div>

          <div className="bg-white/5 rounded-xl p-5 border border-white/10">
            <h3 className="text-white font-bold text-lg mb-4">الإحصائيات</h3>
            <div className="space-y-0">
              <DataRow
                icon={isProfileAdmin ? Shield : isProfileContributor ? UserCheck : User}
                label="نوع العضوية"
                value={isProfileAdmin ? "مشرف" : isProfileContributor ? "مساهم" : "قارئ"}
              />
              <DataRow icon={BookOpen} label="الفصول المقروءة" value={stats.readChapters} />
              {isProfileContributor && (
                <>
                  <DataRow icon={FileText} label="الفصول المضافة" value={stats.addedChapters} />
                  <DataRow icon={Eye} label="المشاهدات" value={stats.totalViews} />
                </>
              )}
              <DataRow icon={Calendar} label="تاريخ الانضمام" value={stats.joinDate} />
            </div>
          </div>
        </motion.div>
      );
    }

    if (activeTab === 'works') {
      if (statsLoading && myWorks.length === 0) return <GridSkeleton />;
      if (myWorks.length === 0) {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <FileText size={48} className="mx-auto text-white/20" />
            <p className="text-white/40 mt-2">لا توجد أعمال منشورة</p>
          </motion.div>
        );
      }
      return (
        <motion.div
          key="works"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {myWorks.map((work, idx) => (
              <WorkCard key={work._id || idx} work={work} onClick={() => router.push(`/novel/${work._id}`)} />
            ))}
          </div>
          {loadingMore && activeTab === 'works' && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.div>
      );
    }

    if (activeTab === 'favorites') {
      if (favoritesLoading && favorites.length === 0) return <GridSkeleton />;
      if (favorites.length === 0) {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Heart size={48} className="mx-auto text-white/20" />
            <p className="text-white/40 mt-2">لا توجد روايات في المفضلة</p>
          </motion.div>
        );
      }
      return (
        <motion.div
          key="favorites"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {favorites.map((item, idx) => (
              <FavoriteCard key={item.novelId || idx} item={item} onClick={() => router.push(`/novel/${item.novelId}`)} />
            ))}
          </div>
          {loadingMore && activeTab === 'favorites' && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.div>
      );
    }

    if (activeTab === 'history') {
      if (historyLoading && history.length === 0) return <GridSkeleton />;
      if (history.length === 0) {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Clock size={48} className="mx-auto text-white/20" />
            <p className="text-white/40 mt-2">لا يوجد سجل قراءة</p>
          </motion.div>
        );
      }
      return (
        <motion.div
          key="history"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          {history.map((item, idx) => (
            <HistoryCard
              key={item.novelId || idx}
              item={item}
              onClick={() => router.push(`/novel/${item.novelId}/reader/${item.lastChapterId}`)}
            />
          ))}
          {loadingMore && activeTab === 'history' && (
            <div className="flex justify-center py-4">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </motion.div>
      );
    }
  };

  // صفحة غير مسجل دخول
  if (!isAuthenticated) {
    return (
      <>
        <Head>
          <title>قمر الروايات - صفحتي</title>
        </Head>
        <div className="min-h-screen relative overflow-hidden bg-black">
          {/* خلفية زجاجية */}
          <div className="absolute inset-0 z-0">
            <img
              src={backgroundImage}
              alt=""
              className="w-full h-full object-cover opacity-40 blur-sm"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
          </div>

          <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, type: 'spring', damping: 20 }}
              className="w-full max-w-md"
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
                <div className="pt-8 pb-4 text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="w-24 h-24 mx-auto bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg"
                  >
                    <User size={48} className="text-white/60" />
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl font-bold text-white mt-4"
                  >
                    مرحباً بك
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-white/60 text-sm mt-2"
                  >
                    قم بتسجيل الدخول للوصول إلى مكتبتك الشخصية
                  </motion.p>
                </div>

                <div className="p-6 space-y-4">
                  <Link href="/login">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="w-full bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <LogOut size={18} className="rotate-180" />
                      <span>تسجيل الدخول</span>
                    </motion.button>
                  </Link>
                  <Link href="/signup">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                      className="w-full bg-white/5 hover:bg-white/10 border border-white/20 text-white font-medium py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <UserPlus size={18} />
                      <span>إنشاء حساب جديد</span>
                    </motion.button>
                  </Link>
                </div>

                <div className="p-6 pt-0 text-center">
                  <p className="text-white/40 text-xs">
                    انضم إلى آلاف القراء واستمتع بأفضل الروايات
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    );
  }

  // صفحة المستخدم المسجل
  return (
    <>
      <Head>
        <title>قمر الروايات - {profileUser?.name || 'صفحتي'}</title>
      </Head>
      <div className="min-h-screen relative overflow-hidden bg-black">
        {/* خلفية زجاجية */}
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImage}
            alt=""
            className="w-full h-full object-cover opacity-40 blur-sm"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>

        {/* محتوى قابل للتمرير */}
        <div
          ref={scrollContainerRef}
          className="relative z-10 h-screen overflow-y-auto"
        >
          {/* الهيدر المتحرك */}
          <motion.div
            style={{
              opacity: headerOpacity,
              backdropFilter: `blur(${headerBlur}px)`,
            }}
            className="sticky top-0 z-20 bg-black/40 backdrop-blur-md border-b border-white/10"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.back()}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors"
                >
                  <ChevronRight size={20} className="text-white" />
                </button>
                <h1 className="text-white font-bold">ملفي الشخصي</h1>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
              >
                <LogOut size={16} className="text-white/80" />
                <span className="text-white/80 text-sm">خروج</span>
              </button>
            </div>
          </motion.div>

          {/* البطاقة الشخصية */}
          <div className="max-w-7xl mx-auto px-4 pt-6 pb-4">
            <div className="relative">
              {/* صورة الغلاف */}
              <div className="h-40 md:h-48 rounded-2xl overflow-hidden">
                <img
                  src={profileUser?.banner || backgroundImage}
                  alt="Banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
              </div>

              {/* الصورة الشخصية والأسماء */}
              <div className="relative -mt-16 flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-28 h-28 rounded-full border-4 border-black bg-white/10 overflow-hidden"
                >
                  <img
                    src={profileUser?.picture || backgroundImage}
                    alt={profileUser?.name}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-white text-xl font-bold mt-2"
                >
                  {profileUser?.name}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-white/60 text-sm"
                >
                  {isProfileAdmin ? 'مشرف عام' : isProfileContributor ? 'مترجم / مؤلف' : 'قارئ مميز'}
                </motion.p>

                {/* أزرار الإجراءات */}
                <div className="flex gap-3 mt-4">
                  {isProfileContributor && (
                    <button
                      onClick={() => router.push('/admin')}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-all duration-300"
                    >
                      <Grid size={16} />
                      <span className="text-sm">لوحة التحكم</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300"
                  >
                    <Edit3 size={16} className="text-white/80" />
                    <span className="text-white/80 text-sm">تعديل الملف</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* التبويبات */}
          <div className="border-b border-white/10 mb-4">
            <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-1">
              {renderTabButton('data', 'البيانات', <User size={16} />)}
              {isProfileContributor && renderTabButton('works', 'الأعمال', <FileText size={16} />)}
              {renderTabButton('favorites', 'المفضلة', <Heart size={16} />)}
              {renderTabButton('history', 'السجل', <Clock size={16} />)}
            </div>
          </div>

          {/* محتوى التبويب */}
          <div className="max-w-7xl mx-auto px-4 pb-20">
            <AnimatePresence mode="wait">
              {renderContent()}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* مودال تعديل الملف الشخصي */}
      <AnimatePresence>
        {isEditing && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
              onClick={() => setIsEditing(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-md bg-[#1a1a1a] rounded-2xl shadow-2xl border border-white/10 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-white text-xl font-bold mb-4 text-center">تعديل الملف الشخصي</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-white/70 text-sm mb-1">الاسم</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full bg-white/10 text-white rounded-lg p-3 border border-white/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      className="w-full bg-white/10 text-white rounded-lg p-3 border border-white/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-white/70 text-sm mb-1">النبذة</label>
                    <textarea
                      value={editForm.bio}
                      onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                      className="w-full bg-white/10 text-white rounded-lg p-3 border border-white/20 focus:border-primary outline-none"
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleUpdateProfile}
                      className="flex-1 bg-primary text-white py-2 rounded-lg font-medium hover:bg-primary/80 transition-colors"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 bg-white/10 text-white py-2 rounded-lg hover:bg-white/20 transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}