import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { FieldConfig } from "../../dynamic-form/fields-interface";
import { Validators } from "@angular/forms";
import { CommonService } from "../../services/common.service";
import { Observable } from "rxjs";
import {
  SearchObject,
  RestResults,
  PageResults,
} from "../../models_interfaces";
import { SearchService } from "../../services/search.service";
import { PageEvent } from "@angular/material/paginator";
import { Sort } from "@angular/material/sort";
import { RestService } from "../../services/rest.service";

/*-------------------------- Column Ids and Column Configurations ---------------------------------- */

const columnIds = ["index", "field1", "field2", "field3", "field4"];

const columnConfigs = {
  index: {
    name: "Index",
    sortEn: false,
    sticky: false,
    pipe: "",
    columnStyle: { "text-align": "left" },
  }, //'left' sets position of element so that is can 'stick' in  place
  field1: {
    name: "Field No1",
    sortEn: false,
    sticky: false,
    pipe: "",
    columnStyle: { "text-align": "left" },
  },
  field2: {
    name: "Field No2",
    sortEn: false,
    sticky: false,
    pipe: "",
    columnStyle: { "text-align": "left" },
  },
  field3: {
    name: "Field No3",
    sortEn: false,
    sticky: false,
    pipe: "",
    columnStyle: { "text-align": "left" },
  },
  field4: {
    name: "Field No4",
    sortEn: false,
    sticky: false,
    pipe: "lowerCase",
    columnStyle: { "text-align": "left" },
  },
};

/*-------------------------------------------------------------------------------------------------------------------------------- */

@Component({
  selector: "app-page2",
  templateUrl: "./page2.component.html",
  styleUrls: ["./page2.component.scss"],
})
export class Page2Component implements OnInit {
  toggleSpin = false;
  //recConfig: contains all necessary information that dynamic form needs in order to create
  //a form card with the form fields that every page demands
  regConfig: FieldConfig[];

  columnIds = [];
  columnValues = {};
  dataSource = []; //datasource is used for mat-table
  searchData: RestResults[];
  searchPageInfo: PageResults;
  searchResults$: Observable<any>;
  searchObject: SearchObject = {
    operator: "AND",
    operands: {
      field1: "", //<--these are ids of the searching fields of our page's form
      field2: "", //<--Ids are equals to field "name" defined inside our recConfig array
      field3: "",
      field4: "",
      field5: "",
      field6: "",
      field7: "",
      field8: "",
      field9: "",
    },
  };

  path = "some-path"; // might be equal to linkKey property
  uploadFile: boolean;
  uploadEvent;

  setRegConfig() {
    this.regConfig = [
      {
        type: "autocomplete",
        //type: "select",
        label: "Autocomplete",
        name: "field1",
        value: "",
        options: [
          { id: "id1", code: "code1" },
          { id: "id2", code: "code2" },
          { id: "id3", code: "code3" },
        ],
        validations: [
          {
            name: "required",
            validator: Validators.required,
            message: "Field is required",
          },
        ],
      },
      {
        type: "autocomplete",
        //type: "select",
        label: "Autocomplete",
        name: "field2",
        value: "",
        options: [
          { id: "id1", code: "code1" },
          { id: "id2", code: "code2" },
          { id: "id3", code: "code3" },
        ],
        validations: [
          {
            name: "required",
            validator: Validators.required,
            message: "Field is required",
          },
        ],
      },
      {
        type: "checkbox",
        label: "CheckBox",
        name: "field3",
        value: true,
      },
      {
        type: "select",
        label: "Select",
        name: "field4",
        value: null,
        options: [
          { id: "id1", code: "code1" },
          { id: "id2", code: "code2" },
          { id: "id3", code: "code3" },
        ],
        validations: [],
      },
      {
        type: "input",
        label: "Input",
        name: "field5",
        value: "Example of Disabled Field",
        disabled: true,
        inputType: "text",
        validations: [],
      },
      {
        type: "input",
        label: "Input",
        inputType: "text",
        name: "field6",
        validations: [],
      },
      {
        type: "date",
        label: "Date",
        name: "field7",
        validations: [
          {
            name: "required",
            validator: Validators.required,
            message: "Field is required",
          },
        ],
      },
      {
        type: "date",
        label: "Date",
        name: "field8",
        validations: [
          {
            name: "required",
            validator: Validators.required,
            message: "Field is required",
          },
        ],
      },
      {
        type: "date",
        label: "Date",
        name: "field9",
        validations: [
          {
            name: "required",
            validator: Validators.required,
            message: "Field is required",
          },
        ],
      },
      {
        type: "button",
        name: "upload",
        label: "Upload Example",
      },
      {
        type: "button",
        name: "export",
        label: "Export Example",
      },
      {
        type: "button",
        name: "search",
        label: "Search Example",
      },
      {
        type: "button",
        name: "reset",
        label: "Reset Example",
      },
    ];

    /* Example of how to get options for select or autocomplete list:
     *
     * this.recConfig[1].options = this.myOptions <-- myOptions has been set with http request on ngOnInit
     *
     *
     */
  }

