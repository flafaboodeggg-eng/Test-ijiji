import { useState, useEffect, useMemo, useCallback } from 'react';
import { ReplacementFolder } from '../types';

const FOLDERS_KEY = '@reader_folders_v2';
const UI_PREFS_KEY = '@reader_ui_prefs';

export const useReplacements = () => {
  const [folders, setFolders] = useState<ReplacementFolder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'folders' | 'list'>('folders');
  const [search, setSearch] = useState('');
  const [sortDesc, setSortDesc] = useState(true);
  const [newOriginal, setNewOriginal] = useState('');
  const [newReplacement, setNewReplacement] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  useEffect(() => {
    const loadFolders = async () => {
      try {
        const saved = localStorage.getItem(FOLDERS_KEY);
        if (saved) {
          setFolders(JSON.parse(saved));
        } else {
          const old = localStorage.getItem('@reader_replacements');
          if (old) {
            const migrated = [{
              id: 'default_migrated',
              name: 'عام (قديم)',
              replacements: JSON.parse(old),
            }];
            setFolders(migrated);
            localStorage.setItem(FOLDERS_KEY, JSON.stringify(migrated));
          }
        }
        const prefs = localStorage.getItem(UI_PREFS_KEY);
        if (prefs) {
          const { lastFolderId, sortDesc: savedSort } = JSON.parse(prefs);
          if (savedSort !== undefined) setSortDesc(savedSort);
          if (lastFolderId && folders.find(f => f.id === lastFolderId)) {
            setCurrentFolderId(lastFolderId);
            setViewMode('list');
          }
        }
      } catch (e) {}
    };
    loadFolders();
  }, []);

  const saveFolders = useCallback((newFolders: ReplacementFolder[]) => {
    setFolders(newFolders);
    localStorage.setItem(FOLDERS_KEY, JSON.stringify(newFolders));
  }, []);

  const saveUiPrefs = useCallback((prefs: any) => {
    const existing = localStorage.getItem(UI_PREFS_KEY);
    const current = existing ? JSON.parse(existing) : {};
    localStorage.setItem(UI_PREFS_KEY, JSON.stringify({ ...current, ...prefs }));
  }, []);

  const createFolder = () => {
    if (!newFolderName.trim()) return;
    const newFolder: ReplacementFolder = { id: Date.now().toString(), name: newFolderName.trim(), replacements: [] };
    saveFolders([...folders, newFolder]);
    setShowFolderModal(false);
    setNewFolderName('');
  };

  const deleteFolder = (id: string) => {
    if (window.confirm('هل أنت متأكد؟ سيتم حذف جميع الاستبدالات داخله.')) {
      const updated = folders.filter(f => f.id !== id);
      saveFolders(updated);
      if (currentFolderId === id) {
        setCurrentFolderId(null);
        setViewMode('folders');
      }
    }
  };

  const openFolder = (id: string) => {
    setCurrentFolderId(id);
    setViewMode('list');
    saveUiPrefs({ lastFolderId: id });
    setSearch('');
  };

  const backToFolders = () => {
    setViewMode('folders');
  };

  const toggleSort = () => {
    const newOrder = !sortDesc;
    setSortDesc(newOrder);
    saveUiPrefs({ sortDesc: newOrder });
  };

  const addReplacement = () => {
    if (!currentFolderId) return;
    if (!newOriginal.trim() || !newReplacement.trim()) {
      alert('يرجى إدخال الكلمة الأصلية والبديلة');
      return;
    }
    const folderIndex = folders.findIndex(f => f.id === currentFolderId);
    if (folderIndex === -1) return;
    const folder = folders[folderIndex];
    let updatedReplacements = [...folder.replacements];
    if (editingId !== null) {
      updatedReplacements[editingId] = { original: newOriginal.trim(), replacement: newReplacement.trim() };
      setEditingId(null);
    } else {
      updatedReplacements.push({ original: newOriginal.trim(), replacement: newReplacement.trim() });
    }
    const updatedFolders = [...folders];
    updatedFolders[folderIndex] = { ...folder, replacements: updatedReplacements };
    saveFolders(updatedFolders);
    setNewOriginal('');
    setNewReplacement('');
  };

  const editReplacement = (item: { original: string; replacement: string }, idx: number) => {
    setNewOriginal(item.original);
    setNewReplacement(item.replacement);
    setEditingId(idx);
  };

  const deleteReplacement = (idx: number) => {
    if (!currentFolderId) return;
    const folderIndex = folders.findIndex(f => f.id === currentFolderId);
    if (folderIndex === -1) return;
    const folder = folders[folderIndex];
    const updatedReplacements = folder.replacements.filter((_, i) => i !== idx);
    const updatedFolders = [...folders];
    updatedFolders[folderIndex] = { ...folder, replacements: updatedReplacements };
    saveFolders(updatedFolders);
    if (editingId === idx) {
      setEditingId(null);
      setNewOriginal('');
      setNewReplacement('');
    }
  };

  const activeReplacements = useMemo(() => {
    if (!currentFolderId) return [];
    const folder = folders.find(f => f.id === currentFolderId);
    return folder ? folder.replacements : [];
  }, [folders, currentFolderId]);

  const filteredSortedReplacements = useMemo(() => {
    let list = activeReplacements.map((item, idx) => ({ ...item, idx }));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(item =>
        item.original.toLowerCase().includes(q) || item.replacement.toLowerCase().includes(q)
      );
    }
    if (sortDesc) list.reverse();
    return list;
  }, [activeReplacements, search, sortDesc]);

  return {
    folders,
    currentFolderId,
    viewMode,
    search,
    sortDesc,
    newOriginal,
    newReplacement,
    editingId,
    showFolderModal,
    newFolderName,
    activeReplacements,
    filteredSortedReplacements,
    setSearch,
    setNewOriginal,
    setNewReplacement,
    setShowFolderModal,
    setNewFolderName,
    createFolder,
    deleteFolder,
    openFolder,
    backToFolders,
    toggleSort,
    addReplacement,
    editReplacement,
    deleteReplacement,
    setEditingId,
  };
};