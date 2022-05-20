import Index from '@/pages/index/index.vue';
import Edit from '@/pages/edit/index.vue';
import NotFound from '@/pages/common/404.vue';
import Forbidden from '@/pages/common/403.vue';
import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'index',
    component: Index
  },
  {
    path: '/edit',
    name: 'edit',
    component: Edit
  },
  {
    path: '/404',
    name: 'notFound',
    component: NotFound
  },
  {
    path: '/403',
    name: 'forbidden',
    component: Forbidden
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

const router = createRouter({
  routes, // short for `routes: routes`
  history: createWebHashHistory()
});

export default router;
