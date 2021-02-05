//  Objects
		function Combatant( name , init) {
			this.creatureName = name;
			this.initiative = init;
			
			this.myActions = [];
		}
		
		
		
		function ActorAction( actn , trg , roll , dmg ) {
			this.target = trg;
			this.action = actn;
			this.rollDC = roll;
			this.damage = dmg;
			
			this.toShortHand = function() {
				return this.action +' - '+ this.target +' - '+ this.rollDC +' - '+ this.damage;
			}
		}


//  Globals		
		var combatants = [];
		var currentActor = 0;  // Whose turn is it??
		var prevActor;
		var currentRound = 0;  // Which round of combat are we in?



function addToList() {
	//  Validation
	//  1 - Name is not empty
	//  2 - Initiative is a Number
	if (document.getElementById("addTarget").value =='') return;
	if (isNaN(document.getElementById("targetInit").value)) return;
	
	//  Create combatant and add combatant to array
	var x = new Combatant( document.getElementById("addTarget").value
	                    ,  Number(document.getElementById("targetInit").value )  );   
	combatants.push( x );
	
	// Sort the Combatants
	combatants.sort( function(a,b) {  
		return b.initiative - a.initiative;
	} ) ;
	
	//  Display in Initiative order
	var targetList = document.getElementById("targets");
	targetList.innerHTML = '';    //  Clear the current listing
	
	for (i=0 ; i<combatants.length ; i++ ) {
		var newTarget = document.createElement("div");
		newTarget.innerHTML = combatants[i].initiative +': '+ combatants[i].creatureName;
		newTarget.id = "Actor"+ i;
		targetList.appendChild(newTarget);
	}
	
	//  Clear input fields
	document.getElementById("addTarget").value = "";
	document.getElementById("addTarget").focus();
	document.getElementById("targetInit").value = "";
	
	if ( document.getElementById("combatTracking").hasChildNodes() ) {
		//  Combat has started
		actorAddedDuringCombat();
		addActorToDropDown( x );
	}
}



function actorAddedDuringCombat() {
	toggleNextPlayerColor();
	
	// Populate all previous rows and cells with stored Actions
	//  Iterate Actors
	for ( a=0 ; a<combatants.length ; a++ ) {
		
		//  Iterate through ROUNDS
		for ( r=0 ; r<combatants[a].myActions.length ; r++ ) {
			populatePrevCell( r , a );
		}
	}
}



function startCombat() {
	createCombatRound();
	toggleNextPlayerColor();
	
	document.getElementById( "startCombat" ).style.visibility = "hidden";
}




/*
 *  Change current player from RED to GREEN and previous Actor from GREEN to RED
 */
function toggleNextPlayerColor() {
	if (prevActor) {
		var resetActor = document.getElementById( prevActor );
		resetActor.style.backgroundColor = "rgb(235, 52, 52)";	
	}

	var anActor = document.getElementById("Actor"+ currentActor);
	anActor.style.backgroundColor = "rgb(23, 145, 66)";
	prevActor = "Actor"+ currentActor;
}


/*
 * Create a new row for Combat
 */
function createCombatRound() {
	var roundTracker = document.getElementById("combatTracking");
	
	//  new Row added
	var newRound = document.createElement("div");
	newRound.id = "Round"+ currentRound;
	newRound.className = "round";

	// Still need to add a cell
	createActionInputCell( newRound );
	
	roundTracker.appendChild( newRound );
	addActorsToDropDown();
}


function createActionInputCell( currentRow ) {
	var newTurn = document.createElement("div");
	newTurn.innerHTML = "";
	newTurn.id = 'Round'+ currentRound +'-Actor'+  currentActor;
	currentRow.appendChild( newTurn );
	
	newTurn.innerHTML = actionInputHTML();
}


function actionInputHTML() {
	var returnString = '<input type="text" id="action" name="action" size="13"  placeholder="Action" /><br />';
	returnString += '<select name="target" id="targetDropDown">  </select>';
	returnString += '<input type="text" id="rollDC" name="rollDC" size="7"  placeholder="Roll" />';
	returnString += '<input type="text" id="damageDone" name="damageDone" size="7"  placeholder="Damage" />';
	returnString += '<br/><br/>';
	returnString += '<button name="act" id="act" onclick="addAction()">Act</button>';
	returnString += '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
	returnString += '<a onclick="nextTurn()" style="text-align : right;">Next >>></a>';
	
	return returnString;
}


