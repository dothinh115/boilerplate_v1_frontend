<template>
  <main>
    <section>
      <div
        class="w-screen h-screen bg-[#2148c0] flex justify-center items-center relative"
      >
        <IconBackgroundTopRight
          class="absolute top-0 right-0 w-full md:w-2/3 lg:w-1/2"
        />
        <IconBackgroundBottomLeft
          class="absolute bottom-0 left-0 w-1/2 lg:w-1/3 xl:w-1/4"
        />
        <slot />
      </div>
    </section>
  </main>

  <Loading />
  <Toast
    :message="item.message"
    :type="item.type"
    @update:model-value="closeToast(index)"
    v-for="(item, index) in toastData"
    :key="index"
    :index="index"
  />
</template>
<script setup lang="ts">
const { toastData } = useGetState();

const closeToast = (index: number) => {
  toastData.value.splice(index, 1);
};
</script>
