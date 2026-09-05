/**
 * @deprecated FilterPanel (sidebar) is retired in favor of FilterModal.
 * This file re-exports FilterState and FilterModal for backwards compatibility.
 */
export type { FilterState, FilterModalProps } from './FilterModal';
export { FilterModal, FilterModal as FilterPanel } from './FilterModal';
