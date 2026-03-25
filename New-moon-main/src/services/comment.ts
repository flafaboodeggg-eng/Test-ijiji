import { api } from './api';

export interface Comment {
  _id: string;
  novelId: string;
  user: {
    _id: string;
    name: string;
    picture?: string;
    role: string;
    isCommentBlocked?: boolean;
  };
  content: string;
  parentId: string | null;
  chapterNumber: number | null;
  likes: string[];
  dislikes: string[];
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
  replyCount?: number;
}

export interface CommentStats {
  like: number;
  love: number;
  funny: number;
  sad: number;
  angry: number;
  total: number;
  userReaction: string | null;
}

export const commentService = {
  async getComments(novelId: string, chapterNumber?: number, page: number = 1, limit: number = 20, sort: 'newest' | 'oldest' | 'best' = 'newest'): Promise<{
    comments: Comment[];
    totalComments: number;
    stats: CommentStats;
  }> {
    const query = new URLSearchParams();
    query.append('page', page.toString());
    query.append('limit', limit.toString());
    query.append('sort', sort);
    if (chapterNumber !== undefined) query.append('chapterNumber', chapterNumber.toString());

    const res = await fetch(`${api.baseUrl}/api/novels/${novelId}/comments?${query.toString()}`);
    if (!res.ok) throw new Error('فشل جلب التعليقات');
    return res.json();
  },

  async getReplies(commentId: string): Promise<Comment[]> {
    const res = await fetch(`${api.baseUrl}/api/comments/${commentId}/replies`);
    if (!res.ok) throw new Error('فشل جلب الردود');
    return res.json();
  },

  async addComment(novelId: string, content: string, parentId?: string, chapterNumber?: number): Promise<Comment> {
    const res = await fetch(`${api.baseUrl}/api/comments`, {
      method: 'POST',
      headers: {
        ...api.headers,
        ...api.getAuthHeader(),
      },
      body: JSON.stringify({ novelId, content, parentId, chapterNumber }),
    });
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'فشل إضافة التعليق');
    }
    return res.json();
  },

  async editComment(commentId: string, content: string): Promise<Comment> {
    const res = await fetch(`${api.baseUrl}/api/comments/${commentId}`, {
      method: 'PUT',
      headers: {
        ...api.headers,
        ...api.getAuthHeader(),
      },
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('فشل تعديل التعليق');
    return res.json();
  },

  async deleteComment(commentId: string): Promise<void> {
    const res = await fetch(`${api.baseUrl}/api/comments/${commentId}`, {
      method: 'DELETE',
      headers: api.getAuthHeader(),
    });
    if (!res.ok) throw new Error('فشل حذف التعليق');
  },

  async reactToComment(commentId: string, action: 'like' | 'dislike'): Promise<{ likes: number; dislikes: number }> {
    const res = await fetch(`${api.baseUrl}/api/comments/${commentId}/action`, {
      method: 'POST',
      headers: {
        ...api.headers,
        ...api.getAuthHeader(),
      },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) throw new Error('فشل التفاعل مع التعليق');
    return res.json();
  },
};