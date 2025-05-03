import "react-router";

declare module "react-router" {
  interface Register {
    params: Params;
  }
}

type Params = {
  "/": {};
  "/scene/generate-name": {};
  "/scene/delete": {};
  "/scene/update": {};
  "/set-theme": {};
  "/dashboard": {};
  "/dashboard/settings": {};
  "/dashboard/new": {};
  "/:draw": {
    "draw": string;
  };
};