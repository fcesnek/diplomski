import Vue from 'vue';
import VueRouter from 'vue-router';
import LoginForm from '../views/LoginForm.vue';
import RegisterForm from '../views/RegisterForm.vue';
import TrainModel from '../views/TrainModel.vue';
import EvaluateModels from '../views/EvaluateModels.vue';
import MySamples from '../views/MySamples.vue';
import store from '../store';

Vue.use(VueRouter);

const routes = [
  {
    path: '/evaluatemodels',
    name: 'evaluatemodels',
    component: EvaluateModels,
    beforeEnter: (to, from, next) => {
      if (!store.getters.isUserLoggedIn) next('/login');
      else next();
    },
  },
  {
    path: '/mysamples',
    name: 'mysamples',
    component: MySamples,
    beforeEnter: (to, from, next) => {
      if (!store.getters.isUserLoggedIn) next('/login');
      else next();
    },
  },
  {
    path: '/login',
    name: 'login-form',
    component: LoginForm,
  },
  {
    path: '/register',
    name: 'register-form',
    component: RegisterForm,
  },
  {
    path: '/trainmodel',
    name: 'train-model',
    component: TrainModel,
    beforeEnter: (to, from, next) => {
      if (!store.getters.isUserLoggedIn) next('/login');
      else next();
    },
  },
  {
    path: '/trainmodel/:id',
    name: 'train-model-id',
    component: TrainModel,
    beforeEnter: (to, from, next) => {
      if (!store.getters.isUserLoggedIn) next('/login');
      else next();
    },
  },
  {
    path: '*',
    redirect: '/trainmodel',
  },
];

const router = new VueRouter({
  scrollBehavior() {
    return { x: 0, y: 0 };
  },
  mode: 'history',
  base: process.env.BASE_URL || 'localhost:3000',
  routes,
});

export default router;
