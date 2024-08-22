'use client'
import { superAdmins } from '@/constants/TrackerConstants'
import { useSupabase } from '@/context/SupabaseProvider'
import { Cog6ToothIcon, DocumentDuplicateIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

const MainMenu: React.FC = () => {
  const { session } = useSupabase()

  const email: string = session.user.email

  return (
    <div className="py-1">
      <div className="px-4 py-4">
        <div className="text-gray-700 text-xl font-semibold">Menu</div>
        <div className="lg:flex space-x-2">
          <div className="px-2 py-4 mt-2 lg:w-96 border text-gray-600 rounded-lg bg-white shadow-md flex flex-col space-y-2">
            <Link href="/lettertracker">
              <div className="app__menu_item">
                <div className="pt-1">
                  <DocumentDuplicateIcon className="w-8 h-8" />
                </div>
                <div>
                  <div className="app__menu_item_label">Letter Tracker</div>
                  <div className="app__menu_item_label_description">
                    Letters and Requests
                  </div>
                </div>
              </div>
            </Link>
            <Link href="/dswdendorsementhor">
              <div className="app__menu_item">
                <div className="pt-1">
                  <DocumentDuplicateIcon className="w-8 h-8" />
                </div>
                <div>
                  <div className="app__menu_item_label">
                    DSWD/PCSO Endorsements (HOR)
                  </div>
                  <div className="app__menu_item_label_description">
                    DSWD/PCSO Endorsements (HOR)
                  </div>
                </div>
              </div>
            </Link>
            {superAdmins.includes(email) && (
              <>
                <Link href="/settings/system">
                  <div className="app__menu_item">
                    <div className="pt-1">
                      <Cog6ToothIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="app__menu_item_label">
                        System Settings
                      </div>
                      <div className="app__menu_item_label_description">
                        System Settings - Admin Only
                      </div>
                    </div>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
export default MainMenu
