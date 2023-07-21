export class SuDashboard {
  id: string;
  result: SuDashboardResult;

  constructor() {
    this.result = new SuDashboardResult();
  }
}

class SuDashboardResult {
  certification_details: string;
  certified_by: string;
  css: string;
  dashboard_title: string;
  is_managed_externally: boolean;
  owners: Array<Number>;
  published: boolean;
  roles: Array<Number>;

  constructor() {
    this.certification_details = "";
    this.certified_by = "";
    this.css = "";
    this.dashboard_title = "";
    this.owners = [];
    this.roles = [];
  }
}