function addActorsToDropDown() {
	var targetDropdown = document.getElementById("targetDropDown");
	
	for (i=0 ; i<combatants.length ; i++ ) {
		//  Do not populate with the current Actor.  Avoids attacking yourself
		if (combatants[currentActor].creatureName === combatants[i].creatureName ) {
			continue;
		}
		
		/*
		var newOption = document.createElement("option");
		newOption.value = combatants[i].creatureName;
		newOption.text = combatants[i].creatureName;
		targetDropDown.add( newOption );
		*/
		addActorToDropDown( combatants[i] );
	}
	
	//  Add OTHER option
	var newOption = document.createElement("option");
	newOption.value = 'Other';
	newOption.text = 'Other';
	targetDropDown.add( newOption );
}

function addActorToDropDown( anActor ) {
	var newOption = document.createElement("option");
	newOption.value = anActor.creatureName;
	newOption.text = anActor.creatureName;
	document.getElementById("targetDropDown").add( newOption );
}


/*
 *  Current player turn is over.  
 */
function nextTurn() {
	//  Remove input from previous cells
	populatePrevCell( currentRound , prevActor );
	/*
	*/

	if (currentActor++ === combatants.length -1) {
		currentActor = 0;
	}
	
	if ( currentActor === 0) {
		currentRound++;
		createCombatRound();
	}  else  {
		createActionInputCell( document.getElementById("Round"+ currentRound) ); 
		addActorsToDropDown();
	}
	
	toggleNextPlayerColor();
}



function populatePrevCell( theRound , theActor ) {
	/*
	var currentRowCell = document.getElementById("Round"+ currentRound +'-'+ prevActor);
	currentRowCell.innerHTML = '';
	
	if ( combatants[currentActor].myActions[currentRound] === undefined ) {
		//  do nothing.  There are no actions to display.
	} else {
		if ( Array.isArray(combatants[currentActor].myActions[currentRound] ) ) {
			for ( y=0 ; y<combatants[currentActor].myActions[currentRound].length ; y++ ) {
				currentRowCell.innerHTML += createHTMLactionDIV( combatants[currentActor].myActions[currentRound][y] );
			}
		} else {
			currentRowCell.innerHTML += createHTMLactionDIV( combatants[currentActor].myActions[currentRound] );
		}
	}
	*/
	var elActor = theActor;
	if ( isNaN( theActor ) ) elActor = theActor.split('Actor')[1];
	
	var currentRowCell = document.getElementById("Round"+ theRound +'-Actor'+ elActor);
	currentRowCell.innerHTML = '';
	
	if ( combatants[elActor].myActions[theRound] === undefined ) {
		//  do nothing.  There are no actions to display.
	} else {
		if ( Array.isArray(combatants[elActor].myActions[theRound] ) ) {
			for ( y=0 ; y<combatants[elActor].myActions[theRound].length ; y++ ) {
				currentRowCell.innerHTML += createHTMLactionDIV( combatants[elActor].myActions[theRound][y] );
			}
		} else {
			currentRowCell.innerHTML += createHTMLactionDIV( combatants[elActor].myActions[theRound] );
		}
	}
}



/*
 *  Add Action to array of Actor/Combatant actions
 */
function addAction() {
	//  Create and populate an ActorAction object
	var myAction = new ActorAction( document.getElementById('action').value
				, document.getElementById('targetDropDown').value
				, document.getElementById('rollDC').value
				, document.getElementById('damageDone').value
				);
	
	//  Add the ActorAction to the currentRound and CurrentActor
	//  if one already exists make it into an array
	if ( combatants[currentActor].myActions[currentRound] === undefined ) {
		combatants[currentActor].myActions[currentRound] =  myAction ;
	} else {
		if ( Array.isArray(combatants[currentActor].myActions[currentRound] ) ) {
			
		} else {
			// Make the old action an array
			var prevAction = combatants[currentActor].myActions[currentRound];
			combatants[currentActor].myActions[currentRound] = [];
			combatants[currentActor].myActions[currentRound].push( prevAction );
		}
		// push the newAction into the array
		combatants[currentActor].myActions[currentRound].push( myAction );
	}
	
	populateHTMLWithNewAction( myAction );
}



function populateHTMLWithNewAction( myAction ) {
	var currentHTML = document.getElementById("Round"+ currentRound +'-Actor'+ currentActor).innerHTML;
	currentHTML += createHTMLactionDIV( myAction );
	
	document.getElementById("Round"+ currentRound +'-Actor'+ currentActor).innerHTML = '';
	document.getElementById("Round"+ currentRound +'-Actor'+ currentActor).innerHTML = currentHTML;
}


function createHTMLactionDIV( myAction )  {
	var SEP = ' - ';
	var theString = '<div>'+ myAction.action + SEP + myAction.target + SEP + myAction.rollDC;
	if ( myAction.damage ) theString += SEP + myAction.damage;
	
	return theString +'</div>';
}

function testMe() {
	alert("yup");
}