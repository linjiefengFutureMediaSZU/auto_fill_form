<template>
  <div class="account-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="title">{{ $t('account.title') }}</h2>
    </div>

    <!-- 搜索筛选区 -->
    <div class="search-filter glass-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item :label="$t('account.searchKeyword')">
          <el-input
            v-model="searchForm.keyword"
            :placeholder="$t('account.searchPlaceholder')"
            clearable
            @keyup.enter="handleSearch"
            style="width: 200px;"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item :label="$t('account.accountType')">
          <el-select v-model="searchForm.account_type" :placeholder="$t('account.selectType')" clearable style="width: 150px;">
            <el-option :label="$t('dynamicForm.types.douyin')" value="douyin" />
            <el-option :label="$t('dynamicForm.types.xiaohongshu')" value="xiaohongshu" />
            <el-option :label="$t('dynamicForm.types.shipinhao')" value="shipinhao" />
            <el-option :label="$t('dynamicForm.types.weibo')" value="weibo" />
            <el-option :label="$t('dynamicForm.types.bilibili')" value="bilibili" />
            <el-option :label="$t('dynamicForm.types.kuaishou')" value="kuaishou" />
            <el-option :label="$t('dynamicForm.types.wechat')" value="wechat" />
            <el-option :label="$t('dynamicForm.types.other')" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('account.accountStatus')">
          <el-select v-model="searchForm.status" :placeholder="$t('account.selectStatus')" clearable style="width: 150px;">
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="String(opt.value)"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-tooltip :content="$t('common.search')" placement="top">
            <el-button circle size="small" type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip :content="$t('common.reset')" placement="top">
            <el-button circle size="small" @click="resetSearch">
              <el-icon><Refresh /></el-icon>
            </el-button>
          </el-tooltip>
        </el-form-item>
      </el-form>
    </div>

    <!-- 账号管理功能 -->
    <div class="account-management glass-card">
      <h3 class="subtitle">{{ $t('account.title') }}</h3>
      <div class="header-actions" style="margin-top: 10px; display: flex; gap: 16px; align-items: center;">
        <el-tooltip :content="$t('account.addAccount')" placement="top">
          <el-button circle size="small" type="primary" plain @click="openAddAccountDialog">
            <el-icon><Plus /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('account.groupManager')" placement="top">
          <el-button circle size="small" type="primary" plain @click="groupManagerVisible = true">
            <el-icon><Folder /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('account.fieldManager')" placement="top">
          <el-button circle size="small" type="warning" plain @click="toggleFieldManager">
            <el-icon><Edit /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('account.columnDisplay')" placement="top">
          <el-button circle size="small" type="info" plain @click="columnDisplayVisible = true">
            <el-icon><Setting /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('account.batchImport')" placement="top">
          <el-button circle size="small" type="primary" plain @click="handleBatchImport">
            <el-icon><Download /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('account.batchExport')" placement="top">
          <el-button circle size="small" type="success" plain @click="handleBatchExport">
            <el-icon><Upload /></el-icon>
          </el-button>
        </el-tooltip>
        <el-tooltip :content="$t('account.batchDelete')" placement="top">
          <el-button circle size="small" type="danger" plain @click="handleBatchDelete">
            <el-icon><Delete /></el-icon>
          </el-button>
        </el-tooltip>
      </div>
    </div>


    <!-- 账号列表 -->
    <div class="account-list-area glass-card">
      <!-- 账号表格 -->
      <el-table
        v-loading="loading"
        :data="filteredAccounts"
        style="width: 100%; height: 100%;"
        height="100%"
        @selection-change="handleSelectionChange"
        border
      >
        <el-table-column type="selection" width="55" :resizable="false" />
        
        <template v-for="col in displayColumns" :key="col.prop">
          <!-- ID -->
          <el-table-column 
            v-if="col.prop === 'id'" 
            prop="id" 
            :label="col.label" 
            width="80" 
            :resizable="false" 
          />

          <!-- Nickname -->
          <el-table-column 
            v-else-if="col.prop === 'account_nickname'" 
            prop="account_nickname" 
            :label="col.label" 
            min-width="180" 
            :resizable="false"
          >
            <template #default="scope">
              <div class="account-info">
                <span class="nickname">{{ scope.row.account_nickname }}</span>
                <span class="type-tag">{{ getAccountTypeLabel(scope.row.account_type) }}</span>
              </div>
            </template>
          </el-table-column>

          <!-- Fans Count -->
          <el-table-column 
            v-else-if="col.prop === 'fans_count'" 
            prop="fans_count" 
            :label="col.label" 
            width="120" 
            :resizable="false"
          >
            <template #default="scope">
              {{ formatNumber(scope.row.fans_count) }}
            </template>
          </el-table-column>

          <!-- Quote Single -->
          <el-table-column 
            v-else-if="col.prop === 'quote_single'" 
            prop="quote_single" 
            :label="col.label" 
            width="120" 
            :resizable="false"
          >
            <template #default="scope">
              ¥{{ scope.row.quote_single ? Number(scope.row.quote_single).toFixed(2) : '0.00' }}
            </template>
          </el-table-column>

          <!-- Status -->
          <el-table-column 
            v-else-if="col.prop === 'status'" 
            prop="status" 
            :label="col.label" 
            width="100" 
            :resizable="false"
          >
            <template #default="scope">
              <el-tag
                :type="getTagType(scope.row.status)"
                size="small"
              >
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- Default for others -->
          <el-table-column
            v-else
            :prop="col.prop"
            :label="col.label"
            min-width="120"
            :resizable="false"
            show-overflow-tooltip
          />
        </template>

        <el-table-column :label="$t('common.operation')" width="120" fixed="right" :resizable="false" align="center">
          <template #default="scope">
            <div class="table-actions" style="display: flex; justify-content: center; gap: 8px;">
              <el-tooltip :content="$t('common.edit')" placement="top">
                <el-button
                  circle
                  size="small"
                  type="primary"
                  plain
                  @click="openEditAccountDialog(scope.row)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip :content="$t('common.delete')" placement="top">
                <el-button
                  circle
                  size="small"
                  type="danger"
                  plain
                  @click="handleDeleteAccount(scope.row.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 分组管理弹窗 -->
    <el-dialog
      v-model="groupManagerVisible"
      :title="$t('account.groupManager')"
      width="600px"
    >
      <div style="margin-bottom: 16px;">
        <el-button type="primary" size="small" @click="openAddGroupDialog">
          <el-icon><Plus /></el-icon> {{ $t('account.addGroup') }}
        </el-button>
      </div>
      <el-table :data="groups" border style="width: 100%" height="400">
        <el-table-column prop="group_name" :label="$t('account.groupName')" />
        <el-table-column prop="description" :label="$t('account.groupDesc')" show-overflow-tooltip />
        <el-table-column :label="$t('common.operation')" width="150" align="center">
          <template #default="scope">
            <div style="display: flex; justify-content: center; gap: 8px;">
              <el-button size="small" type="primary" link @click="openEditGroupDialog(scope.row)">
                {{ $t('common.edit') }}
              </el-button>
              <el-button size="small" type="danger" link @click="handleDeleteGroup(scope.row.id)">
                {{ $t('common.delete') }}
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupManagerVisible = false">{{ $t('common.close') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑账号弹窗 -->
    <el-dialog
      v-model="accountDialogVisible"
      :title="isEditMode ? $t('account.editAccount') : $t('account.addAccount')"
      width="800px"
    >
      <el-form
        :model="accountForm"
        :rules="accountRules"
        ref="accountFormRef"
        label-width="100px"
        class="account-form"
      >
        <!-- 动态表单 -->
        <dynamic-form 
          :model-value="accountForm" 
          @update:model-value="(val) => Object.assign(accountForm, val)"
          :fields="customFields" 
          :key="dynamicFormKey" 
        />


        <!-- 分组和状态 -->
        <el-form-item :label="$t('account.group')">
          <el-select v-model="accountForm.group_id" :placeholder="$t('account.selectGroup')">
            <el-option
              v-for="group in groups"
              :key="group.id"
              :label="group.group_name"
              :value="group.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="accountDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveAccount">{{ $t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 新增/编辑分组弹窗 -->
    <el-dialog
      v-model="groupDialogVisible"
      :title="isEditGroupMode ? $t('account.editGroup') : $t('account.addGroup')"
      width="400px"
      append-to-body
    >
      <el-form
        :model="groupForm"
        :rules="groupRules"
        ref="groupFormRef"
        label-width="80px"
      >
        <el-form-item :label="$t('account.groupName')" prop="group_name">
          <el-input v-model="groupForm.group_name" :placeholder="$t('account.inputGroupName')" />
        </el-form-item>
        <el-form-item :label="$t('account.groupDesc')">
          <el-input
            v-model="groupForm.description"
            type="textarea"
            rows="2"
            :placeholder="$t('account.inputGroupDesc')"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="groupDialogVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveGroup">{{ $t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 字段管理弹窗 -->
    <el-dialog
      v-model="fieldManagerVisible"
      :title="$t('account.fieldManager')"
      width="800px"
    >
      <dynamic-field-manager v-model="tempCustomFields" embedded />
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="fieldManagerVisible = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="saveFieldManagerConfig">{{ $t('common.save') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 表格编辑弹窗 -->
    <el-dialog
      v-model="columnDisplayVisible"
      :title="$t('account.tableEdit')"
      width="800px"
    >
      <div style="margin-bottom: 15px; display: flex; justify-content: flex-end; gap: 10px;">
        <el-button size="small" type="primary" link @click="handleCheckAll">{{ $t('common.selectAll') }}</el-button>
        <el-button size="small" type="primary" link @click="handleUncheckAll">{{ $t('common.unselectAll') }}</el-button>
      </div>

      <VueDraggable
        v-model="columnsConfig"
        item-key="prop"
        handle=".drag-handle"
        class="column-list"
        :animation="200"
      >
        <template #item="{ element }">
           <div class="column-item">
             <el-icon class="drag-handle"><Rank /></el-icon>
             <el-checkbox v-model="element.visible">{{ element.label }}</el-checkbox>
           </div>
        </template>
      </VueDraggable>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="columnDisplayVisible = false">{{ $t('common.confirm') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch, nextTick } from 'vue'
import { useAccountStore } from '../../stores'
import { Plus, More, Upload, Download, Edit, Delete, Search, Refresh, ArrowDown, Setting, Rank, Folder } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DynamicFieldManager from '../../components/DynamicFieldManager.vue'
import DynamicForm from '../../components/DynamicForm.vue'
import { useI18n } from 'vue-i18n'
import VueDraggable from 'vuedraggable'

const { t } = useI18n()

// 状态管理
const accountStore = useAccountStore()

// 响应式数据
const loading = ref(false)
const groupLoading = ref(false)
const accountDialogVisible = ref(false)
const groupManagerVisible = ref(false)
const groupDialogVisible = ref(false)
const isEditMode = ref(false)
const isEditGroupMode = ref(false)
const selectedAccountIds = ref([])
const activeCollapseNames = ref(['basic'])
const fieldManagerVisible = ref(false)
const columnDisplayVisible = ref(false)
const customFields = ref([
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
])

// 标准列定义
const standardColumns = computed(() => [
  { label: t('common.id'), prop: 'id' },
  { label: t('account.nickname'), prop: 'account_nickname' },
  { label: t('account.quoteSingle'), prop: 'quote_single' }
])

// 列配置（包含顺序和可见性）
const columnsConfig = ref([])

// 所有可用列
const availableColumns = computed(() => {
  const customCols = customFields.value.map(f => ({ label: f.label, prop: f.name }))
  return [...standardColumns.value, ...customCols]
})

// 表格显示的列（根据配置排序和过滤）
const displayColumns = computed(() => columnsConfig.value.filter(c => c.visible))

// 兼容旧代码的 visibleColumns
const visibleColumns = computed({
  get: () => displayColumns.value.map(c => c.prop),
  set: (val) => {
    columnsConfig.value.forEach(c => {
      c.visible = val.includes(c.prop)
    })
  }
})

// 初始化列配置
const initColumnsConfig = () => {
  const savedConfig = localStorage.getItem('accountColumnsConfig_v1')
  const available = availableColumns.value

  if (savedConfig) {
    try {
      const parsed = JSON.parse(savedConfig)
      const parsedProps = parsed.map(c => c.prop)
      // 新增的列
      const newColumns = available.filter(c => !parsedProps.includes(c.prop))
                              .map(c => ({ ...c, visible: true }))
      
      // 验证已保存的列是否还存在，并更新 label
      const validParsed = parsed.filter(c => available.some(a => a.prop === c.prop))
                              .map(c => {
                                const current = available.find(a => a.prop === c.prop)
                                return { ...c, label: current ? current.label : c.label }
                              })
      
      columnsConfig.value = [...validParsed, ...newColumns]
    } catch (e) {
      console.error('Failed to parse columns config', e)
      columnsConfig.value = available.map(c => ({ ...c, visible: true }))
    }
  } else {
    // 迁移逻辑
    const oldVisibleStr = localStorage.getItem('accountVisibleColumns_v5')
    let oldVisible = []
    if (oldVisibleStr) {
      try {
        oldVisible = JSON.parse(oldVisibleStr)
      } catch (e) {}
    }
    
    if (oldVisible.length > 0) {
       columnsConfig.value = available.map(c => ({
         ...c,
         visible: oldVisible.includes(c.prop)
       }))
    } else {
       const defaults = ['id', 'account_nickname', 'fans_count', 'quote_single', 'is_swap', 'status', 'authorization', 'info_stream', 'agency', 'interaction', 'phone', 'pugongying_url', 'wechat', 'email']
       columnsConfig.value = available.map(c => ({
         ...c,
         visible: defaults.includes(c.prop)
       }))
    }
  }
}

// 全选列
const handleCheckAll = () => {
  columnsConfig.value.forEach(col => col.visible = true)
}

// 取消全选列
const handleUncheckAll = () => {
  columnsConfig.value.forEach(col => col.visible = false)
}

// 监听 columnsConfig 变化并保存
watch(columnsConfig, () => {
  localStorage.setItem('accountColumnsConfig_v1', JSON.stringify(columnsConfig.value))
}, { deep: true })


// 搜索表单
const searchForm = reactive({
  keyword: '',
  account_type: '',
  status: ''
})



// 账号表单
const accountForm = reactive({
  account_nickname: '',
  account_type: '',
  homepage_url: '',
  fans_count: 0,
  avg_read_count: 0,
  like_count: 0,
  comment_count: 0,
  quote_single: [0],
  quote_package: 0,
  cooperation_type: [],
  is_swap: false,
  authorization: '',
  info_stream: '',
  agency: '',
  interaction: '',
  phone: '',
  pugongying_url: '',
  wechat: '',
  email: '',
  contact: '',
  remark: '',
  group_id: '',
  status: 1
})

// 账号表单验证规则
const accountRules = computed(() => ({
  account_nickname: [{ required: true, message: t('account.enter') + t('account.nickname'), trigger: 'blur' }],
  account_type: [{ required: true, message: t('account.select') + t('account.accountType'), trigger: 'change' }],
  homepage_url: [{ required: true, message: t('account.enter') + t('form.homepageUrl'), trigger: 'blur' }],
  fans_count: [{ required: true, message: t('account.enter') + t('account.fansCount'), trigger: 'blur' }],
  quote_single: [{ required: true, message: t('account.enter') + t('account.quoteSingle'), trigger: 'blur' }]
}))

// 状态选项
const statusOptions = computed(() => {
  const statusField = customFields.value.find(f => f.name === 'status')
  if (statusField && statusField.options) {
    if (Array.isArray(statusField.options)) return statusField.options
    if (typeof statusField.options === 'string') {
      const parts = statusField.options.split(/[,，]/).map(opt => opt.trim()).filter(opt => opt)
      const hasKeyValue = parts.some(part => part.includes(':') || part.includes('：'))
      
      if (hasKeyValue) {
        return parts.map(part => {
          const [label, value] = part.split(/[:：]/).map(s => s.trim())
          const numValue = Number(value)
          return {
            label: label || value,
            value: !isNaN(numValue) && value !== '' ? numValue : value
          }
        })
      }
      return parts.map(p => ({ label: p, value: p }))
    }
  }
  return [
    { label: t('account.statusNormal'), value: 1 },
    { label: t('account.statusPaused'), value: 2 },
    { label: t('account.statusExpired'), value: 0 }
  ]
})

// 分组表单
const groupForm = reactive({
  id: null,
  group_name: '',
  description: ''
})

// 分组表单验证规则
const groupRules = computed(() => ({
  group_name: [{ required: true, message: t('account.inputGroupName'), trigger: 'blur' }]
}))

// 表单引用
const accountFormRef = ref(null)
const groupFormRef = ref(null)

// 计算属性
const accounts = computed(() => accountStore.accounts)
const groups = computed(() => accountStore.groups)

// 筛选后的账号
const filteredAccounts = computed(() => {
  return accounts.value.filter(account => {
    // 关键词搜索
    if (searchForm.keyword) {
      const keyword = searchForm.keyword.toLowerCase()
      if (!account.account_nickname.toLowerCase().includes(keyword)) {
        return false
      }
    }
    // 账号类型筛选
    if (searchForm.account_type && account.account_type !== searchForm.account_type) {
      return false
    }
    // 状态筛选
    if (searchForm.status && account.status.toString() !== searchForm.status) {
      return false
    }
    return true
  })
})



// 分组树属性
const groupTreeProps = {
  children: 'children',
  label: 'group_name'
}

// 方法
// 格式化数字
const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + t('common.unitTenThousand')
  }
  return num
}

// 获取状态文本
const getStatusText = (status) => {
  const option = statusOptions.value.find(opt => String(opt.value) === String(status))
  if (option) return option.label

  // 后备默认映射（以防 statusOptions 为空或未匹配到）
  const statusMap = {
    0: t('account.statusExpired'),
    1: t('account.statusNormal'),
    2: t('account.statusPaused')
  }
  return statusMap[status] || t('common.unknown')
}

// 获取账号类型显示文本
const getAccountTypeLabel = (type) => {
  if (!type) return ''
  // 检查是否为已知的类型 key，如果是则翻译
  const knownTypes = ['weibo', 'wechat', 'douyin', 'kuaishou', 'bilibili', 'xiaohongshu', 'shipinhao', 'other']
  if (knownTypes.includes(type)) {
    return t(`dynamicForm.types.${type}`)
  }
  // 如果不是已知 key（例如已经是中文 "微信公众号"），直接返回
  return type
}

// 获取标签类型
const getTagType = (status) => {
  const typeMap = {
    0: 'danger',
    1: 'success',
    2: 'warning'
  }
  return typeMap[status] || 'info'
}

// 获取分组名称
const getGroupName = (groupId) => {
  if (!groupId) return t('account.group.unorganized')
  const group = groups.value.find(g => g.id === groupId)
  return group ? group.group_name : t('account.group.unorganized')
}

// 获取分组下的账号数量
const getAccountCountByGroup = (groupId) => {
  return accounts.value.filter(account => account.group_id === groupId).length
}

// 搜索
const handleSearch = () => {
  // pagination.currentPage = 1
}

// 重置搜索
const resetSearch = () => {
  Object.keys(searchForm).forEach(key => {
    searchForm[key] = ''
  })
  // pagination.currentPage = 1
}

// 选择处理
const handleSelectionChange = (selection) => {
  selectedAccountIds.value = selection.map(item => item.id)
}

// 全选
const selectAllAccounts = () => {
  accountStore.selectAllAccounts()
  selectedAccountIds.value = accountStore.selectedAccounts
}

// 取消全选
const clearAllSelection = () => {
  accountStore.unselectAllAccounts()
  selectedAccountIds.value = []
}

// 分组点击
const handleGroupClick = (data) => {
  // 这里可以添加按分组筛选的逻辑
  console.log('Group clicked:', data)
}

const tempCustomFields = ref([])
const dynamicFormKey = ref(0)

// 切换字段管理面板
const toggleFieldManager = () => {
  // Deep copy current fields to temp
  tempCustomFields.value = JSON.parse(JSON.stringify(customFields.value))
  fieldManagerVisible.value = true
}

// 保存字段管理配置
const saveFieldManagerConfig = () => {
  customFields.value = JSON.parse(JSON.stringify(tempCustomFields.value))
  fieldManagerVisible.value = false
  // customFields watcher will trigger saveFieldConfig
}

// 保存字段配置到本地存储
const saveFieldConfig = () => {
  localStorage.setItem('customFields_v8', JSON.stringify(customFields.value))
}

// 获取字段配置
const loadFieldConfig = async () => {
  const savedFields = localStorage.getItem('customFields_v8')
  if (savedFields) {
    try {
      const saved = JSON.parse(savedFields)
      
      // 找出所有不可删除的核心字段
      const coreFields = customFields.value.filter(f => f.unremovable)
      const coreFieldNames = coreFields.map(f => f.name)
      
      // 确保保存的配置中包含所有核心字段
      // 如果缺少，从初始配置中补充回来
      const savedNames = saved.map(f => f.name)
      const missingCoreFields = coreFields.filter(f => !savedNames.includes(f.name))
      
      // 最终字段列表 = 保存的字段(包含用户自定义顺序/属性) + 缺失的核心字段
      // 注意：这里我们保留用户的排序，但强制把缺失的核心字段加到最后（或者最前，视情况而定，加到最后比较安全）
      // 为了更好的体验，也许应该把核心字段插回原来的位置？但那样太复杂，先加回来再说。
      // 实际上，如果用户之前删除了核心字段，现在加回来，放在最后是可以接受的。
      // 但更好的做法是：如果核心字段在 saved 里存在，用 saved 里的（可能有修改过 label 等）；
      // 如果不存在，用 default 里的。
      
      // 过滤掉 saved 里可能存在的旧的核心字段（如果名字一样但属性缺了），其实直接用 saved 就行。
      // 关键是补全缺失的。
      
      customFields.value = [...saved, ...missingCoreFields]
      
      // 再次确保 saved 里的核心字段也有 unremovable 属性（防止用户之前的保存里没有这个属性）
      customFields.value.forEach(f => {
        if (coreFieldNames.includes(f.name)) {
          f.unremovable = true
        }
      })
      
    } catch (e) {
      console.error('Failed to load field config:', e)
    }
  }
}

// 添加单条报价项
const addQuoteItem = () => {
  accountForm.quote_single.push(0)
}

// 删除单条报价项
const removeQuoteItem = (index) => {
  accountForm.quote_single.splice(index, 1)
}

// 打开新增账号弹窗
const openAddAccountDialog = () => {
  console.log('Opening Add Account Dialog')
  isEditMode.value = false
  // 重置表单
  Object.keys(accountForm).forEach(key => {
    if (Array.isArray(accountForm[key])) {
      accountForm[key] = []
    } else {
      accountForm[key] = ''
    }
  })
  accountForm.fans_count = 0
  accountForm.avg_read_count = 0
  accountForm.like_count = 0
  accountForm.comment_count = 0
  accountForm.quote_single = [0]
  accountForm.quote_package = 0
  accountForm.is_swap = false
  accountForm.status = 1
  
  console.log('Reset accountForm:', JSON.parse(JSON.stringify(accountForm)))
  accountDialogVisible.value = true
}

// 打开编辑账号弹窗
const openEditAccountDialog = (account) => {
  console.log('Opening Edit Account Dialog', account)
  isEditMode.value = true
  
  // 复制账号数据到表单
  // 先重置表单以防残留
  Object.keys(accountForm).forEach(key => {
    if (Array.isArray(accountForm[key])) {
      accountForm[key] = []
    } else {
      accountForm[key] = ''
    }
  })
  
  // 使用 Object.assign 复制基本字段
  Object.assign(accountForm, account)
  
  // 解析 extra_json 并合并到表单数据中
  if (account.extra_json) {
    try {
      const extra = typeof account.extra_json === 'string' 
        ? JSON.parse(account.extra_json) 
        : account.extra_json
      
      console.log('Parsed extra_json:', extra)
      Object.assign(accountForm, extra)
    } catch (e) {
      console.error('Failed to parse extra_json:', e)
    }
  }

  // 处理合作形式数组
  if (typeof accountForm.cooperation_type === 'string') {
    accountForm.cooperation_type = accountForm.cooperation_type.split(',').filter(Boolean)
  }
  
  // 处理单条报价数组
  if (!Array.isArray(accountForm.quote_single)) {
    // 如果是数字，转为数组
    const val = Number(accountForm.quote_single)
    accountForm.quote_single = !isNaN(val) ? [val] : [0]
  }
  
  console.log('Final accountForm for edit:', JSON.parse(JSON.stringify(accountForm)))
  accountDialogVisible.value = true
}

// 保存账号
const saveAccount = async () => {
  if (!accountFormRef.value) return
  
  console.log('Saving account, form data:', JSON.parse(JSON.stringify(accountForm)))
  
  try {
    await accountFormRef.value.validate()
    
    // 准备提交的数据 - 创建深拷贝，避免直接修改 accountForm 触发 UI 更新/死循环
    let submitData = JSON.parse(JSON.stringify(accountForm))
    
    // 处理合作形式 (仅修改 submitData)
    if (Array.isArray(submitData.cooperation_type)) {
      submitData.cooperation_type = submitData.cooperation_type.join(',')
    }
    
    // 处理单条报价（仅修改 submitData）
    if (Array.isArray(submitData.quote_single)) {
      submitData.quote_single = submitData.quote_single[0] || 0
    }
    
    // 数据库原生字段列表
    const nativeFields = [
      'id', 'group_id', 'blogger_name', 'account_nickname', 'account_type',
      'homepage_url', 'fans_count', 'avg_read_count', 'like_count', 'comment_count',
      'quote_single', 'quote_package', 'cooperation_type', 'is_swap', 'contact',
      'remark', 'status', 'created_at'
    ]
    
    // 打包自定义字段到 extra_json (仅修改 submitData)
    const extraData = {}
    customFields.value.forEach(field => {
      // 从 accountForm 读取原始值
      if (!nativeFields.includes(field.name) && accountForm[field.name] !== undefined) {
        extraData[field.name] = accountForm[field.name]
      }
    })
    submitData.extra_json = JSON.stringify(extraData)
    
    // 移除不在数据库字段列表中的属性，避免 SQL 更新错误 (仅修改 submitData)
    Object.keys(submitData).forEach(key => {
      if (!nativeFields.includes(key) && key !== 'extra_json') {
        delete submitData[key]
      }
    })
    
    console.log('Submit Data:', submitData)
    
    if (isEditMode.value) {
      console.log('Calling updateAccount with id:', submitData.id, 'data:', submitData)
      await accountStore.updateAccount(submitData.id, submitData)
      console.log('Update account successful')
    } else {
      // 新增时移除 id
      if (submitData.id === '') delete submitData.id
      console.log('Calling addAccount with data:', submitData)
      await accountStore.addAccount(submitData)
      console.log('Add account successful')
    }
    
    accountDialogVisible.value = false
    ElMessage.success(isEditMode.value ? t('account.editSuccess') : t('account.addSuccess'))
    
  } catch (error) {
    console.error(t('account.validateErrorConsole'), error)
    // 移除 catch 块中对 accountForm 的恢复逻辑，因为不再修改它
  }
}

// 删除账号
const handleDeleteAccount = (id) => {
  ElMessageBox.confirm(t('account.deleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    await accountStore.deleteAccount(id)
    ElMessage.success(t('account.deleteSuccess'))
  }).catch(() => {
    // 取消删除
  })
}

// 批量删除
const handleBatchDelete = () => {
  if (selectedAccountIds.value.length === 0) {
    ElMessage.warning(t('account.selectDelete'))
    return
  }
  
  ElMessageBox.confirm(t('account.batchDeleteConfirm', { count: selectedAccountIds.value.length }), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    for (const id of selectedAccountIds.value) {
      await accountStore.deleteAccount(id)
    }
    selectedAccountIds.value = []
    ElMessage.success(t('account.deleteSuccess'))
  }).catch(() => {
    // 取消删除
  })
}

