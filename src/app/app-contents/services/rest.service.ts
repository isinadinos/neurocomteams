/*
 * Service responsible for making all Http Requests to server.
 * This service is called by other services as well as page components.
 */
import { Injectable, OnDestroy } from "@angular/core";
import { Observable, of, BehaviorSubject } from "rxjs";
import { map, mergeMap, shareReplay, catchError } from "rxjs/operators";
import { HttpClient, HttpResponse, HttpHeaders } from "@angular/common/http";
import { SearchObject, SearchParameters } from "../models_interfaces";
import { CommonService } from "./common.service";

//Basic header configuration
const ROOT_API_ENDPOINT = "rest/";
const HEADERS = new HttpHeaders({
  "Content-Type": "application/json",
  Accept: "application/json",
});

@Injectable({
  providedIn: "root",
})
export class RestService implements OnDestroy {
  private links$: Observable<Object>;

  private user$: Observable<Object>;
  private userSubject$ = new BehaviorSubject<void>(undefined);

  private authorities$: Observable<Object>;
  private authoritiesSubject$ = new BehaviorSubject<void>(undefined);

  //Observable Operators and Pipe explanation
  //https://blog.angularindepth.com/reading-the-rxjs-6-sources-map-and-pipe-94d51fec71c2
  //Map vs FlatMap
  //https://stackoverflow.com/questions/22847105/when-do-you-use-map-vs-flatmap-in-rxjava
  //https://blog.thoughtram.io/angular/2016/06/16/cold-vs-hot-observables.html

  constructor(private http: HttpClient, private comServ: CommonService) {
    //Observable links$ is related to the list of all available urls that components can use to send a request to server
    this.links$ = this.http.get<Object>(ROOT_API_ENDPOINT).pipe(
      shareReplay(1) // shares a single subscription between multiple subscribers , but it won't stop emit until its completion
      // explanation here: https://www.youtube.com/watch?v=WvMgGY_OUpM
    );

    //----------------------  Http Requests for common info ---------------------------------------------------------------------------

    //Observable authorities$ contains information about all possible types of user (admin, viewer etc)
    this.authorities$ = this.authoritiesSubject$.pipe(
      mergeMap(() =>
        this.getRequestInfo("users", "security/authorities", null, null)
      ),
      map((response) => this.processAuthorities(response)),
      shareReplay(1)
    );

    //Observable user$ contains information about the user that is logged in
    this.user$ = this.userSubject$.pipe(
      mergeMap(() =>
        this.getRequestInfo("users", "search/findCurrentUser", null, null)
      ),
      shareReplay(1)
      // publishReplay(1), //shares a single subscription between multiple subscribers, but stops emitting when there are no subscribers
      //refCount returns an observable that maintains a reference count of subscribers -> when zero it unsubscribes the observable
      // refCount() //automate the unsubscription of the observable

      //Difference with shareReplay is that shareReplay won't stop emitting even without subscribers
      //https://github.com/ReactiveX/rxjs/issues/3336
    );
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.userSubject$.unsubscribe();
    this.authoritiesSubject$.unsubscribe();
  }

  //------------------------------- COMMON INFO REQUEST GETTERS SETTERS ------------------------------------------------------------

  getLinks(): Observable<any> {
    return this.links$.pipe(
      map((res) => res),
      catchError((err) => {
        return of(this.comServ.sendMessage(err[1], "D"));
      })
    );
  }

  getUser() {
    return this.user$;
  }

  getAuthorities(): Observable<any> {
    return this.authorities$;
  }

  refreshInfo() {
    this.userSubject$.next();
    this.authoritiesSubject$.next();
  }

  //-------------------------------------------- GENERIC REQUESTs --------------------------------------------------------------------

  /*
   * @param linkKey: is used as a key to access a specific url inside links$. processLink changes the url into a suitable format
   * @param subpath: is a substring, part of the url we want to access
   * @param pageParams: are search parameters containing information about sorting and pagination
   * @param errMsg: is the msg we want to display in case an error occurs
   */
  getRequestInfo(
    linkKey: string,
    subpath?: string,
    pageParams?: SearchParameters,
    errMsg?: string
  ): Observable<any> {
    return this.links$.pipe(
      map((response) => this.processLink(response["_links"][linkKey]["href"])),
      map(
        (link) =>
          link +
          (subpath != null ? "/" + subpath : "") +
          (pageParams ? this.generateExtras(pageParams) : "")
      ),
      mergeMap((response) => {
        return this.http.get<any>(response, { headers: HEADERS });
      }),
      catchError((err) => {
        return of(this.comServ.sendMessage(errMsg ? errMsg : err[1], "D"));
      })
    );
  }

