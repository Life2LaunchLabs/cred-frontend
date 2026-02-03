import * as React from 'react';

export interface SidebarContextValue {
  expandedItemIds: string[];
  toggleExpanded: (id: string) => void;
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export default SidebarContext;
