/**
 * SOP 文档创建测试脚本
 * 用于测试 SOP 文档的创建、查询和管理功能
 */

import { sopManager } from './src/api/base44Client.js';

/**
 * 测试结果记录器
 */
class TestResultLogger {
  constructor() {
    this.results = [];
  }

  /**
   * 记录测试结果
   * @param {string} testName 测试名称
   * @param {boolean} success 是否成功
   * @param {any} data 测试数据
   * @param {string} error 错误信息
   */
  log(testName, success, data = null, error = null) {
    const result = {
      testName,
      success,
      timestamp: new Date().toISOString(),
      data,
      error
    };
    this.results.push(result);
    
    const status = success ? '✓ PASS' : '✗ FAIL';
    console.log(`[${status}] ${testName}`);
    if (error) {
      console.error('Error:', error.message || error);
    }
  }

  /**
   * 输出测试报告
   */
  printReport() {
    console.log('\n=== 测试报告 ===');
    console.log(`总测试数: ${this.results.length}`);
    console.log(`成功数: ${this.results.filter(r => r.success).length}`);
    console.log(`失败数: ${this.results.filter(r => !r.success).length}`);
    console.log('\n详细结果:');
    this.results.forEach((result, index) => {
      const status = result.success ? '✓' : '✗';
      console.log(`${index + 1}. ${status} ${result.testName}`);
      if (!result.success && result.error) {
        console.log(`   错误: ${result.error.message || result.error}`);
      }
    });
    console.log('=== 测试报告结束 ===');
  }
}

/**
 * 文档创建测试套件
 */
class DocumentCreationTestSuite {
  constructor() {
    this.logger = new TestResultLogger();
  }

  /**
   * 测试创建文档
   * @param {Object} testData 测试数据
   * @returns {Promise<boolean>} 测试是否成功
   */
  async testCreateDocument(testData) {
    try {
      const result = await sopManager.entities.SOPDocument.create(testData);
      this.logger.log('创建文档', true, result);
      return true;
    } catch (error) {
      this.logger.log('创建文档', false, null, error);
      return false;
    }
  }

  /**
   * 测试获取文档列表
   * @returns {Promise<boolean>} 测试是否成功
   */
  async testListDocuments() {
    try {
      const documents = await sopManager.entities.SOPDocument.list();
      this.logger.log('获取文档列表', true, { count: documents.length });
      return true;
    } catch (error) {
      this.logger.log('获取文档列表', false, null, error);
      return false;
    }
  }

  /**
   * 测试创建多种类型的文档
   * @returns {Promise<void>}
   */
  async runAllTests() {
    console.log('开始执行 SOP 文档测试...\n');

    // 测试用例 1: 创建草稿文档
    const draftData = {
      title: '测试草稿文档',
      content: '这是一个测试草稿文档的内容',
      summary: '测试草稿文档摘要',
      category_id: '1',
      tags: ['测试', '草稿'],
      status: 'draft'
    };
    await this.testCreateDocument(draftData);

    // 测试用例 2: 创建已发布文档
    const publishedData = {
      title: '测试已发布文档',
      content: '这是一个测试已发布文档的内容',
      summary: '测试已发布文档摘要',
      category_id: '1',
      tags: ['测试', '已发布'],
      status: 'published'
    };
    await this.testCreateDocument(publishedData);

    // 测试用例 3: 创建带多个标签的文档
    const multiTagData = {
      title: '测试多标签文档',
      content: '这是一个测试多标签文档的内容',
      summary: '测试多标签文档摘要',
      category_id: '1',
      tags: ['测试', '多标签', '示例'],
      status: 'draft'
    };
    await this.testCreateDocument(multiTagData);

    // 测试用例 4: 获取文档列表
    await this.testListDocuments();

    // 输出测试报告
    this.logger.printReport();
  }
}

// 运行测试
async function runTests() {
  try {
    const testSuite = new DocumentCreationTestSuite();
    await testSuite.runAllTests();
  } catch (error) {
    console.error('测试套件执行失败:', error);
  }
}

runTests();
