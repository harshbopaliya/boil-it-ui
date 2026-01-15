const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const endpoints = {
  templates: {
    getAll: `${API_BASE_URL}/templates`,
    create: `${API_BASE_URL}/templates`,
    update: (id: string) => `${API_BASE_URL}/templates/${id}`,
    delete: (id: string) => `${API_BASE_URL}/templates/${id}`,
    getById: (id: string) => `${API_BASE_URL}/templates/${id}`,
  },
  tags: {
    getAll: `${API_BASE_URL}/tags`,
    create: `${API_BASE_URL}/tags`,
    delete: (tag: string) => `${API_BASE_URL}/tags/${encodeURIComponent(tag)}`,
  },
  structure: {
    create: `${API_BASE_URL}/structure/create`,
    validate: `${API_BASE_URL}/structure/validate`,
  },
  folder: {
    select: `${API_BASE_URL}/folder/select`,
    open: `${API_BASE_URL}/folder/open`,
    openVSCode: `${API_BASE_URL}/folder/open-vscode`,
  },
  ai: {
    generate: `${API_BASE_URL}/ai/generate`,
  },
};

export const getAuthHeaders = () => {
  return {
    'Content-Type': 'application/json',
  };
};
