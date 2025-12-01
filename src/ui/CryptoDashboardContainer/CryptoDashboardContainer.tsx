/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/tabindex-no-positive */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { skipToken } from '@reduxjs/toolkit/query/react';
import clsx from 'clsx';
import {
  useGetAllCryptosQuery,
  useGetSubscribedCryptosQuery,
  useDeleteSubscribedCryptoMutation,
  useAddSubscribedCryptoMutation,
  useGetCrypto24hPricesQuery,
  useGetCryptoYearlyPricesQuery,
} from '@/api/api';
import Dialog from '@/ui/Dialog/Dialog';
import CryptoHistoryChart from '@/ui/CryptoDashboardContainer/CryptoHistoryChart/CryptoHistoryChart';
import { X, Plus } from 'lucide-react';

export type Period = '24H' | '1M' | '3M' | '6M' | '1Y';

const ADD_SUB_CRYPTOS_DIALOG_ID = 'add_sub_crytpos_dialog';

export default function CryptoDashboardContainer() {
  const [activeCryptoId, setActiveCryptoId] = useState<null | number>(null);
  const [isAddSubCryptosDialogOpen, setIsAddSubCryptosDialogOpen] = useState(false);
  const [currentChartPeriod, setCurrentChardPeriod] = useState<Period>('24H');

  const {
    data: allCryptos,
    isLoading: isGetAllCryptosLoading,
  } = useGetAllCryptosQuery(null);

  const {
    data: subscribedCryptos,
    isLoading: isGetSubscribedCryptosLoading,
  } = useGetSubscribedCryptosQuery(null);

  if (activeCryptoId === null && subscribedCryptos?.length) {
    setActiveCryptoId(subscribedCryptos[0].id);
  }

  const activeCrypto = subscribedCryptos?.find((c) => c.id === activeCryptoId);

  const {
    data: crypto24hPrices,
    isLoading: isGetCrypto24hPricesLoading,
  } = useGetCrypto24hPricesQuery(activeCryptoId ?? skipToken, {
    skip: activeCryptoId === null || currentChartPeriod !== '24H',
  });

  // console.log('24h prices:');
  // console.log(crypto24hPrices);

  const {
    data: cryptoYearlyPrices,
    isLoading: isGetCryptoYearlyPricesLoading,
  } = useGetCryptoYearlyPricesQuery(activeCryptoId ?? skipToken, {
    skip: activeCryptoId === null || currentChartPeriod === '24H',
  });

  // console.log('yearly prices:');
  // console.log(cryptoYearlyPrices);

  const currentPrices = currentChartPeriod === '24H' ? crypto24hPrices : cryptoYearlyPrices;

  const [deleteSubscribedCrypto] = useDeleteSubscribedCryptoMutation();
  const [addSubscribedCrypto] = useAddSubscribedCryptoMutation();

  const subscribedCryptoCards = useMemo(() => {
    if (!subscribedCryptos) return;

    return subscribedCryptos.map((sC) => (
      <div
        key={sC.id}
        className={clsx(
          `relative flex rounded-lg p-[16px_50px_16px_16px] border border-[rgb(225,231,239)] bg-white
          backdrop-blur-xl cursor-pointer transition-standart hover:scale-[1.02] hover:border-blue/50
          focus-visible:outline-none focus-visible:border-blue/50`,
          sC.id === activeCryptoId ? 'shadow-[0_0_40px_hsl(217_91%_55%_/_0.3)]' : 'shadow-sm',
        )}
        onClick={() => setActiveCryptoId(sC.id)}
        tabIndex={1}
      >
        <div
          className="flex flex-col items-start"
        >
          <p
            className="font-inter font-semibold text-[16px] text-[rgb(15,23,41)]"
          >
            {sC.name}
          </p>
          <p
            className="font-inter text-[14px] text-[rgb(101,117,139)]"
          >
            {sC.symbol}
          </p>
        </div>
        <button
          type="button"
          className="absolute top-[4px] right-[4px] w-[24px] h-[24px] rounded-md text-[rgba(101,117,139,0.5)]
            hover:text-shipit-red/70 transition-standart cursor-pointer hover:scale-[1.2] focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-outline-grey focus-visible:ring-offset-2"
          onClick={(e) => {
            e.stopPropagation();

            deleteSubscribedCrypto(sC.id);
            setActiveCryptoId(null);
          }}
        >
          <X
            className="w-full h-full"
          />
        </button>
      </div>
    ));
  }, [activeCryptoId, subscribedCryptos, deleteSubscribedCrypto]);

  const addCryptosList = useMemo(() => {
    if (!allCryptos || !subscribedCryptos) return;

    const allCryptoEls = allCryptos.map((c) => {
      const isSubscribed = subscribedCryptos.find((sC) => sC.id === c.id);

      return (
        <li
          key={c.id}
          className="flex justify-between items-center shrink-0 p-[12px] border border-[rgb(225,231,239)] rounded-lg bg-white"
        >
          <div>
            <p
              className="font-inter font-semibold text-[16px] text-[rgb(15,23,41)]"
            >
              {c.name}
            </p>
            <p
              className="font-inter text-[14px] text-[rgb(101,117,139)]"
            >
              {c.symbol}
            </p>
          </div>
          <button
            type="button"
            className={clsx(
              `w-[32px] h-[32px] flex justify-center items-center rounded-[8px] text-white transition-standart cursor-pointer 
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-outline-grey focus-visible:ring-offset-2`,
              isSubscribed ? 'bg-shipit-red hover:bg-red-400 active:bg-red-600' : 'bg-blue hover:bg-blue-hover active:bg-blue-active',
            )}
            onClick={() => {
              if (isSubscribed) {
                deleteSubscribedCrypto(c.id);
                setActiveCryptoId(null);
              } else {
                addSubscribedCrypto({
                  id: c.id,
                });
              }
            }}
          >
            {isSubscribed ? (
              <X
                className="w-[16px] h-[16px]"
              />
            ) : (
              <Plus
                className="w-[16px] h-[16px]"
              />
            )}
          </button>
        </li>
      );
    });

    return (
      <ul
        className="max-h-[360px] flex flex-col items-stretch gap-[8px] overflow-y-auto"
      >
        {allCryptoEls}
      </ul>
    );
  }, [addSubscribedCrypto, allCryptos, deleteSubscribedCrypto, subscribedCryptos]);

  const addSubscribedCryptoDialogClose = useCallback(() => setIsAddSubCryptosDialogOpen(false), []);
  const changeCurrentChartPeriodCb = useCallback(
    (period: Period) => setCurrentChardPeriod(period),
    [],
  );

  return (
    <>
      <main
        className="md:max-w-[1200px] md:ml-auto md:mr-auto page-content-padding 915:p-[50px_16px_70px_16px]
          flex flex-col items-stretch gap-[24px] font-inter"
      >
        <div
          className="flex flex-col gap-[8px]"
        >
          <h1
            className="text-[20px] sm:text-[24px] font-semibold"
          >
            Crypto Dashboard
          </h1>
          <p
            className="font-inter text-[18px] text-black/60"
          >
            Track your favorite cryptocurrencies
          </p>
        </div>
        <div
          className="flex flex-wrap gap-[16px]"
        >
          {subscribedCryptoCards}
          <button
            type="button"
            className="w-[200px] min-h-[80px] flex flex-col items-center justify-center rounded-lg border
              border-dashed border-[rgb(225,231,239)] bg-white backdrop-blur-xl cursor-pointer
              transition-standart hover:scale-[1.02] hover:border-blue/50 shadow-sm
              focus-visible:outline-none focus-visible:border-blue/50"
            onClick={() => setIsAddSubCryptosDialogOpen(true)}
          >
            <Plus
              className="w-[14px] h-[14px] text-[rgb(15,23,41)]"
            />
            <p
              className="font-inter font-medium text-[14px] text-[rgb(15,23,41)]"
            >
              Add Crypto
            </p>
          </button>
        </div>
        <CryptoHistoryChart
          currentChartPeriod={currentChartPeriod}
          changeCurrentChartPeriodCb={changeCurrentChartPeriodCb}
          unformattedPrices={currentPrices}
          cryptoName={activeCrypto?.name}
          cryptoSymbol={activeCrypto?.symbol}
        />
      </main>
      <Dialog
        dialogId={ADD_SUB_CRYPTOS_DIALOG_ID}
        isOpen={isAddSubCryptosDialogOpen}
        closeDialogCb={addSubscribedCryptoDialogClose}
        label="Subscribe to cryptos menu"
        additionalTriggers={addCryptosList}
      >
        <div
          className="flex flex-col items-stretch gap-[28px]"
        >
          <div className="flex flex-col items-center gap-[6px] text-center">
            <p className="text-[18px] font-semibold leading-none tracking-tight">
              Add Cryptocurrency
            </p>
            <p className="text-[14px] text-[#64748b]">
              Search and add cryptocurrencies to track
            </p>
          </div>
          {addCryptosList}
        </div>
      </Dialog>
    </>
  );
}
