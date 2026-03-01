export type User = {
  id: string;
  name: string;
  email: string;
  affiliation: string;
  isBlocked: boolean;
  avatar: string;
};

export type Visit = {
  id: string;
  userId: string;
  date: string;
  purposes: string[];
};

export type DailyStats = {
  date: string;
  visitors: number;
};
