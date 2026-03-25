
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  ActivityIndicator,
  Keyboard,
  StatusBar,
  ImageBackground,
  ScrollView,
  Modal,
  Switch
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import api from '../services/api';
import { useToast } from '../context/ToastContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import CustomAlert from '../components/CustomAlert';

const PYTHON_SERVER_URL = 'https://nadi-production.up.railway.app';

// 🔥 Nadi Rewayat Genres Mapping (From Site HTML)
const NADI_GENRES = [
    { id: 2, name: 'أكشن' },
    { id: 4, name: 'فانتازيا' },
    { id: 6, name: 'مغامرة' },
    { id: 7, name: 'رومانسي' },
    { id: 8, name: 'خيال علمي' },
    { id: 5, name: 'مهارات القتال' },
    { id: 3, name: 'دراما' },
    { id: 10, name: 'قوى خارقة' },
    { id: 13, name: 'رعب' },
    { id: 11, name: 'سحر' },
    { id: 1, name: 'كوميديا' },
    { id: 14, name: 'حريم' },
    { id: 9, name: 'الحياة المدرسية' },
    { id: 12, name: 'رياضة' }
];

const GlassContainer = ({ children, style }) => (
    <View style={[styles.glassContainer, style]}>{children}</View>
);

export default function NadiNovelSelectionScreen({ navigation }) {
  const { showToast } = useToast();
  
  // Local Novels
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  
  // Selection
  const [selectedNovel, setSelectedNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [chaptersLoading, setChaptersLoading] = useState(false);
  
  // Nadi Interaction
  const [nadiSearchQuery, setNadiSearchQuery] = useState('');
  const [nadiResults, setNadiResults] = useState([]);
  const [selectedNadiId, setSelectedNadiId] = useState(null);
  const [selectedNadiTitle, setSelectedNadiTitle] = useState('');
  const [searchingNadi, setSearchingNadi] = useState(false);
  const [isNadiModalVisible, setIsNadiModalVisible] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);

  // Job Config
  const [selectionMode, setSelectionMode] = useState('all'); 
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [rangeInput, setRangeInput] = useState('');
  const [interval, setInterval] = useState('15'); 

  // Create Novel Form
  const [createData, setCreateData] = useState({ titleAr: '', titleEn: '', desc: '', cover: '' });
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [isTranslated, setIsTranslated] = useState(true);
  const [creating, setCreating] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({});

  useEffect(() => { 
      fetchNovels(1); 
  }, []);

  useEffect(() => {
      const delayDebounce = setTimeout(() => {
          fetchNovels(1);
      }, 500);
      return () => clearTimeout(delayDebounce);
  }, [search]);

  const fetchNovels = async (pageNum) => {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);

      try {
          const res = await api.get('/api/translator/novels', {
              params: { page: pageNum, limit: 20, search: search }
          }); 
          
          const newNovels = res.data;
          if (pageNum === 1) setNovels(newNovels);
          else setNovels(prev => [...prev, ...newNovels]);

          setHasMore(newNovels.length === 20); 
          setPage(pageNum);
      } catch(e) { 
          showToast("فشل جلب الروايات", "error");
      } finally { 
          setLoading(false); 
          setLoadingMore(false);
      }
  };

  const handleLoadMore = () => {
      if (!loadingMore && hasMore) fetchNovels(page + 1);
  };

  const fetchChapters = async (novelId) => {
      setChaptersLoading(true);
      setChapters([]);
      try {
          // 🔥 Fix: Using chapters-list endpoint
          const res = await api.get(`/api/novels/${novelId}/chapters-list?limit=10000`);
          if (res.data && Array.isArray(res.data)) {
              setChapters(res.data);
          } else {
              setChapters([]);
          }
      } catch(e) { 
          console.log(e);
          showToast("فشل جلب الفصول", "error");
          setChapters([]);
      } finally {
          setChaptersLoading(false);
      }
  };

  const handleSelectNovel = (novel) => {
      // 🛑 FIX: If same novel is selected, DO NOT reset state
      if (selectedNovel && selectedNovel._id === novel._id) {
          return;
      }

      setSelectedNovel(novel);
      fetchChapters(novel._id);
      setSelectedChapters([]);
      setRangeInput('');
      setSelectionMode('all');
      
      // Pre-fill search and create form
      setNadiSearchQuery(novel.title); 
      setCreateData({
          titleAr: novel.title,
          titleEn: novel.titleEn || '',
          desc: novel.description || '',
          cover: novel.cover || ''
      });
      setSelectedNadiId(null);
  };

  const searchNadi = async () => {
      if (!nadiSearchQuery.trim()) return;
      setSearchingNadi(true);
      Keyboard.dismiss(); // Dismiss keyboard to allow easy tapping
      try {
          const cookies = await AsyncStorage.getItem('nadi_cookies');
          const res = await axios.post(`${PYTHON_SERVER_URL}/nadi/search`, {
              query: nadiSearchQuery,
              cookies: cookies
          });
          setNadiResults(res.data || []);
      } catch (e) {
          showToast("فشل البحث في نادي الروايات", "error");
      } finally {
          setSearchingNadi(false);
      }
  };

  const handleLinkNadi = (item) => {
      if (!item.id) {
          showToast("خطأ: الرواية المختارة لا تحتوي على معرف (ID)", "error");
          return;
      }
      setSelectedNadiId(item.id);
      setSelectedNadiTitle(item.title);
      setIsNadiModalVisible(false);
      showToast(`تم الربط مع: ${item.title}`, "success");
  };

  const handleCreateNovel = async () => {
      if (!createData.titleAr || !createData.desc || !createData.cover) {
          showToast("جميع الحقول مطلوبة (العنوان، الوصف، الغلاف)", "error");
          return;
      }
      if (selectedGenres.length === 0) {
          showToast("اختر تصنيفاً واحداً على الأقل", "error");
          return;
      }

      setCreating(true);
      try {
          const cookies = await AsyncStorage.getItem('nadi_cookies');
          const res = await axios.post(`${PYTHON_SERVER_URL}/nadi/create-novel`, {
              titleAr: createData.titleAr,
              titleEn: createData.titleEn,
              description: createData.desc,
              cover: createData.cover,
              genres: selectedGenres,
              isTranslated: isTranslated,
              cookies: cookies
          });

          if (res.data.success) {
              const newId = res.data.id; // Numeric ID
              const newTitle = res.data.title;
              setSelectedNadiId(newId);
              setSelectedNadiTitle(newTitle);
              setIsCreateModalVisible(false);
              setIsNadiModalVisible(false);
              
              setAlertConfig({
                  title: "تم إنشاء الرواية!",
                  message: `تم إنشاء "${newTitle}" بنجاح.\nID: ${newId}\n\nتم الربط تلقائياً، يمكنك بدء النشر الآن.`,
                  type: 'success',
                  confirmText: "حسناً",
                  onConfirm: () => setAlertVisible(false)
              });
              setAlertVisible(true);
          } else {
              showToast("فشل الإنشاء: " + (res.data.error || "خطأ غير معروف"), "error");
          }
      } catch (e) {
          showToast("خطأ في الاتصال", "error");
      } finally {
          setCreating(false);
      }
  };

  const toggleGenre = (id) => {
      if (selectedGenres.includes(id)) {
          setSelectedGenres(selectedGenres.filter(g => g !== id));
      } else {
          setSelectedGenres([...selectedGenres, id]);
      }
  };

  const toggleChapter = (num) => {
      if (selectedChapters.includes(num)) {
          setSelectedChapters(prev => prev.filter(c => c !== num));
      } else {
          setSelectedChapters(prev => [...prev, num]);
      }
  };

  const handleApplyRange = () => {
      if (!rangeInput.trim()) { showToast("يرجى إدخال نطاق", "error"); return; }
      const input = rangeInput.trim();
      let newSelection = [];
      const availableNumbers = chapters.map(c => c.number);

      if (input.includes('-')) {
          const parts = input.split('-');
          const start = parseInt(parts[0]);
          const end = parseInt(parts[1]);
          if (isNaN(start) || isNaN(end)) return;
          for (let i = start; i <= end; i++) if (availableNumbers.includes(i)) newSelection.push(i);
      } else {
          const num = parseInt(input);
          if (!isNaN(num) && availableNumbers.includes(num)) newSelection.push(num);
      }

      if (newSelection.length === 0) showToast("لم يتم العثور على فصول في هذا النطاق", "warning");
      else {
          setSelectedChapters(newSelection);
          showToast(`تم تحديد ${newSelection.length} فصل`, "success");
          Keyboard.dismiss();
      }
  };

  const confirmJob = () => {
      if (!selectedNovel) { showToast("اختر رواية أولاً", "error"); return; }
      // 🔥 FIX: Strict null check to allow ID 0 if valid, and prevent falsy check fail
      if (selectedNadiId === null || selectedNadiId === undefined) { 
          showToast("يجب ربط الرواية بنادي الروايات", "error"); 
          return; 
      }
      
      const count = selectionMode === 'manual' ? selectedChapters.length : chapters.length;
      if (selectionMode === 'manual' && selectedChapters.length === 0) {
          showToast("حدد فصل واحد على الأقل", "error");
          return;
      }

      setAlertConfig({
          title: "بدء النشر الآلي",
          message: `نشر "${selectedNovel.title}"\nإلى ID: ${selectedNadiId}\nعدد الفصول: ${count}\nكل ${interval} دقيقة`,
          type: 'info',
          confirmText: 'ابدأ الآن',
          onConfirm: startJob
      });
      setAlertVisible(true);
  };

  const startJob = async () => {
      setAlertVisible(false);
      try {
          const cookies = await AsyncStorage.getItem('nadi_cookies');
          await axios.post(`${PYTHON_SERVER_URL}/nadi/start`, {
              novelId: selectedNovel._id,
              novelTitle: selectedNovel.title,
              nadiId: selectedNadiId, // Numeric ID
              chapters: selectionMode === 'manual' ? selectedChapters : chapters.map(c => c.number),
              cover: selectedNovel.cover, // Pass cover for dashboard
              interval: interval,
              cookies: cookies
          });
          showToast("تم بدء المهمة بنجاح", "success");
          navigation.navigate('NadiPublisherHub');
      } catch (e) {
          showToast("فشل بدء المهمة", "error");
      }
  };

  const renderNovelItem = ({ item }) => (
      <TouchableOpacity onPress={() => handleSelectNovel(item)} activeOpacity={0.8}>
          <GlassContainer style={[styles.novelItem, selectedNovel?._id === item._id && styles.novelItemSelected]}>
              <View style={{flexDirection:'row-reverse', alignItems:'center', padding: 10, gap: 10}}>
                  <Image source={{uri: item.cover}} style={styles.novelCover} />
                  <View style={{flex:1}}>
                      <Text style={styles.novelTitle} numberOfLines={2}>{item.title}</Text>
                      <Text style={styles.novelMeta}>{item.chaptersCount || 0} فصل</Text>
                  </View>
                  {selectedNovel?._id === item._id && <Ionicons name="checkmark-circle" size={24} color="#fff" />}
              </View>
          </GlassContainer>
      </TouchableOpacity>
  );

  const renderNadiItem = ({ item }) => (
      <TouchableOpacity onPress={() => handleLinkNadi(item)} activeOpacity={0.8}>
          <View style={[styles.nadiItem, selectedNadiId === item.id && styles.nadiItemSelected]}>
              <Text style={styles.nadiTitle}>{item.title}</Text>
              <Text style={styles.nadiId}>ID: {item.id}</Text>
              {selectedNadiId === item.id && <Ionicons name="checkmark" size={18} color="#4ade80" />}
          </View>
      </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ImageBackground source={require('../../assets/adaptive-icon.png')} style={styles.bgImage} blurRadius={20}>
          <LinearGradient colors={['rgba(0,0,0,0.6)', '#000000']} style={StyleSheet.absoluteFill} />
      </ImageBackground>
      
      <SafeAreaView style={{flex: 1}} edges={['top']}>
        {/* Custom Alert Component */}
        <CustomAlert 
            visible={alertVisible} title={alertConfig.title} message={alertConfig.message}
            type={alertConfig.type} confirmText={alertConfig.confirmText}
            onCancel={() => setAlertVisible(false)} onConfirm={alertConfig.onConfirm}
        />

        <View style={styles.header}>
            <Text style={styles.headerTitle}>اختيار رواية للنشر</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
        </View>

        <View style={{flex:1, flexDirection:'row-reverse'}}>
            {/* Right: Novels List */}
            <View style={styles.rightPane}>
                <GlassContainer style={styles.searchBox}>
                    <TextInput 
                        style={styles.searchInput} 
                        placeholder="بحث محلي..." 
                        placeholderTextColor="#666"
                        value={search}
                        onChangeText={setSearch}
                    />
                    <Ionicons name="search" size={16} color="#666" />
                </GlassContainer>
                
                {loading ? <ActivityIndicator color="#fff" style={{marginTop:20}} /> : 
                    <FlatList 
                        data={novels}
                        // 🔥 Fix keyExtractor crash
                        keyExtractor={(item, index) => item?._id ? item._id.toString() : index.toString()}
                        renderItem={renderNovelItem}
                        onEndReached={handleLoadMore}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={loadingMore && <ActivityIndicator color="#fff" />}
                    />
                }
            </View>

            {/* Left: Configuration Panel */}
            <View style={styles.leftPane}>
                {selectedNovel ? (
                    <GlassContainer style={{flex: 1, padding: 15}}>
                        <Text style={styles.selectedTitle}>{selectedNovel.title}</Text>
                        
                        <TouchableOpacity 
                            style={[styles.linkBtn, selectedNadiId && {borderColor: '#4ade80'}]} 
                            onPress={() => setIsNadiModalVisible(true)}
                        >
                            <Ionicons name={selectedNadiId ? "link" : "unlink"} size={18} color={selectedNadiId ? "#4ade80" : "#666"} />
                            <Text style={[styles.linkBtnText, selectedNadiId && {color:'#4ade80'}]}>
                                {selectedNadiId ? `مرتبط ID: ${selectedNadiId}` : "ربط مع نادي الروايات"}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.separator} />

                        {/* Selection Mode Switch */}
                        <View style={styles.modeSwitch}>
                            <TouchableOpacity style={[styles.modeBtn, selectionMode === 'all' && styles.modeBtnActive]} onPress={() => setSelectionMode('all')}>
                                <Text style={[styles.modeText, selectionMode === 'all' && {color:'#fff'}]}>الكل</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modeBtn, selectionMode === 'manual' && styles.modeBtnActive]} onPress={() => setSelectionMode('manual')}>
                                <Text style={[styles.modeText, selectionMode === 'manual' && {color:'#fff'}]}>تحديد</Text>
                            </TouchableOpacity>
                        </View>

                        {selectionMode === 'manual' && (
                            <View style={{flex: 1}}>
                                <View style={styles.rangeInputRow}>
                                    <TextInput 
                                        style={styles.rangeInput} placeholder="1-10" placeholderTextColor="#666"
                                        value={rangeInput} onChangeText={setRangeInput}
                                    />
                                    <TouchableOpacity style={styles.rangeApplyBtn} onPress={handleApplyRange}>
                                        <Text style={styles.rangeApplyText}>ok</Text>
                                    </TouchableOpacity>
                                </View>
                                {chaptersLoading ? <ActivityIndicator color="#fff" style={{marginTop: 10}} /> : 
                                    // 🔥 Fix Chapter List & keyExtractor
                                    <FlatList 
                                        data={chapters}
                                        keyExtractor={(item) => item.number ? item.number.toString() : Math.random().toString()}
                                        style={{flex:1, marginTop: 10}}
                                        // 🔥 Important: Handle keyboard presses inside list
                                        keyboardShouldPersistTaps="handled"
                                        renderItem={({item}) => (
                                            <TouchableOpacity 
                                                style={[styles.chapItem, selectedChapters.includes(item.number) && styles.chapItemActive]}
                                                onPress={() => toggleChapter(item.number)}
                                            >
                                                <Text style={[styles.chapText, selectedChapters.includes(item.number) && {color:'#fff'}]}>
                                                    #{item.number}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                        ListEmptyComponent={<Text style={{color:'#666', fontSize:10, textAlign:'center'}}>لا توجد فصول</Text>}
                                    />
                                }
                            </View>
                        )}

                        <View style={styles.separator} />
                        
                        <View style={{flexDirection:'row-reverse', alignItems:'center', justifyContent:'space-between', marginBottom: 10}}>
                            <Text style={{color:'#ccc', fontSize:12}}>الفاصل الزمني (د)</Text>
                            <TextInput style={styles.intervalInput} value={interval} onChangeText={setInterval} keyboardType="numeric"/>
                        </View>

                        <TouchableOpacity style={styles.startBtn} onPress={confirmJob}>
                            <Text style={styles.startBtnText}>نشر آلي</Text>
                            <Ionicons name="rocket" size={18} color="#fff" />
                        </TouchableOpacity>
                    </GlassContainer>
                ) : (
                    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
                        <Ionicons name="arrow-back" size={40} color="#333" />
                        <Text style={{color:'#666', marginTop:10}}>اختر رواية</Text>
                    </View>
                )}
            </View>
        </View>

        {/* Nadi Search Modal */}
        <Modal visible={isNadiModalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <GlassContainer style={styles.modalContent}>
                    <Text style={styles.modalTitle}>بحث في نادي الروايات</Text>
                    <View style={styles.modalSearchBox}>
                        <TextInput 
                            style={styles.modalInput} placeholder="اسم الرواية..." placeholderTextColor="#666" 
                            value={nadiSearchQuery} onChangeText={setNadiSearchQuery}
                        />
                        <TouchableOpacity style={styles.modalSearchBtn} onPress={searchNadi}>
                            <Ionicons name="search" size={20} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    
                    {searchingNadi ? <ActivityIndicator color="#fff" /> : (
                        <FlatList 
                            data={nadiResults}
                            // Safe Key Extractor for Nadi Results
                            keyExtractor={(item) => item.id ? item.id.toString() : Math.random().toString()}
                            renderItem={renderNadiItem}
                            style={{maxHeight: 250}}
                            // 🔥 Critical for handling touches inside modal with keyboard
                            keyboardShouldPersistTaps="handled"
                            ListEmptyComponent={<Text style={{color:'#666', textAlign:'center'}}>لا توجد نتائج</Text>}
                        />
                    )}

                    <TouchableOpacity style={styles.createLink} onPress={() => setIsCreateModalVisible(true)}>
                        <Text style={{color:'#4a7cc7'}}>+ إنشاء رواية جديدة في النادي</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.modalClose} onPress={() => setIsNadiModalVisible(false)}>
                        <Text style={{color:'#fff'}}>إغلاق</Text>
                    </TouchableOpacity>
                </GlassContainer>
            </View>
        </Modal>

        {/* Create Novel Modal (Full Fields) */}
        <Modal visible={isCreateModalVisible} transparent animationType="slide">
            <View style={styles.modalOverlay}>
                <GlassContainer style={styles.createModalContent}>
                    <Text style={styles.modalTitle}>إنشاء رواية في النادي</Text>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={styles.label}>العنوان بالعربي</Text>
                        <TextInput style={styles.glassInput} value={createData.titleAr} onChangeText={t => setCreateData({...createData, titleAr: t})} textAlign="right"/>
                        
                        <Text style={styles.label}>العنوان بالإنجليزي</Text>
                        <TextInput style={styles.glassInput} value={createData.titleEn} onChangeText={t => setCreateData({...createData, titleEn: t})} textAlign="left" />
                        
                        <Text style={styles.label}>رابط الغلاف</Text>
                        <TextInput style={styles.glassInput} value={createData.cover} onChangeText={t => setCreateData({...createData, cover: t})} textAlign="left"/>
                        
                        <Text style={styles.label}>الوصف</Text>
                        <TextInput style={[styles.glassInput, {height: 80, textAlignVertical: 'top'}]} multiline value={createData.desc} onChangeText={t => setCreateData({...createData, desc: t})} textAlign="right"/>

                        <Text style={styles.label}>نوع الرواية</Text>
                        <View style={{flexDirection:'row-reverse', alignItems:'center', justifyContent:'space-between', marginBottom: 15}}>
                            <Text style={{color:'#ccc'}}>مترجمة؟</Text>
                            <Switch value={isTranslated} onValueChange={setIsTranslated} trackColor={{false:'#333', true:'#4ade80'}} />
                        </View>

                        <Text style={styles.label}>التصنيفات</Text>
                        <View style={styles.genresContainer}>
                            {NADI_GENRES.map(g => (
                                <TouchableOpacity 
                                    key={g.id} 
                                    style={[styles.genreChip, selectedGenres.includes(g.id) && styles.genreChipSelected]}
                                    onPress={() => toggleGenre(g.id)}
                                >
                                    <Text style={[styles.genreText, selectedGenres.includes(g.id) && {color:'#000'}]}>{g.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>

                    <TouchableOpacity style={styles.startBtn} onPress={handleCreateNovel} disabled={creating}>
                        {creating ? <ActivityIndicator color="#fff" /> : <Text style={styles.startBtnText}>إنشاء</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.modalClose} onPress={() => setIsCreateModalVisible(false)}>
                        <Text style={{color:'#fff'}}>إلغاء</Text>
                    </TouchableOpacity>
                </GlassContainer>
            </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  bgImage: { ...StyleSheet.absoluteFillObject },
  header: { flexDirection: 'row-reverse', justifyContent: 'space-between', padding: 15, alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  closeBtn: { padding: 5, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)' },
  glassContainer: { backgroundColor: 'rgba(20, 20, 20, 0.85)', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  rightPane: { width: '45%', padding: 10 },
  leftPane: { width: '55%', padding: 10 },
  searchBox: { flexDirection: 'row', alignItems: 'center', padding: 10, marginBottom: 10 },
  searchInput: { flex: 1, color: '#fff', fontSize: 12, textAlign: 'right', marginRight: 5 },
  novelItem: { marginBottom: 8 },
  novelItemSelected: { borderColor: '#fff', borderWidth: 1 },
  novelCover: { width: 35, height: 50, borderRadius: 4, backgroundColor: '#333' },
  novelTitle: { color: '#fff', fontSize: 12, textAlign: 'right' },
  novelMeta: { color: '#666', fontSize: 10, textAlign: 'right' },
  loadMoreBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, alignItems: 'center', marginTop: 10 },
  selectedTitle: { color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  linkBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#333', gap: 8, marginBottom: 10 },
  linkBtnText: { color: '#666', fontSize: 12, fontWeight: 'bold' },
  separator: { height: 1, backgroundColor: '#333', marginVertical: 10 },
  modeSwitch: { flexDirection: 'row-reverse', backgroundColor: '#111', padding: 4, borderRadius: 8, marginBottom: 10 },
  modeBtn: { flex: 1, paddingVertical: 6, alignItems: 'center', borderRadius: 6 },
  modeBtnActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  modeText: { color: '#666', fontSize: 11, fontWeight: 'bold' },
  rangeInputRow: { flexDirection: 'row-reverse', gap: 5 },
  rangeInput: { flex: 1, backgroundColor: '#222', color: '#fff', borderRadius: 6, padding: 8, textAlign: 'center', fontSize: 12 },
  rangeApplyBtn: { backgroundColor: '#333', borderRadius: 6, paddingHorizontal: 10, justifyContent: 'center' },
  rangeApplyText: { color: '#fff', fontSize: 10 },
  intervalInput: { width: 50, backgroundColor: '#222', color: '#fff', borderRadius: 6, padding: 5, textAlign: 'center' },
  startBtn: { marginTop: 20, backgroundColor: 'rgba(244, 63, 94, 0.2)', borderWidth: 1, borderColor: '#f43f5e', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, gap: 5 },
  startBtnText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 100 },
  modalContent: { width: '85%', padding: 20 },
  createModalContent: { width: '90%', padding: 20, maxHeight: '90%' },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', marginBottom: 15 },
  modalSearchBox: { flexDirection: 'row-reverse', gap: 10, marginBottom: 15 },
  modalInput: { flex: 1, backgroundColor: '#222', borderRadius: 8, padding: 10, color: '#fff', textAlign: 'right' },
  modalSearchBtn: { backgroundColor: '#4a7cc7', padding: 10, borderRadius: 8, justifyContent: 'center' },
  modalClose: { marginTop: 15, alignSelf: 'center', padding: 10 },
  createLink: { marginTop: 15, alignItems: 'center' },
  nadiItem: { padding: 12, borderBottomWidth: 1, borderColor: '#333', flexDirection: 'row-reverse', justifyContent: 'space-between' },
  nadiItemSelected: { backgroundColor: 'rgba(74, 222, 128, 0.1)' },
  nadiTitle: { color: '#fff', fontSize: 14, textAlign: 'right', flex: 1 },
  nadiId: { color: '#666', fontSize: 10 },
  label: { color: '#ccc', textAlign: 'right', marginBottom: 5, fontSize: 12 },
  glassInput: { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: 10, color: '#fff', borderWidth: 1, borderColor: '#333', marginBottom: 10 },
  genresContainer: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  genreChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, backgroundColor: '#222', borderWidth: 1, borderColor: '#333' },
  genreChipSelected: { backgroundColor: '#4ade80', borderColor: '#4ade80' },
  genreText: { color: '#ccc', fontSize: 12 },
  chapItem: { padding: 8, borderBottomWidth: 1, borderColor: '#222', alignItems: 'flex-end' },
  chapItemActive: { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  chapText: { color: '#ccc', fontSize: 12, textAlign: 'right' },
});
