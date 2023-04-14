// WARNING!
// this code is bad and full of shit
// must be careful not to go too deep

function setHash(str) {
	if ("replaceState" in history) {
	    history.replaceState(undefined,undefined,'#' + str);
	} else {
	    location.hash = '#' + str;
	}
}

function removeHash() { 
    var scrollV, scrollH, loc = window.location;
    if ("replaceState" in history)
    	history.replaceState({}, document.title, ".");
    else {
        // Prevent scrolling by storing the page's current scroll offset
        scrollV = document.body.scrollTop;
        scrollH = document.body.scrollLeft;

        loc.hash = "";

        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scrollV;
        document.body.scrollLeft = scrollH;
    }
}

function switchToItem(id) {
	setHash(id);
	window.location.reload(true);
	return true;
}

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

function getItemInfo(item,items) {
	itemInfo = '<h2>' + item.Title + '</h2>' +
	  '<strong>ID:</strong> ' + item.ID + '<br>' + 
	  ((item.Description) ? '<strong>Description:</strong> ' + item.Description + '<br>'  : '') +
	  '<strong>Value:</strong> ' + item.Value + ' OC<br>' +
	  '<strong>Stackable:</strong> ' + ((item.Stackable > 1) ? 'x' + item.Stackable : 'no') + '<br>';
	item.arguments = []; // to remove
	item.Actions.forEach(function(action) {
		action.Name = action.Name.toLowerCase();
		var atLeastOneValidEffect = false;
		if (action.Name) {
			switch (action.Name) {
				case "eat":
				case "drink":
				case "smoke":
					itemInfo += '<br>'
					if (action.Name == 'eat') itemInfo += '<strong>Can be eaten. It will:</strong><br>';
					if (action.Name == 'drink') itemInfo += '<strong>Can be drunk. It will:</strong><br>';
					if (action.Name == 'smoke') itemInfo += '<strong>Can be smoked. It will:</strong><br>';
					if (action.Amount != 0) {
						switch (action.Type.toLowerCase()) {
							case "food":
								itemInfo += ' &bull; lower your hunger by ' + action.Amount + '%<br>';
								atLeastOneValidEffect = true;
								break;
							case "drink":
								itemInfo += ' &bull; lower your thirst by ' + action.Amount + '%<br>';
								atLeastOneValidEffect = true;
								break;
							case "smoke":
								itemInfo += ' &bull; lower your smoke need by ' + action.Amount + '%<br>';
								atLeastOneValidEffect = true;
								break;
						}
					}
					break;
				case "open":
					itemInfo += '<br><strong>Can be opened. It will:</strong><br>';
					// to do
					break;
				case "equip":
					itemInfo += '<br><strong>Can be equipped.</strong><br>';
					atLeastOneValidEffect = true
					// to do
					break;
				default:
					itemInfo += '<br><strong>Can be used. It will:</strong><br>'
			}
			function effectString(value,description) {
				if (value > 0) {
					atLeastOneValidEffect = true
					return ' &bull; increase your ' + description + ' by ' + value + '<br>';
				} else if (value < 0) {
					atLeastOneValidEffect = true
					return ' &bull; decrease your ' + description + ' by ' + (value*-1) + '<br>';
				}
			}
			if (action.Intoxication)       itemInfo += effectString(action.Intoxication,      'intoxication');
			if (action.SMV)                itemInfo += effectString(action.SMV,               'SMV infection state');
			if (action.SMVProgressionRate) itemInfo += effectString(action.SMVProgressionRate,'SMV progression rate');
			if (action.Depression)         itemInfo += effectString(action.Depression,        'depression');
			if (action.Health)             itemInfo += effectString(action.Health,            'health');
			if (action.Bleeding)           itemInfo += effectString(action.Bleeding,          'bleeding');
			if (action.High)               itemInfo += effectString(action.High,              'high');
			if (action.Tiredness)          itemInfo += effectString(action.Tiredness,         'tiredness');
			if (action.AlcoholAddiction)   itemInfo += effectString(action.AlcoholAddiction,  'alcohol addiction');
			if (action.MushroomAddiction)  itemInfo += effectString(action.MushroomAddiction, 'mushroom addiction');
			if (action.SmokingAddiction)   itemInfo += effectString(action.SmokingAddiction,  'smoking addiction');
		}
		if (!atLeastOneValidEffect) {
			itemInfo += ' &bull; do nothing<br>';
		}
	});
	var relatedItems = [];
	items.forEach(function(relatedItem) {
		switch (relatedItem.use) {
			case "eat":
			case "drink":
			case "smoke":
				var itemGivesItem = ((relatedItem.arguments[2] !== void 0 ) ? relatedItem.arguments[2] : 0);
				if (itemGivesItem == item.id) {
					relatedItems.push(relatedItem);
				}
				break;
			case "break":
			case "open":
				var itemOutput    = ((relatedItem.arguments[0] !== void 0 ) ? relatedItem.arguments[0] : 0);
				var itemContainer = ((relatedItem.arguments[2] !== void 0 ) ? relatedItem.arguments[2] : 0);
				if ((itemOutput == item.id) || (itemContainer == item.id)) {
					relatedItems.push(relatedItem);
				}
		}
	});
	if (relatedItems.length) {
		itemInfo += '<br><strong>Related items:</strong> ';
		relatedItems.sort(dynamicSort('title'));
		relatedItems.forEach(function(relatedItem) {
			itemInfo += '<a href="#' + relatedItem.id + '" onclick="switchToItem(' + relatedItem.id + ')">[' + relatedItem.title + ']</a>, ';
		});
		itemInfo = itemInfo.substring(0,itemInfo.length-2);
	}
	return itemInfo
}

