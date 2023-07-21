import { SecurityContext } from "@angular/compiler/src/core";
import { Pipe, PipeTransform } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

@Pipe({
  name: "safe",
})
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  transform(url) {
    // return url;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
