import { Component, Inject, ChangeDetectorRef } from "@angular/core";
import { MatTreeNestedDataSource } from "@angular/material/tree";
import { FlatNode, Node } from "../models_interfaces";
import { Router } from "@angular/router";
import { RestService } from "../services/rest.service";
import { InterceptorService } from "../services/interceptor.service";
import { AppPermissions } from "../model/enum/app-permissions";
import { versionInfo } from "../../../version-info";
import { I18NEXT_SERVICE, ITranslationService } from "angular-i18next";
import { NestedTreeControl } from "@angular/cdk/tree";
import { GraphApiService } from "../services/graph-api.service";
import { Observable, map, tap } from "rxjs";
import { User } from "@microsoft/microsoft-graph-types";
import { MSAL_GUARD_CONFIG, MsalGuardConfiguration, MsalService } from "@azure/msal-angular";
import { InteractionType } from "@azure/msal-browser";
import { TeamsService } from "../services/teams.service";

interface MenuItemNode {
  name: string;
  icon?: string;
  link?: string[];
  permission?: AppPermissions;
  children?: MenuItemNode[];
}

//Menu structure here
const menuItems: MenuItemNode[] = [
  { name: "project.menu.profile", icon: "person", link: ["profile"] },
  { name: "project.menu.group", icon: "groups", link: ["groups"] },  
  { name: "project.menu.page1", icon: "description", link: ["page1"] },
  { name: "project.menu.page2", icon: "description", link: ["page2"] },
];

@Component({
  selector: "app-menu",
  templateUrl: "./menu.component.html",
  styleUrls: ["./menu.component.scss"],
})
export class MenuComponent {
  language;

  public inTeams: boolean = false;

  public user: User;
  public user$: Observable<User>;
  public authorities: Object[] = [];

  treeControl = new NestedTreeControl<MenuItemNode>((node) => node.children);
  dataSource = new MatTreeNestedDataSource<MenuItemNode>();
  menuList;

  /*Menu Design: using mat-tree*/
  constructor(
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private teamsService: TeamsService,
    private interceptor: InterceptorService,
    private msalService: MsalService,
    public router: Router,
    private changeDetector: ChangeDetectorRef,
    private graphApiService: GraphApiService,
    @Inject(I18NEXT_SERVICE) private i18NextService: ITranslationService
  ) {
    this.menuList = menuItems;
    this.dataSource.data = menuItems;
  }

  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    this.checkInTeams();
    this.user$ = this.graphApiService.getProfile().pipe(tap((res: User) => {
      console.log(JSON.stringify(res, null, 2))
      this.user = res;
      this.user
    }));

    this.i18NextService.events.initialized.subscribe((e) => {
      if (e) {
        this.language = this.i18NextService.language;
      }
    });
  }

  //properties of tree
  hasChild = (_: number, node: MenuItemNode) =>
    !!node.children && node.children.length > 0;

  //Transform nested node to flatten
  transformFunction = (node: Node, level: number) => {
    return new FlatNode(
      !!node.children,
      node.filename,
      level,
      node.icon,
      node.link
    );
  };

  logout() {
    if (this.msalGuardConfig.interactionType === InteractionType.Popup) {
      console.log("logout popup")
      this.msalService.logoutPopup({
        postLogoutRedirectUri: "/",
        mainWindowRedirectUri: "/"
      });
    } else if(this.msalGuardConfig.interactionType === InteractionType.Redirect) {
      console.log("logout redirect")
      this.msalService.logoutRedirect({
        postLogoutRedirectUri: "/",
      });
    }
    else {
      console.log("logout")
      this.msalService.logout({
        postLogoutRedirectUri: "/",
      });
    }
  }

  loading(): boolean {
    return this.interceptor.hasPendingRequests();
  }

  public get AppPermissions(): typeof AppPermissions {
    return AppPermissions;
  }

  private checkInTeams(){
    this.teamsService.inTeams().then(res => this.inTeams = res);
  }

  getRevisionInfo() {
    return `${versionInfo.tag != null ? versionInfo.tag : ""}`;
  }

  changeLanguage() {
    if (this.i18NextService.language != this.language) {
      this.i18NextService.changeLanguage(this.language).then((x) => {
        document.location.reload();
      });
    }
  }
}