  /*
   * @param linkKey : same as above
   * @param searchObject : is the object containing information about the search request we want to send
   * @param pageParams : same as above
   */
  getSearchResults(
    linkKey: string,
    searchObject: SearchObject,
    pageParams?: SearchParameters
  ): Observable<any> {
    this.checkEmpty(searchObject.operands);
    return this.links$.pipe(
      map((response) => this.processLink(response["_links"][linkKey]["href"])),
      map((link) => {
        return (
          link +
          "/search/advanced" +
          (pageParams ? this.generateExtras(pageParams) : "")
        );
      }),
      mergeMap((link) => {
        return this.http.post(link, searchObject, { headers: HEADERS });
      }),
      map((results) => ({
        data: results["_embedded"] ? results["_embedded"][linkKey] : [],
        page: results["page"],
      }))
    );
  }

  /*
   * @param action : can be either post or get
   * @param data : is the search object in case we send a post request
   * @param requestObject : is the object containg configuration options of request like headers, accept-type etc
   * This method is called when we want to export a file
   */
  // getFilesGen(action: string, data: any, requestObject: any, linkKey: string, subpath?: string, errMsg?: string) {
  //   return this.links$.pipe(
  //     map(response => this.processLink(response['_links'][linkKey]['href'])),
  //     map(link => link + (subpath != null ? '/' + subpath : '')),
  //     mergeMap(link => {
  //       switch (action) {
  //         case "post":
  //           //data is searchObject in post case
  //           this.checkEmpty(data)
  //           return this.http[action](link, data, requestObject);
  //           break;
  //         case "get":
  //           return this.http[action](link, requestObject);
  //           break;
  //         default:
  //         //nothing
  //       }
  //     }),
  //     map(res => res),
  //     catchError(err => { return of(this.comServ.sendMessage(errMsg ? errMsg : err[1], 'D')) })
  //   )
  // }

  getFilesGen(
    action: string,
    data: any,
    requestObject: any,
    linkKey: string,
    id?: string,
    subpath?: string,
    errMsg?: string,
    respType?: string
  ) {
    return this.links$.pipe(
      map((response) => this.processLink(response["_links"][linkKey]["href"])),
      map(
        (link) =>
          link +
          (id != null ? "/" + id : "") +
          (subpath != null ? "/" + subpath : "")
      ),
      mergeMap((link) => {
        switch (action) {
          case "post":
            //data is searchObject in post case
            this.checkEmpty(data);
            return this.http[action](link, data, requestObject);
            break;
          case "get":
            return this.http[action](link, requestObject);
            break;

          default:
          //nothing
        }
      }),
      map((res) => res),
      catchError((err) => {
        let errorJson = err[0].error;
        // let errorString = errorJson['details'] ? errorJson['errMessage'] + ": " + errorJson['details'] : errorJson['errMessage'];
        return of(
          this.comServ.sendMessage(
            errorJson["errMessage"] ? errorJson["errMessage"] : errMsg,
            "D",
            errorJson["details"]
          )
        );
      })
    );
  }

  //----------------------------------------------persist data functionality ---------------------------------------------------------------------
  /*fix error/success broadcasting
   *Persist data either adds a new entity in db using post request or
   *updates data of existing entity using patch request
   *parameters same as the ones mentioned above
   */
  persistData(
    action: string,
    data: any,
    linkKey: string,
    subpath?: string,
    errMsg?: string,
    confirmationMsg?: string
  ) {
    var confirmed = true;
    if (confirmationMsg) {
      confirmed = confirm(confirmationMsg);
    }
    if (!confirmed) return of(false);
    return this.links$.pipe(
      map((response) => this.processLink(response["_links"][linkKey]["href"])),
      map((link) => link + (subpath != null ? "/" + subpath : "")),
      mergeMap((response) => {
        switch (action) {
          case "patch":
            return this.http.patch<any>(response, data);
            break;
          case "post":
            return this.http.post<any>(response, data, { observe: "response" });
            break;
          default:
            return null;
        }
      }),
      catchError((err) => {
        return of(this.comServ.sendMessage(errMsg ? errMsg : err[1], "D"));
      })
    );
  }

  //---------------------------------------- Uploading Files function -----------------------------------------------------------
  /*
   * @param event : contains information about the file(s) user chose to upload
   * @param fileType : is the name of the file
   * @param extra : if we want to add extra information to formdata we use this parameter (eg. use it as a flag)
   * uploadFile is called when we want to upload a file
   * More information on formData.append: https://developer.mozilla.org/en-US/docs/Web/API/FormData/append
   */
  uploadFile(
    event,
    fileType: string,
    linkKey?: string,
    subpath?: string,
    errMsg?: string
  ): Observable<any> {
    if (!event || event === undefined) {
      this.comServ.sendMessage("Παρακαλώ επιλέξτε αρχείο.", "W");
      return of(false);
    }
    this.comServ.clearMessage();
    this.comServ.updateLoading(true);
    var fileList: FileList = event.target.files;

    var requestObject = {
      headers: { enctype: "multipart/form-data", Accept: "application/json" },
      responseType: "json",
      observe: "response",
    };
    var successMsg = "Επιτυχής μεταφόρτωση αρχείου";
    var errMsg = errMsg
      ? errMsg
      : "Παρουσιάστηκε σφάλμα κατά τη μεταφόρτωση αρχείου.";

    if (fileList.length > 0) {
      let file: File = fileList[0];
      let formData: FormData = new FormData();
      //formData.append('file', file, file.name);
      formData.append(fileType, file, file.name);
      // formData.append("extraParameter", extra); //<-- if we want to append extra information
      return this.getFilesGen(
        "post",
        formData,
        requestObject,
        linkKey,
        null,
        subpath,
        errMsg
      );
    }
  }

