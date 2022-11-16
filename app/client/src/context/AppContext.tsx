import * as React from 'react';

interface AppContextInterface {
  setDisplayingMockedData: (displayingMockedData: boolean) => void,
  setDisplayingApiData: (displayingApiData:boolean) => void,
  displayingApiData: boolean,
  displayingMockedData: boolean,
  jsonDialogData: {
    state:boolean,
    data: string | null
  },
  setJsonDialogData: ({ state, data }:{ state:boolean, data:string | null }) => void
}

interface Props {
  children: React.ReactNode
}

const appCtxDefaultValue: AppContextInterface = {
  displayingApiData: false,
  displayingMockedData: true,
  setDisplayingApiData: () => {},
  setDisplayingMockedData: () => {},
  jsonDialogData: {
    state: false,
    data: null,
  },
  setJsonDialogData: () => {},
};

const AppContext = React.createContext<AppContextInterface>(appCtxDefaultValue);

function AppContextProvider({ children }: Props) {
  const [displayingMockedData, setDisplayingMockedData] = React.useState(appCtxDefaultValue.displayingMockedData);
  const [displayingApiData, setDisplayingApiData] = React.useState(appCtxDefaultValue.displayingApiData);
  const [jsonDialogData, setJsonDialogData] = React.useState(appCtxDefaultValue.jsonDialogData);

  return (
    <AppContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        displayingMockedData,
        setDisplayingMockedData,
        displayingApiData,
        setDisplayingApiData,
        jsonDialogData,
        setJsonDialogData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export { AppContextProvider, AppContext };
