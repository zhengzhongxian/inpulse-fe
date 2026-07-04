export interface UserSession {
  userId: string;
  username: string;
  email: string;
  displayMode: string;
  choiceLanguage: string;
  deviceTrusted: boolean;
  mfaEnabled?: boolean;
}
