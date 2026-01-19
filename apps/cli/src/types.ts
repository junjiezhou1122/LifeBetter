export interface Problem {
  id: string;
  text: string;
  createdAt: string;
}

export interface Storage {
  problems: Problem[];
}
