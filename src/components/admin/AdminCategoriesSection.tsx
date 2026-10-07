'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Search,
  X,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Edit2,
  Trash2,
  Check,
} from 'lucide-react';
import type { Product } from '@/lib/types';
import { ADMIN_BTN_PRIMARY, ADMIN_BTN_SECONDARY, ADMIN_INPUT } from '@/components/admin/adminTouchTargets';

type AdminConfirm = {
  active: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  color: string;
};

type AdminCategoriesSectionProps = {
  pageSettings: any;
  setPageSettings: React.Dispatch<React.SetStateAction<any>>;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categoryFilterSearch: string;
  setCategoryFilterSearch: (v: string) => void;
  isAddingCategory: boolean;
  setIsAddingCategory: (v: boolean) => void;
  newCategoryName: string;
  setNewCategoryName: (v: string) => void;
  collapsedCategories: Record<string, boolean>;
  setCollapsedCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  editingCategory: string | null;
  setEditingCategory: (v: string | null) => void;
  editCategoryValue: string;
  setEditCategoryValue: (v: string) => void;
  addingSubcategoryTo: string | null;
  setAddingSubcategoryTo: (v: string | null) => void;
  newSubcategoryName: string;
  setNewSubcategoryName: (v: string) => void;
  editingSubcategory: { category: string; subcategory: string } | null;
  setEditingSubcategory: (v: { category: string; subcategory: string } | null) => void;
  editSubcategoryValue: string;
  setEditSubcategoryValue: (v: string) => void;
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  getProductCount: (category: string, subcategory?: string | null) => number;
  setAdminConfirmAction: (action: AdminConfirm | null) => void;
};

