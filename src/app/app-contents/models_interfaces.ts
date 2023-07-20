/*
 * Interfaces for objects used by application components.
 * (Currently containing objects used for searching and sending data to server)
 */

/*
 *SearchObject: interface of object that is used to carry information when a post request is sent to server
 *eg. when a search is needed, we store our query information in searchobject
 */
export interface SearchObject {
  operator: "OR" | "AND";
  operands: { [param: string]: any | { [param: string]: any } };
}

//   operands: { [param : string]: any, [param : string]? : any };

/*
 *SearchParameters: Interface that describes the structure of search parameters used in a url
 */
export interface SearchParameters {
  [param: string]: any;
}

/*
 *RestResults: Interface that describes the structure of response data we receive from server
 */
export interface RestResults {
  data: object[];
  page: PageResults;
}

/*
 *PageResults: Interface that describes an object that stores information about the page of
 * data we receive as response ( e.g. size of page, number of results, number/index of page etc)
 */
export interface PageResults {
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  sort: string;
  ascending: true;
}

/**
 * Node structure is used for storing information about menu sidenav structure.
 * Each node has a filename, icon and a link or list of children nodes.
 */
export class Node {
  children?: Node[];
  filename: string;
  icon?: string;
  link?: Array<string>;
}

/** Flat node with expandable attribute and level information */
export class FlatNode {
  constructor(
    public expandable: boolean,
    public filename: string,
    public level: number,
    public icon: string,
    public link: Array<string>
  ) {}
}
