import { TreeNode, Template, BoilResult, ValidationWarning } from './types';
import { endpoints, getAuthHeaders } from './endpoints';

const USE_API = import.meta.env.VITE_USE_API === 'True';

console.log('API Mode:', USE_API ? 'ENABLED' : 'DISABLED');
console.log('API Base URL:', import.meta.env.VITE_API_URL);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const STORAGE_KEYS = {
  TEMPLATES: 'boilit-templates',
  TAGS: 'boilit-tags',
};

export const selectOutputFolder = async (): Promise<string> => {
  if (USE_API) {
    try {
      console.log('Selecting folder from:', endpoints.folder.select);
      const response = await fetch(endpoints.folder.select, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to select folder:', response.status, response.statusText);
        throw new Error('Failed to select folder');
      }

      const data = await response.json();
      console.log('Folder selected:', data.path);
      return data.path;
    } catch (error) {
      console.error('Error selecting folder:', error);
      throw error;
    }
  }

  await delay(300);
  return '/Users/dev/Projects/my-new-project';
};

export const createStructure = async (
  nodes: TreeNode[],
  outputPath: string
): Promise<BoilResult> => {
  if (USE_API) {
    try {
      console.log('Creating structure at:', endpoints.structure.create);
      const apiNodes = convertToAPIFormat(nodes);
      console.log('Payload:', { nodeCount: nodes.length, outputPath });
      console.log('API nodes:', apiNodes);
      const response = await fetch(endpoints.structure.create, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ nodes: apiNodes, outputPath }),
      });

      if (!response.ok) {
        console.error('Failed to create structure:', response.status, response.statusText);
        throw new Error('Failed to create structure');
      }

      const result = await response.json();
      console.log('Structure created:', result);
      return {
        ...result,
        outputPath: result.outputPath || outputPath,
      };
    } catch (error) {
      console.error('Error creating structure:', error);
      throw error;
    }
  }

  await delay(800);
  const folderCount = nodes.filter(n => n.type === 'folder').length;
  const fileCount = nodes.filter(n => n.type === 'file').length;

  return {
    success: true,
    folderCount,
    fileCount,
    outputPath,
  };
};

export const openFolder = async (path: string): Promise<void> => {
  if (USE_API) {
    await fetch(endpoints.folder.open, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ path }),
    });
    return;
  }

  await delay(200);
  console.log('Opening folder:', path);
};

export const openInVSCode = async (path: string): Promise<void> => {
  if (USE_API) {
    await fetch(endpoints.folder.openVSCode, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ path }),
    });
    return;
  }

  await delay(300);
  console.log('Opening in VS Code:', path);
};

export const saveTemplate = async (
  name: string,
  tags: string[],
  structure: TreeNode[]
): Promise<Template> => {
  if (USE_API) {
    try {
      console.log('Saving template to:', endpoints.templates.create);
      const apiStructure = convertToAPIFormat(structure);
      console.log('Template data:', { name, tags, structureNodeCount: structure.length });
      console.log('API structure:', apiStructure);
      const response = await fetch(endpoints.templates.create, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, tags, structure: apiStructure }),
      });

      if (!response.ok) {
        console.error('Failed to save template:', response.status, response.statusText);
        throw new Error('Failed to save template');
      }

      const template = await response.json();
      console.log('Template saved:', template);

      if (template.structure && Array.isArray(template.structure)) {
        template.structure = convertFromAPIFormat(template.structure);
      } else {
        template.structure = structure;
      }
      return template;
    } catch (error) {
      console.error('Error saving template:', error);
      throw error;
    }
  }

  await delay(300);

  const template: Template = {
    id: `tpl-${Date.now()}`,
    name,
    tags,
    structure,
    createdAt: new Date(),
  };

  const templates = await getTemplates();
  templates.unshift(template);
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));

  return template;
};

