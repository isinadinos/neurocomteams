import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { MsalBroadcastService, MsalGuard, MsalService } from '@azure/msal-angular';
import { InteractionStatus } from '@azure/msal-browser';
import { AccessTokenEntity, AccountEntity, AuthenticationResult, CredentialType, IdToken, IdTokenEntity, RefreshTokenEntity } from '@azure/msal-common';
import * as microsoftTeams from "@microsoft/teams-js";
import jwtDecode from "jwt-decode";
import { Observable, of, firstValueFrom, lastValueFrom   } from 'rxjs';
import { filter, first, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
import { TeamsService } from './teams.service';

@Injectable({
  providedIn: 'root'
})
export class TeamsGuard implements CanActivate {
  constructor(private msalService: MsalService,
    private authService: AuthService,
    private router: Router,
    private msalBroadcastService: MsalBroadcastService,
    private msalGuard: MsalGuard,
    private teamsService: TeamsService) { }

    canActivate(
      route: ActivatedRouteSnapshot,
      state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      // if (this.msalService.instance.getAllAccounts().length > 0) {
      //   return true;
      // }

      return this.teamsService
        .inTeams()
        .then((inTeams): Promise<boolean | UrlTree> => {
          if (inTeams) {
            console.log("inTeams");
            return new Promise<boolean | UrlTree>((resolve) => {
              microsoftTeams.authentication.getAuthToken({
                successCallback: (token: string) => {
                  const decodedToken: { [key: string]: any; } = jwtDecode(token) as { [key: string]: any; };
                  console.log(decodedToken);
                  this.registerTeamsTokenWithMsal(decodedToken, token);
                  console.log("notifySuccess");
                  microsoftTeams.appInitialization.notifySuccess();
                  resolve(true);
                },
                failureCallback: (message: string) => {
                  microsoftTeams.appInitialization.notifyFailure({
                    reason: microsoftTeams.appInitialization.FailedReason.AuthFailed,
                    message
                  });
                  console.log("notifyFailure: " + microsoftTeams.appInitialization.FailedReason.AuthFailed +
                              ", message: " + message);
                  this.authService.redirectUrl = state.url;
                  resolve(this.router.parseUrl('/login'));
                },
                //resources: ['https://white-plant-0e2d2ed10.3.azurestaticapps.net']
                resources: [
                  'https://c8fa-2a02-587-328a-eb00-e18b-46fe-9f53-ddd1.ngrok-free.app'
                ]
                });
            });
          } else {
            console.log("NOT inTeams");
          }

        this.msalGuard.canActivate(route, state);

        return this.msalBroadcastService.inProgress$
          .pipe(
            filter((status: InteractionStatus) => status === InteractionStatus.None),
            switchMap(() => {
              if (this.msalService.instance.getAllAccounts().length > 0) {
                return of(true);
              }

              this.authService.redirectUrl = state.url;
              return of(this.router.parseUrl('/login'));
            }),
            first()
          ).toPromise();
      });
  }

  private async registerTeamsTokenWithMsal(accessToken: { [key: string]: any; }, accessTokenString: string): Promise<void> {
    const accountEntity = this.getAccountEntity(accessToken);
    const accessTokenEntity = this.getAccessTokenEntity(accessToken, accessTokenString);

    //get id token and refresh token
    const idTokenEntity = this.getIdTokenEntity(accessToken, accessTokenString);

    const browserStorage = (this.msalService.instance as any).browserStorage;
    browserStorage.setAccount(accountEntity);
    browserStorage.setAccessTokenCredential(accessTokenEntity);

    // const authResult: AuthenticationResult = await this.msalService.instance.acquireTokenSilent({
    //   scopes: ['user.read'],
    //   account: this.msalService.instance.getAccountByHomeId(accountEntity.homeAccountId)
    // });

    // const newAccessToken = authResult.accessToken;
    // console.log('New access token:', authResult.accessToken);
    // console.log('New id token:', authResult.idToken);
    // console.log('New refresh token:', authResult.tokenType);

    // setting id token and refresh token
    browserStorage.setIdTokenCredential(idTokenEntity);

    const refreshToken = this.getRefreshTokenEntity(accessToken, accessTokenString); //accountEntity.idTokenClaims['refresh_token'];
    browserStorage.setRefreshTokenCredential(refreshToken);

    // this.msalService.acquireTokenSilent(request).subscribe(
    //   (authResult: AuthenticationResult) => {
    //     console.log(`Access token: ${authResult.accessToken}`);
    //     console.log(`ID token: ${authResult.idToken}`);
    //     console.log(`Refresh token: ${authResult.refreshToken}`);
    //   },
    //   (err) => {console.log(err)}
    // );


    this.msalService.instance.setActiveAccount(this.msalService.instance.getAllAccounts()[0]);
  }


  private getAccountEntity(accessToken: { [key: string]: any; }): AccountEntity {
    const account = new AccountEntity();
    Object.assign(account, {
      authorityType: 'MSSTS',
      // fixed
      environment: 'login.windows.net',
      // oid.tid
      homeAccountId: `${accessToken['oid']}.${accessToken['tid']}`,
      // oid
      localAccountId: accessToken['oid'],
      idTokenClaims: accessToken,
      // tid
      realm: accessToken['tid'],
      // upn
      username: accessToken['upn']
    });

    return account;
  }

  private getAccessTokenEntity(accessToken: { [key: string]: any; }, accessTokenString: string): AccessTokenEntity {
    const accessTokenEntity = new AccessTokenEntity();
    Object.assign(accessTokenEntity, {
      cachedAt: accessToken['iat'],
      clientId: (accessToken['aud'] as string).substring((accessToken['aud'] as string).lastIndexOf('/') + 1),
      credentialType: 'AccessToken',
      environment: 'login.windows.net',
      expiresOn: accessToken['exp'],
      extendedExpiresOn: accessToken['exp'],
      homeAccountId: `${accessToken['oid']}.${accessToken['tid']}`,
      realm: accessToken['tid'],
      secret: accessTokenString,
      target: accessToken['scp'],
      tokenType: 'Bearer'
    });

    return accessTokenEntity;
  }

  private getIdTokenEntity(idToken: { [key: string]: any; }, idTokenString: string): IdTokenEntity {
    const idTokenEntity = new IdTokenEntity();
    Object.assign(idTokenEntity, {
      cachedAt: idToken['iat'],
      clientId: (idToken['aud'] as string).substring((idToken['aud'] as string).lastIndexOf('/') + 1),
      credentialType: CredentialType.ID_TOKEN,
      environment: 'login.windows.net',
      expiresOn: idToken['exp'],
      extendedExpiresOn: idToken['exp'],
      homeAccountId: `${idToken['oid']}.${idToken['tid']}`,
      realm: idToken['tid'],
      secret: idTokenString,
      target: idToken['scp'],
      tokenType: 'Bearer'
    });

    return idTokenEntity;
  }

  private getRefreshTokenEntity(token: { [key: string]: any; }, tokenString: string): RefreshTokenEntity {
    const refreshTokenEntity = new RefreshTokenEntity();

    Object.assign(refreshTokenEntity, {
      homeAccountId: `${token['oid']}.${token['tid']}`,
      environment: 'login.windows.net',
      clientId: (token['aud'] as string).substring((token['aud'] as string).lastIndexOf('/') + 1),
      refreshToken: "aaa"
    });


    //
    // * @param homeAccountId
    // * @param authenticationResult
    // * @param clientId
    // * @param authority
    // *
    return refreshTokenEntity;
  }



}