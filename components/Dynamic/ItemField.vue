<template>
  <div
    :class="{
      'flex items-center space-x-4': $typeCheck(data) === 'boolean',
      'space-y-1': $typeCheck(data) !== 'boolean',
    }"
  >
    <div class="text-gray-900">{{ localSchemaKey }}:</div>
    <div v-if="localSchemaValue.type === 'richText' && !isTinyReady">
      <span class="gg-spinner text-gray-900"></span>
    </div>
    <div v-if="localSchemaValue.type === 'richText'" v-show="isTinyReady">
      <Editor
        api-key="ybvcxe9fj0sj6lcp90640iyvqe3epn8hz97d8hr0j8ad0g0h"
        :init="getEditorInit(data)"
        v-model="data"
      />
    </div>

    <div
      v-else-if="$typeCheck(data) === 'boolean'"
      class="flex items-center justify-between w-full h-[39px]"
    >
      <Toggle v-model="data" :disabled="localSchemaValue.disabled" />
      <button
        class="bg-teal-700 h-[39px] aspect-1 rounded-[5px] flex items-center justify-center text-gray-50 text-[16px] lg:hover:bg-teal-500 duration-200"
        v-if="isShowLockedButton"
        @click="handleUnLock()"
      >
        <i class="fa-solid fa-lock-open"></i>
      </button>
    </div>
    <div
      class="flex space-x-2"
      v-else-if="
        $typeCheck(data) === 'string' ||
        $typeCheck(data) === 'number' ||
        $typeCheck(data) === null ||
        $typeCheck(data) === 'array'
      "
    >
      <input
        :type="
          $typeCheck(data) === 'number'
            ? 'number'
            : localSchemaKey === 'password'
            ? 'password'
            : 'text'
        "
        class="input w-full"
        :class="{
          'input-error': error[localSchemaKey],
        }"
        :disabled="isFieldDisabled"
        v-model="data"
        @input="updateData(localSchemaKey, $event.target as HTMLInputElement)"
        v-if="!localSchemaValue.relation"
      />
      <div
        class="flex flex-wrap"
        v-else-if="
          (localSchemaValue.relation && data) || $typeCheck(data) === 'array'
        "
        v-if="
          ($typeCheck(data) === 'array' && data.length > 0) ||
          ($typeCheck(data) !== 'array' && data)
        "
      >
        <div
          v-if="$typeCheck(data) === 'array'"
          v-for="(item, index) in data"
          :key="index"
          class="flex items-center justify-center mr-2 mb-2"
        >
          <div
            class="bg-indigo-700 text-gray-50 p-1 min-w-[35px] max-w-[100px] h-[30px] flex items-center justify-center rounded-l-[5px]"
            :class="{
                'rounded-r-[5px]': !$roleCheck('PATCH', route.params.post as string),
              }"
          >
            <p class="truncate">{{ item }}</p>
          </div>
          <button
            class="bg-indigo-300 h-[30px] flex items-center justify-center text-gray-800 px-2 rounded-r-[5px] lg:hover:bg-red-600 lg:hover:text-white duration-200"
            @click="handleRemoveFromArray(item)"
            v-if="$roleCheck('PATCH', route.params.post as string)"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div v-else class="flex items-center">
          <div
            class="bg-indigo-700 text-gray-50 p-1 min-w-[35px] max-w-[100px] h-[30px] flex items-center justify-center rounded-l-[5px]"
            :class="{
                'rounded-r-[5px]': !$roleCheck('PATCH', route.params.post as string),
              }"
          >
            <p class="truncate">{{ data }}</p>
          </div>
          <button
            class="bg-indigo-300 h-[30px] flex items-center justify-center text-gray-800 px-2 rounded-r-[5px] lg:hover:bg-red-600 lg:hover:text-white duration-200"
            @click="handleRemoveFromField()"
            v-if="$roleCheck('PATCH', route.params.post as string)"
          >
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
      <button
        class="bg-teal-700 h-[30px] aspect-1 rounded-[5px] flex items-center justify-center text-gray-50 text-[24px] duration-200"
        :class="{
          'mb-2': $typeCheck(data) === 'array',
          'opacity-50': !$roleCheck('PATCH', route.params.post as string),
          'lg:hover:bg-teal-500': $roleCheck('PATCH', route.params.post as string)
        }"
        v-if="localSchemaValue.relation"
        @click.stop="
          localSchemaValue.relation &&
            $roleCheck('PATCH', route.params.post as string) &&
            handleRelation(
              localSchemaValue.relation,
              localSchemaValue.type,
              data,
              localSchemaKey
            )
        "
      >
        <i class="fa-solid fa-up-right-from-square"></i>
      </button>
      <button
        class="bg-teal-700 h-[39px] aspect-1 rounded-[5px] flex items-center justify-center text-gray-50 text-[16px] lg:hover:bg-teal-500 duration-200"
        v-if="isShowLockedButton"
        @click="handleUnLock()"
      >
        <i class="fa-solid fa-lock-open"></i>
      </button>
    </div>
    <div v-if="error[localSchemaKey]" class="text-[12px] text-red-600">
      {{ error[localSchemaKey] }}
    </div>
  </div>
  <Teleport
    to="body"
    v-if="localSchemaValue.type === 'richText' && isTinyReady"
  >
    <Modal
      v-model="uploadModal"
      :close-btn="true"
      @update:model-value="imgAlt = ''"
    >
      <Upload
        @close-modal="uploadModal = false"
        @submit-upload="handleUploadImage"
        :valid-file="'image/*'"
      >
        <template #html>
          <input
            type="text"
            class="input"
            v-model="imgAlt"
            placeholder="Image Alt..."
          />
        </template>
        <template #warning>Chỉ được upload hình ảnh</template>
      </Upload>
    </Modal>
    <Modal
      v-model="insertImgModal"
      :close-btn="true"
      @update:model-value="imgAlt = ''"
    >
      <div
        class="space-y-2 xl:w-1/3 lg:w-1/2 md:w-3/4 w-[95%] bg-gray-50 p-2 rounded-lg"
      >
        <input
          type="text"
          class="input"
          placeholder="Link hoặc id của ảnh trong hệ thống..."
          v-model="imgIdOrPath"
        />
        <input
          type="text"
          class="input"
          v-model="imgAlt"
          placeholder="Image Alt..."
        />
        <button
          class="btn btn-green w-full"
          @click="handleInsertImage"
          :disabled="!imgIdOrPath"
        >
          Submit
        </button>
      </div>
    </Modal>
  </Teleport>
