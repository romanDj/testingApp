import { useState } from 'react'
import { Startform } from '~/components/startform'
import { Results } from '~/components/results'
import { TContent } from '~/components/tcontent'
import { useUnit } from 'effector-react';
import { $page, PAGE_START, PAGE_QUESTION, PAGE_RESULT } from '~/shared/config/init';

//главный компонент приложения
export function App() {
  const [page] = useUnit([$page]); // следим какой компонент показывать 

  return <div className="h-screen overflow-auto bg-gradient-to-r from-violet-500 to-fuchsia-500">
    <div className="container max-w-screen-lg mx-auto px-4">
      {page === null &&
        <div className="flex flex-col h-screen justify-center items-center">
          <p className="font-bold text-white">Загрузка...</p>
        </div>
      }
      {page === PAGE_START && <Startform />}
      {page === PAGE_QUESTION && <TContent />}
      {page === PAGE_RESULT && <Results />}
    </div>
  </div>
}
