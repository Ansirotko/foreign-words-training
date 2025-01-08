const words = [
    { foreign: "car", translation: "машина", example: "They bought a new car last week." },
    { foreign: "house", translation: "дом", example: "Their house is very big." },
    { foreign: "school", translation: "школа", example: "I go to school every day." },
    { foreign: "family", translation: "семья", example: "My family is very important to me." },
    { foreign: "music", translation: "музыка", example: "I love listening to music." },
];

const cards = document.querySelector('.flip-card');
const currentWord = document.querySelector('#current-word');
const traineProgress = document.querySelector('#words-progress');
const examProgress = document.querySelector('#exam-progress');
const examCorrect = document.querySelector('#correct-percent');
let currentIndex = 0;
let examMode = false;
let timer;
let totalSeconds = 0;
let correctAnswers = 0;
let wrongAnswers = 0;


words.forEach(word => {
    word.attempts = 0;
    word.correct = 0;
});

function makeCard() {
    const word = words[currentIndex];
    document.querySelector('#card-front h1').textContent = word.foreign;
    document.querySelector('#card-back h1').textContent = word.translation;
    document.querySelector('#card-back p span').textContent = word.example;
    currentWord.textContent = currentIndex + 1;
    updateProgress();
}

function updateProgress() {
    const progressPercentage = Math.floor(((currentIndex + 1) / words.length) * 100);
    traineProgress.value = progressPercentage;
}

cards.addEventListener('click', () => {
    cards.classList.toggle('active');
});

document.querySelector('#next').addEventListener('click', () => {
    if (currentIndex < words.length - 1) {
        currentIndex++;
        makeCard();
    }
});

document.querySelector('#back').addEventListener('click', () => {
    if (currentIndex > 0) {
        currentIndex--;
        makeCard();
    }
});

document.querySelector('#shuffle-words').addEventListener('click', () => {
    getRandomWord(words);
    currentIndex = 0;
    makeCard();
});

function getRandomWord(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

makeCard();

document.querySelector('#exam').addEventListener('click', () => {
    examMode = true;
    document.querySelector('#study-mode').classList.add('hidden');
    document.querySelector('#exam-mode').classList.remove('hidden');
    correctAnswers = 0;
    wrongAnswers = 0;
    updateExamProgress();
    startTimer();
    createExamCards();
});

function startTimer() {
    timer = setInterval(() => {
        totalSeconds++;
        document.querySelector('#time').textContent = formatTime(totalSeconds);
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingseconds = seconds % 60;
    return `${minutes <10 ? '0' + minutes : minutes}:${remainingseconds <10 ? '0' + remainingseconds : remainingseconds}`;
}

function renderCard(text) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.textContent = text;
    return card;
}

function createExamCards() {
    const mixWords = [...words].sort(() => Math.random() - 0.5);
    const examCardsContainer = document.querySelector('#exam-cards');
    examCardsContainer.innerHTML = '';

    const fragment = document.createDocumentFragment();
    let firstCard = null;

    mixWords.forEach(word => {
        const foreignCard = renderCard(word.foreign);
        const translationCard = renderCard(word.translation);

        const cardClickHandler = (card) => {
            word.attempts++;

            if (!firstCard) {
                firstCard = card;
                firstCard.classList.add('correct');
            } else if (card !== firstCard) {
                if ((firstCard.textContent === word.foreign && card.textContent === word.translation) ||
                    (card.textContent === word.foreign && firstCard.textContent === word.translation)) {
                    correctAnswers++;
                    word.correct++;

                    updateExamProgress();
                    firstCard.classList.add('fade-out');
                    card.classList.add('fade-out', 'correct');

                    setTimeout(() => {
                        firstCard.remove();
                        card.remove();
                        firstCard = null;

                    }, 300);
                } else {
                    wrongAnswers++;
                    card.classList.add('wrong');
                    setTimeout(() => {
                        card.classList.remove('wrong');
                        firstCard.classList.remove('correct');
                        firstCard = null;
                    }, 500);
                }
            }
        };

        foreignCard.addEventListener('click', () => cardClickHandler(foreignCard));
        translationCard.addEventListener('click', () => cardClickHandler(translationCard));

        fragment.appendChild(foreignCard);
        fragment.appendChild(translationCard);
    });

    examCardsContainer.appendChild(fragment);

}

function updateExamProgress() {
    const percent = (correctAnswers / words.length) * 100;
    examProgress.value = percent;
    examCorrect.textContent = `${Math.round(percent)}%`;

}

function showResults() {
    examMode = false;
    clearInterval(timer);
    resultModal.classList.remove('hidden');
    const resultModal = document.querySelector('.results-modal');
    const template = document.querySelector('#word-stats');
    const resultContainer = resultModal.querySelector('.results-content');

    resultContainer.innerHTML = '';

    words.forEach(word => {
        const clone = template.content.cloneNode(true);
        clone.querySelector('.word span').textContent = word.foreign;
        clone.querySelector('.attempts span').textContent = word.attempts;

        resultContainer.appendChild(clone);
    });


}