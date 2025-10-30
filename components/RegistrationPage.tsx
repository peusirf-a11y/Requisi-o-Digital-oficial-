import React from 'react';
import { Role, Turno } from '../types';
import { DEPARTMENTS } from '../constants';
import { ShieldIcon } from './Icons';

interface RegistrationPageProps {
  onNavigateToLogin: () => void;
  logoUrl: string | null;
}

export default function RegistrationPage({ onNavigateToLogin, logoUrl }: RegistrationPageProps) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <div className="flex justify-center items-center gap-4 mb-4">
                 {logoUrl ? (
                    <img src={logoUrl} alt="Logo da Empresa" className="h-12 w-auto" />
                ) : (
                    <ShieldIcon className="h-12 w-12 text-blue-600" />
                )}
            </div>
            <h2 className="text-3xl font-bold text-gray-800">Cadastro Desabilitado</h2>
            <p className="text-gray-500 mt-4">O cadastro de novos usuários está desabilitado no modo de demonstração offline.</p>
             <button onClick={onNavigateToLogin} type="button" className="mt-8 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300">
                Voltar para o Login
            </button>
          </div>
        </div>
    );
}