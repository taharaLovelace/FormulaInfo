'use client';

import { Fragment } from 'react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  UserPlusIcon,
  Cog6ToothIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import useAuthStore from '../../stores/auth.store';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

export default function AuthHeader() {
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Marca como hidratado após um pequeno delay
    const timer = setTimeout(() => {
      setIsHydrated(true);
    }, 100);

    // Timeout de segurança - força hidratação após 2 segundos
    const safetyTimer = setTimeout(() => {
      setIsHydrated(true);
    }, 2000);

    return () => {
      clearTimeout(timer);
      clearTimeout(safetyTimer);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logout realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer logout');
    }
  };

  if (!isHydrated || isLoading) {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Link
          href="/auth/login"
          className="text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Entrar
        </Link>
        <Link
          href="/auth/register"
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
        >
          <UserPlusIcon className="h-4 w-4 mr-2" />
          Criar conta
        </Link>
      </div>
    );
  }

  return (
    <Menu as="div" className="relative">
      <Menu.Button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
        <span className="sr-only">Abrir menu do usuário</span>
        <div className="flex items-center space-x-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">@{user?.username}</span>
          </div>
          <UserCircleIcon className="h-8 w-8 text-gray-400 dark:text-gray-300" />
        </div>
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-gray-800 py-1 shadow-lg ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10 focus:outline-none">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/profile"
                className={clsx(
                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                  'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                )}
              >
                <UserIcon className="h-4 w-4 mr-3" />
                Meu perfil
              </Link>
            )}
          </Menu.Item>
          
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/settings"
                className={clsx(
                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                  'flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                )}
              >
                <Cog6ToothIcon className="h-4 w-4 mr-3" />
                Configurações
              </Link>
            )}
          </Menu.Item>
          
          <hr className="my-1" />
          
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={handleLogout}
                className={clsx(
                  active ? 'bg-gray-100 dark:bg-gray-700' : '',
                  'flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200'
                )}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                Sair
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}