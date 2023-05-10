import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';

import { MsalInterceptor, MsalInterceptorConfiguration, MsalModule, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MSAL_GUARD_CONFIG, MsalGuardConfiguration } from "@azure/msal-angular";
import { BrowserCacheLocation, InteractionType, PublicClientApplication, LogLevel } from "@azure/msal-browser";
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { environment } from '../environments/environment';

// export function MSALInterceptorConfigFactory(): MsalInterceptorConfiguration {
//   const protectedResourceMap = new Map<string, Array<string>>();
//   protectedResourceMap.set('https://graph.microsoft.com/v1.0/me', ['User.Read','offline_access', 'profile', 'openid']);
//   protectedResourceMap.set('https://graph.microsoft.com/v1.0/groups', ['group.Read.All']);

//   return {
//     interactionType: InteractionType.Redirect,
//     protectedResourceMap
//   };
// }

// export function MSALGuardConfigFactory(): MsalGuardConfiguration {
//   return {
//     interactionType: InteractionType.Redirect,
//     authRequest: {
//       scopes: ['User.Read','group.Read.All','offline_access', 'profile', 'openid']
//     },
//     //loginFailedRoute: '/login-failed'
//   };
// }

// export function MSALGuardConfigFactory(): MsalGuardConfiguration {
//   return {
//     interactionType: InteractionType.Redirect
//   };
// }

// const isIE = window.navigator.userAgent.indexOf('MSIE ') > -1 || window.navigator.userAgent.indexOf('Trident/') > -1;


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MsalModule.forRoot(new PublicClientApplication({
      auth: {
        clientId: environment.aadAppId,
        authority: `https://login.microsoftonline.com/${environment.tenantId}`,
        // redirectUri: 'https://myuniquedomain.loca.lt/auth',
        // redirectUri: 'https://white-plant-0e2d2ed10.3.azurestaticapps.net'
        // redirectUri: 'http://localhost:4200/'
        redirectUri: 'https://c8fa-2a02-587-328a-eb00-e18b-46fe-9f53-ddd1.ngrok-free.app',
        //navigateToLoginRequestUrl: true
      },
      cache: {
        cacheLocation: BrowserCacheLocation.LocalStorage,
        storeAuthStateInCookie: false,
      },
      system: {
        loggerOptions: {
           loggerCallback: (logLevel, message, containsPii) => {
               console.log(message);
            },
            logLevel: LogLevel.Verbose,
            piiLoggingEnabled: false
        }
      },
    }),
    {
      interactionType: InteractionType.Redirect,
      authRequest: {
        scopes: ["access_as_user"],
      },
    },
    {
      interactionType: InteractionType.Redirect,
      protectedResourceMap: new Map([
        //['https://myuniquedomain-api.loca.lt', ['access_as_user']]
        // ['http://localhost:4200', ['access_as_user']],
        // ['https://white-plant-0e2d2ed10.3.azurestaticapps.net',['access_as_user']],
        ['https://c8fa-2a02-587-328a-eb00-e18b-46fe-9f53-ddd1.ngrok-free.app',['access_as_user']],
        ["https://graph.microsoft.com/v1.0/me", ["user.read"]],
        ["https://graph.microsoft.com/v1.0/groups", ["group.Read.All"]]
      ])
    }
    )
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    // {
    //   provide: MSAL_GUARD_CONFIG,
    //   useFactory: MSALGuardConfigFactory
    // },
    // {
    //   provide: MSAL_INTERCEPTOR_CONFIG,
    //   useFactory: MSALInterceptorConfigFactory
    // },
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent]
})
export class AppModule { }