if (document.referrer.indexOf("stalburg.arctar.us") > -1) {
	document.body.innerHTML += '<div class="backToWiki"><a href="' + document.referrer + '">back to Stalburg Wiki</a></div>';
}

$(document).ready(function() {
    $('#category').select2({
    	placeholder: 'Select category...',
    	width: 200
    });
    $('#title').select2({
    	placeholder: 'Select item...',
    	width: 200
    });

    $.getJSON("res/Items.json",function(data) {
    	var items = [];
    	var categories = [];
  		var uniqueCategories = new Map();
  		$.each(data,function(key,val) {
  			$.each(val.Categories,function(key,val) {
  				//if (val[0] === val[0].toUpperCase()) { // if category starts with a capital letter
  					uniqueCategories.set(val,'');
  				//}
  			});
  			val.Title = val.Title.trim();
  			items.push(val);
  		});
  		uniqueCategories.forEach(function(value,key) {
  			categories.push(key);
  		});
  		categories.sort();
  		categories.unshift("[ALL]");
  		categories.forEach(function(name) {
  			$('#category').append($('<option>', {
    			text: name
			}));
  		})
  		$("#loader").hide();
		$("#selector").show();
		$('#stats').html('loaded ' + items.length + ' items in ' + categories.length + ' categories');

		$('#title').on('select2:select',function (e) {
			if (e.params.data.id >= 0) {
				items.forEach(function(item) {
					if (e.params.data.id == item.ID) {
						$('#itemInfo').html(getItemInfo(item,items));
						if (!e.params.data.fromLink) setHash(item.ID);
					}
				});
			}
		});
		
		$('#category').on('select2:select',function (e) {
			if (e.params.data.text) {
				$('#title').val(null).empty().trigger('change');
				var categoryItems = [];
				items.forEach(function(item) {
					var itemFound = false;
					item.Categories.forEach(function(category) {
						if ((e.params.data.text == category) || (e.params.data.text == '[ALL]')) {
							itemFound = true;
						}
					});
					if (itemFound) categoryItems.push(item);
				});
				//console.log(categoryItems);
				categoryItems.sort(dynamicSort("Title"));
				categoryItems.forEach(function(item) {
					$('#title').append(new Option(item.Title,item.ID,false,false));
				});
				$('#title').val(null).trigger('change');
				if (e.params.data.fromLink === true) {
					items.forEach(function(item) {
						if (window.location.hash.substring(1) == item.ID) {
							$('#title').val(item.ID);
							$('#title').trigger('change');
							var fromLinkData = {
								"fromLink": true,
								"id": item.ID
							};
							$('#title').trigger({
								type: 'select2:select',
							    params: {
							        data: fromLinkData
							    }
							});
						}
					});
				}
				if (!e.params.data.fromLink) $('#itemInfo').html('Choose an item.');
			}
			if (!e.params.data.fromLink) removeHash();
		});

		var itemFound = false;
		if (window.location.hash.substring(1)) {
  			items.forEach(function(item) {
				if (window.location.hash.substring(1) == item.ID) {
					$('#category').val(item.Categories[0]);
					$('#category').trigger('change');
					var fromLinkData = {
						"fromLink": true,
						"text": item.Categories[0]
					};
					$('#category').trigger({
						type: 'select2:select',
					    params: {
					        data: fromLinkData
					    }
					});
					itemFound = true;
				}
			});
  		}
  		if (!itemFound) {
  			var fromLinkData = {
				"fromLink": false,
				"text": '[ALL]'
			};
			$('#category').trigger({
				type: 'select2:select',
			    params: {
			        data: fromLinkData
			    }
			});
  		}
	});
});