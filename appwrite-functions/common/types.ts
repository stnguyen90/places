export interface AppwriteRequest {
  headers: { [name: string]: string };
  bodyText: string;
  bodyJson: object;
}

export interface AppwriteResponse {
  send: (
    body: any,
    statusCode?: number,
    headers?: { [name: string]: string },
  ) => { body: any; statusCode: number; headers: { [name: string]: string } };
  json: (
    obj: object,
    statusCode?: number,
    headers?: { [name: string]: string },
  ) => { body: any; statusCode: number; headers: { [name: string]: string } };
}

export interface AppwriteContext {
  req: AppwriteRequest;
  res: AppwriteResponse;
  log: (...messages: any) => void;
  error: (...messages: any) => void;
}
