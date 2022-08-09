if (app.documents.length > 0) {
	smartifyAndGetSelectedLayersIdxEtc()
};

// get array of arrays of smart objects witrh index, center and half-dimensions //////
function smartifyAndGetSelectedLayersIdxEtc(){

	var selectedLayers = new Array;
	var ref = new ActionReference();
	ref.putEnumerated( charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
	var desc = executeActionGet(ref);
	if( desc.hasKey( stringIDToTypeID( 'targetLayers' ) ) ){
		desc = desc.getList( stringIDToTypeID( 'targetLayers' ));
		 var c = desc.count;
		 var selectedLayers = new Array();
		 for(var i=0;i<c;i++){
			try{
				activeDocument.backgroundLayer;
				selectedLayers.push(  desc.getReference( i ).getIndex() );
			}catch(e){
				selectedLayers.push(  desc.getReference( i ).getIndex()+1 );
			};
		 }
	} else {
		var ref = new ActionReference();
		ref.putProperty( charIDToTypeID("Prpr") , charIDToTypeID( "ItmI" ));
		ref.putEnumerated( charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt") );
		try{
			activeDocument.backgroundLayer;
			selectedLayers.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" ))-1);
		}catch(e){
			selectedLayers.push( executeActionGet(ref).getInteger(charIDToTypeID( "ItmI" )));
		};
	};


	var theArray = new Array;
	var theIDs = new Array;
	for (var m = 0; m < selectedLayers.length; m++) {
		var thisIndex = selectedLayers[m];
		var ref = new ActionReference();
		ref.putIndex( charIDToTypeID("Lyr "), thisIndex);
		var layerDesc = executeActionGet(ref);
		var thisID = layerDesc.getInteger(stringIDToTypeID("layerID"));
		var theKind = layerDesc.getInteger(stringIDToTypeID("layerKind"));
		var theName = layerDesc.getString(stringIDToTypeID("name"));
		var theVisibility = layerDesc.getInteger(stringIDToTypeID("visible"));
		var isLayerLocked = isLocked(layerDesc);
		var theBounds = layerDesc.getObjectValue(stringIDToTypeID("bounds"));
		var halfWidth = theBounds.getUnitDoubleValue(stringIDToTypeID("width")) / 2;
		var halfHeight = theBounds.getUnitDoubleValue(stringIDToTypeID("height")) / 2;
		var theX = theBounds.getUnitDoubleValue(stringIDToTypeID("left")) + halfWidth;
		var theY = theBounds.getUnitDoubleValue(stringIDToTypeID("top")) + halfHeight;
		// is normal, shape, smart object, pattern, gradiet, solid color, group;
		if (theKind == 1 || theKind == 4 || theKind == 5 || theKind == 9 || theKind == 10 || theKind == 11 || theKind == 7) {
			if (theVisibility == true && isLayerLocked == false) {
				theIDs.push ([thisID, theX, theY, halfWidth, halfHeight, theName])
			}
		}
	};


	for (var n = 0; n < theIDs.length; n++) {
		if (hasSmartObject(theIDs[n][0]) == false) {
			try {
				selectLayerByID(theIDs[n][0], false);
				var id557 = charIDToTypeID( "slct" );
				var desc108 = new ActionDescriptor();
				var id558 = charIDToTypeID( "null" );
				var ref77 = new ActionReference();
				var id559 = charIDToTypeID( "Mn  " );
				var id560 = charIDToTypeID( "MnIt" );
				var id561 = stringIDToTypeID( "newPlacedLayer" );
				ref77.putEnumerated( id559, id560, id561 );
				desc108.putReference( id558, ref77 );
				executeAction( id557, desc108, DialogModes.NO );
				theArray.push([getLayerId(app.activeDocument.activeLayer), theIDs[n][1], theIDs[n][2], theIDs[n][3], theIDs[n][4], theIDs[n][5]]);
				} catch (e) {}
			}
		else {
			theArray.push(theIDs[n])
		};
	};

	// select;
	if (theArray.length > 0) {
		selectLayerByID(theArray[0][0],false);
		for (var a = 1; a < theArray.length; a++) {selectLayerByID(theArray[a][0], true)};

		return theArray
	}

	// Nothing valid selected
	return
};

function isLocked(layerDesc){
	var layerLocking = layerDesc.getObjectValue(stringIDToTypeID("layerLocking"));
	var protectAll = layerLocking.getBoolean(stringIDToTypeID("protectAll"));
	var protectComposite = layerLocking.getBoolean(stringIDToTypeID("protectComposite"));
	var protectPosition = layerLocking.getBoolean(stringIDToTypeID("protectPosition"));
	var protectTransparency = layerLocking.getBoolean(stringIDToTypeID("protectTransparency"));
	return protectAll || protectComposite || protectPosition || protectTransparency
}

// by mike hale, via paul riggott;
function getLayerId(theLayer){
	// http://forums.adobe.com/message/1944754#1944754
	app.activeDocument.activeLayer = theLayer;
	//Assumes activeDocument and activeLayer
	var ref = new ActionReference();
	ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));
	d = executeActionGet(ref);
	return d.getInteger(charIDToTypeID('LyrI'));
};

function hasSmartObject(idx){
	var ref = new ActionReference();
	ref.putProperty( charIDToTypeID("Prpr") , stringIDToTypeID( "smartObject" ));
	//ref.putIndex( charIDToTypeID( "Lyr " ), idx);
	ref.putIdentifier( charIDToTypeID( "Lyr " ), idx);
	var desc = executeActionGet(ref);
	if(desc.hasKey(stringIDToTypeID('smartObject'))) {return true}
	else {return false};
};


function selectLayerByID(index, add){
	add = undefined ? add = false:add
	var ref = new ActionReference();
	ref.putIdentifier(charIDToTypeID("Lyr "), index);
	var desc = new ActionDescriptor();
	desc.putReference(charIDToTypeID("null"), ref );
	if(add) {
	   desc.putEnumerated( stringIDToTypeID( "selectionModifier" ), stringIDToTypeID( "selectionModifierType" ), stringIDToTypeID( "addToSelection" ) )
	};
	desc.putBoolean( charIDToTypeID( "MkVs" ), false );
	try {
	   executeAction(charIDToTypeID("slct"), desc, DialogModes.NO );
	}catch(e){
	   alert(e.message);
	}
};