// 批量导入
const handleBatchImport = async () => {
  if (!window.electronAPI) {
    ElMessage.warning(t('common.desktopOnly'))
    return
  }
  try {
    const count = await window.electronAPI.excel.importAccounts()
    if (count !== null) {
      ElMessage.success(t('account.importSuccess', { count }))
      // 重新加载数据
      await accountStore.loadInitialData()
      handleSearch()
    }
  } catch (error) {
    console.error('导入失败:', error)
    ElMessage.error(t('account.importFailed'))
  }
}

// 批量导出
const handleBatchExport = async () => {
  if (!window.electronAPI) {
    ElMessage.warning(t('common.desktopOnly'))
    return
  }
  try {
    // 优先导出选中的账号，如果没有选中则导出所有账号
    let accountsToExport = []
    if (selectedAccountIds.value.length > 0) {
      accountsToExport = accounts.value.filter(a => selectedAccountIds.value.includes(a.id))
    } else {
      accountsToExport = accountStore.accounts
    }
    
    if (accountsToExport.length === 0) {
      ElMessage.warning(t('account.noAccountExport'))
      return
    }

    // 构建导出字段配置
    const exportFields = [
      { label: t('common.id'), name: 'id' },
      ...customFields.value.map(f => ({ label: f.label, name: f.name }))
    ]

    // 格式化导出数据
    const formattedAccounts = accountsToExport.map(account => {
      const formatted = { ...account }
      formatted.is_swap = account.is_swap ? '是' : '否'
      formatted.status = getStatusText(account.status)
      return formatted
    })

    const success = await window.electronAPI.excel.exportAccounts(JSON.parse(JSON.stringify(formattedAccounts)), JSON.parse(JSON.stringify(exportFields)))
    if (success) {
      ElMessage.success(t('account.exportSuccess'))
    }
  } catch (error) {
    console.error('Export failed:', error)
    ElMessage.error(t('common.error'))
  }
}



