import Image from 'next/image'

export default function Home() {
  return (
    <main className="flex bg-blue-950 text-white min-h-screen flex-col  px-10 py-5">
      <div className='md:flex md:flex-row md:justify-between'>
        <h1 className='sm:pb-6 text-4xl font-bold'>SweepStake</h1>
        <h1 className='sm:pt-5 text-3xl font-bold'>Game is currently on!</h1>
      </div>

      <div className='flex flex-row justify-center align-middle pt-12'>
        <h1 className='text-2xl font-semibold'>Stake today and get all the staked money when you win</h1>
      </div>

      <div className='flex flex-row justify-center align-middle pt-8'>
        <input
          type='number'
          required maxLength={"5"}
          className="px-6 py-3 bg-blue-950 align-middle rounded-lg border-zinc-50 border-solid outline-double	w-64"
          placeholder="Amount to stake"
        // value={name}
        // onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className='flex flex-row justify-center align-middle pt-4'>
        <button
          // disabled={!previewUrl}
          // onClick={onUploadImage}
          className="w-1/2 mx-14 py-2 mb-3 text-sm font-medium text-white transition-colors duration-300 rounded-lg bg-blue-800 md:w-28 md:text-base disabled:bg-brightRed"
        >
          Stake
        </button>
      </div>

      <div className='flex md:flex-row md:justify-between pt-8'>
        {/* Left element{Details of players} */}
        <div >
          <h1 >Current number of players: 5</h1>
          <h1>Address of last Winner: 0xff893nfncjbjsdfdh</h1>
          <h1>Minimun amount required to play: 0.1 Matic</h1>
        </div>

        {/* Right element{Start game} in the row*/}
        <div className='sm: pt-6'>
          <input
            type='number'
            required maxLength={"3"}
            className="px-6 py-3 bg-blue-950 align-middle rounded-lg border-zinc-50 border-solid outline-double	w-64"
            placeholder="End time (days)"
          // value={name}
          // onChange={(e) => setName(e.target.value)}
          />

          <div className='flex flex-row justify-center align-middle pt-4'>
            <button
              // disabled={!previewUrl}
              // onClick={onUploadImage}
              className="w-1/2 mx-14 py-2 mb-3 text-sm font-medium text-white transition-colors duration-300 rounded-lg bg-green-800 md:w-28 md:text-base disabled:bg-brightRed"
            >
              Start Game
            </button>
          </div>

        </div>


      </div>

    </main>
  )
}
