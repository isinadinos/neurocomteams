import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { MenuComponent } from "./app-contents/menu/menu.component";
import { Page1Component } from "./app-contents/menu/page1/page1.component";
import { Page2Component } from "./app-contents/menu/page2/page2.component";
import { NotFoundComponent } from "./app-contents/menu/not-found/not-found.component";
import { MsalGuard } from "@azure/msal-angular";
import { BrowserUtils } from "@azure/msal-browser";
import { GroupsComponent } from "./app-contents/menu/groups/groups.component";
import { ProfileComponent } from "./app-contents/menu/profile/profile.component";

/*Guard types:
 * NonAuthGuard -> if user is logged in and in login page, guard redirects to home page
 * AuthGuard -> if user is NOt logged in and tries to reach a page that requires login, guard redirects to login page
 * MasterGuard -> accepts a list of guards eg. data : { guards: [...]} and calls each of them to check if
 * user is authorized to direct to a page
 */

//Guards need corrections
const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: MenuComponent,
        canActivate: [MsalGuard],
        canActivateChild: [MsalGuard],
        children: [
          { path: "", redirectTo: "profile", pathMatch: "full" },
          { path: "profile", component: ProfileComponent },
          { path: "groups", component: GroupsComponent },
          { path: "page1", component: Page1Component },
          { path: "page2", component: Page2Component },
        ],
      },

      { path: "**", component: NotFoundComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { 
     // Don't perform initial navigation in iframes or popups
     initialNavigation:
     !BrowserUtils.isInIframe() && !BrowserUtils.isInPopup()
       ? 'enabledNonBlocking'
       : 'disabled', // Set to enabledBlocking to use Angular Universal
   })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