// 打开新增分组弹窗
const openAddGroupDialog = () => {
  isEditGroupMode.value = false
  // 重置表单
  groupForm.id = null
  groupForm.group_name = ''
  groupForm.description = ''
  groupDialogVisible.value = true
}

// 打开编辑分组弹窗
const openEditGroupDialog = (group) => {
  isEditGroupMode.value = true
  // 复制分组数据到表单
  groupForm.id = group.id
  groupForm.group_name = group.group_name
  groupForm.description = group.description || ''
  groupDialogVisible.value = true
}

// 保存分组
const saveGroup = async () => {
  if (!groupFormRef.value) return
  
  try {
    await groupFormRef.value.validate()
    
    const groupData = {
      group_name: groupForm.group_name,
      description: groupForm.description
    }
    
    if (isEditGroupMode.value) {
      await accountStore.updateGroup(groupForm.id, { ...groupData, id: groupForm.id })
    } else {
      await accountStore.addGroup(groupData)
    }
    
    groupDialogVisible.value = false
    ElMessage.success(isEditGroupMode.value ? t('account.editSuccess') : t('account.addSuccess'))
  } catch (error) {
    console.error(t('account.validateErrorConsole'), error)
  }
}

// 删除分组
const handleDeleteGroup = (id) => {
  // 检查分组下是否有账号
  const accountCount = getAccountCountByGroup(id)
  if (accountCount > 0) {
    ElMessage.warning(t('account.groupDeleteWarn', { count: accountCount }))
    return
  }
  
  ElMessageBox.confirm(t('account.groupDeleteConfirm'), t('common.warning'), {
    confirmButtonText: t('common.confirm'),
    cancelButtonText: t('common.cancel'),
    type: 'warning'
  }).then(async () => {
    await accountStore.deleteGroup(id)
    ElMessage.success(t('account.groupDeleteSuccess'))
  }).catch(() => {
    // 取消删除
  })
}

