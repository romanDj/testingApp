import { useUnit, useStoreMap } from "effector-react";
import { $result, againClicked, $resultsHistory } from "~/shared/config/init";

//результаты
export function Results() {
	const [result, resultsHistory] = useUnit([$result, $resultsHistory]);

	return <div className="flex flex-col h-screen justify-center items-center">
		<div className="shadow-md my-4 bg-white rounded p-5 max-w-lg w-full">
			<h1 className="text-center text-2xl font-bold mb-3">Результат</h1>
			<div className="flex flex-row justify-center items-center gap-3 pt-4 pb-2">
				<p className="text-lg">Ваши баллы:</p>
				<div className="rounded text-xl px-1">
					{result.points}
				</div>
			</div>

			<div className="flex flex-row justify-center items-center gap-3 pt-1 pb-4">
				<p className="text-lg">Процент прохождения:</p>
				<div className={"rounded text-xl px-1 text-white " +
					(result.percent < 51 ? "bg-red-500 " :
						(result.percent < 76 ? "bg-yellow-500" : "bg-green-500 "))}>
					{result.percent} %
				</div>
			</div>
			{(resultsHistory && resultsHistory.length > 0) && <div>
				<p className="mb-2">История</p>
				<div className="overflow-hidden rounded-lg max-h-60 border border-gray-200 flex flex-col">
					<div className="overflow-auto h-full">
						{resultsHistory.map((res, idx) =>
							<div key={idx} className="m-2 bg-gray-100 rounded p-1">
								<p>Имя: {res.username}</p>
								<p>Дата и время: {res.datetimeFinish}</p>
								<p>Баллы: {res.result}</p>
							</div>)}
					</div>
				</div>
			</div>}

			<div className="flex flex-row gap-3 mt-5">
				<button onClick={againClicked} type="button" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  w-full px-5 py-2.5 text-center">Пройти еще раз</button>
			</div>
		</div>
	</div>;
}
