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
	itemInfo = '<h2>' + item.title + '</h2><strong>Description:</strong> ' + item.description + '<br><strong>Rarity:</strong> ' + item.rarity + '<br><strong>Value:</strong> ' + item.value + ' OC<br>'
	item.use = item.use.toLowerCase();
	atLeastOneValidEffect = false;
	switch (item.use) {
		case "eat":
		case "drink":
		case "smoke":
			itemInfo += '<br>'
			if (item.use == 'eat') itemInfo += '<strong>Can be eaten. It will:</strong><br>';
			if (item.use == 'drink') itemInfo += '<strong>Can be drinked. It will:</strong><br>';
			if (item.use == 'smoke') itemInfo += '<strong>Can be smoked. It will:</strong><br>';
			var itemHungerThirstSmokeChange = ((item.arguments[0] !== void 0 ) ? item.arguments[0] : 0);
			var itemAlcoholChange           = ((item.arguments[1] !== void 0 ) ? item.arguments[1] : 0);
			var itemGivesItem               = ((item.arguments[2] !== void 0 ) ? item.arguments[2] : 0);
			var itemSMVChange               = ((item.arguments[3] !== void 0 ) ? item.arguments[3] : 0);
			var itemHealthChange            = ((item.arguments[4] !== void 0 ) ? item.arguments[4] : 0);
			var itemDepressionChange        = ((item.arguments[5] !== void 0 ) ? item.arguments[5] : 0);
			if (itemHungerThirstSmokeChange != 0) {
				if (item.use == 'eat') {
					if (itemHungerThirstSmokeChange > 0) {
						itemInfo += ' &bull; lower your hunger by ' + itemHungerThirstSmokeChange + '%<br>';
					} else {
						itemInfo += ' &bull; increase your hunger by ' + (itemHungerThirstSmokeChange*-1) + '%<br>';
					}
				} else if (item.use == 'drink') {
					if (itemHungerThirstSmokeChange > 0) {
						itemInfo += ' &bull; lower your thirst by ' + itemHungerThirstSmokeChange + '%<br>';
					} else {
						itemInfo += ' &bull; increase your thirst by ' + (itemHungerThirstSmokeChange*-1) + '%<br>';
					}
				} else {
					if (itemHungerThirstSmokeChange > 0) {
						itemInfo += ' &bull; lower your smoke need by ' + itemHungerThirstSmokeChange + '%<br>';
					} else {
						itemInfo += ' &bull; increase your smoke need by ' + (itemHungerThirstSmokeChange*-1) + '%<br>';
					}
				}
				atLeastOneValidEffect = true;
			}
			if (itemAlcoholChange != 0) {
				if (itemAlcoholChange < 0) {
					itemInfo += ' &bull; lower your alcohol level by ' + (itemAlcoholChange*-1) + '%<br>';
				} else {
					itemInfo += ' &bull; increase your alcohol level by ' + itemAlcoholChange + '%<br>';
				}
				atLeastOneValidEffect = true;
			}
			if (itemGivesItem != -1) {
				items.forEach(function(givesItem) {
					if (itemGivesItem == givesItem.id) {
						itemInfo += ' &bull; give you <a href="#' + givesItem.id + '" onclick="switchToItem(' + givesItem.id + ')">[' + givesItem.title + ']</a><br>';
						atLeastOneValidEffect = true;
					}
				});
			}
			if (itemSMVChange != 0) {
				if (itemSMVChange < 0) {
					itemInfo += ' &bull; lower your SMV progression rate by ' + (itemSMVChange*-1) + '%<br>';
				} else {
					itemInfo += ' &bull; increase your SMV progression rate by ' + itemSMVChange + '%<br>';
				}
				atLeastOneValidEffect = true;
			}
			if (itemHealthChange != 0) {
				if (itemHealthChange < 0) {
					itemInfo += ' &bull; hurt you by ' + (itemHealthChange*-1) + '%<br>';
				} else {
					itemInfo += ' &bull; heal you by ' + itemHealthChange + '%<br>';
				}
				atLeastOneValidEffect = true;
			}
			if (itemDepressionChange != 0) {
				if (itemDepressionChange < 0) {
					itemInfo += ' &bull; lower your depression by ' + (itemDepressionChange*-1) + '%<br>';
				} else {
					itemInfo += ' &bull; increase your depression by ' + itemDepressionChange + '%<br>';
				}
				atLeastOneValidEffect = true;
			}
			break;
		case "break":
		case "open":
			itemInfo += '<br>'
			if (item.use == 'break') itemInfo += '<strong>Can be broken. It will:</strong><br>';
			if (item.use == 'opened') itemInfo += '<strong>Can be opened. It will:</strong><br>';
			var itemOutput    = ((item.arguments[0] !== void 0 ) ? item.arguments[0] : 0);
			var itemAmount    = ((item.arguments[1] !== void 0 ) ? item.arguments[1] : 0);
			var itemContainer = ((item.arguments[2] !== void 0 ) ? item.arguments[2] : 0);
			if (itemOutput != -1) {
				items.forEach(function(givesItem) {
					if (itemOutput == givesItem.id) {
						if (itemAmount == 1) {
							itemInfo += ' &bull; give you <a href="#' + givesItem.id + '" onclick="switchToItem(' + givesItem.id + ')">[' + givesItem.title + ']</a><br>';
							atLeastOneValidEffect = true;
						} else if (itemAmount > 1) {
							itemInfo += ' &bull; give you ' + itemAmount + 'x <a href="#' + givesItem.id + '" onclick="switchToItem(' + givesItem.id + ')">[' + givesItem.title + ']</a><br>';
							atLeastOneValidEffect = true;
						}
					}
				});
			}
			if (itemContainer != -1) {
				items.forEach(function(givesItem) {
					if (itemContainer == givesItem.id) {
						itemInfo += ' &bull; give you <a href="#' + givesItem.id + '" onclick="switchToItem(' + givesItem.id + ')">[' + givesItem.title + ']</a><br>';
						atLeastOneValidEffect = true;
					}
				});
			}
			break;
		default:
			itemInfo += '<strong>Usage:</strong> ' + item.use
			atLeastOneValidEffect = true;
	}
	if (!atLeastOneValidEffect) {
		itemInfo += ' &bull; do nothing<br>';
	}
	switch (item.id) { // harcoded because reasons! (ask Oskutin)
		case 20310:
			itemInfo += ' &bull; lower your tiredness by 15%<br>';
			break;
		case 20311:
			itemInfo += ' &bull; lower your tiredness by 20%<br>';
			break;
		case 20312:
			itemInfo += ' &bull; lower your tiredness by 25%<br>';
			break;
		case 20313:
			itemInfo += ' &bull; lower your tiredness by 15%<br>';
			break;
		case 20110:
			itemInfo += ' &bull; lower your tiredness by 30%<br>';
			break;
		case 140030:
			itemInfo += ' &bull; increase your tiredness by 65%<br>';
			break;
		case 150010:
			itemInfo += ' &bull; lower your SMV progression by 5%<br>';
			break;
	}
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
  			if (val.category[0] === val.category[0].toUpperCase()) { // if category starts with a capital letter
  				uniqueCategories.set(val.category,'');
  				val.use = val.use.toLowerCase();
  				val.arguments = val.arguments.split(' ');
  				items.push(val);
  			}
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
		$('#title').on('select2:select',function (e) {
			if (e.params.data.id >= 0) {
				items.forEach(function(item) {
					if (e.params.data.id == item.id) {
						$('#itemInfo').html(getItemInfo(item,items));
						if (!e.params.data.fromLink) setHash(item.id);
					}
				});
			}
		});
		$('#category').on('select2:select',function (e) {
			if (e.params.data.text) {
				$('#title').val(null).empty().trigger('change');
				var categoryItems = [];
				items.forEach(function(item) {
					if ((e.params.data.text == item.category) || (e.params.data.text == '[ALL]')) {
						categoryItems.push(item);
					}
				});
				console.log(categoryItems);
				categoryItems.sort(dynamicSort("title"));
				categoryItems.forEach(function(item) {
					$('#title').append(new Option(item.title,item.id,false,false));
				});
				$('#title').val(null).trigger('change');
				if (e.params.data.fromLink === true) {
					items.forEach(function(item) {
						if (window.location.hash.substring(1) == item.id) {
							$('#title').val(item.id);
							$('#title').trigger('change');
							var fromLinkData = {
								"fromLink": true,
								"id": item.id
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
				if (window.location.hash.substring(1) == item.id) {
					$('#category').val(item.category);
					$('#category').trigger('change');
					var fromLinkData = {
						"fromLink": true,
						"text": item.category
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