// 生命周期
onMounted(async () => {
  // 加载字段配置
  loadFieldConfig()

  // 初始化列配置
  initColumnsConfig()
})

// 监听字段配置变化，自动保存并同步列配置
watch(customFields, () => {
  saveFieldConfig()
  
  // 同步 columnsConfig
  const currentConfig = [...columnsConfig.value]
  const available = availableColumns.value
  const availableProps = available.map(c => c.prop)
  
  // 移除已删除的字段
  const validConfig = currentConfig.filter(c => availableProps.includes(c.prop))
  const validConfigProps = validConfig.map(c => c.prop)
  
  // 添加新字段
  const newColumns = available.filter(c => !validConfigProps.includes(c.prop))
                          .map(c => ({ ...c, visible: true }))
  
  if (validConfig.length !== currentConfig.length || newColumns.length > 0) {
      columnsConfig.value = [...validConfig, ...newColumns]
  }
}, { deep: true })
</script>

<style scoped lang="scss">
/* 统一的页面容器 */
.account-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0; /* 移除内边距，完全由 Layout 控制 */
  box-sizing: border-box;
}

/* 顶部标题区 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
  padding-left: var(--spacing-sm);
  flex-shrink: 0; /* 防止压缩 */

  .title {
    font-size: 24px;
    font-weight: 600;
    color: var(--text-color-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;

    &::before {
      content: '';
      display: block;
      width: 6px;
      height: 24px;
      background: var(--primary-color);
      border-radius: var(--border-radius-round);
    }
  }
}

