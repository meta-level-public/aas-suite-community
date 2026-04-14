import { FilterMatchMode } from 'primeng/api';

export interface Column {
  field: string;
  header: string;
  columnTemplate: string;
  sortable: boolean;
  filterable: boolean;
  matchMode: FilterMatchMode;
  label: string;
  reorderable: boolean;
  width?: string;
}

const STORAGE_KEY_PAGE_SIZE = 'shells-list-footer-state';
const DEFAULT_PAGE_SIZE = 10;

export const SHELLS_LIST_PAGE_OPTIONS = [1, 5, 10, 20, 50, 100];

const THUMBNAIL_COLUMN: Column = {
  field: 'thumbnail',
  header: '',
  label: 'THUMBNAIL',
  columnTemplate: 'thumbnail',
  sortable: false,
  filterable: false,
  matchMode: FilterMatchMode.CONTAINS,
  reorderable: true,
  width: '80px',
};

const ID_COLUMN: Column = {
  field: 'id',
  header: 'ID',
  label: 'ID',
  columnTemplate: 'string',
  sortable: true,
  filterable: true,
  matchMode: FilterMatchMode.CONTAINS,
  reorderable: true,
  width: '250px',
};

const ID_SHORT_COLUMN: Column = {
  field: 'idShort',
  header: 'ID_SHORT',
  label: 'ID_SHORT',
  columnTemplate: 'string',
  sortable: true,
  filterable: true,
  matchMode: FilterMatchMode.CONTAINS,
  reorderable: true,
};

const GLOBAL_ASSET_ID_COLUMN: Column = {
  field: 'globalAssetId',
  header: 'GLOBAL_ASSET_ID',
  label: 'GLOBAL_ASSET_ID',
  columnTemplate: 'string',
  sortable: true,
  filterable: true,
  matchMode: FilterMatchMode.CONTAINS,
  reorderable: true,
};

const SUBMODELS_COLUMN: Column = {
  field: 'containedSubmodels',
  header: 'SUBMODELS',
  label: 'SUBMODELS',
  columnTemplate: 'submodels',
  sortable: false,
  filterable: false,
  matchMode: FilterMatchMode.CONTAINS,
  reorderable: true,
};

const PRODUCT_DESIGNATION_COLUMN: Column = {
  field: 'productDesignation',
  header: 'PRODUCT_DESIGNATION',
  label: 'PRODUCT_DESIGNATION',
  columnTemplate: 'productDesignation',
  sortable: true,
  filterable: true,
  matchMode: FilterMatchMode.CONTAINS,
  reorderable: true,
};

const KIND_COLUMN: Column = {
  field: 'assetKind',
  header: 'ASSET_KIND',
  label: 'ASSET_KIND',
  columnTemplate: 'tag',
  sortable: true,
  filterable: true,
  matchMode: FilterMatchMode.CONTAINS,
  reorderable: true,
};

export const SHELLS_LIST_COLUMNS: Column[] = [
  THUMBNAIL_COLUMN,
  ID_COLUMN,
  ID_SHORT_COLUMN,
  GLOBAL_ASSET_ID_COLUMN,
  SUBMODELS_COLUMN,
  PRODUCT_DESIGNATION_COLUMN,
  KIND_COLUMN,
];

export const SHELLS_LIST_DEFAULT_COLUMNS: Column[] = [
  THUMBNAIL_COLUMN,
  ID_COLUMN,
  ID_SHORT_COLUMN,
  GLOBAL_ASSET_ID_COLUMN,
  KIND_COLUMN,
];

export function readShellsListPageSize(): number {
  const page = window.localStorage.getItem(STORAGE_KEY_PAGE_SIZE);
  if (page == null || page === '') {
    return DEFAULT_PAGE_SIZE;
  }

  const parsedPage = parseInt(page, 10);
  return parsedPage > 0 ? parsedPage : DEFAULT_PAGE_SIZE;
}

export function writeShellsListPageSize(pageSize: number): void {
  window.localStorage.setItem(STORAGE_KEY_PAGE_SIZE, pageSize.toString());
}
