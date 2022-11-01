/* eslint-disable no-nested-ternary */
import React from 'react';
import { ApiDetailsInterface } from '../../config';
import { BankType, ServiceStatusDataType } from '../../types/serviceStatusTypes';
import { isEmptyObject } from '../utils';
import TableItem from './tableItem';

const tableHeaders = [
  'Participant ID',
  'Partcipant Name',
  'Status',
  'Clearing System',
];

const renderErrorMessage = (message: string) => (
  <div className="pt-24 text-center" data-cy="errorMessage">
    {message}
  </div>
);

const renderApiData = (apiData: ApiDetailsInterface[]) => (
  <div className="absolute bg-black bg-opacity-80 p-8 rounded-lg text-white flex-col h-full w-full">
    <h1 className="text-sm">
      {apiData[0].name}
      {' '}
      API
    </h1>
    <h3 className="text-xs mb-4">{apiData[0].path}</h3>
    <h3 className="text-xs">{apiData[0].description}</h3>
  </div>
);
function StatusTable({ apiData, serviceStatusData, displayingApiData } : { apiData: ApiDetailsInterface[], serviceStatusData: ServiceStatusDataType, displayingApiData: boolean }) {
  const bankStatus = serviceStatusData?.bankStatus;
  return (
    <div className="relative">
      {displayingApiData && renderApiData(apiData)}
      {!serviceStatusData || serviceStatusData.errors ? renderErrorMessage(
        'Error gathering information from API. Toggle on mocked data below to see example information',
      )
        : isEmptyObject(bankStatus) ? renderErrorMessage(
          'There are no upcoming outages. Want to know what this data looks like? Toggle on mocked data below.',
        ) : (
          <table className="mb-6 min-w-full border-b border-gray-200 text-xs">

            <thead className="border-b-2">
              <tr>
                {tableHeaders
                && tableHeaders.map((header) => (
                  <th
                    scope="col"
                    className="py-2 text-left font-medium uppercase text-gray-500"
                    key={`tableHeader=${header}`}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {bankStatus?.length > 0
              && bankStatus.map((outage : BankType) => (
                <tr key={`outage-${outage.participantId}-${outage.participantName}`}>
                  <TableItem text={outage.participantId} />
                  <TableItem text={outage.participantName} />
                  <TableItem text={outage.status} status />
                  <TableItem text={outage.clearingSystem} />
                </tr>
              ))}
            </tbody>
          </table>
        )}
    </div>
  );
}

export default StatusTable;
