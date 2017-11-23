// This is a content script, it runs on starbase_trade.php and planet_trade.php.

// From other files:
var Overlay, Universe = Universe.fromDocument( document ), configured, userloc, time, psbCredits;

configure();
setup();

// End of script execution.

function configure() {
	var script;
	if ( !configured ) {
		window.addEventListener( 'message', onGameMessage );
		script = document.createElement( 'script' );
		script.type = 'text/javascript';
		script.textContent = "(function(){var fn=function(){window.postMessage({pardus_bookkeeper:1,loc:typeof(userloc)==='undefined'?null:userloc,time:typeof(milliTime)==='undefined'?null:milliTime,psbCredits:typeof(obj_credits)==='undefined'?null:obj_credits},window.location.origin);};if(typeof(addUserFunction)==='function')addUserFunction(fn);fn();})();";
		document.body.appendChild( script );
		configured = true;
	}
}

// Arrival of a message means the page contents were updated.  The
// message contains the value of our variables, too.
function onGameMessage( event ) {
	var data = event.data;

	if ( !data || data.pardus_bookkeeper != 1 ) {
		return;
	}

	userloc = parseInt( data.loc );
	time = Math.floor( parseInt( data.time ) / 1000 ); //Yes Vicky I wrote that.
	psbCredits = parseInt( data.psbCredits );
	trackPSB(); //Planet - SB, not player-owned Starbase ;-)
}

function setup() {
	var ukey, form, container, img, button;

	// Insert a BK button.  

	form = document.forms.planet_trade || document.forms.starbase_trade;

	container = document.createElement( 'div' );
	container.id = 'bookkeeper-ui';
	container.className = 'bookkeeper-starbasetrade';

	img = document.createElement( 'img' );
	img.title = 'Pardus Bookkeeper';
	img.src = chrome.extension.getURL( 'icons/16.png' );
	container.appendChild( img );

	button = document.createElement( 'button' );
	button.id = 'bookkeeper-overview-toggle';
	button.textContent = 'OPEN';
	container.appendChild( button );

	// Button injection take 3.  There's just no good spot to paste in, but
	// I really don't want it near the centre of the page where it can be
	// covered.  Add as previous sibling of the form.
	form.parentElement.style.position = 'relative';
	form.parentElement.insertBefore( container, form );

	ukey = document.location.hostname[0].toUpperCase();
	new Overlay(
		ukey, document, button,
		{ overlayClassName: 'bookkeeper-starbasetrade',
		  mode: 'compact',
		  storageKey: 'Nav' } );

	var XPATH_FREESPACE = document.createExpression('//table//td[starts-with(text(),"free")]/following-sibling::td', null );

	var middleNode = document.getElementById('quickButtonsTbl');

	if (document.forms.planet_trade) {
		var previewStatus = document.getElementById('preview_checkbox').checked;
		document.getElementById('preview_checkbox').addEventListener('click', function() { previewStatus = !previewStatus } );

		middleNode.appendChild( document.createElement( 'br' ));

		button = makeButton ( 'bookkeeper-transfer-food' )
		button.textContent = '<- Food | Energy ->';
		middleNode.appendChild ( button ) ;
		button.addEventListener('click', function() {
			if ( document.getElementById('shiprow2').getElementsByTagName('a')[1] ) {
				document.getElementById('shiprow2').getElementsByTagName('a')[1].click();
			}
			document.getElementById('baserow1').getElementsByTagName('a')[1].click();
			if (!previewStatus) {
				document.forms.planet_trade.submit();
			}
		});

		middleNode.appendChild( document.createElement( 'br' ));
		middleNode.appendChild( document.createElement( 'br' ));
		button = makeButton ( 'bookkeeper-transfer-water' )
		button.textContent = '<- Water | Energy ->';
		middleNode.appendChild ( button ) ;
		button.addEventListener('click', function() {
			if ( document.getElementById('shiprow2').getElementsByTagName('a')[1] ) {
				document.getElementById('shiprow2').getElementsByTagName('a')[1].click();
			}
			document.getElementById('baserow3').getElementsByTagName('a')[1].click();
			if (!previewStatus) {
				document.forms.planet_trade.submit();
			}
		});
		middleNode.appendChild( document.createElement( 'br' ));
		middleNode.appendChild( document.createElement( 'br' ));

		button = makeButton ( 'bookkeeper-transfer-FWE' )
		button.textContent = '<- PSB FW | Energy ->';
		middleNode.appendChild ( button ) ;
		button.addEventListener('click', function() {
			var shipCargo = parseInt( XPATH_FREESPACE.evaluate( document.body, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null ).iterateNext().textContent.split(/t/g)[0]);

			if (document.getElementById('shiprow2').getElementsByTagName('a')[1] ) {
				document.getElementById('shiprow2').getElementsByTagName('a')[1].click();
				shipCargo += parseInt( document.getElementById('sell_2').value );
			}
			var buyFood = Math.floor( shipCargo / 5 * 3);
			var buyWater = shipCargo - buyFood;

			document.getElementById('buy_1').value = buyFood;
			document.getElementById('buy_3').value = buyWater;
			if (!previewStatus) {
				document.forms.planet_trade.submit();
			}
		});
	}

	if (document.forms.starbase_trade) {
		var previewStatus = document.getElementById('preview_checkbox').checked;
		document.getElementById('preview_checkbox').addEventListener('click', function() { previewStatus = !previewStatus } );

		middleNode.appendChild( document.createElement( 'br' ));
		middleNode.appendChild( document.createElement( 'br' ));
		button = makeButton ( 'bookkeeper-transfer-SF' )
		button.textContent = '<- SF E/AE | Energy ->';
		middleNode.appendChild ( button ) ;

		button.addEventListener('click', function() {
			var shipCargo = parseInt( XPATH_FREESPACE.evaluate( document.body, XPathResult.UNORDERED_NODE_ITERATOR_TYPE, null ).iterateNext().textContent.split(/t/g)[0]);

			if (document.getElementById('shiprow1').getElementsByTagName('a')[1] ) {
				document.getElementById('shiprow1').getElementsByTagName('a')[1].click();
				shipCargo += parseInt( document.getElementById('sell_1').value );
			}
			if (document.getElementById('shiprow3').getElementsByTagName('a')[1] ) {
				document.getElementById('shiprow3').getElementsByTagName('a')[1].click();
				shipCargo += parseInt( document.getElementById('sell_3').value );
			}
			var buyEnergy = Math.floor( shipCargo / 9 * 4);
			var buyAE = shipCargo - buyEnergy;

			document.getElementById('buy_2').value = buyEnergy;
			document.getElementById('buy_4').value = buyAE;
			if (!previewStatus) {
				document.forms.starbase_trade.submit();
			}
		});
	}

}

