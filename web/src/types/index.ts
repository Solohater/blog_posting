export interface User {
  userid: number;
  username: string;
  email: string;
  name: string;
  bio: string;
  role: "USER" | "REVIEWER";
}

export interface Blog {
  blogid: number;
  userid: number;
  title: string;
  content: string;
  tagid: number;
  status?: string;
  filePath?: string;
  createdAt?: string;
  reviewedAt?: string;
  user?: User;
  comments?: Comment[];
  likes?: Like[];
  ratings?: Rating[];
}

export interface Tag {
  tagid: number;
  name: string;
  description: string;
}

export interface Comment {
  commentid: number;
  content: string;
  userid: number;
  username: string;
}

export interface Like {
  blogid: number;
  userid: number;
}

export interface Rating {
  ratingid: number;
  userid: number;
  blogid: number;
  ratingvalue: number;
}

export interface SearchResult {
  users: User[];
  blogs: Blog[];
}
