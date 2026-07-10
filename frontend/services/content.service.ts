import { apiService } from '@/services/api.service';

/** Article and PDF are one library type in the dashboard (DB type 2 is shown as Article). */
function normalizeCategory(type: any): string {
  const raw = String(type ?? '').toUpperCase();
  if (type === 1 || type === '1' || raw === 'VIDEO') return 'Video';
  return 'Article';
}

function mapItem(item: any) {
  return {
    id: String(item.id),
    title: item.title || 'Untitled Resource',
    content: item.description || '',
    url: item.fileUrl || '',
    coverImageUrl: item.coverImageUrl || '',
    category: normalizeCategory(item.type),
    resourceType: Number(item.type ?? item.Type ?? 0),
    updatedAt: item.createdDate || new Date().toISOString(),
    createdAt: item.createdDate || new Date().toISOString(),
  };
}

function isRealUploadedFile(file?: File | null): boolean {
  if (!file || file.size === 0) return false;
  if (file.name === 'empty.txt') return false;
  return true;
}

/** Video = 1; article with upload / PDF link = 2; text-only article = 0 */
function resolveResourceType(data: {
  category?: string;
  file?: File | null;
  url?: string;
  existingType?: number | string;
}): number {
  if (data.category === 'Video') return 1;

  if (isRealUploadedFile(data.file)) return 2;

  const url = (data.url || '').trim().toLowerCase();
  if (url.endsWith('.pdf') || url.includes('.pdf?')) return 2;

  const existing = Number(data.existingType);
  if (existing === 2) return 2;

  return 0;
}

function filterItems(items: ReturnType<typeof mapItem>[], params?: { search?: string; category?: string }) {
  let result = items;
  if (params?.category && params.category !== 'all') {
    result = result.filter((item) => item.category === params.category);
  }
  if (params?.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    result = result.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.content.toLowerCase().includes(q) ||
        item.url.toLowerCase().includes(q),
    );
  }
  return result;
}

export const contentService = {
  getAll: async (params?: { search?: string; category?: string; limit?: number }) => {
    const response = await apiService.get<any[]>('/Resources');
    const items = (response.data || []).map(mapItem);
    const filtered = filterItems(items, params);
    const limited = params?.limit ? filtered.slice(0, params.limit) : filtered;
    return { data: limited };
  },

  getOne: async (id: string) => {
    const res = await apiService.get<any[]>('/Resources');
    const item = res.data.find((item: any) => String(item.id) === id);
    if (!item) throw new Error('Resource not found');
    return {
      id: String(item.id),
      title: item.title || 'Untitled Resource',
      content: item.description || '',
      url: item.fileUrl || '',
      coverImageUrl: item.coverImageUrl || '',
      category: normalizeCategory(item.type),
      updatedAt: item.createdDate || new Date().toISOString(),
      createdAt: item.createdDate || new Date().toISOString(),
    };
  },

  create: (data: any) => {
    const fd = new FormData();
    fd.append('Title', data.title || 'Untitled');
    fd.append('Description', data.content || '');
    fd.append('CoverImageUrl', data.coverImageUrl || '/uploads/default-cover.jpg');
    
    const typeVal = resolveResourceType(data);
    fd.append('Type', String(typeVal));
    fd.append('Duration', '0');

    if (data.file) {
      fd.append('File', data.file);
    } else {
      const blob = new Blob([''], { type: 'application/octet-stream' });
      fd.append('File', blob, 'empty.txt');
    }

    return apiService.postMultipart<any>('/Resources', fd);
  },

  update: async (id: string, data: any) => {
    try {
      await apiService.delete(`/Resources/${id}`);
    } catch (err) {
      console.warn('Failed to delete old resource before update:', err);
    }

    const fd = new FormData();
    fd.append('Title', data.title || 'Untitled');
    fd.append('Description', data.content || '');
    fd.append('CoverImageUrl', data.coverImageUrl || '/uploads/default-cover.jpg');
    
    const typeVal = resolveResourceType(data);
    fd.append('Type', String(typeVal));
    fd.append('Duration', '0');

    if (data.file) {
      fd.append('File', data.file);
    } else {
      const blob = new Blob([''], { type: 'application/octet-stream' });
      fd.append('File', blob, 'empty.txt');
    }

    return apiService.postMultipart<any>('/Resources', fd);
  },

  delete: (id: string) => {
    return apiService.delete(`/Resources/${id}`);
  },

  getStats: async () => {
    const response = await apiService.get<any[]>('/Resources');
    const items = response.data || [];
    return {
      data: {
        total: items.length,
        articles: items.filter((item: any) => normalizeCategory(item.type) === 'Article').length,
        videos: items.filter((item: any) => normalizeCategory(item.type) === 'Video').length,
      }
    };
  },
};