  //uploadFile is same as the name of div in html
  @ViewChild("uploadedFile") myUploadVariable: ElementRef;

  constructor(
    private searchServ: SearchService,
    private comServ: CommonService,
    private restServ: RestService
  ) {
    this.uploadFile = false;
    this.columnIds = columnIds;
    this.columnValues = columnConfigs;
    this.dataSource = dummyTable;

    this.searchPageInfo = {
      //<--dummy, this info comes from server
      number: 0,
      size: 25,
      totalElements: 2000,
      totalPages: 80,
      sort: "",
      ascending: true,
    };
  }

  ngOnInit() {
    //Example of how to get options for select or autocomplete list:
    /*
     *  this.restServ.getRequestInfo(linkKey, subpath, pageParams <-- most times null, errMsg).subscribe(
     *    res => { this.myOptions = res }
     *)
     *
     */
    this.setRegConfig();
    this.searchServ.clearSearchParams();
    // this.refreshData();
  }

  //Note: this.path is considered to be the same as the likKey used in rest service
  refreshData() {
    this.reset();
    this.searchServ
      .search(this.path, this.searchObject, false)
      .subscribe((res2) => {
        this.searchData = res2.data;
        this.dataSource = res2.data;
        this.searchPageInfo = res2.page;
      });
  }

  //search: sends a request to server via searchService. The information needed for
  //searching is stored to an object (searchObject)
  search() {
    this.searchServ.resetPageParams();
    this.searchServ
      .search(this.path, this.searchObject, true)
      .subscribe((res) => {
        this.searchData = res.data;
        this.dataSource = res.data;
        this.searchPageInfo = res.page;
      });
  }

  reset() {
    this.searchObject.operands = {
      field1: "",
      field2: "",
      field3: true,
      field4: "",
      field5: "",
      field6: "",
      field7: "",
      field8: "",
      field9: "",
    };
  }

  //paginationUpdate: executed when page catches an event caused by user when s/he presses a button of pagination component. It sends
  // a request to server via searchService in order to get the new data
  paginationUpdate(event: PageEvent) {
    this.searchServ
      .onPaginationChange(event, this.path, this.searchObject)
      .subscribe((res) => {
        this.searchData = res.data;
        this.dataSource = res.data;
        this.searchPageInfo = res.page;
      });
  }

  //sortingUpdate: executed when page catches an event caused by user who wants to sort the array. It sends a request to server
  // via searchService in order to get the new data
  sortingUpdate(sort: Sort) {
    if (sort.direction === "") {
      return;
    }
    this.searchServ
      .sortData(sort, this.path, this.searchObject)
      .subscribe((res) => {
        this.searchData = res.data;
        this.dataSource = res.data;
        this.searchPageInfo = res.page;
      });
  }