function makeButton( id ) {
	button = document.createElement( 'button' );
	button.type = 'button';
	button.id = id;
	button.style = "width: 175px; height: 35px; margin-left: 3px; margin-right: 3px;";
	return button
}


function trackPSB() {
	chrome.storage.sync.get( [ Universe.key, Universe.key + userloc ], setTrackBtn.bind ( null, userloc) )
}

function setTrackBtn( userloc, data ) {
	console.log( data );
	var trackBtn = document.getElementById( 'bookkeeper-trackBtn' );
	if  ( !trackBtn ) {	
		var middleNode = document.getElementById('quickButtonsTbl');
		middleNode.appendChild( document.createElement( 'br' ));
		middleNode.appendChild( document.createElement( 'br' ));
		trackBtn = makeButton ( 'bookkeeper-trackBtn' );
		middleNode.appendChild( trackBtn );
	}
	
	var value; 
	
	if (Object.keys( data ).length === 0 || data[ Universe.key ].indexOf( userloc ) === -1) {
		value = 'Track';
	} else {
		value = 'Untrack';
		data[ Universe.key + userloc ] = parsePSBPage().toStorage();
		chrome.storage.sync.set( data );
	}

	trackBtn.textContent = value;
	trackBtn.addEventListener( 'click', function() { 
		chrome.storage.sync.get( [ Universe.key , Universe.key + userloc ], trackToggle.bind( trackBtn, userloc ) ); 
	});
}

function trackToggle( userloc, data ) {
	if (this.textContent === 'Track') {
		this.textContent = 'Untrack';
		
		if (Object.keys( data ).length === 0) {
			data[ Universe.key ] = [ userloc ];
		} else {
			data[ Universe.key ].push( userloc );
		}
		data[ Universe.key + userloc ] = parsePSBPage();
		chrome.storage.sync.set( data );
		
	} else {
		this.textContent = 'Track';
		PSBremoveStorage( userloc );
	}
}

 function PSBremoveStorage ( loc ) {
	var ukey = Universe.key;
	
	loc = parseInt( loc );
	if ( isNaN(loc) )
		return;

	chrome.storage.sync.get( ukey , removeBuildingListEntry );

	function removeBuildingListEntry( data ) {
		var list, index;

		list = data[ ukey ];
		index = list.indexOf( loc );
		if ( index === -1 ) {
			removeBuildingData();
		} else {
			list.splice( index, 1 );
			chrome.storage.sync.set( data, removeBuildingData );
		}
	}

	function removeBuildingData() {
		chrome.storage.sync.remove( ukey + loc );
	}
}

