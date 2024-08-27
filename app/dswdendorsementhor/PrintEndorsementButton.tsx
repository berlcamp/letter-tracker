/* eslint-disable react/display-name */
'use client'

import { DswdEndorsementTypes } from '@/types'
import { PrinterIcon } from 'lucide-react'
import React, { forwardRef, useRef } from 'react'
import ReactToPrint from 'react-to-print'
import PrintFinancialLabTest from './PrintFinancialLabTest'
import PrintFinancialOther from './PrintFinancialOther'
import PrintFuneralAssistance from './PrintFuneralAssistance'
import PrintHospitalBill from './PrintHospitalBill'

interface ModalProps {
  selectedItem: DswdEndorsementTypes
}

interface ChildProps {
  forwardedRef: React.ForwardedRef<HTMLDivElement>
  item: DswdEndorsementTypes
}

export default function PrintEndorsementButton({ selectedItem }: ModalProps) {
  const componentRef = useRef<HTMLDivElement>(null)

  // Using forwardRef to pass the ref down to the ChildComponent
  const ChildWithRef = forwardRef<HTMLDivElement, ChildProps>((props, ref) => {
    if (selectedItem.type === 'Hospital Bill') {
      return (
        <div style={{ pageBreakBefore: 'always' }}>
          <PrintHospitalBill
            {...props}
            forwardedRef={ref}
            selectedItem={props.item}
          />
        </div>
      )
    }
    if (selectedItem.type === 'Financial Assistance (Lab Test)') {
      return (
        <div style={{ pageBreakBefore: 'always' }}>
          <PrintFinancialLabTest
            {...props}
            forwardedRef={ref}
            selectedItem={props.item}
          />
        </div>
      )
    }
    if (selectedItem.type === 'Financial/Medicine Assistance') {
      return (
        <div style={{ pageBreakBefore: 'always' }}>
          <PrintFinancialOther
            {...props}
            forwardedRef={ref}
            selectedItem={props.item}
          />
        </div>
      )
    }
    if (selectedItem.type === 'Funeral Assistance') {
      return (
        <div style={{ pageBreakBefore: 'always' }}>
          <PrintFuneralAssistance
            {...props}
            forwardedRef={ref}
            selectedItem={props.item}
          />
        </div>
      )
    }
  })

  return (
    <>
      <ReactToPrint
        trigger={() => (
          <button className="app__btn_blue flex items-center justify-center space-x-2">
            <PrinterIcon className="w-4 h-4" /> <span>Print Endorsement</span>
          </button>
        )}
        content={() => document.getElementById('print-container-gl')}
      />
      <div className="hidden">
        <div id="print-container-gl">
          <ChildWithRef
            item={selectedItem}
            ref={componentRef}
            forwardedRef={null}
          />
        </div>
      </div>
    </>
  )
}
