import React, { useState } from 'react';
import * as Icons from './Icons';

interface SettingsPageProps {
    currentLogoUrl: string | null;
    onUpdateLogo: (logoUrl: string | null) => void;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export default function SettingsPage({ currentLogoUrl, onUpdateLogo }: SettingsPageProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleSaveLogo = async () => {
        if (selectedFile) {
            const base64 = await fileToBase64(selectedFile);
            onUpdateLogo(base64);
            alert('Logo salvo com sucesso!');
        }
        setImagePreview(null);
        setSelectedFile(null);
    };

    const handleRemoveLogo = () => {
        onUpdateLogo(null);
        setImagePreview(null);
        setSelectedFile(null);
        alert('Logo removido com sucesso!');
    };
    
    const displayLogo = imagePreview || currentLogoUrl;

    return (
        <div className="p-6 bg-gray-50 min-h-full">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Configurações Gerais</h1>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl">
                <h3 className="text-xl font-semibold leading-7 text-gray-900">Personalização da Marca</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Faça o upload do logo da sua empresa.</p>

                <div className="mt-6 border-t border-gray-100 pt-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                        <div className="w-32 h-32 flex-shrink-0 rounded-md border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                            {displayLogo ? (
                                <img src={displayLogo} alt="Logo preview" className="h-full w-full object-contain p-2" />
                            ) : (
                                <Icons.PhotoIcon className="w-12 h-12 text-gray-400" />
                            )}
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm text-gray-600 mb-3">
                                Selecione um arquivo de imagem (PNG, JPG, SVG) com no máximo 5MB.
                            </p>
                            <div className="flex flex-wrap items-center gap-3">
                                <input type="file" id="logo-upload" className="hidden" accept="image/png, image/jpeg, image/svg+xml" onChange={handleFileChange} />
                                <label htmlFor="logo-upload" className="cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                                    {selectedFile ? 'Alterar Imagem' : 'Carregar Logo'}
                                </label>
                                {currentLogoUrl && !selectedFile && (
                                    <button onClick={handleRemoveLogo} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 rounded-md hover:bg-red-50">
                                        <Icons.TrashIcon className="w-4 h-4" />
                                        Remover Logo
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    {selectedFile && (
                        <div className="mt-6 border-t pt-4 flex justify-end gap-3">
                             <button onClick={() => { setSelectedFile(null); setImagePreview(null); }} className="bg-gray-200 text-gray-800 font-semibold px-4 py-2 rounded-lg hover:bg-gray-300 text-sm">
                                Cancelar
                            </button>
                            <button onClick={handleSaveLogo} className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
                                Salvar Logo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}