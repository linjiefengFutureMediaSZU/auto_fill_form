export const FORM_TYPES = {
  TENCENT: '腾讯文档',
  WENJUANXING: '问卷星',
  SHIMO: '石墨文档',
  MIKE: '麦克CRM',
  WPS: 'WPS表单',
  MINIPROGRAM: '微信小程序',
  OTHER: '其他'
}

export const FIELD_TYPES = {
  INPUT: '输入框',
  SELECT: '下拉框',
  RADIO: '单选框',
  CHECKBOX: '复选框',
  FILE: '文件上传'
}

// 字段自动匹配字典
export const FIELD_MATCH_DICT = {
  'blogger_name': ['博主姓名', '姓名', 'Name', 'Blogger', '博主', '达人'],
  'account_nickname': ['账号昵称', '昵称', 'Nickname', '博主昵称', '达人昵称'],
  'account_type': ['账号类型', '平台', 'Type', '达人类型', '博主类型'],
  'account_id': ['账号ID', 'ID', '平台ID', '小红书ID', '抖音ID', 'B站ID'],
  'homepage_url': ['主页链接', '主页', 'Homepage', 'Link', 'URL', '链接', '个人主页'],
  'fans_count': ['粉丝量', '粉丝数', 'Fans', '粉丝', '关注数'],
  'avg_read_count': ['平均阅读量', '阅读量', 'Read Count', '阅读'],
  'like_count': ['平均点赞量', '点赞量', 'Like Count', '点赞', '赞藏量', '点藏量'],
  'comment_count': ['平均评论量', '评论量', 'Comment Count', '评论'],
  'quote_single': ['单条报价', '报价', 'Quote', 'Price', '图文报价', '报备图文价', '图文价', '直发价'],
  'quote_package': ['套餐报价', 'Package Price', '打包价'],
  'cooperation_type': ['合作形式', 'Cooperation Type', '合作类型'],
  'contact': ['联系方式', '联系人', 'Contact', 'Phone', 'Mobile', 'WeChat', 'Email', '电话', '手机', '微信', '邮箱'],
  'total_like_collect': ['总赞藏数', 'Total Likes', '赞藏总数', '获赞与收藏'],
  'avg_interaction_count': ['平均互动量', 'Interaction', '互动量', '互动'],
  'content_tags': ['内容标签', 'Tags', '标签', '擅长领域', '垂类'],
  'note_price_video': ['视频报价', 'Video Price', '视频价', '报备视频价'],
  'shipping_address': ['收货地址', '地址', 'Address', '寄送地址', '收件地址'],
  'id_card': ['身份证号', '身份证', 'ID Card', '证件号'],
  'bank_card': ['银行卡号', '银行卡', 'Bank Card', '卡号'],
  'alipay_name': ['支付宝姓名', 'Alipay Name', '支付宝'],
  'city': ['所在城市', '城市', 'City', 'Location', '居住地', '常驻地'],
  'promotion_type': ['推广形式', 'Promotion Type', '推广类型']
};
