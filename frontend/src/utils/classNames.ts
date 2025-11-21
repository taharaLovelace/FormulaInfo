import { clsx, type ClassValue } from 'clsx';

export function classNames(...classes: ClassValue[]): string {
  return clsx(classes);
}