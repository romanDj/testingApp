import { useUnit } from 'effector-react';
import { $currQuestion, $questions, nextClicked, answerSelected, $testAttempt } from '~/shared/config/init';

//содержимое теста
export function TContent() {
	const [currQuestion, testAttempt] = useUnit([$currQuestion, $testAttempt]);

	// выбор ответа
	const onSelect = (e, key) => {
		if (!currQuestion.currAnswer) {
			answerSelected(key)
		}
	};

	return <div className="flex flex-col h-screen justify-center items-center">
		<div className="shadow-md my-4 bg-white rounded p-5 max-w-3xl w-full">
			<h2 className="text-md mb-2">
				Вопрос {currQuestion.index + 1} <small>из {testAttempt.questions.length}</small>
			</h2>
			<p className="text-xl mb-3">{currQuestion.item.text}</p>
			<ul className="mb-4 w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg overflow-hidden">
				{Object.entries(currQuestion.item.options).map(([key, value]) =>
					<li key={key} onClick={(e) => onSelect(e, key)}
						className={"w-full border-b border-gray-200 "
							+ (!currQuestion.currAnswer ? "cursor-pointer  hover:bg-violet-200 "
								: (currQuestion.currAnswer == key &&
									(key == currQuestion.item.answer ? "bg-green-200" : "bg-red-200")))}>
						<div className="flex items-center ps-3">
							<input readOnly id={"v" + key} type="checkbox" checked={currQuestion.currAnswer == key}
								className={"w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded " + (!currQuestion.currAnswer && "cursor-pointer ")} />
							<label htmlFor={"v" + key} className={"w-full py-3 ms-2 text-md font-medium text-gray-900 " + (!currQuestion.currAnswer && "cursor-pointer ")}>{value}</label>
						</div>
					</li>)}
			</ul>
			<button disabled={!currQuestion.currAnswer} type="button" onClick={nextClicked}
				className={"text-white  focus:ring-4 focus:outline-none  font-medium rounded-lg text-sm  px-5 py-2.5 text-center " +
					(!currQuestion.currAnswer ? "bg-gray-300 " : "bg-blue-700  hover:bg-blue-800 focus:ring-blue-300 ")}>Продолжить</button>
		</div>
	</div>;
}