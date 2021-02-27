window.addEventListener('DOMContentLoaded', (event) => {
	init();
});

// Initialize Firebase
var firebaseConfig = {
	apiKey: "AIzaSyBa4bXMvkUtbHiYEubr5StWzXKHxxWjZ5M",
	authDomain: "crunchy-sim.firebaseapp.com",
	databaseURL: "https://crunchy-sim.firebaseio.com",
	projectId: "crunchy-sim",
	storageBucket: "crunchy-sim.appspot.com",
	messagingSenderId: "295858081829",
	appId: "1:295858081829:web:4adff1a02b1408c9e52fcc",
	measurementId: "G-0DSW1GHFDC"
};
firebase.initializeApp(firebaseConfig);
let ref = firebase.database().ref('/');



let select0 = document.querySelector('#select0');
let select1 = document.querySelector('#select1');
let submit = document.querySelector('#submit button');
let player0NameHtml = document.querySelector('#player1Name')
let player1NameHtml = document.querySelector('#player2Name')
let logs = document.querySelector('#logs');

let player0, player1, fighter0, fighter1;

let starter, whoseTurn, fighters, clock = 2000,
	turnsSet = false;

// speed clock
let slider = document.querySelector('#clock');
let clockValue = document.querySelector('#clockValue');
clockValue.innerText = slider.value;
slider.addEventListener('change', (e) => {
	console.log(slider.value);
	clock = clock / slider.value
	clockValue.innerText = slider.value;
});

// a promise used for delay
const timer = ms => new Promise(res => setTimeout(res, ms))



ref.once('value', (snapshot) => {
	let allData;
	allData = snapshot.val();

	for (const franchises in allData) {
		// getting the franchise names
		let franchiseLi = document.createElement('li');
		franchiseLi.classList.add('oneFranchise');
		let franchiseA = document.createElement('a'); //creating the franchise anchor
		franchiseA.href = "#";
		franchiseA.innerText = franchises; //setting the anchor text
		franchiseLi.appendChild(franchiseA);

		let characterUl = document.createElement('ul'); //creating the character UL
		franchiseLi.appendChild(characterUl);
		characterUl.classList.add('vertical', 'nested', 'menu');

		let characters = allData[franchises];
		for (const chars in characters) {
			// getting the character names
			let characterLi = document.createElement('li');
			characterLi.classList.add('oneCharacter');
			characterUl.appendChild(characterLi);

			let characterA = document.createElement('a'); //creating the character anchor
			characterA.href = "#";
			characterA.innerText = chars;
			characterLi.appendChild(characterA);

			let formUl = document.createElement('ul');
			formUl.classList.add('vertical', 'nested', 'menu');
			characterLi.appendChild(formUl);

			let forms = characters[chars];
			for (const frms in forms) {
				let oneFormContent = `<li class="oneForm" data-franchise="${franchises}" data-character="${chars}" data-form="${frms}">
																<a href="#">${frms}</a>
															</li>`
				formUl.innerHTML += oneFormContent;
			}
		}

		select0.appendChild(franchiseLi);
	}

	select1.innerHTML = select0.innerHTML;


	let p0Forms = document.querySelectorAll('#select0 .oneForm');
	let p1Forms = document.querySelectorAll('#select1 .oneForm');

	p0Forms.forEach(form => {
		form.addEventListener('click', (e) => {
			let player0ref = firebase.database().ref(form.dataset.franchise + '/' + form.dataset.character + '/' + form.dataset.form);

			player0ref.once('value', (player0data) => {
				fighter0 = player0data.val();
				fighter0.name = `${form.dataset.character}(${form.dataset.form})`;
				console.log('player 1:' + fighter0.name);
				player0NameHtml.innerText = fighter0.name
			})
		})
	});

	p1Forms.forEach(form => {
		form.addEventListener('click', (e) => {
			let player1ref = firebase.database().ref(form.dataset.franchise + '/' + form.dataset.character + '/' + form.dataset.form);

			player1ref.once('value', (player1data) => {
				fighter1 = player1data.val();
				fighter1.name = `${form.dataset.character}(${form.dataset.form})`;
				console.log('player 2:' + fighter1.name);
				player1NameHtml.innerText = fighter1.name
			})
		})
	});

	$(document).foundation(); // getting the foundation at the last so it can run on dynamically created HTML elements
});




async function init() {

	submit.addEventListener('click', (e) => {
		if (!fighter0 || !fighter1) {
			console.log('please select 2 fighters');
		} else {

			logs.innerHTML = '';

			player0 = new Fighter(fighter0);
			player1 = new Fighter(fighter1);
			fighters = [player0, player1]


			/* ******* starting the fight sequence ********* */
			fight(player0, player1);
		}
	})

}

