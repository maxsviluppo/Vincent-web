import React, { useState } from "react";
import { 
  Star,
  Search, 
  Filter, 
  RefreshCw,
  CheckCircle2, 
  XCircle, 
  MessageSquare,
  Clock, 
  Eye,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  History,
  Tag
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PRODUCTS } from "./data";

interface Review {
    id: string;
    productId: string;
    orderId: string;
    customerName: string;
    rating: number;
    comment: string;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
}

interface AdminReviewsProps {
    reviews: Review[];
    setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
}

export const AdminReviews = ({ reviews, setReviews }: AdminReviewsProps) => {
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<Review['status'] | 'all'>('all');

    const filteredReviews = reviews.filter(r => {
        const matchesFilter = filter === 'all' || r.status === filter;
        const matchesSearch = r.customerName.toLowerCase().includes(search.toLowerCase()) || 
                              r.orderId.toLowerCase().includes(search.toLowerCase()) ||
                              r.comment.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const updateStatus = (id: string, status: Review['status']) => {
        setReviews(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        if (selectedReview?.id === id) {
            setSelectedReview(prev => prev ? { ...prev, status } : null);
        }
    };

    const deleteReview = (id: string) => {
        if (window.confirm("Sei sicuro di voler eliminare permanentemente questa recensione?")) {
            setReviews(prev => prev.filter(r => r.id !== id));
            setSelectedReview(null);
        }
    };

    const getStatusStyle = (status: Review['status']) => {
        switch(status) {
            case 'pending': return "bg-orange-100 text-orange-600 border-orange-200";
            case 'approved': return "bg-green-100 text-green-600 border-green-200";
            case 'rejected': return "bg-red-100 text-red-600 border-red-200";
            default: return "bg-gray-50 text-gray-400";
        }
    };

    const getProductInfo = (productId: string) => {
        return PRODUCTS.find(p => p.id === productId);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="mb-2">
                <h2 className="text-3xl font-black text-brand-dark uppercase tracking-tighter">Moderazione Recensioni</h2>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Valuta, approva o rifiuta i feedback dei clienti</p>
            </div>

            {/* Filter Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">In Attesa</p>
                        <p className="text-2xl font-black text-orange-500">{reviews.filter(r => r.status === 'pending').length}</p>
                    </div>
                    <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
                        <Clock className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Approvate</p>
                        <p className="text-2xl font-black text-green-500">{reviews.filter(r => r.status === 'approved').length}</p>
                    </div>
                    <div className="p-4 bg-green-50 text-green-500 rounded-2xl">
                        <ThumbsUp className="w-6 h-6" />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between shadow-sm">
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Rifiutate</p>
                        <p className="text-2xl font-black text-red-500">{reviews.filter(r => r.status === 'rejected').length}</p>
                    </div>
                    <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
                        <ThumbsDown className="w-6 h-6" />
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex bg-gray-100 p-1.5 rounded-2xl border border-gray-200 w-fit">
                {['all', 'pending', 'approved', 'rejected'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-brand-dark shadow-sm' : 'text-gray-400 hover:text-brand-dark'}`}
                    >
                        {f === 'all' ? 'Tutte' : f === 'pending' ? 'Da Moderare' : f === 'approved' ? 'Pubblicate' : 'Cestinate'}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/30">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 w-5 h-5" />
                        <input 
                            type="text" 
                            placeholder="Cerca per cliente, ordine o commento..." 
                            className="w-full pl-12 pr-4 py-4 bg-white border-transparent rounded-2xl text-sm font-bold focus:ring-4 focus:ring-brand-yellow/20 transition-all font-mono"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="px-6 py-4 bg-brand-dark text-brand-yellow rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-brand-yellow hover:text-brand-dark transition-all flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Aggiorna
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 bg-brand-dark text-brand-yellow italic">
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest pl-10 border-r border-white/5">Data / Ordine</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest border-r border-white/5">Cliente</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest border-r border-white/5">Rating</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest border-r border-white/5">Prodotto</th>
                                <th className="p-6 text-[10px] font-black uppercase tracking-widest border-r border-white/5 text-center">Stato</th>
                                <th className="p-6 text-right">Azioni</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 italic">
                            {filteredReviews.map(rev => (
                                <tr key={rev.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-6 pl-10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                                            <div>
                                                <p className="font-black text-brand-dark text-sm tracking-tighter">{rev.orderId}</p>
                                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{rev.date}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <p className="font-black text-brand-dark text-sm leading-tight">{rev.customerName}</p>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-1">
                                            {[1,2,3,4,5].map(s => (
                                                <Star key={s} className={`w-3 h-3 ${s <= rev.rating ? 'fill-brand-yellow text-brand-yellow' : 'text-gray-200'}`} />
                                            ))}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="text-[10px] font-black text-brand-dark uppercase truncate block max-w-[200px]">
                                            {getProductInfo(rev.productId)?.name || "Prodotto ignorato"}
                                        </span>
                                    </td>
                                    <td className="p-6 text-center">
                                        <span className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(rev.status)}`}>
                                            {rev.status === 'pending' ? 'Pendente' : rev.status === 'approved' ? 'Approvata' : 'Rifiutata'}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex justify-end gap-2">
                                            {rev.status === 'pending' && (
                                                <>
                                                    <button 
                                                        onClick={() => updateStatus(rev.id, 'approved')}
                                                        className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all border border-green-100"
                                                        title="Approva"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => updateStatus(rev.id, 'rejected')}
                                                        className="p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all border border-red-100"
                                                        title="Rifiuta"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => setSelectedReview(rev)}
                                                className="p-3 bg-brand-yellow text-brand-dark rounded-xl hover:scale-110 active:scale-95 transition-all shadow-md"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredReviews.length === 0 && (
                        <div className="p-20 text-center flex flex-col items-center">
                            <MessageSquare className="w-12 h-12 text-gray-200 mb-4" />
                            <p className="text-lg font-black text-brand-dark tracking-tighter uppercase">Nessuna recensione trovata</p>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Prova a cambiare filtri o termini di ricerca</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Overlay */}
            <AnimatePresence>
                {selectedReview && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedReview(null)}
                            className="fixed inset-0 bg-brand-dark/40 backdrop-blur-md z-[100]"
                        />
                        <motion.div 
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
                            className="fixed top-0 right-0 bottom-0 w-full max-w-xl bg-white z-[110] border-l border-gray-100 flex flex-col shadow-2xl"
                        >
                            <div className="p-8 bg-brand-dark text-brand-yellow flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Recensione su Ordine {selectedReview.orderId}</p>
                                    <h2 className="text-3xl font-black tracking-tighter uppercase">Dettagli Feedback</h2>
                                </div>
                                <button 
                                    onClick={() => setSelectedReview(null)}
                                    className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all"
                                >
                                    <XCircle className="w-6 h-6 text-white" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar italic font-sans">
                                {/* Comment Card */}
                                <div className="space-y-4">
                                     <div className="flex items-center gap-2 mb-2">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} className={`w-8 h-8 ${s <= selectedReview.rating ? 'fill-brand-yellow text-brand-yellow' : 'text-gray-200'}`} />
                                        ))}
                                        <span className="text-lg font-black text-brand-dark ml-2 uppercase">{selectedReview.rating}/5</span>
                                    </div>
                                    <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-gray-100 relative">
                                        <MessageSquare className="absolute -top-4 -left-4 w-12 h-12 text-brand-yellow fill-white" />
                                        <p className="text-lg font-bold text-brand-dark leading-relaxed">
                                            "{selectedReview.comment || "Nessun commento testuale inserito."}"
                                        </p>
                                        <div className="mt-8 flex items-center gap-4 border-t border-gray-100 pt-6">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 text-brand-dark font-black">
                                                {selectedReview.customerName.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-black text-brand-dark">{selectedReview.customerName}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedReview.date}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Product Context */}
                                <div className="bg-white p-6 rounded-[2rem] border border-gray-100">
                                    <div className="flex items-center gap-2 text-brand-dark mb-4">
                                        <Tag className="w-4 h-4" />
                                        <h3 className="text-[10px] font-black uppercase tracking-widest">Prodotto Recensito</h3>
                                    </div>
                                    <div className="flex gap-6">
                                        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white border border-gray-100 shrink-0 p-2">
                                            <img src={getProductInfo(selectedReview.productId)?.image} className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex flex-col justify-center">
                                            <p className="font-black text-brand-dark text-lg leading-tight mb-1">{getProductInfo(selectedReview.productId)?.name}</p>
                                            <p className="text-xs font-bold text-brand-dark/40">SKU: BP-{selectedReview.productId.padStart(4, '0')}</p>
                                            <p className="text-xl font-black text-brand-dark mt-2">€{getProductInfo(selectedReview.productId)?.price.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Info */}
                                <div className={`p-6 rounded-[2rem] border-2 flex items-center gap-4 ${getStatusStyle(selectedReview.status)}`}>
                                    <AlertTriangle className="w-6 h-6" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Stato Attuale</p>
                                        <p className="text-sm font-black uppercase">{selectedReview.status === 'pending' ? 'In attesa di moderazione' : selectedReview.status === 'approved' ? 'Approvata e Pubblicata' : 'Rifiutata e Nascosta'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-8 bg-white border-t border-gray-100 grid grid-cols-2 gap-4">
                                <button 
                                    onClick={() => updateStatus(selectedReview.id, 'rejected')}
                                    disabled={selectedReview.status === 'rejected'}
                                    className="py-4 bg-red-50 text-red-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-500 hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-red-50 disabled:hover:text-red-600"
                                >
                                    Rifiuta Recensione
                                </button>
                                <button 
                                    onClick={() => updateStatus(selectedReview.id, 'approved')}
                                    disabled={selectedReview.status === 'approved'}
                                    className="py-4 bg-brand-dark text-brand-yellow rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:hover:bg-brand-dark disabled:hover:text-brand-yellow"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Approva & Pubblica
                                </button>
                                <button 
                                    onClick={() => deleteReview(selectedReview.id)}
                                    className="col-span-2 py-3 bg-gray-50 text-gray-400 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 hover:text-red-500 transition-all mt-2"
                                >
                                    Elimina Definitivamente
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};
