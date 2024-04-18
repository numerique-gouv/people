export interface MailDomain {
  id: string;
  name: string;
}

export interface MailDomainMailbox {
  id: string;
  local_part: string;
  secondary_email: string;
}
