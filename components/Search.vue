<template>
  <div
    class="space-y-8 2xl:w-[40%] xl:w-[50%] lg:w-[70%] w-[95%] mx-auto max-h-[90%] rounded-[10px] h-fit flex items-center"
  >
    <div
      class="rounded-[10px] max-h-[95vh] overflow-y-scroll hidden-scrollbar relative w-full"
    >
      <div
        class="flex items-center justify-between space-x-2 title !py-2 sticky top-0 z-[1000]"
      >
        <i
          class="fa-solid fa-arrow-left-long cursor-pointer bg-white p-2 rounded-full text-indigo-600 lg:hover:bg-indigo-900 lg:hover:text-white duration-200"
          @click="handleClose"
        ></i>
        Tìm kiếm
        <div class="flex items-center space-x-2 h-full">
          <i
            class="fa-solid fa-check cursor-pointer bg-white p-2 rounded-full text-teal-600 lg:hover:bg-teal-900 duration-200 h-[36px] aspect-1 flex justify-center items-center lg:hover:text-white"
            @click="searchConfirm"
          ></i>
        </div>
      </div>
      <div class="p-4 space-y-2 bg-gray-100 max-h-full">
        <div>Tìm kiếm theo:</div>

        <div
          class="flex md:space-x-2 max-md:space-y-2 items-center max-md:flex-wrap"
        >
          <div class="max-md:w-full">
            <select v-model="field" class="input input-blue max-md:w-full">
              <option
                v-for="(item, index) in Object.keys(localSchema)"
                :key="index"
                :value="item"
              >
                {{ item }}
              </option>
            </select>
          </div>
          <div class="max-md:w-full">
            <select v-model="searchKey" class="input input-blue max-md:w-full">
              <option
                v-for="([key, value], index) in Object.entries(compareKey)"
                :key="index"
                :value="value"
              >
                {{ key }}
              </option>
            </select>
          </div>
          <div class="w-full">
            <input
              v-model="searchValue"
              type="text"
              class="input w-full"
              placeholder="Tìm kiếm..."
              @keyup.enter="searchConfirm"
              :class="{
                'input-red': invalid,
                'input-blue': !invalid,
              }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
type TProps = {
  schema: object;
};
const compareKey = {
  bằng: "$eq",
  "chứa (trong chuỗi)": "$regex",
  "chứa (trong mảng)": "$in",
  "không chứa (trong mảng)": "$nin",
};
const props = defineProps<TProps>();
const localSchema = ref(props.schema);
const route = useRoute();
const emits = defineEmits(["close", "searchConfirm"]);
const field = ref(route.query.field ? route.query.field : "_id");
const searchKey = ref(route.query.key ? route.query.key : "$eq");
const searchValue = ref(route.query.value ? route.query.value : "");
const invalid = ref(false);
function handleClose() {
  emits("close");
}

watch(
  () => searchValue.value,
  (newVal) => {
    if (invalid.value) invalid.value = false;
  }
);

async function searchConfirm() {
  if (!searchValue.value) {
    invalid.value = true;
    return;
  }
  emits("searchConfirm", {
    field: field.value,
    searchKey: searchKey.value,
    searchValue: searchValue.value,
  });
}
</script>