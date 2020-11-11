window.addEventListener('DOMContentLoaded', (event) => {
	init();
});

let starter, player0, player1, whoseTurn, fighters;
let clock = 2000;
let turnsSet = false;

// a promise used for delay
const timer = ms => new Promise(res => setTimeout(res, ms))


async function init() {

	let slider = document.querySelector('#clock');
	slider.addEventListener('change', (e) => {
		console.log(slider.value);
		clock = clock / slider.value
	})

	// fetching data from json
	let data = await fetch('fighters.json')
		.then(response => response.json())
		.catch(err => {
			console.log(err);
		});

	// setting all fighters
	let allFighters = data.fighters;

	// both HTML select elements
	let fighterSelects = document.querySelectorAll('select');

	// pushing options into both HTML selects 
	allFighters.forEach(fighter => {
		let option = `<option value="${fighter.code}">${fighter.name}</option>`;
		fighterSelects.forEach(fighterSelect => {
			fighterSelect.innerHTML += option;
		})
	});


	let fighter0code, fighter1code;
	let form = document.querySelector('form')
	form.addEventListener('submit', (e) => {
		turnsSet = false;
		e.preventDefault();
		let select0 = document.querySelector("#fighter1");
		let select1 = document.querySelector("#fighter2");
		fighter0code = select0.value;
		fighter1code = select1.value;

		if (fighter0code == -1 || fighter1code == -1) {
			console.log('please select 2 fighters');
		} else {
			// getting selected fighters from the json data 
			let fighter0 = allFighters.filter(fighter => {
				return fighter.code == fighter0code;
			})
			let fighter1 = allFighters.filter(fighter => {
				return fighter.code == fighter1code;
			})

			// initiating the fight sequence
			// let fight = new Fight(fighter0[0], fighter1[0]);

			player0 = new Fighter(fighter0[0]);
			player1 = new Fighter(fighter1[0]);

			fighters = [player0, player1]

			fighttt(player0, player1);
		}
	})
}

async function fighttt(player0, player1) {

	// setting the starter based on the speed stat
	if (player0.speed > player1.speed) {
		starter = 0;
	} else if (player0.speed < player1.speed) {
		starter = 1;
	} else {
		// if the speed stats are the same, randomly choosing the starter
		starter = (Math.ceil(Math.random() * 2) === 1) ? 0 : 1
	}

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
		} else {
			// simple defense
			if (defensePower < movePower) { 
				fighters[1 - whoseTurn].health -= (movePower - defensePower)
				console.log(`${fighters[1 - whoseTurn].name} reduced ${moveName} by ${defensePower} with ${defenseName} and now at ${fighters[1 - whoseTurn].health} \n`);
			} 
			// counter
			else{ 
				fighters[whoseTurn].health -= defensePower;
				console.log(`${fighters[1 - whoseTurn].name} countered ${moveName} with ${defenseName} and did ${defensePower} damage`);
			}
		}

		// changing turns
		whoseTurn = 1 - whoseTurn;

		// delay for the next turn
		await timer(clock);
	} while (player0.health > 0 && player1.health > 0);

	if(player0.health <= 0){
		console.log(`${player0.name} died. The winner is ${player1.name}`);
	} 
	if (player1.health <= 0) {
		console.log(`${player1.name} died. The winner is ${player0.name}`);
	}

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

			// If this value falls within the threshold, we're done!
			if (totalChance >= threshold) {
				return this.ospecial[i];
			}
		}
	}

	defend() {
		// getting the total of weights of all moves
		/* let totalChance = 1;
		this.dspecial.forEach(move => {
			totalChance += move.chance;
		}); */

		const threshold = Math.floor(Math.random() * this.defenseTotalChance);

		let totalChance = 0;

		for (let i = 0; i < this.dspecial.length; ++i) {
			// Add the weight to our running total.
			totalChance += this.dspecial[i].chance;

			// If this value falls within the threshold, we're done!
			if (totalChance >= threshold) {
				return this.dspecial[i];
			}
		}
	}
}
