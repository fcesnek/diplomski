<template>
  <div id="app">
    <nav-bar />
    <v-main>
      <router-view />
    </v-main>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';

export default {
  components: {
    NavBar,
  },
};
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Ubuntu&display=swap');
html, body {
  font-family: 'Ubuntu', sans-serif;
}

#app {
  font-family: 'Ubuntu', sans-serif;
}
.form {
  background: white;
  padding: 20px;
  border: 1px solid rgb(175, 175, 175);
}
</style>
