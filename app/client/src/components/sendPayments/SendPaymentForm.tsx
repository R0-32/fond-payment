/* eslint-disable @typescript-eslint/no-misused-promises */
import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { v4 as uuidv4 } from 'uuid';
import { AccountType } from '../../types/accountTypes';
import { AppContext } from '../../context/AppContext';
import {
  FormStatus, FormValuesType, PaymentsResponse, PaymentStatusResponseType,
} from '../../types/globalPaymentApiTypes';
import { config } from '../../config';
import Spinner from '../spinner';
import APIDetails from '../APIDetails';
import FormButton from './FormButton';
import generateApiBody, {
  sendRequest, today, updateSessionStorageTransactions, validationSchema,
} from './SendPaymentsUtils';

type MakePaymentFormProps = {
  accountDetails: AccountType[],
  formStatus: FormStatus,
  setFormStatus: (status: FormStatus) => void
};
function MakePaymentForm({ accountDetails, formStatus, setFormStatus }: MakePaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormValuesType>({
    mode: 'onChange',
    resolver: yupResolver(validationSchema),
  });
  const {
    displayingMockedData, displayingApiData, setJsonDialogData,
  } = React.useContext(AppContext);

  const [apiResponse, setApiResponse] = React.useState<PaymentsResponse>();
  const { paymentConfig } = config;

  const renderErrorValue = (errorMessage?: string) => <p>{errorMessage}</p>;

  const renderSelectField = (
    label: string,
    id: 'debtorAccount' | 'creditorAccount',
    options: AccountType[],
  ) => {
    let defaultValue;
    if (id === 'creditorAccount') {
      defaultValue = JSON.stringify(options[1]);
    }

    return (
      <div className="col-span-6 sm:col-span-3">
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
          :
        </label>
        <select
          {...register(id)}
          id={id}
          defaultValue={defaultValue}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          {options.map((option) => (
            <option
              key={`option-${option.accountId}`}
              value={JSON.stringify(option)}
            >
              {option.accountName}
              {option.accountName ? ' - ' : ' '}
              {option.accountId}
            </option>
          ))}
        </select>
        {renderErrorValue(errors[id]?.message)}
      </div>
    );
  };

  const handleMockedDataResponse = (endToEndId: string) => {
    const mockedResponse: PaymentStatusResponseType = {
      identifiers: {
        endToEndId,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        firmRootId: uuidv4(),
      },
      paymentStatus: {
        createDateTime: today.toUTCString(),
        status: 'PENDING',
      },
    };
    updateSessionStorageTransactions(mockedResponse, paymentConfig.mockedSessionStorageKey);
    setFormStatus(FormStatus.SUCCESS);
    setApiResponse({
      paymentInitiationResponse: mockedResponse.identifiers,
    });
  };
  const onSubmit = async (data:FormValuesType) => {
    setFormStatus(FormStatus.LOADING);
    const globalPaymentApiPayload = generateApiBody(data);
    if (!displayingMockedData) {
      const requestOptions: RequestInit = {
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(globalPaymentApiPayload),
      };
      const result = await sendRequest(requestOptions, setApiResponse, paymentConfig.apiDetails[0].backendPath);
      if (result !== undefined) {
        updateSessionStorageTransactions(result, paymentConfig.sessionStorageKey);
        setFormStatus(FormStatus.SUCCESS);
      } else {
        setFormStatus(FormStatus.ERROR);
      }
    } else {
      handleMockedDataResponse(globalPaymentApiPayload.payments.paymentIdentifiers.endToEndId);
    }
  };

  return (
    <div className=" w-full flex flex-col justify-between h-full">
      {displayingApiData && (
      <APIDetails details={paymentConfig.apiDetails[0]} absolute={false} />
      )}
      {!displayingApiData && (formStatus === FormStatus.ERROR || apiResponse?.errors) && (
        <>
          <pre
            id="json"
            className="h-full border-2 border-dashed border-gray-200 w-full m-2 p-2 overflow-x-auto"
          >
            {JSON.stringify(apiResponse?.errors, undefined, 2)}
          </pre>
          <FormButton
            buttonText="Return"
            buttonType="button"
            onClickFunction={() => {
              setFormStatus(FormStatus.NEW);
              setApiResponse(undefined);
            }}
          />
        </>
      )}
      {!displayingApiData && formStatus === FormStatus.LOADING && <Spinner text="" />}
      {!displayingApiData && (formStatus === FormStatus.SUCCESS || apiResponse?.paymentInitiationResponse) && (
        <>
          <p>Success! API response details: </p>
          <pre
            id="json"
            className="h-full border-2 border-dashed border-gray-200 w-full m-2 p-2 overflow-x-auto"
          >
            {JSON.stringify(apiResponse?.paymentInitiationResponse, undefined, 2)}
          </pre>
          <FormButton
            buttonText="Ok"
            buttonType="button"
            onClickFunction={() => {
              setFormStatus(FormStatus.NEW);
              setApiResponse(undefined);
            }}
          />
        </>
      )}
      {!displayingApiData && formStatus === FormStatus.NEW && (
        <>
          <form onSubmit={handleSubmit(onSubmit)} id="hook-form">
            {renderSelectField('From', 'debtorAccount', accountDetails)}
            {renderSelectField('To', 'creditorAccount', accountDetails)}
            <div className="">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount:
                <input
                  {...register('amount', { min: 0.01 })}
                  type="number"
                  name="amount"
                  step="0.01"
                  data-cy="amount"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </label>
              {renderErrorValue(errors.amount?.message)}
            </div>
            <div className="">
              <label
                htmlFor="date"
                className="block text-sm font-medium text-gray-700"
              >
                Date:
                <input
                  {...register('date', { valueAsDate: true })}
                  type="date"
                  name="date"
                  data-cy="dateInput"
                  value={today.toISOString().split('T')[0]}
                  min={today.toISOString().split('T')[0]}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </label>
              {renderErrorValue(errors.date?.message)}
            </div>
          </form>
          <span className="flex flex-row justify-between">
            <FormButton
              buttonText="Preview JSON"
              buttonType="button"
              onClickFunction={() => setJsonDialogData({ state: true, data: JSON.stringify(generateApiBody(getValues()), undefined, 2) })}
            />
            <FormButton
              buttonText="Submit"
              buttonType="submit"
              form="hook-form"
            />

          </span>
        </>

      )}

    </div>
  );
}
export default MakePaymentForm;
