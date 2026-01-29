import * as XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

export const ExcelService = {
  /**
   * 解析账号 Excel 文件
   * @param {string} filePath 文件路径
   * @returns {Array} 解析后的账号列表
   */
  parseAccountExcel(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // 映射 Excel 列名到数据库字段
    // 假设 Excel 表头为：博主姓名, 账号昵称, 账号类型, 平台ID, 主页链接, 粉丝数, 合作类型, 联系方式, 备注
    return data.map(row => ({
      blogger_name: row['博主姓名'] || '',
      account_nickname: row['账号昵称'] || '',
      account_type: row['账号类型'] || '',
      account_id: row['平台ID'] || '',
      homepage_url: row['主页链接'] || '',
      fans_count: parseInt(row['粉丝数']) || 0,
      cooperation_type: row['合作类型'] || '',
      contact: row['联系方式'] || '',
      remark: row['备注'] || '',
      status: 1, // 默认正常
      is_swap: 0,
      extra_json: '{}'
    }));
  },

  /**
   * 导出账号到 Excel
   * @param {Array} accounts 账号列表
   * @param {string} savePath 保存路径
   */
  exportAccountsToExcel(accounts, savePath) {
    const exportData = accounts.map(a => ({
      '博主姓名': a.blogger_name,
      '账号昵称': a.account_nickname,
      '账号类型': a.account_type,
      '平台ID': a.account_id,
      '主页链接': a.homepage_url,
      '粉丝数': a.fans_count,
      '合作类型': a.cooperation_type,
      '联系方式': a.contact,
      '备注': a.remark,
      '状态': a.status === 1 ? '正常' : '暂停'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '账号列表');
    
    XLSX.writeFile(workbook, savePath);
  }
};
