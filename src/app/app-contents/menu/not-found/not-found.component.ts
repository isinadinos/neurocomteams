/*
 * A page shown when browser url does not match any routes
 */
import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-not-found",
  template: `
    <div class="error-page">
      <header class="error-page__header">
        <img
          class="error-page__header-image"
          src="assets/images/sad-pc.gif"
          alt="Sad computer"
        />
        <h1 class="error-page__title nolinks">Page Not Found</h1>
      </header>
      <p class="error-page__message">
        The page you are looking for could not be found.
      </p>
    </div>
  `,
  styles: [
    `
      body {
        font: normal 16px/26px Arial, sans-serif;
        background: #fafafa;
        color: #2a3744;
      }

      .error-page {
        margin: 100px 0 40px;
        text-align: center;
      }

      .error-page__header-image {
        width: 112px;
      }

      .error-page__title {
        font-family: "Roboto", Arial, sans-serif;
        font-size: 31px;
      }
    `,
  ],
})
export class NotFoundComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
