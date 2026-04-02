/**
 * 文档清理脚本
 * 用于清理localStorage中的实例文档，只保留重要的文档
 */

// 简单的加密/解密函数（与base44Client.js中的一致）
const encryptData = (data) => {
  try {
    const jsonString = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(jsonString)));
  } catch (error) {
    console.error('Error encrypting data:', error);
    return JSON.stringify(data);
  }
};

const decryptData = (encryptedData) => {
  try {
    const jsonString = decodeURIComponent(escape(atob(encryptedData)));
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Error decrypting data:', error);
    try {
      return JSON.parse(encryptedData);
    } catch (parseError) {
      return [];
    }
  }
};

// 安全的localStorage操作函数
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

/**
 * 清理文档数据
 * @param {number} keepCount 保留的文档数量
 */
function cleanupDocuments(keepCount = 10) {
  try {
    console.log('开始清理文档数据...');
    
    // 获取所有文档
    const documents = safeLocalStorage.getItem('sopDocuments', []);
    console.log(`当前文档数量: ${documents.length}`);
    
    if (documents.length <= keepCount) {
      console.log(`文档数量 (${documents.length}) 未超过保留数量 (${keepCount})，无需清理`);
      return;
    }
    
    // 按更新时间排序，保留最新的文档
    const sortedDocuments = documents.sort((a, b) => {
      const dateA = new Date(a.updated_date || a.created_date || 0).getTime();
      const dateB = new Date(b.updated_date || b.created_date || 0).getTime();
      return dateB - dateA; // 降序排序，最新的在前
    });
    
    // 保留前keepCount个文档
    const keptDocuments = sortedDocuments.slice(0, keepCount);
    console.log(`保留 ${keptDocuments.length} 个最新文档`);
    
    // 保存清理后的文档
    safeLocalStorage.setItem('sopDocuments', keptDocuments);
    console.log('文档清理完成！');
    console.log(`清理前: ${documents.length} 个文档`);
    console.log(`清理后: ${keptDocuments.length} 个文档`);
    console.log(`删除了: ${documents.length - keptDocuments.length} 个文档`);
    
    // 显示保留的文档
    console.log('\n保留的文档:');
    keptDocuments.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title} (${doc.id})`);
    });
    
  } catch (error) {
    console.error('清理文档时出错:', error);
  }
}

/**
 * 清理特定类型的文档
 * @param {string} keyword 要删除的文档标题中包含的关键词
 */
function cleanupSpecificDocuments(keyword) {
  try {
    console.log(`开始清理包含关键词 "${keyword}" 的文档...`);
    
    // 获取所有文档
    const documents = safeLocalStorage.getItem('sopDocuments', []);
    console.log(`当前文档数量: ${documents.length}`);
    
    // 过滤掉包含关键词的文档
    const keptDocuments = documents.filter(doc => {
      return !doc.title.toLowerCase().includes(keyword.toLowerCase());
    });
    
    const deletedCount = documents.length - keptDocuments.length;
    console.log(`删除了 ${deletedCount} 个包含关键词 "${keyword}" 的文档`);
    console.log(`保留了 ${keptDocuments.length} 个文档`);
    
    if (deletedCount > 0) {
      // 保存清理后的文档
      safeLocalStorage.setItem('sopDocuments', keptDocuments);
      console.log('文档清理完成！');
    } else {
      console.log('没有找到包含关键词的文档，无需清理');
    }
    
  } catch (error) {
    console.error('清理文档时出错:', error);
  }
}

/**
 * 显示当前文档列表
 */
function showDocuments() {
  try {
    const documents = safeLocalStorage.getItem('sopDocuments', []);
    console.log(`当前文档数量: ${documents.length}`);
    console.log('\n文档列表:');
    documents.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.title} (${doc.id}) - ${doc.status}`);
    });
  } catch (error) {
    console.error('显示文档时出错:', error);
  }
}

/**
 * 主函数
 */
function main() {
  console.log('=== SOP 文档清理工具 ===');
  console.log('1. 显示当前文档列表');
  console.log('2. 清理实例文档（保留最新的10个）');
  console.log('3. 清理包含特定关键词的文档');
  console.log('4. 退出');
  
  // 模拟用户输入
  // 实际使用时可以通过prompt或命令行参数获取用户选择
  const choice = 2; // 默认选择清理实例文档
  
  switch (choice) {
    case 1:
      showDocuments();
      break;
    case 2:
      cleanupDocuments(10); // 保留最新的10个文档
      break;
    case 3:
      cleanupSpecificDocuments('实例'); // 清理包含"实例"关键词的文档
      break;
    case 4:
      console.log('退出');
      break;
    default:
      console.log('无效选择');
  }
}

// 运行主函数
if (typeof window !== 'undefined') {
  // 在浏览器中运行
  window.cleanupDocuments = cleanupDocuments;
  window.cleanupSpecificDocuments = cleanupSpecificDocuments;
  window.showDocuments = showDocuments;
  console.log('文档清理工具已加载到window对象');
  console.log('可使用以下函数:');
  console.log('cleanupDocuments(keepCount) - 清理文档，保留指定数量的最新文档');
  console.log('cleanupSpecificDocuments(keyword) - 清理包含特定关键词的文档');
  console.log('showDocuments() - 显示当前文档列表');
} else {
  // 在Node.js中运行
  console.log('此脚本需要在浏览器环境中运行，因为它操作localStorage');
}
