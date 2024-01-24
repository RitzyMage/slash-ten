export type ID = string | number;

export type Review = {
  media: string;
  user: ID;
  score: number;
};

export type User = {
  id: ID;
  name: string;
};

export type Media = {
  id: string;
  title: string;
};
