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

    return data.map(row => {
      // 构建 extra_json
      const extra = {
        authorization: row['授权'] || '',
        info_stream: row['信息流'] || '',
        agency: row['机构'] || row['所属MCN机构'] || '',
        interaction: row['互动'] || '',
        phone: row['电话'] || row['联系手机号'] || '',
        pugongying_url: row['蒲公英链接'] || '',
        wechat: row['微信'] || row['联系微信号'] || '',
        
        // 新增字段
        total_like_collect: parseNumber(row['总赞藏数'] || row['总赞藏数(填写具体数字)']),
        avg_interaction_count: parseNumber(row['图文平均互动量'] || row['平均互动量'] || row['平时平均互动数']),
        max_interaction_count: parseNumber(row['最高互动量']), // Excel可能无此字段
        fans_gender_ratio: row['粉丝男女比例'] || '', // Excel可能无此字段
        fans_age_distribution: row['粉丝年龄分布'] || row['粉丝年龄画像'] || row['粉丝年龄画像/粉丝画像年龄范围'] || '',
        fans_region_distribution: row['粉丝地域分布'] || '', // Excel可能无此字段
        content_tags: row['内容标签'] || row['账号类目'] || row['账号类型/领域'] || '',
        cooperation_experience: row['合作品牌'] || row['过往合作案例'] || '', // Excel可能无此字段
        note_price_video: parseNumber(row['视频笔记报价'] || row['报备视频报价'] || row['报备视频价格(裸价)']),
        live_price: parseNumber(row['直播报价']), // Excel可能无此字段
        shipping_address: row['收货地址'] || row['寄样地址'] || row['收件地址+邮编'] || '',
        id_card: row['身份证号'] || '', // Excel可能无此字段
        bank_card: row['银行卡号'] || '', // Excel可能无此字段
        open_bank: row['开户行'] || '', // Excel可能无此字段
        alipay_name: row['支付宝姓名'] || '', // Excel可能无此字段

        city: row['所在城市'] || row['达人所在城市'] || '',
        estimated_play_count: parseNumber(row['预估播放量']),
        estimated_interaction_count: parseNumber(row['预估互动量']),
        blogger_level: row['达人级别'] || row['达人级别(kol/koc/素人)'] || '',
        private_price: parseNumber(row['水下价格'] || row['水下报备价格'] || row['水下报备价格(KOC/KOL)']),
        promotion_type: row['推广形式'] || row['推广形式(单品/合集/CP搭配)'] || '',
        earliest_schedule: row['最早档期'] || row['最快可执行档期'] || row['最快可执行档期/具体发布时间'] || '',
        price_protection: parseBoolean(row['是否保价'] || row['是否可保价'] || row['是否可保价至指定月份执行']),
        auth_free_6m: parseBoolean(row['免费授权6个月'] || row['是否免费授权品牌全渠道使用素材6个月']),
        auth_free_1y: parseBoolean(row['免费授权1年'] || row['是否免费授权品牌全渠道使用素材1年(含肖像权)']),
        content_retention: parseBoolean(row['内容保留'] || row['内容是否保留指定时长(12个月/1年)']),
        accept_second_edit: parseBoolean(row['接受二剪'] || row['是否接受素材二次剪辑']),
        accept_competitor_exclusion: parseBoolean(row['接受排竞'] || row['是否接受排竞(前后指定天数)']),
        can_buy_product: parseBoolean(row['自费购买'] || row['是否可自费购买推广产品']),
        free_component: parseBoolean(row['免费组件'] || row['是否可免费带组件']),
        product_return: parseBoolean(row['产品回收'] || row['是否接受产品寄拍且回收']),
        provide_raw_face: parseBoolean(row['提供素颜'] || row['是否可提供脸部素颜图/对比图']),
        accept_face_show: parseBoolean(row['接受露脸'] || row['是否接受露脸拍摄']),
        receiver_name: row['收件人'] || row['收件人姓名'] || ''
      };

      // 解析数值
      const parseNumber = (val) => {
        if (!val) return 0;
        const num = parseFloat(String(val).replace(/[^\d.]/g, ''));
        return isNaN(num) ? 0 : num;
      };

      // 解析布尔/是否
      const parseBoolean = (val) => {
        if (!val) return 0;
        return String(val).includes('是') || String(val).toLowerCase() === 'yes' || String(val) === '1' ? 1 : 0;
      };

      return {
        blogger_name: row['博主姓名'] || row['博主昵称'] || '',
        account_nickname: row['账号昵称'] || row['博主昵称'] || '',
        account_type: row['账号类型'] || '',
        account_id: row['平台ID'] || row['账号ID'] || '',
        homepage_url: row['主页链接'] || row['账号链接'] || '',
        fans_count: parseNumber(row['粉丝数'] || row['粉丝数量']),
        like_count: parseNumber(row['赞藏数量']),
        quote_single: parseNumber(row['报备图文报价']),
        quote_package: parseNumber(row['报备视频报价']),
        cooperation_type: row['合作类型'] || '',
        contact: row['联系方式'] || row['微信'] || row['电话'] || '',
        remark: row['备注'] || '',
        status: 1, // 默认正常
        is_swap: parseBoolean(row['是否接受置换'] || row['是否需要试用']),
        extra_json: JSON.stringify(extra)
      };
    });
  },

  /**
   * 导出账号到 Excel
   * @param {Array} accounts 账号列表
   * @param {string} savePath 保存路径
   * @param {Array} fields 导出字段配置 [{label: '列名', name: '字段名'}]
   */
  exportAccountsToExcel(accounts, savePath, fields) {
    const exportData = accounts.map(a => {
      let extra = {};
      try {
        extra = a.extra_json ? JSON.parse(a.extra_json) : {};
      } catch (e) {
        console.error('Failed to parse extra_json', e);
      }

      // 合并基础字段和 extra 字段，方便统一取值
      const flatAccount = {
        ...a,
        ...extra,
        // 特殊处理字段
        // 如果是布尔值，转换为是/否；如果是字符串（已经转换过），则保留
        is_swap: (typeof a.is_swap === 'boolean') ? (a.is_swap ? '是' : '否') : a.is_swap,
        // 注意：Account.vue 传递过来的已经是格式化过的 formattedAccounts，
        // 其中 is_swap 已经是 '是'/'否'，status 已经是中文。
        // 所以我们主要需要根据 fields 来提取数据。
      };

      const row = {};
      fields.forEach(field => {
        // field.name 可能是 'account_id' (native) 或 'wechat' (extra)
        // 在 Account.vue 中，我们传递的 customFields 的 name 就是数据库字段名或 extra 中的 key
        
        // 尝试从 flatAccount 中获取
        let value = flatAccount[field.name];
        
        // 如果没有值，尝试从 extra 中获取 (以防 flatAccount 覆盖不完全或者 name 是 extra 的 key)
        if (value === undefined && extra[field.name] !== undefined) {
          value = extra[field.name];
        }

        row[field.label] = value || '';
      });

      return row;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '账号列表');
    
    XLSX.writeFile(workbook, savePath);
  }
};
