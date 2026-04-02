// 使用 localStorage 作为浏览器兼容的存储方案，并增强安全性

// 简单的加密/解密函数（实际生产环境应使用更安全的加密方案）
const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    // 使用 btoa 进行简单的编码，实际生产环境应使用更安全的加密算法
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch (error) {
    console.error('Error encrypting data:', error);
    return JSON.stringify(data);
  }
};

const decryptData = (encryptedData) => {
  try {
    // 使用 atob 进行简单的解码，实际生产环境应使用更安全的解密算法
    const jsonString = decodeURIComponent(escape(atob(encryptedData)));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decrypting data:', error);
    try {
      // 如果解密失败，尝试直接解析（兼容旧数据）
      return JSON.parse(encryptedData);
    } catch (parseError) {
      return [];
    }
  }
};

// 安全的 localStorage 操作函数
const safeLocalStorage = {
  setItem: (key, value) => {
    try {
      const encryptedValue = encryptData(value);
      localStorage.setItem(key, encryptedValue);
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },
  getItem: (key, defaultValue = []) => {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return defaultValue;
      return decryptData(encryptedValue);
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  }
};

// 初始化默认数据
const initLocalStorage = () => {
  // 检查是否已有数据
  if (!localStorage.getItem('sopCategories')) {
    // 初始化默认分类数据
    const defaultCategories = [
      { id: '1', name: '安全管理', sort_order: 1 },
      { id: '2', name: '生产操作', sort_order: 2 },
      { id: '3', name: '质量检查', sort_order: 3 },
      { id: '4', name: '人事培训', sort_order: 4 },
      { id: '5', name: '设备维护', sort_order: 5 }
    ];
    safeLocalStorage.setItem('sopCategories', defaultCategories);
  }
  
  if (!localStorage.getItem('sopDocuments')) {
    // 初始化默认文档数据
    const defaultDocuments = [
      {
        id: '1',
        title: '车间安全操作规范',
        content: '# 1. 目的\n规范车间安全操作流程，确保员工安全和生产顺利进行。\n\n# 2. 适用范围\n适用于所有车间操作员工。',
        summary: '车间日常安全操作的规范流程',
        category_id: '1',
        tags: ['安全', '车间', '操作规范'],
        status: 'published',
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      },
      {
        id: '2',
        title: '产品质量检验流程',
        content: '# 1. 目的\n确保产品质量符合标准要求。\n\n# 2. 检验步骤\n1. 外观检查\n2. 功能测试\n3. 性能测试',
        summary: '产品出厂前的质量检验流程',
        category_id: '2',
        tags: ['质量', '检验', '出厂'],
        status: 'published',
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString()
      }
    ];
    safeLocalStorage.setItem('sopDocuments', defaultDocuments);
  }
  
  if (!localStorage.getItem('sopFeedback')) {
    safeLocalStorage.setItem('sopFeedback', []);
  }
  
  if (!localStorage.getItem('sopTags')) {
    // 初始化默认标签数据
    const defaultTags = [
      { id: '1', name: '安全', description: '安全相关标签', sort_order: 1 },
      { id: '2', name: '质量', description: '质量相关标签', sort_order: 2 },
      { id: '3', name: '操作', description: '操作相关标签', sort_order: 3 }
    ];
    safeLocalStorage.setItem('sopTags', defaultTags);
  }
  
  if (!localStorage.getItem('sopVersions')) {
    localStorage.setItem('sopVersions', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('sopUsers')) {
    // 初始化默认用户数据
    const defaultUsers = [
      {
        id: 1,
        name: "admin",
        role: "admin",
        email: "admin",
        status: "owner",
        created_at: "2024-01-01",
        last_login: "2024-03-20",
        password: "admin",
        first_login: false
      },
      {
        id: 3,
        name: "李四",
        role: "user",
        email: "lisi@example.com",
        status: "active",
        created_at: "2024-03-01",
        last_login: "2024-03-15",
        password: "lisi",
        first_login: false
      }
    ];
    safeLocalStorage.setItem('sopUsers', defaultUsers);
  }
};

// 初始化数据
initLocalStorage();

// 创建基于 localStorage 的客户端
const sopManager = {
  auth: {
    // 模拟用户认证
    me: async () => {
      // 从 localStorage 获取用户信息
      const user = localStorage.getItem('sopUser');
      if (user) {
        return JSON.parse(user);
      } else {
        // 没有用户信息，抛出未认证错误
        throw new Error('User not authenticated');
      }
    },
    // 模拟登出
    logout: (redirectUrl) => {
      // 清除用户信息
      localStorage.removeItem('sopUser');
      // 如果提供了重定向URL，跳转到该URL
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }
    },
    // 跳转到登录页
    redirectToLogin: (redirectUrl) => {
      // 保存重定向URL到localStorage，登录成功后可以跳转回来
      if (redirectUrl) {
        localStorage.setItem('redirectUrl', redirectUrl);
      }
      // 跳转到登录页面
      window.location.href = '/login';
    }
  },
  entities: {
    SOPDocument: {
      list: async (sortBy = '-updated_date') => {
        try {
          const documents = safeLocalStorage.getItem('sopDocuments', []);
          
          // 处理排序
          if (sortBy === '-updated_date') {
            return documents.sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date));
          } else if (sortBy === 'updated_date') {
            return documents.sort((a, b) => new Date(a.updated_date) - new Date(b.updated_date));
          }
          
          return documents;
        } catch (error) {
          console.error('Error listing documents:', error);
          return [];
        }
      },
      create: async (data) => {
        try {
          console.log('Creating document with data:', data);
          // 确保localStorage可用
          if (typeof localStorage === 'undefined') {
            throw new Error('localStorage is not available');
          }
          
          const documents = safeLocalStorage.getItem('sopDocuments', []);
          const id = Date.now().toString();
          const now = new Date().toISOString();
          
          const newDocument = {
            id,
            ...data,
            created_date: now,
            updated_date: now
          };
          
          console.log('New document:', newDocument);
          documents.push(newDocument);
          console.log('Documents after push:', documents);
          
          // 尝试保存到localStorage
          try {
            safeLocalStorage.setItem('sopDocuments', documents);
            console.log('Document created successfully');
            return newDocument;
          } catch (storageError) {
            console.error('Storage error:', storageError);
            // 如果localStorage失败，返回新文档但不保存
            return newDocument;
          }
        } catch (error) {
          console.error('Error creating document:', error);
          throw error;
        }
      },
      update: async (id, data) => {
        try {
          const documents = safeLocalStorage.getItem('sopDocuments', []);
          const index = documents.findIndex(doc => doc.id === id);
          
          if (index === -1) {
            throw new Error('Document not found');
          }
          
          const now = new Date().toISOString();
          const updatedDocument = {
            ...documents[index],
            ...data,
            updated_date: now
          };
          
          documents[index] = updatedDocument;
          safeLocalStorage.setItem('sopDocuments', documents);
          
          return updatedDocument;
        } catch (error) {
          console.error('Error updating document:', error);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          let documents = safeLocalStorage.getItem('sopDocuments', []);
          documents = documents.filter(doc => doc.id !== id);
          safeLocalStorage.setItem('sopDocuments', documents);
          return { success: true };
        } catch (error) {
          console.error('Error deleting document:', error);
          throw error;
        }
      },
      filter: async (conditions) => {
        try {
          const documents = safeLocalStorage.getItem('sopDocuments', []);
          return documents.filter(doc => {
            for (const [key, value] of Object.entries(conditions)) {
              if (doc[key] !== value) {
                return false;
              }
            }
            return true;
          });
        } catch (error) {
          console.error('Error filtering documents:', error);
          return [];
        }
      }
    },
    SOPCategory: {
      list: async (sortBy = 'sort_order') => {
        try {
          const categories = safeLocalStorage.getItem('sopCategories', []);
          
          if (sortBy === 'sort_order') {
            return categories.sort((a, b) => a.sort_order - b.sort_order);
          }
          
          return categories;
        } catch (error) {
          console.error('Error listing categories:', error);
          return [];
        }
      },
      create: async (data) => {
        try {
          const categories = safeLocalStorage.getItem('sopCategories', []);
          const id = Date.now().toString();
          
          const newCategory = {
            id,
            ...data,
            sort_order: data.sort_order || 0
          };
          
          categories.push(newCategory);
          safeLocalStorage.setItem('sopCategories', categories);
          
          return newCategory;
        } catch (error) {
          console.error('Error creating category:', error);
          throw error;
        }
      },
      update: async (id, data) => {
        try {
          const categories = safeLocalStorage.getItem('sopCategories', []);
          const index = categories.findIndex(category => category.id === id);
          
          if (index === -1) {
            throw new Error('Category not found');
          }
          
          const updatedCategory = {
            ...categories[index],
            ...data,
            sort_order: data.sort_order || 0
          };
          
          categories[index] = updatedCategory;
          safeLocalStorage.setItem('sopCategories', categories);
          
          return updatedCategory;
        } catch (error) {
          console.error('Error updating category:', error);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          let categories = safeLocalStorage.getItem('sopCategories', []);
          categories = categories.filter(category => category.id !== id);
          safeLocalStorage.setItem('sopCategories', categories);
          return { success: true };
        } catch (error) {
          console.error('Error deleting category:', error);
          throw error;
        }
      }
    },
    SOPFeedback: {
      list: async () => {
        try {
          const feedback = safeLocalStorage.getItem('sopFeedback', []);
          return feedback.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        } catch (error) {
          console.error('Error listing feedback:', error);
          return [];
        }
      },
      create: async (data) => {
        try {
          const feedback = safeLocalStorage.getItem('sopFeedback', []);
          const id = Date.now().toString();
          const now = new Date().toISOString();
          
          const newFeedback = {
            id,
            ...data,
            status: data.status || 'pending',
            created_date: now
          };
          
          feedback.push(newFeedback);
          safeLocalStorage.setItem('sopFeedback', feedback);
          
          return newFeedback;
        } catch (error) {
          console.error('Error creating feedback:', error);
          throw error;
        }
      },
      update: async (id, data) => {
        try {
          const feedback = safeLocalStorage.getItem('sopFeedback', []);
          const index = feedback.findIndex(item => item.id === id);
          
          if (index === -1) {
            throw new Error('Feedback not found');
          }
          
          const updatedFeedback = {
            ...feedback[index],
            ...data
          };
          
          feedback[index] = updatedFeedback;
          safeLocalStorage.setItem('sopFeedback', feedback);
          
          return updatedFeedback;
        } catch (error) {
          console.error('Error updating feedback:', error);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          let feedback = safeLocalStorage.getItem('sopFeedback', []);
          feedback = feedback.filter(item => item.id !== id);
          safeLocalStorage.setItem('sopFeedback', feedback);
          return { success: true };
        } catch (error) {
          console.error('Error deleting feedback:', error);
          throw error;
        }
      },
      filter: async (conditions, sortBy) => {
        try {
          let feedback = safeLocalStorage.getItem('sopFeedback', []);
          // 应用过滤条件
          feedback = feedback.filter(item => {
            for (const [key, value] of Object.entries(conditions)) {
              if (item[key] !== value) {
                return false;
              }
            }
            return true;
          });
          // 应用排序
          if (sortBy === '-created_date') {
            feedback.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
          }
          return feedback;
        } catch (error) {
          console.error('Error filtering feedback:', error);
          return [];
        }
      }
    },
    SOPTag: {
      list: async (sortBy = 'sort_order') => {
        try {
          const tags = safeLocalStorage.getItem('sopTags', []);
          
          if (sortBy === 'sort_order') {
            return tags.sort((a, b) => a.sort_order - b.sort_order);
          }
          
          return tags;
        } catch (error) {
          console.error('Error listing tags:', error);
          return [];
        }
      },
      create: async (data) => {
        try {
          const tags = safeLocalStorage.getItem('sopTags', []);
          const id = Date.now().toString();
          
          const newTag = {
            id,
            ...data,
            sort_order: data.sort_order || 0
          };
          
          tags.push(newTag);
          safeLocalStorage.setItem('sopTags', tags);
          
          return newTag;
        } catch (error) {
          console.error('Error creating tag:', error);
          throw error;
        }
      },
      update: async (id, data) => {
        try {
          const tags = safeLocalStorage.getItem('sopTags', []);
          const index = tags.findIndex(tag => tag.id === id);
          
          if (index === -1) {
            throw new Error('Tag not found');
          }
          
          const updatedTag = {
            ...tags[index],
            ...data,
            sort_order: data.sort_order || 0
          };
          
          tags[index] = updatedTag;
          safeLocalStorage.setItem('sopTags', tags);
          
          return updatedTag;
        } catch (error) {
          console.error('Error updating tag:', error);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          let tags = safeLocalStorage.getItem('sopTags', []);
          tags = tags.filter(tag => tag.id !== id);
          safeLocalStorage.setItem('sopTags', tags);
          return { success: true };
        } catch (error) {
          console.error('Error deleting tag:', error);
          throw error;
        }
      }
    },
    SOPVersion: {
      list: async (sopId = null) => {
        try {
          const versions = safeLocalStorage.getItem('sopVersions', []);
          if (sopId) {
            return versions.filter(v => v.sop_id === sopId).sort((a, b) => b.version_number - a.version_number);
          }
          return versions;
        } catch (error) {
          console.error('Error listing versions:', error);
          return [];
        }
      },
      create: async (data) => {
        try {
          const versions = safeLocalStorage.getItem('sopVersions', []);
          const id = Date.now().toString();
          const now = new Date().toISOString();
          
          const newVersion = {
            id,
            ...data,
            created_date: now
          };
          
          versions.push(newVersion);
          safeLocalStorage.setItem('sopVersions', versions);
          
          return newVersion;
        } catch (error) {
          console.error('Error creating version:', error);
          throw error;
        }
      },
      update: async (id, data) => {
        try {
          const versions = safeLocalStorage.getItem('sopVersions', []);
          const index = versions.findIndex(v => v.id === id);
          
          if (index === -1) {
            throw new Error('Version not found');
          }
          
          const updatedVersion = {
            ...versions[index],
            ...data
          };
          
          versions[index] = updatedVersion;
          safeLocalStorage.setItem('sopVersions', versions);
          
          return updatedVersion;
        } catch (error) {
          console.error('Error updating version:', error);
          throw error;
        }
      },
      delete: async (id) => {
        try {
          let versions = safeLocalStorage.getItem('sopVersions', []);
          versions = versions.filter(v => v.id !== id);
          safeLocalStorage.setItem('sopVersions', versions);
          return { success: true };
        } catch (error) {
          console.error('Error deleting version:', error);
          throw error;
        }
      },
      filter: async (conditions, sortBy) => {
        try {
          let versions = safeLocalStorage.getItem('sopVersions', []);
          // 应用过滤条件
          versions = versions.filter(version => {
            for (const [key, value] of Object.entries(conditions)) {
              if (version[key] !== value) {
                return false;
              }
            }
            return true;
          });
          // 应用排序
          if (sortBy === '-version_number') {
            versions.sort((a, b) => b.version_number - a.version_number);
          }
          return versions;
        } catch (error) {
          console.error('Error filtering versions:', error);
          return [];
        }
      }
    }
  }
};

export { sopManager };
