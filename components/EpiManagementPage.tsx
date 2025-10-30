import React, { useState, useMemo, useEffect } from 'react';
import { EPIItem, EpiVariant } from '../types';
import * as Icons from './Icons';
import { EPI_CATALOG } from '../constants';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

// Modal for adding/editing EPI items
const EpiModal = ({ isOpen, onClose, onSave, epiToEdit }: { isOpen: boolean, onClose: () => void, onSave: (item: Partial<EPIItem>, variants: EpiVariant[], imageFile?: File | null) => void, epiToEdit: EPIItem | null }) => {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        category: '',
        type: '',
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [variants, setVariants] = useState<EpiVariant[]>([{ code: '', size: 'Único' }]);

    useEffect(() => {
        if (isOpen) {
            if (epiToEdit) {
                setFormData({
                    name: epiToEdit.name,
                    code: epiToEdit.code,
                    category: epiToEdit.category,
                    type: epiToEdit.type,
                });
                setImagePreview(epiToEdit.imageUrl);
                setVariants(epiToEdit.variants.length > 0 ? [...epiToEdit.variants] : [{ code: '', size: 'Único' }]);
            } else {
                setFormData({ name: '', code: '', category: '', type: '' });
                setImagePreview(null);
                setVariants([{ code: '', size: 'Único' }]);
            }
            setSelectedFile(null);
        }
    }, [epiToEdit, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };
    
    const handleVariantChange = (index: number, field: keyof EpiVariant, value: string) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    };

    const addVariant = () => {
        setVariants([...variants, { code: '', size: '' }]);
    };

    const removeVariant = (index: number) => {
        if (variants.length > 1) {
            setVariants(variants.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const itemData: Partial<EPIItem> = {
            id: epiToEdit?.id,
            ...formData,
        };
        onSave(itemData, variants.filter(v => v.size.trim() && v.code.trim()), selectedFile);
        onClose();
    };

    const canSave = formData.name.trim() !== '' && formData.code.trim() !== '' && formData.category.trim() !== '' && variants.every(v => v.size.trim() && v.code.trim());

    if (!isOpen) return null;

    const inputStyle = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500";
    const primaryBtnStyle = "bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400";
    const secondaryBtnStyle = "bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold text-gray-800 mb-4">{epiToEdit ? 'Editar EPI' : 'Adicionar Novo EPI'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Equipamento</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={inputStyle} required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Imagem do Equipamento</label>
                        <div className="mt-2 flex items-center gap-4">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded-md object-cover" />
                            ) : (
                                <div className="w-20 h-20 rounded-md bg-gray-100 flex items-center justify-center">
                                    <Icons.PhotoIcon className="w-10 h-10 text-gray-400" />
                                </div>
                            )}
                            <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={handleFileChange} />
                            <label htmlFor="file-upload" className="cursor-pointer rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                Alterar
                            </label>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium text-gray-700">Código de Referência / CA</label>
                        <input type="text" name="code" id="code" value={formData.code} onChange={handleChange} className={inputStyle} required />
                    </div>
                     <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
                        <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} className={inputStyle} required />
                    </div>
                    <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Tipo</label>
                        <input type="text" name="type" id="type" value={formData.type} onChange={handleChange} className={inputStyle} />
                    </div>
                    <div className="space-y-2 border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700">Tamanhos / Variações</label>
                        {variants.map((variant, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    placeholder="Tamanho (ex: P, 38)"
                                    value={variant.size}
                                    onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                                    className={`${inputStyle} mt-0`}
                                />
                                <input
                                    type="text"
                                    placeholder="Código Específico"
                                    value={variant.code}
                                    onChange={(e) => handleVariantChange(index, 'code', e.target.value)}
                                    className={`${inputStyle} mt-0`}
                                />
                                <button
                                    type="button"
                                    onClick={() => removeVariant(index)}
                                    disabled={variants.length === 1}
                                    className="p-2 text-red-500 hover:text-red-700 disabled:text-gray-300 disabled:cursor-not-allowed"
                                >
                                    <Icons.TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addVariant}
                            className="text-sm text-blue-600 hover:underline font-semibold"
                        >
                            + Adicionar Variação
                        </button>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={onClose} className={secondaryBtnStyle}>Cancelar</button>
                        <button type="submit" disabled={!canSave} className={primaryBtnStyle}>Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, itemName }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, itemName: string }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                 <h2 className="text-xl font-bold text-gray-800 mb-2">Confirmar Exclusão</h2>
                 <p className="text-gray-600 mb-4">Tem certeza que deseja excluir o item <span className="font-semibold">{itemName}</span>? Esta ação não pode ser desfeita.</p>
                 <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-300">Cancelar</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white font-bold py-2 px-4 rounded-md hover:bg-red-700">Confirmar Exclusão</button>
                 </div>
            </div>
        </div>
    );
};


