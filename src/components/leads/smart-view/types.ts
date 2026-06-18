import React from "react";

export interface SmartViewConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  color: string;
  filterFn: (l: any) => boolean;
}

export interface SmartFilters {
  search: string;
  stage: string;
  source: string;
  owner: string;
  app: string;
  level: string;
  activity: string;
}
