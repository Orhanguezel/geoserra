// Google Identity Services (GSI) global type declarations
// Loaded dynamically via https://accounts.google.com/gsi/client

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
  }): void;
  prompt(momentListener?: (notification: unknown) => void): void;
  renderButton(parent: HTMLElement, options: Record<string, unknown>): void;
  disableAutoSelect(): void;
  revoke(hint: string, done: () => void): void;
}

interface Window {
  google?: {
    accounts: {
      id: GoogleAccountsId;
    };
  };
}
