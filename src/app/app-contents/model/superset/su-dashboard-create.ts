export class SuDashboardCreate {
  certification_details: string = "";
  certified_by: string = "";
  css: string = "";
  dashboard_title: string;
  external_url: string;
  is_managed_externally: boolean = false;
  json_metadata: string;
  owners: Array<Number> = [];
  position_json: string;
  published: boolean = false;
  roles: Array<Number> = [];
  slug: string;
}
