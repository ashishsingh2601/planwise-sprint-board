
export interface User {
  id: string;
  name: string;
  isHost: boolean;
  avatar?: string;
}

export interface Issue {
  id: string;
  key: string;
  title: string;
  description?: string;
  estimation?: number;
}

export interface Vote {
  userId: string;
  issueId: string;
  value: number;
}

export interface Room {
  id: string;
  name?: string;
  participants: User[];
  issues: Issue[];
  currentIssueId?: string;
  votes: Vote[];
  revealVotes: boolean;
}

export interface EstimationSummary {
  value: number;
  count: number;
}

export type FileType = 'csv' | 'excel' | 'pdf';
