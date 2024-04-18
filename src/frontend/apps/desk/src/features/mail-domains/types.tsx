import { UUID } from 'crypto';

export interface MailDomain {
  id: UUID;
  name: string;
}

export interface MailDomainMailbox {
  id: string;
  local_part: string;
  secondary_email: string;
}
