<template>
  <v-app-bar class="mb-5" fixed app>
    <v-toolbar-title
      v-if="$vuetify.breakpoint.md || $vuetify.breakpoint.lg || $vuetify.breakpoint.xl">
      <router-link
        tag="span"
        to="/">
          <v-icon class="home">mdi-home</v-icon>
      </router-link>
    </v-toolbar-title>
    <v-spacer v-if="$vuetify.breakpoint.md || $vuetify.breakpoint.lg || $vuetify.breakpoint.xl"/>
    <v-toolbar-items dense v-if="$store.state.isUserLoggedIn">
      <v-btn
        :small="$vuetify.breakpoint.sm || $vuetify.breakpoint.xs"
        text
        to="/trainmodel">Train Own Model</v-btn>
        <v-btn
        :small="$vuetify.breakpoint.sm || $vuetify.breakpoint.xs"
        text
        to="/mysamples">My training samples</v-btn>
        <v-btn
        :small="$vuetify.breakpoint.sm || $vuetify.breakpoint.xs"
        text
        to="/evaluatemodels">Evaluate models</v-btn>
      <v-btn
        :small="$vuetify.breakpoint.sm || $vuetify.breakpoint.xs"
        text
        v-if="$vuetify.breakpoint.sm || $vuetify.breakpoint.xs"
        @click="logout">Logout</v-btn>
    </v-toolbar-items>
    <v-spacer v-if="$vuetify.breakpoint.md || $vuetify.breakpoint.lg || $vuetify.breakpoint.xl"/>
    <v-toolbar-items>
      <v-btn v-if="!$store.state.isUserLoggedIn" text to="/login">
        Login
      </v-btn>
      <v-btn v-if="!$store.state.isUserLoggedIn" text to="/register">
        Register
      </v-btn>
      <v-btn
        v-show="$vuetify.breakpoint.md || $vuetify.breakpoint.lg || $vuetify.breakpoint.xl"
        v-if="$store.state.isUserLoggedIn"
        @click="logout" text>
        Logout
      </v-btn>
    </v-toolbar-items>
  </v-app-bar>
</template>

<script>
export default {
  methods: {
    logout() {
      this.$store.dispatch('setToken', null);
      this.$store.dispatch('setUser', null);
      this.$router.push({
        name: 'login-form',
      });
    },
  },
};
</script>

<style scoped>
.home {
   cursor: pointer;
 }
 .home:hover {
   color: #333;
 }
</style>