/* 通用卡片样式优化 - 使用全局 glass-card */
/* .card removed */

/* 搜索筛选区 */
.search-filter {
  padding: 24px 24px 0; /* 底部padding由margin-bottom撑开 */
  flex-shrink: 0; /* 防止压缩 */
}

/* 账号管理功能区 */
.account-management {
  flex-shrink: 0; /* 防止压缩 */
}

/* 账号列表区域 */
.account-list-area {
  flex: 1; /* 自动占据剩余空间 */
  min-height: 0; /* 关键：允许flex子项收缩到内容以下，配合height:100%实现滚动 */
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden; /* 防止内容溢出容器 */
}
  
  .search-form {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;

    .el-form-item {
      margin-bottom: 24px; /* 统一底部间距 */
      margin-right: 0;
    }
  }


/* 账号管理功能区 */
.account-management {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .subtitle {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-color-primary);
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;

    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 16px;
      background: var(--primary-color);
      border-radius: var(--border-radius-sm);
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    
    .el-button {
      margin-left: 0; /* 移除默认左边距 */
      border-radius: var(--border-radius-lg);
      padding: 10px 20px;
      height: auto;
      font-weight: 500;

      .el-icon {
        margin-right: 6px;
      }
    }

    /* 圆形按钮图标居中 */
    .el-button.is-circle {
      position: relative;
      display: block;
      padding: 0;
      width: 36px;
      height: 36px;
    }

    /* 强制span、i和svg完全居中 */
    .el-button.is-circle > span {
      position: absolute !important;
      top: 50% !important;
      left: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: 20px !important;
      height: 20px !important;
      margin: 0 !important;
      padding: 0 !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .el-button.is-circle > span > .el-icon {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      height: 100% !important;
      margin: 0 !important;
      padding: 0 !important;
    }

    .el-button.is-circle > span > .el-icon > svg {
      display: block !important;
      margin: 0 auto !important;
      padding: 0 !important;
      width: 16px !important;
      height: 16px !important;
    }


  }
}

