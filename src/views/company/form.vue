<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  createCompany,
  getCompanyDetail,
  updateCompany,
  type CompanySaveRequest,
} from '@/api/company'
import type { SysDictItemVo } from '@/api/dict'
import { useDict } from '@/composables/useDict'
import { useAppStore } from '@/stores/app'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

// 数据字典缓存
const { loadDict } = useDict()
const financingStageOptions = ref<SysDictItemVo[]>([])
const companySizeOptions = ref<SysDictItemVo[]>([])
const cityOptions = ref<SysDictItemVo[]>([])

const isEdit = computed(() => Boolean(route.params.id))
const companyId = computed(() => Number(route.params.id))

const form = reactive<CompanySaveRequest>({
  userId: appStore.currentUserId,
  name: '',
  industry: '',
  website: '',
  city: '',
  companySize: '',
  financingStage: '',
  address: '',
  hrName: '',
  hrContact: '',
  remark: '',
  status: 1,
})

const rules: FormRules = {
  name: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
}

async function loadDetail() {
  if (!isEdit.value) return
  loading.value = true
  try {
    const data = await getCompanyDetail(companyId.value)
    Object.assign(form, {
      userId: data.userId ?? appStore.currentUserId,
      name: data.name,
      industry: data.industry ?? '',
      website: data.website ?? '',
      city: data.city ?? '',
      companySize: data.companySize ?? '',
      financingStage: data.financingStage ?? '',
      address: data.address ?? '',
      hrName: data.hrName ?? '',
      hrContact: data.hrContact ?? '',
      remark: data.remark ?? '',
      status: data.status ?? 1,
    })
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  form.userId = appStore.currentUserId
  submitting.value = true
  try {
    if (isEdit.value) {
      await updateCompany(companyId.value, { ...form })
      ElMessage.success('更新成功')
    } else {
      await createCompany({ ...form })
      ElMessage.success('创建成功')
    }
    router.push('/company')
  } finally {
    submitting.value = false
  }
}

function goBack() {
  router.push('/company')
}

onMounted(async () => {
  const [stages, sizes, cities] = await Promise.all([
    loadDict('financing_stage'),
    loadDict('company_size'),
    loadDict('city'),
  ])
  financingStageOptions.value = stages
  companySizeOptions.value = sizes
  cityOptions.value = cities
  await loadDetail()
})
</script>

<template>
  <el-card v-loading="loading" shadow="never">
    <template #header>{{ isEdit ? '编辑公司' : '新增公司' }}</template>

    <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 720px">
      <el-row :gutter="16">
        <el-col :span="12">
          <el-form-item label="公司名称" prop="name">
            <el-input v-model="form.name" placeholder="请输入公司名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="行业">
            <el-input v-model="form.industry" placeholder="如：互联网" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="城市">
            <el-select v-model="form.city" placeholder="请选择" style="width: 100%" clearable>
              <el-option v-for="s in cityOptions" :key="s.id" :label="s.label" :value="s.label" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="公司规模">
            <el-select v-model="form.companySize" placeholder="请选择" style="width: 100%" clearable>
              <el-option v-for="s in companySizeOptions" :key="s.id" :label="s.label" :value="s.label" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="融资阶段">
            <el-select v-model="form.financingStage" placeholder="请选择" style="width: 100%" clearable>
              <el-option v-for="s in financingStageOptions" :key="s.id" :label="s.label" :value="s.label" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="官网">
            <el-input v-model="form.website" placeholder="https://" />
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="地址">
            <el-input v-model="form.address" placeholder="公司地址" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="HR姓名">
            <el-input v-model="form.hrName" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="HR联系方式">
            <el-input v-model="form.hrContact" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="状态">
            <el-radio-group v-model="form.status">
              <el-radio :value="1">正常</el-radio>
              <el-radio :value="0">停用</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
        <el-col :span="24">
          <el-form-item label="备注">
            <el-input v-model="form.remark" type="textarea" :rows="3" />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">保存</el-button>
        <el-button @click="goBack">取消</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>
