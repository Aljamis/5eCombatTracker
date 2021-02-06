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
		var currentActorIndex = 0;  // Whose turn is it??
		var prevActor;
		var currentRoundIndex = 0;  // Which round of combat are we in?



function addToList() {
	//  Validation
	//  1 - Name is not empty
	//  2 - Initiative is a Number
	if (document.getElementById("addTarget").value =='') return;
	if (isNaN(document.getElementById("targetInit").value)) return;
	
	//  If an Actor has been added during combat this value will be populated
	//  otherwise it will be undefined.  It will be used later to determine turn-order
	var currentActor = combatants[currentActorIndex];
	
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
		actorAddedDuringCombat( currentActor );
	}
}



/*
 *  A new Actor has been added
 *  1)  Toggle the color of whose turn it is supposed to be.  
 *  2)  Store this index as currentActorIndex
 *
 *  3)  Clear out all the existing combat cells
 *  4)  Iterate through each round and Actor populating combat cells
 */
function actorAddedDuringCombat( myTurn ) {
	//  Clear out previous combat
	document.getElementById("combatTracking").innerHTML = "";
	
	
	var roundsThatHaveBeenPlayed = currentRoundIndex;
	// Populate all previous rows and cells with stored Actions
	//  Iterate ROUNDS
	for ( R=0 ; R<roundsThatHaveBeenPlayed ; R++ ) {
		currentRoundIndex = R;
		createCombatRound();
		//  Iterate through ACTORS
		for ( A=0 ; A<combatants.length ; A++ ) {
			currentActorIndex = A;
			document.getElementById("Round"+ currentRoundIndex).appendChild( createCombatCell() );
			
			populatePrevCell( R , A );
		}
	}
	
	//  Is a new Round required?
	if ( currentActorIndex +1 >= combatants.length ) {
		currentRoundIndex++;
		createCombatRound();
	}
	
	
	//  for each Combatant look for whose turn it is
	for ( var y=0 ; y<combatants.length ; y++ ) {
		currentActorIndex = y;
		if ( combatants[y].creatureName === myTurn.creatureName ) break;
		
		//  Empty cells until the Turn is identified
		document.getElementById("Round"+ currentRoundIndex).appendChild( createCombatCell() );
	}
	toggleNextPlayerColor();
	
	addCombatCellToRound();
}



function startCombat() {
	createCombatRound();
	addCombatCellToRound();
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

	var anActor = document.getElementById("Actor"+ currentActorIndex);
	anActor.style.backgroundColor = "rgb(23, 145, 66)";
	prevActor = "Actor"+ currentActorIndex;
}


/*
 * Create a new row for Combat
 */
function createCombatRound() {
	var roundTracker = document.getElementById("combatTracking");
	
	//  new Row added
	var newRound = document.createElement("div");
	newRound.id = "Round"+ currentRoundIndex;
	newRound.className = "round";
	
	roundTracker.appendChild( newRound );
}



/*
 *  Add a new cell to the current Round and include all the Action Inputs
 */
function addCombatCellToRound() {
	createActionInputCell( document.getElementById("Round"+ currentRoundIndex) );
	addActorsToDropDown();
}


function createActionInputCell( currentRow ) {
	var newTurn = createCombatCell();
	currentRow.appendChild( newTurn );
	
	newTurn.innerHTML = actionInputHTML();
}


/*
 *  Returns a new Cell
 */
function createCombatCell() {
	var newTurn = document.createElement("div");
	newTurn.innerHTML = "";
	newTurn.id = 'Round'+ currentRoundIndex +'-Actor'+  currentActorIndex;
	
	return newTurn;
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
		if (combatants[currentActorIndex].creatureName === combatants[i].creatureName ) {
			continue;
		}
		
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
	populatePrevCell( currentRoundIndex , prevActor );
	/*
	*/

	if (currentActorIndex++ === combatants.length -1) {
		currentActorIndex = 0;
	}
	
	if ( currentActorIndex === 0) {
		currentRoundIndex++;
		createCombatRound();
		addCombatCellToRound();
	}  else  {
		createActionInputCell( document.getElementById("Round"+ currentRoundIndex) ); 
		addActorsToDropDown();
	}
	
	toggleNextPlayerColor();
}



function populatePrevCell( theRound , theActor ) {
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
	if ( combatants[currentActorIndex].myActions[currentRoundIndex] === undefined ) {
		combatants[currentActorIndex].myActions[currentRoundIndex] =  myAction ;
	} else {
		if ( Array.isArray(combatants[currentActorIndex].myActions[currentRoundIndex] ) ) {
			
		} else {
			// Make the old action an array
			var prevAction = combatants[currentActorIndex].myActions[currentRoundIndex];
			combatants[currentActorIndex].myActions[currentRoundIndex] = [];
			combatants[currentActorIndex].myActions[currentRoundIndex].push( prevAction );
		}
		// push the newAction into the array
		combatants[currentActorIndex].myActions[currentRoundIndex].push( myAction );
	}
	
	populateHTMLWithNewAction( myAction );
}



function populateHTMLWithNewAction( myAction ) {
	var currentHTML = document.getElementById("Round"+ currentRoundIndex +'-Actor'+ currentActorIndex).innerHTML;
	currentHTML += createHTMLactionDIV( myAction );
	
	document.getElementById("Round"+ currentRoundIndex +'-Actor'+ currentActorIndex).innerHTML = '';
	document.getElementById("Round"+ currentRoundIndex +'-Actor'+ currentActorIndex).innerHTML = currentHTML;
}


function createHTMLactionDIV( myAction )  {
	var SEP = ' - ';
	var theString = '<div>'+ myAction.action + SEP + myAction.target + SEP + myAction.rollDC;
	if ( myAction.damage ) theString += SEP + myAction.damage;
	
	return theString +'</div>';
}