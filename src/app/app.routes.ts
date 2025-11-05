import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Services } from './services/services';
import { Products } from './products/products';
import { Contact } from './contact/contact';
import { Error } from './error/error';
import { SignUp } from './sign-up/sign-up';
import { Login } from './login/login';
import { ProjectsPage } from './projects-page/projects-page';
import { Projects } from './projects/projects';
import { Profile } from './profile/profile';
import { Cart } from './cart/cart';
import { AdminCarpintero } from './admin-carpintero/admin-carpintero';
import { Checkout } from './checkout/checkout';
import { Kitchen as ServicesKitchen } from './services/kitchen/kitchen';
import { Bathroom as ServicesBathroom } from './services/bathroom/bathroom';
import { Bedroom as ServicesBedroom } from './services/bedroom/bedroom';
import { Livingroom as ServicesLivingroom } from './services/livingroom/livingroom';
import { Others as ServicesOthers } from './services/others/others';
import { Kitchen as ProjectsKitchen } from './projects-page/kitchen/kitchen';
import { Bathroom as ProjectsBathroom } from './projects-page/bathroom/bathroom';
import { Bedroom as ProjectsBedroom } from './projects-page/bedroom/bedroom';
import { Livingroom as ProjectsLivingroom } from './projects-page/livingroom/livingroom';
import { Others as ProjectsOthers } from './projects-page/others/others';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'services',
        component: Services,
        children: [
            {
                path: 'kitchen',
                component: ServicesKitchen
            },
            {
                path: 'bathroom',
                component: ServicesBathroom
            },
            {
                path: 'bedroom',
                component: ServicesBedroom
            },
            {
                path: 'livingroom',
                component: ServicesLivingroom
            },
            {
                path: 'others',
                component: ServicesOthers
            }
        ]
    },
    {
        path: 'projects',
        component: Projects
    },
    {
        path: 'projects-page',
        component: ProjectsPage,
        children: [
            {
                path: 'kitchen',
                component: ProjectsKitchen
            },
            {
                path: 'bathroom',
                component: ProjectsBathroom
            },
            {
                path: 'bedroom',
                component: ProjectsBedroom
            },
            {
                path: 'livingroom',
                component: ProjectsLivingroom
            },
            {
                path: 'others',
                component: ProjectsOthers
            }
        ]
    },
    {
        path: 'products',
        component: Products
    },
    {
        path: 'contact',
        component: Contact
    },
    {
        path: 'profile',
        component: Profile
    },
    {
        path: 'admin-carpintero',
        component: AdminCarpintero
    },
    {
        path: 'checkout',
        component: Checkout
    },
    {
        path: 'cart',
        component: Cart
    },
    {
        path: 'sign-up',
        component: SignUp
    },
    {
        path: 'login',
        component: Login
    },
    {
        path: 'error',
        component: Error
    },
    {
        path: '**',
        redirectTo: 'error'
    }
];
