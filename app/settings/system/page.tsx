'use client'
import TopBar from '@/components/TopBar'
import {
  SettingsSideBar,
  Sidebar,
  Title,
  Unauthorized,
} from '@/components/index'
import { useSupabase } from '@/context/SupabaseProvider'
import React, { useEffect, useState } from 'react'

import { superAdmins } from '@/constants/TrackerConstants'
import type { UserAccessTypes } from '@/types/index'
import ChooseUsers from './ChooseUsers'

const Page: React.FC = () => {
  const [users, setUsers] = useState<UserAccessTypes[] | []>([])
  const [loadedSettings, setLoadedSettings] = useState(false)
  const { supabase, session } = useSupabase()

  const fetchData = async () => {
    try {
      const { data, error } = await supabase
        .from('asenso_system_access')
        .select('*, asenso_user:user_id(id,firstname,lastname,middlename,name)')

      if (error) {
        throw new Error(error.message)
      }

      setUsers(data)

      setLoadedSettings(true)
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    void fetchData()
  }, [])

  if (!superAdmins.includes(session.user.email)) return <Unauthorized />

  return (
    <>
      <Sidebar>
        <SettingsSideBar />
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="System Permissions" />
          </div>

          <div className="app__content pb-20 md:w-4/5">
            {loadedSettings && (
              <>
                <ChooseUsers
                  multiple={true}
                  type="request_tracker"
                  users={users}
                  title="Who can access requests tracker"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
export default Page
