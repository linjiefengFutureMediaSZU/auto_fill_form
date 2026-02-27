// Actually, moving i18n out is tricky because `t` is a function.
// Better to export a function that takes `t` as an argument.

export const getDefaultAccountFields = (t) => [
  {
    id: 'account_nickname',
    label: t('account.nickname'),
    name: 'account_nickname',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.nickname'),
    defaultValue: '',
    required: true,
    unremovable: true
  },
  {
    id: 'homepage_url',
    label: t('form.homepageUrl'),
    name: 'homepage_url',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('form.homepageUrl'),
    defaultValue: '',
    required: true,
    unremovable: true
  },
  {
    id: 'account_type',
    label: t('account.accountType'),
    name: 'account_type',
    type: 'select',
    group: 'basic',
    placeholder: t('account.select') + t('account.accountType'),
    defaultValue: '',
    options: [
      { label: t('dynamicForm.types.douyin'), value: 'douyin' },
      { label: t('dynamicForm.types.xiaohongshu'), value: 'xiaohongshu' },
      { label: t('dynamicForm.types.shipinhao'), value: 'shipinhao' },
      { label: t('dynamicForm.types.weibo'), value: 'weibo' },
      { label: t('dynamicForm.types.bilibili'), value: 'bilibili' },
      { label: t('dynamicForm.types.kuaishou'), value: 'kuaishou' },
      { label: t('dynamicForm.types.wechat'), value: 'wechat' },
      { label: t('dynamicForm.types.other'), value: 'other' }
    ],
    required: true,
    unremovable: true
  },
  {
    id: '1',
    label: t('account.wechat'),
    name: 'wechat',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.wechat'),
    defaultValue: '',
    required: false
  },
  {
    id: '2',
    label: t('account.email'),
    name: 'email',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.email'),
    defaultValue: '',
    required: false
  },
  {
    id: '3',
    label: t('account.fansCount'),
    name: 'fans_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.fansCount'),
    defaultValue: 0,
    required: false,
    unremovable: true
  },
  {
    id: '4',
    label: t('account.avgRead'),
    name: 'avg_read_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.avgRead'),
    defaultValue: 0,
    required: false
  },
  {
    id: '5',
    label: t('account.likeCount'),
    name: 'like_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.likeCount'),
    defaultValue: 0,
    required: false
  },
  {
    id: '6',
    label: t('account.commentCount'),
    name: 'comment_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.commentCount'),
    defaultValue: 0,
    required: false
  },
  {
    id: '7',
    label: t('account.interactionRate'),
    name: 'interaction_rate',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.interactionRate'),
    defaultValue: '0',
    required: false
  },
  {
    id: '8',
    label: t('account.contentType'),
    name: 'content_type',
    type: 'text',
    group: 'data',
    placeholder: t('account.enter') + t('account.contentType'),
    defaultValue: '',
    required: false
  },
  {
    id: '9',
    label: t('account.quotePackage'),
    name: 'quote_package',
    type: 'number',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.quotePackage'),
    defaultValue: 0,
    required: false
  },
  {
    id: '10',
    label: t('account.cooperationType'),
    name: 'cooperation_type',
    type: 'multiple_select',
    group: 'cooperation',
    placeholder: t('account.select') + t('account.cooperationType'),
    defaultValue: [],
    options: t('account.cooperationOptions'),
    required: false
  },
  {
    id: '11',
    label: t('account.isSwap'),
    name: 'is_swap',
    type: 'switch',
    group: 'cooperation',
    placeholder: '',
    defaultValue: false,
    required: false
  },
  {
    id: '12',
    label: t('account.contact'),
    name: 'contact',
    type: 'text',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.contact'),
    defaultValue: '',
    required: false
  },
  {
    id: '13',
    label: t('account.cooperationCount'),
    name: 'cooperation_count',
    type: 'number',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.cooperationCount'),
    defaultValue: '0',
    required: false
  },
  {
    id: '14',
    label: t('account.commissionRate'),
    name: 'commission_rate',
    type: 'number',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.commissionRate'),
    defaultValue: '0',
    required: false
  },
  {
    id: '15',
    label: t('common.remark'),
    name: 'remark',
    type: 'text',
    group: 'remark',
    placeholder: t('account.enter') + t('common.remark'),
    defaultValue: '',
    required: false
  },
  {
    id: '16',
    label: t('account.accountFeatures'),
    name: 'account_features',
    type: 'text',
    group: 'remark',
    placeholder: t('account.enter') + t('account.accountFeatures'),
    defaultValue: '',
    required: false
  },
  {
    id: '17',
    label: t('account.operationStrategy'),
    name: 'operation_strategy',
    type: 'text',
    group: 'remark',
    placeholder: t('account.enter') + t('account.operationStrategy'),
    defaultValue: '',
    required: false
  },
  {
    id: '18',
    label: t('account.authorization'),
    name: 'authorization',
    type: 'text',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.authorization'),
    defaultValue: '',
    required: false
  },
  {
    id: '19',
    label: t('account.infoStream'),
    name: 'info_stream',
    type: 'text',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.infoStream'),
    defaultValue: '',
    required: false
  },
  {
    id: '20',
    label: t('account.agency'),
    name: 'agency',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.agency'),
    defaultValue: '',
    required: false
  },
  {
    id: '21',
    label: t('account.interaction'),
    name: 'interaction',
    type: 'text',
    group: 'data',
    placeholder: t('account.enter') + t('account.interaction'),
    defaultValue: '',
    required: false
  },
  {
    id: '22',
    label: t('account.phone'),
    name: 'phone',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.phone'),
    defaultValue: '',
    required: false
  },
  {
    id: '23',
    label: t('account.pugongyingUrl'),
    name: 'pugongying_url',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.pugongyingUrl'),
    defaultValue: '',
    required: false
  },
  {
    id: '25',
    label: t('account.totalLikeCollect'),
    name: 'total_like_collect',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.totalLikeCollect'),
    defaultValue: 0,
    required: false
  },
  {
    id: '26',
    label: t('account.avgInteraction'),
    name: 'avg_interaction_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.avgInteraction'),
    defaultValue: 0,
    required: false
  },
  {
    id: '27',
    label: t('account.maxInteraction'),
    name: 'max_interaction_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.maxInteraction'),
    defaultValue: 0,
    required: false
  },
  {
    id: '28',
    label: t('account.fansGender'),
    name: 'fans_gender_ratio',
    type: 'text',
    group: 'data',
    placeholder: t('account.enter') + t('account.fansGender'),
    defaultValue: '',
    required: false
  },
  {
    id: '29',
    label: t('account.fansAge'),
    name: 'fans_age_distribution',
    type: 'text',
    group: 'data',
    placeholder: t('account.enter') + t('account.fansAge'),
    defaultValue: '',
    required: false
  },
  {
    id: '30',
    label: t('account.fansRegion'),
    name: 'fans_region_distribution',
    type: 'text',
    group: 'data',
    placeholder: t('account.enter') + t('account.fansRegion'),
    defaultValue: '',
    required: false
  },
  {
    id: '31',
    label: t('account.contentTags'),
    name: 'content_tags',
    type: 'text',
    group: 'data',
    placeholder: t('account.enter') + t('account.contentTags'),
    defaultValue: '',
    required: false
  },
  {
    id: '32',
    label: t('account.cooperationExperience'),
    name: 'cooperation_experience',
    type: 'text',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.cooperationExperience'),
    defaultValue: '',
    required: false
  },
  {
    id: '33',
    label: t('account.videoPrice'),
    name: 'note_price_video',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.videoPrice'),
    defaultValue: 0,
    required: false
  },
  {
    id: '34',
    label: t('account.livePrice'),
    name: 'live_price',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.livePrice'),
    defaultValue: 0,
    required: false
  },
  {
    id: '35',
    label: t('account.shippingAddress'),
    name: 'shipping_address',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.shippingAddress'),
    defaultValue: '',
    required: false
  },
  {
    id: '36',
    label: t('account.idCard'),
    name: 'id_card',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.idCard'),
    defaultValue: '',
    required: false
  },
  {
    id: '37',
    label: t('account.bankCard'),
    name: 'bank_card',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.bankCard'),
    defaultValue: '',
    required: false
  },
  {
    id: '38',
    label: t('account.openBank'),
    name: 'open_bank',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.openBank'),
    defaultValue: '',
    required: false
  },
  {
    id: '39',
    label: t('account.alipayName'),
    name: 'alipay_name',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.alipayName'),
    defaultValue: '',
    required: false
  },
  {
    id: '40',
    label: t('account.city'),
    name: 'city',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.city'),
    defaultValue: '',
    required: false
  },
  {
    id: '41',
    label: t('account.estimatedPlayCount'),
    name: 'estimated_play_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.estimatedPlayCount'),
    defaultValue: 0,
    required: false
  },
  {
    id: '42',
    label: t('account.estimatedInteractionCount'),
    name: 'estimated_interaction_count',
    type: 'number',
    group: 'data',
    placeholder: t('account.enter') + t('account.estimatedInteractionCount'),
    defaultValue: 0,
    required: false
  },
  {
    id: '43',
    label: t('account.bloggerLevel'),
    name: 'blogger_level',
    type: 'select',
    group: 'basic',
    placeholder: t('account.select') + t('account.bloggerLevel'),
    defaultValue: '',
    options: 'KOL, KOC, 素人',
    required: false
  },
  {
    id: '44',
    label: t('account.privatePrice'),
    name: 'private_price',
    type: 'number',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.privatePrice'),
    defaultValue: 0,
    required: false
  },
  {
    id: '45',
    label: t('account.promotionType'),
    name: 'promotion_type',
    type: 'text',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.promotionType'),
    defaultValue: '',
    required: false
  },
  {
    id: '46',
    label: t('account.earliestSchedule'),
    name: 'earliest_schedule',
    type: 'text',
    group: 'cooperation',
    placeholder: t('account.enter') + t('account.earliestSchedule'),
    defaultValue: '',
    required: false
  },
  {
    id: '47',
    label: t('account.priceProtection'),
    name: 'price_protection',
    type: 'switch',
    group: 'cooperation',
    defaultValue: false,
    required: false
  },
  {
    id: '48',
    label: t('account.authFree6m'),
    name: 'auth_free_6m',
    type: 'switch',
    group: 'cooperation',
    defaultValue: false,
    required: false
  },
  {
    id: '49',
    label: t('account.authFree1y'),
    name: 'auth_free_1y',
    type: 'switch',
    group: 'cooperation',
    defaultValue: false,
    required: false
  },
  {
    id: '50',
    label: t('account.contentRetention'),
    name: 'content_retention',
    type: 'switch',
    group: 'cooperation',
    defaultValue: false,
    required: false
  },
  {
    id: '51',
    label: t('account.acceptSecondEdit'),
    name: 'accept_second_edit',
    type: 'switch',
    group: 'cooperation',
    defaultValue: false,
    required: false
  },
  {
    id: '52',
    label: t('account.acceptCompetitorExclusion'),
    name: 'accept_competitor_exclusion',
    type: 'switch',
    group: 'cooperation',
    defaultValue: false,
    required: false
  },
  {
    id: '53',
    label: t('account.canBuyProduct'),
    name: 'can_buy_product',
    type: 'switch',
    group: 'cooperation',
    defaultValue: false,
    required: false
  },
  {
    id: '54',
    label: t('account.freeComponent'),
    name: 'free_component',
    type: 'switch',
    group: 'cooperation',
    defaultValue: false,
    required: false
  },
  {
    id: '55',
    label: t('account.productReturn'),
    name: 'product_return',
    type: 'switch',
    group: 'cooperation',
    defaultValue: false,
    required: false
  },
  {
    id: '56',
    label: t('account.provideRawFace'),
    name: 'provide_raw_face',
    type: 'switch',
    group: 'cooperation',
    defaultValue: false,
    required: false
  },
  {
    id: '57',
    label: t('account.acceptFaceShow'),
    name: 'accept_face_show',
    type: 'switch',
    group: 'cooperation',
    defaultValue: false,
    required: false
  },
  {
    id: '58',
    label: t('account.receiverName'),
    name: 'receiver_name',
    type: 'text',
    group: 'basic',
    placeholder: t('account.enter') + t('account.receiverName'),
    defaultValue: '',
    required: false
  },
  {
    id: '24',
    label: t('account.accountStatus'),
    name: 'status',
    type: 'select',
    group: 'basic',
    placeholder: t('account.select') + t('account.accountStatus'),
    defaultValue: 1,
    options: [
      { label: t('account.statusNormal'), value: 1 },
      { label: t('account.statusPaused'), value: 2 },
      { label: t('account.statusExpired'), value: 0 }
    ],
    required: false
  }
]
