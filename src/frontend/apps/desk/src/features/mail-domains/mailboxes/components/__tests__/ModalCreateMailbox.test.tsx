import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'fetch-mock';

import { AppWrapper } from '@/tests/utils';

import { MailDomain } from '../../../domains/types';
import { ModalCreateMailbox } from '../ModalCreateMailbox';

const mockMailDomain: MailDomain = {
  id: '456ac6ca-0402-4615-8005-69bc1efde43f',
  name: 'example.com',
  slug: 'example-com',
  status: 'enabled',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  abilities: {
    get: true,
    patch: true,
    put: true,
    post: true,
    delete: true,
    manage_accesses: true,
  },
};

const toast = jest.fn();
jest.mock('@openfun/cunningham-react', () => ({
  ...jest.requireActual('@openfun/cunningham-react'),
  useToastProvider: () => ({
    toast,
  }),
}));

describe('ModalCreateMailbox', () => {
  const mockCloseModal = jest.fn();
  const apiUrl = `end:/mail-domains/${mockMailDomain.slug}/mailboxes/`;

  const renderModalCreateMailbox = () => {
    return render(
      <ModalCreateMailbox
        mailDomain={mockMailDomain}
        closeModal={mockCloseModal}
      />,
      { wrapper: AppWrapper },
    );
  };

  const getFormElements = () => ({
    formTag: screen.getByTitle('Mailbox creation form'),
    inputFirstName: screen.getByLabelText(/First name/i),
    inputLastName: screen.getByLabelText(/Last name/i),
    inputLocalPart: screen.getByLabelText(/Email address prefix/i),
    inputEmailAddress: screen.getByLabelText(/Secondary email address/i),
    buttonCancel: screen.getByRole('button', { name: /Cancel/i, hidden: true }),
    buttonSubmit: screen.getByRole('button', {
      name: /Create the mailbox/i,
      hidden: true,
    }),
  });

  beforeEach(() => {
    jest.clearAllMocks();
    fetchMock.restore();
  });

  it('renders all the elements', () => {
    renderModalCreateMailbox();
    const {
      formTag,
      inputFirstName,
      inputLastName,
      inputLocalPart,
      inputEmailAddress,
      buttonCancel,
      buttonSubmit,
    } = getFormElements();

    expect(formTag).toBeVisible();
    expect(inputFirstName).toBeVisible();
    expect(inputLastName).toBeVisible();
    expect(inputLocalPart).toBeVisible();
    expect(screen.getByText(`@${mockMailDomain.name}`)).toBeVisible();
    expect(inputEmailAddress).toBeVisible();
    expect(buttonCancel).toBeVisible();
    expect(buttonSubmit).toBeVisible();
  });

  it('shows validation errors for empty fields', async () => {
    renderModalCreateMailbox();

    const {
      inputFirstName,
      inputLastName,
      inputLocalPart,
      inputEmailAddress,
      buttonSubmit,
    } = getFormElements();

    // To bypass html form validation we need to fill and clear the fields
    await userEvent.type(inputFirstName, 'John');
    await userEvent.type(inputLastName, 'Doe');
    await userEvent.type(inputLocalPart, 'john.doe');
    await userEvent.type(inputEmailAddress, 'john.doe@mail.com');
    await userEvent.clear(inputFirstName);
    await userEvent.clear(inputLastName);
    await userEvent.clear(inputLocalPart);
    await userEvent.clear(inputEmailAddress);

    await userEvent.click(buttonSubmit);

    expect(screen.getByText(`@${mockMailDomain.name}`)).toBeVisible();

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter your first name/i),
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByText(/Please enter your last name/i),
      ).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.getByText(/You must have minimum 1 character/i),
      ).toBeInTheDocument();
    });

    expect(fetchMock.lastUrl()).toBeFalsy();
    expect(buttonSubmit).toBeDisabled();
  });

  it('calls the createMailbox API on form submission with valid data', async () => {
    fetchMock.postOnce(apiUrl, {
      status: 201,
    });

    renderModalCreateMailbox();

    const {
      inputFirstName,
      inputLastName,
      inputLocalPart,
      inputEmailAddress,
      buttonSubmit,
    } = getFormElements();

    await userEvent.type(inputFirstName, 'John');
    await userEvent.type(inputLastName, 'Doe');
    await userEvent.type(inputLocalPart, 'johndoe');
    await userEvent.type(inputEmailAddress, 'john.doe@mail.com');

    await userEvent.click(buttonSubmit);

    await waitFor(() => {
      expect(fetchMock.called(apiUrl)).toBeTruthy();
    });
    expect(fetchMock.lastCall(apiUrl)?.[1]?.body).toEqual(
      JSON.stringify({
        first_name: 'John',
        last_name: 'Doe',
        local_part: 'johndoe',
        secondary_email: 'john.doe@mail.com',
      }),
    );
  });

  it('shows error message when mailbox prefix is already used', async () => {
    fetchMock.postOnce(apiUrl, {
      status: 400,
      body: {
        local_part: 'Mailbox with this Local_part and Domain already exists.',
      },
    });

    renderModalCreateMailbox();

    const {
      inputFirstName,
      inputLastName,
      inputLocalPart,
      inputEmailAddress,
      buttonSubmit,
    } = getFormElements();

    await userEvent.type(inputFirstName, 'John');
    await userEvent.type(inputLastName, 'Doe');
    await userEvent.type(inputLocalPart, 'johndoe');
    await userEvent.type(inputEmailAddress, 'john.doe@mail.com');

    await userEvent.click(buttonSubmit);

    await waitFor(() => {
      expect(
        screen.getByText(/This email prefix is already used./i),
      ).toBeInTheDocument();
    });
  });

  it('closes the modal when cancel button is clicked', async () => {
    renderModalCreateMailbox();

    const { buttonCancel } = getFormElements();

    await userEvent.click(buttonCancel);

    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('disables the submit button while the form is submitting', async () => {
    fetchMock.postOnce(apiUrl, new Promise(() => {})); // Simulate pending state

    renderModalCreateMailbox();

    const {
      inputFirstName,
      inputLastName,
      inputLocalPart,
      inputEmailAddress,
      buttonSubmit,
    } = getFormElements();

    await userEvent.type(inputFirstName, 'John');
    await userEvent.type(inputLastName, 'Doe');
    await userEvent.type(inputLocalPart, 'johndoe');
    await userEvent.type(inputEmailAddress, 'john.doe@mail.com');

    await userEvent.click(buttonSubmit);

    await waitFor(() => {
      expect(buttonSubmit).toBeDisabled();
    });
  });
});