</template>
<script setup lang="ts">
import Editor from "@tinymce/tinymce-vue";

type TProps = {
  schemaKey: string;
  schemaValue: any;
  modelValue: any;
  error: any;
  new?: boolean;
};
const { apiUrl } = useRuntimeConfig().public;
const props = defineProps<TProps>();
const emits = defineEmits(["updateData", "handleRef", "update:modelValue"]);
const route = useRoute();
const data = ref(props.modelValue);
const localSchemaKey = ref(props.schemaKey);
const localSchemaValue = ref({ ...props.schemaValue });
const { user } = useAuth();
const isTinyReady = ref(false);
const { $roleCheck } = useNuxtApp();
const { toastData } = useGetState();
const tinyMceEditor = ref<any | null>(null);
const uploadModal = ref(false);
const insertImgModal = ref(false);
const imgAlt = ref("");
const imgIdOrPath = ref("");
const { loading } = useGetState();

watch(
  () => props.modelValue,
  (newVal) => {
    data.value = newVal;
  }
);

watch(
  () => data.value,
  (newVal) => emits("update:modelValue", newVal)
);

function getEditorInit(item: string) {
  return {
    menubar: false,
    width: "100%",
    height: "350px",
    toolbar:
      "styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist | customInsertImageButton | customUploadButton ",
    toolbar_mode: "sliding",
    setup(editor: any) {
      editor.on("init", () => {
        if (item) editor.setContent(item);
        if (isFieldDisabled.value) {
          editor.setMode("readonly");
        } else {
          editor.setMode("design");
        }
        tinyMceEditor.value = editor;
        isTinyReady.value = true;
      });
      editor.on("change", () => {
        item = editor.getContent();
        emits("update:modelValue", item);
      });
      editor.ui.registry.addButton("customUploadButton", {
        text: "IMG",
        icon: "upload",
        onAction: function () {
          uploadModal.value = true;
        },
      });
      editor.ui.registry.addButton("customInsertImageButton", {
        icon: "image",
        onAction: function () {
          insertImgModal.value = true;
        },
      });
    },
  };
}

async function handleInsertImage() {
  const isValid = isValidUrl(imgIdOrPath.value);
  if (isValid) {
    //nếu là url thì chèn thẳng vào editor
    tinyMceEditor.value?.insertContent(
      `<img src="${imgIdOrPath.value}" alt="${imgAlt.value}" width="500"/>`
    );
    imgIdOrPath.value = "";
    imgAlt.value = "";
    insertImgModal.value = false;
  } else {
    //nếu là id trong hệ thống thì kiểm tra hợp lệ
    try {
      const img = await useApi(`/asset/${imgIdOrPath.value}`);
      tinyMceEditor.value?.insertContent(
        `<img src="${apiUrl}/asset/${imgIdOrPath.value}?format=webp" alt="${imgAlt.value}" width="500" />`
      );
    } catch (error: any) {
      toastData.value.push({
        message: "Có lỗi xảy ra, file có thể ko tồn tại trong hệ thống",
        type: "error",
      });
    } finally {
      imgIdOrPath.value = "";
      imgAlt.value = "";
      insertImgModal.value = false;
    }
  }
}

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

const isFieldDisabled = computed(() => {
  if (props.new && localSchemaKey.value !== "id") return false;
  if (!$roleCheck("PATCH", route.params.post as string)) return true;
  if (localSchemaValue.value.disabled) return true;
  return false;
});

const isShowLockedButton = computed(() => {
  if (
    localSchemaValue.value.disabled &&
    localSchemaKey.value !== "id" &&
    !props.new &&
    !localSchemaValue.value.relation &&
    user.value.rootUser
  )
    return true;
  return false;
});

function updateData(item: string, target: HTMLInputElement) {
  emits("updateData", { item, target });
}

function handleRelation(
  relation: string,
  type: "text" | "number" | "array",
  defaultValue: string | number | string[] | number[],
  key: string
) {
  emits("handleRef", { relation, type, defaultValue, key });
}

function handleRemoveFromArray(item: string | number) {
  emits(
    "update:modelValue",
    data.value.filter((x: string | number) => x !== item)
  );
}

function handleRemoveFromField() {
  emits("update:modelValue", null);
}

function handleUnLock() {
  localSchemaValue.value.disabled = false;
}

async function handleUploadImage(file: File) {
  if (file) {
    loading.value = true;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const newFile = await useApi("/file", {
        method: "POST",
        body: formData,
      });
      if (newFile.data) {
        const img = newFile.data;
        tinyMceEditor.value?.insertContent(
          `<img src="${apiUrl}/asset/${img.id}?format=webp" alt="${imgAlt.value}" width="500" />`
        );
        imgAlt.value = "";
        uploadModal.value = false;
      }
    } catch (error: any) {
      toastData.value.push({
        message:
          "Có lỗi xảy ra trong quá trình upload, lỗi: " + error.data.message,
        type: "error",
      });
    } finally {
      loading.value = false;
    }
  }
}
</script>
