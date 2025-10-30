declare module 'africastalking' {
  interface AfricasTalkingConfig {
    apiKey: string | undefined;
    username: string;
  }

  interface SMSOptions {
    to: string[];
    message: string;
    from?: string;
  }

  interface SMSClient {
    send(options: SMSOptions): Promise<any>;
  }

  interface AfricasTalkingInstance {
    SMS: SMSClient;
  }

  function AfricasTalking(config: AfricasTalkingConfig): AfricasTalkingInstance;

  export = AfricasTalking;
}