async function fight(player0, player1) {

	// setting the starter based on the speed stat
	if (player0.speed > player1.speed) {
		starter = 0;
	} else if (player0.speed < player1.speed) {
		starter = 1;
	} else {
		// if the speed stats are the same, randomly choosing the starter
		starter = (Math.ceil(Math.random() * 2) === 1) ? 0 : 1
	}

	// setting turns if not set
	if (!turnsSet) {
		await setTurns();
		turnsSet = true;
	}


	do {

		// turn player determining damage 
		let move = fighters[whoseTurn].doDamage();
		let movePower = move.power;
		let moveName = move.name;

		// determining the defense move for out of turn player
		let defenseTaken = fighters[1 - whoseTurn].defend();
		let defensePower = defenseTaken.power;
		let defenseName = defenseTaken.name;


		console.log('\n');
		console.log(moveName, movePower);
		console.log(defenseName, defensePower);

		// no defense
		if (defensePower <= 0) {
			fighters[1 - whoseTurn].health -= movePower
			console.log(`${fighters[1 - whoseTurn].name} damaged by ${moveName} and now at ${fighters[1 - whoseTurn].health} \n`);

			logs.innerHTML += `<p>${fighters[1 - whoseTurn].name} damaged by ${moveName} and now at ${fighters[1 - whoseTurn].health} \n</p>`
		} else {
			// simple defense
			if (defensePower < movePower) {
				fighters[1 - whoseTurn].health -= (movePower - defensePower)
				console.log(`${fighters[1 - whoseTurn].name} reduced ${moveName} by ${defensePower} with ${defenseName} and now at ${fighters[1 - whoseTurn].health} \n`);

				logs.innerHTML += `<p>${fighters[1 - whoseTurn].name} reduced ${moveName} by ${defensePower} with ${defenseName} and now at ${fighters[1 - whoseTurn].health} \n</p>`;
			}
			// counter
			else {
				fighters[whoseTurn].health -= defensePower;
				console.log(`${fighters[1 - whoseTurn].name} countered ${moveName} with ${defenseName} and did ${defensePower} damage`);

				logs.innerHTML += `<p>${fighters[1 - whoseTurn].name} countered ${moveName} with ${defenseName} and did ${defensePower} damage</p>`;
			}
		}

		// changing turns
		whoseTurn = 1 - whoseTurn;

		// sending the death and winner message
		if (player0.health <= 0) {
			console.log(`${player0.name} died. The winner is ${player1.name}`);
			logs.innerHTML += `<p>${player0.name} died. The winner is ${player1.name}</p>`
		}
		if (player1.health <= 0) {
			console.log(`${player1.name} died. The winner is ${player0.name}`);

			logs.innerHTML += `<p>${player1.name} died. The winner is ${player0.name}</p>`
		}

		// delay for the next turn
		await timer(clock);
	} while (player0.health > 0 && player1.health > 0);
}

function setTurns() {
	return new Promise((resolve, reject) => {
		if (starter == 0) {
			whoseTurn = 0;
		} else {
			whoseTurn = 1;
		}
		resolve()
	})
}


class Fighter {
	constructor(fighter) {
		this.name = fighter.name;
		this.code = fighter.code;
		this.health = fighter.health;
		this.speed = fighter.speed;
		this.accuracy = fighter.accuracy;
		this.ospecial = fighter.ospecial;
		this.dspecial = fighter.dspecial;
		this.isAlive = true;

		this.damageTotalChance = 1;
		this.ospecial.forEach(move => {
			this.damageTotalChance += move.chance;
		});

		this.defenseTotalChance = 1;
		this.dspecial.forEach(move => {
			this.defenseTotalChance += move.chance;
		});
	}

	doDamage() {
		const threshold = Math.floor(Math.random() * this.damageTotalChance);
		let totalChance = 0;

		for (let i = 0; i < this.ospecial.length; ++i) {
			// Add the weight to our running total.
			totalChance += this.ospecial[i].chance;

			// If this value falls within the threshold, the move will be selected
			if (totalChance >= threshold) {
				return this.ospecial[i];
			}
		}
	}

	defend() {
		const threshold = Math.floor(Math.random() * this.defenseTotalChance);
		let totalChance = 0;

		for (let i = 0; i < this.dspecial.length; ++i) {
			// Add the weight to our running total.
			totalChance += this.dspecial[i].chance;

			// If this value falls within the threshold, the move will be selected
			if (totalChance >= threshold) {
				return this.dspecial[i];
			}
		}
	}
}