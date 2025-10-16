import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Services } from './services/services';
import { Products } from './products/products';
import { Contact } from './contact/contact';
import { Error } from './error/error';
import { SignUp } from './sign-up/sign-up';
import { Login } from './login/login';
import { Projects } from './projects/projects';
import { ProjectsPage } from './projects-page/projects-page';

export const routes: Routes = [
    {
        path: '',
        component: Home
    },
    {
        path: 'services',
        component: Services
    },
    {
        path: 'projects-page',
        component: ProjectsPage
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
