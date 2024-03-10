import { useUnit } from 'effector-react';
import { $test, usernameField, startFormSubmitted } from '~/shared/config/init';


// начальная форма при старте
export function Startform() {
	const [test, username, usernameError] = useUnit([$test, usernameField.$value, usernameField.$error]);

	const onFormSubmit = (e) => {
		e.preventDefault();
		startFormSubmitted();
	};

	//на случай если данных пока нет
	if (!test)
		return <div className="flex flex-col h-screen justify-center items-center">
			<p className="font-bold text-white">Загрузка...</p>
		</div>


	//если данные есть
	return <div className="flex flex-col h-screen justify-center items-center">
		<div className="shadow-md my-4 bg-white rounded p-5 max-w-lg mx-auto w-full">
			<h1 className="text-2xl mb-4">
				Название теста: <b>{test.name}</b>
			</h1>
			<form className="mx-auto w-full" onSubmit={onFormSubmit}>
				<div className="mb-5">
					<label htmlFor="username" className="block mb-4 text-sm font-medium text-gray-900">Ваше имя:</label>
					<input type="text" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
						placeholder="Майкл" required
						value={username}
						onChange={(event) => usernameField.changed(event.target.value)} />
				</div>
				{usernameError && <p className="mb-4 text-red-500 text-sm">{usernameError}</p>}
				<button type="submit"
					className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm  w-full px-5 py-2.5 text-center">Запустить</button>
			</form>
		</div>
	</div>

}