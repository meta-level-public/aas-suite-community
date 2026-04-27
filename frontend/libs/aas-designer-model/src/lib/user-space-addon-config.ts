import { InjectionToken } from '@angular/core';
import { Routes } from '@angular/router';
import { TreeNode } from 'primeng/api';

export const ADDITIONAL_USER_SPACE_MENU_ITEMS = new InjectionToken<TreeNode[]>('ADDITIONAL_USER_SPACE_MENU_ITEMS', {
  providedIn: 'root',
  factory: () => [],
});

export const ADDITIONAL_USER_SPACE_ROUTES = new InjectionToken<Routes>('ADDITIONAL_USER_SPACE_ROUTES', {
  providedIn: 'root',
  factory: () => [],
});
