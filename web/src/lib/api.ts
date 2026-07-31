const BASE = "/api";

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${endpoint}`, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request failed" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Auth
  register: (body: { username: string; email: string; password: string; name?: string; bio?: string }) =>
    request<{ token: string; user: import("@/types").User }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { username: string; password: string }) =>
    request<{ token: string; message: string; userid: number }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  getProfile: () => request<import("@/types").User>("/auth/profile"),

  updateProfile: (body: { name?: string; bio?: string }) =>
    request<{ message: string; user: import("@/types").User }>("/auth/profile", { method: "PUT", body: JSON.stringify(body) }),

  promote: (userId: number) => request<{ message: string }>(`/auth/promote/${userId}`, { method: "POST" }),

  demote: (userId: number) => request<{ message: string }>(`/auth/demote/${userId}`, { method: "POST" }),

  follow: (id: number) => request<{ message: string }>(`/auth/follow/${id}`, { method: "POST" }),

  unfollow: (id: number) => request<{ message: string }>(`/auth/unfollow/${id}`, { method: "DELETE" }),

  search: (q: string) => request<import("@/types").SearchResult>(`/auth/search?q=${encodeURIComponent(q)}`),

  // Tags
  getTags: () => request<import("@/types").Tag[]>("/tags"),

  // Upload
  uploadFile: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ fileUrl: string; originalName: string; mimetype: string }>("/upload", { method: "POST", body: formData });
  },

  // Blogs (user's own)
  getMyBlogs: (status?: string) =>
    request<import("@/types").Blog[]>(`/blogs${status ? `?status=${status}` : ""}`),

  // Single blog
  getBlog: (id: number) =>
    request<import("@/types").Blog>(`/blogs/${id}`),

  // Blogs (reviewer)
  getAllBlogs: (status?: string) =>
    request<import("@/types").Blog[]>(`/blogs/all${status ? `?status=${status}` : ""}`),

  getPendingBlogs: () =>
    request<import("@/types").Blog[]>("/blogs/pending"),

  createBlog: (body: { title: string; content: string; tagId?: number; fileUrl?: string }) =>
    request<import("@/types").Blog>("/blogs", { method: "POST", body: JSON.stringify(body) }),

  updateBlog: (id: number, body: { title?: string; content?: string; tagId?: number; fileUrl?: string }) =>
    request<import("@/types").Blog>(`/blogs/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  deleteBlog: (id: number) => request<{ message: string }>(`/blogs/${id}`, { method: "DELETE" }),

  passBlog: (id: number) => request<{ message: string; blog: import("@/types").Blog }>(`/blogs/${id}/pass`, { method: "POST" }),

  failBlog: (id: number) => request<{ message: string; blog: import("@/types").Blog }>(`/blogs/${id}/fail`, { method: "POST" }),

  // Likes
  likeBlog: (blogId: number) => request<{ message: string }>(`/blogs/${blogId}/likes`, { method: "POST" }),

  unlikeBlog: (blogId: number) => request<{ message: string }>(`/blogs/${blogId}/likes`, { method: "DELETE" }),

  // Comments
  getComments: (blogId: number) => request<import("@/types").Comment[]>(`/blogs/${blogId}/comments`),

  addComment: (blogId: number, content: string) =>
    request<import("@/types").Comment>(`/blogs/${blogId}/comments`, { method: "POST", body: JSON.stringify({ content }) }),

  updateComment: (blogId: number, commentId: number, content: string) =>
    request<import("@/types").Comment>(`/blogs/${blogId}/comments/${commentId}`, { method: "PUT", body: JSON.stringify({ content }) }),

  deleteComment: (blogId: number, commentId: number) =>
    request<{ message: string }>(`/blogs/${blogId}/comments/${commentId}`, { method: "DELETE" }),

  // Ratings
  rateBlog: (blogId: number, ratingValue: number) =>
    request<{ rating: number }>(`/blogs/${blogId}/ratings`, { method: "POST", body: JSON.stringify({ ratingValue }) }),
};