/* 表格操作列按钮样式 - 与账号管理功能按钮一致 */
.table-actions {
  display: flex;
  justify-content: center;
  gap: 8px;

  .el-button {
    &.is-circle {
      position: relative;
      display: block;
      padding: 0;
      width: 36px;
      height: 36px;

      > span {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        width: 20px !important;
        height: 20px !important;
        margin: 0 !important;
        padding: 0 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;

        > .el-icon {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 100% !important;
          height: 100% !important;
          margin: 0 !important;
          padding: 0 !important;

          > svg {
            display: block !important;
            margin: 0 auto !important;
            padding: 0 !important;
            width: 16px !important;
            height: 16px !important;
          }
        }
      }
    }
  }
}

/* 账号列表区 */
.account-list-area {
  flex: 1;
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;

  /* 表格样式覆盖 */
  :deep(.el-table) {
    flex: 1;
    --el-table-header-bg-color: var(--bg-color-light);
    --el-table-header-text-color: var(--text-color-primary);
    --el-table-row-hover-bg-color: var(--primary-color-light-9);

    th.el-table__cell {
      font-weight: 600;
      height: 54px;
      background-color: var(--bg-color-light);
    }

    .el-table__row {
      height: 60px; /* 增加行高 */
    }

    /* 账号信息组合样式 */
    .account-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .nickname {
        font-weight: 500;
        font-size: 14px;
        color: var(--text-color-primary);
      }

      .type-tag {
        font-size: 12px;
        color: var(--text-color-secondary);
        background: var(--bg-color-page);
        padding: 2px 6px;
        border-radius: var(--border-radius-md);
        width: fit-content;
      }
    }
  }
}

/* 响应式适配 */
@media (max-width: 768px) {
  .search-filter .search-form {
    flex-direction: column;
    
    .el-form-item {
      width: 100%;
      margin-right: 0;
      
      .el-input, .el-select {
        width: 100% !important;
      }
    }
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
    
    .el-button {
      width: 100%;
    }
  }
}

/* 表格列排序样式 */
.column-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.column-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: var(--bg-color-overlay);
  border: 1px solid var(--border-color);
  border-radius: 4px;
  cursor: default;
  min-width: 150px;
  transition: all 0.3s;
}
.column-item:hover {
  background-color: var(--bg-color-hover);
  border-color: var(--primary-color);
}
.drag-handle {
  margin-right: 8px;
  cursor: move;
  color: var(--text-color-secondary);
}
.drag-handle:hover {
  color: var(--primary-color);
}
</style>