export default function EpiManagementPage() {
    const [epiItems, setEpiItems] = useState<EPIItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [epiToEdit, setEpiToEdit] = useState<EPIItem | null>(null);
    const [epiToDelete, setEpiToDelete] = useState<EPIItem | null>(null);
    
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setEpiItems(EPI_CATALOG);
            setLoading(false);
        }, 300);
    }, []);

    const filteredEpiItems = useMemo(() => {
        if (!searchTerm) return epiItems;
        return epiItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [epiItems, searchTerm]);

    const handleOpenModal = (item: EPIItem | null) => {
        setEpiToEdit(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEpiToEdit(null);
    };

    const handleSaveEpi = async (itemData: Partial<EPIItem>, variants: EpiVariant[], imageFile?: File | null) => {
        let imageUrl = epiToEdit?.imageUrl || 'https://i.imgur.com/K7pZgV0.png'; // Default image

        if (imageFile) {
            imageUrl = await fileToBase64(imageFile);
        }

        if (epiToEdit) { // Update existing item
             setEpiItems(prev => prev.map(item => {
                if (item.id === epiToEdit.id) {
                    return { ...item, ...itemData, imageUrl, variants, id: epiToEdit.id };
                }
                return item;
            }));

        } else { // Create new item
            const newItem: EPIItem = {
                id: `epi${Date.now()}`,
                name: itemData.name!,
                code: itemData.code!,
                imageUrl,
                category: itemData.category!,
                type: itemData.type!,
                variants,
            };
            setEpiItems(prev => [newItem, ...prev]);
        }
    };
    
    const handleOpenDeleteConfirm = (item: EPIItem) => {
        setEpiToDelete(item);
    };

    const handleCloseDeleteConfirm = () => {
        setEpiToDelete(null);
    };
    
    const handleDeleteEpi = async () => {
        if (!epiToDelete) return;
        setEpiItems(prev => prev.filter(i => i.id !== epiToDelete.id));
        handleCloseDeleteConfirm();
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Catálogo de EPIs</h1>
                <button 
                    onClick={() => handleOpenModal(null)}
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                    <Icons.PlusCircleIcon className="w-5 h-5" />
                    Adicionar EPI
                </button>
            </div>

            <div className="mb-4">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icons.SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por nome, código ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Desktop View */}
                <div className="overflow-x-auto hidden md:block">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Equipamento</th>
                                <th scope="col" className="px-6 py-3">Código/CA</th>
                                <th scope="col" className="px-6 py-3">Categoria</th>
                                <th scope="col" className="px-6 py-3">Tamanhos</th>
                                <th scope="col" className="px-6 py-3 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                             {loading ? (
                                <tr><td colSpan={5} className="text-center py-10">Carregando catálogo...</td></tr>
                            ) : filteredEpiItems.map((item) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <img src={item.imageUrl} alt={item.name} className="w-12 h-12 rounded-md object-cover"/>
                                            <span className="font-medium text-gray-900">{item.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{item.code}</td>
                                    <td className="px-6 py-4">{item.category}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-wrap gap-1">
                                            {item.variants.map(v => (
                                                <span key={v.code} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{v.size}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end items-center gap-4">
                                            <button onClick={() => handleOpenModal(item)} className="text-gray-500 hover:text-blue-600" aria-label={`Editar ${item.name}`}>
                                                <Icons.PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button onClick={() => handleOpenDeleteConfirm(item)} className="text-gray-500 hover:text-red-600" aria-label={`Excluir ${item.name}`}>
                                                <Icons.TrashIcon className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className="md:hidden divide-y divide-gray-200">
                     {loading ? (
                        <div className="text-center py-10">Carregando catálogo...</div>
                    ) : filteredEpiItems.map((item) => (
                        <div key={item.id} className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-md object-cover"/>
                                    <div>
                                        <p className="font-bold text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.code}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleOpenModal(item)} className="text-gray-500 hover:text-blue-600 p-2" aria-label={`Editar ${item.name}`}>
                                        <Icons.PencilSquareIcon className="w-5 h-5" />
                                    </button>
                                    <button onClick={() => handleOpenDeleteConfirm(item)} className="text-gray-500 hover:text-red-600 p-2" aria-label={`Excluir ${item.name}`}>
                                        <Icons.TrashIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                             <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-xs text-gray-500">Categoria</p>
                                    <p className="font-medium text-gray-800">{item.category}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Tamanhos</p>
                                     <div className="flex flex-wrap gap-1 mt-1">
                                        {item.variants.map(v => (
                                            <span key={v.code} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{v.size}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            <EpiModal 
                isOpen={isModalOpen} 
                onClose={handleCloseModal} 
                onSave={handleSaveEpi} 
                epiToEdit={epiToEdit} 
            />
            
            <DeleteConfirmModal 
                isOpen={!!epiToDelete}
                onClose={handleCloseDeleteConfirm}
                onConfirm={handleDeleteEpi}
                itemName={epiToDelete?.name || ''}
            />
        </div>
    );
}