  // checkEvent: is executed when dynamic form emits an event
  // the event has a type (eventArr[1]) that refers to the name of the button that was pressed
  // and the form data (eventArr[0]) that user filled during the process
  // Depending on the type of event, a different action is taken
  checkEvent(eventArr) {
    let event = eventArr[0];
    let eventType = eventArr[1];
    let eventForm = eventArr[2];

    console.log("event: ", event), console.log(eventArr[1]);

    //set searchobject's parameters equal to user's form input
    Object.entries(event).forEach((entry) => {
      this.searchObject.operands[entry[0]] = entry[1];
    });

    switch (eventType) {
      case "search":
        this.search();
        break;
      case "export":
        this.export("some-linkey", "some-extra-path-for-subpath");
        break;
      case "upload":
        this.uploadFile = !this.uploadFile;
        this.myUploadVariable.nativeElement.value = "";
        break;
      case "reset":
        this.reset();
        eventForm.setValue(this.searchObject.operands);
        break;
      default:
      // nothing
    }
  }

  //TODO* I need to reload page, cd.detectChanges() is tricky
  upload() {
    var successMsg = "Επιτυχής μεταφόρτωση αρχείου";
    var errMsg = "Παρουσιάστηκε σφάλμα κατά τη μεταφόρτωση αρχείου.";

    this.searchServ.resetPageParams();
    this.searchServ
      .search(this.path, this.searchObject, true)
      .subscribe((res) => {
        this.searchData = res.data;
        this.dataSource = res.data;
        this.searchPageInfo = res.page;
        this.restServ
          .uploadFile(
            this.uploadEvent,
            "file",
            this.path,
            null,
            "some-extra-param"
          )
          .subscribe((res) => {
            if (res.statusText == "OK") {
              this.comServ.sendMessage(successMsg, "S");
            }
            this.myUploadVariable.nativeElement.value = "";
          });
      });
    this.uploadFile = false;
  }

  handleFileInput(event) {
    this.uploadEvent = event;
  }

  export(link: string, extraPath: string) {
    var confirmed = true;
    var successMsg = "Επιτυχης Εξαγωγή Excel.";
    var errMsg = "Παρουσιάστηκε σφάλμα κατά την εξαγωγή του αρχείου.";
    var linkKey = link;
    var subpath = "some-subpath-link" + extraPath; //create subpath
    var respType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    var requestObject = {
      headers: { Accept: respType },
      responseType: "arraybuffer",
      observe: "response",
    };

    confirmed = confirm("Εξαγωγή αρχείου;");
    if (confirmed) {
      this.searchServ.resetPageParams();
      this.searchServ
        .search(this.path, this.searchObject, true)
        .subscribe((res) => {
          this.searchData = res.data;
          this.dataSource = res.data;
          this.searchPageInfo = res.page;
          this.restServ
            .getFilesGen(
              "post",
              this.searchObject,
              requestObject,
              linkKey,
              subpath,
              errMsg
            )
            .subscribe((res2: any) => {
              this.restServ.donwloadingFile(res2, successMsg);
            });
        });
    } else {
      alert("Παρακαλώ επιβεβαιώστε την ενέργεια αυτή!");
    }
  }

  sendMsg(msg: string, msgType: string) {
    this.comServ.sendMessage(msg, msgType);
  }

  spinnerMsg() {
    this.comServ.updateLoading(true);
    setTimeout(() => this.comServ.updateLoading(false), 2000);
  }
}

const dummyTable = [
  {
    field1: "field name 1",
    field2: "field name 2",
    field3: "field name 3-1",
    field4: "description 1-1",
  },
  {
    field1: "field name 1-2",
    field2: "field name 2-1",
    field3: "field name 3-2",
    field4: "description 1-2",
  },
  {
    field1: "field name 1-3",
    field2: "field name 2-2",
    field3: "field name 3-3",
    field4: "description 1-3",
  },
  {
    field1: "field name 1-4",
    field2: "field name 2-3",
    field3: "field name 3-4",
    field4: "description 1-4",
  },
  {
    field1: "field name 1-5",
    field2: "field name 2-4",
    field3: "field name 3-5",
    field4: "description 1-5",
  },
];
