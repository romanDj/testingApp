import { createEvent, createStore, sample, createEffect, split, combine } from 'effector';

//#region Константы

export const PAGE_START = "PAGE_START";
export const PAGE_QUESTION = "PAGE_QUESTION";
export const PAGE_RESULT = "PAGE_RESULT";

//#endregion

//#region Cобытия

export const appStarted = createEvent();			// Приложение запущено
export const testStarted = createEvent();			// тест запущен
export const testFinished = createEvent();			// тест завершен
export const interruptedAttemptLoad = createEvent(); // загрузка прерванного тестирования
export const usuallyLoad = createEvent();			// обычный запуск приложения

export const startFormSubmitted = createEvent();	// Отправка начальной формы
export const answerSelected = createEvent();		// Выбор варианта ответа
export const nextClicked = createEvent();			// Кнопка "Продолжить"
export const nextClickConfirmed = createEvent();	// если вопрос не последний
export const againClicked = createEvent(); 			// Кнопка "Пройти еще раз"

//#endregion 

//#region Cторы

export const $test = createStore(null); 		// исходные данные теста
export const $page = createStore(null); 		// состояние, какой компонент сейчас показываем
export const $questions = createStore([]);  	// список вопросов
export const $testAttempt = createStore(null);	// данные текущего прохождения
export const $resultsHistory = createStore(null); // история прохождений 
export const $currQuestion = $testAttempt.map(testAttempt => testAttempt && testAttempt.questions[testAttempt.currQuestion]);	// текущий вопрос
export const $result = $testAttempt.map(testAttempt => testAttempt && ({
	points: testAttempt.result,
	percent: testAttempt.result / (testAttempt.questions.length / 100)
}));  // результат прохождения

//#endregion

//#region Cайд эффекты

//запрашиваем данные для теста
export const fetchTestFx = createEffect(() =>
	fetch("./test.json").then((req) => req.json())
);

// сохраняем данные текущего прохождения
export const saveTestAttemptFx = createEffect((data) => {
	localStorage.setItem("testAttempt", JSON.stringify(data, null, 2));
});
export const removeTestAttemptFx = createEffect((data) => {
	localStorage.removeItem("testAttempt");
});
// загружаем данные прохождения
export const loadTestAttemptFx = createEffect(() => {
	return JSON.parse(localStorage.getItem("testAttempt"));
});

// сохраняем историю прохождений
export const saveTestHistoryFx = createEffect((data) => {
	localStorage.setItem("testHistory", JSON.stringify(data, null, 2));
});
// загружаем историю прохождений
export const loadTestHistoryFx = createEffect(() => {
	return JSON.parse(localStorage.getItem("testHistory"));
});

//#endregion


//поле имени пользователя
export const usernameField = createField({
	defaultValue: "",
	validate: {
		on: startFormSubmitted,
		fn(uname) {
			if (isEmpty(uname)) return 'Требуется заполнить имя.';
			return null;
		}
	},
	resetOn: againClicked
});

//#region Определяем взаимосвязи и логику

// загружаем данные теста
sample({
	clock: appStarted,
	target: fetchTestFx
});
$test.on(fetchTestFx.doneData, (_, test) => test); 

// пробуем загрузить данные прерванной попытки
sample({
	clock: appStarted,
	target: loadTestAttemptFx
});
//в зависимости от этого либо показываем вопрос, либо стартовую страницу
split({
	source: loadTestAttemptFx.doneData,
	match: {
		question: (payload) => !!payload
	},
	cases: {
		question: interruptedAttemptLoad,
		__: usuallyLoad
	}
});

// показываем стартовую страницу
$page.on(usuallyLoad, () => PAGE_START);  

//показываем прерванный тест
sample({
	clock: interruptedAttemptLoad,
	target: $testAttempt
});
$page.on(interruptedAttemptLoad, () => PAGE_QUESTION);  


//если ошибок в форме нет, то запускаем тест
sample({
	clock: startFormSubmitted,
	source: usernameField.$error,
	filter: (uerror) => uerror === null,
	target: testStarted
});

//готовим вопросы
sample({
	clock: testStarted,
	source: $test,
	fn: (testData) => questionsPrepare(testData),
	target: $questions
});

//создаем данные текущей попытки
sample({
	clock: testStarted,
	source: [usernameField.$value, $questions],
	fn: ([username, questions]) => createTestAttempt(username, questions),
	target: $testAttempt
});

