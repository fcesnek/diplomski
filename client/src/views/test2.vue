<template>
  <div id="app">
    <ol>
      <todo-item v-for="item in groceryList" :todo="item" :key="item.id"></todo-item>
    </ol>
  </div>
</template>

<script>
import TodoItem from '../components/TodoItem.vue';
export default {
  data() {
    return {
      groceryList: [
        { id: 0, text: 'Vegetables' },
        { id: 1, text: 'Cheese' },
        { id: 2, text: 'Chocolate' },
      ],
    };
  },
};
</script>





