import type { OrderStatus } from '../../shared/types';

type StatusFilter = OrderStatus | 'all';

const STATUSES: StatusFilter[] = ['all', 'draft', 'paid', 'priority', 'shipped', 'refunded'];

interface FilterBarProps {
  status: StatusFilter;
  query: string;
  onStatusChange: (status: StatusFilter) => void;
  onQueryChange: (query: string) => void;
}

export function FilterBar(props: FilterBarProps) {
  return (
    <form role="search" onSubmit={(e) => e.preventDefault()}>
      <label>
        Filter by status
        <select value={props.status} onChange={(e) => props.onStatusChange(e.target.value as StatusFilter)}>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>
      <input
        type="search"
        placeholder="Search products"
        value={props.query}
        onChange={(e) => props.onQueryChange(e.target.value)}
      />
    </form>
  );
}
