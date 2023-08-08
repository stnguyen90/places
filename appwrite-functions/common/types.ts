export interface AppwriteRequest {
  headers: { [name: string]: string };
  payload: string;
  variables: { [name: string]: string };
}

export interface AppwriteResponse {
  send: (string, number?) => {};
  json: (object, number?) => {};
}