import Image from 'next/image'

export default function LogoHeaderHor() {
  return (
    <tr>
      <td colSpan={6}>
        <div className="flex items-start justify-evenly">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-[120px]">&nbsp;</div>
          </div>
          <div className="text-center">
            <Image
              src="/images/hor.png"
              width={220}
              height={220}
              alt="alt"
              className="mx-auto"
            />
          </div>
          <div className="flex flex-col items-end justify-end">
            <div className="-mr-12 space-y-6">
              <Image
                src="/images/bagongpilipinas.png"
                width={100}
                height={100}
                alt="alt"
                className="mx-auto"
              />
              <Image
                src="/images/asd.png"
                width={120}
                height={120}
                alt="alt"
                className="mx-auto"
              />
            </div>
          </div>
        </div>
      </td>
    </tr>
  )
}