export const getTemplates = async (): Promise<Template[]> => {
  if (USE_API) {
    try {
      console.log('Fetching templates from:', endpoints.templates.getAll);
      const response = await fetch(endpoints.templates.getAll, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch templates:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      console.log('Templates received:', data.length, 'templates');
      return data.map((t: any) => ({
        ...t,
        structure: convertFromAPIFormat(t.structure),
        createdAt: new Date(t.createdAt),
      }));
    } catch (error) {
      console.error('Error fetching templates:', error);
      return [];
    }
  }

  await delay(100);
  const stored = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
  if (!stored) return [];

  const templates = JSON.parse(stored);
  return templates.map((t: any) => ({
    ...t,
    createdAt: new Date(t.createdAt),
  }));
};

export const updateTemplate = async (
  id: string,
  name: string,
  tags: string[]
): Promise<void> => {
  if (USE_API) {
    await fetch(endpoints.templates.update(id), {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, tags }),
    });
    return;
  }

  await delay(200);
  const templates = await getTemplates();
  const index = templates.findIndex(t => t.id === id);
  if (index !== -1) {
    templates[index] = { ...templates[index], name, tags };
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  }
};

export const deleteTemplate = async (id: string): Promise<void> => {
  if (USE_API) {
    await fetch(endpoints.templates.delete(id), {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return;
  }

  await delay(200);
  const templates = await getTemplates();
  const filtered = templates.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(filtered));
};

export const getAllTags = async (): Promise<string[]> => {
  if (USE_API) {
    try {
      console.log('Fetching tags from:', endpoints.tags.getAll);
      const response = await fetch(endpoints.tags.getAll, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to fetch tags:', response.status, response.statusText);
        return [];
      }

      const data = await response.json();
      console.log('Tags received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }

  const stored = localStorage.getItem(STORAGE_KEYS.TAGS);
  return stored ? JSON.parse(stored) : [];
};

export const saveTags = (tags: string[]): void => {
  if (USE_API) {
    return;
  }

  localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
};

export const addTag = async (tag: string): Promise<void> => {
  if (USE_API) {
    try {
      console.log('Adding tag:', tag, 'to', endpoints.tags.create);
      const response = await fetch(endpoints.tags.create, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tag }),
      });

      if (!response.ok) {
        console.error('Failed to add tag:', response.status, response.statusText);
      } else {
        console.log('Tag added successfully');
      }
    } catch (error) {
      console.error('Error adding tag:', error);
    }
    return;
  }

  const tags = await getAllTags();
  if (!tags.includes(tag)) {
    tags.push(tag);
    saveTags(tags);
  }
};

export const deleteTag = async (tag: string): Promise<void> => {
  if (USE_API) {
    try {
      console.log('Deleting tag:', tag, 'from', endpoints.tags.delete(tag));
      const response = await fetch(endpoints.tags.delete(tag), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        console.error('Failed to delete tag:', response.status, response.statusText);
      } else {
        console.log('Tag deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting tag:', error);
    }
    return;
  }

  const tags = (await getAllTags()).filter(t => t !== tag);
  saveTags(tags);
};

export const convertToAPIFormat = (nodes: TreeNode[]): any[] => {
  return nodes.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type,
    parentId: node.parentId,
  }));
};

export const convertFromAPIFormat = (structure: any[]): TreeNode[] => {
  return structure.map(item => ({
    id: item.id || `node-${Date.now()}-${Math.random()}`,
    name: item.name,
    type: item.type,
    parentId: item.parentId || null,
  }));
};

export const validateStructure = (nodes: TreeNode[]): ValidationWarning[] => {
  const warnings: ValidationWarning[] = [];

  if (nodes.length === 0) {
    warnings.push({
      type: 'empty-root',
      message: 'Structure is empty',
    });
    return warnings;
  }

  const names = new Set<string>();
  nodes.forEach(node => {
    const key = `${node.parentId}-${node.name}`;
    if (names.has(key)) {
      warnings.push({
        type: 'duplicate',
        message: `Duplicate name: ${node.name}`,
        nodeId: node.id,
      });
    }
    names.add(key);
  });

  const hasReadme = nodes.some(n =>
    n.name.toLowerCase() === 'readme.md' && n.parentId === null
  );

  if (!hasReadme) {
    warnings.push({
      type: 'missing-readme',
      message: 'No README.md in root',
    });
  }

  return warnings;
};

export interface AIParams {
  prompt: string;
  provider: 'openai' | 'ollama';
  model: string;
  openai_key?: string;
  ollama_url?: string;
}

export const generateAIStructure = async (params: AIParams): Promise<{ name: string; nodes: TreeNode[] }> => {
  if (USE_API) {
    const response = await fetch(endpoints.ai.generate, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'AI generation failed');
    }

    const data = await response.json();
    return {
      name: data.name,
      nodes: convertFromAPIFormat(data.nodes),
    };
  }

  throw new Error('API must be enabled for AI features');
};
