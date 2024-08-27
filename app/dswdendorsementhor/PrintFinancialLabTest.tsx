/* eslint-disable react/display-name */
'use client'

import LogoHeaderHor from '@/components/LogoHeaderHor'
import { DswdEndorsementTypes } from '@/types'
import { format } from 'date-fns'
import React from 'react'
import { ToWords } from 'to-words'

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  selectedItem: DswdEndorsementTypes
}

const PrintFinancialLabTest: React.FC<ChildProps> = ({
  forwardedRef,
  selectedItem,
}) => {
  const convertToWord = (amount: number) => {
    const toWords = new ToWords({
      localeCode: 'en-US',
      converterOptions: {
        currency: true,
        ignoreDecimal: false,
        ignoreZeroCurrency: false,
        doNotAddOnly: false,
        currencyOptions: {
          // can be used to override defaults for the selected locale
          name: 'Peso',
          plural: 'Pesos',
          symbol: 'P',
          fractionalUnit: {
            name: 'Centavo',
            plural: 'Centavos',
            symbol: '',
          },
        },
      },
    })
    return toWords.convert(amount, { currency: true })
  }

  return (
    <div
      ref={forwardedRef}
      className="w-full mx-auto px-10 mt-8 text-sm">
      <table className="w-full">
        <thead>
          <LogoHeaderHor />
        </thead>
        <tbody className="text-sm">
          <tr>
            <td
              colSpan={6}
              className="text-center">
              <div className="text-xl underline underline-offset-2 mt-4">
                ENDORSEMENT - NO. {format(new Date(selectedItem.date), 'yy')}
                -AO-000{selectedItem.endorsement_no}
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={6}>
              <div className="mt-6">
                {format(new Date(selectedItem.date), 'dd MMMM yyyy')}
              </div>
              <div className="uppercase mt-6 font-bold">RAMEL F. JAMEN</div>
              <div className="italic">Regional Director</div>
              <div className="">Field Office X</div>
              <div className="">
                Department of Social Welfare and Development (DSWD)
              </div>
              <div className="">
                Upper Carmen, Cagayan de Oro, Misamis Oriental
              </div>

              <div className="mt-6 flex items-start justify-start">
                <div className="w-16 text-black font-bold">Thru:</div>
                <div>
                  <div className="uppercase mt-6 font-bold">
                    RAMIEL A. GUINANDAM
                  </div>
                  <div className="italic">SWAD Officer</div>
                  <div className="">
                    Department of Social Welfare and Development
                  </div>
                  <div className="">Ozamiz City Field Office</div>
                </div>
              </div>

              <div className="mt-6 font-bold">Dear Mr. Jamen:</div>
              <div className="mt-6">
                <div>
                  We would like to respectfully endorse to your good office the
                  request for financial assistance for laboratory tests (
                  {selectedItem.lab_test}) of{' '}
                  <span className="font-bold uppercase">
                    {selectedItem.patient_fullname}
                  </span>{' '}
                  of <span>{selectedItem.patient_address}</span>, in the amount
                  of{' '}
                  <span className="font-bold">
                    ({convertToWord(Number(selectedItem.amount))}) (P
                    {selectedItem.amount}).
                  </span>
                </div>
                <div className="mt-2">
                  <span className="font-bold uppercase">
                    {selectedItem.patient_fullname}
                  </span>{' '}
                  has been suffering from{' '}
                  <span>{selectedItem.suffering_from}</span>. As a consequence,{' '}
                  {selectedItem.patient_gender === 'Male' ? 'he' : 'she'} was
                  requested to submit{' '}
                  {selectedItem.patient_gender === 'Male'
                    ? 'himself'
                    : 'herself'}{' '}
                  to ({selectedItem.lab_test}) to determine his medical
                  condition which is above what he/she can ill-afford.
                </div>

                <div className="mt-2">
                  Hence, we humbly exhort upon your benevolence to help us
                  lighten the burden of our constituent in this very difficult
                  time by according them the privilege of availing your good
                  office{'’'}s {selectedItem.good_office}.
                </div>
                <div className="mt-2">
                  We are sincerely anticipating your good office’s accommodation
                  of this endorsement.
                </div>
                <div className="mt-2 mb-4">
                  Together let us move towards Asenso Secondo Distrito.
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan={6}>
              <div className="mt-8">By the authority of: </div>
              <div className="mt-6 font-bold">
                REP. SANCHO FERNANDO &quot;ANDO&quot; F. OAMINAL
              </div>

              <div className="mt-10">Respectfully yours,</div>
              <div className="mt-6 font-bold">MARY GRACE T. CODILLA</div>
              <div className="">Legislative Staff</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
export default PrintFinancialLabTest
