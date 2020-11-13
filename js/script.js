window.addEventListener('DOMContentLoaded', (event) => {
	init();
});

let starter, player0, player1, whoseTurn, fighters, clock = 2000, turnsSet = false;
let logs = document.querySelector('#logs');

// a promise used for delay
const timer = ms => new Promise(res => setTimeout(res, ms))


async function init() {


	// speed clock
	let slider = document.querySelector('#clock');
	let clockValue = document.querySelector('#clockValue');
	clockValue.innerText = slider.value;
	slider.addEventListener('change', (e) => {
		console.log(slider.value);
		clock = clock / slider.value
		clockValue.innerText = slider.value;
	})

	// fetching data from json
	let data = await fetch('data/fighters.json')
		.then(response => response.json())
		.catch(err => {
			alert(err)
		});

	// setting all fighters
	let allFighters = data.fighters;

	// both select list divs
	let selects = document.querySelectorAll('.list');
	let submit = document.querySelector('#submit button');
	allFighters.forEach(fighter => {
		let content = `<div class="character" data-code="${fighter.code}">
							<img src="img/img.png" alt="${fighter.name}">
							<p>${fighter.name}</p>
						</div>`;
		selects.forEach(select => {
			select.innerHTML += content;
		})
	})


	let fighter0code = -1,
		fighter1code = -1;

	// click eventlistner for particular character divs in 1st list
	let list0characters = selects[0].querySelectorAll('div');
	list0characters.forEach(list0Char => {
		list0Char.addEventListener('click', (e) => {
			fighter0code = list0Char.dataset.code;
			list0characters.forEach(element => {
				element.classList.remove('selected')
			})
			list0Char.classList.add('selected')
		})
	});

	// click eventlistner for particular character divs in 2nd list
	let list1characters = selects[1].querySelectorAll('div');
	list1characters.forEach(list1Char => {
		list1Char.addEventListener('click', (e) => {
			fighter1code = list1Char.dataset.code;
			list1characters.forEach(element => {
				element.classList.remove('selected');
			})
			list1Char.classList.add('selected')
		})
	});

	submit.addEventListener('click', (e) => {
		if (fighter0code == -1 || fighter1code == -1) {
			console.log('please select 2 fighters');
		} else {

			logs.innerHTML = '';

			// getting selected fighters from the json data 
			let fighter0 = allFighters.filter(fighter => {
				return fighter.code == fighter0code;
			})
			let fighter1 = allFighters.filter(fighter => {
				return fighter.code == fighter1code;
			})

			player0 = new Fighter(fighter0[0]);
			player1 = new Fighter(fighter1[0]);
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