  uploadFiles(
    data: any,
    linkKey: string,
    id?: string,
    subpath?: string,
    errMsg?: string
  ) {
    let headers = {
      enctype: "multipart/form-data",
      Accept: "application/json",
    };
    return this.links$.pipe(
      map((response) => this.processLink(response["_links"][linkKey]["href"])),
      map(
        (link) =>
          link +
          (id != null ? "/" + id : "") +
          (subpath != null ? "/" + subpath : "")
      ),
      mergeMap((link) => {
        return this.http.post(link, data, {
          headers: headers,
          responseType: "arraybuffer",
          observe: "response",
        });
      }),
      map((res) => res),
      catchError((err) => {
        return of(this.comServ.sendMessage(errMsg ? errMsg : err[1], "D"));
      })
    );
  }

  //---------------------------------------- Downloading Files function -----------------------------------------------------------
  /*
   * @param res : response of an http request (made in order to get data from server)
   * @param successMsg : message displayed on screen when downloading is successful
   * @param extra : if we want to add extra information in formdata we use this parameter (eg. use it as a flag)
   * downloadingFile is called when we want to download data/files we received from server requests.
   * It basically triggers "downloading" event of browser by attaching and activating a link on DOM
   */
  donwloadingFile(res: HttpResponse<any>, SuccessMsg: string) {
    console.log("download res: ", res);
    if (res === null || res === undefined || typeof res == undefined)
      return false;
    var filename = "";
    var disposition = res.headers.get("Content-Disposition");
    if (disposition && disposition.indexOf("attachment") !== -1) {
      var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      var matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
        filename = matches[1].replace(/['"]/g, "");
      }
    }

    const link = document.createElement("a");
    link.setAttribute("target", "_blank");
    link.setAttribute("href", res.url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    this.comServ.sendMessage(SuccessMsg, "S");
    return true;
  }

  //---------------------------------------- Delete Files function -----------------------------------------------------------

  deleteFile(id: string, subpath: string, errMsg?: string): Observable<any> {
    return this.links$.pipe(
      map((response) =>
        this.processLink(response["_links"]["uploadedFiles"]["href"])
      ),
      map(
        (link) =>
          link +
          (id != null ? "/" + id : "") +
          (subpath != null ? "/" + subpath : "")
      ),
      mergeMap((response) => {
        return this.http.delete(response, {
          headers: HEADERS,
          observe: "response",
        });
      }),
      catchError((err) => {
        let errorJson = err[0].error;
        return of(
          this.comServ.sendMessage(
            errorJson["errMessage"] ? errorJson["errMessage"] : errMsg,
            "D",
            errorJson["details"]
          )
        );
      })
    );
  }

  //-------------------- Preprocessing functions before http requests. ----------------------------------------

  /* Remove empty fields from searchObject */
  checkEmpty(obj) {
    for (var key in obj) {
      if (typeof obj[key] === "string" || obj[key] instanceof String) {
        obj[key] = obj[key].trim();
      }
      if (obj[key] === null || obj[key] === "" || obj[key] === undefined) {
        delete obj[key];
      }
      if (obj[key] instanceof Object) {
        this.checkEmpty(obj[key]);
      }
    }
    return;
  }

  //create link parameters for http requests
  private generateExtras(pageParams: SearchParameters): string {
    var index = "?";
    let generatedExtras = "";
    //addition
    if (pageParams.query) {
      // generatedExtras = index + pageParams.query;
      for (let k in pageParams.query) {
        generatedExtras += `${index}${k}=${pageParams.query[k]}`;
        index = "&";
      }
    }
    if (pageParams.page) {
      generatedExtras += index + "page=" + pageParams.page;
      index = "&";
    }
    if (pageParams.size) {
      generatedExtras += index + "size=" + pageParams.size;
      index = "&";
    }
    if (pageParams.sort) {
      //generatedExtras = generatedExtras + index + 'sort=' + pageParams.sort + (pageParams.asc ? ',asc' : ',desc');
      generatedExtras +=
        index +
        "sort=" +
        pageParams.sort +
        "," +
        (pageParams.asc ? pageParams.asc : "desc");
    }
    return generatedExtras;
  }

  //format url for http requests
  private processLink(link: string): string {
    if (link.indexOf("{") > 0) {
      link = link.substring(0, link.indexOf("{"));
    }
    if (location.protocol.indexOf("https") >= 0) {
      link = link.replace(/^http:\/\//g, "https://");
    }
    return link;
  }

  //store authority types
  private processAuthorities(data: any) {
    var authorities = {};
    for (var key in data) {
      authorities[data[key]["authority"]] = true;
    }
    return authorities;
  }
}
