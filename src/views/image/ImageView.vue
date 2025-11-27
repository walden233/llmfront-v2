<template>
  <div class="app-page image-view">
    <el-card class="image-view__controls">
      <template #header>图像生成</template>
      <a-form :model="form" layout="vertical">
        <a-form-item field="originImage" label="原始图像 (用于图像编辑)">
          <a-upload
            :show-file-list="false"
            :custom-request="handleImageUpload"
            accept="image/*"
            list-type="picture-card"
          >
            <div v-if="originImage">
              <img :src="originImage" style="width: 100%" />
              <div class="arco-upload-list-picture-mask">
                <icon-edit />
              </div>
            </div>
            <div v-else class="arco-upload-trigger">
               <div class="arco-upload-trigger-icon">
                <icon-plus />
              </div>
              <div class="arco-upload-trigger-text">
                上传图片
              </div>
            </div>
          </a-upload>
           <template #extra>
            <a-button v-if="originImage" @click="clearOriginImage" size="small" type="text" status="danger">
              <icon-delete /> 清除图像
            </a-button>
          </template>
        </a-form-item>
        <a-form-item field="prompt" label="提示词">
          <a-textarea v-model="form.prompt" placeholder="输入详细的图像描述或编辑指令..." :auto-size="{ minRows: 3, maxRows: 6 }" />
        </a-form-item>
        <a-form-item field="model" label="选择模型">
          <a-select v-model="form.modelIdentifier" placeholder="选择一个图像生成模型">
            <a-option v-for="model in models" :key="model.modelIdentifier" :value="model.modelIdentifier">
              {{ model.displayName }}
            </a-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" long @click="handleGenerate" :loading="loading">
            {{ loading ? '生成中...' : '生成图像' }}
          </a-button>
        </a-form-item>
      </a-form>
    </el-card>

    <div class="image-view__results">
      <div v-if="loading" class="results-placeholder">
        <a-spin size="large" tip="正在请求模型生成图像..." />
      </div>
      <div v-else-if="!generatedImageUrl" class="results-placeholder">
        <el-empty description="生成的图像将显示在这里" />
      </div>
      <div v-else class="image-display">
        <el-image :src="generatedImageUrl" fit="contain" :preview-src-list="[generatedImageUrl]" />
      </div>
    </div>
     <a-modal v-model:visible="isKeyModalVisible" title="请输入 Access Key" @ok="handleSetKey" :mask-closable="false">
      <a-input v-model="sessionKeyInput" placeholder="请输入你的 Access Key" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { listModels } from '@/api/model';
import { generateImage } from '@/api/proxy';
import type { Model } from '@/types/model';
import { ElMessage } from 'element-plus';
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-vue/es/icon';

const authStore = useAuthStore();
const models = ref<Model[]>([]);
const loading = ref(false);
const generatedImageUrl = ref('');
const isKeyModalVisible = ref(false);
const sessionKeyInput = ref('');
const originImage = ref<string | null>(null);

const form = ref({
  prompt: '',
  modelIdentifier: '',
});

const fetchImageModels = async () => {
  try {
    const textToImagePromise = listModels({
      status: '1',
      capability: 'text-to-image',
      pageSize: 100,
    });
    const imageToImagePromise = listModels({
      status: '1',
      capability: 'image-to-image',
      pageSize: 100,
    });

    const [textToImageResult, imageToImageResult] = await Promise.all([textToImagePromise, imageToImagePromise]);

    const allModels = [...textToImageResult.records, ...imageToImageResult.records];
    const uniqueModels = Array.from(new Map(allModels.map(m => [m.id, m])).values());

    models.value = uniqueModels;
    if (uniqueModels.length > 0) {
      form.value.modelIdentifier = uniqueModels[0]!.modelIdentifier;
    }
  } catch {
    ElMessage.error('获取图像模型列表失败');
  }
};

const handleImageUpload = (options: any) => {
  const { file, onSuccess } = options;
  const reader = new FileReader();
  reader.onload = (e) => {
    originImage.value = e.target?.result as string;
    onSuccess();
  };
  reader.readAsDataURL(file);
  return {
    abort: () => {
      originImage.value = null;
    }
  };
};

const clearOriginImage = () => {
  originImage.value = null;
};

const handleGenerate = async () => {
  if (!form.value.prompt.trim()) {
    ElMessage.warning('请输入提示词');
    return;
  }
  if (!authStore.sessionAccessKey) {
    ElMessage.warning('请先设置 Access Key');
    isKeyModalVisible.value = true;
    return;
  }

  loading.value = true;
  generatedImageUrl.value = '';
  try {
    const payload: any = {
      prompt: form.value.prompt,
      modelIdentifier: form.value.modelIdentifier,
      options: { n: 1, size: '1024x1024' },
    };
    if (originImage.value) {
      payload.originImage = { url: originImage.value };
    }

    const response = await generateImage(
      payload,
      authStore.sessionAccessKey
    );

    if (response.imageUrls && response.imageUrls.length > 0) {
      if (response.imageUrls[0] !== undefined) {
        generatedImageUrl.value = response.imageUrls[0];
        ElMessage.success('图像生成成功');
      } else {
        ElMessage.error('未能生成图像，返回的 URL 为空');
      }
    } else {
      ElMessage.error('未能生成图像，请稍后重试');
    }
  } catch (error) {
    ElMessage.error('图像生成失败');
  } finally {
    loading.value = false;
  }
};

const handleSetKey = () => {
  if (sessionKeyInput.value.trim()) {
    authStore.setSessionAccessKey(sessionKeyInput.value.trim());
    isKeyModalVisible.value = false;
    ElMessage.success('Access Key 已设置');
  }
};

onMounted(() => {
  fetchImageModels();
   if (!authStore.sessionAccessKey) {
    isKeyModalVisible.value = true;
  }
});
</script>

<style scoped>
.image-view {
  display: flex;
  gap: 24px;
  height: calc(100vh - var(--app-header-height) - 48px); /* Adjust for padding */
}

.image-view__controls {
  width: 380px;
  flex-shrink: 0;
}

.image-view__results {
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  overflow: hidden;
}

.results-placeholder {
  text-align: center;
  color: var(--el-text-color-secondary);
}

.image-display {
  width: 100%;
  height: 100%;
}

.el-image {
  width: 100%;
  height: 100%;
}
</style>