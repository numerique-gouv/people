import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

export type ContactFormValues = {
  firstName: string;
};

type Props = {};
export const ContactForm = (props: Props) => {
  const schema = z.object({
    firstName: z.string().min(1),
  });

  const methods = useForm<ContactFormValues>({
    delayError: 0,
    defaultValues: {
      firstName: '',
    },
    resolver: zodResolver(schema),
  });
  return <div></div>;
};