export function AdminCategoriesSection({
  pageSettings,
  setPageSettings,
  products,
  setProducts,
  categoryFilterSearch,
  setCategoryFilterSearch,
  isAddingCategory,
  setIsAddingCategory,
  newCategoryName,
  setNewCategoryName,
  collapsedCategories,
  setCollapsedCategories,
  editingCategory,
  setEditingCategory,
  editCategoryValue,
  setEditCategoryValue,
  addingSubcategoryTo,
  setAddingSubcategoryTo,
  newSubcategoryName,
  setNewSubcategoryName,
  editingSubcategory,
  setEditingSubcategory,
  editSubcategoryValue,
  setEditSubcategoryValue,
  addToast,
  getProductCount,
  setAdminConfirmAction,
}: AdminCategoriesSectionProps) {
  const categories = pageSettings.categories.filter((c: string) => c !== 'Tutti');
  const filtered = categories.filter((cat: string) => {
    if (!categoryFilterSearch.trim()) return true;
    const q = categoryFilterSearch.toLowerCase();
    if (cat.toLowerCase().includes(q)) return true;
    const subs = pageSettings.subcategories[cat] || [];
    return subs.some((s: string) => s.toLowerCase().includes(q));
  });

  const confirmDeleteCategory = (cat: string) => {
    setAdminConfirmAction({
      active: true,
      title: 'Elimina categoria',
      message: `Eliminare "${cat}" e tutte le sottocategorie collegate? L'operazione non è reversibile.`,
      color: 'bg-red-500',
      onConfirm: () => {
        const { [cat]: _s, ...remainingSubs } = pageSettings.subcategories;
        const { [cat]: _b, ...remainingBanners } = pageSettings.categoryBanners;
        setPageSettings({
          ...pageSettings,
          categories: pageSettings.categories.filter((c: string) => c !== cat),
          subcategories: remainingSubs,
          categoryBanners: remainingBanners,
        });
        addToast(`Categoria "${cat}" eliminata.`, 'info');
      },
    });
  };

  const confirmDeleteSubcategory = (cat: string, sub: string) => {
    setAdminConfirmAction({
      active: true,
      title: 'Elimina sottocategoria',
      message: `Eliminare "${sub}" da ${cat}?`,
      color: 'bg-red-500',
      onConfirm: () => {
        setPageSettings({
          ...pageSettings,
          subcategories: {
            ...pageSettings.subcategories,
            [cat]: pageSettings.subcategories[cat].filter((s: string) => s !== sub),
          },
        });
        addToast(`Sottocategoria "${sub}" eliminata.`, 'info');
      },
    });
  };

  const isCategoryExpanded = (cat: string) => {
    if (categoryFilterSearch.trim()) return true;
    return collapsedCategories[cat] === false;
  };

  const toggleCategoryExpanded = (cat: string) => {
    const expanded = isCategoryExpanded(cat);
    setCollapsedCategories((prev) => ({ ...prev, [cat]: expanded ? true : false }));
  };

  const moveCategory = (cat: string, direction: -1 | 1) => {
    const idx = pageSettings.categories.indexOf(cat);
    if (idx < 1) return;
    const newIdx = idx + direction;
    if (newIdx < 1 || newIdx >= pageSettings.categories.length) return;
    const newCats = [...pageSettings.categories];
    [newCats[idx], newCats[newIdx]] = [newCats[newIdx], newCats[idx]];
    setPageSettings({ ...pageSettings, categories: newCats });
  };

  const moveSubcategory = (cat: string, sub: string, direction: -1 | 1) => {
    const subs = [...(pageSettings.subcategories[cat] || [])];
    const idx = subs.indexOf(sub);
    if (idx < 0) return;
    const newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= subs.length) return;
    [subs[idx], subs[newIdx]] = [subs[newIdx], subs[idx]];
    setPageSettings({
      ...pageSettings,
      subcategories: { ...pageSettings.subcategories, [cat]: subs },
    });
  };

  const ReorderArrows = ({
    onUp,
    onDown,
    disableUp,
    disableDown,
    compact,
  }: {
    onUp: () => void;
    onDown: () => void;
    disableUp: boolean;
    disableDown: boolean;
    compact?: boolean;
  }) => (
    <div className={`flex flex-col gap-0.5 shrink-0 ${compact ? '' : 'mr-0.5'}`}>
      <button
        type="button"
        disabled={disableUp}
        onClick={(e) => {
          e.stopPropagation();
          onUp();
        }}
        className={`admin-cat-order-btn ${compact ? 'w-6 h-6' : 'w-7 h-7'} flex items-center justify-center rounded-md border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-950 disabled:opacity-25 disabled:pointer-events-none transition-colors`}
        aria-label="Sposta su"
      >
        <ChevronUp className={compact ? 'w-3 h-3 stroke-[2]' : 'w-3.5 h-3.5 stroke-[2]'} />
      </button>
      <button
        type="button"
        disabled={disableDown}
        onClick={(e) => {
          e.stopPropagation();
          onDown();
        }}
        className={`admin-cat-order-btn ${compact ? 'w-6 h-6' : 'w-7 h-7'} flex items-center justify-center rounded-md border border-neutral-200 text-neutral-600 hover:border-neutral-400 hover:text-neutral-950 disabled:opacity-25 disabled:pointer-events-none transition-colors`}
        aria-label="Sposta giù"
      >
        <ChevronDown className={compact ? 'w-3 h-3 stroke-[2]' : 'w-3.5 h-3.5 stroke-[2]'} />
      </button>
    </div>
  );

  return (
    <div className="admin-categories-panel admin-categories-minimal max-w-3xl mx-auto pb-16 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
        <div>
          <h2 className="text-lg sm:text-xl font-light uppercase tracking-[0.22em] text-neutral-950">
            Categorie
          </h2>
          <p className="text-[11px] text-neutral-400 font-light mt-1 tracking-wide">
            {categories.length} categorie · struttura store
          </p>
        </div>
        <div className="categories-header-actions flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setIsAddingCategory(true)}
            className={`${ADMIN_BTN_PRIMARY} w-full sm:w-auto rounded-full`}
          >
            <Plus className="w-4 h-4" />
            Nuova categoria
          </button>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="w-4 h-4 text-neutral-300 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Cerca..."
          value={categoryFilterSearch}
          onChange={(e) => setCategoryFilterSearch(e.target.value)}
          className={`${ADMIN_INPUT} rounded-full pl-9 pr-9`}
        />
        {categoryFilterSearch && (
          <button
            type="button"
            onClick={() => setCategoryFilterSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-800"
            aria-label="Cancella ricerca"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isAddingCategory && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded-2xl space-y-3"
        >
          <input
            type="text"
            placeholder="Nome nuova categoria"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            className={ADMIN_INPUT}
            autoFocus
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                const trimmed = newCategoryName.trim();
                if (trimmed && !pageSettings.categories.includes(trimmed)) {
                  setPageSettings({
                    ...pageSettings,
                    categories: [...pageSettings.categories, trimmed],
                    subcategories: { ...pageSettings.subcategories, [trimmed]: [] },
                    categorySeo: {
                      ...pageSettings.categorySeo,
                      [trimmed]: {
                        metaTitle: `${trimmed} - Vincent Store`,
                        metaDescription: `Scopri ${trimmed} su Vincent Store.`,
                      },
                    },
                    categoryBanners: {
                      ...pageSettings.categoryBanners,
                      [trimmed]: { url: '', alt: '', title: '', link: '' },
                    },
                  });
                  setNewCategoryName('');
                  setIsAddingCategory(false);
                  addToast(`Categoria "${trimmed}" creata.`, 'success');
                }
              }}
              className={`${ADMIN_BTN_PRIMARY} flex-1`}
            >
              Salva
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingCategory(false);
                setNewCategoryName('');
              }}
              className={`${ADMIN_BTN_SECONDARY} sm:px-6`}
            >
              Annulla
            </button>
          </div>
        </motion.div>
      )}

      <ul className="divide-y divide-neutral-200/80 border-t border-neutral-200/80">
        {filtered.map((cat: string) => {
          const subcategories = pageSettings.subcategories[cat] || [];
          const expanded = isCategoryExpanded(cat);
          const hasSubs = subcategories.length > 0;
          const catIdx = pageSettings.categories.indexOf(cat);
          const canMoveCatUp = catIdx > 1;
          const canMoveCatDown =
            catIdx > 0 && catIdx < pageSettings.categories.length - 1;

          return (
            <li key={cat} className="bg-white">
              <div className="flex items-center gap-1 py-3.5 sm:py-4 flex-nowrap">
                {hasSubs || addingSubcategoryTo === cat ? (
                  <button
                    type="button"
                    onClick={() => toggleCategoryExpanded(cat)}
                    className="w-9 h-9 flex items-center justify-center text-neutral-400 hover:text-neutral-900 shrink-0 rounded-full hover:bg-neutral-100 transition-colors"
                    aria-expanded={expanded}
                    aria-label={expanded ? 'Comprimi sottocategorie' : 'Espandi sottocategorie'}
                  >
                    {expanded ? (
                      <ChevronDown className="w-4 h-4 stroke-[1.5]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 stroke-[1.5]" />
                    )}
                  </button>
                ) : (
                  <span className="w-9 shrink-0" aria-hidden />
                )}

                <ReorderArrows
                  onUp={() => moveCategory(cat, -1)}
                  onDown={() => moveCategory(cat, 1)}
                  disableUp={!canMoveCatUp}
                  disableDown={!canMoveCatDown}
                />

                <div className="flex-1 min-w-0">
                  {editingCategory === cat ? (
                    <div className="flex flex-col sm:flex-row gap-2 pr-2">
                      <input
                        type="text"
                        value={editCategoryValue}
                        onChange={(e) => setEditCategoryValue(e.target.value)}
                        className="flex-1 border border-neutral-300 rounded-lg px-3 py-2 text-sm font-light focus:outline-none focus:border-neutral-900"
                        autoFocus
                      />
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (editCategoryValue.trim() && editCategoryValue.trim() !== cat) {
                              const oldCat = cat;
                              const newCat = editCategoryValue.trim();
                              const newCats = pageSettings.categories.map((c: string) =>
                                c === oldCat ? newCat : c
                              );
                              const { [oldCat]: subs, ...restSubs } = pageSettings.subcategories;
                              const { [oldCat]: banner, ...restBanners } = pageSettings.categoryBanners;
                              const newBanners = banner
                                ? { ...restBanners, [newCat]: banner }
                                : pageSettings.categoryBanners;
                              setPageSettings({
                                ...pageSettings,
                                categories: newCats,
                                subcategories: { ...restSubs, [newCat]: subs || [] },
                                categoryBanners: newBanners,
                              });
                              setProducts(
                                products.map((p) =>
                                  p.category === oldCat ? { ...p, category: newCat } : p
                                )
                              );
                            }
                            setEditingCategory(null);
                          }}
                          className="w-9 h-9 rounded-lg bg-neutral-950 text-white flex items-center justify-center"
                          aria-label="Salva"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategory(null)}
                          className="w-9 h-9 rounded-lg border border-neutral-200 flex items-center justify-center text-neutral-500"
                          aria-label="Annulla"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => hasSubs && toggleCategoryExpanded(cat)}
                      className="text-left w-full group"
                    >
                      <span className="text-sm sm:text-base font-light uppercase tracking-[0.14em] text-neutral-900 group-hover:text-black">
                        {cat}
                      </span>
                      <span className="block text-[10px] text-neutral-400 font-light mt-0.5 tracking-wide">
                        {subcategories.length} sottocategorie · {getProductCount(cat)} prodotti
                      </span>
                    </button>
                  )}
                </div>

                {editingCategory !== cat && (
                  <div className="flex items-center gap-1 pr-1 shrink-0 flex-nowrap">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setEditCategoryValue(cat);
                      }}
                      className="admin-cat-btn-edit w-11 h-11 md:w-9 md:h-9 rounded-lg flex items-center justify-center border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors"
                      aria-label="Modifica categoria"
                    >
                      <Edit2 className="w-4 h-4 stroke-[1.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => confirmDeleteCategory(cat)}
                      className="admin-cat-btn-delete w-11 h-11 md:w-9 md:h-9 rounded-lg flex items-center justify-center border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition-colors"
                      aria-label="Elimina categoria"
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.5]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAddingSubcategoryTo(cat);
                        setCollapsedCategories((prev) => ({ ...prev, [cat]: false }));
                      }}
                      className="w-11 h-11 md:w-9 md:h-9 rounded-lg flex items-center justify-center border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 transition-colors"
                      aria-label="Aggiungi sottocategoria"
                    >
                      <Plus className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  </div>
                )}
              </div>

              {expanded && (
                <div className="pb-4 pl-10 sm:pl-11 pr-2 space-y-1">
                  {addingSubcategoryTo === cat && (
                    <div className="flex flex-col sm:flex-row gap-2 mb-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                      <input
                        type="text"
                        placeholder="Nome sottocategoria"
                        value={newSubcategoryName}
                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                        className="flex-1 bg-white border border-neutral-200 rounded-lg px-3 py-2 text-sm font-light"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const trimmed = newSubcategoryName.trim();
                            if (trimmed && !pageSettings.subcategories[cat]?.includes(trimmed)) {
                              setPageSettings({
                                ...pageSettings,
                                subcategories: {
                                  ...pageSettings.subcategories,
                                  [cat]: [...(pageSettings.subcategories[cat] || []), trimmed],
                                },
                              });
                              setNewSubcategoryName('');
                              setAddingSubcategoryTo(null);
                              addToast(`Sottocategoria "${trimmed}" aggiunta.`, 'success');
                            }
                          }}
                          className="px-4 py-2 rounded-lg bg-neutral-950 text-white text-[10px] uppercase tracking-widest"
                        >
                          Salva
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingSubcategoryTo(null);
                            setNewSubcategoryName('');
                          }}
                          className="px-3 py-2 rounded-lg border border-neutral-200 text-[10px] uppercase tracking-widest text-neutral-500"
                        >
                          Annulla
                        </button>
                      </div>
                    </div>
                  )}

                  {subcategories.map((sub: string, sIdx: number) => (
                    <div
                      key={sub}
                      className="flex items-center gap-2 py-2.5 pl-1 border-l border-neutral-200 flex-nowrap"
                    >
                      <ReorderArrows
                        compact
                        onUp={() => moveSubcategory(cat, sub, -1)}
                        onDown={() => moveSubcategory(cat, sub, 1)}
                        disableUp={sIdx === 0}
                        disableDown={sIdx >= subcategories.length - 1}
                      />
                      <div className="flex-1 min-w-0 pl-1">
                        {editingSubcategory?.category === cat && editingSubcategory?.subcategory === sub ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={editSubcategoryValue}
                              onChange={(e) => setEditSubcategoryValue(e.target.value)}
                              className="flex-1 border border-neutral-300 rounded-lg px-3 py-1.5 text-sm font-light"
                              autoFocus
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (editSubcategoryValue.trim() && editSubcategoryValue.trim() !== sub) {
                                  const oldSub = sub;
                                  const newSub = editSubcategoryValue.trim();
                                  const newSubs = pageSettings.subcategories[cat].map((s: string) =>
                                    s === oldSub ? newSub : s
                                  );
                                  setPageSettings({
                                    ...pageSettings,
                                    subcategories: { ...pageSettings.subcategories, [cat]: newSubs },
                                  });
                                  setProducts(
                                    products.map((p) =>
                                      p.category === cat && p.subcategory === oldSub
                                        ? { ...p, subcategory: newSub }
                                        : p
                                    )
                                  );
                                }
                                setEditingSubcategory(null);
                              }}
                              className="w-8 h-8 rounded-lg bg-neutral-950 text-white flex items-center justify-center"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingSubcategory(null)}
                              className="w-8 h-8 rounded-lg border border-neutral-200 flex items-center justify-center"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <p className="text-xs font-light uppercase tracking-[0.12em] text-neutral-700">{sub}</p>
                            <p className="text-[10px] text-neutral-400">{getProductCount(cat, sub)} prodotti</p>
                          </>
                        )}
                      </div>
                      {!(
                        editingSubcategory?.category === cat && editingSubcategory?.subcategory === sub
                      ) && (
                        <div className="flex items-center gap-1 shrink-0 flex-nowrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingSubcategory({ category: cat, subcategory: sub });
                              setEditSubcategoryValue(sub);
                            }}
                            className="admin-cat-btn-edit w-8 h-8 rounded-lg flex items-center justify-center border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50"
                            aria-label="Modifica sottocategoria"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => confirmDeleteSubcategory(cat, sub)}
                            className="admin-cat-btn-delete w-8 h-8 rounded-lg flex items-center justify-center border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                            aria-label="Elimina sottocategoria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {subcategories.length === 0 && addingSubcategoryTo !== cat && (
                    <p className="text-[11px] text-neutral-400 font-light py-2 pl-3 border-l border-neutral-200">
                      Nessuna sottocategoria — usa + per aggiungerne una.
                    </p>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {filtered.length === 0 && (
        <p className="text-center text-sm text-neutral-400 font-light py-12">Nessuna categoria trovata.</p>
      )}
    </div>
  );
}
