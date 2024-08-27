import { CustomButton } from '@/components/index'
import { useFilter } from '@/context/FilterContext'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// Types
import type { DswdEndorsementTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { dswdHospitals, endorsementTypes } from '@/constants/TrackerConstants'
import { useSupabase } from '@/context/SupabaseProvider'
import { useDispatch, useSelector } from 'react-redux'
// import { useSupabase } from '@/context/SupabaseProvider'

interface ModalProps {
  hideModal: () => void
  editData: DswdEndorsementTypes | null
}

const AddEditModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase } = useSupabase()
  const [saving, setSaving] = useState(false)
  const [type, setType] = useState(editData ? editData.type : '')

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const {
    register,
    formState: { errors },
    reset,
    watch,
    handleSubmit,
  } = useForm<DswdEndorsementTypes>({
    mode: 'onSubmit',
  })

  // Watch a specific field
  const patient = watch('patient_fullname')
  const patient_address = watch('patient_address')
  const requester = watch('requester_fullname')
  const hospital = watch('hospital')
  const diagnosis = watch('diagnosis')
  const lab_test = watch('lab_test')
  const patient_gender = watch('patient_gender')

  const onSubmit = async (formdata: DswdEndorsementTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: DswdEndorsementTypes) => {
    const eno = await generateSeriesNo(formdata.endorsement_type)

    console.log('eno', eno)

    const params = {
      type: formdata.type,
      endorsement_type: formdata.endorsement_type,
      other: formdata.other,
      hospital: formdata.hospital,
      date: formdata.date,
      client_himself: formdata.client_himself,
      docdor: formdata.docdor,
      relationship: formdata.relationship,
      amount: formdata.amount,
      patient_fullname: formdata.patient_fullname,
      patient_age: formdata.patient_age,
      patient_gender: formdata.patient_gender,
      patient_address: formdata.patient_address,
      patient_category: formdata.patient_category,
      requester_fullname: formdata.requester_fullname,
      requester_age: formdata.requester_age,
      requester_gender: formdata.requester_gender,
      requester_address: formdata.requester_address,
      requester_category: formdata.requester_category,
      diagnosis: formdata.diagnosis,
      endorsement_no: eno,
      maintenance_medicine: formdata.maintenance_medicine,
      good_office: formdata.good_office,
      lab_test: formdata.lab_test,
      cause_of_death: formdata.cause_of_death,
      suffering_from: formdata.suffering_from,
    }

    try {
      const { data, error } = await supabase
        .from('adm_dswd_endorsements_hor')
        .insert(params)
        .select()

      if (error) throw new Error(error.message)

      const newData = {
        ...params,
        id: data[0].id,
      }
      dispatch(updateList([newData, ...globallist]))

      // Updating showing text in redux
      dispatch(
        updateResultCounter({
          showing: Number(resultsCounter.showing) + 1,
          results: Number(resultsCounter.results) + 1,
        })
      )

      setToast('success', 'Successfully saved.')
      setSaving(false)
      hideModal()
    } catch (error) {
      console.error('error', error)
    }
  }

  const handleUpdate = async (formdata: DswdEndorsementTypes) => {
    if (!editData) return

    const params = {
      type: formdata.type,
      endorsement_type: formdata.endorsement_type,
      other: formdata.other,
      hospital: formdata.hospital,
      date: formdata.date,
      client_himself: formdata.client_himself,
      docdor: formdata.docdor,
      relationship: formdata.relationship,
      amount: formdata.amount,
      patient_fullname: formdata.patient_fullname,
      patient_age: formdata.patient_age,
      patient_gender: formdata.patient_gender,
      patient_address: formdata.patient_address,
      patient_category: formdata.patient_category,
      requester_fullname: formdata.requester_fullname,
      requester_age: formdata.requester_age,
      requester_gender: formdata.requester_gender,
      requester_address: formdata.requester_address,
      requester_category: formdata.requester_category,
      diagnosis: formdata.diagnosis,
      maintenance_medicine: formdata.maintenance_medicine,
      good_office: formdata.good_office,
      lab_test: formdata.lab_test,
      cause_of_death: formdata.cause_of_death,
      suffering_from: formdata.suffering_from,
    }

    try {
      const { data, error } = await supabase
        .from('adm_dswd_endorsements_hor')
        .update(params)
        .eq('id', editData.id)

      if (error) throw new Error(error.message)

      // Append new data in redux
      const items = [...globallist]
      const updatedData = {
        ...params,
        id: editData.id,
      }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      setToast('success', 'Successfully saved.')
      setSaving(false)
      hideModal()
    } catch (error) {
      console.error('error', error)
    }
  }

  const generateSeriesNo = async (type: string) => {
    const { data, error } = await supabase
      .from('adm_dswd_endorsements_hor')
      .select('endorsement_no')
      .eq('status', '')
      .eq('endorsement_type', type)
      .not('endorsement_no', 'is', null)
      .order('endorsement_no', { ascending: false })
      .limit(1)

    if (!error) {
      if (data.length > 0) {
        const rn = !isNaN(data[0].endorsement_no)
          ? Number(data[0].endorsement_no) + 1
          : 1
        return rn
      } else {
        return 1
      }
    } else {
      return 1
    }
  }

  // manually set the defaultValues of use-form-hook whenever the component receives new props.
  useEffect(() => {
    const now = new Date()
    const year = now.getFullYear().toString()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const day = now.getDate().toString().padStart(2, '0')
    const dateString = year + '-' + month + '-' + day

    reset({
      // request details
      date: editData ? editData.date : dateString,
      type: editData ? editData.type : '',
      endorsement_type: editData ? editData.endorsement_type : '',
      other: editData ? editData.other : '',
      hospital: editData ? editData.hospital : '',
      good_office: editData ? editData.good_office : '',
      cause_of_death: editData ? editData.cause_of_death : '',
      maintenance_medicine: editData ? editData.maintenance_medicine : '',
      diagnosis: editData ? editData.diagnosis : '',
      client_himself: editData ? editData.client_himself : false,
      docdor: editData ? editData.docdor : '',
      relationship: editData ? editData.relationship : '',
      amount: editData ? editData.amount : '',
      patient_fullname: editData ? editData.patient_fullname : '',
      patient_age: editData ? editData.patient_age : '',
      patient_gender: editData ? editData.patient_gender : '',
      patient_address: editData ? editData.patient_address : '',
      patient_category: editData ? editData.patient_category : '',
      requester_fullname: editData ? editData.requester_fullname : '',
      requester_age: editData ? editData.requester_age : '',
      requester_gender: editData ? editData.requester_gender : '',
      requester_address: editData ? editData.requester_address : '',
      requester_category: editData ? editData.requester_category : '',
    })
  }, [editData, reset])

  return (
    <>
      <div className="app__modal_wrapper">
        <div className="app__modal_wrapper2_large">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="app__modal_header_text">Request Form</h5>
              <button
                disabled={saving}
                onClick={hideModal}
                type="button"
                className="app__modal_header_btn">
                &times;
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="app__modal_body">
              <div className="mb-4">
                <fieldset className="border p-4 bg-gray-100">
                  <legend className="text-center text-gray-700 text-lg font-semibold">
                    Request Details
                  </legend>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Date Requested</div>
                      <div>
                        <input
                          {...register('date', { required: true })}
                          type="date"
                          className="app__input_standard"
                        />
                        {errors.date && (
                          <div className="app__error_message">
                            Request Date is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">
                        Endorsement Type
                      </div>
                      <div>
                        <select
                          {...register('endorsement_type', { required: true })}
                          className="app__input_standard">
                          <option value="">Select</option>
                          <option value="DSWD">DSWD</option>
                          <option value="PCSO">PCSO</option>
                        </select>
                        {errors.endorsement_type && (
                          <div className="app__error_message">
                            Endorsement type is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Request Type</div>
                      <div>
                        <select
                          {...register('type', { required: true })}
                          onChange={(e) => setType(e.target.value)}
                          className="app__input_standard">
                          <option value="">Select</option>
                          {endorsementTypes.map((item, index) => (
                            <option
                              key={index}
                              value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        {errors.type && (
                          <div className="app__error_message">
                            Request type is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Amount</div>
                      <div>
                        <input
                          {...register('amount')}
                          type="number"
                          step="any"
                          placeholder="Amount"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  {/* <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Doctor</div>
                      <div>
                        <input
                          {...register('docdor')}
                          type="text"
                          placeholder="Doctor"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div> */}
                </fieldset>
                <fieldset className="border p-4 mt-8 bg-gray-100">
                  <legend className="text-center text-gray-700 text-lg font-semibold">
                    Patient Details
                  </legend>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Fullname</div>
                      <div>
                        <input
                          {...register('patient_fullname')}
                          type="text"
                          placeholder="Patient Fullname"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Gender</div>
                      <div>
                        <select
                          {...register('patient_gender')}
                          className="app__input_standard">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Age</div>
                      <div>
                        <input
                          {...register('patient_age')}
                          type="number"
                          placeholder="Patient Age"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Address</div>
                      <div>
                        <input
                          {...register('patient_address')}
                          type="text"
                          placeholder="Patient Address"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Category</div>
                      <div>
                        <input
                          {...register('patient_category')}
                          type="text"
                          placeholder="Patient Category"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border p-4 mt-8 bg-gray-100">
                  <legend className="text-center text-gray-700 text-lg font-semibold">
                    Requester Details
                  </legend>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Fullname</div>
                      <div>
                        <input
                          {...register('requester_fullname')}
                          type="text"
                          placeholder="Requester Fullname"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Gender</div>
                      <div>
                        <select
                          {...register('requester_gender')}
                          className="app__input_standard">
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Age</div>
                      <div>
                        <input
                          {...register('requester_age')}
                          type="number"
                          placeholder="Requester Age"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Address</div>
                      <div>
                        <input
                          {...register('requester_address')}
                          type="text"
                          placeholder="Requester Address"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">Category</div>
                      <div>
                        <input
                          {...register('requester_category')}
                          type="text"
                          placeholder="Requester Category"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="app__form_field_inline_half">
                    <div className="w-full">
                      <div className="app__label_standard">
                        Relationship to Patient/Deceased
                      </div>
                      <div>
                        <input
                          {...register('relationship')}
                          type="text"
                          placeholder="Relationship to Patient/Deceased"
                          className="app__input_standard"
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>

                <fieldset className="border p-4 mt-8 bg-gray-100">
                  <legend className="text-center text-gray-700 text-lg font-semibold">
                    Letter Settings
                  </legend>
                  {/* Hospital Bill */}
                  {type === 'Hospital Bill' && (
                    <div className="w-full space-y-2 text-xs">
                      <div>
                        We would like to respectfully endorse to your good
                        office the billing of{' '}
                        <span style={{ fontWeight: 'bold' }}>{patient}</span> of{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {patient_address},
                        </span>{' '}
                        in the amount of (amount in words) (P figures).
                      </div>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{patient} </span>{' '}
                        has been admitted to
                        <select
                          {...register('hospital', { required: true })}
                          className="w-[32] p-px outline-none border">
                          <option value="">Select</option>
                          {dswdHospitals.map((h, i) => (
                            <option
                              key={i}
                              value={h}>
                              {h}
                            </option>
                          ))}
                        </select>
                        {errors.hospital && (
                          <div className="app__error_message">
                            Hospital is required
                          </div>
                        )}
                        by reason of
                        <input
                          {...register('diagnosis', { required: true })}
                          type="text"
                          placeholder="diagnosis"
                          className="w-[32] p-px outline-none border"
                        />
                        {errors.diagnosis && (
                          <div className="app__error_message">
                            Diagnosis is required
                          </div>
                        )}
                        . As a consequence,{' '}
                        {patient_gender === 'Male' ? 'his' : 'her'} family has
                        incurred a large amount of Medical Bills way above what
                        they can ill-afford.
                      </div>
                      <div>
                        Hence, we humbly exhort upon your benevolence to help us
                        lighten the burden of our constituent in this very
                        difficult time by according them the privilege of
                        availing your good office’s{' '}
                        <input
                          {...register('good_office')}
                          type="text"
                          placeholder="Office"
                          className="w-[32] p-px outline-none border"
                        />
                      </div>
                      <div>
                        We are sincerely anticipating your good office’s
                        accommodation of this endorsement.
                      </div>
                      <div>
                        Together let us move towards ASENSO SECOND DISTRITO.
                      </div>
                    </div>
                  )}
                  {/* Funeral Assistance */}
                  {type === 'Funeral Assistance' && (
                    <div className="w-full space-y-2 text-xs">
                      <div>
                        We would like to respectfully endorse to your good
                        office the request for{' '}
                        <span style={{ fontWeight: 'bold' }}>{type}</span> of{' '}
                        <span style={{ fontWeight: 'bold' }}>{patient}</span> of{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {patient_address},
                        </span>{' '}
                        in the amount of (amount in words) (P figures).
                      </div>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{patient}</span>{' '}
                        has (
                        <input
                          {...register('cause_of_death', { required: true })}
                          type="text"
                          placeholder="(figured into a vehicular accident on) been suffering from ..."
                          className="w-[350px] p-px outline-none border"
                        />
                        {errors.cause_of_death && (
                          <span className="px-1 text-red-500 font-bold">
                            This is required
                          </span>
                        )}
                        ) which caused{' '}
                        {patient_gender === 'Male' ? 'his' : 'her'} demise. As a
                        consequence, {patient_gender === 'Male' ? 'his' : 'her'}{' '}
                        family as represented by{' '}
                        <span style={{ fontWeight: 'bold' }}>{requester}</span>{' '}
                        has incurred a large amount of funeral expenses way
                        above what they can ill-afford.
                      </div>
                      <div>
                        Hence, we humbly exhort upon your benevolence to help us
                        lighten the burden of our constituent in this very
                        difficult time by according them the privilege of
                        availing your good office’s{' '}
                        <input
                          {...register('good_office', { required: true })}
                          type="text"
                          placeholder="Office"
                          className="w-[32] p-px outline-none border"
                        />
                        .
                        {errors.good_office && (
                          <span className="px-1 text-red-500 font-bold">
                            This is required
                          </span>
                        )}
                      </div>
                      <div>
                        We are sincerely anticipating your good office’s
                        accommodation of this endorsement.
                      </div>
                      <div>
                        Together let us move towards ASENSO SECOND DISTRITO.
                      </div>
                    </div>
                  )}
                  {/* Financial Assistance (Lab Test) */}
                  {type === 'Financial Assistance (Lab Test)' && (
                    <div className="w-full space-y-2 text-xs">
                      <div>
                        We would like to respectfully endorse to your good
                        office the request for financial assistance for
                        laboratory tests (
                        <input
                          {...register('lab_test', { required: true })}
                          type="text"
                          placeholder="specify what tests"
                          className="w-[32] p-px outline-none border"
                        />
                        {errors.lab_test && (
                          <span className="px-1 text-red-500 font-bold">
                            This is required
                          </span>
                        )}
                        ) of{' '}
                        <span style={{ fontWeight: 'bold' }}>{patient}</span> of{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {patient_address},
                        </span>{' '}
                        in the amount of (amount in words) (P figures).
                      </div>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{patient}</span>{' '}
                        has been suffering from
                        <input
                          {...register('suffering_from', { required: true })}
                          type="text"
                          placeholder=""
                          className="w-[350px] p-px outline-none border"
                        />
                        {errors.suffering_from && (
                          <span className="px-1 text-red-500 font-bold">
                            This is required
                          </span>
                        )}
                        . As a consequence,{' '}
                        {patient_gender === 'Male' ? 'he' : 'she'} was requested
                        to submit{' '}
                        {patient_gender === 'Male' ? 'himself' : 'herself'} to{' '}
                        {lab_test} to determine his medical condition which is
                        above what {patient_gender === 'Male' ? 'he' : 'she'}{' '}
                        can ill-afford.
                      </div>
                      <div>
                        Hence, we humbly exhort upon your benevolence to help us
                        lighten the burden of our constituent in this very
                        difficult time by according them the privilege of
                        availing your good office’s{' '}
                        <input
                          {...register('good_office', { required: true })}
                          type="text"
                          placeholder="Office"
                          className="w-[32] p-px outline-none border"
                        />
                        .
                        {errors.good_office && (
                          <span className="px-1 text-red-500 font-bold">
                            This is required
                          </span>
                        )}
                      </div>
                      <div>
                        We are sincerely anticipating your good office’s
                        accommodation of this endorsement.
                      </div>
                      <div>
                        Together let us move towards ASENSO SECOND DISTRITO.
                      </div>
                    </div>
                  )}
                  {/* Financial Assistance (Others) */}
                  {type === 'Financial Assistance (Others)' && (
                    <div className="w-full space-y-2 text-xs">
                      <div>
                        We would like to respectfully endorse to your good
                        office the request for financial assistance for
                        <input
                          {...register('other', { required: true })}
                          type="text"
                          placeholder="maintenance medicines (or medical operation, etc)"
                          className="w-[300px] p-px outline-none border"
                        />
                        {errors.other && (
                          <span className="px-1 text-red-500 font-bold">
                            This is required
                          </span>
                        )}
                        of <span style={{ fontWeight: 'bold' }}>{patient}</span>{' '}
                        of{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {patient_address},
                        </span>{' '}
                        in the amount of (amount in words) (P figures).
                      </div>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{patient}</span>{' '}
                        has has been diagnosed with
                        <input
                          {...register('diagnosis', { required: true })}
                          type="text"
                          placeholder="diagnosis"
                          className="w-[32] p-px outline-none border"
                        />
                        {errors.diagnosis && (
                          <span className="px-1 text-red-500 font-bold">
                            Diagnosis is required
                          </span>
                        )}
                        . As a consequence,{' '}
                        {patient_gender === 'Male' ? 'he' : 'she'} was
                        prescribed to take{' '}
                        <input
                          {...register('maintenance_medicine', {
                            required: true,
                          })}
                          type="text"
                          placeholder="maintenance medicine"
                          className="w-[32] p-px outline-none border"
                        />
                        {errors.maintenance_medicine && (
                          <span className="px-1 text-red-500 font-bold">
                            This is required
                          </span>
                        )}{' '}
                        as a maintenance medicine for{' '}
                        {patient_gender === 'Male' ? 'his' : 'her'} condition
                        which is above what{' '}
                        {patient_gender === 'Male' ? 'he' : 'she'} can
                        ill-afford.
                      </div>
                      <div>
                        Hence, we humbly exhort upon your benevolence to help us
                        lighten the burden of our constituent in this very
                        difficult time by according them the privilege of
                        availing your good office’s{' '}
                        <input
                          {...register('good_office', { required: true })}
                          type="text"
                          placeholder="Office"
                          className="w-[32] p-px outline-none border"
                        />
                        .
                        {errors.good_office && (
                          <span className="px-1 text-red-500 font-bold">
                            This is required
                          </span>
                        )}
                      </div>
                      <div>
                        We are sincerely anticipating your good office’s
                        accommodation of this endorsement.
                      </div>
                      <div>
                        Together let us move towards ASENSO SECOND DISTRITO.
                      </div>
                    </div>
                  )}
                </fieldset>
              </div>
              <div className="app__modal_footer">
                <CustomButton
                  btnType="submit"
                  isDisabled={saving}
                  title={saving ? 'Saving...' : 'Submit'}
                  containerStyles="app__btn_green"
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default AddEditModal
