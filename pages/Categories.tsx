import React, { useState, useMemo } from 'react';
import { BTN_PRIMARY_STYLE, BTN_SECONDARY_STYLE, INPUT_BASE_STYLE } from '../constants';
import { Category, Page } from '../types';
import Card from '../components/Card';
import CategoryModal from '../components/CategoryModal';
import Modal from '../components/Modal';
import { v4 as uuidv4 } from 'uuid';

const generateId = () => `cat-${uuidv4()}`;

interface EditState {
  category: Category;
  parentId?: string;
  classification: 'income' | 'expense';
}

interface CategoriesProps {
  incomeCategories: Category[];
  setIncomeCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  expenseCategories: Category[];
  setExpenseCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  setCurrentPage: (page: Page) => void;
}

const Categories: React.FC<CategoriesProps> = ({ incomeCategories, setIncomeCategories, expenseCategories, setExpenseCategories, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState<'expense' | 'income'>('expense');
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingState, setEditingState] = useState<EditState | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [confirmingDelete, setConfirmingDelete] = useState<{ categoryId: string; classification: 'income' | 'expense' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});

  const [draggedItem, setDraggedItem] = useState<{ id: string; classification: 'income' | 'expense' } | null>(null);
  const [dropTarget, setDropTarget] = useState<{ id: string; position: 'top' | 'bottom' | 'middle' } | null>(null);

  const openModal = (
    mode: 'add' | 'edit', 
    classification: 'income' | 'expense',
    category?: Category,
    parentId?: string
  ) => {
    setModalMode(mode);
    setEditingState({
        category: category || { id: '', name: '', color: '#6366f1', classification, subCategories: [], icon: 'category' },
        parentId,
        classification,
    });
    setModalOpen(true);
  };
  
  const handleSaveCategory = (savedCategory: Category, parentId?: string) => {
    const isEditing = !!savedCategory.id;
    const classification = savedCategory.classification;
    const setCategories = classification === 'income' ? setIncomeCategories : setExpenseCategories;
    
    const updateRecursively = (categories: Category[], targetId: string, updatedCat: Category): Category[] => {
        return categories.map(cat => {
            if (cat.id === targetId) return { ...cat, name: updatedCat.name, color: updatedCat.color, icon: updatedCat.icon };
            if (cat.subCategories.length > 0) {
                return { ...cat, subCategories: updateRecursively(cat.subCategories, targetId, updatedCat) };
            }
            return cat;
        });
    };

    const addSubCategoryRecursively = (categories: Category[], pId: string, newCat: Category): Category[] => {
        return categories.map(cat => {
            if (cat.id === pId) return { ...cat, subCategories: [...cat.subCategories, newCat] };
            if (cat.subCategories.length > 0) {
                 return { ...cat, subCategories: addSubCategoryRecursively(cat.subCategories, pId, newCat) };
            }
            return cat;
        });
    };

    if (isEditing) {
        setCategories(prev => updateRecursively(prev, savedCategory.id, savedCategory));
    } else {
        const newCategoryWithId = { ...savedCategory, id: generateId() };
        if (parentId) {
            setCategories(prev => addSubCategoryRecursively(prev, parentId, newCategoryWithId));
        } else {
            setCategories(prev => [...prev, newCategoryWithId]);
        }
    }

    setModalOpen(false);
    setEditingState(null);
  };

  const handleDeleteCategory = (categoryId: string, classification: 'income' | 'expense') => {
    setConfirmingDelete({ categoryId, classification });
  };

  const executeDelete = () => {
    if (!confirmingDelete) return;

    const { categoryId, classification } = confirmingDelete;
    const setCategories = classification === 'income' ? setIncomeCategories : setExpenseCategories;
    
    const removeRecursively = (categories: Category[], idToRemove: string): Category[] => {
        const filtered = categories.filter(cat => cat.id !== idToRemove);
        
        return filtered.map(cat => {
            if (cat.subCategories && cat.subCategories.length > 0) {
                return { ...cat, subCategories: removeRecursively(cat.subCategories, idToRemove) };
            }
            return cat;
        });
    };

    setCategories(prev => removeRecursively(prev, categoryId));
    setConfirmingDelete(null);
  };

  const filterCategories = (categories: Category[], term: string): Category[] => {
    const lowercasedTerm = term.toLowerCase().trim();
    if (!lowercasedTerm) return categories;

    const results: Category[] = [];
    for (const category of categories) {
      if (category.name.toLowerCase().includes(lowercasedTerm)) {
        results.push(category);
        continue;
      }
      const matchingSubcategories = filterCategories(category.subCategories, lowercasedTerm);
      if (matchingSubcategories.length > 0) {
        results.push({ ...category, subCategories: matchingSubcategories });
      }
    }
    return results;
  };

  const filteredIncomeCategories = useMemo(() => filterCategories(incomeCategories, searchTerm), [incomeCategories, searchTerm]);
  const filteredExpenseCategories = useMemo(() => filterCategories(expenseCategories, searchTerm), [expenseCategories, searchTerm]);
  const activeCategories = activeTab === 'income' ? filteredIncomeCategories : filteredExpenseCategories;

    const handleDragStart = (id: string, classification: 'income' | 'expense') => { setDraggedItem({ id, classification }); };
    const handleDragOver = (e: React.DragEvent, id: string, level: number) => {
        e.preventDefault(); e.stopPropagation();
        if (!draggedItem || draggedItem.id === id) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const third = rect.height / 3;
        let position: 'top' | 'bottom' | 'middle' = 'middle';
        
        if (e.clientY < rect.top + third) position = 'top';
        else if (e.clientY > rect.bottom - third) position = 'bottom';

        if (level > 0 && position === 'middle') {
            const midpoint = rect.top + rect.height / 2;
            position = e.clientY < midpoint ? 'top' : 'bottom';
        }
        
        setDropTarget({ id, position });
    };
    const handleDragLeave = () => { setDropTarget(null); };
    const handleDragEnd = () => { setDraggedItem(null); setDropTarget(null); };

    const handleDrop = () => {
        if (!draggedItem || !dropTarget || draggedItem.id === dropTarget.id) return handleDragEnd();

        const { id: draggedId, classification } = draggedItem;
        const { id: dropId, position } = dropTarget;

        if (classification !== activeTab) return handleDragEnd();

        const setCategories = classification === 'income' ? setIncomeCategories : setExpenseCategories;

        setCategories(prev => {
            let draggedCategory: Category | null = null;
            
            const isDescendant = (items: Category[], parentId: string, childId: string): boolean => {
                const findParent = (cats: Category[], id: string): Category | null => {
                    for (const cat of cats) { if (cat.id === id) return cat; if (cat.subCategories?.length) { const found = findParent(cat.subCategories, id); if (found) return found; } } return null;
                };
                const parent = findParent(items, parentId);
                return parent ? !!findParent(parent.subCategories, childId) : false;
            };
            if (isDescendant(prev, draggedId, dropId)) return prev;

            const findAndRemove = (items: Category[]): Category[] => {
                const itemIndex = items.findIndex(item => item.id === draggedId);
                if (itemIndex > -1) {
                    draggedCategory = { ...items[itemIndex] };
                    return items.filter(item => item.id !== draggedId);
                }
                return items.map(item => ({ ...item, subCategories: findAndRemove(item.subCategories) }));
            };
            const categoriesWithoutItem = findAndRemove(prev);
            if (!draggedCategory) return prev; 

            const findAndInsert = (items: Category[], parentId?: string): Category[] => {
                if (position === 'middle') {
                    return items.map(item => (item.id === dropId) ? { ...item, subCategories: [...item.subCategories, { ...draggedCategory!, parentId: dropId }] } : { ...item, subCategories: findAndInsert(item.subCategories, item.id) });
                }
                
                const targetIndex = items.findIndex(item => item.id === dropId);
                if (targetIndex > -1) {
                    const newItems = [...items];
                    newItems.splice(position === 'top' ? targetIndex : targetIndex + 1, 0, { ...draggedCategory!, parentId });
                    return newItems;
                }
                
                return items.map(item => ({ ...item, subCategories: findAndInsert(item.subCategories, item.id) }));
            };
            const newCategoryTree = findAndInsert(categoriesWithoutItem);
            return newCategoryTree;
        });

        handleDragEnd();
    };

    const toggleCategory = (categoryId: string) => setOpenCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));

    const CategoryRow: React.FC<{ category: Category; level: number }> = ({ category, level }) => {
        const isOpen = !!openCategories[category.id];
        const isDragging = draggedItem?.id === category.id;
        const isDropTarget = dropTarget?.id === category.id ? dropTarget : null;

        return (
            <div className={`relative rounded-lg ${isDragging ? 'opacity-30' : ''}`} style={{ marginLeft: `${level * 20}px` }}>
                {isDropTarget?.position === 'top' && <div className="absolute -top-1 left-0 right-0 h-1.5 bg-primary-500 rounded-full z-10" />}
                {isDropTarget?.position === 'bottom' && <div className="absolute -bottom-1 left-0 right-0 h-1.5 bg-primary-500 rounded-full z-10" />}
                {isDropTarget?.position === 'middle' && level === 0 && <div className="absolute inset-0 bg-primary-500/20 rounded-lg border-2 border-primary-500 border-dashed z-10" />}
                
                <div 
                    draggable onDragStart={(e) => { e.stopPropagation(); handleDragStart(category.id, activeTab); }}
                    onDragEnd={(e) => { e.stopPropagation(); handleDragEnd(); }}
                    onDrop={(e) => { e.stopPropagation(); handleDrop(); }}
                    onDragOver={(e) => handleDragOver(e, category.id, level)}
                    onDragLeave={(e) => { e.stopPropagation(); handleDragLeave(); }}
                    className="p-3 rounded-lg group hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                    <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined cursor-grab text-light-text-secondary dark:text-dark-text-secondary opacity-0 group-hover:opacity-100 transition-opacity">drag_indicator</span>
                        {category.subCategories.length > 0 ? (
                            <button onClick={() => toggleCategory(category.id)} className="p-1 -ml-1"><span className={`material-symbols-outlined transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>chevron_right</span></button>
                        ) : <div className="w-8"></div>}
                        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${category.color}20`}}>
                            <span className="material-symbols-outlined" style={{ fontSize: '22px', color: category.color }}>{category.icon || 'category'}</span>
                        </div>
                        <div className="flex-grow min-w-0">
                            <p className="font-semibold text-light-text dark:text-dark-text">{category.name}</p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {level === 0 && <button onClick={() => openModal('add', activeTab, undefined, category.id)} className="p-2 rounded-full" title="Add Sub-category"><span className="material-symbols-outlined text-base">add</span></button>}
                            <button onClick={() => openModal('edit', activeTab, category)} className="p-2 rounded-full" title="Edit"><span className="material-symbols-outlined text-base">edit</span></button>
                            <button onClick={() => handleDeleteCategory(category.id, activeTab)} className="p-2 rounded-full text-red-500/80 hover:bg-red-500/10" title="Delete"><span className="material-symbols-outlined text-base">delete</span></button>
                        </div>
                    </div>
                </div>
                {isOpen && category.subCategories.length > 0 && (
                    <div className="mt-1 space-y-1">
                        {category.subCategories.map(sub => <CategoryRow key={sub.id} category={sub} level={level + 1} />)}
                    </div>
                )}
            </div>
        );
    };

  return (
    <div className="space-y-8">
      {isModalOpen && editingState && <CategoryModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveCategory} category={editingState.category} parentId={editingState.parentId} mode={modalMode} classification={editingState.classification} />}
      {confirmingDelete && <Modal onClose={() => setConfirmingDelete(null)} title="Confirm Deletion"><div className="space-y-6"><p>Are you sure you want to delete this category and all its sub-categories? This action cannot be undone.</p><div className="flex justify-end gap-4"><button type="button" onClick={() => setConfirmingDelete(null)} className={BTN_SECONDARY_STYLE}>Cancel</button><button type="button" onClick={executeDelete} className="bg-red-500 text-white font-semibold py-2 px-4 rounded-lg">Delete</button></div></div></Modal>}
      
      <header>
        <div className="flex items-center gap-4">
            <button onClick={() => setCurrentPage('Settings')} className="text-light-text-secondary dark:text-dark-text-secondary p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"><span className="material-symbols-outlined">arrow_back</span></button>
            <div className="text-sm text-light-text-secondary dark:text-dark-text-secondary"><span onClick={() => setCurrentPage('Settings')} className="hover:underline cursor-pointer">Settings</span><span> / </span><span className="text-light-text dark:text-dark-text font-medium">Categories</span></div>
        </div>
        <div className="mt-4 flex justify-between items-center"><p className="text-light-text-secondary dark:text-dark-text-secondary mt-1">Manage and reorder your income and expense categories.</p></div>
      </header>

      <div className="border-b border-light-separator dark:border-dark-separator">
        <nav className="-mb-px flex space-x-6">
            <button onClick={() => setActiveTab('expense')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-base transition-colors ${activeTab === 'expense' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Expense Categories</button>
            <button onClick={() => setActiveTab('income')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-base transition-colors ${activeTab === 'income' ? 'border-primary-500 text-primary-600 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Income Categories</button>
        </nav>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="relative w-full max-w-sm">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-light-text-secondary dark:text-dark-text-secondary pointer-events-none">search</span>
              <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${INPUT_BASE_STYLE} pl-10 h-11`} />
          </div>
          <button onClick={() => openModal('add', activeTab)} className={BTN_PRIMARY_STYLE}>Add New</button>
        </div>
        <Card className="p-4">
            <div className="space-y-2">
                {activeCategories.map(cat => <CategoryRow key={cat.id} category={cat} level={0} />)}
            </div>
            {activeCategories.length === 0 && <p className="text-center text-light-text-secondary dark:text-dark-text-secondary py-8">{searchTerm ? 'No matching categories found.' : 'No categories defined.'}</p>}
        </Card>
      </div>
    </div>
  );
};

export default Categories;