function parsePSBPage() {
	var i, commRow, amount = {}, bal = {}, min = {}, max = {}, price = [], buying = [], selling = [];
	
	var PSBclass = document.getElementsByTagName( 'h1' )[0].firstElementChild.src.split(/_/i)[1][0].toUpperCase();
	var sectorId = Sector.getIdFromLocation( userloc );
	
	if ( PSBclass === 'F' ) {
		typeId = Building.getTypeId( 'Faction Starbase' );
	} else if ( PSBclass === 'P' ) {
		typeId = Building.getTypeId( 'Player Starbase' );
	} else {
		typeId = Building.getTypeId( PSBclass + ' Class Planet' );
	}

	var building = new Building( userloc, sectorId, typeId );
	building.setTicksLeft( Infinity ); //will be updated below.

	for ( i = 1;  i < 33 ; i++ ) {
		commRow = document.getElementById( 'baserow' + i );
		if (!commRow) {
			buying[ i ] = 0; //XXX check if we need this
			continue;
		} else {
			commRow = commRow.getElementsByTagName( 'td' );
		}
		amount [ i ] = parseInt( commRow[ 2 ].textContent.replace(/,/g,"") );
		bal [ i ] = parseInt( commRow[ 3 ].textContent.replace(/,/g,"") );
		commRow.length === 8 ? min [ i ] = parseInt( commRow[ 4 ].textContent.replace(/,/g,"") ) : min[ i ] = Math.abs( bal[ i ] ); 
		max [ i ] = parseInt( commRow[ commRow.length - 3 ].textContent.replace(/,/g,"") );
		price[ i ] = parseInt( commRow[ commRow.length - 2 ].textContent.replace(/,/g,"") );
		
		buying[ i ] = max[ i ] - amount[ i ];
		selling[ i ] = amount[ i ] - min [ i ];
		
		if (Building.isUpkeep( typeId, i )) {
			if (Math.floor( amount[ i ] / -bal [ i ] ) <  building.getTicksLeft() ) {
				building.setTicksLeft( Math.floor( amount[ i ] / -bal [ i ] ) )
			}
		}
		
	} //I just realised we can get the above from the script section of the page too. Ah well.

	// allData[ 'amount' ] = amount; 
	// allData[ 'bal' ] = bal;
	// allData[ 'min' ] = min;
	// allData[ 'max' ] = max;
	// allData[ 'price' ] = price;
	// allData[ 'class' ] = document.getElementsByTagName( 'h1' )[0].firstElementChild.src.split(/_/i)[1][0];
	// allData[ 'pop' ] = popEst ( bal, allData[ 'class'] );
	// allData[ 'time' ] = time;
	// allData[ 'loc' ] = userloc; //It's also in the storage name, I know, but this way we can easily loop the keys later on.
	// allData[ 'credits' ] = psbCredits;
	// allData[ 'sectorId' ] = Sector.getIdFromLocation( userloc );

	building.setBuying( buying );
	building.setSelling( selling );
	// need proper functions for the stuff below
	building.buyAtPrices = price;
	building.credits = parseInt( psbCredits );
	building.psb = true;
	
	return building
}

function popEst( bal , classImg ) {
	var balComm = [], base;
	
	// Determine class & thus upkeep commodity type and upkeep. I take upkeep 
	// because production can be zero.
	classImg.indexOf( 'p' ) !== -1 ? balComm = [1,-3] : null;
	classImg.indexOf( 'f' ) !== -1 ? balComm = [1,-2.5] : null;
	classImg.indexOf( 'm' ) !== -1 ? balComm = [2,-7.5] : null;
	classImg.indexOf( 'a' ) !== -1 ? balComm = [2,-12.5] : null;
	classImg.indexOf( 'd' ) !== -1 ? balComm = [3,-2.5] : null;
	classImg.indexOf( 'i' ) !== -1 ? balComm = [2,-7.5] : null;
	classImg.indexOf( 'g' ) !== -1 ? balComm = [2,-2.5] : null;
	classImg.indexOf( 'r' ) !== -1 ? balComm = [2,-4] : null;
	return [Math.round( 1000 * bal [ balComm[0] ] / balComm[1] ), Math.ceil( -500 / balComm[1] ) ]
}