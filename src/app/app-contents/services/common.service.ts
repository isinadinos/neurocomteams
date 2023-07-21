/**
 * A service responsible for common functionalities used widely by application components.
 * Common Service (so far) contains methods used for sending messages, spinner signals or storing variables (using local storage).
 **/
import { Injectable, Inject } from "@angular/core";
import { StorageService, LOCAL_STORAGE } from "ngx-webstorage-service"; //https://www.npmjs.com/package/ngx-webstorage-service
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({ providedIn: "root" })
export class CommonService {
  private subject = new BehaviorSubject<any>("");
  private loading = new BehaviorSubject<any>(false);
  private valueSub = new BehaviorSubject<any>("");
  private myTimeOut;

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {}

  /*------------------------ Handle Response Messages ---------------------------------
   * Send and Get Server Responses
   * One component should subscribe to behaviorSubject (via getMessage()) in order to receive messages
   * Other components can just call sendMessage() when they want to send a message
   */

  sendMessage(message: string, type: string, msgDetails?: string) {
    console.log("sendMessage: ", message);
    if (this.myTimeOut) {
      clearTimeout(this.myTimeOut);
    }
    this.subject.next({ text: message, type: type, details: msgDetails });
    this.myTimeOut = setTimeout(() => this.clearMessage(), 4000);
  }

  clearMessage() {
    this.subject.next("");
    clearTimeout(this.myTimeOut);
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
  }

  /*--------------------- Signal Spinner to Start/Stop ---------------------------------
   * Signal spinner when loading is starting or ending
   * Sending signals is made in a similar way as described above (with behaviorSubject functionality)
   */

  updateLoading(value: boolean) {
    this.loading.next(value);
  }

  getLoading() {
    return this.loading.asObservable();
  }

  /*--------------------------- Local Storage Functionality ------------------------------
   * Save variables locally so that they won't get lost when refreshing the page
   * Set a {key, pair} value for every parameter that needs to be stored
   */
  public getValue(key: any) {
    return this.storage.get(key);
  }

  public setValue(key: any, value: any) {
    this.storage.set(key, value);
    this.valueSub.next([key, value]);
  }

  public removeEntry(key: any) {
    this.storage.remove(key);
  }

  public clearStorage() {
    this.storage.clear();
  }

  public getSubscription() {
    return this.valueSub.asObservable();
  }
}