//переключаем на страницу с вопросами
$page.on(testStarted, () => PAGE_QUESTION);

//выбираем ответ
$testAttempt.on(answerSelected, (store, payload) =>
({
	...store,
	questions: store.questions.map(q => {
		if (q.index == store.currQuestion) {
			return { ...q, currAnswer: payload };
		}
		return q;
	})
}));

// проверяем можно ли перейти к следующему вопросу
split({
	clock: nextClicked,
	source: $testAttempt,
	match: {
		next: (testAttempt) => testAttempt.questions.length > testAttempt.currQuestion + 1
	},
	cases: {
		next: nextClickConfirmed, // листаем дальше
		__: testFinished          // завершаем тест
	}
});

//выбор следующего вопроса
$testAttempt.on(nextClickConfirmed, (testAttempt) => ({ ...testAttempt, currQuestion: testAttempt.currQuestion + 1 }));

//считаем результаты теста (1 вопрос по 1 баллу) и время завершения
$testAttempt.on(testFinished, (testAttempt) => ({
	...testAttempt,
	result: testAttempt.questions.filter(q => q.currAnswer == q.item.answer).length,
	datetimeFinish: new Date(Date.now()).toLocaleString('ru-ru')
}));

//переключаем на страницу результатов
$page.on(testFinished, () => PAGE_RESULT);

//загружаем историю
sample({
	clock: testFinished,
	target: loadTestHistoryFx
});
sample({
	clock: loadTestHistoryFx.doneData,
	target: $resultsHistory
});

//сохраняем текущее прохождение в истории
sample({
	clock: loadTestHistoryFx.doneData,
	source: $testAttempt,
	fn: (testAttempt, oldTestAttempts) => ( !!oldTestAttempts ? [...oldTestAttempts, testAttempt] : [testAttempt]),
	target: saveTestHistoryFx
});

//сохраняем текущее состояние теста на случай перезагрузки 
sample({
	clock: [testStarted, answerSelected, nextClickConfirmed],
	source: $testAttempt,
	target: saveTestAttemptFx
});
//при завершении удаляем
sample({
	clock: testFinished,
	target: removeTestAttemptFx
});


//если хотим пройти еще раз
$page.on(againClicked, () => PAGE_START);

//чистим данные
$questions.reset(againClicked);
$testAttempt.reset(againClicked);
$resultsHistory.reset(againClicked);

//#endregion

//#region Фабрики

//создание поля формы
function createField(options) {
	const $value = createStore(options.defaultValue);
	const $error = createStore(null);
	const changed = createEvent();

	$value.on(changed, (_, value) => value);

	//валидация
	if (options.validate) {
		sample({
			clock: options.validate.on,
			source: $value,
			fn: options.validate.fn,
			target: $error
		})
	}
	//сброс
	if (options.resetOn) {
		$value.reset(options.resetOn);
		$error.reset(options.resetOn);
	}
	return { $value, $error, changed };
}

//создаем данные для текущего прохождения
function createTestAttempt(username, questions) {
	return {
		username: username.trim(),															// имя пользователя
		questions: questions.map((q, idx) => ({ item: q, index: idx, currAnswer: null })),	// подготовленные вопросы, здесь же храним выбранный ответ
		currQuestion: 0,																	// текущий просматриваемый вопрос, по умолчанию первый
		result: null,																		// результат
		datetimeFinish: null																// дата и время завершения
	};
}


//#endregion

//#region Хелперы

//проверка на пустоту
function isEmpty(input) {
	return input.trim().length === 0;
}

// готовим вопросы
function questionsPrepare(test) {
	// рандомизация позиций у ответов
	return test.questions.map(q => {
		let newAnswer = 0;
		let opts = shuffle(Object.entries(q.options)).reduce((prev, curr, currIndex) => {
			if(curr[0] == q.answer){
				newAnswer = currIndex;
			}
			return {...prev, [currIndex] : curr[1]};			
		}, {});
		return {
			...q,
			answer: newAnswer,
			options: opts
		};
	});
}

//рандомизация массива
function shuffle(array) {
	const newArr = array;
	for (let i = array.length - 1; i > 0; i--) {
	  let j = Math.floor(Math.random() * (i + 1));
	  [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
	}
	return newArr;
}


//#endregion


